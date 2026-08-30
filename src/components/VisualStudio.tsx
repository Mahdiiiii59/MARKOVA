import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
  RefreshCw,
  Image as ImageIcon,
  Layers,
  ArrowRight,
  Maximize2,
  Grid,
  Search,
  X,
  Download,
  FolderCheck,
  Folder
} from 'lucide-react';
import { FashionStyle, LookbookAnchor, GeneratedEditorial, TransferredFittingResult } from '../types';

interface VisualStudioProps {
  styles: FashionStyle[];
  onAddStyle: (style: Omit<FashionStyle, 'id' | 'createdAt'>) => Promise<void>;
  onDeleteStyle: (styleId: string) => Promise<void>;
}

// 4 Lookbook Standard Reference Angles
const standardLookbookAnchors: LookbookAnchor[] = [
  {
    id: 'anchor-1',
    title: 'Front Standing View',
    poseDescription: 'Full-length 3/4 standing pose showcasing jacket silhouette and trouser line.',
    cameraAngle: 'Eye-level 70mm lens',
    lightingVibe: 'Soft studio key light',
    imageUrl: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'anchor-2',
    title: 'Seated Lounge View',
    poseDescription: 'Seated comfortably on low stone plinth, highlighting lapel roll and drape.',
    cameraAngle: 'Slightly low angle 50mm lens',
    lightingVibe: 'Directional rim light with fill',
    imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'anchor-3',
    title: 'Walking Motion',
    poseDescription: 'Natural fluid stride showing garment flow and real-life drape.',
    cameraAngle: 'Full length 85mm shot',
    lightingVibe: 'Ambient daylight',
    imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'anchor-4',
    title: 'Fabric & Lapel Detail',
    poseDescription: 'Close-up macro composition focusing on chest pocket, lapel stitching, and fabric weave.',
    cameraAngle: '100mm macro lens',
    lightingVibe: 'Precision spot lighting',
    imageUrl: 'https://images.unsplash.com/photo-1598808503746-f34c53b9323e?w=600&auto=format&fit=crop&q=80'
  }
];

export const VisualStudio: React.FC<VisualStudioProps> = ({
  styles,
  onAddStyle,
  onDeleteStyle
}) => {
  // --- Section 1: Minimal Editorial Generator (Prompt + Button + Library Link) ---
  const [customPrompt, setCustomPrompt] = useState(
    'Editorial luxury menswear portrait of a model in soft daylight wearing a bespoke navy double-breasted suit with wide peak lapels, tailored trousers, sharp fabric weave.'
  );
  const [isGeneratingPosture, setIsGeneratingPosture] = useState(false);
  const [generatedPostures, setGeneratedPostures] = useState<GeneratedEditorial[]>([]);

  // --- Section 2: Simple Style Creation (Name + Photos + Library Link) ---
  const [newStyleName, setNewStyleName] = useState('');
  const [newStyleImages, setNewStyleImages] = useState<string[]>([]);
  const [justAddedStyle, setJustAddedStyle] = useState<string | null>(null);
  const [isSavingStyle, setIsSavingStyle] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Expanded Style Library Modal State
  const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false);
  const [searchLibraryQuery, setSearchLibraryQuery] = useState('');
  const [previewingImage, setPreviewingImage] = useState<string | null>(null);

  // --- Section 3: Virtual Garment Fitting (Space-Efficient Compact Display + Library Link) ---
  const [selectedStyleForFitting, setSelectedStyleForFitting] = useState<string>(styles[0]?.id || '');
  const [basePostureImage, setBasePostureImage] = useState<string>(
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&auto=format&fit=crop&q=80'
  );
  const [isTransferring, setIsTransferring] = useState(false);
  const [fittingResults, setFittingResults] = useState<TransferredFittingResult[]>([]);

  // --- Section 4: Lookbook Batch State (Saved to MARKOVA Folder) ---
  const [selectedLookbookStyleId, setSelectedLookbookStyleId] = useState<string>(styles[0]?.id || '');
  const [isGeneratingLookbook, setIsGeneratingLookbook] = useState(false);
  const [savedFolderInfo, setSavedFolderInfo] = useState<{
    path: string;
    savedAt: string;
    files: { title: string; fileName: string; url: string; savedPath: string }[];
  } | null>(null);

  const [lookbookBatchResults, setLookbookBatchResults] = useState<{
    styleName: string;
    images: { anchorId: string; title: string; url: string; fileName?: string; savedPath?: string; prompt: string }[];
  } | null>(null);

  // Helper: Upload Images for New Style
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setNewStyleImages(prev => {
          if (prev.length >= 4) return prev;
          return [...prev, base64];
        });
      };
      reader.readAsDataURL(file);
    });
  };

  // Helper: Base Posture Upload
  const handleBasePostureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setBasePostureImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 1. Generate Editorial Stance (Prompt + Button)
  const handleGeneratePosture = async () => {
    if (!customPrompt.trim() || isGeneratingPosture) return;
    setIsGeneratingPosture(true);
    try {
      const res = await fetch('/api/generate-posture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: customPrompt,
          category: 'Editorial Stance',
          aspectRatio: '3:4'
        })
      });

      if (res.ok) {
        const data = await res.json();
        const newEntry: GeneratedEditorial = {
          id: `gen-${Date.now()}`,
          prompt: customPrompt,
          aestheticCategory: 'Custom Stance',
          imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80',
          createdAt: 'Just now',
          aspectRatio: '3:4'
        };
        setGeneratedPostures(prev => [newEntry, ...prev]);
      }
    } catch (err) {
      console.error('Error generating posture:', err);
    } finally {
      setIsGeneratingPosture(false);
    }
  };

  // 2. Save New Style (Only Name + Images)
  const handleSaveStyleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStyleName.trim() || isSavingStyle) return;

    setIsSavingStyle(true);
    try {
      await onAddStyle({
        name: newStyleName.trim(),
        category: 'bespoke_suit',
        description: 'Bespoke custom style',
        fabricDetails: 'Pure Wool',
        colorPalette: ['#1e293b', '#0f172a', '#d97706'],
        sampleImages: newStyleImages.length > 0 ? newStyleImages : [
          'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&auto=format&fit=crop&q=80'
        ]
      });

      // Reset form
      setJustAddedStyle(newStyleName.trim());
      setTimeout(() => setJustAddedStyle(null), 5000);
      setNewStyleName('');
      setNewStyleImages([]);
    } catch (err) {
      console.error('Error saving style:', err);
    } finally {
      setIsSavingStyle(false);
    }
  };

  // 3. Virtual Garment Fitting
  const handleTransferPosture = async () => {
    const selectedStyle = styles.find(s => s.id === selectedStyleForFitting) || styles[0];
    if (!selectedStyle || isTransferring) return;

    setIsTransferring(true);
    try {
      const res = await fetch('/api/transfer-posture-style', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          styleId: selectedStyle.id,
          styleName: selectedStyle.name,
          fabricDetails: selectedStyle.fabricDetails || 'Super 160s Wool',
          basePostureImage
        })
      });

      if (res.ok) {
        const data = await res.json();
        const newResult: TransferredFittingResult = {
          id: `fit-${Date.now()}`,
          basePostureImage,
          styleId: selectedStyle.id,
          styleName: selectedStyle.name,
          extractedVibePrompt: data.extractedVibe || 'Model stance & directional lighting preserved.',
          finalPrompt: data.finalPrompt || `Editorial image wearing ${selectedStyle.name}`,
          generatedImageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=800&auto=format&fit=crop&q=80',
          createdAt: 'Just now'
        };
        setFittingResults(prev => [newResult, ...prev]);
      }
    } catch (err) {
      console.error('Fitting transfer error:', err);
    } finally {
      setIsTransferring(false);
    }
  };

  // 4. Batch Lookbook Generation & Saving to MARKOVA folder
  const handleGenerateLookbookBatch = async () => {
    const selectedStyle = styles.find(s => s.id === selectedLookbookStyleId) || styles[0];
    if (!selectedStyle || isGeneratingLookbook) return;

    setIsGeneratingLookbook(true);
    try {
      const res = await fetch('/api/generate-lookbook-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          styleId: selectedStyle.id,
          styleName: selectedStyle.name,
          fabricDetails: selectedStyle.fabricDetails || 'Pure Wool',
          anchors: standardLookbookAnchors
        })
      });

      if (res.ok) {
        const data = await res.json();
        setLookbookBatchResults(data);
        setSavedFolderInfo({
          path: data.savedFolderPath || `MARKOVA/lookbooks/${selectedStyle.name.replace(/\s+/g, '_')}`,
          savedAt: data.savedAt || new Date().toLocaleTimeString(),
          files: data.images || []
        });
      }
    } catch (err) {
      console.error('Lookbook batch error:', err);
    } finally {
      setIsGeneratingLookbook(false);
    }
  };

  // Helper: Download lookbook image
  const handleDownloadImage = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered styles for the expanded library modal
  const filteredLibraryStyles = styles.filter(s =>
    s.name.toLowerCase().includes(searchLibraryQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-stone-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-100 tracking-tight">
              Visual Studio
            </h1>
            <span className="text-xs font-mono uppercase tracking-wider text-amber-500 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded-md font-semibold">
              MARKOVA
            </span>
          </div>
          <p className="text-xs text-stone-400 mt-1">
            استودیوی بصری مارکووا — ژست‌ها، کمد استایل‌ها، پرو مجازی و ژورنال وب‌سایت
          </p>
        </div>

        {/* Action Controls & Quick Jump Links */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <button
            onClick={() => setIsLibraryModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Open Style Library ({styles.length})</span>
          </button>

          <a
            href="#section-editorial"
            className="px-2.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 transition-colors"
          >
            1. Photo Stances
          </a>
          <a
            href="#section-wardrobe"
            className="px-2.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 transition-colors"
          >
            2. Wardrobe
          </a>
          <a
            href="#section-fitting"
            className="px-2.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 transition-colors"
          >
            3. Virtual Fitting
          </a>
          <a
            href="#section-lookbook"
            className="px-2.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 transition-colors"
          >
            4. Lookbook Generator
          </a>
        </div>
      </div>

      {/* =========================================================
          SECTION 1: Photo Stances (Prompt + Button + Library Link)
      ========================================================= */}
      <section id="section-editorial" className="space-y-4 pt-1">
        <div className="flex items-center justify-between pb-2.5 border-b border-stone-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-mono font-bold text-xs">
              01
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-stone-100">
                1. Photo Stances
              </h2>
              <p className="text-xs text-stone-400">
                تولید ژست و زوایای عکاسی بر اساس پرامپت
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsLibraryModalOpen(true)}
            className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1.5 cursor-pointer bg-stone-900/90 hover:bg-stone-800 px-3 py-1.5 rounded-lg border border-stone-800 transition-colors"
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Open Style Library</span>
          </button>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {/* Prompt + Generate Button + Library Link */}
          <div className="bg-stone-900/70 border border-stone-800/90 rounded-2xl p-4 sm:p-5 space-y-3 shadow-md">
            <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider">
              Prompt
            </label>
            
            <textarea
              rows={4}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Describe model pose, aesthetic stance, lighting, and tailoring focus..."
              dir="auto"
              className="w-full bg-stone-950/90 border border-stone-800 rounded-xl p-3 text-xs text-stone-200 placeholder:text-stone-600 focus:outline-none focus:border-amber-500/60 transition-colors leading-relaxed"
            />

            <div className="flex items-center justify-between pt-1 gap-3">
              <button
                type="button"
                onClick={() => setIsLibraryModalOpen(true)}
                className="text-xs text-stone-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
              >
                <span>Use from Library</span>
                <ArrowRight className="w-3 h-3" />
              </button>

              <button
                type="button"
                onClick={handleGeneratePosture}
                disabled={isGeneratingPosture || !customPrompt.trim()}
                className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-amber-950/30 disabled:opacity-50"
              >
                {isGeneratingPosture ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>{isGeneratingPosture ? 'Generating...' : 'Generate Stance'}</span>
              </button>
            </div>
          </div>

          {/* Compact Results Gallery */}
          {generatedPostures.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-1 bg-stone-950/40 rounded-2xl border border-stone-800/80">
              {generatedPostures.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setPreviewingImage(item.imageUrl)}
                  className="group relative rounded-xl overflow-hidden border border-stone-800 bg-stone-900/60 shadow-sm flex flex-col cursor-pointer hover:border-amber-500/50 transition-all"
                >
                  <div className="aspect-[3/4] w-full overflow-hidden bg-stone-950 relative">
                    <img
                      src={item.imageUrl}
                      alt={item.aestheticCategory}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Maximize2 className="w-4 h-4 text-white drop-shadow" />
                    </div>
                  </div>
                  <div className="p-1.5 bg-stone-900/90 border-t border-stone-800">
                    <span className="font-medium text-stone-300 text-[10px] truncate block">
                      {item.createdAt}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* =========================================================
          SECTION 2: Wardrobe (Add Name + Photos + Library Link)
      ========================================================= */}
      <section id="section-wardrobe" className="space-y-4 pt-4 border-t border-stone-800/80">
        <div className="flex items-center justify-between pb-2.5 border-b border-stone-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-mono font-bold text-xs">
              02
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-stone-100">
                2. Wardrobe
              </h2>
              <p className="text-xs text-stone-400">
                کمد استایل‌ها — ثبت نام و تصاویر کت‌وشلوار
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsLibraryModalOpen(true)}
            className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1.5 cursor-pointer bg-stone-900 px-3 py-1.5 rounded-lg border border-stone-800 hover:bg-stone-800 transition-colors"
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Open Style Library ({styles.length})</span>
          </button>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {/* Simple Style Creator (Only Name + Upload Photos) */}
          <form
            onSubmit={handleSaveStyleSubmit}
            className="bg-stone-900/70 border border-stone-800/90 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-md"
          >
            <div className="flex items-center justify-between pb-2 border-b border-stone-800">
              <span className="text-xs font-bold text-stone-200 uppercase tracking-wider">
                Add Style
              </span>
              <button
                type="button"
                onClick={() => setIsLibraryModalOpen(true)}
                className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Grid className="w-3 h-3" />
                <span>Library</span>
              </button>
            </div>

            {/* Style Name Input */}
            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1">
                Style Name (نام استایل) *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Burgundy Velvet Smoking Jacket"
                value={newStyleName}
                onChange={(e) => setNewStyleName(e.target.value)}
                dir="auto"
                className="w-full bg-stone-950/90 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-amber-500/60 transition-colors"
              />
            </div>

            {/* Photo Upload Area */}
            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1">
                Photos (تصاویر نمونه - حداکثر ۴ عکس)
              </label>
              
              <input
                type="file"
                multiple
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageUpload}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border border-dashed border-stone-800 hover:border-amber-500/50 rounded-xl p-3 text-center cursor-pointer transition-all bg-stone-950/40 hover:bg-stone-950/80 group"
              >
                <Upload className="w-4 h-4 mx-auto text-stone-500 group-hover:text-amber-400 transition-colors mb-1" />
                <p className="text-xs text-stone-300 font-medium">Select 1 to 4 images</p>
              </div>

              {/* Uploaded Preview Thumbnails */}
              {newStyleImages.length > 0 && (
                <div className="grid grid-cols-4 gap-1.5 mt-2">
                  {newStyleImages.map((img, idx) => (
                    <div key={idx} className="relative rounded-lg overflow-hidden border border-stone-700 aspect-square group">
                      <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setNewStyleImages(prev => prev.filter((_, i) => i !== idx));
                        }}
                        className="absolute top-0.5 right-0.5 bg-black/80 hover:bg-red-900 text-white rounded p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={!newStyleName.trim() || isSavingStyle}
              className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-stone-950 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-amber-950/40 mt-1"
            >
              {isSavingStyle ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              <span>Save Style to Wardrobe</span>
            </button>
          </form>

          {/* Success message right after creation */}
          {justAddedStyle && (
            <div className="p-3 bg-green-950/40 border border-green-900/60 rounded-xl text-green-400 text-xs text-center animate-in fade-in" dir="auto">
              استایل "{justAddedStyle}" با موفقیت ذخیره شد. برای مشاهده به بخش Library مراجعه کنید.
            </div>
          )}
        </div>
      </section>

      {/* =========================================================
          SECTION 3: Virtual Fitting (Space-Efficient Compact Layout + Library Link)
      ========================================================= */}
      <section id="section-fitting" className="space-y-4 pt-4 border-t border-stone-800/80">
        <div className="flex items-center justify-between pb-2.5 border-b border-stone-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-mono font-bold text-xs">
              03
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-stone-100">
                3. Virtual Fitting
              </h2>
              <p className="text-xs text-stone-400">
                انتقال استایل کت‌وشلوار انتخابی روی ژست مدل
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsLibraryModalOpen(true)}
            className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1.5 cursor-pointer bg-stone-900 px-3 py-1.5 rounded-lg border border-stone-800 hover:bg-stone-800 transition-colors"
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Select from Library</span>
          </button>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          <div className="bg-stone-900/70 border border-stone-800/90 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-md">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-300 uppercase tracking-wider">
                Target Style
              </label>
              <button
                type="button"
                onClick={() => setIsLibraryModalOpen(true)}
                className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Grid className="w-3 h-3" />
                <span>Browse Library</span>
              </button>
            </div>

            <select
              value={selectedStyleForFitting}
              onChange={(e) => setSelectedStyleForFitting(e.target.value)}
              disabled={styles.length === 0}
              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-amber-500/60 disabled:opacity-50"
            >
              {styles.length === 0 ? (
                <option value="">No styles in library</option>
              ) : (
                styles.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))
              )}
            </select>

            {/* Space-Efficient Pose Reference Strip */}
            <div className="flex items-center gap-3 bg-stone-950/80 p-2 rounded-xl border border-stone-800 mt-2">
              <div
                onClick={() => setPreviewingImage(basePostureImage)}
                className="w-16 h-16 rounded-lg overflow-hidden bg-stone-900 shrink-0 border border-stone-700 cursor-pointer relative group"
              >
                <img src={basePostureImage} alt="Base" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Maximize2 className="w-3 h-3 text-white" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-semibold text-stone-200 block truncate">
                  Base Model Stance
                </span>
                <label className="inline-flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 cursor-pointer mt-1 font-medium">
                  <Upload className="w-3 h-3" />
                  <span>Upload New Pose</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBasePostureUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <button
              type="button"
              onClick={handleTransferPosture}
              disabled={isTransferring || styles.length === 0}
              className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-stone-950 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-amber-950/40 mt-1"
            >
              {isTransferring ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>{isTransferring ? 'Fitting in progress...' : 'Execute Fitting'}</span>
            </button>
          </div>

          {/* Space-Saving Fitting Results: Sleek Comparative Rows */}
          {fittingResults.length > 0 && (
            <div className="space-y-2.5">
              {fittingResults.map((res) => (
                <div
                  key={res.id}
                  className="bg-stone-900/60 border border-stone-800 hover:border-stone-700 rounded-xl p-3 shadow-sm transition-all flex items-center gap-3.5"
                >
                  {/* Compact Side-by-Side Thumbnails */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div
                      onClick={() => setPreviewingImage(res.basePostureImage)}
                      className="w-16 h-16 rounded-lg overflow-hidden bg-stone-950 border border-stone-800 cursor-pointer relative group"
                      title="Original Pose"
                    >
                      <img src={res.basePostureImage} alt="Base Pose" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Maximize2 className="w-3 h-3 text-white" />
                      </div>
                    </div>

                    <ArrowRight className="w-3.5 h-3.5 text-stone-500 shrink-0" />

                    <div
                      onClick={() => setPreviewingImage(res.generatedImageUrl)}
                      className="w-16 h-16 rounded-lg overflow-hidden bg-stone-950 border border-amber-500/50 shadow-sm cursor-pointer relative group"
                      title="Fitted Result"
                    >
                      <img src={res.generatedImageUrl} alt="Fitted Result" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Maximize2 className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Vibe & Details in Compact Form */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-stone-100 truncate">{res.styleName}</span>
                      <span className="text-amber-400 font-mono text-[10px] shrink-0">{res.createdAt}</span>
                    </div>
                    <p className="text-[10px] text-stone-400 line-clamp-2 leading-tight font-sans" dir="auto">
                      {res.extractedVibePrompt}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* =========================================================
          SECTION 4: Lookbook Generator (Saves Pictures to MARKOVA Folder)
      ========================================================= */}
      <section id="section-lookbook" className="space-y-4 pt-4 border-t border-stone-800/80">
        <div className="flex items-center justify-between pb-2.5 border-b border-stone-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-mono font-bold text-xs">
              04
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-stone-100">
                4. Lookbook Generator
              </h2>
              <p className="text-xs text-stone-400">
                تولید ژورنال ۴ زاویه‌ای و ذخیره در پوشه اختصاصی MARKOVA
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {/* Action Header */}
          <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <label className="text-xs font-bold text-stone-300 uppercase tracking-wider whitespace-nowrap">
                Select Style:
              </label>
              <select
                value={selectedLookbookStyleId}
                onChange={(e) => setSelectedLookbookStyleId(e.target.value)}
                disabled={styles.length === 0}
                className="bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-amber-500/60 w-full sm:w-60 disabled:opacity-50"
              >
                {styles.length === 0 ? (
                  <option value="">No styles in library</option>
                ) : (
                  styles.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleGenerateLookbookBatch}
                disabled={isGeneratingLookbook || styles.length === 0}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-stone-950 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-amber-950/40"
              >
                {isGeneratingLookbook ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Layers className="w-3.5 h-3.5" />
                )}
                <span>{isGeneratingLookbook ? 'Generating & Saving...' : 'Generate 4 Angles'}</span>
              </button>
            </div>
          </div>

          {/* MARKOVA Folder Saved Badge & Info */}
          {savedFolderInfo && (
            <div className="bg-amber-950/20 border border-amber-800/40 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <FolderCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="text-xs">
                  <span className="text-stone-300 font-medium">Saved to MARKOVA Folder: </span>
                  <span className="font-mono text-amber-400 font-semibold">{savedFolderInfo.path}</span>
                  <span className="text-stone-500 text-[10px] ml-2 font-mono">({savedFolderInfo.files.length} images)</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    savedFolderInfo.files.forEach((f) => {
                      handleDownloadImage(f.url, f.fileName);
                    });
                  }}
                  className="px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3 h-3 text-amber-400" />
                  <span>Download Package</span>
                </button>
              </div>
            </div>
          )}

          {/* 4 Generated Angles Display */}
          {lookbookBatchResults && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {standardLookbookAnchors.map((anchor, idx) => {
                const batchResultImage = lookbookBatchResults.images.find(
                  img => img.anchorId === anchor.id
                )?.url;

                if (!batchResultImage) return null;

                const fileName = `0${idx + 1}_${anchor.title.replace(/\s+/g, '_')}.jpg`;

                return (
                  <div
                    key={anchor.id}
                    className="bg-stone-900/60 border border-stone-800 rounded-xl p-2.5 space-y-2 flex flex-col justify-between animate-in fade-in zoom-in-95 duration-500"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-stone-200 text-[11px] truncate">{anchor.title}</span>
                        <span className="text-[9px] text-amber-500 font-mono">Angle {idx + 1}</span>
                      </div>

                      <div
                        onClick={() => setPreviewingImage(batchResultImage)}
                        className="aspect-[4/3] rounded-lg overflow-hidden bg-stone-950 border border-stone-800 cursor-pointer group relative"
                      >
                        <img
                          src={batchResultImage}
                          alt={anchor.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Maximize2 className="w-4 h-4 text-white drop-shadow" />
                        </div>
                      </div>
                      <div className="text-[9px] text-stone-500 font-mono truncate pt-1" title={fileName}>
                        {fileName}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* =========================================================
          EXPANDABLE MODAL: FULL WARDROBE STYLE LIBRARY
      ========================================================= */}
      {isLibraryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in">
          <div className="bg-[#111113] border border-stone-800 rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Grid className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-stone-100">
                    Style Library (کتابخانه استایل‌ها)
                  </h3>
                  <p className="text-xs text-stone-400">
                    {styles.length} استایل ثبت شده در کمد مارکووا
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Search Bar */}
                <div className="relative w-40 sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                  <input
                    type="text"
                    placeholder="Search styles..."
                    value={searchLibraryQuery}
                    onChange={(e) => setSearchLibraryQuery(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-stone-200 placeholder:text-stone-600 focus:outline-none focus:border-amber-500/60"
                  />
                </div>

                <button
                  onClick={() => setIsLibraryModalOpen(false)}
                  className="w-8 h-8 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center border border-stone-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body / Style Grid */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 max-h-[calc(90vh-140px)]">
              {filteredLibraryStyles.length === 0 ? (
                <div className="text-center py-12 text-stone-500 space-y-2">
                  <ImageIcon className="w-8 h-8 mx-auto text-stone-600" />
                  <p className="text-xs">No styles found matching "{searchLibraryQuery}"</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {filteredLibraryStyles.map((style) => (
                    <div
                      key={style.id}
                      className="bg-stone-900/60 border border-stone-800 hover:border-stone-700 rounded-2xl p-3.5 space-y-3 transition-all flex flex-col justify-between shadow-sm"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-xs text-stone-100 truncate pr-2">
                            {style.name}
                          </h4>
                          <button
                            onClick={() => onDeleteStyle(style.id)}
                            className="text-stone-500 hover:text-red-400 p-1 rounded transition-colors"
                            title="Delete Style"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Images Strip */}
                        <div className="grid grid-cols-2 gap-1.5 rounded-xl overflow-hidden aspect-[4/3] bg-stone-950">
                          {style.sampleImages.slice(0, 2).map((img, i) => (
                            <img
                              key={i}
                              src={img}
                              alt={style.name}
                              onClick={() => setPreviewingImage(img)}
                              className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                            />
                          ))}
                        </div>
                      </div>

                      {/* Modal Style Actions */}
                      <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between gap-2">
                        <span className="text-[10px] text-stone-500 font-mono">
                          {style.sampleImages.length} images
                        </span>
                        
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedStyleForFitting(style.id);
                              setIsLibraryModalOpen(false);
                            }}
                            className="px-2 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-[10px] font-medium transition-colors"
                          >
                            Fitting
                          </button>
                          <button
                            onClick={() => {
                              setSelectedLookbookStyleId(style.id);
                              setIsLibraryModalOpen(false);
                            }}
                            className="px-2 py-1 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 text-[10px] font-medium transition-colors"
                          >
                            Lookbook
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Image Preview Modal */}
      {previewingImage && (
        <div
          onClick={() => setPreviewingImage(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer animate-in fade-in"
        >
          <div className="relative max-w-3xl max-h-[85vh] rounded-2xl overflow-hidden border border-stone-800 shadow-2xl bg-black">
            <button
              onClick={() => setPreviewingImage(null)}
              className="absolute top-3 right-3 bg-black/80 text-white rounded-full p-2 hover:bg-stone-800 transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>
            <img
              src={previewingImage}
              alt="Enlarged View"
              className="max-h-[85vh] max-w-full object-contain"
            />
          </div>
        </div>
      )}

    </div>
  );
};
