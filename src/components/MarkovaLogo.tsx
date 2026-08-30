import React, { useState } from 'react';
import { Upload, Sliders, Image, X, Check, RefreshCw } from 'lucide-react';
import { LogoSettings } from '../types';

interface MarkovaLogoProps {
  className?: string;
  size?: number;
  color?: string;
  customLogoUrl?: string | null;
}

// Geometric Monogram based on the luxury MARKOVA identity
export const MarkovaMonogram: React.FC<MarkovaLogoProps> = ({
  className = '',
  size = 28,
  color = '#f59e0b',
  customLogoUrl = null
}) => {
  if (customLogoUrl) {
    return (
      <img
        src={customLogoUrl}
        alt="Custom MARKOVA Logo"
        className={`object-contain rounded-md ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <svg
      width={size}
      height={size * (72 / 100)}
      viewBox="0 0 100 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Left Chevron */}
      <path
        d="M12 70 L48 4 L76 70"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
      {/* Right Chevron overlapping */}
      <path
        d="M24 70 L52 4 L88 70"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
};

// Modern Clean Brand Badge (Only MARKOVA and NEXURA AI Lab)
export const MarkovaBrandBadge: React.FC<{
  className?: string;
  customLogoUrl?: string | null;
  onOpenLogoSettings?: () => void;
}> = ({
  className = '',
  customLogoUrl = null,
  onOpenLogoSettings
}) => {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* Monogram Box with subtle border & clickable customizer trigger */}
      <button
        onClick={onOpenLogoSettings}
        className="relative group cursor-pointer text-left focus:outline-none"
        title="Click to customize or upload your custom logo"
      >
        <div className="w-8 h-8 rounded-lg bg-stone-950 border border-stone-800 group-hover:border-amber-500/60 flex items-center justify-center p-1.5 shadow-sm transition-all duration-200">
          <MarkovaMonogram size={18} color="#f59e0b" customLogoUrl={customLogoUrl} />
        </div>
      </button>

      {/* Clean Wordmark: Only MARKOVA and NEXURA AI Lab */}
      <div className="flex flex-col justify-center">
        <span className="font-sans font-bold tracking-[0.22em] text-[13px] text-stone-100 uppercase select-none leading-none">
          MARKOVA
        </span>
        <span className="text-[9px] text-stone-400 font-mono tracking-wider uppercase mt-1 leading-none">
          NEXURA AI Lab
        </span>
      </div>
    </div>
  );
};

// Ambient Background Watermark (supports custom image & adjustable opacity)
export const MarkovaWatermarkBackground: React.FC<{
  customLogoUrl?: string | null;
  opacity?: number;
  enabled?: boolean;
}> = ({
  customLogoUrl = null,
  opacity = 0.025,
  enabled = true
}) => {
  if (!enabled || opacity <= 0) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center select-none transition-opacity duration-300"
      style={{ opacity }}
    >
      {customLogoUrl ? (
        <img
          src={customLogoUrl}
          alt="Watermark"
          className="max-w-[700px] max-h-[700px] object-contain filter grayscale"
        />
      ) : (
        <svg
          width="800"
          height="576"
          viewBox="0 0 100 72"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-white transform scale-125"
        >
          <path
            d="M12 70 L48 4 L76 70"
            stroke="currentColor"
            strokeWidth="6"
          />
          <path
            d="M24 70 L52 4 L88 70"
            stroke="currentColor"
            strokeWidth="6"
          />
        </svg>
      )}
    </div>
  );
};

// Manual Logo Customizer Modal
export const LogoSettingsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  settings: LogoSettings;
  onSaveSettings: (newSettings: LogoSettings) => void;
}> = ({ isOpen, onClose, settings, onSaveSettings }) => {
  const [logoUrl, setLogoUrl] = useState(settings.customLogoUrl || '');
  const [opacity, setOpacity] = useState(settings.watermarkOpacity ?? 0.03);
  const [enabled, setEnabled] = useState(settings.watermarkEnabled ?? true);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setLogoUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSaveSettings({
      customLogoUrl: logoUrl.trim() ? logoUrl.trim() : null,
      watermarkOpacity: opacity,
      watermarkEnabled: enabled
    });
    onClose();
  };

  const handleReset = () => {
    setLogoUrl('');
    setOpacity(0.025);
    setEnabled(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#121215] border border-stone-800 rounded-2xl max-w-md w-full p-5 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-stone-100">Manual Logo & Watermark Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-900 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-stone-400 leading-relaxed">
          Upload your exact MARKOVA vector or PNG logo to manually override both the top navigation badge and ambient background watermark.
        </p>

        {/* Logo Preview */}
        <div className="flex items-center justify-center p-4 bg-stone-950/80 border border-stone-800/80 rounded-xl">
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-xl bg-stone-900 border border-stone-700/80 flex items-center justify-center p-2 shadow-inner">
              <MarkovaMonogram size={40} color="#f59e0b" customLogoUrl={logoUrl || null} />
            </div>
            <span className="text-[11px] text-stone-400 font-medium">
              {logoUrl ? 'Custom Logo Active' : 'Default Geometric Monogram'}
            </span>
          </div>
        </div>

        {/* Upload or URL */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">
              Upload Logo File (PNG, SVG, JPG)
            </label>
            <label className="flex items-center justify-center gap-2 border border-dashed border-stone-700 hover:border-amber-500 bg-stone-900/60 hover:bg-stone-900 p-3 rounded-xl cursor-pointer transition-all text-xs text-stone-300">
              <Upload className="w-4 h-4 text-amber-400" />
              <span>Choose Image File from Computer</span>
              <input
                type="file"
                accept="image/*,.svg"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">
              Or Paste Direct Image URL
            </label>
            <input
              type="text"
              value={logoUrl.startsWith('data:') ? 'Image uploaded (base64 stored)' : logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://your-domain.com/markova-logo.svg"
              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Watermark Controls */}
          <div className="pt-2 border-t border-stone-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-stone-300">Ambient Background Watermark</label>
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="rounded accent-amber-500 cursor-pointer"
              />
            </div>

            {enabled && (
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-stone-400">
                  <span>Watermark Opacity</span>
                  <span className="font-mono">{Math.round(opacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="0.15"
                  step="0.005"
                  value={opacity}
                  onChange={(e) => setOpacity(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-stone-800">
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-300 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset to Default</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-stone-400 hover:text-white rounded-lg bg-stone-900 border border-stone-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 text-xs font-bold text-stone-950 bg-amber-600 hover:bg-amber-500 rounded-lg flex items-center gap-1.5 transition-all shadow-md shadow-amber-950/40 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
