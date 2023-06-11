import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Cron } from '@nestjs/schedule';
import fetch from 'node-fetch';

@Injectable()
export class AppService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectQueue('stock-update') private stockUpdateQueue: Queue,
    @InjectQueue('list-products') private listProductsQueue: Queue,
  ) {}

  @Cron('0 3 * * 0,4')
  async createJobsForProducts() {
    await fetch(
      `https://betteruptime.com/api/v1/heartbeat/${process.env.HEARTBEAT_URL_KEY}`,
    );
    console.log(`Started`);

    return await this.listProductsQueue.add({
      page: 1,
    });
  }
}
