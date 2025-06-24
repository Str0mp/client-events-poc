import { Module } from '@nestjs/common';
import PQueue from 'p-queue';

@Module({
  providers: [
    {
      provide: 'BENEFITS_QUEUE',
      useFactory: () => new PQueue({ concurrency: 1 }),
    },
  ],
  exports: ['BENEFITS_QUEUE'],
})
export class QueueModule {}
