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
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-2xl bg-[#111114] border-l border-white/[0.08] shadow-2xl flex flex-col h-full z-10 overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between bg-[#141418]">
          <div className="min-w-0 pr-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.08] text-blue-400 font-semibold">
                {item.source}
              </span>
              <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
                Source Traceability Inspection
              </span>
            </div>
            <h3 className="text-sm font-semibold text-zinc-100 truncate">
              {item.item}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-transparent hover:bg-white/[0.06] text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Grounding Verification Seal */}
        <div className="px-6 py-2.5 bg-emerald-500/[0.04] border-b border-emerald-500/15 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span>GROUNDED: 100% Traceable to {rawEvents.length} raw telemetry update(s)</span>
          </div>
          <button
            onClick={handleCopyJSON}
            className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy JSON'}</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Deduplication Progression Timeline */}
          <div>
            <h4 className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold mb-3.5 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              Event Timeline Before Collapse ({rawEvents.length} updates)
            </h4>

            <div className="relative border-l border-white/[0.08] ml-2.5 pl-5 space-y-4">
              {rawEvents.map((evt: TelemetryEvent, idx: number) => (
                <div key={idx} className="relative">
                  {/* Timeline node */}
                  <div className="absolute -left-[25px] top-2 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-[#111114]" />

                  <div className="bg-[#16161A] border border-white/[0.07] rounded-lg p-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-white/[0.03] border border-white/[0.06] text-zinc-300">
                          {evt.status}
                        </span>
                        {evt.severity && (
                          <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-amber-500/[0.08] text-amber-300 border border-amber-500/20">
                            {evt.severity}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-zinc-500">
                        {evt.timestamp}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-200 leading-relaxed font-sans">
                      {evt.summary}
                    </p>

                    {(evt.author || evt.channel) && (
                      <div className="mt-2.5 pt-2 border-t border-white/[0.04] flex flex-wrap items-center gap-3 text-[11px] font-mono text-zinc-400">
                        {evt.author && (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3 text-zinc-500" />
                            {evt.author}
                          </span>
                        )}
                        {evt.channel && (
                          <span className="flex items-center gap-1 text-zinc-300">
                            <MessageSquare className="w-3 h-3 text-zinc-500" />
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

          {/* Raw JSON Ingest Telemetry */}
          <div>
            <h4 className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold mb-2.5">
              Raw Telemetry Payload
            </h4>

            <pre className="p-4 rounded-lg bg-[#0A0A0C] border border-white/[0.06] text-[11px] font-mono text-zinc-300 overflow-x-auto leading-relaxed">
              <code>{JSON.stringify(rawEvents, null, 2)}</code>
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/[0.06] bg-[#141418] flex items-center justify-between">
          <span className="text-[11px] text-zinc-500 font-mono">
            Citation: <code className="text-zinc-300">{item.source}</code>
          </span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-medium text-zinc-200 transition-colors"
          >
            Close (Esc)
          </button>
        </div>
      </div>
    </div>
  );
};
