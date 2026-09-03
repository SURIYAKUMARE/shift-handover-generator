import React, { useState } from 'react';
import { X, Plus, Terminal } from 'lucide-react';
import { Event, ShiftWindow } from '../types';

interface CustomEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  shiftWindow: ShiftWindow;
  onAddEvent: (event: Event) => void;
}

export const CustomEventModal: React.FC<CustomEventModalProps> = ({
  isOpen,
  onClose,
  shiftWindow,
  onAddEvent,
}) => {
  const [source, setSource] = useState('incident');
  const [recordId, setRecordId] = useState('INC-9940');
  const [timestamp, setTimestamp] = useState(
    shiftWindow.start.slice(0, 11) + '20:30:00' + shiftWindow.start.slice(19)
  );
  const [summary, setSummary] = useState(
    'Secondary Redis cache replication queue lag exceeded 200MB threshold; restart in progress'
  );
  const [status, setStatus] = useState('escalated');
  const [severity, setSeverity] = useState<'critical' | 'high' | 'medium' | 'low'>('high');
  const [author, setAuthor] = useState('alex.r@acme.corp');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEvent: Event = {
      source,
      record_id: recordId.trim(),
      timestamp: timestamp.trim(),
      summary: summary.trim(),
      status,
      severity,
      author: author.trim(),
    };
    onAddEvent(newEvent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/75 backdrop-blur-xs" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-[#161B22] border border-[#30363D] rounded-md shadow-2xl z-10 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#30363D] bg-[#0D1117] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#58A6FF]" />
            <h3 className="text-xs font-semibold text-[#F0F6FC] uppercase tracking-wide">
              Inject Custom Telemetry Event
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded bg-[#21262D] hover:bg-[#30363D] text-[#8B949E] hover:text-[#F0F6FC] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs font-sans">
          <p className="text-[11px] text-[#8B949E]">
            Inject a live telemetry record into the active shift window to test deduplication, rule classification, or immediate blocker routing.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-[#8B949E] mb-1 font-medium">Source Feed</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full bg-[#0D1117] border border-[#30363D] rounded px-3 py-1.5 text-xs text-[#F0F6FC] focus:outline-none focus:border-[#58A6FF]"
              >
                <option value="incident">incident (PagerDuty)</option>
                <option value="ticketing">ticketing (Jira / Zendesk)</option>
                <option value="chat">chat (Slack / Teams)</option>
                <option value="monitoring">monitoring (Datadog)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-[#8B949E] mb-1 font-medium">Record ID</label>
              <input
                type="text"
                required
                value={recordId}
                onChange={(e) => setRecordId(e.target.value)}
                className="w-full bg-[#0D1117] border border-[#30363D] rounded px-3 py-1.5 text-xs font-mono text-[#F0F6FC] focus:outline-none focus:border-[#58A6FF]"
                placeholder="INC-9940 or OPS-4821"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-[#8B949E] mb-1 font-medium">Timestamp (ISO format)</label>
            <input
              type="text"
              required
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
              className="w-full bg-[#0D1117] border border-[#30363D] rounded px-3 py-1.5 text-xs font-mono text-[#F0F6FC] focus:outline-none focus:border-[#58A6FF]"
              placeholder="YYYY-MM-DDTHH:mm:ss+05:30"
            />
          </div>

          <div>
            <label className="block text-[11px] text-[#8B949E] mb-1 font-medium">Summary / Description</label>
            <textarea
              rows={2}
              required
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full bg-[#0D1117] border border-[#30363D] rounded px-3 py-1.5 text-xs text-[#F0F6FC] focus:outline-none focus:border-[#58A6FF] resize-none"
              placeholder="Operational event summary..."
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] text-[#8B949E] mb-1 font-medium">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-[#0D1117] border border-[#30363D] rounded px-2.5 py-1.5 text-xs text-[#F0F6FC] focus:outline-none focus:border-[#58A6FF]"
              >
                <option value="open">open</option>
                <option value="investigating">investigating</option>
                <option value="blocked">blocked</option>
                <option value="escalated">escalated</option>
                <option value="resolved">resolved</option>
                <option value="monitoring">monitoring</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-[#8B949E] mb-1 font-medium">Severity</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as any)}
                className="w-full bg-[#0D1117] border border-[#30363D] rounded px-2.5 py-1.5 text-xs text-[#F0F6FC] focus:outline-none focus:border-[#58A6FF]"
              >
                <option value="critical">critical</option>
                <option value="high">high</option>
                <option value="medium">medium</option>
                <option value="low">low</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-[#8B949E] mb-1 font-medium">Author</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full bg-[#0D1117] border border-[#30363D] rounded px-2.5 py-1.5 text-xs text-[#F0F6FC] focus:outline-none focus:border-[#58A6FF]"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded bg-[#21262D] hover:bg-[#30363D] border border-[#30363D] text-xs font-medium text-[#F0F6FC] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-[#238636] hover:bg-[#2EA043] text-xs font-semibold text-white transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Inject Event</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
