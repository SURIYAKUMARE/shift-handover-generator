import React, { useState } from 'react';
import { Download, FileText, RefreshCw, CheckCircle2, Copy, ShieldCheck } from 'lucide-react';

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
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-noc-panel/95 backdrop-blur-md border-t border-noc-border px-6 py-3.5 shadow-2xl transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Reproducibility & Checksum */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-noc-card border border-noc-border">
            <span className="text-noc-muted">SHA-256:</span>
            <span className="text-blue-400 font-bold tracking-wide">
              {reproducibilityHash.substring(0, 16)}…
            </span>
            <button
              onClick={copyHash}
              className="ml-1 p-1 hover:text-white transition-colors"
              title="Copy full SHA-256 hash"
            >
              {copiedHash ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-noc-muted" />
              )}
            </button>
          </div>

          {/* Verification Badge */}
          {isMatched ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% REPRODUCIBLE MATCH</span>
            </div>
          ) : (
            <div className="text-noc-muted hidden sm:inline">
              Items in note: <strong className="text-noc-text">{itemCount}</strong>
            </div>
          )}

          <div className="text-[11px] text-noc-muted hidden lg:inline">
            Generated: {new Date(generatedAt).toLocaleTimeString()}
          </div>
        </div>

        {/* Right: Export Actions */}
        <div className="flex items-center gap-3">
          {/* Regenerate */}
          <button
            onClick={onRegenerate}
            disabled={isGenerating}
            title="Regenerate the same shift window to verify identical output"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-noc-card hover:bg-noc-panelHover border border-noc-border text-xs font-mono font-medium text-noc-text transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>Regenerate (Verify Idempotency)</span>
          </button>

          {/* Export PDF */}
          <button
            onClick={handlePDF}
            disabled={isExportingPDF || isGenerating}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-md hover:shadow-red-500/20 transition-all disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExportingPDF ? 'Building PDF…' : 'Export PDF'}</span>
          </button>

          {/* Export DOCX */}
          <button
            onClick={handleDOCX}
            disabled={isExportingDOCX || isGenerating}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md hover:shadow-blue-500/20 transition-all disabled:opacity-50"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{isExportingDOCX ? 'Building DOCX…' : 'Export DOCX'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
