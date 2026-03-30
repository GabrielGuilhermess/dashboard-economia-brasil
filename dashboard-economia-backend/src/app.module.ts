import { Module } from '@nestjs/common';

import { EconomiaModule } from './economia/economia.module';

@Module({
  imports: [EconomiaModule],
})
export class AppModule {}
