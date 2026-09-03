import React, { useEffect, useState } from 'react';
import { GeneratedNoteItem, Event as TelemetryEvent } from '../types';
import { X, Clock, User, MessageSquare, Copy, Check, ShieldCheck, ArrowRightLeft } from 'lucide-react';

interface SourceDrillDownDrawerProps {
  item: GeneratedNoteItem | null;
  onClose: () => void;
}

export const SourceDrillDownDrawer: React.FC<SourceDrillDownDrawerProps> = ({
  item,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!item) return null;

  const rawEvents = item.raw_events || [];

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(rawEvents, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Dimmed backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-2xl bg-[#12171F] border-l border-[#1E2633] shadow-2xl flex flex-col h-full z-10 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#1E2633] flex items-center justify-between bg-[#0A0D12]">
          <div className="min-w-0 pr-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#18202C] border border-[#283446] text-[#3B82F6] font-semibold">
                {item.source}
              </span>
              <span className="text-[11px] text-[#94A3B8] font-sans">
                Evidence Docket Inspection
              </span>
            </div>
            <h3 className="text-sm font-semibold text-[#F8FAFC] truncate">
              {item.item}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-md bg-[#18202C] hover:bg-[#1D2635] text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Grounding Verification Seal */}
        <div className="px-5 py-2.5 bg-[#0A0D12] border-b border-[#18202C] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-emerald-400 font-sans">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Traceability: Grounded in {rawEvents.length} telemetry event(s) logged by upstream monitoring</span>
          </div>
          <button
            onClick={handleCopyJSON}
            className="flex items-center gap-1.5 text-[11px] font-mono text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy JSON'}</span>
          </button>
        </div>

        {/* Carry-Forward Origin Notice */}
        {item.carried_forward && (
          <div className="px-5 py-2.5 bg-[#0A0D12] border-b border-[#1E2633] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <ArrowRightLeft className={`w-3.5 h-3.5 ${(item.shifts_open || 1) >= 3 ? 'text-[#F59E0B]' : 'text-[#3B82F6]'}`} />
              <span className="text-[#F8FAFC] font-medium font-sans">
                Carried forward across {item.shifts_open || 1} consecutive shifts
              </span>
              <span className="text-[11px] text-[#94A3B8] font-sans hidden sm:inline">
                (untouched in current window, original timestamp preserved)
              </span>
            </div>
            {(item.shifts_open || 1) >= 3 && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30 font-semibold">
                STALE ESCALATION
              </span>
            )}
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Progression Timeline */}
          <div>
            <h4 className="text-xs font-semibold text-[#F8FAFC] mb-3 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#3B82F6]" />
              Event Timeline Before Deduplication ({rawEvents.length} updates)
            </h4>

            <div className="relative border-l border-[#1E2633] ml-2.5 pl-4 space-y-3">
              {rawEvents.map((evt: TelemetryEvent, idx: number) => (
                <div key={idx} className="relative">
                  {/* Timeline node mark */}
                  <div className="absolute -left-[21px] top-2.5 w-2 h-2 rounded-full bg-[#3B82F6] ring-4 ring-[#12171F]" />

                  <div className="bg-[#0A0D12] border border-[#283446] rounded-md p-3 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono uppercase px-1.5 py-0.2 rounded bg-[#18202C] border border-[#283446] text-[#F8FAFC]">
                          {evt.status}
                        </span>
                        {evt.severity && (
                          <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30">
                            {evt.severity}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-[#94A3B8]">
                        {evt.timestamp}
                      </span>
                    </div>

                    <p className="text-xs text-[#F8FAFC] leading-relaxed font-sans">
                      {evt.summary}
                    </p>

                    {(evt.author || evt.channel) && (
                      <div className="mt-2 pt-2 border-t border-[#18202C] flex flex-wrap items-center gap-3 text-[11px] text-[#94A3B8]">
                        {evt.author && (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3 text-[#64748B]" />
                            {evt.author}
                          </span>
                        )}
                        {evt.channel && (
                          <span className="flex items-center gap-1 font-mono text-[#F8FAFC]">
                            <MessageSquare className="w-3 h-3 text-[#64748B]" />
                            {evt.channel}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Raw JSON Telemetry Record */}
          <div>
            <h4 className="text-xs font-semibold text-[#F8FAFC] mb-2">
              Raw Telemetry Record Payload
            </h4>

            <pre className="p-3.5 rounded-md bg-[#0A0D12] border border-[#283446] text-[11px] font-mono text-[#94A3B8] overflow-x-auto leading-relaxed shadow-sm">
              <code>{JSON.stringify(rawEvents, null, 2)}</code>
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#1E2633] bg-[#0A0D12] flex items-center justify-between">
          <span className="text-[11px] text-[#94A3B8] font-mono">
            Citation ID: <code className="text-[#F8FAFC]">{item.source}</code>
          </span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-md bg-[#18202C] hover:bg-[#1D2635] border border-[#283446] text-xs font-medium text-[#F8FAFC] transition-colors"
          >
            Close (Esc)
          </button>
        </div>
      </div>
    </div>
  );
};
