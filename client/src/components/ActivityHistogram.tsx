import React from 'react';
import { GeneratedNoteItem, ShiftWindow } from '../types';
import { BarChart2 } from 'lucide-react';

interface ActivityHistogramProps {
  items: GeneratedNoteItem[];
  shiftWindow: ShiftWindow;
  selectedHour: string | null;
  onSelectHour: (hour: string | null) => void;
}

export const ActivityHistogram: React.FC<ActivityHistogramProps> = ({
  items,
  shiftWindow,
  selectedHour,
  onSelectHour,
}) => {
  // Extract hours between shift start and end
  const startHour = parseInt(shiftWindow.start.slice(11, 13), 10) || 16;
  const hoursCount = 8;
  const hours = Array.from({ length: hoursCount }, (_, i) => {
    const h = (startHour + i) % 24;
    return h < 10 ? `0${h}:00` : `${h}:00`;
  });

  // Calculate distribution by hour
  const hourlyData = hours.map((hourStr) => {
    const hourPrefix = hourStr.slice(0, 2);
    const hourItems = items.filter((item) => {
      const itemHour = item.timestamp.slice(11, 13);
      return itemHour === hourPrefix;
    });

    const blockers = hourItems.filter((i) => i.section === 'Blockers').length;
    const progress = hourItems.filter((i) => i.section === 'In Progress').length;
    const completed = hourItems.filter((i) => i.section === 'Completed').length;
    const watch = hourItems.filter((i) => i.section === 'Watch-list').length;

    return {
      hour: hourStr,
      total: hourItems.length,
      blockers,
      progress,
      completed,
      watch,
    };
  });

  const maxTotal = Math.max(...hourlyData.map((d) => d.total), 4);

  return (
    <div className="bg-[#161B22] border border-[#30363D] rounded-md p-3.5 mb-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-3">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-3.5 h-3.5 text-[#58A6FF]" />
          <span className="text-xs font-semibold text-[#F0F6FC] uppercase tracking-wide">
            Hourly Shift Incident & Ticket Flow
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-sans text-[#8B949E]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#D29922]" /> Blockers
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#58A6FF]" /> In Progress
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#3FB950]" /> Completed
          </span>
          {selectedHour && (
            <button
              onClick={() => onSelectHour(null)}
              className="text-[#58A6FF] hover:underline font-mono"
            >
              Clear filter ({selectedHour})
            </button>
          )}
        </div>
      </div>

      {/* Histogram Bars */}
      <div className="grid grid-cols-8 gap-2 pt-2 items-end h-24 border-b border-[#30363D] pb-1">
        {hourlyData.map((d) => {
          const heightPercent = d.total > 0 ? Math.max(16, (d.total / maxTotal) * 100) : 4;
          const isSelected = selectedHour === d.hour.slice(0, 2);

          return (
            <div
              key={d.hour}
              onClick={() => onSelectHour(isSelected ? null : d.hour.slice(0, 2))}
              className={`group flex flex-col items-center justify-end h-full cursor-pointer transition-colors ${
                isSelected ? 'opacity-100' : selectedHour ? 'opacity-30' : 'hover:opacity-100'
              }`}
            >
              {/* Stacked bar segments */}
              <div
                style={{ height: `${heightPercent}%` }}
                className={`w-full max-w-[28px] rounded-t flex flex-col justify-end overflow-hidden transition-all ${
                  isSelected ? 'ring-2 ring-[#58A6FF]' : 'group-hover:brightness-110'
                }`}
              >
                {d.blockers > 0 && (
                  <div
                    style={{ flex: d.blockers }}
                    className="bg-[#D29922] min-h-[4px]"
                    title={`${d.blockers} blockers at ${d.hour}`}
                  />
                )}
                {d.progress > 0 && (
                  <div
                    style={{ flex: d.progress }}
                    className="bg-[#58A6FF] min-h-[4px]"
                    title={`${d.progress} in progress at ${d.hour}`}
                  />
                )}
                {d.completed > 0 && (
                  <div
                    style={{ flex: d.completed }}
                    className="bg-[#3FB950] min-h-[4px]"
                    title={`${d.completed} completed at ${d.hour}`}
                  />
                )}
                {d.watch > 0 && (
                  <div
                    style={{ flex: d.watch }}
                    className="bg-[#8B949E] min-h-[4px]"
                    title={`${d.watch} watch-list at ${d.hour}`}
                  />
                )}
                {d.total === 0 && (
                  <div className="w-full h-[2px] bg-[#30363D]" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Hour Labels */}
      <div className="grid grid-cols-8 gap-2 pt-1 text-center font-mono text-[10px] text-[#8B949E]">
        {hourlyData.map((d) => (
          <span
            key={d.hour}
            className={selectedHour === d.hour.slice(0, 2) ? 'text-[#58A6FF] font-bold' : ''}
          >
            {d.hour}
          </span>
        ))}
      </div>
    </div>
  );
};
