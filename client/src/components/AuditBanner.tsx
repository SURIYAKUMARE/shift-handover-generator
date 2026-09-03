import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Minus } from 'lucide-react';

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
      <div className="bg-[#121215] border border-white/[0.07] rounded-xl p-5 mb-8 text-center shadow-sm">
        <div className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/[0.03] border border-white/[0.06] text-zinc-400 mb-2.5">
          <Minus className="w-4 h-4" />
        </div>
        <h3 className="text-sm font-semibold text-zinc-200">
          Quiet Shift — Confirmed Clean Shift
        </h3>
        <p className="text-xs text-zinc-400 max-w-md mx-auto mt-1 font-sans">
          Zero active incidents or blockers recorded across all connected sources. All sections report quiet status.
        </p>
      </div>
    );
  }

  const hasIssues = warnings.length > 0 || flaggedEvents.length > 0;
  if (!hasIssues) return null;

  return (
    <div className="bg-[#14120F] border border-amber-500/20 rounded-xl p-4 mb-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
          <div>
            <h4 className="text-[11px] font-mono font-semibold text-amber-300 uppercase tracking-wider">
              Telemetry Integrity Notice ({warnings.length + flaggedEvents.length} Notice{warnings.length + flaggedEvents.length > 1 ? 's' : ''})
            </h4>
            <p className="text-xs text-zinc-400 mt-0.5 font-sans">
              Degraded sources or malformed timestamp events were safely isolated without interrupting note generation.
            </p>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs font-mono text-amber-300/90 hover:text-amber-200 px-2.5 py-1 rounded bg-amber-500/[0.08] border border-amber-500/20 transition-colors shrink-0"
        >
          <span>{expanded ? 'Hide' : 'Inspect'}</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {expanded && (
        <div className="mt-3.5 pt-3.5 border-t border-amber-500/15 space-y-3 font-mono text-xs">
          {warnings.length > 0 && (
            <div>
              <span className="text-[10px] text-amber-400/80 uppercase font-semibold block mb-1">
                Source Degradation Warnings:
              </span>
              <ul className="space-y-1">
                {warnings.map((warn, i) => (
                  <li key={i} className="text-zinc-300 text-xs flex items-start gap-2">
                    <span className="text-amber-400">•</span>
                    <span>{warn}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {flaggedEvents.length > 0 && (
            <div>
              <span className="text-[10px] text-amber-400/80 uppercase font-semibold block mb-1">
                Isolated Malformed Telemetry:
              </span>
              <div className="space-y-2">
                {flaggedEvents.map((f, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded bg-black/40 border border-amber-500/15 text-zinc-300 text-xs"
                  >
                    <div className="flex items-center justify-between text-[11px] text-amber-300 mb-1">
                      <span>Reason: {f.reason}</span>
                      <span>Record: {f.event?.record_id || 'UNKNOWN'}</span>
                    </div>
                    <pre className="text-[10px] text-zinc-500 overflow-x-auto">
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
