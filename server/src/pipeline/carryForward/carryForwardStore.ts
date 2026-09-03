import fs from 'fs';
import path from 'path';
import { CarriedForwardRecord, GeneratedNoteItem, ShiftWindow } from '../../types/index.js';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'carry_forward_store.json');

// In-memory cache
let inMemoryStore: Record<string, CarriedForwardRecord[]> = {};

// Ensure directory exists
function ensureDataDir(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    // ignore in read-only environments
  }
}

// Load from disk
function loadStore(): Record<string, CarriedForwardRecord[]> {
  ensureDataDir();
  if (Object.keys(inMemoryStore).length > 0) {
    return inMemoryStore;
  }

  try {
    if (fs.existsSync(STORE_FILE)) {
      const data = fs.readFileSync(STORE_FILE, 'utf-8');
      inMemoryStore = JSON.parse(data);
      return inMemoryStore;
    }
  } catch (err) {
    console.warn('Could not read carry forward store from disk, using in-memory store:', err);
  }

  // Seed default prior shift for demo realism if totally empty
  inMemoryStore = seedInitialStore();
  persistStore(inMemoryStore);
  return inMemoryStore;
}

// Persist to disk
function persistStore(store: Record<string, CarriedForwardRecord[]>): void {
  inMemoryStore = store;
  try {
    ensureDataDir();
    fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    // Keep in-memory if disk write fails
  }
}

function seedInitialStore(): Record<string, CarriedForwardRecord[]> {
  // Pre-seed an unresolved blocker and an in-progress ticket from the preceding shift
  const priorShiftEnd = '2026-09-03T16:00:00+05:30';
  return {
    [priorShiftEnd]: [
      {
        source: 'ticketing:OPS-4821',
        record_id: 'OPS-4821',
        section: 'Blockers',
        item: 'OPS-4821 — login failures on mobile app, root cause not yet found; needs backend on-call',
        timestamp: '2026-09-03T14:20:00+05:30',
        shifts_open: 2, // Already open in prior shift
        shift_end: priorShiftEnd,
        raw_events: [
          {
            source: 'ticketing',
            record_id: 'OPS-4821',
            timestamp: '2026-09-03T14:20:00+05:30',
            summary: 'Mobile app auth token timeouts observed on iOS clients',
            status: 'blocked',
            severity: 'high',
            author: 'm.patel@acme.corp',
          },
        ],
      },
      {
        source: 'incident:INC-8812',
        record_id: 'INC-8812',
        section: 'In Progress',
        item: 'INC-8812 — Secondary database replica replication lag (980ms); vacuum process running',
        timestamp: '2026-09-03T15:10:00+05:30',
        shifts_open: 1,
        shift_end: priorShiftEnd,
        raw_events: [
          {
            source: 'incident',
            record_id: 'INC-8812',
            timestamp: '2026-09-03T15:10:00+05:30',
            summary: 'PostgreSQL read replica lag exceeded 500ms alarm',
            status: 'investigating',
            severity: 'medium',
            author: 'pagerduty-bot',
          },
        ],
      },
      {
        source: 'ticketing:OPS-3109',
        record_id: 'OPS-3109',
        section: 'Blockers',
        item: 'OPS-3109 — Legacy VPN gateway memory leak; vendor patch pending hardware review',
        timestamp: '2026-09-02T22:00:00+05:30',
        shifts_open: 3, // Already 3 shifts open (STALE threshold test)
        shift_end: priorShiftEnd,
        raw_events: [
          {
            source: 'ticketing',
            record_id: 'OPS-3109',
            timestamp: '2026-09-02T22:00:00+05:30',
            summary: 'VPN gateway node 2 OOM killer triggered',
            status: 'blocked',
            severity: 'critical',
            author: 'infra-sec@acme.corp',
          },
        ],
      },
    ],
  };
}

/**
 * Retrieve unresolved items from the shift that immediately precedes shiftStart.
 * If no exact match, returns the most recent prior shift's unresolved items.
 */
export function getCarriedOverItems(shiftStart: string): CarriedForwardRecord[] {
  const store = loadStore();
  const shiftStartMs = new Date(shiftStart).getTime();

  // Find shifts ending on or before shiftStart
  const priorEnds = Object.keys(store)
    .filter((endIso) => new Date(endIso).getTime() <= shiftStartMs)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  if (priorEnds.length === 0) {
    return [];
  }

  // Return the most recent prior shift's items
  const mostRecentPrior = priorEnds[0];
  return store[mostRecentPrior] || [];
}

/**
 * Persist unresolved items at the conclusion of a shift.
 * Excludes any items in 'Completed'.
 */
export function persistShiftUnresolved(
  shiftWindow: ShiftWindow,
  items: GeneratedNoteItem[]
): void {
  const store = loadStore();

  // Store only unresolved categories
  const unresolvedItems: CarriedForwardRecord[] = items
    .filter((item) => item.section !== 'Completed')
    .map((item) => {
      const parts = item.source.split(':');
      const recordId = parts.length > 1 ? parts[1] : item.source;

      return {
        source: item.source,
        record_id: recordId,
        section: item.section,
        item: item.item,
        timestamp: item.timestamp, // preserves original last_seen_timestamp
        shifts_open: item.shifts_open || 1,
        raw_events: item.raw_events || [],
        shift_end: shiftWindow.end,
        source_unavailable: item.source_unavailable || false,
      };
    });

  store[shiftWindow.end] = unresolvedItems;
  persistStore(store);
}

/**
 * Reset store (for automated test teardowns)
 */
export function clearCarryForwardStore(): void {
  inMemoryStore = {};
  try {
    if (fs.existsSync(STORE_FILE)) {
      fs.unlinkSync(STORE_FILE);
    }
  } catch (err) {
    // ignore
  }
}

/**
 * Seed store for deterministic testing
 */
export function seedCarryForwardStore(records: Record<string, CarriedForwardRecord[]>): void {
  inMemoryStore = records;
  persistStore(records);
}
