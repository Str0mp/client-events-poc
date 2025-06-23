import { Injectable, NotFoundException } from '@nestjs/common';
import { HistoryResponseDto } from './dto/history-response.dto';
import { WeekVisitDto } from './dto/week-visit.dto';
import { WeekRechargeDto } from './dto/week-recharge.dto';
import { EventsService } from '../events/events.service';
import {
  parseISO,
  startOfWeek,
  endOfWeek,
  addWeeks,
  isBefore,
  formatISO,
} from 'date-fns';

@Injectable()
export class HistoryService {
  constructor(private readonly eventsSvc: EventsService) {}

  getClientWeeklyHistory(clientId: string): HistoryResponseDto {
    const all = this.eventsSvc.loadAll();
    const events = all
      .filter((e) => e.client_id === clientId)
      .sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      );

    if (!events.length) {
      throw new NotFoundException(`No events for client ${clientId}`);
    }

    const firstDate = parseISO(events[0].timestamp);
    const lastDate = parseISO(events[events.length - 1].timestamp);
    let weekCursor = startOfWeek(firstDate, { weekStartsOn: 1 }); //encontrar el lunes de la semana de la primera visita
    const lastWeekStart = startOfWeek(lastDate, { weekStartsOn: 1 }); // encontrar el lunes de la semana de la ultima visita

    const visits: WeekVisitDto[] = [];
    const recharges: WeekRechargeDto[] = [];

    while (isBefore(weekCursor, addWeeks(lastWeekStart, 1))) {
      const start = weekCursor;
      const end = endOfWeek(start, { weekStartsOn: 1 });

      const weekEvents = events.filter((e) => {
        const d = parseISO(e.timestamp);
        return d >= start && d <= end;
      });

      visits.push({
        weekStart: formatISO(start, { representation: 'date' }),
        weekEnd: formatISO(end, { representation: 'date' }),
        count: weekEvents.filter((e) => e.type === 'visit').length,
      });

      const recs = weekEvents.filter((e) => e.type === 'recharge');
      const avg = recs.length
        ? recs.reduce((sum, r) => sum + (r.amount ?? 0), 0) / recs.length
        : 0;

      recharges.push({
        weekStart: formatISO(start, { representation: 'date' }),
        weekEnd: formatISO(end, { representation: 'date' }),
        averageAmount: avg,
      });

      weekCursor = addWeeks(weekCursor, 1);
    }

    return { clientId, visits, recharges };
  }
}
