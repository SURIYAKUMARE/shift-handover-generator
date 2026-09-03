import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Minus, AlertTriangle } from 'lucide-react';

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
      <div className="bg-[#12171F] border border-[#1E2633] rounded-lg p-4 mb-5 text-center shadow-console">
        <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#0A0D12] border border-[#283446] text-[#94A3B8] mb-2">
          <Minus className="w-3.5 h-3.5" />
        </div>
        <h3 className="text-xs font-semibold text-[#F8FAFC]">
          Quiet Shift — Confirmed Clean Window
        </h3>
        <p className="text-xs text-[#94A3B8] max-w-md mx-auto mt-0.5 font-sans">
          Zero active incidents or blockers were logged across any connected source during this shift interval. All ledger sections report quiet.
        </p>
      </div>
    );
  }

  const hasIssues = warnings.length > 0 || flaggedEvents.length > 0;
  if (!hasIssues) return null;

  return (
    <div className="bg-[#12171F] border border-[#F59E0B]/30 rounded-lg p-3.5 mb-5 shadow-console">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-1 rounded bg-[#F59E0B]/10 text-[#F59E0B]">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-[#F8FAFC]">
              Telemetry Ingestion Notices ({warnings.length + flaggedEvents.length} Item{warnings.length + flaggedEvents.length > 1 ? 's' : ''})
            </h4>
            <p className="text-xs text-[#94A3B8] mt-0.5 font-sans">
              Degraded feeds or unparseable timestamps were safely isolated to preserve ledger accuracy.
            </p>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs font-sans text-[#F59E0B] hover:text-amber-400 px-2.5 py-1 rounded bg-[#0A0D12] border border-[#283446] transition-colors shrink-0"
        >
          <span>{expanded ? 'Hide details' : 'Inspect notices'}</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-[#1E2633] space-y-3 font-mono text-xs">
          {warnings.length > 0 && (
            <div>
              <span className="text-[11px] text-[#F59E0B] font-semibold block mb-1">
                Source connection warnings:
              </span>
              <ul className="space-y-1">
                {warnings.map((warn, i) => (
                  <li key={i} className="text-[#F8FAFC] text-xs flex items-start gap-2">
                    <span className="text-[#F59E0B]">•</span>
                    <span>{warn}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {flaggedEvents.length > 0 && (
            <div>
              <span className="text-[11px] text-[#F59E0B] font-semibold block mb-1">
                Isolated unparseable events:
              </span>
              <div className="space-y-1.5">
                {flaggedEvents.map((f, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded bg-[#0A0D12] border border-[#283446] text-[#94A3B8] text-xs"
                  >
                    <div className="flex items-center justify-between text-[11px] text-[#F59E0B] mb-1">
                      <span>Reason: {f.reason}</span>
                      <span>Record ID: {f.event?.record_id || 'UNKNOWN'}</span>
                    </div>
                    <pre className="text-[10px] text-[#94A3B8] overflow-x-auto">
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
