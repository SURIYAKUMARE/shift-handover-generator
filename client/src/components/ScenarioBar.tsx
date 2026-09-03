import React from 'react';
import { PresetScenario } from '../types';
import { Sparkles, AlertTriangle, CheckCircle2, Clock, ShieldAlert, Sliders } from 'lucide-react';

interface ScenarioBarProps {
  presets: PresetScenario[];
  selectedScenario: string;
  onSelectScenario: (id: string) => void;
  disabled?: boolean;
}

const SCENARIO_ICONS: Record<string, React.ReactNode> = {
  busy: <Sparkles className="w-3.5 h-3.5 text-blue-400" />,
  quiet: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
  messy: <Clock className="w-3.5 h-3.5 text-purple-400" />,
  hostile: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
  zero: <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />,
};

export const ScenarioBar: React.FC<ScenarioBarProps> = ({
  presets,
  selectedScenario,
  onSelectScenario,
  disabled,
}) => {
  return (
    <div className="bg-noc-panel border border-noc-border rounded-xl p-4 mb-6 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
        <div>
          <span className="text-xs uppercase font-mono tracking-wider text-noc-muted">
            Shift Scenario Presets (Test Matrices)
          </span>
          <p className="text-xs text-noc-muted mt-0.5">
            Select a verified shift profile to inspect layout density, deduplication collapse, or hostile input handling.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => {
          const isSelected = selectedScenario === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => onSelectScenario(preset.id)}
              disabled={disabled}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                isSelected
                  ? 'bg-blue-600/15 border-blue-500 text-blue-400 shadow-sm'
                  : 'bg-noc-card/70 border-noc-border text-noc-muted hover:text-noc-text hover:bg-noc-panelHover'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {SCENARIO_ICONS[preset.id] || <Sliders className="w-3.5 h-3.5" />}
              <span>{preset.name.split('(')[0].trim()}</span>
              {preset.id === 'hostile' && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">
                  RESILIENCE
                </span>
              )}
            </button>
          );
        })}

        <button
          onClick={() => onSelectScenario('custom')}
          disabled={disabled}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
            selectedScenario === 'custom'
              ? 'bg-blue-600/15 border-blue-500 text-blue-400 shadow-sm'
              : 'bg-noc-card/70 border-noc-border text-noc-muted hover:text-noc-text hover:bg-noc-panelHover'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Sliders className="w-3.5 h-3.5 text-slate-400" />
          <span>Custom Shift Window</span>
        </button>
      </div>
    </div>
  );
};
