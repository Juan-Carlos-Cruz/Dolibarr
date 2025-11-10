<?php

require_once __DIR__ . '/DolibarrTestCase.php';

final class ProductPriceTest extends DolibarrTestCase
{
    /**
     * @dataProvider priceProvider
     */
    public function testComputeSalePriceRespectsMinimum(float $base, float $discount, float $min, float $expected): void
    {
        $this->requireClass('PriceCalculator');

        $calculator = new PriceCalculator(vatRate: 0.19, minPrice: $min);
        $price = $calculator->computeSalePrice(base: $base, discount: $discount, vatIncluded: true);
        $this->assertGreaterThanOrEqual($expected, $price);
    }

    public function priceProvider(): array
    {
        return [
            'precio por debajo del mínimo' => [9000, 0.05, 10000, 10000],
            'precio igual al mínimo' => [10000, 0, 10000, 10000],
            'precio por encima del mínimo' => [15000, 0.1, 12000, 12000]
        ];
    }
}
