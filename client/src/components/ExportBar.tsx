import React, { useState } from 'react';
import { Download, FileText, RefreshCw, Check, Copy, ShieldCheck, Hash } from 'lucide-react';

interface ExportBarProps {
  onExportPDF: () => Promise<void>;
  onExportDOCX: () => Promise<void>;
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
  onRegenerate,
  reproducibilityHash,
  previousHash,
  generatedAt,
  isGenerating,
  itemCount,
}) => {
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingDOCX, setIsExportingDOCX] = useState(false);
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

  const copyHash = () => {
    navigator.clipboard.writeText(reproducibilityHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const isMatched = previousHash && previousHash === reproducibilityHash;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0A0A0B]/90 backdrop-blur-md border-t border-white/[0.07] px-4 sm:px-6 py-3 shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left: Reproducibility & Fingerprint */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/[0.07] text-zinc-300">
            <Hash className="w-3 h-3 text-blue-400" />
            <span className="text-zinc-500">SHA-256:</span>
            <span className="text-zinc-200 font-medium">
              {reproducibilityHash.substring(0, 16)}…
            </span>
            <button
              onClick={copyHash}
              className="ml-1 p-0.5 text-zinc-400 hover:text-zinc-200 transition-colors"
              title="Copy complete SHA-256 hash"
            >
              {copiedHash ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
          </div>

          {/* Verification Badge */}
          {isMatched ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/[0.08] border border-emerald-500/20 text-emerald-400 text-[11px] font-medium font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% IDEMPOTENT MATCH</span>
            </div>
          ) : (
            <div className="text-zinc-500 text-[11px] hidden md:inline">
              Note items: <strong className="text-zinc-300">{itemCount}</strong>
            </div>
          )}

          <span className="text-[11px] text-zinc-500 hidden lg:inline">
            Generated: {new Date(generatedAt).toLocaleTimeString()}
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Regenerate */}
          <button
            onClick={onRegenerate}
            disabled={isGenerating}
            title="Regenerate identical window to verify reproducibility"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] text-xs font-mono text-zinc-300 hover:text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>Regenerate</span>
          </button>

          {/* PDF */}
          <button
            onClick={handlePDF}
            disabled={isExportingPDF || isGenerating || itemCount === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-medium text-zinc-200 hover:text-white transition-all disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExportingPDF ? 'Building…' : 'Export PDF'}</span>
          </button>

          {/* DOCX */}
          <button
            onClick={handleDOCX}
            disabled={isExportingDOCX || isGenerating || itemCount === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-medium text-zinc-200 hover:text-white transition-all disabled:opacity-40"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{isExportingDOCX ? 'Building…' : 'Export DOCX'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
