import React from "react";
import { Quote } from "../types/schemas";
import { formatCurrency } from "../lib/utils";
import { Calendar, MapPin, ArrowRight, Clock } from "lucide-react";
import { format, isValid } from "date-fns";
import { cn } from "../lib/utils";

interface QuoteCardProps {
  quote: Quote;
  onClick: () => void;
}

export const QuoteCard: React.FC<QuoteCardProps> = ({ quote, onClick }) => {
  const statusColors = {
    draft: "bg-slate-100 text-slate-600 border-slate-200",
    sent: "bg-blue-100 text-blue-600 border-blue-200",
    accepted: "bg-emerald-100 text-emerald-600 border-emerald-200",
    declined: "bg-red-100 text-red-600 border-red-200",
    scheduled: "bg-purple-100 text-purple-600 border-purple-200",
  };

  const selectedDesign = quote.selectedDesign !== null ? quote.designs[quote.selectedDesign] : null;

  return (
    <div 
      onClick={onClick}
      className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-emerald-200 transition-all cursor-pointer flex flex-col"
    >
      <div className="relative aspect-video overflow-hidden bg-slate-100">
        {quote.photos[0] ? (
          <img 
            src={quote.photos[0]} 
            alt="Garden" 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <MapPin size={48} />
          </div>
        )}
        <div className={cn(
          "absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md",
          statusColors[quote.status]
        )}>
          {quote.status}
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">
            {quote.clientName}
          </h3>
          <p className="text-sm text-slate-500 flex items-center gap-1">
            <MapPin size={14} /> {quote.propertyAddress}, {quote.postcode}
          </p>
        </div>

        <div className="space-y-3 mb-6 flex-1">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400">Design</span>
            <span className="font-semibold text-slate-700">
              {selectedDesign ? selectedDesign.title : "No selection"}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400">Estimated Cost</span>
            <span className="font-bold text-slate-900">
              {selectedDesign ? formatCurrency(selectedDesign.estimatedCost) : quote.totalEstimatedCost}
            </span>
          </div>
          {quote.scheduledDate && isValid(new Date(quote.scheduledDate)) && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Scheduled</span>
              <span className="font-semibold text-blue-600 flex items-center gap-1">
                <Calendar size={14} /> {format(new Date(quote.scheduledDate), "dd MMM yyyy")}
              </span>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
            Created {isValid(new Date(quote.createdAt)) ? format(new Date(quote.createdAt), "dd/MM/yy") : "Unknown"}
          </span>
          <div className="text-emerald-600 opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
            <ArrowRight size={20} />
          </div>
        </div>
      </div>
    </div>
  );
};
