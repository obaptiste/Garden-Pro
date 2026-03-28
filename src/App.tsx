import React from "react";
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import { QuoteDetail } from "./pages/QuoteDetail";
import { NewQuote } from "./pages/NewQuote";
import { CalendarView } from "./components/CalendarView";
import { Quote } from "./types/schemas";
import { LayoutDashboard, Calendar, PlusCircle, Settings, LogOut } from "lucide-react";
import { cn } from "./lib/utils";

const Sidebar = () => {
  const location = useLocation();
  
  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/dashboard/schedule", label: "Schedule", icon: Calendar },
    { path: "/new-quote", label: "New Quote", icon: PlusCircle },
  ];

  return (
    <div className="w-64 bg-slate-900 h-screen sticky top-0 flex flex-col p-6 text-slate-400">
      <div className="mb-12 px-2">
        <h1 className="text-2xl font-black text-white tracking-tighter flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-slate-900">G</div>
          GardenPro
        </h1>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all",
              location.pathname === item.path ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/20" : "hover:bg-slate-800 hover:text-slate-200"
            )}
          >
            <item.icon size={20} />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="pt-6 border-t border-slate-800 space-y-2">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold hover:bg-slate-800 hover:text-slate-200 transition-all">
          <Settings size={20} /> Settings
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-red-400 hover:bg-red-500/10 transition-all">
          <LogOut size={20} /> Logout
        </button>
      </div>
    </div>
  );
};

const SchedulePage = () => {
  const [quotes, setQuotes] = React.useState<Quote[]>([]);
  const navigate = useNavigate();

  React.useEffect(() => {
    fetch("/api/quotes")
      .then(res => res.json())
      .then(data => setQuotes(data));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Project Schedule</h1>
        <p className="text-slate-500 font-medium">Manage your upcoming landscaping jobs and team assignments.</p>
      </div>
      <CalendarView quotes={quotes} onQuoteClick={(id) => navigate(`/dashboard/quotes/${id}`)} />
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/quotes/:id" element={<QuoteDetail />} />
            <Route path="/dashboard/schedule" element={<SchedulePage />} />
            <Route path="/new-quote" element={<NewQuote />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
