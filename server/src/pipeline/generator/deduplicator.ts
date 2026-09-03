import { Event, GeneratedNoteItem } from '../../types/index.js';
import { assignSection } from './sectionRules.js';

export interface DeduplicationResult {
  items: GeneratedNoteItem[];
  dedupStats: {
    rawEventCount: number;
    collapsedItemCount: number;
    reductionPercentage: number;
  };
}

/**
 * Deduplication & Progression Collapse Engine
 * 
 * Rules:
 * 1. Groups events strictly by `(source, record_id)`.
 * 2. Sorts each group chronologically by timestamp ascending.
 * 3. Identifies progression if status changed over time (e.g. open -> escalated -> in_progress).
 * 4. Synthesizes a grounded summary item line citing record_id, latest summary, and meaningful progression.
 * 5. Uses latest timestamp in window.
 * 6. Attaches all raw events to preserve 100% auditability for 2-click drill-down.
 */
export function deduplicateAndCollapse(events: Event[]): DeduplicationResult {
  const groups = new Map<string, Event[]>();

  for (const event of events) {
    const key = `${event.source}:${event.record_id}`;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(event);
  }

  const items: GeneratedNoteItem[] = [];

  for (const [key, groupEvents] of groups.entries()) {
    // Sort events chronologically
    groupEvents.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    // Extract unique status progression in order
    const progression: string[] = [];
    for (const evt of groupEvents) {
      const st = (evt.status || '').trim().toLowerCase();
      if (st && progression[progression.length - 1] !== st) {
        progression.push(st);
      }
    }

    const latestEvent = groupEvents[groupEvents.length - 1];
    const section = assignSection(groupEvents);

    // Build grounded item string
    let itemDescription: string;
    
    // Clean summary (remove redundant record prefix if present)
    let cleanSummary = latestEvent.summary.trim();
    if (cleanSummary.startsWith(latestEvent.record_id)) {
      cleanSummary = cleanSummary.substring(latestEvent.record_id.length).replace(/^[\s—\-:]+/, '');
    }

    if (progression.length > 1) {
      // If status progressed meaningfully, note progression
      const progressionStr = progression.join(' → ');
      itemDescription = `${latestEvent.record_id} — ${cleanSummary} [Progression: ${progressionStr}]`;
    } else {
      itemDescription = `${latestEvent.record_id} — ${cleanSummary}`;
    }

    items.push({
      section,
      item: itemDescription,
      source: key,
      timestamp: latestEvent.timestamp,
      raw_events: groupEvents,
      progression: progression.length > 1 ? progression : undefined,
      final_status: latestEvent.status,
    });
  }

  const reduction =
    events.length > 0
      ? Math.round(((events.length - items.length) / events.length) * 100)
      : 0;

  return {
    items,
    dedupStats: {
      rawEventCount: events.length,
      collapsedItemCount: items.length,
      reductionPercentage: reduction,
    },
  };
}
