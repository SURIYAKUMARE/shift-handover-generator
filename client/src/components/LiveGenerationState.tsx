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
    <div className="bg-[#161B22] border border-[#30363D] rounded-md p-4 mb-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-[#30363D] gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#58A6FF]" />
          <h3 className="text-xs font-semibold text-[#F0F6FC] uppercase tracking-wide">
            Telemetry Ingestion & Compilation Trace
          </h3>
        </div>
        {stats && (
          <div className="flex items-center gap-3 font-mono text-[11px] text-[#8B949E]">
            <span>Ingested: <strong className="text-[#F0F6FC]">{stats.total_raw_events}</strong></span>
            <span className="text-[#6E7681]">/</span>
            <span>In-Window: <strong className="text-[#58A6FF]">{stats.events_in_window}</strong></span>
            <span className="text-[#6E7681]">/</span>
            <span>Deduplicated: <strong className="text-[#3FB950]">{stats.deduplicated_items}</strong></span>
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
            <div key={idx} className="relative flex items-start gap-3.5 pb-4 last:pb-1">
              {/* Connecting vertical line */}
              {!isLast && (
                <div
                  className={`absolute left-[11px] top-[22px] bottom-0 w-[1px] ${
                    isDone ? 'bg-[#3FB950]/30' : 'bg-[#30363D]'
                  }`}
                />
              )}

              {/* Step indicator node */}
              <div className="relative z-10 shrink-0 mt-0.5">
                {isDone ? (
                  <div className="w-[22px] h-[22px] rounded-full bg-[#3FB950]/10 border border-[#3FB950]/40 flex items-center justify-center text-[#3FB950]">
                    <Check className="w-3 h-3 stroke-[2.5]" />
                  </div>
                ) : isRunning ? (
                  <div className="w-[22px] h-[22px] rounded-full bg-[#58A6FF]/10 border border-[#58A6FF]/40 flex items-center justify-center text-[#58A6FF]">
                    <Loader2 className="w-3 h-3 animate-spin" />
                  </div>
                ) : isWarning ? (
                  <div className="w-[22px] h-[22px] rounded-full bg-[#D29922]/10 border border-[#D29922]/40 flex items-center justify-center text-[#D29922]">
                    <AlertCircle className="w-3 h-3" />
                  </div>
                ) : (
                  <div className="w-[22px] h-[22px] rounded-full bg-[#0D1117] border border-[#30363D] flex items-center justify-center text-[#6E7681]">
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
                        ? 'text-[#C9D1D9]'
                        : isRunning
                        ? 'text-[#58A6FF] font-semibold'
                        : isWarning
                        ? 'text-[#D29922] font-semibold'
                        : 'text-[#8B949E]'
                    }`}
                  >
                    {stage.stage}
                  </span>
                  <span className="text-[10px] font-mono text-[#6E7681] shrink-0">
                    {new Date(stage.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-xs text-[#8B949E] mt-0.5 font-mono leading-relaxed break-words">
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
