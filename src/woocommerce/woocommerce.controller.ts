import { Body, Controller, Get, Param, Put, Query } from '@nestjs/common';
import { WoocommerceService } from './woocommerce.service';

@Controller('woocommerce')
export class WoocommerceController {
  constructor(private woocommerceService: WoocommerceService) {}

  @Get('products')
  async getProducts(@Query() query: { perPage: string; page: string }) {
    return this.woocommerceService.getProducts(
      parseInt(query.perPage || '10'),
      parseInt(query.page || '1'),
    );
  }

  @Put('products/:product_id/update-variations')
  async updateVariations(
    @Param() params: { product_id: string },
    @Body() body,
  ) {
    return this.woocommerceService.updateVariations(params.product_id, body);
  }
}
