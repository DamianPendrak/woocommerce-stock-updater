import {
  CacheInterceptor,
  Controller,
  Get,
  UseInterceptors,
} from '@nestjs/common';
import { MalfiniService } from './malfini.service';

@Controller('malfini')
@UseInterceptors(CacheInterceptor)
export class MalfiniController {
  constructor(private malfiniService: MalfiniService) {}

  @Get('products/availabilities')
  async getProductAvailabilities() {
    return this.malfiniService.getProductAvailabilities();
  }

  @Get('products/prices')
  async getProductPrices() {
    return this.malfiniService.getProductPrices();
  }
}
