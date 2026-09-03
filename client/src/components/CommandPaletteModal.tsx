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
      <div className="relative w-full max-w-md bg-[#161B22] border border-[#30363D] rounded-md shadow-2xl z-10 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#30363D] bg-[#0D1117] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-[#58A6FF]" />
            <h3 className="text-xs font-semibold text-[#F0F6FC] uppercase tracking-wide">
              On-Call Operational Shortcuts
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded bg-[#21262D] hover:bg-[#30363D] text-[#8B949E] hover:text-[#F0F6FC] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="p-4 divide-y divide-[#21262D] text-xs font-sans">
          {shortcuts.map((sc) => (
            <div key={sc.key} className="py-2.5 flex items-center justify-between first:pt-1 last:pb-1">
              <span className="text-[#C9D1D9]">{sc.label}</span>
              <kbd className="px-2 py-0.5 rounded bg-[#0D1117] border border-[#30363D] font-mono text-[11px] text-[#58A6FF] font-semibold">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="px-5 py-2.5 border-t border-[#30363D] bg-[#0D1117] text-[11px] text-[#8B949E] text-center">
          Press <kbd className="px-1 py-0.2 rounded bg-[#161B22] border border-[#30363D] font-mono">?</kbd> anytime to toggle this cheat-sheet.
        </div>
      </div>
    </div>
  );
};
