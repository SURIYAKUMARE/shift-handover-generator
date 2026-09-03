export type SectionType = 'Blockers' | 'In Progress' | 'Completed' | 'Watch-list';

export interface Event {
  source: string; // e.g. 'ticketing' | 'incident' | 'chat'
  record_id: string; // e.g. 'OPS-4821'
  timestamp: string; // ISO 8601 with offset
  summary: string;
  status: string; // e.g. 'open', 'escalated', 'investigating', 'resolved', 'monitoring'
  severity?: 'critical' | 'high' | 'medium' | 'low' | 'info';
  author?: string;
  channel?: string;
  metadata?: Record<string, any>;
}

export interface GeneratedNoteItem {
  section: SectionType;
  item: string; // e.g. 'OPS-4821 — login failures on mobile app, root cause not yet found; needs backend on-call'
  source: string; // e.g. 'ticketing:OPS-4821'
  timestamp: string;
  raw_events?: Event[];
  progression?: string[];
  final_status?: string;
}

export interface ShiftWindow {
  start: string; // ISO datetime
  end: string;   // ISO datetime
  timezone: string; // e.g. 'UTC', 'Asia/Kolkata', 'America/New_York'
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
    sections_count: Record<SectionType, number>;
    quiet_sections: SectionType[];
    is_quiet_shift: boolean;
  };
  stage_logs: GenerationStageLog[];
  warnings: string[];
  flagged_events: Array<{ event: any; reason: string }>;
  sources_status: Record<string, SourceHealth>;
  generated_at: string;
}
