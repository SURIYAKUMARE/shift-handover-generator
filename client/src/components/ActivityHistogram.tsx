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
  const startHour = parseInt(shiftWindow.start.slice(11, 13), 10) || 16;
  const hoursCount = 8;
  const hours = Array.from({ length: hoursCount }, (_, i) => {
    const h = (startHour + i) % 24;
    return h < 10 ? `0${h}:00` : `${h}:00`;
  });

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
    <div className="bg-[#12171F] border border-[#1E2633] rounded-xl p-5 mb-6 shadow-console">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2.5">
          <BarChart2 className="w-4 h-4 text-[#3B82F6]" />
          <span className="text-xs sm:text-sm font-bold text-[#F8FAFC] uppercase tracking-wide">
            Hourly Telemetry Distribution
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs font-sans text-[#94A3B8]">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" /> Blockers
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" /> In Progress
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" /> Completed
          </span>
          {selectedHour && (
            <button
              onClick={() => onSelectHour(null)}
              className="text-[#3B82F6] hover:underline font-mono text-xs font-bold"
            >
              Reset hour filter ({selectedHour})
            </button>
          )}
        </div>
      </div>

      {/* Histogram Bars (Taller) */}
      <div className="grid grid-cols-8 gap-3 pt-3 items-end h-32 border-b border-[#1E2633] pb-2">
        {hourlyData.map((d) => {
          const heightPercent = d.total > 0 ? Math.max(16, (d.total / maxTotal) * 100) : 4;
          const isSelected = selectedHour === d.hour.slice(0, 2);

          return (
            <div
              key={d.hour}
              onClick={() => onSelectHour(isSelected ? null : d.hour.slice(0, 2))}
              className={`group flex flex-col items-center justify-end h-full cursor-pointer transition-all ${
                isSelected ? 'opacity-100' : selectedHour ? 'opacity-25' : 'hover:opacity-100'
              }`}
            >
              {/* Stacked bar segments */}
              <div
                style={{ height: `${heightPercent}%` }}
                className={`w-full max-w-[42px] rounded-t-md flex flex-col justify-end overflow-hidden transition-all ${
                  isSelected ? 'ring-2 ring-[#3B82F6] shadow-md' : 'group-hover:brightness-110'
                }`}
              >
                {d.blockers > 0 && (
                  <div
                    style={{ flex: d.blockers }}
                    className="bg-[#F59E0B] min-h-[5px]"
                    title={`${d.blockers} blockers at ${d.hour}`}
                  />
                )}
                {d.progress > 0 && (
                  <div
                    style={{ flex: d.progress }}
                    className="bg-[#3B82F6] min-h-[5px]"
                    title={`${d.progress} in progress at ${d.hour}`}
                  />
                )}
                {d.completed > 0 && (
                  <div
                    style={{ flex: d.completed }}
                    className="bg-[#10B981] min-h-[5px]"
                    title={`${d.completed} completed at ${d.hour}`}
                  />
                )}
                {d.watch > 0 && (
                  <div
                    style={{ flex: d.watch }}
                    className="bg-[#94A3B8] min-h-[5px]"
                    title={`${d.watch} watch-list at ${d.hour}`}
                  />
                )}
                {d.total === 0 && (
                  <div className="w-full h-[3px] bg-[#283446]" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Hour Labels */}
      <div className="grid grid-cols-8 gap-3 pt-2 text-center font-mono text-xs text-[#94A3B8]">
        {hourlyData.map((d) => (
          <span
            key={d.hour}
            className={selectedHour === d.hour.slice(0, 2) ? 'text-[#3B82F6] font-bold' : 'font-medium'}
          >
            {d.hour}
          </span>
        ))}
      </div>
    </div>
  );
};
