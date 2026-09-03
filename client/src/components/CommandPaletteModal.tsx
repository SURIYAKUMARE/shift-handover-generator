import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'G', label: 'Generate / compile handover note' },
    { key: 'P', label: 'Export as executive PDF document' },
    { key: 'W', label: 'Export as Microsoft Word DOCX' },
    { key: 'M', label: 'Copy pre-formatted Markdown for Slack / Teams' },
    { key: 'I', label: 'Inject custom live telemetry event' },
    { key: 'S', label: 'Open two-party handover sign-off modal' },
    { key: '1', label: 'Filter: Blockers & Escalations only' },
    { key: '2', label: 'Filter: In Progress only' },
    { key: '3', label: 'Filter: Completed only' },
    { key: '4', label: 'Filter: Watch-list only' },
    { key: 'Esc', label: 'Close active drawer or modal' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/75 backdrop-blur-xs" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-[#12171F] border border-[#1E2633] rounded-lg shadow-2xl z-10 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#1E2633] bg-[#0A0D12] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-[#3B82F6]" />
            <h3 className="text-xs font-semibold text-[#F8FAFC] uppercase tracking-wide">
              On-Call Operational Shortcuts
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md bg-[#18202C] hover:bg-[#1D2635] text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="p-4 divide-y divide-[#18202C] text-xs font-sans">
          {shortcuts.map((sc) => (
            <div key={sc.key} className="py-2 flex items-center justify-between first:pt-1 last:pb-1">
              <span className="text-[#F8FAFC]">{sc.label}</span>
              <kbd className="px-2 py-0.5 rounded bg-[#0A0D12] border border-[#283446] font-mono text-[11px] text-[#3B82F6] font-semibold">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="px-5 py-2.5 border-t border-[#1E2633] bg-[#0A0D12] text-[11px] text-[#94A3B8] text-center">
          Press <kbd className="px-1.5 py-0.5 rounded bg-[#18202C] border border-[#283446] font-mono text-[#F8FAFC]">?</kbd> anytime to toggle this cheat-sheet.
        </div>
      </div>
    </div>
  );
};
