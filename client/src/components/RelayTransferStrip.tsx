import React from 'react';
import { ShiftWindow } from '../types';
import { ArrowRight, CheckCircle2, ShieldCheck, User, UserCheck } from 'lucide-react';
import { playTactileBlip } from '../utils/audio';

interface RelayTransferStripProps {
  shiftWindow: ShiftWindow;
  outgoingLead: string;
  incomingLead?: string;
  isSignedOff: boolean;
  onOpenSignOff: () => void;
  itemsCount: number;
  blockersCount: number;
  reproducibilityHash?: string;
}

export const RelayTransferStrip: React.FC<RelayTransferStripProps> = ({
  shiftWindow,
  outgoingLead,
  incomingLead = 'Alex Rivera (Primary On-Call)',
  isSignedOff,
  onOpenSignOff,
  itemsCount,
  blockersCount,
  reproducibilityHash,
}) => {
  return (
    <div className="bg-[#12171F] border border-[#1E2633] rounded-lg p-4 mb-5 shadow-console relative overflow-hidden">
      {/* Top subtle decorative accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] ${isSignedOff ? 'bg-emerald-500' : 'bg-[#3B82F6]'}`} />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Outgoing Pod (Left 4 cols) */}
        <div className="md:col-span-4 bg-[#0A0D12] border border-[#283446] rounded-md p-3">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#94A3B8] mb-1.5">
            <span className="uppercase text-[#3B82F6] font-semibold flex items-center gap-1.5">
              <User className="w-3 h-3" />
              Outgoing Shift
            </span>
            <span className="text-[#64748B]">{shiftWindow.start.slice(11, 16)} - {shiftWindow.end.slice(11, 16)}</span>
          </div>

          <div className="text-xs font-semibold text-[#F8FAFC]">
            {outgoingLead}
          </div>

          <div className="mt-2 pt-2 border-t border-[#18202C] flex items-center justify-between text-[11px] font-mono text-[#94A3B8]">
            <span>Verified Items: <strong className="text-[#F8FAFC]">{itemsCount}</strong></span>
            {blockersCount > 0 ? (
              <span className="text-[#F59E0B] font-semibold">{blockersCount} Blockers</span>
            ) : (
              <span className="text-emerald-400">All Quiet</span>
            )}
          </div>
        </div>

        {/* Central Conduit / Baton Bridge (Center 4 cols) */}
        <div className="md:col-span-4 flex flex-col items-center justify-center text-center px-2 py-1">
          <div className="flex items-center gap-2 mb-1.5">
            {isSignedOff ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Baton Transferred & Signed</span>
              </span>
            ) : (
              <button
                onClick={() => {
                  playTactileBlip();
                  onOpenSignOff();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#3B82F6]/10 hover:bg-[#3B82F6]/20 border border-[#3B82F6]/40 text-[#3B82F6] transition-colors cursor-pointer group"
              >
                <ShieldCheck className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                <span>Ready for Transfer</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}
          </div>

          {/* Conduit connection line */}
          <div className="w-full flex items-center justify-center gap-1 my-1">
            <div className={`h-[1px] flex-1 ${isSignedOff ? 'bg-emerald-500/40' : 'bg-[#3B82F6]/30'}`} />
            <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
            <div className={`h-[1px] flex-1 ${isSignedOff ? 'bg-emerald-500/40' : 'bg-[#3B82F6]/30'}`} />
          </div>

          <p className="text-[11px] text-[#94A3B8] font-sans">
            {isSignedOff
              ? 'Operational on-call ownership active'
              : 'Review note and complete two-party sign-off'}
          </p>

          {reproducibilityHash && (
            <span className="text-[10px] font-mono text-[#64748B] mt-0.5">
              Fingerprint: {reproducibilityHash.substring(0, 8)}
            </span>
          )}
        </div>

        {/* Incoming Pod (Right 4 cols) */}
        <div className="md:col-span-4 bg-[#0A0D12] border border-[#283446] rounded-md p-3">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#94A3B8] mb-1.5">
            <span className="uppercase text-emerald-400 font-semibold flex items-center gap-1.5">
              <UserCheck className="w-3 h-3" />
              Incoming Shift
            </span>
            <span className="text-[#64748B]">Next On-Call</span>
          </div>

          <div className="text-xs font-semibold text-[#F8FAFC]">
            {incomingLead}
          </div>

          <div className="mt-2 pt-2 border-t border-[#18202C] flex items-center justify-between text-[11px] font-mono">
            <span className="text-[#94A3B8]">Status:</span>
            {isSignedOff ? (
              <span className="text-emerald-400 font-semibold">Ownership Accepted</span>
            ) : (
              <span className="text-[#94A3B8]">Pending Sign-Off</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
