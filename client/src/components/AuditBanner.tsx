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
      <div className="bg-[#161B22] border border-[#30363D] rounded-md p-4 mb-6 text-center shadow-sm">
        <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#0D1117] border border-[#30363D] text-[#8B949E] mb-2">
          <Minus className="w-3.5 h-3.5" />
        </div>
        <h3 className="text-xs font-semibold text-[#F0F6FC]">
          Quiet Shift — Confirmed Clean Window
        </h3>
        <p className="text-xs text-[#8B949E] max-w-md mx-auto mt-0.5 font-sans">
          Zero active incidents or blockers were logged across any connected source during this shift interval. All ledger sections report quiet.
        </p>
      </div>
    );
  }

  const hasIssues = warnings.length > 0 || flaggedEvents.length > 0;
  if (!hasIssues) return null;

  return (
    <div className="bg-[#161B22] border border-[#D29922]/30 rounded-md p-3.5 mb-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-[#D29922] shrink-0" />
          <div>
            <h4 className="text-xs font-semibold text-[#F0F6FC]">
              Telemetry Ingestion Notices ({warnings.length + flaggedEvents.length} Item{warnings.length + flaggedEvents.length > 1 ? 's' : ''})
            </h4>
            <p className="text-xs text-[#8B949E] mt-0.5 font-sans">
              Degraded sources or unparseable timestamps were safely isolated to preserve ledger accuracy.
            </p>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs font-sans text-[#D29922] hover:text-[#E3B341] px-2.5 py-1 rounded bg-[#0D1117] border border-[#30363D] transition-colors shrink-0"
        >
          <span>{expanded ? 'Hide details' : 'Inspect notices'}</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-[#30363D] space-y-3 font-mono text-xs">
          {warnings.length > 0 && (
            <div>
              <span className="text-[11px] text-[#D29922] font-semibold block mb-1">
                Source connection warnings:
              </span>
              <ul className="space-y-1">
                {warnings.map((warn, i) => (
                  <li key={i} className="text-[#C9D1D9] text-xs flex items-start gap-2">
                    <span className="text-[#D29922]">•</span>
                    <span>{warn}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {flaggedEvents.length > 0 && (
            <div>
              <span className="text-[11px] text-[#D29922] font-semibold block mb-1">
                Isolated unparseable events:
              </span>
              <div className="space-y-1.5">
                {flaggedEvents.map((f, i) => (
                  <div
                    key={i}
                    className="p-2 rounded bg-[#0D1117] border border-[#30363D] text-[#8B949E] text-xs"
                  >
                    <div className="flex items-center justify-between text-[11px] text-[#D29922] mb-1">
                      <span>Reason: {f.reason}</span>
                      <span>Record ID: {f.event?.record_id || 'UNKNOWN'}</span>
                    </div>
                    <pre className="text-[10px] text-[#8B949E] overflow-x-auto">
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
