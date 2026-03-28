import React from "react";
import { isValid } from "date-fns";
import { Quote } from "../types/schemas";
import { TrendingUp, CheckCircle, Clock, BarChart3 } from "lucide-react";
import { formatCurrency, parseCost } from "../lib/utils";

interface StatsStripProps {
  quotes: Quote[];
}

export const StatsStrip: React.FC<StatsStripProps> = ({ quotes }) => {
  const now = new Date();
  let thisMonthCount = 0;
  let acceptedCount = 0;
  let pendingCount = 0;
  let pipelineValue = 0;

  for (const q of quotes) {
    const d = new Date(q.createdAt);
    if (isValid(d) && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
      thisMonthCount++;
    }
    if (q.status === "accepted" || q.status === "scheduled") {
      acceptedCount++;
      if (q.selectedDesign !== null) {
        pipelineValue += parseCost(q.designs[q.selectedDesign].estimatedCost);
      }
    } else if (q.status === "sent" || q.status === "draft") {
      pendingCount++;
    }
  }

  const stats = [
    { label: "Quotes This Month", value: thisMonthCount, icon: BarChart3, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Quotes Accepted", value: acceptedCount, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Quotes Pending", value: pendingCount, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Pipeline Value", value: formatCurrency(pipelineValue), icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, i) => (
        <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className={`${stat.bg} ${stat.color} p-3 rounded-xl`}>
            <stat.icon size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
            <p className="text-xl font-bold text-slate-800">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
