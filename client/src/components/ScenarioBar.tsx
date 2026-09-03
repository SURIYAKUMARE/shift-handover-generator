import React from 'react';
import { PresetScenario } from '../types';
import { Sliders } from 'lucide-react';

interface ScenarioBarProps {
  presets: PresetScenario[];
  selectedScenario: string;
  onSelectScenario: (id: string) => void;
  disabled?: boolean;
}

export const ScenarioBar: React.FC<ScenarioBarProps> = ({
  presets,
  selectedScenario,
  onSelectScenario,
  disabled,
}) => {
  return (
    <div className="bg-[#161B22] border border-[#30363D] rounded-md p-3 mb-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2">
        <span className="text-xs font-semibold text-[#F0F6FC]">
          Shift Test Scenarios
        </span>
        <span className="text-[11px] text-[#8B949E] font-sans">
          Verify layout density, progression collapse, and hostile fault isolation
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
              className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors ${
                isSelected
                  ? 'bg-[#21262D] border-[#8B949E] text-[#F0F6FC] font-semibold'
                  : 'bg-[#0D1117] border-[#30363D] text-[#8B949E] hover:text-[#F0F6FC] hover:border-[#6E7681]'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span>{preset.name.split('(')[0].trim()}</span>
              {preset.id === 'hostile' && (
                <span className="ml-1.5 text-[10px] px-1 py-0.2 rounded bg-[#D29922]/15 text-[#D29922] font-mono">
                  FAULT
                </span>
              )}
            </button>
          );
        })}

        <button
          onClick={() => onSelectScenario('custom')}
          disabled={disabled}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border transition-colors ${
            selectedScenario === 'custom'
              ? 'bg-[#21262D] border-[#8B949E] text-[#F0F6FC] font-semibold'
              : 'bg-[#0D1117] border-[#30363D] text-[#8B949E] hover:text-[#F0F6FC] hover:border-[#6E7681]'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Sliders className="w-3 h-3 text-[#8B949E]" />
          <span>Custom Interval</span>
        </button>
      </div>
    </div>
  );
};
