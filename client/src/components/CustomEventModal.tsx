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
      <div className="relative w-full max-w-lg bg-[#12171F] border border-[#1E2633] rounded-lg shadow-2xl z-10 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#1E2633] bg-[#0A0D12] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#3B82F6]" />
            <h3 className="text-xs font-semibold text-[#F8FAFC] uppercase tracking-wide">
              Inject Custom Telemetry Event
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md bg-[#18202C] hover:bg-[#1D2635] text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs font-sans">
          <p className="text-[11px] text-[#94A3B8]">
            Inject a live telemetry record into the active shift window to test deduplication, rule classification, or immediate blocker routing.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-[#94A3B8] mb-1 font-medium">Source Feed</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full bg-[#0A0D12] border border-[#283446] rounded-md px-3 py-1.5 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6]"
              >
                <option value="incident">incident (PagerDuty)</option>
                <option value="ticketing">ticketing (Jira / Zendesk)</option>
                <option value="chat">chat (Slack / Teams)</option>
                <option value="monitoring">monitoring (Datadog)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-[#94A3B8] mb-1 font-medium">Record ID</label>
              <input
                type="text"
                required
                value={recordId}
                onChange={(e) => setRecordId(e.target.value)}
                className="w-full bg-[#0A0D12] border border-[#283446] rounded-md px-3 py-1.5 text-xs font-mono text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6]"
                placeholder="INC-9940 or OPS-4821"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-[#94A3B8] mb-1 font-medium">Timestamp (ISO format)</label>
            <input
              type="text"
              required
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
              className="w-full bg-[#0A0D12] border border-[#283446] rounded-md px-3 py-1.5 text-xs font-mono text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6]"
              placeholder="YYYY-MM-DDTHH:mm:ss+05:30"
            />
          </div>

          <div>
            <label className="block text-[11px] text-[#94A3B8] mb-1 font-medium">Summary / Description</label>
            <textarea
              rows={2}
              required
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full bg-[#0A0D12] border border-[#283446] rounded-md px-3 py-1.5 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6] resize-none"
              placeholder="Operational event summary..."
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] text-[#94A3B8] mb-1 font-medium">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-[#0A0D12] border border-[#283446] rounded-md px-2.5 py-1.5 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6]"
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
              <label className="block text-[11px] text-[#94A3B8] mb-1 font-medium">Severity</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as any)}
                className="w-full bg-[#0A0D12] border border-[#283446] rounded-md px-2.5 py-1.5 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6]"
              >
                <option value="critical">critical</option>
                <option value="high">high</option>
                <option value="medium">medium</option>
                <option value="low">low</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-[#94A3B8] mb-1 font-medium">Author</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full bg-[#0A0D12] border border-[#283446] rounded-md px-2.5 py-1.5 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6]"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-md bg-[#18202C] hover:bg-[#1D2635] border border-[#283446] text-xs font-medium text-[#F8FAFC] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-[#2563EB] hover:bg-[#1D4ED8] text-xs font-semibold text-white transition-colors shadow-sm"
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
