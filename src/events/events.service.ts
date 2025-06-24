import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import chokidar from 'chokidar';

export interface Event {
  client_id: string;
  store_id: string;
  type: 'visit' | 'recharge';
  timestamp: string;
  amount?: number;
}

@Injectable()
export class EventsService implements OnModuleInit {
  private readonly logger = new Logger(EventsService.name);
  private readonly filePath = path.join(
    process.cwd(),
    'src',
    'assets',
    'ruklo_events_1000.json',
  );

  private eventsCache: Event[] | null = null;

  onModuleInit() {
    const watcher = chokidar.watch(this.filePath, {
      ignoreInitial: true, // no ejecutar al iniciar
    });
    // va a escuchar cambios en el archivo JSON
    watcher.on('change', (changedPath) => {
      this.logger.log(`Detected change in ${changedPath}, invalidating cache`);
      this.refresh(); // si hay un cambio en el json, se invalida el cache
    });
  }

  //carga todos los eventos desde el archivo JSON una vez y los guarda en cache.
  loadAll(): Event[] {
    if (this.eventsCache === null) {
      const raw = fs.readFileSync(this.filePath, 'utf8');
      this.eventsCache = JSON.parse(raw) as Event[];
      this.logger.log(`Loaded ${this.eventsCache.length} events into cache`);
    }
    return this.eventsCache;
  }

  // fuerza que se lea nuevamente el archivo JSON
  refresh(): void {
    this.eventsCache = null;
  }

  // para guardar, lo mismo de antes
  saveAs<T>(filename: string, data: T): void {
    const outPath = this.filePath.replace('ruklo_events_1000.json', filename);
    fs.writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf8');
  }
}
