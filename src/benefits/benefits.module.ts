import { Module } from '@nestjs/common';
import { BenefitsService } from './benefits.service';
import { BenefitsController } from './benefits.controller';
import { EventsModule } from 'src/events/events.module';
import { QueueModule } from 'src/queue/queue.module';

@Module({
  imports: [EventsModule, QueueModule],
  providers: [BenefitsService],
  controllers: [BenefitsController],
})
export class BenefitsModule {}
