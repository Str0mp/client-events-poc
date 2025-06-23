import { Module } from '@nestjs/common';
import { BenefitsModule } from './benefits/benefits.module';
import { HistoryModule } from './history/history.module';

@Module({
  imports: [BenefitsModule, HistoryModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
