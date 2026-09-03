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
    borderColor: 'border-[#F59E0B]/30',
  },
  'In Progress': {
    title: 'In Progress',
    incomingInstruction: 'Active investigations and changes currently underway',
    dotColor: 'bg-[#3B82F6]',
    borderColor: 'border-[#3B82F6]/30',
  },
  'Completed': {
    title: 'Completed',
    incomingInstruction: 'Closed or mitigated during this shift; no immediate action required',
    dotColor: 'bg-[#10B981]',
    borderColor: 'border-[#10B981]/30',
  },
  'Watch-list': {
    title: 'Watch-list',
    incomingInstruction: 'Under soak-period observation or displaying intermittent fluctuation',
    dotColor: 'bg-[#94A3B8]',
    borderColor: 'border-[#94A3B8]/30',
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
    <div className="space-y-5 pb-20">
      {/* Ledger Manifest Header */}
      <div className="bg-[#12171F] border border-[#1E2633] rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-console">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-[#F8FAFC]">
              Verified Shift Handover Record
            </span>
            {isSignedOff && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-sans text-[11px] font-medium">
                <CheckCircle2 className="w-3 h-3" />
                <span>Accepted by {signedOffBy}</span>
              </span>
            )}
          </div>
          <p className="text-xs text-[#94A3B8] mt-1 font-sans">
            Window interval <span className="text-[#F8FAFC] font-mono">{shiftWindow.start}</span> through <span className="text-[#F8FAFC] font-mono">{shiftWindow.end}</span>. Sourced telemetry only.
          </p>
        </div>

        {/* Handover Sign-off & Slack Copy Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopySlack}
            title="Copy structured Markdown for Slack / Teams (Hotkey: M)"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#18202C] hover:bg-[#1D2635] border border-[#283446] text-xs font-sans text-[#F8FAFC] transition-colors shadow-sm"
          >
            {copiedSlack ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#94A3B8]" />}
            <span>{copiedSlack ? 'Copied for Slack' : 'Copy for Slack'}</span>
          </button>

          <button
            onClick={onOpenSignOff}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold text-white transition-colors shadow-sm ${
              isSignedOff
                ? 'bg-[#18202C] hover:bg-[#1D2635] border border-[#283446] text-emerald-400'
                : 'bg-emerald-600 hover:bg-emerald-700 border border-[rgba(255,255,255,0.15)]'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>{isSignedOff ? 'View Transfer Record' : 'Sign Off & Hand Over Shift'}</span>
          </button>
        </div>
      </div>

      {/* Operational Search, Category Filters, and Density Switcher */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#12171F] border border-[#1E2633] rounded-lg p-2.5 shadow-console">
        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1 text-xs">
          <button
            onClick={() => setActiveCategory('All')}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
              activeCategory === 'All'
                ? 'bg-[#18202C] text-[#F8FAFC] font-semibold border border-[#3B82F6]'
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
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  isSelected
                    ? 'bg-[#18202C] text-[#F8FAFC] font-semibold border border-[#3B82F6]'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC]'
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
            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-[#64748B]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search records, tickets, terms..."
              className="w-full bg-[#0A0D12] border border-[#283446] rounded-md pl-8 pr-2.5 py-1 text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#3B82F6]"
            />
          </div>

          {/* Density Switcher */}
          <div className="flex items-center border border-[#283446] rounded bg-[#0A0D12] p-0.5">
            <button
              onClick={() => setViewMode('docket')}
              title="Expanded Evidence Docket View"
              className={`p-1 rounded ${viewMode === 'docket' ? 'bg-[#18202C] text-[#F8FAFC]' : 'text-[#94A3B8] hover:text-[#F8FAFC]'}`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('compact')}
              title="Compact Operational Table View"
              className={`p-1 rounded ${viewMode === 'compact' ? 'bg-[#18202C] text-[#F8FAFC]' : 'text-[#94A3B8] hover:text-[#F8FAFC]'}`}
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
                className={`bg-[#12171F] border ${cat.borderColor} rounded-lg overflow-hidden shadow-console`}
              >
                {/* Section Watch Bar */}
                <div className="px-4 py-2.5 bg-[#0A0D12] border-b border-[#1E2633] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2 h-2 rounded-full ${cat.dotColor}`} />
                    <h3 className="text-xs font-semibold text-[#F8FAFC] uppercase tracking-wide">
                      {cat.title}
                    </h3>
                    <span className="text-[11px] font-mono text-[#94A3B8] px-1.5 py-0.2 rounded bg-[#18202C] border border-[#283446]">
                      {sectionItems.length}
                    </span>
                  </div>

                  <div className="text-[11px] text-[#94A3B8] font-sans hidden sm:inline">
                    {cat.incomingInstruction}
                  </div>
                </div>

                {/* Section Ledger Items */}
                <div className="p-3.5 space-y-2.5">
                  {sectionItems.length === 0 ? (
                    <div className="p-3 rounded-md bg-[#0A0D12] border border-dashed border-[#283446] text-[#94A3B8] flex items-center gap-3">
                      <Minus className="w-4 h-4 text-[#64748B] shrink-0" />
                      <div>
                        <span className="text-xs font-medium text-[#F8FAFC] block">
                          Nothing to report
                        </span>
                        <span className="text-[11px] text-[#94A3B8]">
                          Confirmed quiet: zero telemetry events matched this section within the operating window.
                        </span>
                      </div>
                    </div>
                  ) : (
                    sectionItems.map((item, idx) => (
                      <div
                        key={idx}
                        className={`bg-[#0A0D12] border rounded-md p-3 transition-colors ${
                          item.carried_forward && (item.shifts_open || 1) >= 3
                            ? 'border-[#F59E0B] bg-[#F59E0B]/5 shadow-sm'
                            : item.carried_forward
                            ? 'border-[#1E2633] border-l-2 border-l-[#3B82F6] hover:border-[#3B82F6]/60'
                            : 'border-[#1E2633] hover:border-[#283446]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-xs sm:text-[13px] text-[#F8FAFC] font-normal leading-relaxed flex-1">
                            {item.item}
                          </p>

                          {/* Carry-Forward Tags */}
                          {item.carried_forward && (
                            <div className="shrink-0">
                              {(item.shifts_open || 1) >= 3 ? (
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#F59E0B]/20 border border-[#F59E0B] text-[#F59E0B]">
                                  <AlertOctagon className="w-3 h-3" />
                                  STALE ({item.shifts_open} SHIFTS OPEN)
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono text-[#94A3B8] bg-[#12171F] border border-[#283446]">
                                  carried over · {item.shifts_open || 1} shifts
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {item.source_unavailable && (
                          <div className="mt-1 text-[11px] font-mono text-[#F59E0B] bg-[#F59E0B]/10 px-2 py-0.5 rounded border border-[#F59E0B]/30">
                            Warning: Source record no longer available in upstream system
                          </div>
                        )}

                        <div className="mt-2.5 pt-2 border-t border-[#18202C] flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#12171F] border border-[#283446] font-mono text-[11px] text-[#F8FAFC]">
                              <span className="text-[#94A3B8]">Record:</span>
                              <span className="text-[#3B82F6] font-semibold">{item.source}</span>
                            </div>

                            <div className="text-[11px] font-mono text-[#94A3B8]">
                              <span>Logged: {item.timestamp}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {item.progression && item.progression.length > 1 && (
                              <div className="text-[11px] font-mono text-[#94A3B8]">
                                <span>State path: </span>
                                <span className="text-[#F8FAFC]">{item.progression.join(' → ')}</span>
                              </div>
                            )}

                            <button
                              type="button"
                              onClick={() => onSelectSource(item)}
                              className="inline-flex items-center gap-1 text-[11px] font-sans font-medium text-[#3B82F6] hover:text-blue-400 hover:underline"
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
        <div className="bg-[#12171F] border border-[#1E2633] rounded-lg overflow-x-auto shadow-console">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-[#1E2633] bg-[#0A0D12] text-[#94A3B8] text-[11px] font-mono uppercase tracking-wider">
                <th className="py-2.5 px-3 w-36">Category</th>
                <th className="py-2.5 px-3 w-40">Citation</th>
                <th className="py-2.5 px-3">Item Summary</th>
                <th className="py-2.5 px-3 w-44">Logged Time</th>
                <th className="py-2.5 px-3 w-28 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#18202C]">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-[#94A3B8] font-sans text-xs">
                    No items match the active filter or query.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#18202C] transition-colors">
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#F8FAFC]">
                          <span className={`w-1.5 h-1.5 rounded-full ${SECTION_CATEGORIES[item.section].dotColor}`} />
                          <span>{item.section}</span>
                        </span>
                        {item.carried_forward && (
                          <span
                            className={`text-[9px] font-mono px-1 py-0.2 rounded border ${
                              (item.shifts_open || 1) >= 3
                                ? 'bg-[#F59E0B]/20 border-[#F59E0B] text-[#F59E0B] font-semibold'
                                : 'bg-[#0A0D12] border-[#283446] text-[#94A3B8]'
                            }`}
                            title={`Carried over across ${item.shifts_open || 1} consecutive shifts`}
                          >
                            {(item.shifts_open || 1) >= 3 ? `${item.shifts_open}s STALE` : `${item.shifts_open}s`}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-[#3B82F6] whitespace-nowrap">
                      {item.source}
                    </td>
                    <td className="py-2.5 px-3 text-[#F8FAFC] font-normal leading-tight">
                      {item.item}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-[#94A3B8] whitespace-nowrap">
                      {item.timestamp}
                    </td>
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => onSelectSource(item)}
                        className="text-[11px] font-medium text-[#3B82F6] hover:underline"
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
