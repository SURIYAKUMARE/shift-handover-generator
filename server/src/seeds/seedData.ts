import { Event } from '../types/index.js';

export interface ShiftScenarioSeed {
  name: string;
  description: string;
  defaultWindow: {
    start: string;
    end: string;
    timezone: string;
  };
  events: {
    ticketing: Event[];
    incident: Event[];
    chat: Event[];
  };
  simulateUnreachableSource?: string;
}

export const SEED_SCENARIOS: Record<string, ShiftScenarioSeed> = {
  busy: {
    name: 'Busy Shift (High-Severity Multi-Source)',
    description: 'Realistic high-load shift with P1 outage, multiple tickets, chat war-room triage across all four handover categories.',
    defaultWindow: {
      start: '2026-09-03T16:00:00+05:30',
      end: '2026-09-04T00:00:00+05:30',
      timezone: 'Asia/Kolkata',
    },
    events: {
      ticketing: [
        {
          source: 'ticketing',
          record_id: 'OPS-4821',
          timestamp: '2026-09-03T18:15:00+05:30',
          summary: 'Customer reported login failures on mobile app; root cause not yet found',
          status: 'open',
          severity: 'high',
          author: 'r.chen@acme.corp',
        },
        {
          source: 'ticketing',
          record_id: 'OPS-4821',
          timestamp: '2026-09-03T19:42:00+05:30',
          summary: 'Customer login failures on mobile app; root cause not yet found; needs backend on-call',
          status: 'escalated',
          severity: 'critical',
          author: 'r.chen@acme.corp',
        },
        {
          source: 'ticketing',
          record_id: 'OPS-4822',
          timestamp: '2026-09-03T17:20:00+05:30',
          summary: 'Payment gateway webhook delivery timeouts under elevated load',
          status: 'investigating',
          severity: 'high',
          author: 'k.patel@acme.corp',
        },
        {
          source: 'ticketing',
          record_id: 'OPS-4825',
          timestamp: '2026-09-03T21:10:00+05:30',
          summary: 'Redis session cache memory threshold exceeded; cluster node resized to cache.r6g.xlarge',
          status: 'resolved',
          severity: 'medium',
          author: 'm.johansson@acme.corp',
        },
        {
          source: 'ticketing',
          record_id: 'OPS-4830',
          timestamp: '2026-09-03T22:30:00+05:30',
          summary: 'EU-Central egress bandwidth showing 8% intermittent packet loss; observing post-route change',
          status: 'monitoring',
          severity: 'low',
          author: 'd.novak@acme.corp',
        },
        // Outside window ticket (should be excluded)
        {
          source: 'ticketing',
          record_id: 'OPS-4810',
          timestamp: '2026-09-03T14:10:00+05:30', // Before shift_start
          summary: 'Legacy batch job archival completed in morning shift',
          status: 'resolved',
          severity: 'low',
        },
      ],
      incident: [
        {
          source: 'incident',
          record_id: 'INC-9011',
          timestamp: '2026-09-03T18:45:00+05:30',
          summary: 'P1: Primary Postgres DB connection pool saturation on replica cluster',
          status: 'open',
          severity: 'critical',
          author: 'PagerDuty Bot',
        },
        {
          source: 'incident',
          record_id: 'INC-9011',
          timestamp: '2026-09-03T19:15:00+05:30',
          summary: 'P1: Primary Postgres DB connection pool saturation; waiting on DBA team for max_connections reload',
          status: 'blocked',
          severity: 'critical',
          author: 's.sharma@acme.corp',
        },
        {
          source: 'incident',
          record_id: 'INC-9015',
          timestamp: '2026-09-03T20:05:00+05:30',
          summary: 'P2: Cloudflare edge CDN HTTP 502 spike in AP-South region',
          status: 'investigating',
          severity: 'high',
          author: 'PagerDuty Bot',
        },
        {
          source: 'incident',
          record_id: 'INC-9008',
          timestamp: '2026-09-03T16:30:00+05:30',
          summary: 'P3: Corporate VPN secondary gateway flap during scheduled maintenance',
          status: 'resolved',
          severity: 'low',
          author: 'j.garcia@acme.corp',
        },
      ],
      chat: [
        {
          source: 'chat',
          record_id: 'SLACK-8832',
          timestamp: '2026-09-03T19:20:00+05:30',
          summary: '#war-room-auth: DBA team confirmed pgbouncer reload pending; waiting on change approval',
          status: 'blocked',
          channel: '#war-room-auth',
          author: 'dba-lead',
        },
        {
          source: 'chat',
          record_id: 'SLACK-8840',
          timestamp: '2026-09-03T22:15:00+05:30',
          summary: '#incident-cdn: Traffic rerouted via Tokyo PoP; latency returned to 42ms; keep under observation',
          status: 'monitoring',
          channel: '#incident-cdn',
          author: 'net-oncall',
        },
        {
          source: 'chat',
          record_id: 'SLACK-8812',
          timestamp: '2026-09-03T17:40:00+05:30',
          summary: '#ops-deployments: Canary rollout for payments-v4.18 halted due to webhook timeouts',
          status: 'in_progress',
          channel: '#ops-deployments',
          author: 'release-captain',
        },
      ],
    },
  },

  quiet: {
    name: 'Quiet Shift (Routine Maintenance)',
    description: 'Low-event shift with only 2 minor routine resolved tasks. Demonstrates calm, distinct "Nothing to report" state across empty sections.',
    defaultWindow: {
      start: '2026-09-03T08:00:00+05:30',
      end: '2026-09-03T16:00:00+05:30',
      timezone: 'Asia/Kolkata',
    },
    events: {
      ticketing: [
        {
          source: 'ticketing',
          record_id: 'OPS-3990',
          timestamp: '2026-09-03T10:15:00+05:30',
          summary: 'Quarterly TLS certificate renewal for staging wildcard domains',
          status: 'resolved',
          severity: 'low',
          author: 'sec-ops@acme.corp',
        },
      ],
      incident: [
        {
          source: 'incident',
          record_id: 'INC-4100',
          timestamp: '2026-09-03T12:00:00+05:30',
          summary: 'P4: Automated log rotation disk space warning cleared automatically',
          status: 'resolved',
          severity: 'info',
          author: 'CloudWatch',
        },
      ],
      chat: [],
    },
  },

  messy: {
    name: 'Messy Shift (Progression Collapse & Out-of-Order)',
    description: 'Multiple out-of-order updates to single tickets, ticket opened & closed in same window, and deduplication stress testing.',
    defaultWindow: {
      start: '2026-09-03T16:00:00+05:30',
      end: '2026-09-04T00:00:00+05:30',
      timezone: 'Asia/Kolkata',
    },
    events: {
      ticketing: [
        // Out of order timestamps for OPS-5501
        {
          source: 'ticketing',
          record_id: 'OPS-5501',
          timestamp: '2026-09-03T17:15:00+05:30',
          summary: 'User registration failing with HTTP 500 in US-West region',
          status: 'open',
          severity: 'high',
        },
        {
          source: 'ticketing',
          record_id: 'OPS-5501',
          timestamp: '2026-09-03T16:45:00+05:30', // Earlier timestamp arrived later
          summary: 'User registration triage started',
          status: 'triaging',
          severity: 'high',
        },
        {
          source: 'ticketing',
          record_id: 'OPS-5501',
          timestamp: '2026-09-03T18:30:00+05:30',
          summary: 'User registration HTTP 500 escalated to Auth Tier-3 on-call',
          status: 'escalated',
          severity: 'critical',
        },
        {
          source: 'ticketing',
          record_id: 'OPS-5501',
          timestamp: '2026-09-03T20:00:00+05:30',
          summary: 'User registration 500: Auth-v2.16 rolled back; error rate dropping below 0.1%',
          status: 'in_progress',
          severity: 'high',
        },
        // Duplicate alert events for OPS-5502
        {
          source: 'ticketing',
          record_id: 'OPS-5502',
          timestamp: '2026-09-03T19:00:00+05:30',
          summary: 'Search indexing queue depth exceeding 50,000 threshold',
          status: 'open',
          severity: 'medium',
        },
        {
          source: 'ticketing',
          record_id: 'OPS-5502',
          timestamp: '2026-09-03T19:15:00+05:30',
          summary: 'Search indexing queue depth exceeding 50,000 threshold',
          status: 'open',
          severity: 'medium',
        },
      ],
      incident: [
        // Opened, mitigated, resolved within same shift
        {
          source: 'incident',
          record_id: 'INC-7701',
          timestamp: '2026-09-03T17:00:00+05:30',
          summary: 'P2: Kafka consumer group lag spike on order-events topic',
          status: 'open',
          severity: 'high',
        },
        {
          source: 'incident',
          record_id: 'INC-7701',
          timestamp: '2026-09-03T18:10:00+05:30',
          summary: 'P2: Kafka consumer group lag: Additional consumer instances provisioned',
          status: 'mitigated',
          severity: 'medium',
        },
        {
          source: 'incident',
          record_id: 'INC-7701',
          timestamp: '2026-09-03T19:30:00+05:30',
          summary: 'P2: Kafka consumer group lag: Backlog fully drained, consumer healthy',
          status: 'resolved',
          severity: 'low',
        },
      ],
      chat: [
        {
          source: 'chat',
          record_id: 'SLACK-9901',
          timestamp: '2026-09-03T17:30:00+05:30',
          summary: '#noc-alerts: S3 bucket sync job retry attempt #1',
          status: 'monitoring',
          channel: '#noc-alerts',
        },
        {
          source: 'chat',
          record_id: 'SLACK-9901',
          timestamp: '2026-09-03T17:45:00+05:30',
          summary: '#noc-alerts: S3 bucket sync job retry attempt #2',
          status: 'monitoring',
          channel: '#noc-alerts',
        },
      ],
    },
  },

  hostile: {
    name: 'Hostile Inputs (Unreachable Source & Malformed Event)',
    description: 'Simulates Slack chat API timing out (503), malformed timestamp in ticketing, and verifies resilient graceful recovery without crashing.',
    defaultWindow: {
      start: '2026-09-03T16:00:00+05:30',
      end: '2026-09-04T00:00:00+05:30',
      timezone: 'Asia/Kolkata',
    },
    simulateUnreachableSource: 'chat',
    events: {
      ticketing: [
        {
          source: 'ticketing',
          record_id: 'OPS-6001',
          timestamp: '2026-09-03T18:00:00+05:30',
          summary: 'SSL certificate renewal blocked on DNS registrar validation',
          status: 'blocked',
          severity: 'high',
        },
        // Malformed timestamp event: must be flagged in audit strip, NOT crash
        {
          source: 'ticketing',
          record_id: 'OPS-MALFORMED',
          timestamp: 'INVALID_TIMESTAMP_2026_99_99_XX',
          summary: 'Legacy sensor log event with corrupted date format',
          status: 'open',
          severity: 'low',
        },
      ],
      incident: [
        {
          source: 'incident',
          record_id: 'INC-8820',
          timestamp: '2026-09-03T19:30:00+05:30',
          summary: 'P2: Redis cluster read-replica failover completed',
          status: 'resolved',
          severity: 'medium',
        },
      ],
      chat: [], // Will be simulated unreachable
    },
  },

  zero: {
    name: 'Zero-Event Shift (Confirmed Completely Quiet)',
    description: 'Zero events recorded across all sources in the entire window. Confirms serene "Quiet shift" presentation and valid export.',
    defaultWindow: {
      start: '2026-09-03T00:00:00+05:30',
      end: '2026-09-03T08:00:00+05:30',
      timezone: 'Asia/Kolkata',
    },
    events: {
      ticketing: [],
      incident: [],
      chat: [],
    },
  },
};
