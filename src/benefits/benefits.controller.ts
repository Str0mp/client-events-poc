// src/benefits/benefits.controller.ts
import { Controller, Get } from '@nestjs/common';
import { BenefitsService } from './benefits.service';
import { BenefitDto } from './dto/benefit.dto';

@Controller('benefits')
export class BenefitsController {
  constructor(private readonly svc: BenefitsService) {}

  @Get('process')
  processAndGet(): BenefitDto[] {
    return this.svc.processBenefits();
  }
}
