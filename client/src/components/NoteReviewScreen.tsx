import React, { useState, useMemo } from 'react';
import { GeneratedNoteItem, SectionType, ShiftWindow } from '../types';
import { ShieldCheck, ArrowRight, Minus, Search, LayoutGrid, List, Check, Copy, CheckCircle2, UserCheck, AlertOctagon } from 'lucide-react';

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
    dotColor: 'bg-[#F59E0B]',
    borderColor: 'border-[#F59E0B]/35',
  },
  'In Progress': {
    title: 'In Progress',
    incomingInstruction: 'Active investigations and changes currently underway',
    dotColor: 'bg-[#3B82F6]',
    borderColor: 'border-[#3B82F6]/35',
  },
  'Completed': {
    title: 'Completed',
    incomingInstruction: 'Closed or mitigated during this shift; no immediate action required',
    dotColor: 'bg-[#10B981]',
    borderColor: 'border-[#10B981]/35',
  },
  'Watch-list': {
    title: 'Watch-list',
    incomingInstruction: 'Under soak-period observation or displaying intermittent fluctuation',
    dotColor: 'bg-[#94A3B8]',
    borderColor: 'border-[#94A3B8]/35',
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
          const heldTag = itm.carried_forward ? ` [HELD OVER: ${itm.shifts_open} SHIFTS]` : '';
          md += `• ${itm.item}${heldTag} \`[${itm.source} - ${itm.timestamp}]\`\n`;
        }
      }
      md += `\n`;
    }

    navigator.clipboard.writeText(md);
    setCopiedSlack(true);
    setTimeout(() => setCopiedSlack(false), 2000);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Ledger Manifest Header (Larger & More Prominent) */}
      <div className="bg-[#12171F] border border-[#1E2633] rounded-xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-console">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-sm sm:text-base font-bold text-[#F8FAFC]">
              Verified Shift Handover Record
            </span>
            {isSignedOff && (
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-sans text-xs sm:text-sm font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Accepted by {signedOffBy}</span>
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-1.5 font-sans">
            Operating window <span className="text-[#F8FAFC] font-mono font-semibold">{shiftWindow.start}</span> through <span className="text-[#F8FAFC] font-mono font-semibold">{shiftWindow.end}</span>. Sourced telemetry only.
          </p>
        </div>

        {/* Handover Sign-off & Slack Copy Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleCopySlack}
            title="Copy structured Markdown for Slack / Teams (Hotkey: M)"
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#18202C] hover:bg-[#1D2635] border border-[#283446] text-xs sm:text-sm font-medium text-[#F8FAFC] transition-colors shadow-sm"
          >
            {copiedSlack ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[#94A3B8]" />}
            <span>{copiedSlack ? 'Copied for Slack' : 'Copy for Slack'}</span>
          </button>

          <button
            onClick={onOpenSignOff}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs sm:text-sm font-bold text-white transition-colors shadow-sm ${
              isSignedOff
                ? 'bg-[#18202C] hover:bg-[#1D2635] border border-[#283446] text-emerald-400'
                : 'bg-emerald-600 hover:bg-emerald-700 border border-[rgba(255,255,255,0.15)]'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>{isSignedOff ? 'View Transfer Record' : 'Sign Off & Hand Over Shift'}</span>
          </button>
        </div>
      </div>

      {/* Operational Search, Category Filters, and Density Switcher */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#12171F] border border-[#1E2633] rounded-xl p-3 sm:p-3.5 shadow-console">
        {/* Category Filter Pills (Larger) */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm">
          <button
            onClick={() => setActiveCategory('All')}
            className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition-colors ${
              activeCategory === 'All'
                ? 'bg-[#18202C] text-[#F8FAFC] border border-[#3B82F6]'
                : 'text-[#94A3B8] hover:text-[#F8FAFC]'
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
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition-colors ${
                  isSelected
                    ? 'bg-[#18202C] text-[#F8FAFC] border border-[#3B82F6]'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${color}`} />
                <span>{sec} ({count})</span>
              </button>
            );
          })}
        </div>

        {/* Right: Search Box + View Mode Toggle */}
        <div className="flex items-center gap-2.5">
          {/* Search */}
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#64748B]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search records, tickets, terms..."
              className="w-full bg-[#0A0D12] border border-[#283446] rounded-md pl-9 pr-3 py-1.5 text-xs sm:text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#3B82F6]"
            />
          </div>

          {/* Density Switcher */}
          <div className="flex items-center border border-[#283446] rounded-md bg-[#0A0D12] p-1">
            <button
              onClick={() => setViewMode('docket')}
              title="Expanded Evidence Docket View"
              className={`p-1.5 rounded ${viewMode === 'docket' ? 'bg-[#18202C] text-[#F8FAFC]' : 'text-[#94A3B8] hover:text-[#F8FAFC]'}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('compact')}
              title="Compact Operational Table View"
              className={`p-1.5 rounded ${viewMode === 'compact' ? 'bg-[#18202C] text-[#F8FAFC]' : 'text-[#94A3B8] hover:text-[#F8FAFC]'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Sections Rendering */}
      {viewMode === 'docket' ? (
        /* Docket View (Larger & More Legible) */
        <div className="space-y-6">
          {SECTIONS_ORDER.filter((sec) => activeCategory === 'All' || activeCategory === sec).map((sectionKey) => {
            const cat = SECTION_CATEGORIES[sectionKey];
            const sectionItems = filteredItems.filter((i) => i.section === sectionKey);

            return (
              <div
                key={sectionKey}
                className={`bg-[#12171F] border ${cat.borderColor} rounded-xl overflow-hidden shadow-console`}
              >
                {/* Section Watch Bar */}
                <div className="px-5 py-3.5 bg-[#0A0D12] border-b border-[#1E2633] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`w-2.5 h-2.5 rounded-full ${cat.dotColor}`} />
                    <h3 className="text-xs sm:text-sm font-bold text-[#F8FAFC] uppercase tracking-wide">
                      {cat.title}
                    </h3>
                    <span className="text-xs font-mono font-bold text-[#94A3B8] px-2 py-0.5 rounded bg-[#18202C] border border-[#283446]">
                      {sectionItems.length}
                    </span>
                  </div>

                  <div className="text-xs sm:text-sm text-[#94A3B8] font-sans hidden sm:inline">
                    {cat.incomingInstruction}
                  </div>
                </div>

                {/* Section Ledger Items */}
                <div className="p-4 sm:p-5 space-y-3.5">
                  {sectionItems.length === 0 ? (
                    <div className="p-4 rounded-lg bg-[#0A0D12] border border-dashed border-[#283446] text-[#94A3B8] flex items-center gap-3">
                      <Minus className="w-5 h-5 text-[#64748B] shrink-0" />
                      <div>
                        <span className="text-sm font-semibold text-[#F8FAFC] block">
                          Nothing to report
                        </span>
                        <span className="text-xs sm:text-sm text-[#94A3B8]">
                          Confirmed quiet: zero telemetry events matched this section within the operating window.
                        </span>
                      </div>
                    </div>
                  ) : (
                    sectionItems.map((item, idx) => (
                      <div
                        key={idx}
                        className={`bg-[#0A0D12] border rounded-lg p-4 sm:p-4.5 transition-colors ${
                          item.carried_forward && (item.shifts_open || 1) >= 3
                            ? 'border-[#F59E0B] bg-[#F59E0B]/5 shadow-sm'
                            : item.carried_forward
                            ? 'border-[#1E2633] border-l-4 border-l-[#3B82F6] hover:border-[#3B82F6]/60'
                            : 'border-[#1E2633] hover:border-[#283446]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <p className="text-sm sm:text-base text-[#F8FAFC] font-normal leading-relaxed flex-1">
                            {item.item}
                          </p>

                          {/* Carry-Forward Tags */}
                          {item.carried_forward && (
                            <div className="shrink-0">
                              {(item.shifts_open || 1) >= 3 ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono font-bold bg-[#F59E0B]/20 border border-[#F59E0B] text-[#F59E0B]">
                                  <AlertOctagon className="w-3.5 h-3.5" />
                                  STALE ({item.shifts_open} SHIFTS OPEN)
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono text-[#94A3B8] bg-[#12171F] border border-[#283446]">
                                  carried over · {item.shifts_open || 1} shifts
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {item.source_unavailable && (
                          <div className="mt-2 text-xs font-mono text-[#F59E0B] bg-[#F59E0B]/10 px-3 py-1 rounded border border-[#F59E0B]/30">
                            Warning: Source record no longer available in upstream system
                          </div>
                        )}

                        <div className="mt-3 pt-3 border-t border-[#18202C] flex flex-wrap items-center justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-3">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#12171F] border border-[#283446] font-mono text-xs text-[#F8FAFC]">
                              <span className="text-[#94A3B8]">Record:</span>
                              <span className="text-[#3B82F6] font-bold">{item.source}</span>
                            </div>

                            <div className="text-xs font-mono text-[#94A3B8]">
                              <span>Logged: {item.timestamp}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3.5">
                            {item.progression && item.progression.length > 1 && (
                              <div className="text-xs font-mono text-[#94A3B8]">
                                <span>State path: </span>
                                <span className="text-[#F8FAFC] font-semibold">{item.progression.join(' → ')}</span>
                              </div>
                            )}

                            <button
                              type="button"
                              onClick={() => onSelectSource(item)}
                              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-sans font-semibold text-[#3B82F6] hover:text-blue-400 hover:underline"
                            >
                              <span>Inspect evidence</span>
                              <ArrowRight className="w-3.5 h-3.5" />
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
        /* High-Density Compact Ops Table View (Larger) */
        <div className="bg-[#12171F] border border-[#1E2633] rounded-xl overflow-x-auto shadow-console">
          <table className="w-full text-left text-xs sm:text-sm font-sans">
            <thead>
              <tr className="border-b border-[#1E2633] bg-[#0A0D12] text-[#94A3B8] text-xs font-mono uppercase tracking-wider">
                <th className="py-3 px-4 w-40">Category</th>
                <th className="py-3 px-4 w-44">Citation</th>
                <th className="py-3 px-4">Item Summary</th>
                <th className="py-3 px-4 w-48">Logged Time</th>
                <th className="py-3 px-4 w-32 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#18202C]">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#94A3B8] font-sans text-sm">
                    No items match the active filter or query.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#18202C] transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#F8FAFC]">
                          <span className={`w-2 h-2 rounded-full ${SECTION_CATEGORIES[item.section].dotColor}`} />
                          <span>{item.section}</span>
                        </span>
                        {item.carried_forward && (
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                              (item.shifts_open || 1) >= 3
                                ? 'bg-[#F59E0B]/20 border-[#F59E0B] text-[#F59E0B] font-bold'
                                : 'bg-[#0A0D12] border-[#283446] text-[#94A3B8]'
                            }`}
                            title={`Carried over across ${item.shifts_open || 1} consecutive shifts`}
                          >
                            {(item.shifts_open || 1) >= 3 ? `${item.shifts_open}s STALE` : `${item.shifts_open}s`}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-[#3B82F6] font-semibold whitespace-nowrap">
                      {item.source}
                    </td>
                    <td className="py-3 px-4 text-[#F8FAFC] font-normal leading-relaxed text-sm">
                      {item.item}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-[#94A3B8] whitespace-nowrap">
                      {item.timestamp}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => onSelectSource(item)}
                        className="text-xs sm:text-sm font-semibold text-[#3B82F6] hover:underline"
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
