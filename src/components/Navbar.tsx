import React from 'react';
import { MessageSquare, Users, BarChart3, Terminal } from 'lucide-react';
import { MarkovaBrandBadge } from './MarkovaLogo';

interface NavbarProps {
  activeTab: 'chat' | 'employees' | 'documents' | 'system';
  setActiveTab: (tab: 'chat' | 'employees' | 'documents' | 'system') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <header className="sticky top-0 z-40 border-b border-stone-800/80 bg-[#0c0c0e]/95 backdrop-blur-md px-4 sm:px-8 py-3 flex items-center justify-between">
      {/* Brand & Creator Attribution with Thin Modern Border */}
      <MarkovaBrandBadge />

      {/* Navigation Tabs */}
      <nav className="flex items-center gap-1 bg-stone-900/90 p-1 rounded-xl border border-stone-800/80 shadow-sm">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'chat'
              ? 'bg-stone-100 text-stone-950 font-bold shadow-sm'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>گفتگو (Chat)</span>
        </button>

        <button
          onClick={() => setActiveTab('employees')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'employees'
              ? 'bg-stone-100 text-stone-950 font-bold shadow-sm'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>پرسنل (Personnel)</span>
        </button>

        <button
          onClick={() => setActiveTab('documents')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'documents'
              ? 'bg-stone-100 text-stone-950 font-bold shadow-sm'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>فروش و اسناد (Sales & Docs)</span>
        </button>

        <button
          onClick={() => setActiveTab('system')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'system'
              ? 'bg-stone-100 text-stone-950 font-bold shadow-sm'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>سیستم (System)</span>
        </button>
      </nav>
    </header>
  );
};
