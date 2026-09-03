import React from 'react';
import { Activity, Moon, Sun, ShieldCheck, Terminal } from 'lucide-react';

interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  isGenerating: boolean;
  operator: string;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  setDarkMode,
  isGenerating,
  operator,
}) => {
  return (
    <header className="border-b border-noc-border bg-noc-panel/80 backdrop-blur sticky top-0 z-40 px-6 py-3 transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left branding */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-blue-600/10 border border-blue-500/30 text-blue-400">
            <Activity className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold tracking-wide text-noc-text flex items-center gap-1.5 font-mono">
                OPS // SHIFT HANDOVER
              </h1>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                PROD-NOC
              </span>
            </div>
            <p className="text-xs text-noc-muted">
              Source-Grounded • Deterministic Dedup • Single-File PDF/DOCX Export
            </p>
          </div>
        </div>

        {/* Right tools */}
        <div className="flex items-center gap-3">
          {/* Operator badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-noc-card border border-noc-border text-xs font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-noc-muted">OPERATOR:</span>
            <span className="text-noc-text font-medium">{operator}</span>
          </div>

          {/* Engine status */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-noc-card border border-noc-border text-xs font-mono">
            <Terminal className="w-3.5 h-3.5 text-noc-muted" />
            <span className="text-noc-muted">PIPELINE:</span>
            <span className={isGenerating ? "text-amber-400 animate-pulse" : "text-emerald-400"}>
              {isGenerating ? "PROCESSING" : "IDLE / READY"}
            </span>
          </div>

          {/* Dark / Light Mode Switch */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="p-2 rounded-lg bg-noc-card hover:bg-noc-panelHover border border-noc-border text-noc-muted hover:text-noc-text transition-colors"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-500" />}
          </button>
        </div>
      </div>
    </header>
  );
};
