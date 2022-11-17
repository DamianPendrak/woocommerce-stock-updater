import { Module } from '@nestjs/common';
import { WoocommerceService } from './woocommerce.service';
import { WoocommerceController } from './woocommerce.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [WoocommerceController],
  providers: [WoocommerceService],
  exports: [WoocommerceService],
})
export class WoocommerceModule {}
