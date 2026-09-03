import { Event, SourceHealth } from '../../types/index.js';

export interface AdapterConfig {
  apiKeyEnvVar?: string;
  timeoutMs?: number;
  simulateUnreachable?: boolean;
  simulateLatencyMs?: number;
}

export interface SourceAdapter {
  id: string;
  name: string;
  type: 'ticketing' | 'incident' | 'chat';
  fetchEvents(): Promise<Event[]>;
  checkHealth(): Promise<SourceHealth>;
  setSimulateUnreachable(unreachable: boolean): void;
}
