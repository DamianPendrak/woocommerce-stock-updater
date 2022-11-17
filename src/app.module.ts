import { CacheModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bull';
import { WoocommerceModule } from './woocommerce/woocommerce.module';
import { MalfiniModule } from './malfini/malfini.module';
import { ProductsListConsumer } from './consumers/ProductsListConsumer';
import { StockUpdateConsumer } from './consumers/StockUpdateConsumer';

@Module({
  imports: [
    ConfigModule.forRoot(),
    AuthModule,
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 5000,
      }),
    }),
    ScheduleModule.forRoot(),
    CacheModule.register({
      isGlobal: true,
      ttl: 1800,
    }),
    WoocommerceModule,
    MalfiniModule,
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
      },
    }),
    BullModule.registerQueue({
      name: 'stock-update',
    }),
    BullModule.registerQueue({
      name: 'list-products',
    }),
  ],
  controllers: [AppController],
  providers: [AppService, ProductsListConsumer, StockUpdateConsumer],
})
export class AppModule {}
