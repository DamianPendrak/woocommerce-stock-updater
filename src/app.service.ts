import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class AppService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectQueue('stock-update') private stockUpdateQueue: Queue,
    @InjectQueue('list-products') private listProductsQueue: Queue,
  ) {}

  async createJobsForProducts() {
    return await this.listProductsQueue.add({
      page: 1,
    });
  }
}
