import crypto from 'crypto';
import {
  Event,
  GeneratedNoteItem,
  ShiftWindow,
  GenerationResult,
  SectionType,
  GenerationStageLog,
  SourceHealth,
} from '../../types/index.js';
import { deduplicateAndCollapse } from './deduplicator.js';

const SECTION_PRIORITY: Record<SectionType, number> = {
  'Blockers': 1,
  'In Progress': 2,
  'Completed': 3,
  'Watch-list': 4,
};

const ALL_SECTIONS: SectionType[] = ['Blockers', 'In Progress', 'Completed', 'Watch-list'];

export function generateHandoverNote(
  inWindowEvents: Event[],
  shiftWindow: ShiftWindow,
  totalRawEvents: number,
  sourcesHealth: Record<string, SourceHealth>,
  warnings: string[],
  flaggedEvents: Array<{ event: any; reason: string }>,
  existingLogs: GenerationStageLog[]
): GenerationResult {
  const stageLogs = [...existingLogs];

  // Stage: Deduplication
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

  // Stage: Section Assignment & Deterministic Sorting
  const sortStageId = 'section-sort';
  stageLogs.push({
    id: sortStageId,
    stage: 'Section Assignment & Verification',
    status: 'running',
    message: 'Assigning items via deterministic grounding rules…',
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
  // Canonical representation: strips runtime transient metadata to ensure idempotency
  const canonicalRepresentation = items.map((i) => ({
    section: i.section,
    source: i.source,
    item: i.item,
    timestamp: i.timestamp,
    final_status: i.final_status,
  }));

  const reproducibilityHash = crypto
    .createHash('sha256')
    .update(JSON.stringify({ window: shiftWindow, items: canonicalRepresentation }))
    .digest('hex');

  stageLogs.push({
    id: `${sortStageId}-done`,
    stage: 'Section Assignment & Verification',
    status: 'completed',
    message: `Generated note with ${items.length} items. Reproducibility fingerprint: ${reproducibilityHash.substring(0, 16)}…`,
    timestamp: new Date().toISOString(),
    details: { reproducibilityHash, sectionsCount },
  });

  return {
    shift_window: shiftWindow,
    items,
    reproducibility_hash: reproducibilityHash,
    stats: {
      total_raw_events: totalRawEvents,
      events_in_window: inWindowEvents.length,
      deduplicated_items: items.length,
      sections_count: sectionsCount,
      quiet_sections: quietSections,
      is_quiet_shift: isQuietShift,
    },
    stage_logs: stageLogs,
    warnings,
    flagged_events: flaggedEvents,
    sources_status: sourcesHealth,
    generated_at: new Date().toISOString(),
  };
}
