const path = require('path');
const fs = require('fs-extra');
const { spawn, execSync } = require('child_process');
const config = require('../../config/testConfig');

function resolveFfmpegBinary() {
  const customPath = process.env.FFMPEG_PATH;
  if (customPath) {
    if (fs.existsSync(customPath)) {
      return customPath;
    }
    console.warn(`FFmpeg binary not found at custom path ${customPath}. Falling back to automatic resolution.`);
  }

  const locator = process.platform === 'win32' ? 'where ffmpeg' : 'which ffmpeg';
  try {
    const located = execSync(locator, { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .split(/\r?\n/)
      .find(Boolean);
    if (located) {
      return located.trim();
    }
  } catch (error) {
    // ignore and fall through to null
  }

  try {
    execSync('ffmpeg -version', { stdio: 'ignore' });
    return 'ffmpeg';
  } catch (error) {
    // ignore and fall through to null
  }

  return null;
}

const ffmpegBinary = resolveFfmpegBinary();
const hasFfmpeg = Boolean(ffmpegBinary);

async function ensureDir(dirPath) {
  await fs.ensureDir(dirPath);
}

async function captureScreenshot(driver, caseId, status) {
  const dir = config.media.screenshotDir;
  await ensureDir(dir);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${caseId}_${status}_${timestamp}.png`;
  const filePath = path.join(dir, filename);
  const screenshot = await driver.takeScreenshot();
  await fs.writeFile(filePath, screenshot, 'base64');
  return filePath;
}

class VideoRecorder {
  constructor(caseId) {
    this.caseId = caseId;
    this.process = null;
    this.outputPath = null;
    this.enabled = hasFfmpeg;
  }

  async start() {
    if (!this.enabled) {
      throw new Error('FFmpeg binary could not be resolved. Install FFmpeg and ensure it is on PATH (check with "where ffmpeg" en Windows o "which ffmpeg" en Linux/macOS) o define la variable FFMPEG_PATH. Consulta README.md para más detalles.');
    }
    const dir = config.media.videoDir;
    await ensureDir(dir);
    this.outputPath = path.join(dir, `${this.caseId}.mp4`);

    const args = [
      '-y',
      '-video_size', config.media.resolution,
      '-f', 'x11grab',
      '-r', config.media.frameRate,
      '-i', `${config.media.display}.0`,
      '-codec:v', 'libx264',
      '-preset', 'ultrafast',
      '-pix_fmt', 'yuv420p',
      this.outputPath
    ];

    this.process = spawn(ffmpegBinary, args, { stdio: 'ignore' });

    this.process.on('error', (err) => {
      console.error(`FFmpeg error for ${this.caseId}:`, err.message);
    });
  }

  async stop() {
    if (this.process) {
      await new Promise((resolve) => {
        this.process.once('exit', resolve);
        this.process.kill('SIGINT');
      });
    }
    return this.outputPath;
  }
}

module.exports = {
  captureScreenshot,
  VideoRecorder
};
