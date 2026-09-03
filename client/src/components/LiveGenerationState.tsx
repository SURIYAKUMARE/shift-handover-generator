import React from 'react';
import { GenerationStageLog } from '../types';
import { Check, Loader2, AlertCircle, Circle } from 'lucide-react';

interface LiveGenerationStateProps {
  stageLogs: GenerationStageLog[];
  isGenerating: boolean;
  stats?: {
    total_raw_events: number;
    events_in_window: number;
    deduplicated_items: number;
    carried_forward_items?: number;
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

  // Deduplicate stages for the vertical stepper view
  const stagesMap = new Map<string, GenerationStageLog>();
  for (const log of stageLogs) {
    stagesMap.set(log.stage, log);
  }
  const stages = Array.from(stagesMap.values());

  return (
    <div className="bg-[#12171F] border border-[#1E2633] rounded-lg p-4 mb-5 shadow-console">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-[#1E2633] gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
          <h3 className="text-xs font-semibold text-[#F8FAFC] uppercase tracking-wide">
            Telemetry Compilation & Trace
          </h3>
        </div>
        {stats && (
          <div className="flex flex-wrap items-center gap-2.5 font-mono text-[11px] text-[#94A3B8]">
            <span>Raw Ingested: <strong className="text-[#F8FAFC]">{stats.total_raw_events}</strong></span>
            <span className="text-[#283446]">/</span>
            <span>In-Window: <strong className="text-[#3B82F6]">{stats.events_in_window}</strong></span>
            <span className="text-[#283446]">/</span>
            <span>Collapsed: <strong className="text-emerald-400">{stats.deduplicated_items}</strong></span>
            {stats.carried_forward_items !== undefined && stats.carried_forward_items > 0 && (
              <>
                <span className="text-[#283446]">/</span>
                <span>Held Over: <strong className="text-[#F59E0B]">{stats.carried_forward_items}</strong></span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Vertical Stepper */}
      <div className="relative pl-1">
        {stages.map((stage, idx) => {
          const isLast = idx === stages.length - 1;
          const isDone = stage.status === 'completed';
          const isRunning = stage.status === 'running' || (isGenerating && isLast);
          const isWarning = stage.status === 'warning';

          return (
            <div key={idx} className="relative flex items-start gap-3.5 pb-3.5 last:pb-1">
              {/* Connecting vertical line */}
              {!isLast && (
                <div
                  className={`absolute left-[11px] top-[22px] bottom-0 w-[1px] ${
                    isDone ? 'bg-emerald-500/30' : 'bg-[#283446]'
                  }`}
                />
              )}

              {/* Step indicator node */}
              <div className="relative z-10 shrink-0 mt-0.5">
                {isDone ? (
                  <div className="w-[22px] h-[22px] rounded-full bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <Check className="w-3 h-3 stroke-[2.5]" />
                  </div>
                ) : isRunning ? (
                  <div className="w-[22px] h-[22px] rounded-full bg-[#3B82F6]/10 border border-[#3B82F6]/40 flex items-center justify-center text-[#3B82F6]">
                    <Loader2 className="w-3 h-3 animate-spin" />
                  </div>
                ) : isWarning ? (
                  <div className="w-[22px] h-[22px] rounded-full bg-[#F59E0B]/10 border border-[#F59E0B]/40 flex items-center justify-center text-[#F59E0B]">
                    <AlertCircle className="w-3 h-3" />
                  </div>
                ) : (
                  <div className="w-[22px] h-[22px] rounded-full bg-[#0A0D12] border border-[#283446] flex items-center justify-center text-[#64748B]">
                    <Circle className="w-2 h-2 fill-current" />
                  </div>
                )}
              </div>

              {/* Step details */}
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-xs font-medium ${
                      isDone
                        ? 'text-[#F8FAFC]'
                        : isRunning
                        ? 'text-[#3B82F6] font-semibold'
                        : isWarning
                        ? 'text-[#F59E0B] font-semibold'
                        : 'text-[#94A3B8]'
                    }`}
                  >
                    {stage.stage}
                  </span>
                  <span className="text-[10px] font-mono text-[#64748B] shrink-0">
                    {new Date(stage.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-xs text-[#94A3B8] mt-0.5 font-mono leading-relaxed break-words">
                  {stage.message}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
