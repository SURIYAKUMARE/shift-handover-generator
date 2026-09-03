import React from 'react';
import { ShiftWindow, SourceHealth } from '../types';
import { Calendar, Globe, Database, Radio, MessageSquare, RefreshCw, Cpu } from 'lucide-react';

interface ShiftSetupProps {
  shiftWindow: ShiftWindow;
  setShiftWindow: React.Dispatch<React.SetStateAction<ShiftWindow>>;
  sourcesHealth: Record<string, SourceHealth>;
  enabledSources: string[];
  setEnabledSources: React.Dispatch<React.SetStateAction<string[]>>;
  simulateUnreachable: string;
  setSimulateUnreachable: (source: string) => void;
  onRefreshHealth: () => void;
}

const TIMEZONES = [
  { label: 'Asia/Kolkata (IST, +05:30)', value: 'Asia/Kolkata' },
  { label: 'UTC (Universal Time, +00:00)', value: 'UTC' },
  { label: 'America/New_York (EST, -04:00)', value: 'America/New_York' },
  { label: 'America/Los_Angeles (PST, -07:00)', value: 'America/Los_Angeles' },
  { label: 'Europe/London (BST, +01:00)', value: 'Europe/London' },
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
  onRefreshHealth,
}) => {
  const toggleSource = (sourceId: string) => {
    if (enabledSources.includes(sourceId)) {
      if (enabledSources.length === 1) return;
      setEnabledSources(enabledSources.filter((id) => id !== sourceId));
    } else {
      setEnabledSources([...enabledSources, sourceId]);
    }
  };

  const getSourceIcon = (id: string) => {
    switch (id) {
      case 'ticketing':
        return <Database className="w-3.5 h-3.5 text-zinc-300" />;
      case 'incident':
        return <Radio className="w-3.5 h-3.5 text-zinc-300" />;
      case 'chat':
        return <MessageSquare className="w-3.5 h-3.5 text-zinc-300" />;
      default:
        return <Cpu className="w-3.5 h-3.5 text-zinc-300" />;
    }
  };

  return (
    <div className="bg-[#121215] border border-white/[0.07] rounded-xl p-5 mb-8 shadow-sm">
      {/* Title */}
      <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
        <div>
          <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            Shift Operating Window & Sources
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5 font-sans">
            Telemetry is strictly bounded to <code className="text-zinc-300 font-mono text-[11px] bg-white/[0.04] px-1.5 py-0.5 rounded">[shift_start, shift_end)</code>. No backlog overflow.
          </p>
        </div>
      </div>

      {/* Inputs Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
        {/* Shift Start */}
        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold mb-1.5">
            Shift Window Start (Inclusive)
          </label>
          <input
            type="text"
            value={shiftWindow.start}
            onChange={(e) => setShiftWindow({ ...shiftWindow, start: e.target.value })}
            className="w-full bg-[#0E0E11] border border-white/[0.08] rounded-lg px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            placeholder="YYYY-MM-DDTHH:mm:ss+05:30"
          />
        </div>

        {/* Shift End */}
        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold mb-1.5">
            Shift Window End (Exclusive)
          </label>
          <input
            type="text"
            value={shiftWindow.end}
            onChange={(e) => setShiftWindow({ ...shiftWindow, end: e.target.value })}
            className="w-full bg-[#0E0E11] border border-white/[0.08] rounded-lg px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            placeholder="YYYY-MM-DDTHH:mm:ss+05:30"
          />
        </div>

        {/* Timezone */}
        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold mb-1.5 flex items-center justify-between">
            <span>Timezone Normalization</span>
            <Globe className="w-3 h-3 text-zinc-500" />
          </label>
          <select
            value={shiftWindow.timezone}
            onChange={(e) => setShiftWindow({ ...shiftWindow, timezone: e.target.value })}
            className="w-full bg-[#0E0E11] border border-white/[0.08] rounded-lg px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Connected Sources Row */}
      <div className="mt-6 pt-5 border-t border-white/[0.06]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
            Telemetry Connections
          </span>
          <button
            onClick={onRefreshHealth}
            className="text-[11px] text-zinc-400 hover:text-zinc-200 flex items-center gap-1 font-mono transition-colors"
            title="Ping connected sources"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Ping Sources</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { id: 'ticketing', name: 'Jira / Zendesk', desc: 'Tickets & Service Desk' },
            { id: 'incident', name: 'PagerDuty', desc: 'Alerts & Incidents' },
            { id: 'chat', name: 'Slack War-Rooms', desc: '#incident channels' },
          ].map((src) => {
            const isEnabled = enabledSources.includes(src.id);
            const health = sourcesHealth[src.id];
            const isUnreachable = health?.status === 'unreachable' || simulateUnreachable === src.id;

            return (
              <div
                key={src.id}
                onClick={() => toggleSource(src.id)}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                  isEnabled
                    ? 'bg-[#16161A] border-white/[0.09] hover:border-white/[0.18]'
                    : 'bg-[#101013] border-white/[0.04] opacity-40'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-white/[0.03] border border-white/[0.06]">
                    {getSourceIcon(src.id)}
                  </div>
                  <div>
                    <span className="text-xs font-medium text-zinc-200 block">{src.name}</span>
                    <span className="text-[10px] text-zinc-500 font-mono block">{src.desc}</span>
                  </div>
                </div>

                {/* Status chip with subtle background tint + colored dot */}
                <div>
                  {isUnreachable ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-amber-500/[0.08] text-amber-400 border border-amber-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      UNREACHABLE
                    </span>
                  ) : health?.status === 'connected' ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-500/[0.08] text-emerald-400 border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {health.latency_ms}ms
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-white/[0.03] text-zinc-400 border border-white/[0.06]">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                      READY
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Fault Injection Simulation Bar */}
        <div className="mt-4 pt-3 flex flex-wrap items-center gap-2.5 text-xs">
          <span className="font-mono text-[11px] text-zinc-500">Fault Injection:</span>
          <button
            type="button"
            onClick={() => setSimulateUnreachable(simulateUnreachable === 'chat' ? '' : 'chat')}
            className={`px-2.5 py-1 rounded text-[11px] font-mono border transition-colors ${
              simulateUnreachable === 'chat'
                ? 'bg-amber-500/[0.1] border-amber-500/30 text-amber-300'
                : 'bg-white/[0.02] border-white/[0.06] text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {simulateUnreachable === 'chat' ? '✓ Simulating Slack Outage (503)' : 'Simulate Slack Outage'}
          </button>

          <button
            type="button"
            onClick={() => setSimulateUnreachable(simulateUnreachable === 'ticketing' ? '' : 'ticketing')}
            className={`px-2.5 py-1 rounded text-[11px] font-mono border transition-colors ${
              simulateUnreachable === 'ticketing'
                ? 'bg-amber-500/[0.1] border-amber-500/30 text-amber-300'
                : 'bg-white/[0.02] border-white/[0.06] text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {simulateUnreachable === 'ticketing' ? '✓ Simulating Jira Timeout' : 'Simulate Jira Timeout'}
          </button>
        </div>
      </div>
    </div>
  );
};
