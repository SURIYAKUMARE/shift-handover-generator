import React from 'react';
import { ShiftWindow, SourceHealth } from '../types';
import { Play, Calendar, Globe, Database, Radio, MessageSquare, AlertCircle, RefreshCw, Cpu } from 'lucide-react';

interface ShiftSetupProps {
  shiftWindow: ShiftWindow;
  setShiftWindow: React.Dispatch<React.SetStateAction<ShiftWindow>>;
  sourcesHealth: Record<string, SourceHealth>;
  enabledSources: string[];
  setEnabledSources: React.Dispatch<React.SetStateAction<string[]>>;
  simulateUnreachable: string;
  setSimulateUnreachable: (source: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  onRefreshHealth: () => void;
}

const TIMEZONES = [
  { label: 'Asia/Kolkata (IST, +05:30)', value: 'Asia/Kolkata' },
  { label: 'UTC (Universal Coordinated Time, +00:00)', value: 'UTC' },
  { label: 'America/New_York (EST/EDT, -04:00)', value: 'America/New_York' },
  { label: 'America/Los_Angeles (PST/PDT, -07:00)', value: 'America/Los_Angeles' },
  { label: 'Europe/London (BST/GMT, +01:00)', value: 'Europe/London' },
  { label: 'Asia/Singapore (SGT, +08:00)', value: 'Asia/Singapore' },
];

export const ShiftSetup: React.FC<ShiftSetupProps> = ({
  shiftWindow,
  setShiftWindow,
  sourcesHealth,
  enabledSources,
  setEnabledSources,
  simulateUnreachable,
  setSimulateUnreachable,
  onGenerate,
  isGenerating,
  onRefreshHealth,
}) => {
  const toggleSource = (sourceId: string) => {
    if (enabledSources.includes(sourceId)) {
      if (enabledSources.length === 1) return; // Prevent disabling all
      setEnabledSources(enabledSources.filter((id) => id !== sourceId));
    } else {
      setEnabledSources([...enabledSources, sourceId]);
    }
  };

  const getSourceIcon = (id: string) => {
    switch (id) {
      case 'ticketing':
        return <Database className="w-4 h-4 text-blue-400" />;
      case 'incident':
        return <Radio className="w-4 h-4 text-rose-400" />;
      case 'chat':
        return <MessageSquare className="w-4 h-4 text-emerald-400" />;
      default:
        return <Cpu className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="bg-noc-panel border border-noc-border rounded-xl p-6 mb-8 shadow-sm">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-noc-border">
        {/* Title */}
        <div>
          <h2 className="text-lg font-semibold text-noc-text flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            Define Shift Operating Window
          </h2>
          <p className="text-xs text-noc-muted mt-1">
            Activity is strictly filtered to <code className="text-blue-400 font-mono">[shift_start, shift_end)</code>. No historical backlog overflow.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm text-white shadow-lg transition-all ${
            isGenerating
              ? 'bg-blue-600/50 cursor-wait'
              : 'bg-blue-600 hover:bg-blue-500 hover:shadow-blue-500/20 active:scale-[0.98]'
          }`}
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Running Pipeline…</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Generate Handover Note</span>
            </>
          )}
        </button>
      </div>

      {/* Grid Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
        {/* Shift Start */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-noc-muted mb-2">
            Shift Window Start (Inclusive)
          </label>
          <input
            type="text"
            value={shiftWindow.start}
            onChange={(e) => setShiftWindow({ ...shiftWindow, start: e.target.value })}
            className="w-full bg-noc-card border border-noc-border rounded-lg px-3.5 py-2.5 text-sm font-mono text-noc-text focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            placeholder="YYYY-MM-DDTHH:mm:ss+05:30"
          />
        </div>

        {/* Shift End */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-noc-muted mb-2">
            Shift Window End (Exclusive)
          </label>
          <input
            type="text"
            value={shiftWindow.end}
            onChange={(e) => setShiftWindow({ ...shiftWindow, end: e.target.value })}
            className="w-full bg-noc-card border border-noc-border rounded-lg px-3.5 py-2.5 text-sm font-mono text-noc-text focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            placeholder="YYYY-MM-DDTHH:mm:ss+05:30"
          />
        </div>

        {/* Timezone */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-noc-muted mb-2 flex items-center justify-between">
            <span>Normalized Timezone</span>
            <Globe className="w-3.5 h-3.5 text-noc-muted" />
          </label>
          <select
            value={shiftWindow.timezone}
            onChange={(e) => setShiftWindow({ ...shiftWindow, timezone: e.target.value })}
            className="w-full bg-noc-card border border-noc-border rounded-lg px-3.5 py-2.5 text-sm font-mono text-noc-text focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Connected Data Sources Row */}
      <div className="mt-7 pt-6 border-t border-noc-border">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs uppercase font-mono tracking-wider text-noc-muted">
            Connected Data Sources (Live Health Status)
          </span>
          <button
            onClick={onRefreshHealth}
            className="text-xs text-noc-muted hover:text-noc-text flex items-center gap-1 font-mono transition-colors"
            title="Ping connected sources"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Ping Sources</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { id: 'ticketing', name: 'Jira / Zendesk Tickets', type: 'Ticketing' },
            { id: 'incident', name: 'PagerDuty / OpsGenie', type: 'Incidents' },
            { id: 'chat', name: 'Slack Incident Channels', type: 'Chat' },
          ].map((src) => {
            const isEnabled = enabledSources.includes(src.id);
            const health = sourcesHealth[src.id];
            const isUnreachable = health?.status === 'unreachable' || simulateUnreachable === src.id;

            return (
              <div
                key={src.id}
                onClick={() => toggleSource(src.id)}
                className={`flex items-center justify-between p-3.5 rounded-lg border cursor-pointer transition-all ${
                  isEnabled
                    ? 'bg-noc-card border-noc-borderLight hover:border-blue-500/50'
                    : 'bg-noc-card/40 border-noc-border opacity-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-noc-panel border border-noc-border">
                    {getSourceIcon(src.id)}
                  </div>
                  <div>
                    <span className="text-xs font-medium text-noc-text block">{src.name}</span>
                    <span className="text-[11px] text-noc-muted font-mono block">
                      {src.type} API
                    </span>
                  </div>
                </div>

                {/* Status indicator badge */}
                <div>
                  {isUnreachable ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      <AlertCircle className="w-3 h-3" />
                      UNREACHABLE
                    </span>
                  ) : health?.status === 'connected' ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      CONNECTED ({health.latency_ms}ms)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20">
                      ONLINE
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Hostile Simulation Toggles */}
        <div className="mt-4 flex flex-wrap items-center gap-3 pt-3 text-xs text-noc-muted">
          <span className="font-mono text-[11px] text-slate-400">Fault Injection:</span>
          <button
            type="button"
            onClick={() => setSimulateUnreachable(simulateUnreachable === 'chat' ? '' : 'chat')}
            className={`px-2.5 py-1 rounded text-xs font-mono border transition-colors ${
              simulateUnreachable === 'chat'
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-noc-card border-noc-border hover:bg-noc-panelHover'
            }`}
          >
            {simulateUnreachable === 'chat' ? '✓ Simulating Slack 503 Outage' : 'Simulate Slack Outage'}
          </button>

          <button
            type="button"
            onClick={() => setSimulateUnreachable(simulateUnreachable === 'ticketing' ? '' : 'ticketing')}
            className={`px-2.5 py-1 rounded text-xs font-mono border transition-colors ${
              simulateUnreachable === 'ticketing'
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-noc-card border-noc-border hover:bg-noc-panelHover'
            }`}
          >
            {simulateUnreachable === 'ticketing' ? '✓ Simulating Jira Timeout' : 'Simulate Jira Timeout'}
          </button>
        </div>
      </div>
    </div>
  );
};
