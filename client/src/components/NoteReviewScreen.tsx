import React from 'react';
import { GeneratedNoteItem, SectionType, ShiftWindow } from '../types';
import { ShieldCheck, ArrowRight, Minus } from 'lucide-react';

interface NoteReviewScreenProps {
  items: GeneratedNoteItem[];
  shiftWindow: ShiftWindow;
  onSelectSource: (item: GeneratedNoteItem) => void;
  reproducibilityHash: string;
}

interface SectionCategory {
  title: string;
  incomingInstruction: string;
  dotColor: string;
  borderColor: string;
  badgeBg: string;
  badgeText: string;
}

const SECTION_CATEGORIES: Record<SectionType, SectionCategory> = {
  'Blockers': {
    title: 'Blockers & Escalations',
    incomingInstruction: 'Requires immediate intervention or on-call contact by incoming shift',
    dotColor: 'bg-[#D29922]',
    borderColor: 'border-[#D29922]/30',
    badgeBg: 'bg-[#D29922]/10',
    badgeText: 'text-[#D29922]',
  },
  'In Progress': {
    title: 'In Progress',
    incomingInstruction: 'Active investigations and changes currently underway',
    dotColor: 'bg-[#58A6FF]',
    borderColor: 'border-[#58A6FF]/30',
    badgeBg: 'bg-[#58A6FF]/10',
    badgeText: 'text-[#58A6FF]',
  },
  'Completed': {
    title: 'Completed',
    incomingInstruction: 'Closed or mitigated during this shift; no immediate action required',
    dotColor: 'bg-[#3FB950]',
    borderColor: 'border-[#3FB950]/30',
    badgeBg: 'bg-[#3FB950]/10',
    badgeText: 'text-[#3FB950]',
  },
  'Watch-list': {
    title: 'Watch-list',
    incomingInstruction: 'Under soak-period observation or displaying intermittent fluctuation',
    dotColor: 'bg-[#8B949E]',
    borderColor: 'border-[#8B949E]/30',
    badgeBg: 'bg-[#8B949E]/10',
    badgeText: 'text-[#8B949E]',
  },
};

const SECTIONS_ORDER: SectionType[] = ['Blockers', 'In Progress', 'Completed', 'Watch-list'];

export const NoteReviewScreen: React.FC<NoteReviewScreenProps> = ({
  items,
  shiftWindow,
  onSelectSource,
  reproducibilityHash,
}) => {
  return (
    <div className="space-y-6 pb-20">
      {/* Ledger Manifest Header */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-md p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#3FB950]" />
            <span className="text-xs font-semibold text-[#F0F6FC]">
              Verified Shift Handover Record
            </span>
          </div>
          <p className="text-xs text-[#8B949E] mt-1 font-sans">
            Strictly windowed to <span className="text-[#F0F6FC] font-mono">{shiftWindow.start}</span> through <span className="text-[#F0F6FC] font-mono">{shiftWindow.end}</span>. All items below are traceable to raw source records.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[#8B949E] shrink-0">
          <span>SHA-256 Digest:</span>
          <span className="text-[#58A6FF] font-medium bg-[#0D1117] border border-[#30363D] px-2 py-0.5 rounded text-[11px]" title={reproducibilityHash}>
            {reproducibilityHash.substring(0, 16)}...
          </span>
        </div>
      </div>

      {/* Four Load-Bearing Shift Sections */}
      <div className="space-y-5">
        {SECTIONS_ORDER.map((sectionKey) => {
          const cat = SECTION_CATEGORIES[sectionKey];
          const sectionItems = items.filter((i) => i.section === sectionKey);

          return (
            <div
              key={sectionKey}
              className={`bg-[#161B22] border ${cat.borderColor} rounded-md overflow-hidden shadow-sm`}
            >
              {/* Section Watch Bar */}
              <div className="px-4 py-3 bg-[#0D1117] border-b border-[#30363D] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className={`w-2 h-2 rounded-full ${cat.dotColor}`} />
                  <h3 className="text-xs font-semibold text-[#F0F6FC] uppercase tracking-wide">
                    {cat.title}
                  </h3>
                  <span className="text-[11px] font-mono text-[#8B949E] px-1.5 py-0.2 rounded bg-[#161B22] border border-[#30363D]">
                    {sectionItems.length}
                  </span>
                </div>

                <div className="text-[11px] text-[#8B949E] font-sans hidden sm:inline">
                  {cat.incomingInstruction}
                </div>
              </div>

              {/* Section Ledger Items */}
              <div className="p-3.5 space-y-2.5">
                {sectionItems.length === 0 ? (
                  /* Deliberate, Calm Empty State */
                  <div className="p-3 rounded bg-[#0D1117] border border-dashed border-[#30363D] text-[#8B949E] flex items-center gap-3">
                    <Minus className="w-4 h-4 text-[#6E7681] shrink-0" />
                    <div>
                      <span className="text-xs font-medium text-[#C9D1D9] block">
                        Nothing to report
                      </span>
                      <span className="text-[11px] text-[#8B949E]">
                        Confirmed quiet: zero telemetry events matched this section within the operating window.
                      </span>
                    </div>
                  </div>
                ) : (
                  sectionItems.map((item, idx) => (
                    /* Sourced Item Evidence Docket Entry */
                    <div
                      key={idx}
                      className="bg-[#0D1117] border border-[#30363D] rounded p-3 hover:border-[#8B949E]/40 transition-colors"
                    >
                      {/* Operational Line */}
                      <p className="text-xs sm:text-[13px] text-[#F0F6FC] font-normal leading-relaxed">
                        {item.item}
                      </p>

                      {/* Evidence Dock: Grounding proof */}
                      <div className="mt-2.5 pt-2 border-t border-[#21262D] flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2.5">
                          {/* Sourced badge styled as verifiable code token */}
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#161B22] border border-[#30363D] font-mono text-[11px] text-[#C9D1D9]">
                            <span className="text-[#8B949E]">Record:</span>
                            <span className="text-[#58A6FF] font-semibold">{item.source}</span>
                          </div>

                          {/* Load-bearing Timestamp mark */}
                          <div className="text-[11px] font-mono text-[#8B949E]">
                            <span>Logged: {item.timestamp}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {/* Progression history if collapsed */}
                          {item.progression && item.progression.length > 1 && (
                            <div className="text-[11px] font-mono text-[#8B949E]">
                              <span>State path: </span>
                              <span className="text-[#C9D1D9]">{item.progression.join(' → ')}</span>
                            </div>
                          )}

                          {/* 2-Click Grounding Verification Trigger */}
                          <button
                            type="button"
                            onClick={() => onSelectSource(item)}
                            className="inline-flex items-center gap-1 text-[11px] font-sans font-medium text-[#58A6FF] hover:text-[#79C0FF] hover:underline"
                          >
                            <span>Inspect evidence</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
