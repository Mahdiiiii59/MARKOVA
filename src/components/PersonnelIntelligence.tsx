import React, { useState } from 'react';
import { Sparkles, Plus, Trash2, ChevronDown, ChevronUp, FileText, UserCheck } from 'lucide-react';
import { Employee } from '../types';

interface PersonnelIntelligenceProps {
  employees: Employee[];
  onAddFact: (empId: number, factText: string, category: string) => Promise<void>;
  onDeleteFact: (factId: number) => Promise<void>;
  onGenerateSummary: (empId: number) => Promise<void>;
  isGeneratingSummary: boolean;
}

export const PersonnelIntelligence: React.FC<PersonnelIntelligenceProps> = ({
  employees,
  onAddFact,
  onDeleteFact,
  onGenerateSummary,
  isGeneratingSummary
}) => {
  const [selectedEmpId, setSelectedEmpId] = useState<number>(employees[0]?.id || 1);
  const [newFactText, setNewFactText] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'facts' | 'summaries'>('facts');
  const [expandedSummaryId, setExpandedSummaryId] = useState<number | null>(null);

  const selectedEmp = employees.find(e => e.id === selectedEmpId) || employees[0];

  const handleAddFactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFactText.trim() || !selectedEmp) return;
    await onAddFact(selectedEmp.id, newFactText.trim(), 'performance');
    setNewFactText('');
  };

  const handleGenerateSummary = async () => {
    if (!selectedEmp || isGeneratingSummary) return;
    await onGenerateSummary(selectedEmp.id);
  };

  if (!selectedEmp) return null;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* 4 Minimal Staff Avatar Pills */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
        {employees.map(emp => {
          const isSelected = emp.id === selectedEmp.id;
          return (
            <button
              key={emp.id}
              onClick={() => {
                setSelectedEmpId(emp.id);
                setExpandedSummaryId(null);
              }}
              className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl border text-xs transition-all cursor-pointer ${
                isSelected
                  ? 'bg-amber-600 text-stone-950 font-bold border-amber-500 shadow-md shadow-amber-950/40'
                  : 'bg-stone-900/80 text-stone-300 border-stone-800 hover:border-stone-700 hover:text-white'
              }`}
            >
              <img
                src={emp.avatar}
                alt={emp.name}
                className="w-6 h-6 rounded-full object-cover border border-stone-950/40"
              />
              <span>{emp.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-amber-700 text-amber-100' : 'bg-stone-950 text-stone-400'}`}>
                {emp.facts?.length || 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Single Minimal Card for Facts & Summaries */}
      <div className="bg-stone-900/60 border border-stone-800/80 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
        
        {/* Header with Title & Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg text-stone-100 tracking-tight">{selectedEmp.name}</h3>
              <span className="text-xs text-amber-400 font-medium bg-amber-950/60 border border-amber-800/40 px-2 py-0.5 rounded-full">
                {selectedEmp.role}
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">{selectedEmp.dept}</p>
          </div>

          <button
            onClick={handleGenerateSummary}
            disabled={isGeneratingSummary}
            className="flex items-center justify-center gap-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-stone-950 font-bold px-4 py-2 rounded-xl text-xs shadow-md shadow-amber-950/40 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isGeneratingSummary ? 'در حال تولید خلاصه...' : `تولید خلاصه ۸‌بندی هوشمند`}</span>
          </button>
        </div>

        {/* Minimal Subtab Switcher */}
        <div className="flex items-center justify-between border-b border-stone-800/60 pb-2">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveSubTab('facts')}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeSubTab === 'facts'
                  ? 'bg-stone-800 text-stone-100 border border-stone-700'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              رویدادها و فکت‌های ثبت‌شده ({selectedEmp.facts?.length || 0})
            </button>
            <button
              onClick={() => setActiveSubTab('summaries')}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeSubTab === 'summaries'
                  ? 'bg-stone-800 text-stone-100 border border-stone-700'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              خلاصه‌های استراتژیک ({selectedEmp.summaries?.length || 0})
            </button>
          </div>
        </div>

        {/* 1. FACTS LIST VIEW */}
        {activeSubTab === 'facts' && (
          <div className="space-y-4">
            {/* Quick Fact Form */}
            <form onSubmit={handleAddFactSubmit} className="flex gap-2">
              <input
                type="text"
                value={newFactText}
                onChange={(e) => setNewFactText(e.target.value)}
                placeholder={`ثبت گزارش، وضعیت عملکرد یا رویداد جدید درباره ${selectedEmp.name}...`}
                dir="auto"
                className="flex-1 bg-stone-950 border border-stone-800 rounded-xl px-4 py-2 text-xs text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-amber-500/60 bilingual-content"
              />
              <button
                type="submit"
                disabled={!newFactText.trim()}
                className="bg-stone-800 hover:bg-stone-700 disabled:opacity-40 text-stone-200 font-semibold px-3.5 py-2 rounded-xl text-xs border border-stone-700 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-amber-400" />
                <span>ثبت فکت</span>
              </button>
            </form>

            {/* List */}
            <div className="space-y-2">
              {!selectedEmp.facts || selectedEmp.facts.length === 0 ? (
                <div className="p-6 bg-stone-950/40 border border-stone-800/60 rounded-xl text-center text-xs text-stone-500" dir="auto">
                  هنوز فکتی برای {selectedEmp.name} ثبت نشده است.
                </div>
              ) : (
                selectedEmp.facts.map((fact) => (
                  <div
                    key={fact.id}
                    className="bg-stone-950/70 border border-stone-800/80 rounded-xl p-3 flex items-center justify-between gap-3 text-xs"
                    dir="auto"
                  >
                    <div className="flex-1 text-stone-300 leading-relaxed bilingual-content">
                      {fact.factText}
                      <span className="text-[10px] text-stone-500 ml-2 font-mono" dir="ltr">({fact.createdAt})</span>
                    </div>
                    <button
                      onClick={() => onDeleteFact(fact.id)}
                      className="text-stone-500 hover:text-rose-400 p-1 transition-colors cursor-pointer"
                      title="حذف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 2. SUMMARIES VIEW (8-POINT SCHEMA) */}
        {activeSubTab === 'summaries' && (
          <div className="space-y-3">
            {!selectedEmp.summaries || selectedEmp.summaries.length === 0 ? (
              <div className="p-6 bg-stone-950/40 border border-stone-800/60 rounded-xl text-center text-xs text-stone-500">
                هنوز خلاصه‌ای تولید نشده است. روی دکمه «تولید خلاصه ۸‌بندی هوشمند» کلیک کنید.
              </div>
            ) : (
              selectedEmp.summaries.map((sum, idx) => {
                const isExpanded = expandedSummaryId === sum.id || (expandedSummaryId === null && idx === 0);
                return (
                  <div
                    key={sum.id}
                    className="bg-stone-950/70 border border-stone-800/80 rounded-xl overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedSummaryId(isExpanded ? -1 : sum.id)}
                      className="w-full px-4 py-3 flex items-center justify-between text-right hover:bg-stone-900/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-xs font-semibold text-stone-200">
                          خلاصه مدیریتی سارا &bull; {sum.createdAt}
                        </span>
                        {sum.modelUsed && (
                          <span className="text-[10px] text-amber-400/80 bg-amber-950/60 border border-amber-800/30 px-1.5 py-0.5 rounded font-mono">
                            {sum.modelUsed}
                          </span>
                        )}
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5 text-stone-400" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                      )}
                    </button>

                    {isExpanded && (
                      <div
                        className="p-4 border-t border-stone-800/60 bg-stone-950/90 text-xs text-stone-200 whitespace-pre-wrap leading-relaxed bilingual-content"
                        dir="auto"
                      >
                        {sum.summaryText}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

      </div>
    </div>
  );
};
