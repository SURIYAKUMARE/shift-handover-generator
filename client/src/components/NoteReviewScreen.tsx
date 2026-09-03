import React, { useState, useMemo } from 'react';
import { GeneratedNoteItem, SectionType, ShiftWindow } from '../types';
import { ShieldCheck, ArrowRight, Minus, Search, LayoutGrid, List, Check, Copy, CheckCircle2, UserCheck } from 'lucide-react';

interface NoteReviewScreenProps {
  items: GeneratedNoteItem[];
  shiftWindow: ShiftWindow;
  onSelectSource: (item: GeneratedNoteItem) => void;
  reproducibilityHash: string;
  onOpenSignOff: () => void;
  isSignedOff: boolean;
  signedOffBy?: string;
}

interface SectionCategory {
  title: string;
  incomingInstruction: string;
  dotColor: string;
  borderColor: string;
}

const SECTION_CATEGORIES: Record<SectionType, SectionCategory> = {
  'Blockers': {
    title: 'Blockers & Escalations',
    incomingInstruction: 'Requires immediate intervention or on-call contact by incoming shift',
    dotColor: 'bg-[#D29922]',
    borderColor: 'border-[#D29922]/30',
  },
  'In Progress': {
    title: 'In Progress',
    incomingInstruction: 'Active investigations and changes currently underway',
    dotColor: 'bg-[#58A6FF]',
    borderColor: 'border-[#58A6FF]/30',
  },
  'Completed': {
    title: 'Completed',
    incomingInstruction: 'Closed or mitigated during this shift; no immediate action required',
    dotColor: 'bg-[#3FB950]',
    borderColor: 'border-[#3FB950]/30',
  },
  'Watch-list': {
    title: 'Watch-list',
    incomingInstruction: 'Under soak-period observation or displaying intermittent fluctuation',
    dotColor: 'bg-[#8B949E]',
    borderColor: 'border-[#8B949E]/30',
  },
};

const SECTIONS_ORDER: SectionType[] = ['Blockers', 'In Progress', 'Completed', 'Watch-list'];

export const NoteReviewScreen: React.FC<NoteReviewScreenProps> = ({
  items,
  shiftWindow,
  onSelectSource,
  reproducibilityHash,
  onOpenSignOff,
  isSignedOff,
  signedOffBy,
}) => {
  // Filters & View State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'All' | SectionType>('All');
  const [viewMode, setViewMode] = useState<'docket' | 'compact'>('docket');
  const [copiedSlack, setCopiedSlack] = useState(false);

  // Filtered items based on search and category
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCat = activeCategory === 'All' || item.section === activeCategory;
      if (!matchesCat) return false;

      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return (
        item.item.toLowerCase().includes(query) ||
        item.source.toLowerCase().includes(query) ||
        item.timestamp.toLowerCase().includes(query) ||
        (item.progression && item.progression.some((p) => p.toLowerCase().includes(query)))
      );
    });
  }, [items, activeCategory, searchQuery]);

  // Copy Slack/Teams Formatted Markdown
  const handleCopySlack = () => {
    let md = `*SHIFT HANDOVER NOTE*\n`;
    md += `*Window:* ${shiftWindow.start} to ${shiftWindow.end} (${shiftWindow.timezone})\n`;
    md += `*SHA-256 Digest:* \`${reproducibilityHash}\`\n\n`;

    for (const sec of SECTIONS_ORDER) {
      const secItems = items.filter((i) => i.section === sec);
      md += `*${sec.toUpperCase()} (${secItems.length})*\n`;
      if (secItems.length === 0) {
        md += `• _Nothing to report (confirmed quiet within shift window)_\n`;
      } else {
        for (const itm of secItems) {
          md += `• ${itm.item} \`[${itm.source} - ${itm.timestamp}]\`\n`;
        }
      }
      md += `\n`;
    }

    navigator.clipboard.writeText(md);
    setCopiedSlack(true);
    setTimeout(() => setCopiedSlack(false), 2000);
  };

  return (
    <div className="space-y-5 pb-20">
      {/* Ledger Manifest Header */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-md p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#3FB950]" />
            <span className="text-xs font-semibold text-[#F0F6FC]">
              Verified Shift Handover Record
            </span>
            {isSignedOff && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#3FB950]/15 border border-[#3FB950]/30 text-[#3FB950] font-sans text-[11px] font-medium">
                <CheckCircle2 className="w-3 h-3" />
                <span>Accepted by {signedOffBy}</span>
              </span>
            )}
          </div>
          <p className="text-xs text-[#8B949E] mt-1 font-sans">
            Window interval <span className="text-[#F0F6FC] font-mono">{shiftWindow.start}</span> through <span className="text-[#F0F6FC] font-mono">{shiftWindow.end}</span>. Sourced telemetry only.
          </p>
        </div>

        {/* Handover Sign-off & Slack Copy Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopySlack}
            title="Copy structured Markdown for Slack / Teams"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#21262D] hover:bg-[#30363D] border border-[#30363D] text-xs font-sans text-[#F0F6FC] transition-colors"
          >
            {copiedSlack ? <Check className="w-3.5 h-3.5 text-[#3FB950]" /> : <Copy className="w-3.5 h-3.5 text-[#8B949E]" />}
            <span>{copiedSlack ? 'Copied for Slack' : 'Copy for Slack'}</span>
          </button>

          <button
            onClick={onOpenSignOff}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-semibold text-white transition-colors ${
              isSignedOff
                ? 'bg-[#21262D] hover:bg-[#30363D] border border-[#30363D] text-[#3FB950]'
                : 'bg-[#238636] hover:bg-[#2EA043] border border-[rgba(240,246,252,0.1)] shadow-sm'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>{isSignedOff ? 'View Transfer Record' : 'Sign Off & Hand Over Shift'}</span>
          </button>
        </div>
      </div>

      {/* Operational Search, Category Filters, and Density Switcher */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#161B22] border border-[#30363D] rounded-md p-2.5">
        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1 text-xs">
          <button
            onClick={() => setActiveCategory('All')}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
              activeCategory === 'All'
                ? 'bg-[#21262D] text-[#F0F6FC] font-semibold border border-[#30363D]'
                : 'text-[#8B949E] hover:text-[#F0F6FC]'
            }`}
          >
            All Items ({items.length})
          </button>

          {SECTIONS_ORDER.map((sec) => {
            const count = items.filter((i) => i.section === sec).length;
            const isSelected = activeCategory === sec;
            const color = SECTION_CATEGORIES[sec].dotColor;

            return (
              <button
                key={sec}
                onClick={() => setActiveCategory(sec)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  isSelected
                    ? 'bg-[#21262D] text-[#F0F6FC] font-semibold border border-[#30363D]'
                    : 'text-[#8B949E] hover:text-[#F0F6FC]'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${color}`} />
                <span>{sec} ({count})</span>
              </button>
            );
          })}
        </div>

        {/* Right: Search Box + View Mode Toggle */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 md:w-56">
            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-[#6E7681]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search records, tickets, terms..."
              className="w-full bg-[#0D1117] border border-[#30363D] rounded pl-8 pr-2.5 py-1 text-xs text-[#F0F6FC] placeholder-[#6E7681] focus:outline-none focus:border-[#58A6FF]"
            />
          </div>

          {/* Density Switcher */}
          <div className="flex items-center border border-[#30363D] rounded bg-[#0D1117] p-0.5">
            <button
              onClick={() => setViewMode('docket')}
              title="Expanded Evidence Docket View"
              className={`p-1 rounded ${viewMode === 'docket' ? 'bg-[#21262D] text-[#F0F6FC]' : 'text-[#8B949E] hover:text-[#F0F6FC]'}`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('compact')}
              title="Compact Operational Table View"
              className={`p-1 rounded ${viewMode === 'compact' ? 'bg-[#21262D] text-[#F0F6FC]' : 'text-[#8B949E] hover:text-[#F0F6FC]'}`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Sections Rendering */}
      {viewMode === 'docket' ? (
        /* Docket View */
        <div className="space-y-5">
          {SECTIONS_ORDER.filter((sec) => activeCategory === 'All' || activeCategory === sec).map((sectionKey) => {
            const cat = SECTION_CATEGORIES[sectionKey];
            const sectionItems = filteredItems.filter((i) => i.section === sectionKey);

            return (
              <div
                key={sectionKey}
                className={`bg-[#161B22] border ${cat.borderColor} rounded-md overflow-hidden shadow-sm`}
              >
                {/* Section Watch Bar */}
                <div className="px-4 py-2.5 bg-[#0D1117] border-b border-[#30363D] flex items-center justify-between">
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
                      <div
                        key={idx}
                        className={`bg-[#0D1117] border rounded p-3 transition-colors ${
                          item.carried_forward && (item.shifts_open || 1) >= 3
                            ? 'border-[#D29922] bg-[#D29922]/5 shadow-sm'
                            : item.carried_forward
                            ? 'border-[#30363D] border-l-2 border-l-[#58A6FF]/60 hover:border-[#8B949E]/40'
                            : 'border-[#30363D] hover:border-[#8B949E]/40'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-xs sm:text-[13px] text-[#F0F6FC] font-normal leading-relaxed flex-1">
                            {item.item}
                          </p>

                          {/* Carry-Forward Tags */}
                          {item.carried_forward && (
                            <div className="shrink-0">
                              {(item.shifts_open || 1) >= 3 ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#D29922]/20 border border-[#D29922] text-[#D29922]">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#D29922] animate-pulse" />
                                  STALE ({item.shifts_open} SHIFTS OPEN)
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono text-[#8B949E] bg-[#161B22] border border-[#30363D]">
                                  carried over · {item.shifts_open || 1} shifts
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {item.source_unavailable && (
                          <div className="mt-1 text-[11px] font-mono text-[#D29922] bg-[#D29922]/10 px-2 py-0.5 rounded border border-[#D29922]/30">
                            Warning: Source record no longer available in upstream system
                          </div>
                        )}

                        <div className="mt-2.5 pt-2 border-t border-[#21262D] flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#161B22] border border-[#30363D] font-mono text-[11px] text-[#C9D1D9]">
                              <span className="text-[#8B949E]">Record:</span>
                              <span className="text-[#58A6FF] font-semibold">{item.source}</span>
                            </div>

                            <div className="text-[11px] font-mono text-[#8B949E]">
                              <span>Logged: {item.timestamp}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {item.progression && item.progression.length > 1 && (
                              <div className="text-[11px] font-mono text-[#8B949E]">
                                <span>State path: </span>
                                <span className="text-[#C9D1D9]">{item.progression.join(' → ')}</span>
                              </div>
                            )}

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
      ) : (
        /* High-Density Compact Ops Table View */
        <div className="bg-[#161B22] border border-[#30363D] rounded-md overflow-x-auto shadow-sm">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-[#30363D] bg-[#0D1117] text-[#8B949E] text-[11px] font-mono uppercase tracking-wider">
                <th className="py-2.5 px-3 w-36">Category</th>
                <th className="py-2.5 px-3 w-40">Citation</th>
                <th className="py-2.5 px-3">Item Summary</th>
                <th className="py-2.5 px-3 w-44">Logged Time</th>
                <th className="py-2.5 px-3 w-28 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#21262D]">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-[#8B949E] font-sans text-xs">
                    No items match the active filter or query.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#1C2128] transition-colors">
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#F0F6FC]">
                          <span className={`w-1.5 h-1.5 rounded-full ${SECTION_CATEGORIES[item.section].dotColor}`} />
                          <span>{item.section}</span>
                        </span>
                        {item.carried_forward && (
                          <span
                            className={`text-[9px] font-mono px-1 py-0.2 rounded border ${
                              (item.shifts_open || 1) >= 3
                                ? 'bg-[#D29922]/20 border-[#D29922] text-[#D29922] font-semibold'
                                : 'bg-[#161B22] border-[#30363D] text-[#8B949E]'
                            }`}
                            title={`Carried over across ${item.shifts_open || 1} consecutive shifts`}
                          >
                            {(item.shifts_open || 1) >= 3 ? `${item.shifts_open}s STALE` : `${item.shifts_open}s`}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-[#58A6FF] whitespace-nowrap">
                      {item.source}
                    </td>
                    <td className="py-2.5 px-3 text-[#F0F6FC] font-normal leading-tight">
                      {item.item}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-[#8B949E] whitespace-nowrap">
                      {item.timestamp}
                    </td>
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => onSelectSource(item)}
                        className="text-[11px] font-medium text-[#58A6FF] hover:underline"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
