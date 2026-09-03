import React, { useEffect, useState } from 'react';
import { GeneratedNoteItem, Event as TelemetryEvent } from '../types';
import { X, Clock, User, MessageSquare, Copy, Check, ShieldCheck } from 'lucide-react';

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
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-2xl bg-[#161B22] border-l border-[#30363D] shadow-2xl flex flex-col h-full z-10 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#30363D] flex items-center justify-between bg-[#0D1117]">
          <div className="min-w-0 pr-4">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#161B22] border border-[#30363D] text-[#58A6FF] font-semibold">
                {item.source}
              </span>
              <span className="text-[11px] text-[#8B949E] font-sans">
                Evidence Docket Inspection
              </span>
            </div>
            <h3 className="text-sm font-semibold text-[#F0F6FC] truncate">
              {item.item}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded bg-[#21262D] hover:bg-[#30363D] text-[#8B949E] hover:text-[#F0F6FC] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Grounding Verification Seal */}
        <div className="px-5 py-2.5 bg-[#0D1117] border-b border-[#21262D] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-[#3FB950] font-sans">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Traceability: Grounded in {rawEvents.length} telemetry event(s) logged by upstream system</span>
          </div>
          <button
            onClick={handleCopyJSON}
            className="flex items-center gap-1 text-[11px] font-mono text-[#8B949E] hover:text-[#F0F6FC] transition-colors"
          >
            {copied ? <Check className="w-3 h-3 text-[#3FB950]" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy JSON'}</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Progression Timeline */}
          <div>
            <h4 className="text-xs font-semibold text-[#F0F6FC] mb-3 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#58A6FF]" />
              Event Timeline Before Deduplication ({rawEvents.length} updates)
            </h4>

            <div className="relative border-l border-[#30363D] ml-2.5 pl-4 space-y-3">
              {rawEvents.map((evt: TelemetryEvent, idx: number) => (
                <div key={idx} className="relative">
                  {/* Timeline node mark */}
                  <div className="absolute -left-[21px] top-2.5 w-2 h-2 rounded-full bg-[#58A6FF] ring-4 ring-[#161B22]" />

                  <div className="bg-[#0D1117] border border-[#30363D] rounded p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono uppercase px-1.5 py-0.2 rounded bg-[#161B22] border border-[#30363D] text-[#C9D1D9]">
                          {evt.status}
                        </span>
                        {evt.severity && (
                          <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-[#D29922]/15 text-[#D29922] border border-[#D29922]/30">
                            {evt.severity}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-[#8B949E]">
                        {evt.timestamp}
                      </span>
                    </div>

                    <p className="text-xs text-[#F0F6FC] leading-relaxed font-sans">
                      {evt.summary}
                    </p>

                    {(evt.author || evt.channel) && (
                      <div className="mt-2 pt-2 border-t border-[#21262D] flex flex-wrap items-center gap-3 text-[11px] text-[#8B949E]">
                        {evt.author && (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3 text-[#6E7681]" />
                            {evt.author}
                          </span>
                        )}
                        {evt.channel && (
                          <span className="flex items-center gap-1 font-mono text-[#C9D1D9]">
                            <MessageSquare className="w-3 h-3 text-[#6E7681]" />
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

          {/* Raw JSON Telemetry */}
          <div>
            <h4 className="text-xs font-semibold text-[#F0F6FC] mb-2">
              Raw Telemetry Record Payload
            </h4>

            <pre className="p-3 rounded bg-[#0D1117] border border-[#30363D] text-[11px] font-mono text-[#8B949E] overflow-x-auto leading-relaxed">
              <code>{JSON.stringify(rawEvents, null, 2)}</code>
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#30363D] bg-[#0D1117] flex items-center justify-between">
          <span className="text-[11px] text-[#8B949E] font-mono">
            Citation ID: <code className="text-[#F0F6FC]">{item.source}</code>
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-[#21262D] hover:bg-[#30363D] border border-[#30363D] text-xs font-medium text-[#F0F6FC] transition-colors"
          >
            Close (Esc)
          </button>
        </div>
      </div>
    </div>
  );
};
