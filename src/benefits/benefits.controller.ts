import { Controller, Post } from '@nestjs/common';
import { BenefitsService } from './benefits.service';

@Controller('benefits')
export class BenefitsController {
  constructor(private readonly svc: BenefitsService) {}

  //ya no se llama a la función processBenefits si no que al trigger para que se encargue de las colas
  @Post('process')
  enqueueProcess(): { message: string } {
    this.svc.triggerProcess();
    return { message: 'Benefit calculation enqueued (5s initial delay)' };
  }
}
