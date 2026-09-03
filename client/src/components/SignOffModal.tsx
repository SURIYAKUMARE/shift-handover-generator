import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, User, Clock, AlertTriangle } from 'lucide-react';
import { ShiftWindow } from '../types';

interface SignOffModalProps {
  isOpen: boolean;
  onClose: () => void;
  shiftWindow: ShiftWindow;
  blockersCount: number;
  totalItemsCount: number;
  reproducibilityHash: string;
  onConfirmSignOff: (incomingEngineer: string, notes: string) => void;
  isSignedOff: boolean;
  signedOffData?: {
    incomingEngineer: string;
    outgoingEngineer: string;
    timestamp: string;
    notes: string;
  };
}

export const SignOffModal: React.FC<SignOffModalProps> = ({
  isOpen,
  onClose,
  shiftWindow,
  blockersCount,
  totalItemsCount,
  reproducibilityHash,
  onConfirmSignOff,
  isSignedOff,
  signedOffData,
}) => {
  const [incomingEngineer, setIncomingEngineer] = useState('Alex Rivera (Primary On-Call)');
  const [handoverNotes, setHandoverNotes] = useState('Reviewed 3 blockers; acknowledged auth service mitigation and DBA reload pending.');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmSignOff(incomingEngineer, handoverNotes);
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
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-semibold text-[#F8FAFC] uppercase tracking-wide">
              Official Shift Transfer Acknowledgment
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md bg-[#18202C] hover:bg-[#1D2635] text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs font-sans">
          {/* Summary Checklist */}
          <div className="bg-[#0A0D12] border border-[#283446] rounded-md p-3.5 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-[#94A3B8]">
              <span>Shift Interval:</span>
              <span className="font-mono text-[#F8FAFC] font-semibold">
                {shiftWindow.start.slice(11, 16)} - {shiftWindow.end.slice(11, 16)} ({shiftWindow.timezone})
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#94A3B8]">
              <span>Verified Items Count:</span>
              <span className="font-mono text-[#F8FAFC] font-semibold">{totalItemsCount} verified items</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#94A3B8]">
              <span>SHA-256 Digest:</span>
              <span className="font-mono text-[#3B82F6] font-semibold">{reproducibilityHash.substring(0, 16)}...</span>
            </div>

            {blockersCount > 0 && (
              <div className="mt-2 pt-2 border-t border-[#18202C] flex items-center gap-2 text-[#F59E0B] font-medium">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>Notice: {blockersCount} active blocker(s) require incoming shift attention.</span>
              </div>
            )}
          </div>

          {isSignedOff && signedOffData ? (
            /* Signed State Display */
            <div className="p-4 rounded-md bg-emerald-500/10 border border-emerald-500/30 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>Shift Handover Formally Transferred & Accepted</span>
              </div>
              <p className="text-[11px] text-[#94A3B8]">
                Responsibility accepted by <strong className="text-[#F8FAFC]">{signedOffData.incomingEngineer}</strong> from <strong className="text-[#F8FAFC]">{signedOffData.outgoingEngineer}</strong> at {signedOffData.timestamp}.
              </p>
              {signedOffData.notes && (
                <div className="mt-1 pt-1 border-t border-emerald-500/20 text-[11px] text-[#F8FAFC] font-mono">
                  "{signedOffData.notes}"
                </div>
              )}
            </div>
          ) : (
            /* Acceptance Form */
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] text-[#94A3B8] font-medium mb-1 flex items-center gap-1.5">
                  <User className="w-3 h-3 text-[#64748B]" />
                  <span>Incoming On-Call Engineer (Assuming Primary Ownership)</span>
                </label>
                <input
                  type="text"
                  required
                  value={incomingEngineer}
                  onChange={(e) => setIncomingEngineer(e.target.value)}
                  className="w-full bg-[#0A0D12] border border-[#283446] rounded-md px-3 py-1.5 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6] font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#94A3B8] font-medium mb-1 flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-[#64748B]" />
                  <span>Acceptance Notes / Incoming Briefing Acknowledgement</span>
                </label>
                <textarea
                  rows={2}
                  value={handoverNotes}
                  onChange={(e) => setHandoverNotes(e.target.value)}
                  className="w-full bg-[#0A0D12] border border-[#283446] rounded-md px-3 py-1.5 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6] font-sans resize-none"
                  placeholder="Notes on verbal handover discussion..."
                />
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
                  className="px-4 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white transition-colors shadow-sm"
                >
                  Sign Off & Accept Responsibility
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
