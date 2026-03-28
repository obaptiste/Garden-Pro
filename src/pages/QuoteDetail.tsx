import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Quote } from "../types/schemas";
import { Loader2, ArrowLeft, Calendar, Mail, Phone, MapPin, CheckCircle2, Send, Trash2, FileDown, Clock, Tag } from "lucide-react";
import { format, isValid } from "date-fns";
import { formatCurrency, cn } from "../lib/utils";
import { MaterialsTable } from "../components/MaterialsTable";
import { BirdsEyeView } from "../components/BirdsEyeView";
import { ScheduleEditor } from "../components/ScheduleEditor";
import ReactMarkdown from "react-markdown";

export const QuoteDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"designs" | "schedule" | "notes">("designs");

  useEffect(() => {
    fetch(`/api/quotes/${id}`)
      .then(res => res.json())
      .then(data => setQuote(data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [id]);

  const patchQuote = async (updates: Partial<Quote>) => {
    const res = await fetch(`/api/quotes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    const updated = await res.json();
    setQuote(updated);
  };

  const updateStatus = (status: Quote["status"]) => patchQuote({ status });

  const selectDesign = (index: number) => patchQuote({ selectedDesign: index, status: "accepted" });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin text-emerald-600" size={48} />
      </div>
    );
  }

  if (!quote) return <div>Quote not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button 
        onClick={() => navigate("/dashboard")}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-8 font-medium"
      >
        <ArrowLeft size={20} /> Back to Dashboard
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Sidebar: Client Info */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div className={cn(
                "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                quote.status === 'accepted' ? "bg-emerald-100 text-emerald-600 border-emerald-200" :
                quote.status === 'scheduled' ? "bg-blue-100 text-blue-600 border-blue-200" :
                "bg-slate-100 text-slate-600 border-slate-200"
              )}>
                {quote.status}
              </div>
              <select 
                value={quote.status}
                onChange={(e) => updateStatus(e.target.value as any)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-1 outline-none"
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="accepted">Accepted</option>
                <option value="declined">Declined</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>

            <h1 className="text-3xl font-black text-slate-900 mb-6">{quote.clientName}</h1>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 text-slate-600">
                <div className="bg-slate-100 p-2 rounded-lg"><MapPin size={18} /></div>
                <div>
                  <p className="text-sm font-bold text-slate-800">{quote.propertyAddress}</p>
                  <p className="text-xs text-slate-400">{quote.postcode}</p>
                </div>
              </div>
              {quote.clientEmail && (
                <div className="flex items-center gap-3 text-slate-600">
                  <div className="bg-slate-100 p-2 rounded-lg"><Mail size={18} /></div>
                  <p className="text-sm font-medium">{quote.clientEmail}</p>
                </div>
              )}
              {quote.clientPhone && (
                <div className="flex items-center gap-3 text-slate-600">
                  <div className="bg-slate-100 p-2 rounded-lg"><Phone size={18} /></div>
                  <p className="text-sm font-medium">{quote.clientPhone}</p>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-slate-100 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Created</span>
                <span className="font-medium text-slate-700">{isValid(new Date(quote.createdAt)) ? format(new Date(quote.createdAt), "dd MMM yyyy") : "Unknown"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Total Pipeline</span>
                <span className="font-bold text-slate-900 text-lg">{quote.totalEstimatedCost}</span>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3">
              <button className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all">
                <Send size={18} /> Send Proposal
              </button>
              <button className="w-full bg-white border border-slate-200 text-slate-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all">
                <FileDown size={18} /> Export PDF
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Tag size={18} className="text-emerald-600" /> Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {quote.tags.map((tag, i) => (
                <span key={i} className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-100">
                  {tag}
                </span>
              ))}
              <button className="px-3 py-1 border border-dashed border-slate-300 text-slate-400 text-xs font-bold rounded-full hover:border-emerald-400 hover:text-emerald-600 transition-all">
                + Add Tag
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex bg-slate-100 p-1 rounded-2xl w-fit mb-8">
            <button 
              onClick={() => setActiveTab("designs")}
              className={cn(
                "px-6 py-2 rounded-xl text-sm font-bold transition-all",
                activeTab === "designs" ? "bg-white shadow-sm text-emerald-600" : "text-slate-500"
              )}
            >
              Design Concepts
            </button>
            <button 
              onClick={() => setActiveTab("schedule")}
              className={cn(
                "px-6 py-2 rounded-xl text-sm font-bold transition-all",
                activeTab === "schedule" ? "bg-white shadow-sm text-emerald-600" : "text-slate-500"
              )}
            >
              Scheduling
            </button>
            <button 
              onClick={() => setActiveTab("notes")}
              className={cn(
                "px-6 py-2 rounded-xl text-sm font-bold transition-all",
                activeTab === "notes" ? "bg-white shadow-sm text-emerald-600" : "text-slate-500"
              )}
            >
              Internal Notes
            </button>
          </div>

          {activeTab === "designs" && (
            <div className="space-y-12">
              {quote.designs.map((design, i) => (
                <div key={i} className={cn(
                  "bg-white rounded-3xl border-2 p-8 transition-all relative",
                  quote.selectedDesign === i ? "border-emerald-500 shadow-xl shadow-emerald-50" : "border-slate-100"
                )}>
                  {quote.selectedDesign === i && (
                    <div className="absolute -top-4 -right-4 bg-emerald-600 text-white p-2 rounded-full shadow-lg">
                      <CheckCircle2 size={24} />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 mb-4">{design.title}</h2>
                      <div className="prose prose-slate prose-sm mb-6">
                        <ReactMarkdown>{design.description}</ReactMarkdown>
                      </div>
                      <div className="space-y-2 mb-8">
                        {design.keyFeatures.map((f, j) => (
                          <div key={j} className="flex items-start gap-2 text-sm text-slate-600">
                            <div className="mt-1 text-emerald-500"><CheckCircle2 size={14} /></div>
                            {f}
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                        <span className="text-sm font-bold text-slate-400 uppercase">Estimated Cost</span>
                        <span className="text-2xl font-black text-slate-900">{formatCurrency(design.estimatedCost)}</span>
                      </div>
                    </div>
                    <div>
                      <BirdsEyeView 
                        prompt={design.birdsEyePrompt} 
                        initialImageUrl={quote.birdsEyeImageUrls?.[i]}
                        onImageGenerated={(url) => {
                          const newUrls = [...(quote.birdsEyeImageUrls || [])];
                          newUrls[i] = url;
                          patchQuote({ birdsEyeImageUrls: newUrls });
                        }}
                      />
                    </div>
                  </div>

                  <MaterialsTable materials={design.materials} />

                  {quote.selectedDesign !== i && (
                    <button 
                      onClick={() => selectDesign(i)}
                      className="mt-8 w-full py-4 rounded-2xl border-2 border-emerald-600 text-emerald-600 font-black hover:bg-emerald-600 hover:text-white transition-all uppercase tracking-widest text-sm"
                    >
                      Select This Design
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === "schedule" && (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
              <h2 className="text-2xl font-black text-slate-900 mb-8">Project Schedule</h2>
              <ScheduleEditor quote={quote} onSave={patchQuote} />
            </div>
          )}

          {activeTab === "notes" && (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
              <h2 className="text-2xl font-black text-slate-900 mb-6">Internal Gardener Notes</h2>
              <textarea 
                className="w-full h-64 p-6 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none font-medium text-slate-700"
                placeholder="Add private notes about site access, specific client requests, or material sourcing..."
                defaultValue={quote.notes}
                onBlur={(e) => patchQuote({ notes: e.target.value })}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
