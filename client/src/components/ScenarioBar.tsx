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
    <div className="bg-[#12171F] border border-[#1E2633] rounded-lg p-3 mb-5 shadow-console">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2.5">
        <span className="text-xs font-semibold text-[#F8FAFC]">
          Shift Test Scenarios
        </span>
        <span className="text-[11px] text-[#94A3B8] font-sans">
          Verify high-density triage, multi-shift carry forward, and hostile fault isolation
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {presets.map((preset) => {
          const isSelected = selectedScenario === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => onSelectScenario(preset.id)}
              disabled={disabled}
              className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                isSelected
                  ? 'bg-[#18202C] border-[#3B82F6] text-[#F8FAFC] font-semibold shadow-sm'
                  : 'bg-[#0A0D12] border-[#283446] text-[#94A3B8] hover:text-[#F8FAFC] hover:border-[#3B82F6]/50'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span>{preset.name.split('(')[0].trim()}</span>
              {preset.id === 'hostile' && (
                <span className="ml-1.5 text-[10px] px-1 py-0.2 rounded bg-[#F59E0B]/15 text-[#F59E0B] font-mono font-semibold">
                  FAULT
                </span>
              )}
            </button>
          );
        })}

        <button
          onClick={() => onSelectScenario('custom')}
          disabled={disabled}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
            selectedScenario === 'custom'
              ? 'bg-[#18202C] border-[#3B82F6] text-[#F8FAFC] font-semibold shadow-sm'
              : 'bg-[#0A0D12] border-[#283446] text-[#94A3B8] hover:text-[#F8FAFC] hover:border-[#3B82F6]/50'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Sliders className="w-3 h-3 text-[#94A3B8]" />
          <span>Custom Interval</span>
        </button>
      </div>
    </div>
  );
};
