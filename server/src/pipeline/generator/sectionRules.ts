import { Event, SectionType } from '../../types/index.js';

/**
 * Deterministic Section Assignment Rules (Non-Vibes, Fully Grounded):
 * 
 * 1. BLOCKERS / ESCALATIONS:
 *    - Status equals 'blocked' or 'escalated'
 *    - Severity equals 'critical' or 'P1' / 'sev1'
 *    - Summary/status indicates blocked on external dependencies or requiring on-call escalation without active workaround.
 * 
 * 2. COMPLETED:
 *    - Final status equals 'resolved', 'closed', 'completed', 'mitigated', or 'fixed'
 *    - Represents tasks or incidents successfully closed within the shift window.
 * 
 * 3. WATCH-LIST:
 *    - Status equals 'monitoring', 'watch', 'provisional', 'degraded'
 *    - OR summary explicitly notes post-fix observation, intermittent packet loss, or soak-period monitoring.
 * 
 * 4. IN PROGRESS:
 *    - Default active status: 'open', 'investigating', 'in_progress', 'triaging', 'active', 'pending'
 *    - Work in flight that is not blocked and not yet marked resolved.
 */
export function assignSection(events: Event[]): SectionType {
  if (!events || events.length === 0) {
    return 'In Progress';
  }

  // Determine final event in chronological order
  const finalEvent = events[events.length - 1];
  const finalStatus = (finalEvent.status || '').toLowerCase().trim();
  const summaryLower = (finalEvent.summary || '').toLowerCase();
  const severityLower = (finalEvent.severity || '').toLowerCase();

  // Check any event in the collapsed sequence for blocker / escalation markers
  const hasEscalation = events.some((e) => {
    const st = (e.status || '').toLowerCase().trim();
    const sv = (e.severity || '').toLowerCase().trim();
    return st === 'blocked' || st === 'escalated' || sv === 'critical' || sv === 'p1';
  });

  // If the issue was later resolved, it belongs in Completed regardless of past escalation
  const isResolved = ['resolved', 'closed', 'completed', 'fixed'].includes(finalStatus);
  if (isResolved) {
    return 'Completed';
  }

  // If final status is monitoring/watch or post-incident observation
  if (
    finalStatus === 'monitoring' ||
    finalStatus === 'watch' ||
    finalStatus === 'degraded' ||
    finalStatus === 'mitigated' ||
    summaryLower.includes('observing post-') ||
    summaryLower.includes('keep under observation')
  ) {
    return 'Watch-list';
  }

  // If currently blocked, escalated, or critical
  if (
    finalStatus === 'blocked' ||
    finalStatus === 'escalated' ||
    severityLower === 'critical' ||
    severityLower === 'p1' ||
    hasEscalation ||
    summaryLower.includes('waiting on') ||
    summaryLower.includes('needs backend on-call') ||
    summaryLower.includes('escalated to')
  ) {
    return 'Blockers';
  }

  // Default active work
  return 'In Progress';
}
