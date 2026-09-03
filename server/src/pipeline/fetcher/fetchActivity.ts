import { Event, ShiftWindow, GenerationStageLog, SourceHealth } from '../../types/index.js';
import { SourceAdapter } from './baseAdapter.js';

export interface FetchResult {
  inWindowEvents: Event[];
  totalRawEvents: number;
  sourcesHealth: Record<string, SourceHealth>;
  warnings: string[];
  flaggedEvents: Array<{ event: any; reason: string }>;
  stageLogs: GenerationStageLog[];
}

export function parseAndNormalizeTimestamp(rawTimestamp: string): { isoUtc: string; date: Date } | null {
  if (!rawTimestamp || typeof rawTimestamp !== 'string') {
    return null;
  }
  const parsed = new Date(rawTimestamp);
  if (isNaN(parsed.getTime())) {
    return null;
  }
  return {
    isoUtc: parsed.toISOString(),
    date: parsed,
  };
}

export async function fetchActivity(
  adapters: SourceAdapter[],
  shiftWindow: ShiftWindow
): Promise<FetchResult> {
  const stageLogs: GenerationStageLog[] = [];
  const warnings: string[] = [];
  const flaggedEvents: Array<{ event: any; reason: string }> = [];
  const sourcesHealth: Record<string, SourceHealth> = {};
  const inWindowEvents: Event[] = [];
  let totalRawEvents = 0;

  // Window boundaries parsed to UTC
  const windowStart = new Date(shiftWindow.start);
  const windowEnd = new Date(shiftWindow.end);

  if (isNaN(windowStart.getTime()) || isNaN(windowEnd.getTime())) {
    throw new Error(`Invalid shift window datetime boundaries: start="${shiftWindow.start}", end="${shiftWindow.end}"`);
  }

  const shiftStartMs = windowStart.getTime();
  const shiftEndMs = windowEnd.getTime();

  for (const adapter of adapters) {
    const stageId = `fetch-${adapter.id}`;
    stageLogs.push({
      id: stageId,
      stage: `Fetch ${adapter.name}`,
      status: 'running',
      message: `Connecting to ${adapter.name}…`,
      timestamp: new Date().toISOString(),
    });

    try {
      const health = await adapter.checkHealth();
      sourcesHealth[adapter.id] = health;

      if (health.status === 'unreachable') {
        const warnMsg = `Source ${adapter.name} is unreachable: ${health.error || 'Connection failed'}. Skipped gracefully.`;
        warnings.push(warnMsg);
        stageLogs.push({
          id: `${stageId}-warn`,
          stage: `Fetch ${adapter.name}`,
          status: 'warning',
          message: warnMsg,
          timestamp: new Date().toISOString(),
          details: { error: health.error },
        });
        continue;
      }

      const rawEvents = await adapter.fetchEvents();
      totalRawEvents += rawEvents.length;

      let sourceInWindow = 0;

      for (const rawEvt of rawEvents) {
        // Validate and normalize timestamp
        const normalized = parseAndNormalizeTimestamp(rawEvt.timestamp);
        if (!normalized) {
          const reason = `Malformed timestamp format: "${rawEvt.timestamp}" in ${rawEvt.source}:${rawEvt.record_id}`;
          flaggedEvents.push({
            event: rawEvt,
            reason,
          });
          continue;
        }

        const eventTimeMs = normalized.date.getTime();

        // Strict [shift_start, shift_end) interval:
        // inclusive of start, strictly exclusive of end
        if (eventTimeMs >= shiftStartMs && eventTimeMs < shiftEndMs) {
          // Normalize event timestamp to UTC ISO-8601 string internally
          inWindowEvents.push({
            ...rawEvt,
            timestamp: normalized.isoUtc,
          });
          sourceInWindow++;
        }
      }

      stageLogs.push({
        id: `${stageId}-done`,
        stage: `Fetch ${adapter.name}`,
        status: 'completed',
        message: `Retrieved ${rawEvents.length} events (${sourceInWindow} inside shift window)`,
        timestamp: new Date().toISOString(),
        details: { totalFound: rawEvents.length, inWindow: sourceInWindow },
      });
    } catch (err: any) {
      const errorMsg = `Adapter for ${adapter.name} encountered an error: ${err.message || err}`;
      warnings.push(errorMsg);
      sourcesHealth[adapter.id] = {
        id: adapter.id,
        name: adapter.name,
        type: adapter.type,
        status: 'unreachable',
        event_count: 0,
        latency_ms: 0,
        error: err.message || 'Fatal adapter error',
      };
      stageLogs.push({
        id: `${stageId}-err`,
        stage: `Fetch ${adapter.name}`,
        status: 'warning',
        message: `${adapter.name} skipped: ${err.message}`,
        timestamp: new Date().toISOString(),
      });
    }
  }

  return {
    inWindowEvents,
    totalRawEvents,
    sourcesHealth,
    warnings,
    flaggedEvents,
    stageLogs,
  };
}
