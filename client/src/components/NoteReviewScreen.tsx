import React from 'react';
import { GeneratedNoteItem, SectionType, ShiftWindow } from '../types';
import { AlertCircle, Clock, CheckCircle, Eye, ChevronRight, Hash, ShieldCheck } from 'lucide-react';

interface NoteReviewScreenProps {
  items: GeneratedNoteItem[];
  shiftWindow: ShiftWindow;
  onSelectSource: (item: GeneratedNoteItem) => void;
  reproducibilityHash: string;
}

const SECTION_CONFIG: Record<
  SectionType,
  {
    title: string;
    description: string;
    icon: React.ReactNode;
    colorClasses: {
      border: string;
      badge: string;
      headerText: string;
      headerBg: string;
      accentLine: string;
    };
  }
> = {
  'Blockers': {
    title: 'Blockers & Escalations',
    description: 'Active impediments, critical severity outages, and items requiring on-call paging or external team support.',
    icon: <AlertCircle className="w-4 h-4 text-amber-400" />,
    colorClasses: {
      border: 'border-amber-500/30',
      badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/25',
      headerText: 'text-amber-400',
      headerBg: 'bg-amber-500/10',
      accentLine: 'bg-amber-500',
    },
  },
  'In Progress': {
    title: 'In Progress',
    description: 'Active investigations, deployments in transit, or open maintenance tasks underway.',
    icon: <Clock className="w-4 h-4 text-blue-400" />,
    colorClasses: {
      border: 'border-blue-500/30',
      badge: 'bg-blue-500/15 text-blue-300 border-blue-500/30 hover:bg-blue-500/25',
      headerText: 'text-blue-400',
      headerBg: 'bg-blue-500/10',
      accentLine: 'bg-blue-500',
    },
  },
  'Completed': {
    title: 'Completed',
    description: 'Incidents resolved, changes safely rolled out, and tickets closed during this shift window.',
    icon: <CheckCircle className="w-4 h-4 text-emerald-400" />,
    colorClasses: {
      border: 'border-emerald-500/30',
      badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25',
      headerText: 'text-emerald-400',
      headerBg: 'bg-emerald-500/10',
      accentLine: 'bg-emerald-500',
    },
  },
  'Watch-list': {
    title: 'Watch-list & Observation',
    description: 'Post-resolution soak monitoring, intermittent edge fluctuations, and components under observation.',
    icon: <Eye className="w-4 h-4 text-purple-400" />,
    colorClasses: {
      border: 'border-purple-500/30',
      badge: 'bg-purple-500/15 text-purple-300 border-purple-500/30 hover:bg-purple-500/25',
      headerText: 'text-purple-400',
      headerBg: 'bg-purple-500/10',
      accentLine: 'bg-purple-500',
    },
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
    <div className="space-y-8 pb-16">
      {/* Shift Window Header Summary Bar */}
      <div className="bg-noc-panel border border-noc-border rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-mono tracking-wider text-noc-muted block">
            CONFIRMED SHIFT INTERVAL
          </span>
          <div className="text-sm font-mono text-noc-text mt-0.5 flex flex-wrap items-center gap-2">
            <span className="font-semibold text-blue-400">{shiftWindow.start}</span>
            <span className="text-noc-muted">→</span>
            <span className="font-semibold text-blue-400">{shiftWindow.end}</span>
            <span className="text-xs px-2 py-0.5 rounded bg-noc-card border border-noc-border text-noc-muted">
              {shiftWindow.timezone}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <Hash className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span className="text-noc-muted">CHECKSUM:</span>
          <span className="text-blue-400 font-bold tracking-wider" title={reproducibilityHash}>
            {reproducibilityHash.substring(0, 16)}…
          </span>
        </div>
      </div>

      {/* Four Fixed Sections */}
      <div className="space-y-6">
        {SECTIONS_ORDER.map((sectionType) => {
          const sectionConfig = SECTION_CONFIG[sectionType];
          const sectionItems = items.filter((item) => item.section === sectionType);

          return (
            <div
              key={sectionType}
              className={`bg-noc-panel border ${sectionConfig.colorClasses.border} rounded-xl overflow-hidden shadow-sm transition-all`}
            >
              {/* Section Header */}
              <div
                className={`px-5 py-3.5 flex items-center justify-between border-b border-noc-border ${sectionConfig.colorClasses.headerBg}`}
              >
                <div className="flex items-center gap-2.5">
                  {sectionConfig.icon}
                  <h3 className={`text-sm font-semibold tracking-wide ${sectionConfig.colorClasses.headerText} uppercase font-mono`}>
                    {sectionConfig.title}
                  </h3>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-noc-card border border-noc-border text-noc-text font-medium">
                    {sectionItems.length}
                  </span>
                </div>
                <span className="text-[11px] text-noc-muted hidden sm:inline-block">
                  {sectionConfig.description}
                </span>
              </div>

              {/* Section Content */}
              <div className="p-4 space-y-3">
                {sectionItems.length === 0 ? (
                  /* Calm "Nothing to report" state */
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-noc-card/40 border border-dashed border-noc-border text-noc-muted">
                    <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <span className="text-xs font-medium text-slate-300 block">
                        Nothing to report
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Confirmed quiet within the shift window. No active events matched this section.
                      </span>
                    </div>
                  </div>
                ) : (
                  /* List of Note Items */
                  sectionItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="group relative bg-noc-card hover:bg-noc-card/80 border border-noc-border hover:border-noc-borderLight rounded-lg p-4 transition-all"
                    >
                      {/* Left color bar */}
                      <div
                        className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${sectionConfig.colorClasses.accentLine}`}
                      />

                      <div className="pl-2">
                        {/* Title line */}
                        <div className="text-sm text-noc-text font-medium leading-relaxed">
                          {item.item}
                        </div>

                        {/* Metadata row */}
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-noc-border/60">
                          <div className="flex flex-wrap items-center gap-3">
                            {/* Clickable Source Badge */}
                            <button
                              type="button"
                              onClick={() => onSelectSource(item)}
                              title="Click to drill down into raw source events"
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono font-semibold border transition-all ${sectionConfig.colorClasses.badge}`}
                            >
                              <span>{item.source}</span>
                              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                            </button>

                            {/* Timestamp */}
                            <div className="flex items-center gap-1.5 text-xs text-noc-muted font-mono">
                              <Clock className="w-3 h-3" />
                              <span>{item.timestamp}</span>
                            </div>
                          </div>

                          {/* Progression badge if collapsed */}
                          {item.progression && item.progression.length > 1 && (
                            <div className="text-[11px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                              Progression: {item.progression.join(' → ')}
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
