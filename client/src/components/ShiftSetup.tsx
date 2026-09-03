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
  { label: 'UTC (Universal Coordinated Time, +00:00)', value: 'UTC' },
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
        return <Database className="w-3.5 h-3.5 text-[#8B949E]" />;
      case 'incident':
        return <Radio className="w-3.5 h-3.5 text-[#8B949E]" />;
      case 'chat':
        return <MessageSquare className="w-3.5 h-3.5 text-[#8B949E]" />;
      default:
        return <Cpu className="w-3.5 h-3.5 text-[#8B949E]" />;
    }
  };

  return (
    <div className="bg-[#161B22] border border-[#30363D] rounded-md p-4 mb-6 shadow-sm">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#30363D] gap-2">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#58A6FF]" />
          <h2 className="text-xs font-semibold text-[#F0F6FC] uppercase tracking-wide">
            Shift Boundary Configuration
          </h2>
        </div>
        <div className="text-[11px] text-[#8B949E] font-sans">
          Events filtered strictly to <code className="text-[#C9D1D9] font-mono text-[11px] bg-[#0D1117] px-1 py-0.5 rounded border border-[#30363D]">[start, end)</code>
        </div>
      </div>

      {/* Inputs Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-4">
        {/* Shift Start */}
        <div>
          <label className="block text-[11px] font-sans text-[#8B949E] mb-1 font-medium">
            Shift Window Start (Inclusive)
          </label>
          <input
            type="text"
            value={shiftWindow.start}
            onChange={(e) => setShiftWindow({ ...shiftWindow, start: e.target.value })}
            className="w-full bg-[#0D1117] border border-[#30363D] rounded px-3 py-1.5 text-xs font-mono text-[#F0F6FC] focus:outline-none focus:border-[#58A6FF] transition-colors"
            placeholder="YYYY-MM-DDTHH:mm:ss+05:30"
          />
        </div>

        {/* Shift End */}
        <div>
          <label className="block text-[11px] font-sans text-[#8B949E] mb-1 font-medium">
            Shift Window End (Exclusive)
          </label>
          <input
            type="text"
            value={shiftWindow.end}
            onChange={(e) => setShiftWindow({ ...shiftWindow, end: e.target.value })}
            className="w-full bg-[#0D1117] border border-[#30363D] rounded px-3 py-1.5 text-xs font-mono text-[#F0F6FC] focus:outline-none focus:border-[#58A6FF] transition-colors"
            placeholder="YYYY-MM-DDTHH:mm:ss+05:30"
          />
        </div>

        {/* Timezone */}
        <div>
          <label className="block text-[11px] font-sans text-[#8B949E] mb-1 font-medium flex items-center justify-between">
            <span>Timezone Normalization</span>
            <Globe className="w-3 h-3 text-[#6E7681]" />
          </label>
          <select
            value={shiftWindow.timezone}
            onChange={(e) => setShiftWindow({ ...shiftWindow, timezone: e.target.value })}
            className="w-full bg-[#0D1117] border border-[#30363D] rounded px-3 py-1.5 text-xs font-mono text-[#F0F6FC] focus:outline-none focus:border-[#58A6FF] transition-colors"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Connected Telemetry Feeds */}
      <div className="mt-4 pt-3.5 border-t border-[#21262D]">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-sans text-[#8B949E] font-medium">
            Connected Telemetry Feeds
          </span>
          <button
            onClick={onRefreshHealth}
            className="text-[11px] text-[#8B949E] hover:text-[#F0F6FC] flex items-center gap-1 font-mono transition-colors"
            title="Ping connected sources"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Ping Feeds</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {[
            { id: 'ticketing', name: 'Jira / Zendesk', desc: 'Ticketing Telemetry' },
            { id: 'incident', name: 'PagerDuty', desc: 'Incident Alerts' },
            { id: 'chat', name: 'Slack War-Rooms', desc: '#incident-channels' },
          ].map((src) => {
            const isEnabled = enabledSources.includes(src.id);
            const health = sourcesHealth[src.id];
            const isUnreachable = health?.status === 'unreachable' || simulateUnreachable === src.id;

            return (
              <div
                key={src.id}
                onClick={() => toggleSource(src.id)}
                className={`flex items-center justify-between p-2.5 rounded border cursor-pointer transition-colors ${
                  isEnabled
                    ? 'bg-[#0D1117] border-[#30363D] hover:border-[#8B949E]/50'
                    : 'bg-[#0D1117]/50 border-[#21262D] opacity-40'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-[#161B22]">
                    {getSourceIcon(src.id)}
                  </div>
                  <div>
                    <span className="text-xs font-medium text-[#F0F6FC] block">{src.name}</span>
                    <span className="text-[10px] text-[#6E7681] font-mono block">{src.desc}</span>
                  </div>
                </div>

                <div>
                  {isUnreachable ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono text-[#D29922] bg-[#D29922]/10 border border-[#D29922]/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D29922]" />
                      UNREACHABLE
                    </span>
                  ) : health?.status === 'connected' ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono text-[#3FB950] bg-[#3FB950]/10 border border-[#3FB950]/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#3FB950]" />
                      {health.latency_ms}ms
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono text-[#8B949E] bg-[#161B22] border border-[#30363D]">
                      READY
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Operational Fault Injection */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-sans text-[11px] text-[#6E7681]">Fault injection tests:</span>
          <button
            type="button"
            onClick={() => setSimulateUnreachable(simulateUnreachable === 'chat' ? '' : 'chat')}
            className={`px-2 py-0.5 rounded text-[11px] font-mono border transition-colors ${
              simulateUnreachable === 'chat'
                ? 'bg-[#D29922]/15 border-[#D29922] text-[#D29922]'
                : 'bg-[#0D1117] border-[#30363D] text-[#8B949E] hover:text-[#F0F6FC]'
            }`}
          >
            {simulateUnreachable === 'chat' ? 'Simulating Slack 503 (Active)' : 'Simulate Slack 503 outage'}
          </button>

          <button
            type="button"
            onClick={() => setSimulateUnreachable(simulateUnreachable === 'ticketing' ? '' : 'ticketing')}
            className={`px-2 py-0.5 rounded text-[11px] font-mono border transition-colors ${
              simulateUnreachable === 'ticketing'
                ? 'bg-[#D29922]/15 border-[#D29922] text-[#D29922]'
                : 'bg-[#0D1117] border-[#30363D] text-[#8B949E] hover:text-[#F0F6FC]'
            }`}
          >
            {simulateUnreachable === 'ticketing' ? 'Simulating Jira timeout (Active)' : 'Simulate Jira timeout'}
          </button>
        </div>
      </div>
    </div>
  );
};
