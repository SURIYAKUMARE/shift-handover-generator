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
    <div className="bg-[#12171F] border border-[#1E2633] rounded-xl p-5 sm:p-6 mb-6 shadow-console relative overflow-hidden">
      {/* Top illuminated status conduit accent line */}
      <div className={`absolute top-0 left-0 right-0 h-[3px] ${isSignedOff ? 'bg-emerald-500' : 'bg-[#3B82F6]'}`} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* Outgoing Pod (Left 4 cols) */}
        <div className="lg:col-span-4 bg-[#0A0D12] border border-[#283446] rounded-lg p-4 sm:p-4.5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-mono text-[#94A3B8] mb-2">
            <span className="uppercase text-[#3B82F6] font-bold flex items-center gap-1.5">
              <User className="w-4 h-4" />
              Outgoing Shift
            </span>
            <span className="text-[#64748B] font-semibold">{shiftWindow.start.slice(11, 16)} - {shiftWindow.end.slice(11, 16)}</span>
          </div>

          <div className="text-sm sm:text-base font-bold text-[#F8FAFC]">
            {outgoingLead}
          </div>

          <div className="mt-3 pt-2.5 border-t border-[#18202C] flex items-center justify-between text-xs font-mono text-[#94A3B8]">
            <span>Verified Items: <strong className="text-[#F8FAFC] font-semibold">{itemsCount}</strong></span>
            {blockersCount > 0 ? (
              <span className="text-[#F59E0B] font-bold bg-[#F59E0B]/10 px-2 py-0.5 rounded border border-[#F59E0B]/30">
                {blockersCount} Blockers
              </span>
            ) : (
              <span className="text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                All Quiet
              </span>
            )}
          </div>
        </div>

        {/* Central Conduit / Baton Bridge (Center 4 cols) */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center text-center px-2 py-1">
          <div className="flex items-center gap-2 mb-2">
            {isSignedOff ? (
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 shadow-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>Baton Formally Transferred & Signed</span>
              </span>
            ) : (
              <button
                onClick={() => {
                  playTactileBlip();
                  onOpenSignOff();
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold bg-[#3B82F6]/15 hover:bg-[#3B82F6]/25 border border-[#3B82F6]/50 text-[#3B82F6] transition-all cursor-pointer group shadow-sm hover:shadow-md"
              >
                <ShieldCheck className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Ready for Shift Transfer</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </div>

          {/* Conduit connection line */}
          <div className="w-full flex items-center justify-center gap-1.5 my-1.5">
            <div className={`h-[2px] flex-1 ${isSignedOff ? 'bg-emerald-500/40' : 'bg-[#3B82F6]/30'}`} />
            <span className={`w-2 h-2 rounded-full ${isSignedOff ? 'bg-emerald-400 animate-pulse' : 'bg-[#3B82F6]'}`} />
            <div className={`h-[2px] flex-1 ${isSignedOff ? 'bg-emerald-500/40' : 'bg-[#3B82F6]/30'}`} />
          </div>

          <p className="text-xs sm:text-sm text-[#94A3B8] font-sans">
            {isSignedOff
              ? 'Operational on-call ownership active'
              : 'Review note and complete two-party sign-off'}
          </p>

          {reproducibilityHash && (
            <span className="text-xs font-mono text-[#64748B] mt-1 bg-[#0A0D12] px-2.5 py-0.5 rounded border border-[#1E2633]">
              Fingerprint: <strong className="text-[#3B82F6]">{reproducibilityHash.substring(0, 8)}</strong>
            </span>
          )}
        </div>

        {/* Incoming Pod (Right 4 cols) */}
        <div className="lg:col-span-4 bg-[#0A0D12] border border-[#283446] rounded-lg p-4 sm:p-4.5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-mono text-[#94A3B8] mb-2">
            <span className="uppercase text-emerald-400 font-bold flex items-center gap-1.5">
              <UserCheck className="w-4 h-4" />
              Incoming Shift
            </span>
            <span className="text-[#64748B] font-semibold">Next On-Call</span>
          </div>

          <div className="text-sm sm:text-base font-bold text-[#F8FAFC]">
            {incomingLead}
          </div>

          <div className="mt-3 pt-2.5 border-t border-[#18202C] flex items-center justify-between text-xs font-mono">
            <span className="text-[#94A3B8]">Transfer Status:</span>
            {isSignedOff ? (
              <span className="text-emerald-400 font-bold">Ownership Accepted</span>
            ) : (
              <span className="text-[#94A3B8] font-medium">Pending Sign-Off</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
