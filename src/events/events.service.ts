import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface Event {
  client_id: string;
  store_id: string;
  type: 'visit' | 'recharge';
  timestamp: string;
  amount?: number;
}

@Injectable()
export class EventsService {
  private readonly filePath = path.join(
    process.cwd(),
    'src',
    'assets',
    'ruklo_events_1000.json',
  );

  /**
   * Carga todos los eventos desde el archivo JSON.
   */
  loadAll(): Event[] {
    const raw = fs.readFileSync(this.filePath, 'utf8');
    return JSON.parse(raw) as Event[];
  }

  /**
   * Guarda cualquier objeto serializado en un JSON en la carpeta assets.
   * @param filename Nombre de archivo destino, e.g. 'benefits.json'
   * @param data     Datos a serializar
   */
  saveAs<T>(filename: string, data: T): void {
    const outPath = this.filePath.replace('ruklo_events_1000.json', filename); //para obtener la ruta base
    fs.writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf8');
  }
}
