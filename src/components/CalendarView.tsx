import React from "react";
import { format, isSameMonth, isSameDay, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isValid } from "date-fns";
import { Quote } from "../types/schemas";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "../lib/utils";

interface CalendarViewProps {
  quotes: Quote[];
  onQuoteClick: (id: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ quotes, onQuoteClick }) => {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const scheduledQuotes = quotes.filter(q => q.schedule?.scheduledStartDate);

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-100 p-2 rounded-lg text-emerald-700">
            <CalendarIcon size={24} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">
            {format(currentMonth, "MMMM yyyy")}
          </h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return (
      <div className="grid grid-cols-7 mb-2">
        {days.map((day, i) => (
          <div key={i} className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest py-2">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    return (
      <div className="grid grid-cols-7 border-t border-l border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {calendarDays.map((day, i) => {
          const dayQuotes = scheduledQuotes.filter(q => {
            const date = new Date(q.schedule!.scheduledStartDate!);
            return isValid(date) && isSameDay(date, day);
          });

          return (
            <div
              key={i}
              className={cn(
                "min-h-[120px] p-2 border-r border-b border-slate-200 bg-white transition-colors",
                !isSameMonth(day, monthStart) && "bg-slate-50 text-slate-300",
                isSameDay(day, new Date()) && "bg-emerald-50/30"
              )}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={cn(
                  "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full",
                  isSameDay(day, new Date()) && "bg-emerald-600 text-white"
                )}>
                  {format(day, "d")}
                </span>
              </div>
              <div className="space-y-1">
                {dayQuotes.map(q => (
                  <button
                    key={q.id}
                    onClick={() => onQuoteClick(q.id)}
                    className={cn(
                      "w-full text-left text-[10px] p-1.5 rounded border leading-tight transition-all hover:scale-[1.02]",
                      q.status === 'scheduled' ? "bg-blue-50 border-blue-200 text-blue-700" :
                      q.status === 'accepted' ? "bg-emerald-50 border-emerald-200 text-emerald-700" :
                      "bg-slate-50 border-slate-200 text-slate-700"
                    )}
                  >
                    <div className="font-bold truncate">{q.clientName}</div>
                    <div className="opacity-70 truncate">{q.propertyAddress}</div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
};
