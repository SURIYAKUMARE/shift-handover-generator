import React, { useState } from 'react';
import { Download, FileText, RefreshCw, Check, Copy, ShieldCheck, FileCode } from 'lucide-react';

interface ExportBarProps {
  onExportPDF: () => Promise<void>;
  onExportDOCX: () => Promise<void>;
  onExportJSON: () => Promise<void>;
  onRegenerate: () => void;
  reproducibilityHash: string;
  previousHash?: string;
  generatedAt: string;
  isGenerating: boolean;
  itemCount: number;
}

export const ExportBar: React.FC<ExportBarProps> = ({
  onExportPDF,
  onExportDOCX,
  onExportJSON,
  onRegenerate,
  reproducibilityHash,
  previousHash,
  generatedAt,
  isGenerating,
  itemCount,
}) => {
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingDOCX, setIsExportingDOCX] = useState(false);
  const [isExportingJSON, setIsExportingJSON] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

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

  const handleJSON = async () => {
    try {
      setIsExportingJSON(true);
      await onExportJSON();
    } finally {
      setIsExportingJSON(false);
    }
  };

  const copyHash = () => {
    navigator.clipboard.writeText(reproducibilityHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const isMatched = previousHash && previousHash === reproducibilityHash;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#12171F]/95 backdrop-blur-md border-t border-[#1E2633] px-4 sm:px-8 py-3.5 shadow-dock">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left: Reproducibility & Fingerprint */}
        <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-mono">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#0A0D12] border border-[#283446] text-[#94A3B8]">
            <span>Digest:</span>
            <span className="text-[#F8FAFC] font-bold">
              {reproducibilityHash.substring(0, 16)}...
            </span>
            <button
              onClick={copyHash}
              className="ml-1 text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
              title="Copy complete SHA-256 hash"
            >
              {copiedHash ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {/* Verification Badge */}
          {isMatched ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-emerald-500/15 border border-emerald-500/35 text-emerald-400 text-xs sm:text-sm font-sans font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Byte-for-byte identical output verified</span>
            </div>
          ) : (
            <div className="text-[#94A3B8] text-xs sm:text-sm font-sans hidden md:inline">
              Verified ledger items: <strong className="text-[#F8FAFC]">{itemCount}</strong>
            </div>
          )}

          <span className="text-xs text-[#64748B] font-sans hidden lg:inline">
            Compiled: {new Date(generatedAt).toLocaleTimeString()}
          </span>
        </div>

        {/* Right: Actions (Larger & Prominent) */}
        <div className="flex items-center gap-2.5">
          {/* Regenerate */}
          <button
            onClick={onRegenerate}
            disabled={isGenerating}
            title="Regenerate identical window to verify reproducibility"
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#18202C] hover:bg-[#1D2635] border border-[#283446] text-xs sm:text-sm font-medium text-[#F8FAFC] transition-colors disabled:opacity-50 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>Regenerate (Verify)</span>
          </button>

          {/* PDF */}
          <button
            onClick={handlePDF}
            disabled={isExportingPDF || isGenerating || itemCount === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#18202C] hover:bg-[#1D2635] border border-[#283446] text-xs sm:text-sm font-medium text-[#F8FAFC] transition-colors disabled:opacity-40 shadow-sm"
          >
            <Download className="w-4 h-4 text-[#94A3B8]" />
            <span>{isExportingPDF ? 'Generating...' : 'Export as PDF'}</span>
          </button>

          {/* DOCX */}
          <button
            onClick={handleDOCX}
            disabled={isExportingDOCX || isGenerating || itemCount === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#18202C] hover:bg-[#1D2635] border border-[#283446] text-xs sm:text-sm font-medium text-[#F8FAFC] transition-colors disabled:opacity-40 shadow-sm"
          >
            <FileText className="w-4 h-4 text-[#94A3B8]" />
            <span>{isExportingDOCX ? 'Generating...' : 'Export as DOCX'}</span>
          </button>

          {/* JSON Compliance Manifest */}
          <button
            onClick={handleJSON}
            disabled={isExportingJSON || isGenerating || itemCount === 0}
            title="Export full JSON Telemetry Manifest for SOC2 / audit compliance"
            className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-md bg-[#18202C] hover:bg-[#1D2635] border border-[#283446] text-xs sm:text-sm font-mono text-[#94A3B8] hover:text-[#F8FAFC] transition-colors disabled:opacity-40 shadow-sm"
          >
            <FileCode className="w-4 h-4" />
            <span>{isExportingJSON ? 'JSON...' : 'JSON Audit'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
