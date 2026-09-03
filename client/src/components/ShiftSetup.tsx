import React from 'react';
import { ShiftWindow, SourceHealth, CarriedForwardRecord } from '../types';
import { Calendar, Globe, Database, Radio, MessageSquare, RefreshCw, Cpu, ArrowRightLeft } from 'lucide-react';

interface ShiftSetupProps {
  shiftWindow: ShiftWindow;
  setShiftWindow: React.Dispatch<React.SetStateAction<ShiftWindow>>;
  sourcesHealth: Record<string, SourceHealth>;
  enabledSources: string[];
  setEnabledSources: React.Dispatch<React.SetStateAction<string[]>>;
  simulateUnreachable: string;
  setSimulateUnreachable: (source: string) => void;
  onRefreshHealth: () => void;
  carriedOverItems?: CarriedForwardRecord[];
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
  carriedOverItems = [],
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
        return <Database className="w-3.5 h-3.5 text-[#3B82F6]" />;
      case 'incident':
        return <Radio className="w-3.5 h-3.5 text-[#F59E0B]" />;
      case 'chat':
        return <MessageSquare className="w-3.5 h-3.5 text-[#10B981]" />;
      default:
        return <Cpu className="w-3.5 h-3.5 text-[#94A3B8]" />;
    }
  };

  const setShiftInterval = (startHours: string, endHours: string) => {
    const baseDate = shiftWindow.start.slice(0, 10);
    const tzOffset = shiftWindow.start.slice(19) || '+05:30';
    setShiftWindow({
      ...shiftWindow,
      start: `${baseDate}T${startHours}:00${tzOffset}`,
      end: `${baseDate}T${endHours}:00${tzOffset}`,
    });
  };

  return (
    <div className="bg-[#12171F] border border-[#1E2633] rounded-lg p-4 mb-5 shadow-console">
      {/* Title & Quick Presets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#1E2633] gap-2.5">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#3B82F6]" />
          <h2 className="text-xs font-semibold text-[#F8FAFC] uppercase tracking-wide">
            Shift Boundary Configuration
          </h2>
        </div>

        {/* Quick Shift Presets */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-sans">
          <span className="text-[#64748B] font-medium">Quick shifts:</span>
          <button
            type="button"
            onClick={() => setShiftInterval('00:00', '08:00')}
            className="px-2.5 py-0.5 rounded bg-[#0A0D12] border border-[#283446] text-[#94A3B8] hover:text-[#F8FAFC] hover:border-[#3B82F6] transition-colors"
          >
            Night (00:00-08:00)
          </button>
          <button
            type="button"
            onClick={() => setShiftInterval('08:00', '16:00')}
            className="px-2.5 py-0.5 rounded bg-[#0A0D12] border border-[#283446] text-[#94A3B8] hover:text-[#F8FAFC] hover:border-[#3B82F6] transition-colors"
          >
            Morning (08:00-16:00)
          </button>
          <button
            type="button"
            onClick={() => setShiftInterval('16:00', '00:00')}
            className="px-2.5 py-0.5 rounded bg-[#0A0D12] border border-[#283446] text-[#94A3B8] hover:text-[#F8FAFC] hover:border-[#3B82F6] transition-colors"
          >
            Evening (16:00-00:00)
          </button>
        </div>
      </div>

      {/* Inputs Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-3.5">
        {/* Shift Start */}
        <div>
          <label className="block text-[11px] font-sans text-[#94A3B8] mb-1 font-medium">
            Shift Window Start (Inclusive)
          </label>
          <input
            type="text"
            value={shiftWindow.start}
            onChange={(e) => setShiftWindow({ ...shiftWindow, start: e.target.value })}
            className="w-full bg-[#0A0D12] border border-[#283446] rounded-md px-3 py-1.5 text-xs font-mono text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6] transition-colors"
            placeholder="YYYY-MM-DDTHH:mm:ss+05:30"
          />
        </div>

        {/* Shift End */}
        <div>
          <label className="block text-[11px] font-sans text-[#94A3B8] mb-1 font-medium">
            Shift Window End (Exclusive)
          </label>
          <input
            type="text"
            value={shiftWindow.end}
            onChange={(e) => setShiftWindow({ ...shiftWindow, end: e.target.value })}
            className="w-full bg-[#0A0D12] border border-[#283446] rounded-md px-3 py-1.5 text-xs font-mono text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6] transition-colors"
            placeholder="YYYY-MM-DDTHH:mm:ss+05:30"
          />
        </div>

        {/* Timezone */}
        <div>
          <label className="block text-[11px] font-sans text-[#94A3B8] mb-1 font-medium flex items-center justify-between">
            <span>Timezone Normalization</span>
            <Globe className="w-3 h-3 text-[#64748B]" />
          </label>
          <select
            value={shiftWindow.timezone}
            onChange={(e) => setShiftWindow({ ...shiftWindow, timezone: e.target.value })}
            className="w-full bg-[#0A0D12] border border-[#283446] rounded-md px-3 py-1.5 text-xs font-mono text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6] transition-colors"
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
      <div className="mt-4 pt-3.5 border-t border-[#1E2633]">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-sans text-[#94A3B8] font-medium">
            Connected Telemetry Feeds
          </span>
          <button
            onClick={onRefreshHealth}
            className="text-[11px] text-[#94A3B8] hover:text-[#F8FAFC] flex items-center gap-1 font-mono transition-colors"
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
                className={`flex items-center justify-between p-2.5 rounded-md border cursor-pointer transition-colors ${
                  isEnabled
                    ? 'bg-[#0A0D12] border-[#283446] hover:border-[#3B82F6]/60'
                    : 'bg-[#0A0D12]/40 border-[#1E2633] opacity-40'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1 rounded bg-[#18202C]">
                    {getSourceIcon(src.id)}
                  </div>
                  <div>
                    <span className="text-xs font-medium text-[#F8FAFC] block">{src.name}</span>
                    <span className="text-[10px] text-[#64748B] font-mono block">{src.desc}</span>
                  </div>
                </div>

                <div>
                  {isUnreachable ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono text-[#F59E0B] bg-[#F59E0B]/10 border border-[#F59E0B]/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                      UNREACHABLE
                    </span>
                  ) : health?.status === 'connected' ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {health.latency_ms}ms
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono text-[#94A3B8] bg-[#18202C] border border-[#283446]">
                      READY
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Pre-Generation Carry-Forward Preview */}
        {carriedOverItems && carriedOverItems.length > 0 && (
          <div className="mt-3 p-2.5 rounded-md bg-[#0A0D12] border border-[#3B82F6]/30 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="w-3.5 h-3.5 text-[#3B82F6] shrink-0" />
              <span className="text-[#F8FAFC] font-medium font-sans">
                {carriedOverItems.length} unresolved item{carriedOverItems.length > 1 ? 's' : ''} held over from prior shift
              </span>
              <span className="text-[11px] text-[#94A3B8] font-sans">
                ({carriedOverItems.filter((i) => i.section === 'Blockers').length} blockers, {carriedOverItems.filter((i) => i.section === 'In Progress').length} in progress)
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#3B82F6] bg-[#12171F] px-2 py-0.5 rounded border border-[#283446]">
              Preserved in new note if untouched
            </span>
          </div>
        )}

        {/* Operational Fault Injection */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-sans text-[11px] text-[#64748B]">Fault simulation tests:</span>
          <button
            type="button"
            onClick={() => setSimulateUnreachable(simulateUnreachable === 'chat' ? '' : 'chat')}
            className={`px-2.5 py-0.5 rounded text-[11px] font-mono border transition-colors ${
              simulateUnreachable === 'chat'
                ? 'bg-[#F59E0B]/15 border-[#F59E0B] text-[#F59E0B] font-semibold'
                : 'bg-[#0A0D12] border-[#283446] text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
          >
            {simulateUnreachable === 'chat' ? 'Simulating Slack 503 (Active)' : 'Simulate Slack 503 outage'}
          </button>

          <button
            type="button"
            onClick={() => setSimulateUnreachable(simulateUnreachable === 'ticketing' ? '' : 'ticketing')}
            className={`px-2.5 py-0.5 rounded text-[11px] font-mono border transition-colors ${
              simulateUnreachable === 'ticketing'
                ? 'bg-[#F59E0B]/15 border-[#F59E0B] text-[#F59E0B] font-semibold'
                : 'bg-[#0A0D12] border-[#283446] text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
          >
            {simulateUnreachable === 'ticketing' ? 'Simulating Jira timeout (Active)' : 'Simulate Jira timeout'}
          </button>
        </div>
      </div>
    </div>
  );
};
