import { Module } from '@nestjs/common';
import { MalfiniController } from './malfini.controller';
import { MalfiniService } from './malfini.service';
import { AuthModule } from '../auth/auth.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule, AuthModule],
  controllers: [MalfiniController],
  providers: [MalfiniService],
  exports: [MalfiniService],
})
export class MalfiniModule {}
