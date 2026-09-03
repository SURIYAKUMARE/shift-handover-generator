import React, { useState } from 'react';
import { Play, Download, FileText, RefreshCw, CheckCircle2, Copy, Sun, Moon, Sparkles, ChevronRight, Hash } from 'lucide-react';
import { ShiftWindow } from '../types';

interface HeaderProps {
  shiftWindow: ShiftWindow;
  isGenerating: boolean;
  onGenerate: () => void;
  onExportPDF: () => Promise<void>;
  onExportDOCX: () => Promise<void>;
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
    <header className="sticky top-0 z-40 bg-[#0A0A0B]/85 backdrop-blur-md border-b border-brand-border px-4 sm:px-6 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Brand + Breadcrumb-style shift window info */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-semibold text-sm tracking-tight text-brand-text flex items-center gap-1.5 font-sans">
              Handoff
            </span>
          </div>

          <ChevronRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" />

          {/* Breadcrumb shift info */}
          <div className="flex items-center gap-2 overflow-hidden text-xs">
            <span className="text-brand-textMuted hidden md:inline font-mono text-[11px] uppercase tracking-wider">
              NOC
            </span>
            <ChevronRight className="w-3 h-3 text-zinc-600 hidden md:inline shrink-0" />
            <div className="flex items-center gap-2 font-mono text-[11px] text-brand-text bg-white/[0.03] border border-brand-border px-2.5 py-1 rounded-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span className="text-zinc-300 truncate max-w-[130px] sm:max-w-none">
                {shiftWindow.start.slice(11, 16)} → {shiftWindow.end.slice(11, 16)}
              </span>
              <span className="text-zinc-500 text-[10px]">({shiftWindow.timezone.split('/')[1] || shiftWindow.timezone})</span>
            </div>

            {/* Reproducibility Checksum pill */}
            {reproducibilityHash && (
              <button
                onClick={copyHash}
                title="Click to copy SHA-256 reproducibility fingerprint"
                className="hidden lg:flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/[0.02] border border-brand-border hover:border-brand-borderHover text-[11px] font-mono text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                <Hash className="w-3 h-3 text-blue-400" />
                <span>{reproducibilityHash.substring(0, 8)}…</span>
                {copiedHash ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                ) : isMatched ? (
                  <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/10 text-emerald-400 font-semibold">
                    100% MATCH
                  </span>
                ) : (
                  <Copy className="w-2.5 h-2.5 opacity-60" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Export PDF (ghost/outline) */}
          <button
            onClick={handlePDF}
            disabled={isExportingPDF || isGenerating || itemCount === 0}
            title="Export as clean, single-file PDF document"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-transparent hover:bg-white/[0.05] border border-brand-border hover:border-brand-borderHover text-xs font-medium text-brand-textMuted hover:text-brand-text transition-all disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="text-[12px]">{isExportingPDF ? 'PDF…' : 'PDF'}</span>
          </button>

          {/* Export DOCX (ghost/outline) */}
          <button
            onClick={handleDOCX}
            disabled={isExportingDOCX || isGenerating || itemCount === 0}
            title="Export as single-file Microsoft Word document"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-transparent hover:bg-white/[0.05] border border-brand-border hover:border-brand-borderHover text-xs font-medium text-brand-textMuted hover:text-brand-text transition-all disabled:opacity-40"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="text-[12px]">{isExportingDOCX ? 'DOCX…' : 'DOCX'}</span>
          </button>

          {/* Theme Switcher (ghost) */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="p-1.5 rounded-lg bg-transparent hover:bg-white/[0.05] border border-brand-border text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            {darkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-blue-500" />}
          </button>

          {/* Primary Action Button: Confident Electric Blue */}
          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium text-white shadow-sm transition-all ${
              isGenerating
                ? 'bg-blue-600/50 cursor-wait'
                : 'bg-blue-600 hover:bg-blue-500 hover:shadow-brand-accentGlow active:scale-[0.98]'
            }`}
          >
            {isGenerating ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            <span>{isGenerating ? 'Generating…' : 'Generate Note'}</span>
            <span className="hidden md:inline text-[10px] opacity-70 font-mono bg-black/20 px-1 py-0.5 rounded">
              ↵
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
