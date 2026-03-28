import React, { useState, useEffect } from "react";
import { Quote } from "../types/schemas";
import { StatsStrip } from "../components/StatsStrip";
import { QuoteCard } from "../components/QuoteCard";
import { Search, Filter, Plus, LayoutGrid, List, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Dashboard: React.FC = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/quotes")
      .then(res => res.json())
      .then(data => {
        setQuotes(data);
        setIsLoading(false);
      });
  }, []);

  const filteredQuotes = quotes.filter(q => 
    q.clientName.toLowerCase().includes(search.toLowerCase()) ||
    q.propertyAddress.toLowerCase().includes(search.toLowerCase()) ||
    q.postcode.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin text-emerald-600" size={48} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
            Garden <span className="text-emerald-600">Concepts</span>
          </h1>
          <p className="text-slate-500 font-medium">Welcome back, <span className="text-slate-800">Premium Landscaping Ltd</span></p>
        </div>
        <button 
          onClick={() => navigate("/new-quote")}
          className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
        >
          <Plus size={20} /> New Quote
        </button>
      </div>

      <StatsStrip quotes={quotes} />

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search clients, addresses, postcodes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all font-medium">
            <Filter size={18} /> Filters
          </button>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => setView("grid")}
              className={`p-2 rounded-lg transition-all ${view === "grid" ? "bg-white shadow-sm text-emerald-600" : "text-slate-400"}`}
            >
              <LayoutGrid size={20} />
            </button>
            <button 
              onClick={() => setView("list")}
              className={`p-2 rounded-lg transition-all ${view === "list" ? "bg-white shadow-sm text-emerald-600" : "text-slate-400"}`}
            >
              <List size={20} />
            </button>
          </div>
        </div>
      </div>

      {filteredQuotes.length > 0 ? (
        <div className={view === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8" : "space-y-4"}>
          {filteredQuotes.map(quote => (
            <QuoteCard 
              key={quote.id} 
              quote={quote} 
              onClick={() => navigate(`/dashboard/quotes/${quote.id}`)} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
          <div className="bg-white w-16 h-16 rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 text-slate-300">
            <Search size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-1">No quotes found</h3>
          <p className="text-slate-500">Try adjusting your search or create a new quote.</p>
        </div>
      )}
    </div>
  );
};
