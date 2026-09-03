import React from 'react';
import { GeneratedNoteItem, SectionType, ShiftWindow } from '../types';
import { ChevronRight, Clock, Minus } from 'lucide-react';

interface NoteReviewScreenProps {
  items: GeneratedNoteItem[];
  shiftWindow: ShiftWindow;
  onSelectSource: (item: GeneratedNoteItem) => void;
  reproducibilityHash: string;
}

interface SectionTheme {
  title: string;
  dotColor: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  indicatorColor: string;
  subtleGlow: string;
}

const SECTION_THEMES: Record<SectionType, SectionTheme> = {
  'Blockers': {
    title: 'Blockers & Escalations',
    dotColor: 'bg-amber-400',
    badgeBg: 'bg-amber-500/[0.08]',
    badgeBorder: 'border-amber-500/20',
    badgeText: 'text-amber-400',
    indicatorColor: 'bg-amber-500',
    subtleGlow: 'from-amber-500/[0.02]',
  },
  'In Progress': {
    title: 'In Progress',
    dotColor: 'bg-blue-400',
    badgeBg: 'bg-blue-500/[0.08]',
    badgeBorder: 'border-blue-500/20',
    badgeText: 'text-blue-400',
    indicatorColor: 'bg-blue-500',
    subtleGlow: 'from-blue-500/[0.02]',
  },
  'Completed': {
    title: 'Completed',
    dotColor: 'bg-emerald-400',
    badgeBg: 'bg-emerald-500/[0.08]',
    badgeBorder: 'border-emerald-500/20',
    badgeText: 'text-emerald-400',
    indicatorColor: 'bg-emerald-500',
    subtleGlow: 'from-emerald-500/[0.02]',
  },
  'Watch-list': {
    title: 'Watch-list',
    dotColor: 'bg-slate-400',
    badgeBg: 'bg-slate-400/[0.08]',
    badgeBorder: 'border-slate-400/20',
    badgeText: 'text-slate-300',
    indicatorColor: 'bg-slate-400',
    subtleGlow: 'from-slate-500/[0.02]',
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
      {/* Shift Overview Bar */}
      <div className="bg-[#121215] border border-white/[0.07] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <span className="text-[11px] uppercase tracking-wider font-mono text-zinc-400 font-semibold block">
            CONFIRMED SHIFT WINDOW
          </span>
          <div className="text-xs font-mono text-zinc-200 mt-1 flex flex-wrap items-center gap-2">
            <span className="text-blue-400 font-semibold">{shiftWindow.start}</span>
            <span className="text-zinc-600">→</span>
            <span className="text-blue-400 font-semibold">{shiftWindow.end}</span>
            <span className="text-zinc-400 text-[11px] px-1.5 py-0.5 rounded bg-white/[0.03] border border-white/[0.06]">
              {shiftWindow.timezone}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
          <span>SHA-256:</span>
          <span className="text-zinc-200 font-semibold bg-white/[0.03] border border-white/[0.06] px-2 py-0.5 rounded text-[11px]" title={reproducibilityHash}>
            {reproducibilityHash.substring(0, 16)}…
          </span>
        </div>
      </div>

      {/* Four Fixed Sections */}
      <div className="space-y-6">
        {SECTIONS_ORDER.map((sectionType) => {
          const theme = SECTION_THEMES[sectionType];
          const sectionItems = items.filter((item) => item.section === sectionType);

          return (
            <div
              key={sectionType}
              className={`bg-[#121215] bg-gradient-to-b ${theme.subtleGlow} to-transparent border border-white/[0.07] rounded-xl overflow-hidden shadow-sm`}
            >
              {/* Section Header */}
              <div className="px-5 py-3.5 border-b border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {/* Status chip with subtle background tint + colored dot */}
                  <div className={`flex items-center gap-2 px-2.5 py-1 rounded-md ${theme.badgeBg} border ${theme.badgeBorder}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${theme.dotColor}`} />
                    <span className={`text-[11px] font-mono uppercase tracking-wider font-semibold ${theme.badgeText}`}>
                      {theme.title}
                    </span>
                  </div>

                  <span className="text-xs font-mono text-zinc-400 px-1.5 py-0.5 rounded bg-white/[0.03] border border-white/[0.06]">
                    {sectionItems.length}
                  </span>
                </div>

                <div className="text-[11px] text-zinc-400 font-mono hidden sm:inline">
                  {sectionItems.length === 1 ? '1 item logged' : `${sectionItems.length} items logged`}
                </div>
              </div>

              {/* Section Items */}
              <div className="p-4 space-y-3">
                {sectionItems.length === 0 ? (
                  /* Intentional Calm Empty State */
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-white/[0.01] border border-dashed border-white/[0.08] text-zinc-400">
                    <Minus className="w-4 h-4 text-zinc-600 shrink-0" />
                    <div>
                      <span className="text-xs font-medium text-zinc-300 block">
                        Nothing to report
                      </span>
                      <span className="text-[11px] text-zinc-400 font-sans">
                        Confirmed quiet within shift window. No activity matched this operational section.
                      </span>
                    </div>
                  </div>
                ) : (
                  sectionItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="group relative bg-[#151518] hover-lift border border-white/[0.07] rounded-lg p-4 transition-all"
                    >
                      {/* Left indicator accent line */}
                      <div className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-l-lg ${theme.indicatorColor}`} />

                      <div className="pl-2">
                        {/* Item Description */}
                        <p className="text-xs sm:text-sm text-zinc-200 font-normal leading-relaxed">
                          {item.item}
                        </p>

                        {/* Metadata row */}
                        <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-white/[0.05]">
                          <div className="flex flex-wrap items-center gap-3">
                            {/* Source-attribution tag styled like code snippet */}
                            <button
                              type="button"
                              onClick={() => onSelectSource(item)}
                              title="Click to inspect raw source telemetry"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.18] font-mono text-[11px] text-zinc-300 transition-colors"
                            >
                              <span>{item.source}</span>
                              <ChevronRight className="w-3 h-3 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                            </button>

                            {/* Timestamp in monospace */}
                            <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-mono">
                              <Clock className="w-3 h-3 text-zinc-500" />
                              <span>{item.timestamp}</span>
                            </div>
                          </div>

                          {/* Progression Badge if collapsed */}
                          {item.progression && item.progression.length > 1 && (
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-500/[0.06] border border-blue-500/20 text-[11px] font-mono text-blue-300">
                              <span className="text-zinc-400 text-[10px]">Progression:</span>
                              <span>{item.progression.join(' → ')}</span>
                            </div>
                          )}
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
