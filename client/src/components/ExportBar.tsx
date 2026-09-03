import React, { useState } from 'react';
import { Download, FileText, RefreshCw, Check, Copy, ShieldCheck } from 'lucide-react';

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
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#161B22]/95 backdrop-blur-xs border-t border-[#30363D] px-4 sm:px-6 py-2.5 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left: Reproducibility & Fingerprint */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#0D1117] border border-[#30363D] text-[#8B949E]">
            <span>SHA-256:</span>
            <span className="text-[#F0F6FC] font-medium">
              {reproducibilityHash.substring(0, 16)}...
            </span>
            <button
              onClick={copyHash}
              className="ml-1 text-[#8B949E] hover:text-[#F0F6FC] transition-colors"
              title="Copy complete SHA-256 hash"
            >
              {copiedHash ? (
                <Check className="w-3 h-3 text-[#3FB950]" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
          </div>

          {/* Verification Badge */}
          {isMatched ? (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#3FB950]/10 border border-[#3FB950]/30 text-[#3FB950] text-[11px] font-sans font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Byte-for-byte identical output verified</span>
            </div>
          ) : (
            <div className="text-[#8B949E] text-[11px] font-sans hidden md:inline">
              Ledger items: <strong className="text-[#F0F6FC]">{itemCount}</strong>
            </div>
          )}

          <span className="text-[11px] text-[#6E7681] font-sans hidden lg:inline">
            Compiled: {new Date(generatedAt).toLocaleTimeString()}
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Regenerate */}
          <button
            onClick={onRegenerate}
            disabled={isGenerating}
            title="Regenerate identical window to verify reproducibility"
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#21262D] hover:bg-[#30363D] border border-[#30363D] text-xs font-sans text-[#F0F6FC] transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>Regenerate (Verify Idempotency)</span>
          </button>

          {/* PDF */}
          <button
            onClick={handlePDF}
            disabled={isExportingPDF || isGenerating || itemCount === 0}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#21262D] hover:bg-[#30363D] border border-[#30363D] text-xs font-sans text-[#F0F6FC] transition-colors disabled:opacity-40"
          >
            <Download className="w-3 h-3 text-[#8B949E]" />
            <span>{isExportingPDF ? 'Generating...' : 'Export as PDF'}</span>
          </button>

          {/* DOCX */}
          <button
            onClick={handleDOCX}
            disabled={isExportingDOCX || isGenerating || itemCount === 0}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#21262D] hover:bg-[#30363D] border border-[#30363D] text-xs font-sans text-[#F0F6FC] transition-colors disabled:opacity-40"
          >
            <FileText className="w-3 h-3 text-[#8B949E]" />
            <span>{isExportingDOCX ? 'Generating...' : 'Export as DOCX'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
