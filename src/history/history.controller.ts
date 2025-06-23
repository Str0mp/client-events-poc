import { Controller, Get, Param } from '@nestjs/common';
import { HistoryService } from './history.service';
import { HistoryResponseDto } from './dto/history-response.dto';

@Controller('history')
export class HistoryController {
  constructor(private readonly historySvc: HistoryService) {}

  @Get(':clientId')
  getClientHistory(@Param('clientId') clientId: string): HistoryResponseDto {
    return this.historySvc.getClientWeeklyHistory(clientId);
  }
}
