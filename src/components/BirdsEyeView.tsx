import React, { useState } from "react";
import { Copy, Image as ImageIcon, Loader2, Wand2 } from "lucide-react";
import { motion } from "motion/react";

interface BirdsEyeViewProps {
  prompt: string;
  initialImageUrl?: string;
  onImageGenerated?: (url: string) => void;
}

export const BirdsEyeView: React.FC<BirdsEyeViewProps> = ({ prompt, initialImageUrl, onImageGenerated }) => {
  const [imageUrl, setImageUrl] = useState<string | undefined>(initialImageUrl);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateImage = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate-illustration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (data.imageUrl) {
        setImageUrl(data.imageUrl);
        onImageGenerated?.(data.imageUrl);
      }
    } catch (error) {
      console.error("Error generating image:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(prompt);
  };

  return (
    <div className="space-y-4">
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center group">
        {imageUrl ? (
          <img src={imageUrl} alt="Birds-eye illustration" className="w-full h-full object-cover" />
        ) : (
          <div className="text-center p-6">
            <ImageIcon className="mx-auto text-slate-300 mb-2" size={48} />
            <p className="text-sm text-slate-500 font-medium">No illustration yet</p>
          </div>
        )}

        {isGenerating && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
            <Loader2 className="animate-spin text-emerald-600 mb-2" size={32} />
            <p className="text-sm font-semibold text-emerald-800">Sketching your garden...</p>
          </div>
        )}

        {!isGenerating && (
          <button
            onClick={generateImage}
            className="absolute bottom-4 right-4 bg-emerald-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-emerald-700 transition-all flex items-center gap-2 text-sm font-medium opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0"
          >
            <Wand2 size={16} />
            {imageUrl ? "Regenerate" : "Generate Illustration"}
          </button>
        )}
      </div>

      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Illustration Prompt</span>
          <button
            onClick={copyPrompt}
            className="text-slate-400 hover:text-emerald-600 transition-colors p-1"
            title="Copy prompt"
          >
            <Copy size={14} />
          </button>
        </div>
        <p className="text-xs text-slate-600 italic leading-relaxed line-clamp-3 hover:line-clamp-none cursor-help transition-all">
          "{prompt}"
        </p>
      </div>
    </div>
  );
};
