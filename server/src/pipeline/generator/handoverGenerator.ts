import crypto from 'crypto';
import {
  Event,
  GeneratedNoteItem,
  ShiftWindow,
  GenerationResult,
  SectionType,
  GenerationStageLog,
  SourceHealth,
  CarriedForwardRecord,
} from '../../types/index.js';
import { deduplicateAndCollapse } from './deduplicator.js';
import {
  getCarriedOverItems,
  persistShiftUnresolved,
} from '../carryForward/carryForwardStore.js';

const SECTION_PRIORITY: Record<SectionType, number> = {
  'Blockers': 1,
  'In Progress': 2,
  'Completed': 3,
  'Watch-list': 4,
};

const ALL_SECTIONS: SectionType[] = ['Blockers', 'In Progress', 'Completed', 'Watch-list'];
const STALE_THRESHOLD = 3; // Escalation threshold for untouched items

export function generateHandoverNote(
  inWindowEvents: Event[],
  shiftWindow: ShiftWindow,
  totalRawEvents: number,
  sourcesHealth: Record<string, SourceHealth>,
  warnings: string[],
  flaggedEvents: Array<{ event: any; reason: string }>,
  existingLogs: GenerationStageLog[],
  customCarriedOver?: CarriedForwardRecord[]
): GenerationResult {
  const stageLogs = [...existingLogs];

  // Stage: Deduplication & Collapse
  const dedupStageId = 'dedup-collapse';
  stageLogs.push({
    id: dedupStageId,
    stage: 'Deduplication & Collapse',
    status: 'running',
    message: `Deduplicating ${inWindowEvents.length} in-window events across sources…`,
    timestamp: new Date().toISOString(),
  });

  const { items, dedupStats } = deduplicateAndCollapse(inWindowEvents);

  stageLogs.push({
    id: `${dedupStageId}-done`,
    stage: 'Deduplication & Collapse',
    status: 'completed',
    message: `Collapsed ${dedupStats.rawEventCount} events → ${dedupStats.collapsedItemCount} unique note items (${dedupStats.reductionPercentage}% reduction)`,
    timestamp: new Date().toISOString(),
    details: dedupStats,
  });

  // Stage: Carry-Forward Unresolved Items Integration
  const carryStageId = 'carry-forward-merge';
  stageLogs.push({
    id: carryStageId,
    stage: 'Carry-Forward Evaluation',
    status: 'running',
    message: 'Loading unresolved blockers and in-progress items from prior shifts…',
    timestamp: new Date().toISOString(),
  });

  // Load prior unresolved records
  const carriedOverSet = customCarriedOver !== undefined
    ? customCarriedOver
    : getCarriedOverItems(shiftWindow.start);

  let carriedCount = 0;
  let staleCount = 0;

  // Track sources present in this window
  const inWindowSourceMap = new Map<string, GeneratedNoteItem>();
  for (const item of items) {
    inWindowSourceMap.set(item.source, item);
  }

  for (const record of carriedOverSet) {
    const existingInWindow = inWindowSourceMap.get(record.source);

    if (existingInWindow) {
      // Fresh in-window event exists: fresh event wins!
      // Reset shifts_open to 1 because it received active in-window attention
      existingInWindow.shifts_open = 1;
      existingInWindow.carried_forward = false;
    } else {
      // Untouched in this window: carry forward explicitly with original timestamp
      const nextShiftsOpen = (record.shifts_open || 1) + 1;
      if (nextShiftsOpen >= STALE_THRESHOLD) {
        staleCount++;
      }
      carriedCount++;

      const carriedItem: GeneratedNoteItem = {
        section: record.section,
        item: record.item,
        source: record.source,
        timestamp: record.timestamp, // PRESERVE ORIGINAL TIMESTAMP (never fabricate)
        raw_events: record.raw_events,
        progression: [`carried_over:${record.shifts_open}_shifts`],
        final_status: record.section === 'Blockers' ? 'blocked' : 'in_progress',
        carried_forward: true,
        shifts_open: nextShiftsOpen,
        source_unavailable: record.source_unavailable,
      };

      items.push(carriedItem);
    }
  }

  stageLogs.push({
    id: `${carryStageId}-done`,
    stage: 'Carry-Forward Evaluation',
    status: 'completed',
    message: `Evaluated carry-forward set: ${carriedCount} unresolved item(s) carried forward untouched (${staleCount} stale/escalated >= ${STALE_THRESHOLD} shifts)`,
    timestamp: new Date().toISOString(),
    details: { carriedCount, staleCount },
  });

  // Stage: Section Assignment & Deterministic Sorting
  const sortStageId = 'section-sort';
  stageLogs.push({
    id: sortStageId,
    stage: 'Section Assignment & Verification',
    status: 'running',
    message: 'Assigning items via deterministic grounding rules and sorting…',
    timestamp: new Date().toISOString(),
  });

  // Sort items deterministically for byte-for-byte reproducibility
  items.sort((a, b) => {
    // 1. By section priority
    const priorityDiff = SECTION_PRIORITY[a.section] - SECTION_PRIORITY[b.section];
    if (priorityDiff !== 0) return priorityDiff;

    // 2. By timestamp descending (most recent first)
    const timeA = new Date(a.timestamp).getTime();
    const timeB = new Date(b.timestamp).getTime();
    if (timeB !== timeA) return timeB - timeA;

    // 3. By source key alphabetically
    return a.source.localeCompare(b.source);
  });

  // Compute stats
  const sectionsCount: Record<SectionType, number> = {
    'Blockers': 0,
    'In Progress': 0,
    'Completed': 0,
    'Watch-list': 0,
  };

  for (const item of items) {
    sectionsCount[item.section]++;
  }

  const quietSections = ALL_SECTIONS.filter((sec) => sectionsCount[sec] === 0);
  const isQuietShift = items.length === 0;

  // Compute Reproducibility SHA-256 Hash
  // Canonical representation: includes section, source, item, timestamp, carried_forward, shifts_open
  const canonicalRepresentation = items.map((i) => ({
    section: i.section,
    source: i.source,
    item: i.item,
    timestamp: i.timestamp,
    final_status: i.final_status,
    carried_forward: !!i.carried_forward,
    shifts_open: i.shifts_open || 1,
  }));

  const canonicalPayload = JSON.stringify(canonicalRepresentation);
  const reproducibilityHash = crypto
    .createHash('sha256')
    .update(canonicalPayload, 'utf8')
    .digest('hex');

  // Persist unresolved items for subsequent shift (Shift N+1)
  persistShiftUnresolved(shiftWindow, items);

  stageLogs.push({
    id: 'hashing-done',
    stage: 'Reproducibility Signing',
    status: 'completed',
    message: `Generated canonical SHA-256 fingerprint: ${reproducibilityHash.substring(0, 16)}…`,
    timestamp: new Date().toISOString(),
    details: { reproducibility_hash: reproducibilityHash },
  });

  return {
    shift_window: shiftWindow,
    items,
    reproducibility_hash: reproducibilityHash,
    stats: {
      total_raw_events: totalRawEvents,
      events_in_window: inWindowEvents.length,
      deduplicated_items: items.length,
      carried_forward_items: carriedCount,
      stale_items: staleCount,
      sections_count: sectionsCount,
      quiet_sections: quietSections,
      is_quiet_shift: isQuietShift,
    },
    sources_status: sourcesHealth,
    warnings,
    flagged_events: flaggedEvents,
    stage_logs: stageLogs,
    generated_at: new Date().toISOString(),
  };
}
