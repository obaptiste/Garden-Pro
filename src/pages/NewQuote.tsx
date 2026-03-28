import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, MapPin, Loader2, Sparkles, Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const NewQuote: React.FC = () => {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    clientName: "",
    propertyAddress: "",
    postcode: "",
    notes: "",
    tags: [] as string[],
  });
  const [newTag, setNewTag] = useState("");

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotos(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag] }));
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, photos }),
      });
      const data = await res.json();
      navigate(`/dashboard/quotes/${data.id}`);
    } catch (error) {
      console.error("Error creating quote:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-4">
          Create New <span className="text-emerald-600">Garden Concept</span>
        </h1>
        <p className="text-slate-500 font-medium max-w-lg mx-auto">
          Upload garden photos and provide the address. Our AI will analyze the space and generate 3 professional design concepts.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Client Name</label>
              <input 
                required
                type="text" 
                value={formData.clientName}
                onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                placeholder="e.g. John Smith"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Postcode</label>
              <input 
                required
                type="text" 
                value={formData.postcode}
                onChange={(e) => setFormData(prev => ({ ...prev, postcode: e.target.value }))}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                placeholder="e.g. SW1A 1AA"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Property Address</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                required
                type="text" 
                value={formData.propertyAddress}
                onChange={(e) => setFormData(prev => ({ ...prev, propertyAddress: e.target.value }))}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                placeholder="e.g. 123 Garden Lane, London"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Garden Photos</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <AnimatePresence>
                {photos.map((photo, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="relative aspect-square rounded-xl overflow-hidden group"
                  >
                    <img src={photo} alt="Upload" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <X size={14} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
              <label className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 transition-all group">
                <Upload className="text-slate-300 group-hover:text-emerald-500 transition-colors" size={32} />
                <span className="text-[10px] font-bold text-slate-400 mt-2">Upload Photo</span>
                <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tags</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-100 flex items-center gap-1">
                  {tag} <X size={12} className="cursor-pointer" onClick={() => removeTag(tag)} />
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
                placeholder="Add tag (e.g. Kent, Formal, Modern)"
              />
              <button 
                type="button"
                onClick={addTag}
                className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>
        </div>

        <button 
          disabled={isGenerating || photos.length === 0}
          className="w-full bg-emerald-600 text-white py-6 rounded-3xl font-black text-xl shadow-xl shadow-emerald-100 hover:bg-emerald-700 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:hover:scale-100 transition-all flex items-center justify-center gap-3"
        >
          {isGenerating ? (
            <>
              <Loader2 className="animate-spin" size={24} />
              Generating Concepts...
            </>
          ) : (
            <>
              <Sparkles size={24} />
              Generate 3 Garden Concepts
            </>
          )}
        </button>
      </form>
    </div>
  );
};
