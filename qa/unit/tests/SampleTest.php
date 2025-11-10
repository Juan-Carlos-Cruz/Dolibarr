<?php

declare(strict_types=1);

use PHPUnit\Framework\TestCase;

final class SampleTest extends TestCase
{
    public function testPhpIsOperational(): void
    {
        $this->assertTrue(extension_loaded('pdo_mysql'));
    }
}
