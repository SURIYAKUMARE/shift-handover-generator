export type SectionType = 'Blockers' | 'In Progress' | 'Completed' | 'Watch-list';

export interface Event {
  source: string;
  record_id: string;
  timestamp: string;
  summary: string;
  status: string;
  severity?: 'critical' | 'high' | 'medium' | 'low' | 'info';
  author?: string;
  channel?: string;
  metadata?: Record<string, any>;
}

export interface GeneratedNoteItem {
  section: SectionType;
  item: string;
  source: string;
  timestamp: string;
  raw_events?: Event[];
  progression?: string[];
  final_status?: string;
  carried_forward?: boolean;
  shifts_open?: number;
  source_unavailable?: boolean;
}

export interface CarriedForwardRecord {
  source: string;
  record_id: string;
  section: SectionType;
  item: string;
  timestamp: string;
  shifts_open: number;
  raw_events: Event[];
  shift_end: string;
  source_unavailable?: boolean;
}

export interface ShiftWindow {
  start: string;
  end: string;
  timezone: string;
}

export interface GenerationStageLog {
  id: string;
  stage: string;
  status: 'pending' | 'running' | 'completed' | 'warning' | 'error';
  message: string;
  timestamp: string;
  details?: Record<string, any>;
}

export interface SourceHealth {
  id: string;
  name: string;
  type: string;
  status: 'connected' | 'unreachable' | 'degraded';
  event_count: number;
  latency_ms: number;
  error?: string;
}

export interface GenerationResult {
  shift_window: ShiftWindow;
  items: GeneratedNoteItem[];
  reproducibility_hash: string;
  stats: {
    total_raw_events: number;
    events_in_window: number;
    deduplicated_items: number;
    carried_forward_items?: number;
    stale_items?: number;
    sections_count: Record<SectionType, number>;
    quiet_sections: SectionType[];
    is_quiet_shift: boolean;
  };
  sources_status: Record<string, SourceHealth>;
  warnings: string[];
  flagged_events: Array<{ event: any; reason: string }>;
  stage_logs: GenerationStageLog[];
  generated_at: string;
}

export interface PresetScenario {
  id: string;
  name: string;
  description: string;
  defaultWindow: ShiftWindow;
  simulatedUnreachable?: string;
}
