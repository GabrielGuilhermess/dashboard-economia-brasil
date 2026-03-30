import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { API_SOURCES } from '@/config/api-sources.config';

import { EconomiaController } from './economia.controller';
import { EconomiaService } from './economia.service';
import { BcbService } from './services/bcb.service';
import { IbgeService } from './services/ibge.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: API_SOURCES.bcbSgs.timeout,
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: API_SOURCES.cache.ttlDefault * 1000,
    }),
  ],
  controllers: [EconomiaController],
  providers: [EconomiaService, BcbService, IbgeService],
})
export class EconomiaModule {}
