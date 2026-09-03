import React, { useState } from 'react';
import { Download, FileText, RefreshCw, Check, Copy, Sun, Moon, Plus, Keyboard, Activity, Shield } from 'lucide-react';
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
    <header className="sticky top-0 z-40 bg-[#12171F]/95 backdrop-blur-md border-b border-[#1E2633] px-4 sm:px-8 py-3.5 shadow-console">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Brand Identity & Shift Relay Baton Metadata */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 min-w-0">
          {/* Logo / Console Identifier */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#18202C] border border-[#283446] flex items-center justify-center text-[#3B82F6] shadow-sm">
              <Shield className="w-4.5 h-4.5 fill-[#3B82F6]/20" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-lg text-[#F8FAFC] tracking-tight">
                  HANDOFF
                </span>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#3B82F6] tracking-wider uppercase block font-semibold">
                Shift Watch Log // Control Room
              </span>
            </div>
          </div>

          <div className="hidden sm:block text-[#283446] text-sm">|</div>

          {/* Outgoing to Incoming Relay Context */}
          <div className="flex items-center gap-2 text-xs sm:text-sm text-[#94A3B8]">
            <span>Outgoing: <strong className="text-[#F8FAFC] font-semibold">SRE Lead</strong></span>
            <span className="text-[#64748B]">→</span>
            <span>Incoming: <strong className="text-[#3B82F6] font-semibold">Primary On-Call</strong></span>
          </div>

          <div className="hidden xl:block text-[#283446] text-sm">|</div>

          {/* Shift Interval Pill */}
          <div className="flex items-center gap-2 font-mono text-xs text-[#94A3B8] bg-[#0A0D12] px-3 py-1.5 rounded-md border border-[#1E2633]">
            <Activity className="w-3.5 h-3.5 text-[#3B82F6]" />
            <span className="text-[#F8FAFC] font-bold">
              {shiftWindow.start.slice(11, 16)} - {shiftWindow.end.slice(11, 16)}
            </span>
            <span className="text-[#64748B]">({shiftWindow.timezone})</span>
          </div>

          {/* Checksum confirmation */}
          {reproducibilityHash && (
            <button
              onClick={copyHash}
              title="Copy complete SHA-256 reproducibility fingerprint"
              className="hidden md:flex items-center gap-2 font-mono text-xs text-[#94A3B8] hover:text-[#F8FAFC] bg-[#0A0D12] px-3 py-1.5 rounded-md border border-[#1E2633] transition-colors"
            >
              <span>Digest:</span>
              <span className="text-[#3B82F6] font-bold">{reproducibilityHash.substring(0, 8)}</span>
              {copiedHash ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : isMatched ? (
                <span className="text-emerald-400 font-bold text-[11px] px-1 rounded bg-emerald-500/10">100% MATCH</span>
              ) : (
                <Copy className="w-3 h-3 opacity-60" />
              )}
            </button>
          )}
        </div>

        {/* Right: Operational Actions (Larger & Tactile) */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Inject Event */}
          <button
            onClick={onOpenCustomEvent}
            title="Inject custom telemetry event into active shift (Hotkey: I)"
            className="flex items-center gap-2 px-3.5 py-2 rounded-md bg-[#18202C] hover:bg-[#1D2635] border border-[#283446] text-xs sm:text-sm font-medium text-[#F8FAFC] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 text-[#3B82F6]" />
            <span>Inject Event</span>
          </button>

          {/* Keyboard shortcuts */}
          <button
            onClick={onOpenCommandPalette}
            title="Operational keyboard shortcuts (Hotkey: ?)"
            className="p-2 rounded-md bg-[#18202C] hover:bg-[#1D2635] border border-[#283446] text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
          >
            <Keyboard className="w-4 h-4" />
          </button>

          {/* Export PDF */}
          <button
            onClick={handlePDF}
            disabled={isExportingPDF || isGenerating || itemCount === 0}
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-md bg-[#18202C] hover:bg-[#1D2635] border border-[#283446] text-xs sm:text-sm font-medium text-[#F8FAFC] transition-colors disabled:opacity-40 shadow-sm"
          >
            <Download className="w-4 h-4 text-[#94A3B8]" />
            <span>{isExportingPDF ? 'PDF...' : 'PDF'}</span>
          </button>

          {/* Export DOCX */}
          <button
            onClick={handleDOCX}
            disabled={isExportingDOCX || isGenerating || itemCount === 0}
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-md bg-[#18202C] hover:bg-[#1D2635] border border-[#283446] text-xs sm:text-sm font-medium text-[#F8FAFC] transition-colors disabled:opacity-40 shadow-sm"
          >
            <FileText className="w-4 h-4 text-[#94A3B8]" />
            <span>{isExportingDOCX ? 'DOCX...' : 'DOCX'}</span>
          </button>

          {/* Theme Switcher */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? "Switch to Day Mode" : "Switch to Night Mode"}
            className="p-2 rounded-md bg-[#18202C] hover:bg-[#1D2635] border border-[#283446] text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
          >
            {darkMode ? <Sun className="w-4 h-4 text-[#F59E0B]" /> : <Moon className="w-4 h-4 text-[#3B82F6]" />}
          </button>

          {/* Primary Action CTA (Bigger & Commanding) */}
          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 px-5 py-2.5 rounded-md text-xs sm:text-sm font-bold text-white bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] border border-[rgba(255,255,255,0.2)] shadow-md transition-all disabled:opacity-50 cursor-pointer"
          >
            {isGenerating && <RefreshCw className="w-4 h-4 animate-spin" />}
            <span>{isGenerating ? 'Compiling note...' : 'Generate handover note'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
