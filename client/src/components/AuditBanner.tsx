import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

interface AuditBannerProps {
  warnings: string[];
  flaggedEvents: Array<{ event: any; reason: string }>;
  isQuietShift: boolean;
}

export const AuditBanner: React.FC<AuditBannerProps> = ({
  warnings,
  flaggedEvents,
  isQuietShift,
}) => {
  const [expanded, setExpanded] = useState(false);

  // Quiet shift confirmation
  if (isQuietShift && warnings.length === 0 && flaggedEvents.length === 0) {
    return (
      <div className="bg-noc-panel border border-noc-border rounded-xl p-6 mb-8 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-500/10 text-slate-400 mb-3">
          <Sparkles className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-noc-text">
          Quiet Shift — Confirmed Clean Shift
        </h3>
        <p className="text-xs text-noc-muted max-w-lg mx-auto mt-1">
          Zero active incidents or escalated tickets recorded across all connected sources in this operating window. All four sections report calm status.
        </p>
      </div>
    );
  }

  const hasIssues = warnings.length > 0 || flaggedEvents.length > 0;
  if (!hasIssues) return null;

  return (
    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-mono font-semibold text-amber-300 uppercase tracking-wide">
              PIPELINE INTEGRITY & AUDIT NOTICE ({warnings.length + flaggedEvents.length} ITEM{warnings.length + flaggedEvents.length > 1 ? 'S' : ''})
            </h4>
            <p className="text-xs text-amber-200/80 mt-0.5">
              Degraded sources or malformed telemetry events were safely isolated without interrupting note generation.
            </p>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs font-mono text-amber-300 hover:text-amber-200 px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/30 transition-colors"
        >
          <span>{expanded ? 'Hide Details' : 'View Audit Log'}</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-amber-500/20 space-y-3 font-mono text-xs">
          {/* Warnings */}
          {warnings.length > 0 && (
            <div>
              <span className="text-[11px] text-amber-400 font-semibold block mb-1.5">
                SOURCE DEGRADATION WARNINGS:
              </span>
              <ul className="space-y-1">
                {warnings.map((warn, i) => (
                  <li key={i} className="text-amber-200 flex items-start gap-2">
                    <span className="text-amber-400">•</span>
                    <span>{warn}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Flagged Events */}
          {flaggedEvents.length > 0 && (
            <div>
              <span className="text-[11px] text-amber-400 font-semibold block mb-1.5">
                MALFORMED OR UNPARSEABLE TELEMETRY (ISOLATED):
              </span>
              <div className="space-y-2">
                {flaggedEvents.map((f, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded bg-black/40 border border-amber-500/20 text-amber-100"
                  >
                    <div className="flex items-center justify-between text-[11px] text-amber-300 mb-1">
                      <span className="font-semibold">Reason: {f.reason}</span>
                      <span>Record: {f.event?.record_id || 'UNKNOWN'}</span>
                    </div>
                    <pre className="text-[10px] text-slate-400 overflow-x-auto">
                      {JSON.stringify(f.event, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
