import { describe, it, expect } from 'vitest';
import { Event, ShiftWindow } from '../src/types/index.js';
import { deduplicateAndCollapse } from '../src/pipeline/generator/deduplicator.js';
import { assignSection } from '../src/pipeline/generator/sectionRules.js';
import { generateHandoverNote } from '../src/pipeline/generator/handoverGenerator.js';
import { fetchActivity, parseAndNormalizeTimestamp } from '../src/pipeline/fetcher/fetchActivity.js';
import { MockTicketingAdapter, MockIncidentAdapter, MockChatAdapter } from '../src/pipeline/fetcher/adapters.js';
import { generatePDFBuffer } from '../src/pipeline/publisher/pdfPublisher.js';
import { generateDOCXBuffer } from '../src/pipeline/publisher/docxPublisher.js';

describe('Shift Handover Pipeline', () => {
  const testWindow: ShiftWindow = {
    start: '2026-09-03T16:00:00Z',
    end: '2026-09-04T00:00:00Z',
    timezone: 'UTC',
  };

  describe('Timestamp Normalization & Strict Window Filtering', () => {
    it('normalizes valid ISO timestamps with timezone offsets', () => {
      const result = parseAndNormalizeTimestamp('2026-09-03T19:42:00+05:30');
      expect(result).not.toBeNull();
      expect(result?.isoUtc).toBe('2026-09-03T14:12:00.000Z');
    });

    it('returns null for malformed timestamps', () => {
      expect(parseAndNormalizeTimestamp('INVALID_DATE_2026')).toBeNull();
      expect(parseAndNormalizeTimestamp('')).toBeNull();
    });

    it('strictly filters events to [shift_start, shift_end)', async () => {
      const adapter = new MockTicketingAdapter();
      adapter.setScenario('busy');
      const result = await fetchActivity([adapter], testWindow);

      // Verify no event has timestamp < shift_start or >= shift_end
      const startMs = new Date(testWindow.start).getTime();
      const endMs = new Date(testWindow.end).getTime();

      for (const ev of result.inWindowEvents) {
        const evMs = new Date(ev.timestamp).getTime();
        expect(evMs).toBeGreaterThanOrEqual(startMs);
        expect(evMs).toBeLessThan(endMs);
      }
    });
  });

  describe('Deduplication & Progression Collapse', () => {
    it('collapses multiple out-of-order updates into a single item with progression', () => {
      const messyEvents: Event[] = [
        {
          source: 'ticketing',
          record_id: 'OPS-5501',
          timestamp: '2026-09-03T17:15:00Z',
          summary: 'User registration failing with HTTP 500',
          status: 'open',
        },
        {
          source: 'ticketing',
          record_id: 'OPS-5501',
          timestamp: '2026-09-03T16:45:00Z', // earlier timestamp arrived out-of-order
          summary: 'Triage started',
          status: 'triaging',
        },
        {
          source: 'ticketing',
          record_id: 'OPS-5501',
          timestamp: '2026-09-03T18:30:00Z',
          summary: 'Escalated to Auth Tier-3',
          status: 'escalated',
        },
        {
          source: 'ticketing',
          record_id: 'OPS-5501',
          timestamp: '2026-09-03T20:00:00Z',
          summary: 'Rollback deployed; error rate dropping',
          status: 'in_progress',
        },
      ];

      const { items, dedupStats } = deduplicateAndCollapse(messyEvents);

      expect(items.length).toBe(1);
      expect(dedupStats.rawEventCount).toBe(4);
      expect(dedupStats.collapsedItemCount).toBe(1);

      const collapsed = items[0];
      expect(collapsed.source).toBe('ticketing:OPS-5501');
      expect(collapsed.timestamp).toBe('2026-09-03T20:00:00Z');
      expect(collapsed.final_status).toBe('in_progress');
      expect(collapsed.progression).toEqual(['triaging', 'open', 'escalated', 'in_progress']);
      expect(collapsed.raw_events?.length).toBe(4);
    });

    it('retains all raw events for 2-click drilldown traceability', () => {
      const events: Event[] = [
        {
          source: 'chat',
          record_id: 'SLACK-9901',
          timestamp: '2026-09-03T17:30:00Z',
          summary: 'Retry #1',
          status: 'monitoring',
        },
        {
          source: 'chat',
          record_id: 'SLACK-9901',
          timestamp: '2026-09-03T17:45:00Z',
          summary: 'Retry #2',
          status: 'monitoring',
        },
      ];

      const { items } = deduplicateAndCollapse(events);
      expect(items.length).toBe(1);
      expect(items[0].raw_events?.length).toBe(2);
      expect(items[0].raw_events![0].summary).toBe('Retry #1');
    });
  });

  describe('Deterministic Section Assignment Rules', () => {
    it('assigns blockers and escalations to Blockers', () => {
      const blockerEvents: Event[] = [
        {
          source: 'incident',
          record_id: 'INC-100',
          timestamp: '2026-09-03T18:00:00Z',
          summary: 'Database connection exhausted',
          status: 'blocked',
          severity: 'critical',
        },
      ];
      expect(assignSection(blockerEvents)).toBe('Blockers');
    });

    it('assigns resolved tasks to Completed even if previously escalated', () => {
      const resolvedEvents: Event[] = [
        {
          source: 'incident',
          record_id: 'INC-200',
          timestamp: '2026-09-03T17:00:00Z',
          summary: 'P1 Outage started',
          status: 'escalated',
          severity: 'critical',
        },
        {
          source: 'incident',
          record_id: 'INC-200',
          timestamp: '2026-09-03T19:00:00Z',
          summary: 'P1 Outage mitigated and resolved',
          status: 'resolved',
          severity: 'low',
        },
      ];
      expect(assignSection(resolvedEvents)).toBe('Completed');
    });

    it('assigns monitoring and observation to Watch-list', () => {
      const watchEvents: Event[] = [
        {
          source: 'ticketing',
          record_id: 'OPS-300',
          timestamp: '2026-09-03T18:00:00Z',
          summary: 'Observing post-route change network jitter',
          status: 'monitoring',
        },
      ];
      expect(assignSection(watchEvents)).toBe('Watch-list');
    });

    it('assigns standard active tasks to In Progress', () => {
      const activeEvents: Event[] = [
        {
          source: 'ticketing',
          record_id: 'OPS-400',
          timestamp: '2026-09-03T18:00:00Z',
          summary: 'Investigating payment webhook timeouts',
          status: 'investigating',
        },
      ];
      expect(assignSection(activeEvents)).toBe('In Progress');
    });
  });

  describe('Reproducibility Guarantee (Idempotency)', () => {
    it('produces identical item counts and identical SHA-256 fingerprint across runs', async () => {
      const ticketing = new MockTicketingAdapter();
      const incident = new MockIncidentAdapter();
      const chat = new MockChatAdapter();

      ticketing.setScenario('busy');
      incident.setScenario('busy');
      chat.setScenario('busy');

      const fetchResult1 = await fetchActivity([ticketing, incident, chat], testWindow);
      const note1 = generateHandoverNote(
        fetchResult1.inWindowEvents,
        testWindow,
        fetchResult1.totalRawEvents,
        fetchResult1.sourcesHealth,
        [],
        [],
        []
      );

      const fetchResult2 = await fetchActivity([ticketing, incident, chat], testWindow);
      const note2 = generateHandoverNote(
        fetchResult2.inWindowEvents,
        testWindow,
        fetchResult2.totalRawEvents,
        fetchResult2.sourcesHealth,
        [],
        [],
        []
      );

      expect(note1.items.length).toBe(note2.items.length);
      expect(note1.reproducibility_hash).toBe(note2.reproducibility_hash);
      expect(JSON.stringify(note1.items)).toBe(JSON.stringify(note2.items));
    });
  });

  describe('Hostile Inputs & Resilient Handling', () => {
    const hostileWindow = {
      start: '2026-09-03T16:00:00+05:30',
      end: '2026-09-04T00:00:00+05:30',
      timezone: 'Asia/Kolkata',
    };

    it('safely handles malformed timestamps without crashing or dropping valid events', async () => {
      const hostileTicketAdapter = new MockTicketingAdapter();
      hostileTicketAdapter.setScenario('hostile');

      const fetchResult = await fetchActivity([hostileTicketAdapter], hostileWindow);

      // Malformed event should be isolated into flaggedEvents
      expect(fetchResult.flaggedEvents.length).toBeGreaterThan(0);
      expect(fetchResult.flaggedEvents[0].event.record_id).toBe('OPS-MALFORMED');
      // Valid events should still be returned
      expect(fetchResult.inWindowEvents.length).toBeGreaterThan(0);
      expect(fetchResult.inWindowEvents[0].record_id).toBe('OPS-6001');
    });

    it('safely skips unreachable sources with warning while processing available sources', async () => {
      const ticketAdapter = new MockTicketingAdapter();
      const chatAdapter = new MockChatAdapter();
      ticketAdapter.setScenario('hostile');
      chatAdapter.setScenario('hostile'); // Chat is simulated unreachable

      const fetchResult = await fetchActivity([ticketAdapter, chatAdapter], hostileWindow);

      expect(fetchResult.sourcesHealth['chat'].status).toBe('unreachable');
      expect(fetchResult.warnings.some((w) => w.includes('Chat') || w.includes('unreachable'))).toBe(true);
      expect(fetchResult.sourcesHealth['ticketing'].status).toBe('connected');
      expect(fetchResult.inWindowEvents.length).toBeGreaterThan(0);
    });
  });

  describe('Single-File Publisher Exporters', () => {
    it('exports a valid non-empty PDF document buffer', async () => {
      const testItem = {
        section: 'Blockers' as const,
        item: 'OPS-4821 — login failures on mobile app',
        source: 'ticketing:OPS-4821',
        timestamp: '2026-09-03T19:42:00Z',
      };

      const pdf = await generatePDFBuffer({
        shiftWindow: testWindow,
        items: [testItem],
        reproducibilityHash: 'abc123hash',
      });

      expect(Buffer.isBuffer(pdf)).toBe(true);
      expect(pdf.length).toBeGreaterThan(1000);
    });

    it('exports a valid non-empty DOCX document buffer', async () => {
      const testItem = {
        section: 'Completed' as const,
        item: 'OPS-4825 — Redis session cache resized',
        source: 'ticketing:OPS-4825',
        timestamp: '2026-09-03T21:10:00Z',
      };

      const docx = await generateDOCXBuffer({
        shiftWindow: testWindow,
        items: [testItem],
        reproducibilityHash: 'abc123hash',
      });

      expect(Buffer.isBuffer(docx)).toBe(true);
      expect(docx.length).toBeGreaterThan(1000);
    });
  });
});
