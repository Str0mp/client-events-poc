import { Injectable, Logger } from '@nestjs/common';
import PQueue from 'p-queue';
import { BenefitDto } from './dto/benefit.dto';
import { EventsService, Event } from '../events/events.service';

@Injectable()
export class BenefitsService {
  private readonly logger = new Logger(BenefitsService.name);
  //COLA EN MEMORIA QUE PROCESA 1 A LA VEZ
  private readonly queue = new PQueue({ concurrency: 1 });

  constructor(private readonly eventsService: EventsService) {}

  //ENCOLAR LA FUNCION PROCESSBENEFITS PARA Q NO SE BLOQUEE LA API
  triggerProcess(): void {
    //ACA SE EJECUTA EN BACKGROUND
    this.queue
      .add(() => this.processBenefits())
      .catch((err: Error) => this.logger.error(`Job failed: ${err.message}`));
  }

  private async processBenefits(): Promise<BenefitDto[]> {
    const startTime = Date.now(); //para calcular duración

    await new Promise<void>((resolve) => setTimeout(resolve, 5000)); //simular5 segundos de proceso ya que no son muchos objetos en el .json

    const events = this.eventsService.loadAll(); // lee todos los eventos desde el service

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

    this.eventsService.saveAs('benefits.json', benefits);

    const duration = Date.now() - startTime; // calcular duración del proceso
    this.logger.log(
      `Saved ${benefits.length} benefits to benefits.json in ${duration}ms`,
    );

    return benefits;
  }
}
