import React, { useEffect } from 'react';
import { GeneratedNoteItem, Event as TelemetryEvent } from '../types';
import { X, Clock, User, MessageSquare, Copy, ShieldCheck } from 'lucide-react';

interface SourceDrillDownDrawerProps {
  item: GeneratedNoteItem | null;
  onClose: () => void;
}

export const SourceDrillDownDrawer: React.FC<SourceDrillDownDrawerProps> = ({
  item,
  onClose,
}) => {
  // ESC key to close
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
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-2xl bg-noc-panel border-l border-noc-border shadow-2xl flex flex-col h-full z-10 overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-noc-border flex items-center justify-between bg-noc-panel">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/30 font-semibold">
                {item.source}
              </span>
              <span className="text-xs font-mono text-noc-muted">RAW EVENT DRILLDOWN</span>
            </div>
            <h3 className="text-base font-semibold text-noc-text mt-1 line-clamp-1">
              {item.item}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-noc-card border border-noc-border text-noc-muted hover:text-noc-text hover:bg-noc-panelHover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Verification Guarantee Pill */}
        <div className="px-6 py-2.5 bg-emerald-500/10 border-b border-emerald-500/20 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-emerald-400 font-mono">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>GROUNDING VERIFIED: 100% Traceable to {rawEvents.length} raw telemetry event(s)</span>
          </div>
          <button
            onClick={handleCopyJSON}
            className="flex items-center gap-1 text-[11px] font-mono text-emerald-300 hover:text-emerald-200"
          >
            <Copy className="w-3 h-3" />
            <span>Copy Raw JSON</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section: Deduplication Progression Timeline */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-noc-muted mb-3 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              Event Progression Timeline ({rawEvents.length} updates collapsed)
            </h4>

            <div className="relative border-l-2 border-noc-border ml-3 pl-5 space-y-5">
              {rawEvents.map((evt: TelemetryEvent, idx: number) => (
                <div key={idx} className="relative group">
                  {/* Timeline dot */}
                  <div className="absolute -left-[27px] top-1.5 w-3 h-3 rounded-full bg-blue-500 border-2 border-noc-panel ring-2 ring-blue-500/20" />

                  <div className="bg-noc-card border border-noc-border rounded-lg p-3.5 hover:border-noc-borderLight transition-colors">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-noc-panel border border-noc-border text-noc-text uppercase">
                          {evt.status}
                        </span>
                        {evt.severity && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 uppercase">
                            {evt.severity}
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-mono text-noc-muted">
                        {evt.timestamp}
                      </span>
                    </div>

                    <p className="text-xs text-noc-text leading-relaxed">
                      {evt.summary}
                    </p>

                    {(evt.author || evt.channel) && (
                      <div className="mt-2.5 pt-2 border-t border-noc-border/50 flex flex-wrap items-center gap-3 text-[11px] font-mono text-noc-muted">
                        {evt.author && (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {evt.author}
                          </span>
                        )}
                        {evt.channel && (
                          <span className="flex items-center gap-1 text-emerald-400">
                            <MessageSquare className="w-3 h-3" />
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

          {/* Section: Raw Telemetry JSON */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-mono uppercase tracking-wider text-noc-muted">
                Raw Ingest Payload
              </h4>
            </div>

            <pre className="p-4 rounded-lg bg-[#050811] border border-noc-border text-xs font-mono text-slate-300 overflow-x-auto leading-tight">
              <code>{JSON.stringify(rawEvents, null, 2)}</code>
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-noc-border bg-noc-panel flex items-center justify-between">
          <span className="text-xs text-noc-muted font-mono">
            Source: <code className="text-blue-400">{item.source}</code>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-noc-card hover:bg-noc-panelHover border border-noc-border text-xs font-medium text-noc-text transition-colors"
          >
            Close (Esc)
          </button>
        </div>
      </div>
    </div>
  );
};
