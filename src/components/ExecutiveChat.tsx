import React, { useState, useRef, useEffect } from 'react';
import { Send, Trash2, Sun, Moon, Coffee, History, Plus, MessageSquare, Clock, ChevronRight, X, Sparkles } from 'lucide-react';
import { ChatMessage, ChatSession } from '../types';

interface ExecutiveChatProps {
  currentSession: ChatSession;
  sessions: ChatSession[];
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
  onDeleteSession: (sessionId: string) => void;
  onSendMessage: (text: string) => Promise<void>;
  onClearCurrentChat: () => void;
  isLoading: boolean;
}

export const ExecutiveChat: React.FC<ExecutiveChatProps> = ({
  currentSession,
  sessions,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onSendMessage,
  onClearCurrentChat,
  isLoading
}) => {
  const [inputText, setInputText] = useState('');
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession.messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    const text = inputText;
    setInputText('');
    await onSendMessage(text);
  };

  // Persian Greeting with warm, friendly tone for Nima
  const getPersianGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return {
        persian: 'سلام نیما جان، صبح بخیر',
        icon: <Sun className="w-5 h-5 text-amber-400" />
      };
    }
    if (hour >= 12 && hour < 17) {
      return {
        persian: 'سلام نیما جان، روز بخیر',
        icon: <Coffee className="w-5 h-5 text-amber-400" />
      };
    }
    if (hour >= 17 && hour < 22) {
      return {
        persian: 'سلام نیما جان، عصر بخیر',
        icon: <Coffee className="w-5 h-5 text-amber-500" />
      };
    }
    return {
      persian: 'سلام نیما جان، شب بخیر',
      icon: <Moon className="w-5 h-5 text-indigo-400" />
    };
  };

  const greeting = getPersianGreeting();

  const quickPrompts = [
    { textFa: 'وضعیت سفارشات و پورسانت سعید', descFa: 'بررسی قرارداد ۱.۲۵۱ میلیاردی و کالیته‌های بیلا' },
    { textFa: 'خلاصه ساختار فروش ۳۸.۱۲ میلیارد تومانی', descFa: 'تحلیل بازدهی دوخت سفارشی و نقدینگی' },
    { textFa: 'وضعیت فاکتورهای پارچه میلان ایتالیا', descFa: 'سفارش پارچه‌های فاستونی سوپر ۱۵۰ تا ۱۸۰' },
    { textFa: 'عملکرد مایکل، مصطفی و اسدی', descFa: 'گزارش سالن پرو، فروش آماده و تراز مالی' }
  ];

  return (
    <div className="relative max-w-4xl mx-auto flex flex-col h-[calc(100vh-5.5rem)] px-4 sm:px-6 py-4">
      
      {/* Top Header: Persian Greeting + History Drawer Trigger + New Chat */}
      <div className="flex items-center justify-between py-3 border-b border-stone-800/80 mb-3 bg-stone-950/40 rounded-xl px-3 sm:px-4 backdrop-blur-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center">
            {greeting.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-stone-100 tracking-tight font-sans">
                {greeting.persian}
              </h2>
            </div>
            <p className="text-[11px] text-stone-400">
              سارا (مشاور هوشمند مارکووا) آنلاین است.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* History Button */}
          <button
            onClick={() => setShowHistoryDrawer(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 text-xs transition-all cursor-pointer shadow-xs"
            title="نمایش گفتگوهای قبلی"
          >
            <History className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline text-[11px] font-medium">گفتگوهای قبلی ({sessions.length})</span>
          </button>

          {/* New Chat Button */}
          <button
            onClick={onNewChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-bold transition-all cursor-pointer shadow-md shadow-amber-950/40"
            title="گفتگوی جدید"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">گفتگوی جدید</span>
          </button>

          {/* Clear Current */}
          <button
            onClick={onClearCurrentChat}
            className="text-stone-500 hover:text-stone-300 transition-colors p-1.5 rounded-lg hover:bg-stone-900 text-xs cursor-pointer"
            title="پاکسازی این گفتگو"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 scroll-smooth">
        {currentSession.messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 text-stone-400">
            <div className="w-12 h-12 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-center text-amber-500">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-stone-200">نیما جان، چگونه می‌توانم امروز به شما کمک کنم؟</p>
              <p className="text-xs text-stone-500 mt-1">تمام داده‌های مالی، پرونده پرسنل و استودیوی تصویری آماده است.</p>
            </div>

            {/* Quick Prompt Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg w-full pt-2">
              {quickPrompts.map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendMessage(qp.textFa)}
                  className="text-right bg-stone-900/80 hover:bg-stone-800/90 border border-stone-800/80 hover:border-amber-500/40 p-2.5 rounded-xl text-xs transition-all cursor-pointer group"
                >
                  <div className="text-stone-200 font-medium group-hover:text-amber-300">{qp.textFa}</div>
                  <div className="text-[10px] text-stone-500 mt-0.5">{qp.descFa}</div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          currentSession.messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[90%] sm:max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-md ${
                    isUser
                      ? 'bg-amber-600 text-stone-950 font-medium'
                      : 'bg-stone-900/95 text-stone-100 border border-stone-800/90'
                  }`}
                  dir="auto"
                >
                  <div className="whitespace-pre-wrap font-sans text-[13px] sm:text-[14px] bilingual-content leading-relaxed">
                    {msg.content}
                  </div>
                </div>
                <div className="text-[10px] text-stone-500 mt-1 px-1 flex items-center gap-1.5 font-mono" dir="ltr">
                  <span>{msg.timestamp}</span>
                  {msg.source && <span>&bull; {msg.source}</span>}
                </div>
              </div>
            );
          })
        )}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-stone-400 py-2 px-2" dir="auto">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <span>سارا در حال تحلیل و پردازش پاسخ...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form with dir="auto" */}
      <form onSubmit={handleSubmit} className="pt-3 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="پیام خود را برای سارا بنویسید..."
          dir="auto"
          className="flex-1 bg-stone-900/90 border border-stone-800 rounded-xl px-4 py-3 text-sm text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-500/60 transition-colors shadow-inner bilingual-content"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-stone-950 font-bold px-4 py-3 rounded-xl text-sm transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-md shadow-amber-950/40"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Previous Chats Slide-Over Drawer */}
      {showHistoryDrawer && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end rounded-2xl overflow-hidden animate-in fade-in duration-200">
          <div className="w-full sm:w-80 bg-[#121215] border-l border-stone-800 p-4 flex flex-col h-full shadow-2xl">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-stone-100">گفتگوهای قبلی (Chat History)</h3>
              </div>
              <button
                onClick={() => setShowHistoryDrawer(false)}
                className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* New Chat in Drawer */}
            <button
              onClick={() => {
                onNewChat();
                setShowHistoryDrawer(false);
              }}
              className="mt-3 w-full py-2 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>شروع گفتگوی تازه</span>
            </button>

            {/* Sessions List */}
            <div className="flex-1 overflow-y-auto space-y-2 mt-3 pr-1">
              {sessions.length === 0 ? (
                <div className="p-4 text-center text-xs text-stone-500">
                  هنوز گفتگوی ذخیره‌شده‌ای وجود ندارد.
                </div>
              ) : (
                sessions.map((sess) => {
                  const isSelected = sess.id === currentSession.id;
                  return (
                    <div
                      key={sess.id}
                      className={`group flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-950/40 border-amber-800/60 text-amber-200'
                          : 'bg-stone-900/60 border-stone-800/80 text-stone-300 hover:bg-stone-900 hover:border-stone-700'
                      }`}
                      onClick={() => {
                        onSelectSession(sess.id);
                        setShowHistoryDrawer(false);
                      }}
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="text-xs font-medium truncate">
                          {sess.titleFa || sess.title}
                        </div>
                        <div className="text-[10px] text-stone-500 flex items-center gap-1.5 mt-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{sess.createdAt}</span>
                          <span>&bull;</span>
                          <span>{sess.messages.length} پیام</span>
                        </div>
                      </div>

                      {sessions.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteSession(sess.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-stone-500 hover:text-rose-400 p-1 transition-all cursor-pointer"
                          title="حذف این گفتگو"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
