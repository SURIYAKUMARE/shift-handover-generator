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
    <div className="bg-[#121215] border border-white/[0.07] rounded-xl p-5 mb-8 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
            PIPELINE EXECUTION TRACE
          </h3>
        </div>
        {stats && (
          <div className="flex items-center gap-3 font-mono text-[11px] text-zinc-400">
            <span>Ingested: <strong className="text-zinc-200">{stats.total_raw_events}</strong></span>
            <span className="text-zinc-600">/</span>
            <span>In-Window: <strong className="text-blue-400">{stats.events_in_window}</strong></span>
            <span className="text-zinc-600">/</span>
            <span>Items: <strong className="text-emerald-400">{stats.deduplicated_items}</strong></span>
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
            <div key={idx} className="relative flex items-start gap-4 pb-5 group">
              {/* Connecting vertical line */}
              {!isLast && (
                <div
                  className={`absolute left-[13px] top-[26px] bottom-0 w-[1px] ${
                    isDone ? 'bg-emerald-500/30' : 'bg-white/[0.08]'
                  }`}
                />
              )}

              {/* Step indicator node */}
              <div className="relative z-10 shrink-0 mt-0.5">
                {isDone ? (
                  <div className="w-[26px] h-[26px] rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                ) : isRunning ? (
                  <div className="w-[26px] h-[26px] rounded-full bg-blue-500/10 border border-blue-500/40 flex items-center justify-center text-blue-400">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  </div>
                ) : isWarning ? (
                  <div className="w-[26px] h-[26px] rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <AlertCircle className="w-3.5 h-3.5" />
                  </div>
                ) : (
                  <div className="w-[26px] h-[26px] rounded-full bg-white/[0.03] border border-white/[0.1] flex items-center justify-center text-zinc-600">
                    <Circle className="w-2.5 h-2.5 fill-current" />
                  </div>
                )}
              </div>

              {/* Step details */}
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-xs font-medium ${
                      isDone
                        ? 'text-zinc-200'
                        : isRunning
                        ? 'text-blue-400 font-semibold'
                        : isWarning
                        ? 'text-amber-300 font-semibold'
                        : 'text-zinc-500'
                    }`}
                  >
                    {stage.stage}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500 shrink-0">
                    {new Date(stage.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5 font-mono leading-relaxed break-words">
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
