export interface Event {
  client_id: string;
  store_id: string;
  type: 'visit' | 'recharge';
  timestamp: string; // ISO 8601
  amount?: number; // solo para recargas
}
