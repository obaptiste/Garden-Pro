import React, { useState } from "react";
import { ImageIcon, Loader2, Wand2, Sparkles } from "lucide-react";
import { cn } from "../lib/utils";

interface MockupGalleryProps {
  prompts: string[];
  initialImageUrls?: string[];
  onImagesGenerated?: (urls: string[]) => void;
}

export const MockupGallery: React.FC<MockupGalleryProps> = ({ prompts, initialImageUrls = [], onImagesGenerated }) => {
  const [imageUrls, setImageUrls] = useState<string[]>(initialImageUrls);
  const [isGenerating, setIsGenerating] = useState(false);
  const [size, setSize] = useState<"1K" | "2K" | "4K">("1K");

  const generateMockups = async () => {
    setIsGenerating(true);
    try {
      const generatedUrls: string[] = [];
      for (const prompt of prompts) {
        const res = await fetch("/api/generate-illustration", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, size }),
        });
        const data = await res.json();
        if (data.imageUrl) {
          generatedUrls.push(data.imageUrl);
        }
      }
      setImageUrls(generatedUrls);
      onImagesGenerated?.(generatedUrls);
    } catch (error) {
      console.error("Error generating mockups:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Sparkles size={16} className="text-emerald-500" /> Perspective Mockups
        </h3>
        {!isGenerating && (
          <div className="flex items-center gap-2">
            <select 
              value={size}
              onChange={(e) => setSize(e.target.value as any)}
              className="bg-slate-50 text-[10px] font-bold text-slate-700 px-2 py-1 rounded-lg border border-slate-200 outline-none"
            >
              <option value="1K">1K</option>
              <option value="2K">2K</option>
              <option value="4K">4K</option>
            </select>
            <button
              onClick={generateMockups}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors flex items-center gap-1"
            >
              <Wand2 size={14} />
              {imageUrls.length > 0 ? "Regenerate All" : "Generate Mockups"}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 flex flex-col items-center justify-center group">
            {imageUrls[i] ? (
              <img src={imageUrls[i]} alt={`Mockup ${i + 1}`} className="w-full h-full object-cover" />
            ) : (
              <div className="text-center p-4">
                <ImageIcon className="mx-auto text-slate-300 mb-1" size={32} />
                <p className="text-[10px] text-slate-400 font-medium">Mockup {i + 1}</p>
              </div>
            )}

            {isGenerating && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                <Loader2 className="animate-spin text-emerald-600 mb-1" size={24} />
                <p className="text-[10px] font-bold text-emerald-800">Visualizing...</p>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <p className="text-[10px] text-slate-400 italic">
        * These are AI-generated visualizations based on your garden's layout and the proposed design.
      </p>
    </div>
  );
};
