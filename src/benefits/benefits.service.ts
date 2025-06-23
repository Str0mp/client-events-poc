import { Injectable, Logger } from '@nestjs/common';
import { BenefitDto } from './dto/benefit.dto';
import { EventsService, Event } from '../events/events.service';

@Injectable()
export class BenefitsService {
  private readonly logger = new Logger(BenefitsService.name);

  constructor(private readonly eventsService: EventsService) {}

  processBenefits(): BenefitDto[] {
    const events = this.eventsService.loadAll(); //devuelve un Event[]

    // Agrupar eventos por cliente::tienda
    const map = new Map<string, Event[]>();
    for (const e of events) {
      const key = `${e.client_id}::${e.store_id}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    }

    const benefits: BenefitDto[] = [];
    for (const [key, evts] of map.entries()) {
      evts.sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      );
      let streak = 0;
      for (const e of evts) {
        if (e.type === 'visit') {
          if (++streak === 5) {
            const [clientId, storeId] = key.split('::');
            benefits.push({
              clientId,
              storeId,
              visits: 5,
              rewardedAt: e.timestamp,
            });
            streak = 0;
          }
        } else {
          streak = 0;
        }
      }
    }

    // Guardar beneficios usando EventsService
    this.eventsService.saveAs('benefits.json', benefits);
    this.logger.log(`Saved ${benefits.length} benefits to benefits.json`);

    return benefits;
  }
}
