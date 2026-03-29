import React, { useState, useEffect } from "react";
import { Key, ShieldAlert, ExternalLink } from "lucide-react";

interface ApiKeyGuardProps {
  children: React.ReactNode;
}

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export const ApiKeyGuard: React.FC<ApiKeyGuardProps> = ({ children }) => {
  const [hasKey, setHasKey] = useState<boolean | null>(null);

  useEffect(() => {
    const checkKey = async () => {
      try {
        const result = await window.aistudio.hasSelectedApiKey();
        setHasKey(result);
      } catch (e) {
        console.error("Error checking API key:", e);
        setHasKey(false);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    try {
      await window.aistudio.openSelectKey();
      // Assume success and proceed as per instructions
      setHasKey(true);
    } catch (e) {
      console.error("Error opening key selector:", e);
    }
  };

  if (hasKey === null) return null;

  if (!hasKey) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl text-center">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Key size={40} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-4">API Key Required</h1>
          <p className="text-slate-500 mb-8 font-medium">
            To generate high-quality garden mockups and birds-eye illustrations, you need to select a valid Google Cloud API key with billing enabled.
          </p>
          
          <div className="space-y-4">
            <button
              onClick={handleSelectKey}
              className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
            >
              <Key size={20} /> Select API Key
            </button>
            
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
            >
              <ExternalLink size={16} /> Billing Documentation
            </a>
          </div>

          <div className="mt-8 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3 text-left">
            <ShieldAlert className="text-amber-500 shrink-0" size={20} />
            <p className="text-xs text-amber-700 font-medium">
              Note: The selected key must be from a project with an active billing account to access advanced image generation models.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
