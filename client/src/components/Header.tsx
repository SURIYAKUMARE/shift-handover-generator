import React, { useState } from 'react';
import { Download, FileText, RefreshCw, Check, Copy, Sun, Moon } from 'lucide-react';
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
    <header className="sticky top-0 z-40 bg-[#161B22] border-b border-[#30363D] px-4 sm:px-6 py-2.5 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Relay Watch Log Framing */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 min-w-0 text-xs">
          {/* Identity */}
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#3FB950]" title="Telemetry online" />
            <span className="font-semibold text-sm text-[#F0F6FC] tracking-tight">
              Shift Watch Log
            </span>
          </div>

          <div className="hidden sm:block text-[#6E7681]">/</div>

          {/* Two-party handover context */}
          <div className="flex items-center gap-2 text-[#8B949E]">
            <span>Outgoing: <strong className="text-[#F0F6FC] font-medium">SRE On-Call</strong></span>
            <span className="text-[#6E7681]">transfers to</span>
            <span>Incoming: <strong className="text-[#58A6FF] font-medium">Next Shift Primary</strong></span>
          </div>

          <div className="hidden md:block text-[#6E7681]">/</div>

          {/* Shift Interval */}
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#8B949E] bg-[#0D1117] px-2 py-0.5 rounded border border-[#30363D]">
            <span>Window:</span>
            <span className="text-[#F0F6FC]">
              {shiftWindow.start.slice(11, 16)} - {shiftWindow.end.slice(11, 16)}
            </span>
            <span className="text-[#6E7681]">({shiftWindow.timezone})</span>
          </div>

          {/* Checksum confirmation */}
          {reproducibilityHash && (
            <button
              onClick={copyHash}
              title="Copy SHA-256 reproducibility fingerprint"
              className="hidden lg:flex items-center gap-1 font-mono text-[11px] text-[#8B949E] hover:text-[#F0F6FC] bg-[#0D1117] px-2 py-0.5 rounded border border-[#30363D] transition-colors"
            >
              <span>Hash:</span>
              <span className="text-[#58A6FF]">{reproducibilityHash.substring(0, 8)}</span>
              {copiedHash ? (
                <Check className="w-3 h-3 text-[#3FB950]" />
              ) : isMatched ? (
                <span className="text-[#3FB950] font-semibold text-[10px]">VERIFIED MATCH</span>
              ) : (
                <Copy className="w-2.5 h-2.5 opacity-60" />
              )}
            </button>
          )}
        </div>

        {/* Right: Operational Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Export PDF */}
          <button
            onClick={handlePDF}
            disabled={isExportingPDF || isGenerating || itemCount === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#21262D] hover:bg-[#30363D] border border-[#30363D] text-xs font-medium text-[#F0F6FC] transition-colors disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5 text-[#8B949E]" />
            <span>{isExportingPDF ? 'Generating PDF...' : 'Export PDF'}</span>
          </button>

          {/* Export DOCX */}
          <button
            onClick={handleDOCX}
            disabled={isExportingDOCX || isGenerating || itemCount === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#21262D] hover:bg-[#30363D] border border-[#30363D] text-xs font-medium text-[#F0F6FC] transition-colors disabled:opacity-40"
          >
            <FileText className="w-3.5 h-3.5 text-[#8B949E]" />
            <span>{isExportingDOCX ? 'Generating DOCX...' : 'Export DOCX'}</span>
          </button>

          {/* Day / Night Shift Contrast Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? "Switch to Day Mode" : "Switch to Night Mode"}
            className="p-1.5 rounded-md bg-[#21262D] hover:bg-[#30363D] border border-[#30363D] text-[#8B949E] hover:text-[#F0F6FC] transition-colors"
          >
            {darkMode ? <Sun className="w-3.5 h-3.5 text-[#D29922]" /> : <Moon className="w-3.5 h-3.5 text-[#58A6FF]" />}
          </button>

          {/* Primary Action: Generate Handover Note */}
          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold text-white bg-[#238636] hover:bg-[#2EA043] border border-[rgba(240,246,252,0.1)] shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isGenerating && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            <span>{isGenerating ? 'Compiling handover note...' : 'Generate handover note'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
