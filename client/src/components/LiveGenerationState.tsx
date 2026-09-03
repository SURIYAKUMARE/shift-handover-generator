import React from 'react';
import { GenerationStageLog } from '../types';
import { CheckCircle2, AlertTriangle, Loader2, Clock, Terminal } from 'lucide-react';

interface LiveGenerationStateProps {
  stageLogs: GenerationStageLog[];
  isGenerating: boolean;
  stats?: {
    total_raw_events: number;
    events_in_window: number;
    deduplicated_items: number;
  };
}

export const LiveGenerationState: React.FC<LiveGenerationStateProps> = ({
  stageLogs,
  isGenerating,
  stats,
}) => {
  if (stageLogs.length === 0 && !isGenerating) {
    return null;
  }

  const getStatusIcon = (status: GenerationStageLog['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
      case 'running':
        return <Loader2 className="w-4 h-4 text-blue-400 animate-spin shrink-0" />;
      default:
        return <Clock className="w-4 h-4 text-slate-500 shrink-0" />;
    }
  };

  return (
    <div className="bg-noc-panel border border-noc-border rounded-xl p-5 mb-8 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-noc-border mb-4">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-semibold font-mono text-noc-text">
            PIPELINE EXECUTION TRACE
          </h3>
        </div>
        {isGenerating && (
          <span className="flex items-center gap-1.5 text-xs text-blue-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
            ACTIVE GENERATION STAGE
          </span>
        )}
      </div>

      {/* Metrics Summary Strip if stats available */}
      {stats && (
        <div className="grid grid-cols-3 gap-3 mb-4 p-3 rounded-lg bg-noc-card border border-noc-border font-mono text-xs">
          <div>
            <span className="text-noc-muted block text-[11px]">RAW INGESTED</span>
            <span className="text-base font-semibold text-noc-text">{stats.total_raw_events}</span>
          </div>
          <div>
            <span className="text-noc-muted block text-[11px]">IN-WINDOW [start, end)</span>
            <span className="text-base font-semibold text-blue-400">{stats.events_in_window}</span>
          </div>
          <div>
            <span className="text-noc-muted block text-[11px]">DEDUP COLLAPSED</span>
            <span className="text-base font-semibold text-emerald-400">{stats.deduplicated_items}</span>
          </div>
        </div>
      )}

      {/* Step logs stream */}
      <div className="space-y-2 font-mono text-xs max-h-56 overflow-y-auto pr-1">
        {stageLogs.map((log, idx) => (
          <div
            key={log.id || idx}
            className={`flex items-start gap-3 p-2 rounded-md transition-colors ${
              log.status === 'running'
                ? 'bg-blue-600/10 border border-blue-500/20'
                : log.status === 'warning'
                ? 'bg-amber-500/10 border border-amber-500/20'
                : 'hover:bg-noc-panelHover'
            }`}
          >
            <div className="mt-0.5">{getStatusIcon(log.status)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-noc-text">{log.stage}</span>
                <span className="text-[10px] text-noc-muted shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p
                className={`mt-0.5 break-words ${
                  log.status === 'warning' ? 'text-amber-300' : 'text-noc-muted'
                }`}
              >
                {log.message}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
