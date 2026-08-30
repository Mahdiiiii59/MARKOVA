import React from 'react';
import { MessageSquare, Camera, Users, FileSpreadsheet, Terminal, Sliders } from 'lucide-react';
import { MarkovaBrandBadge } from './MarkovaLogo';

interface NavbarProps {
  activeTab: 'chat' | 'studio' | 'employees' | 'documents' | 'system';
  setActiveTab: (tab: 'chat' | 'studio' | 'employees' | 'documents' | 'system') => void;
  customLogoUrl: string | null;
  onOpenLogoSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  customLogoUrl,
  onOpenLogoSettings
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-stone-800/80 bg-[#0c0c0e]/95 backdrop-blur-md px-3 sm:px-6 py-2.5 flex items-center justify-between flex-wrap gap-2">
      {/* Brand & Creator Attribution with Thin Modern Border */}
      <MarkovaBrandBadge
        customLogoUrl={customLogoUrl}
        onOpenLogoSettings={onOpenLogoSettings}
      />

      {/* Navigation Tabs (Strictly English as requested) */}
      <nav className="flex items-center gap-1 bg-stone-900/90 p-1 rounded-xl border border-stone-800/80 shadow-sm overflow-x-auto">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'chat'
              ? 'bg-stone-100 text-stone-950 font-bold shadow-sm'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Chat</span>
        </button>

        <button
          onClick={() => setActiveTab('studio')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'studio'
              ? 'bg-stone-100 text-stone-950 font-bold shadow-sm'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Camera className="w-3.5 h-3.5 text-amber-500" />
          <span>Visual Studio</span>
        </button>

        <button
          onClick={() => setActiveTab('employees')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'employees'
              ? 'bg-stone-100 text-stone-950 font-bold shadow-sm'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Personnel</span>
        </button>

        <button
          onClick={() => setActiveTab('documents')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'documents'
              ? 'bg-stone-100 text-stone-950 font-bold shadow-sm'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Documents & Sales</span>
        </button>

        <button
          onClick={() => setActiveTab('system')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'system'
              ? 'bg-stone-100 text-stone-950 font-bold shadow-sm'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>System & APIs</span>
        </button>

        {/* Quick Logo Settings Icon */}
        <button
          onClick={onOpenLogoSettings}
          className="p-1.5 rounded-lg text-stone-500 hover:text-amber-400 hover:bg-stone-800 transition-colors ml-0.5 cursor-pointer"
          title="Customize Logo & Watermark"
        >
          <Sliders className="w-3.5 h-3.5" />
        </button>
      </nav>
    </header>
  );
};
