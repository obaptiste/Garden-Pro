import React, { useState } from "react";
import { Quote, Phase } from "../types/schemas";
import { Calendar, Clock, Plus, Trash2, Users } from "lucide-react";
import { format, addDays, differenceInDays, isValid, isBefore, isAfter, parseISO } from "date-fns";
import { cn } from "../lib/utils";

interface ScheduleEditorProps {
  quote: Quote;
  onSave: (updates: Partial<Quote>) => void;
}

export const ScheduleEditor: React.FC<ScheduleEditorProps> = ({ quote, onSave }) => {
  const [startDate, setStartDate] = useState(quote.schedule?.scheduledStartDate || "");
  const [endDate, setEndDate] = useState(quote.schedule?.scheduledEndDate || "");
  const [assignedTo, setAssignedTo] = useState(quote.schedule?.assignedTo?.join(", ") || "");
  const [phases, setPhases] = useState<Phase[]>(quote.schedule?.phases || []);
  const [error, setError] = useState<string | null>(null);

  const duration = startDate && endDate && isValid(new Date(startDate)) && isValid(new Date(endDate)) 
    ? differenceInDays(new Date(endDate), new Date(startDate)) + 1 
    : 0;

  const addPhase = () => {
    const newPhase: Phase = {
      phaseName: "New Phase",
      startDate: startDate || format(new Date(), "yyyy-MM-dd"),
      endDate: endDate || format(addDays(new Date(), 7), "yyyy-MM-dd"),
      status: "pending",
    };
    setPhases([...phases, newPhase]);
  };

  const updatePhase = (index: number, updates: Partial<Phase>) => {
    const newPhases = [...phases];
    newPhases[index] = { ...newPhases[index], ...updates };
    setPhases(newPhases);
  };

  const removePhase = (index: number) => {
    setPhases(phases.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    setError(null);

    if (!startDate || !endDate) {
      setError("Please set both start and end dates for the overall schedule.");
      return;
    }

    const start = parseISO(startDate);
    const end = parseISO(endDate);

    if (isBefore(end, start)) {
      setError("The overall end date cannot be before the start date.");
      return;
    }

    for (const phase of phases) {
      const pStart = parseISO(phase.startDate);
      const pEnd = parseISO(phase.endDate);

      if (isBefore(pEnd, pStart)) {
        setError(`Phase "${phase.phaseName}" has an end date before its start date.`);
        return;
      }

      if (isBefore(pStart, start) || isAfter(pStart, end)) {
        setError(`Phase "${phase.phaseName}" start date must be within the overall schedule (${startDate} to ${endDate}).`);
        return;
      }

      if (isBefore(pEnd, start) || isAfter(pEnd, end)) {
        setError(`Phase "${phase.phaseName}" end date must be within the overall schedule (${startDate} to ${endDate}).`);
        return;
      }
    }

    onSave({
      schedule: {
        scheduledStartDate: startDate,
        scheduledEndDate: endDate,
        estimatedDurationDays: duration,
        assignedTo: assignedTo.split(",").map(s => s.trim()).filter(Boolean),
        phases,
      },
      status: "scheduled",
      scheduledDate: startDate,
    });
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Calendar size={14} /> Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setError(null);
            }}
            className={cn(
              "w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all",
              startDate && endDate && isBefore(parseISO(endDate), parseISO(startDate)) && "border-red-300 bg-red-50"
            )}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Calendar size={14} /> End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setError(null);
            }}
            className={cn(
              "w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all",
              startDate && endDate && isBefore(parseISO(endDate), parseISO(startDate)) && "border-red-300 bg-red-50"
            )}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Clock size={14} /> Duration
          </label>
          <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-700">
            {duration} Days
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <Users size={14} /> Assigned Team (comma separated)
        </label>
        <input
          type="text"
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
          placeholder="e.g. Dave, Mike, Sarah"
          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
        />
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Project Phases</h3>
          <button
            onClick={addPhase}
            className="flex items-center gap-2 text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            <Plus size={16} /> Add Phase
          </button>
        </div>

        <div className="space-y-3">
          {phases.map((phase, i) => (
            <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap md:flex-nowrap gap-4 items-end">
              <div className="flex-1 space-y-1 min-w-[200px]">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Phase Name</label>
                <input
                  type="text"
                  value={phase.phaseName}
                  onChange={(e) => updatePhase(i, { phaseName: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Start</label>
                <input
                  type="date"
                  value={phase.startDate}
                  onChange={(e) => {
                    updatePhase(i, { startDate: e.target.value });
                    setError(null);
                  }}
                  className={cn(
                    "w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm",
                    startDate && endDate && (isBefore(parseISO(phase.startDate), parseISO(startDate)) || isAfter(parseISO(phase.startDate), parseISO(endDate))) && "border-red-300 bg-red-50"
                  )}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">End</label>
                <input
                  type="date"
                  value={phase.endDate}
                  onChange={(e) => {
                    updatePhase(i, { endDate: e.target.value });
                    setError(null);
                  }}
                  className={cn(
                    "w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm",
                    (isBefore(parseISO(phase.endDate), parseISO(phase.startDate)) || 
                     (startDate && endDate && (isBefore(parseISO(phase.endDate), parseISO(startDate)) || isAfter(parseISO(phase.endDate), parseISO(endDate))))) && "border-red-300 bg-red-50"
                  )}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Status</label>
                <select
                  value={phase.status}
                  onChange={(e) => updatePhase(i, { status: e.target.value as any })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="complete">Complete</option>
                </select>
              </div>
              <button
                onClick={() => removePhase(i)}
                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-end gap-4 pt-4">
        {error && (
          <div className="text-red-500 text-sm font-bold bg-red-50 px-4 py-2 rounded-lg border border-red-100">
            {error}
          </div>
        )}
        <button
          onClick={handleSave}
          className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-emerald-700 transition-all"
        >
          Save Schedule
        </button>
      </div>
    </div>
  );
};
