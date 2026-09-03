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
      <div className="bg-[#12171F] border border-[#1E2633] rounded-xl p-5 sm:p-6 mb-6 text-center shadow-console">
        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#0A0D12] border border-[#283446] text-[#94A3B8] mb-2.5">
          <Minus className="w-4 h-4" />
        </div>
        <h3 className="text-sm sm:text-base font-bold text-[#F8FAFC]">
          Quiet Shift — Confirmed Clean Operating Window
        </h3>
        <p className="text-xs sm:text-sm text-[#94A3B8] max-w-lg mx-auto mt-1 font-sans">
          Zero active incidents or blockers were logged across any connected source during this shift interval. All ledger sections report quiet.
        </p>
      </div>
    );
  }

  const hasIssues = warnings.length > 0 || flaggedEvents.length > 0;
  if (!hasIssues) return null;

  return (
    <div className="bg-[#12171F] border border-[#F59E0B]/35 rounded-xl p-4 sm:p-5 mb-6 shadow-console">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#F59E0B]/10 text-[#F59E0B]">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#F8FAFC]">
              Telemetry Ingestion Notices ({warnings.length + flaggedEvents.length} Item{warnings.length + flaggedEvents.length > 1 ? 's' : ''})
            </h4>
            <p className="text-xs sm:text-sm text-[#94A3B8] mt-0.5 font-sans">
              Degraded feeds or unparseable timestamps were safely isolated to preserve ledger accuracy.
            </p>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-sans text-[#F59E0B] hover:text-amber-400 px-3.5 py-1.5 rounded-md bg-[#0A0D12] border border-[#283446] transition-colors shrink-0 font-semibold"
        >
          <span>{expanded ? 'Hide details' : 'Inspect notices'}</span>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-[#1E2633] space-y-4 font-mono text-xs sm:text-sm">
          {warnings.length > 0 && (
            <div>
              <span className="text-xs font-bold text-[#F59E0B] block mb-1.5 uppercase tracking-wide">
                Source connection warnings:
              </span>
              <ul className="space-y-1.5">
                {warnings.map((warn, i) => (
                  <li key={i} className="text-[#F8FAFC] text-xs sm:text-sm flex items-start gap-2.5">
                    <span className="text-[#F59E0B] font-bold">•</span>
                    <span>{warn}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {flaggedEvents.length > 0 && (
            <div>
              <span className="text-xs font-bold text-[#F59E0B] block mb-1.5 uppercase tracking-wide">
                Isolated unparseable events:
              </span>
              <div className="space-y-2">
                {flaggedEvents.map((f, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-lg bg-[#0A0D12] border border-[#283446] text-[#94A3B8]"
                  >
                    <div className="flex items-center justify-between text-xs text-[#F59E0B] font-semibold mb-1.5">
                      <span>Reason: {f.reason}</span>
                      <span>Record ID: {f.event?.record_id || 'UNKNOWN'}</span>
                    </div>
                    <pre className="text-xs text-[#94A3B8] overflow-x-auto leading-relaxed">
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
