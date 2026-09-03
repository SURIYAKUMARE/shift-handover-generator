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
    <div className="bg-[#12171F] border border-[#1E2633] rounded-xl p-4 sm:p-5 mb-6 shadow-console">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <span className="text-xs sm:text-sm font-bold text-[#F8FAFC] uppercase tracking-wide">
          Shift Test Scenarios
        </span>
        <span className="text-xs text-[#94A3B8] font-sans">
          Verify high-density triage, multi-shift carry forward, and hostile fault isolation
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {presets.map((preset) => {
          const isSelected = selectedScenario === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => onSelectScenario(preset.id)}
              disabled={disabled}
              className={`px-4 py-2 rounded-md text-xs sm:text-sm font-semibold border transition-all ${
                isSelected
                  ? 'bg-[#18202C] border-[#3B82F6] text-[#F8FAFC] shadow-sm'
                  : 'bg-[#0A0D12] border-[#283446] text-[#94A3B8] hover:text-[#F8FAFC] hover:border-[#3B82F6]'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span>{preset.name.split('(')[0].trim()}</span>
              {preset.id === 'hostile' && (
                <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-[#F59E0B]/20 text-[#F59E0B] font-mono font-bold">
                  FAULT
                </span>
              )}
            </button>
          );
        })}

        <button
          onClick={() => onSelectScenario('custom')}
          disabled={disabled}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs sm:text-sm font-semibold border transition-all ${
            selectedScenario === 'custom'
              ? 'bg-[#18202C] border-[#3B82F6] text-[#F8FAFC] shadow-sm'
              : 'bg-[#0A0D12] border-[#283446] text-[#94A3B8] hover:text-[#F8FAFC] hover:border-[#3B82F6]'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Sliders className="w-4 h-4 text-[#94A3B8]" />
          <span>Custom Interval</span>
        </button>
      </div>
    </div>
  );
};
