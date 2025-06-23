import { WeekVisitDto } from './week-visit.dto';
import { WeekRechargeDto } from './week-recharge.dto';

export class HistoryResponseDto {
  clientId: string;
  visits: WeekVisitDto[];
  recharges: WeekRechargeDto[];
}
