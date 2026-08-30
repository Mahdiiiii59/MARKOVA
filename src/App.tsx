import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ExecutiveChat } from './components/ExecutiveChat';
import { PersonnelIntelligence } from './components/PersonnelIntelligence';
import { DocumentIntelligence } from './components/DocumentIntelligence';
import { SystemHub } from './components/SystemHub';
import { MarkovaWatermarkBackground } from './components/MarkovaLogo';
import { Employee, ChatMessage, ChatSession, DocumentRecord } from './types';

// Default initial sessions
const initialChatSessions: ChatSession[] = [
  {
    id: 'session-1',
    title: 'تحلیل فروش شو‌روم و سفارشات سفارشی',
    titleFa: 'تحلیل فروش شو‌روم و سفارشات سفارشی',
    createdAt: 'امروز، ۱۰:۳۰',
    messages: [
      {
        id: 'msg-1',
        role: 'assistant',
        content: `درود و وقت‌بخیر، جناب چنگیزی عزیز.
سیستم هوش مصنوعی MARKOVA AI آماده ارائه گزارشات و پشتیبانی از تصمیمات اجرایی است.

تمام داده‌های شو‌روم (فروش ۳۸.۱۲ میلیارد تومانی در ۱۶۸ سفارش)، وضعیت پرسنل (سعید، مایکل، مصطفی و اسدی) و پیش‌فاکتورهای کارخانجات پارچه لود شده است. مایلید روی کدام بخش تمرکز کنیم؟`,
        source: 'Hermes Workspace Memory',
        timestamp: '10:30'
      }
    ]
  },
  {
    id: 'session-2',
    title: 'استراتژی کمیسیون دوخت سفارشی سعید',
    titleFa: 'استراتژی کمیسیون دوخت سفارشی سعید',
    createdAt: 'دیروز، ۱۷:۴۵',
    messages: [
      {
        id: 'msg-2-1',
        role: 'user',
        content: 'وضعیت سفارش سفارشی سفارت و کمیسیون سعید چطور بود؟',
        timestamp: '17:45'
      },
      {
        id: 'msg-2-2',
        role: 'assistant',
        content: `گزارش سفارش دیپلماتیک سعید:
- مبلغ کل: ۱.۲۵۱ میلیارد تومان (۵ دست کت‌وشلوار دست‌دوز سوپر ۱۶۰ فاستونی).
- درصد سهم از کل فروش فصلی: ۳.۲۸٪ از کل حجم شو‌روم.
- پورسانت تعلق‌گرفته: بر اساس ساختار ۶٪ دوخت سفارشی، معادل ۷۵ میلیون تومان.
- توصیه: تخصیص اولویت پرو برای ۲ دست تکمیلی جهت تحویل بدون تأخیر.`,
        source: 'Hermes Workspace',
        timestamp: '17:46'
      }
    ]
  },
  {
    id: 'session-3',
    title: 'سفارش پارچه‌های فاستونی کارخانه بیلا ایتالیا',
    titleFa: 'سفارش پارچه‌های فاستونی کارخانه بیلا ایتالیا',
    createdAt: '۲۸ مرداد',
    messages: [
      {
        id: 'msg-3-1',
        role: 'user',
        content: 'پیش‌فاکتور پارچه‌های زمستانه از ایتالیا رسید؟',
        timestamp: '11:15'
      },
      {
        id: 'msg-3-2',
        role: 'assistant',
        content: `بله، پیش‌فاکتور کارخانه بیلا (Biella Mills) به مبلغ ۱۳,۳۷۰ یورو برای ۹۵ متر پارچه (سوپر ۱۵۰ سرمه‌ای، سوپر ۱۸۰ راهدار و کشمیر مغولستانی) ثبت شده است. پرداخت به‌صورت خالص ۳۰ روزه از طریق حواله به حساب یونی‌کردیت میلان خواهد بود.`,
        source: 'Hermes Workspace',
        timestamp: '11:16'
      }
    ]
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'employees' | 'documents' | 'system'>('chat');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isLoadingChat, setIsLoadingChat] = useState(false);

  // Multi-session chat history
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem('markova_chat_sessions');
      return saved ? JSON.parse(saved) : initialChatSessions;
    } catch {
      return initialChatSessions;
    }
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(sessions[0]?.id || 'session-1');

  // Save sessions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('markova_chat_sessions', JSON.stringify(sessions));
    } catch (e) {
      console.warn('Could not save sessions to localStorage', e);
    }
  }, [sessions]);

  const currentSession = sessions.find(s => s.id === activeSessionId) || sessions[0] || {
    id: 'default',
    title: 'گفتگوی عمومی',
    createdAt: 'اکنون',
    messages: []
  };

  // Fetch initial backend data
  const fetchData = async () => {
    try {
      const [empRes, docRes] = await Promise.all([
        fetch('/api/employees'),
        fetch('/api/documents')
      ]);

      if (empRes.ok) {
        const emps = await empRes.json();
        setEmployees(emps);
      }
      if (docRes.ok) {
        const docs = await docRes.json();
        setDocuments(docs);
      }
    } catch (err) {
      console.error('Data fetch error:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Send Chat Message
  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: String(Date.now()),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Update active session with user message and generate title if new
    setSessions(prevSessions =>
      prevSessions.map(sess => {
        if (sess.id === activeSessionId) {
          const updatedMessages = [...sess.messages, userMsg];
          const newTitle = sess.messages.length === 0 ? text.substring(0, 35) + '...' : sess.title;
          return {
            ...sess,
            title: newTitle,
            titleFa: newTitle,
            messages: updatedMessages
          };
        }
        return sess;
      })
    );

    setIsLoadingChat(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });

      if (res.ok) {
        const data = await res.json();
        const aiMsg: ChatMessage = {
          id: String(Date.now() + 1),
          role: 'assistant',
          content: data.reply,
          source: data.source || 'Hermes Workspace Memory',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setSessions(prevSessions =>
          prevSessions.map(sess => {
            if (sess.id === activeSessionId) {
              return {
                ...sess,
                messages: [...sess.messages, aiMsg]
              };
            }
            return sess;
          })
        );
      } else {
        throw new Error('Chat API error');
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: String(Date.now() + 1),
        role: 'assistant',
        content: `⚠️ پاسخ مستقیم دریافت نشد. هوش محلی Hermes روی سیستم فعال است.`,
        source: 'Hermes Local Engine',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setSessions(prevSessions =>
        prevSessions.map(sess => {
          if (sess.id === activeSessionId) {
            return {
              ...sess,
              messages: [...sess.messages, errorMsg]
            };
          }
          return sess;
        })
      );
    } finally {
      setIsLoadingChat(false);
    }
  };

  // Create New Chat Session
  const handleNewChat = () => {
    const newSessionId = `session-${Date.now()}`;
    const newSession: ChatSession = {
      id: newSessionId,
      title: 'گفتگوی جدید (New Consultation)',
      titleFa: 'گفتگوی جدید',
      createdAt: 'اکنون',
      messages: [
        {
          id: String(Date.now()),
          role: 'assistant',
          content: 'درود، جناب چنگیزی. موضوع گفتگوی جدید را بفرمایید تا بررسی کنیم.',
          source: 'Hermes Workspace',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]
    };

    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSessionId);
  };

  // Delete Chat Session
  const handleDeleteSession = (sessionId: string) => {
    setSessions(prev => {
      const filtered = prev.filter(s => s.id !== sessionId);
      if (filtered.length === 0) {
        const fallback: ChatSession = {
          id: `session-${Date.now()}`,
          title: 'گفتگوی اصلی',
          createdAt: 'اکنون',
          messages: []
        };
        setActiveSessionId(fallback.id);
        return [fallback];
      }
      if (sessionId === activeSessionId) {
        setActiveSessionId(filtered[0].id);
      }
      return filtered;
    });
  };

  // Clear current active chat messages
  const handleClearCurrentChat = () => {
    setSessions(prev =>
      prev.map(sess => (sess.id === activeSessionId ? { ...sess, messages: [] } : sess))
    );
  };

  // Add Fact to Staff Memory
  const handleAddFact = async (empId: number, factText: string, category: string = 'performance') => {
    try {
      const res = await fetch('/api/facts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: empId, factText, category })
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error('Add fact error:', err);
    }
  };

  // Delete Fact
  const handleDeleteFact = async (factId: number) => {
    try {
      const res = await fetch(`/api/facts/${factId}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error('Delete fact error:', err);
    }
  };

  // Generate 8-Point Structured Summary
  const handleGenerateSummary = async (empId: number) => {
    setIsGeneratingSummary(true);
    try {
      const res = await fetch('/api/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: empId })
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error('Generate summary error:', err);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  // Upload Document
  const handleUploadDocument = async (doc: {
    filename: string;
    fileType: string;
    fileSize: number;
    employeeId: number | null;
    topic: string;
    extractedText: string;
  }) => {
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doc)
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error('Upload document error:', err);
    }
  };

  // Delete Document
  const handleDeleteDocument = async (docId: number) => {
    try {
      const res = await fetch(`/api/documents/${docId}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error('Delete document error:', err);
    }
  };

  // Ask Document
  const handleAskDocument = async (docId: number, query: string) => {
    const res = await fetch('/api/ask-document', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentId: docId, query })
    });
    if (res.ok) {
      return await res.json();
    }
    return { answer: 'خطا در تحلیل سند.', source: 'Error' };
  };

  // Run Specialized Business Structure Analysis
  const handleRunBusinessAudit = async () => {
    const res = await fetch('/api/business-audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (res.ok) {
      return await res.json();
    }
    return {
      analysis: 'تحلیل ساختاری تولید نشد.',
      model: 'Error',
      syncedToHermes: false
    };
  };

  return (
    <div className="relative min-h-screen bg-[#0c0c0e] text-stone-100 flex flex-col font-sans selection:bg-amber-700 selection:text-white overflow-x-hidden">
      {/* Subtle Ambient Background Watermark of MARKOVA Logo */}
      <MarkovaWatermarkBackground />

      {/* Top Navigation Bar with Thin-Border Brand Identity */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Tab Views */}
      <main className="flex-1 relative z-10">
        {activeTab === 'chat' && (
          <ExecutiveChat
            currentSession={currentSession}
            sessions={sessions}
            onSelectSession={(id) => setActiveSessionId(id)}
            onNewChat={handleNewChat}
            onDeleteSession={handleDeleteSession}
            onSendMessage={handleSendMessage}
            onClearCurrentChat={handleClearCurrentChat}
            isLoading={isLoadingChat}
          />
        )}

        {activeTab === 'employees' && (
          <PersonnelIntelligence
            employees={employees}
            onAddFact={handleAddFact}
            onDeleteFact={handleDeleteFact}
            onGenerateSummary={handleGenerateSummary}
            isGeneratingSummary={isGeneratingSummary}
          />
        )}

        {activeTab === 'documents' && (
          <DocumentIntelligence
            documents={documents}
            onUploadDocument={handleUploadDocument}
            onDeleteDocument={handleDeleteDocument}
            onAskDocument={handleAskDocument}
            onRunBusinessAudit={handleRunBusinessAudit}
          />
        )}

        {activeTab === 'system' && <SystemHub />}
      </main>
    </div>
  );
}
