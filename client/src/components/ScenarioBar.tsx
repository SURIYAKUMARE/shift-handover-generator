import React from 'react';
import { PresetScenario } from '../types';
import { Sparkles, Check, Clock, AlertTriangle, Shield, Sliders } from 'lucide-react';

interface ScenarioBarProps {
  presets: PresetScenario[];
  selectedScenario: string;
  onSelectScenario: (id: string) => void;
  disabled?: boolean;
}

const SCENARIO_ICONS: Record<string, React.ReactNode> = {
  busy: <Sparkles className="w-3.5 h-3.5 text-blue-400" />,
  quiet: <Check className="w-3.5 h-3.5 text-emerald-400" />,
  messy: <Clock className="w-3.5 h-3.5 text-amber-400" />,
  hostile: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
  zero: <Shield className="w-3.5 h-3.5 text-zinc-400" />,
};

export const ScenarioBar: React.FC<ScenarioBarProps> = ({
  presets,
  selectedScenario,
  onSelectScenario,
  disabled,
}) => {
  return (
    <div className="bg-[#121215] border border-white/[0.07] rounded-xl p-3.5 mb-6 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2.5">
        <span className="text-[11px] uppercase tracking-wider font-mono text-zinc-400 font-semibold">
          Shift Test Scenarios
        </span>
        <span className="text-[11px] text-zinc-400 font-mono hidden sm:inline">
          Deduplication stress • Empty states • Hostile fault recovery
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {presets.map((preset) => {
          const isSelected = selectedScenario === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => onSelectScenario(preset.id)}
              disabled={disabled}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                isSelected
                  ? 'bg-white/[0.08] border-white/[0.18] text-white shadow-sm'
                  : 'bg-transparent border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {SCENARIO_ICONS[preset.id] || <Sliders className="w-3.5 h-3.5" />}
              <span>{preset.name.split('(')[0].trim()}</span>
              {preset.id === 'hostile' && (
                <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/[0.1] text-amber-300 font-mono">
                  FAULT
                </span>
              )}
            </button>
          );
        })}

        <button
          onClick={() => onSelectScenario('custom')}
          disabled={disabled}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
            selectedScenario === 'custom'
              ? 'bg-white/[0.08] border-white/[0.18] text-white shadow-sm'
              : 'bg-transparent border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Sliders className="w-3.5 h-3.5 text-zinc-500" />
          <span>Custom Interval</span>
        </button>
      </div>
    </div>
  );
};
