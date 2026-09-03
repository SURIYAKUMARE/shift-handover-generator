import React, { useState } from 'react';
import { Download, FileText, RefreshCw, Check, Copy, Sun, Moon, Plus, Keyboard, Activity } from 'lucide-react';
import { ShiftWindow } from '../types';

interface HeaderProps {
  shiftWindow: ShiftWindow;
  isGenerating: boolean;
  onGenerate: () => void;
  onExportPDF: () => Promise<void>;
  onExportDOCX: () => Promise<void>;
  onOpenCustomEvent: () => void;
  onOpenCommandPalette: () => void;
  reproducibilityHash?: string;
  previousHash?: string;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  itemCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  shiftWindow,
  isGenerating,
  onGenerate,
  onExportPDF,
  onExportDOCX,
  onOpenCustomEvent,
  onOpenCommandPalette,
  reproducibilityHash,
  previousHash,
  darkMode,
  setDarkMode,
  itemCount,
}) => {
  const [copiedHash, setCopiedHash] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingDOCX, setIsExportingDOCX] = useState(false);

  const handlePDF = async () => {
    try {
      setIsExportingPDF(true);
      await onExportPDF();
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleDOCX = async () => {
    try {
      setIsExportingDOCX(true);
      await onExportDOCX();
    } finally {
      setIsExportingDOCX(false);
    }
  };

  const copyHash = () => {
    if (!reproducibilityHash) return;
    navigator.clipboard.writeText(reproducibilityHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const isMatched = previousHash && reproducibilityHash && previousHash === reproducibilityHash;

  return (
    <header className="sticky top-0 z-40 bg-[#12171F]/95 backdrop-blur-md border-b border-[#1E2633] px-4 sm:px-6 py-2.5 shadow-console">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Relay Watch Log Identity & Baton Framing */}
        <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5 min-w-0 text-xs">
          {/* NOC Heartbeat Beacon */}
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="font-semibold text-sm text-[#F8FAFC] tracking-tight">
              Shift Watch Log
            </span>
          </div>

          <div className="hidden sm:block text-[#283446]">/</div>

          {/* Outgoing to Incoming Relay Context */}
          <div className="flex items-center gap-2 text-[#94A3B8]">
            <span>Outgoing: <strong className="text-[#F8FAFC] font-medium">SRE Lead</strong></span>
            <span className="text-[#64748B]">transfers to</span>
            <span>Incoming: <strong className="text-[#3B82F6] font-medium">Primary On-Call</strong></span>
          </div>

          <div className="hidden md:block text-[#283446]">/</div>

          {/* Shift Interval Pill */}
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#94A3B8] bg-[#0A0D12] px-2.5 py-1 rounded border border-[#1E2633]">
            <Activity className="w-3 h-3 text-[#3B82F6]" />
            <span className="text-[#F8FAFC] font-semibold">
              {shiftWindow.start.slice(11, 16)} - {shiftWindow.end.slice(11, 16)}
            </span>
            <span className="text-[#64748B]">({shiftWindow.timezone})</span>
          </div>

          {/* Checksum confirmation */}
          {reproducibilityHash && (
            <button
              onClick={copyHash}
              title="Copy SHA-256 reproducibility fingerprint"
              className="hidden lg:flex items-center gap-1.5 font-mono text-[11px] text-[#94A3B8] hover:text-[#F8FAFC] bg-[#0A0D12] px-2.5 py-1 rounded border border-[#1E2633] transition-colors"
            >
              <span>Digest:</span>
              <span className="text-[#3B82F6] font-semibold">{reproducibilityHash.substring(0, 8)}</span>
              {copiedHash ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : isMatched ? (
                <span className="text-emerald-400 font-semibold text-[10px]">100% MATCH</span>
              ) : (
                <Copy className="w-2.5 h-2.5 opacity-60" />
              )}
            </button>
          )}
        </div>

        {/* Right: Operational Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Inject Event */}
          <button
            onClick={onOpenCustomEvent}
            title="Inject custom telemetry event into active shift (Hotkey: I)"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#18202C] hover:bg-[#1D2635] border border-[#283446] text-xs font-medium text-[#F8FAFC] transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-[#3B82F6]" />
            <span>Inject Event</span>
          </button>

          {/* Keyboard shortcuts */}
          <button
            onClick={onOpenCommandPalette}
            title="Operational keyboard shortcuts (Hotkey: ?)"
            className="p-1.5 rounded-md bg-[#18202C] hover:bg-[#1D2635] border border-[#283446] text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
          >
            <Keyboard className="w-3.5 h-3.5" />
          </button>

          {/* Export PDF */}
          <button
            onClick={handlePDF}
            disabled={isExportingPDF || isGenerating || itemCount === 0}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#18202C] hover:bg-[#1D2635] border border-[#283446] text-xs font-medium text-[#F8FAFC] transition-colors disabled:opacity-40 shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-[#94A3B8]" />
            <span>{isExportingPDF ? 'PDF...' : 'PDF'}</span>
          </button>

          {/* Export DOCX */}
          <button
            onClick={handleDOCX}
            disabled={isExportingDOCX || isGenerating || itemCount === 0}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#18202C] hover:bg-[#1D2635] border border-[#283446] text-xs font-medium text-[#F8FAFC] transition-colors disabled:opacity-40 shadow-sm"
          >
            <FileText className="w-3.5 h-3.5 text-[#94A3B8]" />
            <span>{isExportingDOCX ? 'DOCX...' : 'DOCX'}</span>
          </button>

          {/* Theme Switcher */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? "Switch to Day Mode" : "Switch to Night Mode"}
            className="p-1.5 rounded-md bg-[#18202C] hover:bg-[#1D2635] border border-[#283446] text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
          >
            {darkMode ? <Sun className="w-3.5 h-3.5 text-[#F59E0B]" /> : <Moon className="w-3.5 h-3.5 text-[#3B82F6]" />}
          </button>

          {/* Primary Action Button */}
          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] border border-[rgba(255,255,255,0.15)] shadow-md transition-all disabled:opacity-50 cursor-pointer"
          >
            {isGenerating && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            <span>{isGenerating ? 'Compiling note...' : 'Generate handover note'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
