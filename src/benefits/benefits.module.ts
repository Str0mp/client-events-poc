import { Module } from '@nestjs/common';
import { BenefitsService } from './benefits.service';
import { BenefitsController } from './benefits.controller';
import { EventsModule } from 'src/events/events.module';

@Module({
  imports: [EventsModule],
  providers: [BenefitsService],
  controllers: [BenefitsController],
})
export class BenefitsModule {}
