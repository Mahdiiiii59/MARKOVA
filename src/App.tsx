import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ExecutiveChat } from './components/ExecutiveChat';
import { VisualStudio } from './components/VisualStudio';
import { PersonnelIntelligence } from './components/PersonnelIntelligence';
import { DocumentIntelligence } from './components/DocumentIntelligence';
import { SystemHub } from './components/SystemHub';
import { MarkovaWatermarkBackground, LogoSettingsModal } from './components/MarkovaLogo';
import { Employee, ChatMessage, ChatSession, DocumentRecord, FashionStyle, LogoSettings } from './types';

// Initial default sessions
const initialChatSessions: ChatSession[] = [];

export default function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'studio' | 'employees' | 'documents' | 'system'>('chat');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [styles, setStyles] = useState<FashionStyle[]>([]);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isLoadingChat, setIsLoadingChat] = useState(false);

  // Logo & Watermark Settings
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [logoSettings, setLogoSettings] = useState<LogoSettings>(() => {
    try {
      const saved = localStorage.getItem('markova_logo_settings');
      return saved ? JSON.parse(saved) : { customLogoUrl: null, watermarkOpacity: 0.025, watermarkEnabled: true };
    } catch {
      return { customLogoUrl: null, watermarkOpacity: 0.025, watermarkEnabled: true };
    }
  });

  // Multi-session chat history
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem('markova_chat_sessions');
      return saved ? JSON.parse(saved) : initialChatSessions;
    } catch {
      return initialChatSessions;
    }
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(sessions[0]?.id || '');

  // Save sessions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('markova_chat_sessions', JSON.stringify(sessions));
    } catch (e) {
      console.warn('Could not save sessions to localStorage', e);
    }
  }, [sessions]);

  // Save logo settings
  const handleSaveLogoSettings = (newSettings: LogoSettings) => {
    setLogoSettings(newSettings);
    try {
      localStorage.setItem('markova_logo_settings', JSON.stringify(newSettings));
      fetch('/api/logo-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      }).catch(e => console.warn(e));
    } catch (e) {
      console.warn(e);
    }
  };

  const currentSession = sessions.find(s => s.id === activeSessionId) || sessions[0] || {
    id: 'default',
    title: 'گفتگوی عمومی',
    createdAt: 'اکنون',
    messages: []
  };

  // Fetch initial backend data
  const fetchData = async () => {
    try {
      const [empRes, docRes, styleRes, logoRes] = await Promise.all([
        fetch('/api/employees'),
        fetch('/api/documents'),
        fetch('/api/styles'),
        fetch('/api/logo-settings')
      ]);

      if (empRes.ok) {
        const emps = await empRes.json();
        setEmployees(emps);
      }
      if (docRes.ok) {
        const docs = await docRes.json();
        setDocuments(docs);
      }
      if (styleRes.ok) {
        const stls = await styleRes.json();
        setStyles(stls);
      }
      if (logoRes.ok) {
        const lSettings = await logoRes.json();
        if (lSettings && lSettings.customLogoUrl) {
          setLogoSettings(lSettings);
        }
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
          source: data.source || 'Hermes Executive Advisor',
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
        content: `سلام نیما جان، پاسخ از حافظه امن سارا دریافت شد. من همیشه در کنارتان برای تصمیم‌گیری‌های هوشمند شو‌روم مارکووا آماده‌ام.`,
        source: 'سارا (مشاور هوشمند مارکووا)',
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
      title: 'گفتگوی جدید با سارا',
      titleFa: 'گفتگوی جدید با سارا',
      createdAt: 'اکنون',
      messages: [
        {
          id: String(Date.now()),
          role: 'assistant',
          content: 'سلام نیما جان! در خدمتتون هستم. موضوع گفتگوی جدید رو بفرمایید تا با هم پیش ببریم.',
          source: 'سارا (مشاور هوشمند مارکووا)',
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

  // Add Style
  const handleAddStyle = async (newStyle: Omit<FashionStyle, 'id' | 'createdAt'>) => {
    try {
      const res = await fetch('/api/styles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStyle)
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error('Error adding style:', err);
    }
  };

  // Delete Style
  const handleDeleteStyle = async (styleId: string) => {
    try {
      const res = await fetch(`/api/styles/${styleId}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error('Error deleting style:', err);
    }
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
      {/* Ambient Background Watermark of MARKOVA Logo (Supports custom override) */}
      <MarkovaWatermarkBackground
        customLogoUrl={logoSettings.customLogoUrl}
        opacity={logoSettings.watermarkOpacity}
        enabled={logoSettings.watermarkEnabled}
      />

      {/* Top Navigation Bar with Pure English Menu */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        customLogoUrl={logoSettings.customLogoUrl}
        onOpenLogoSettings={() => setIsLogoModalOpen(true)}
      />

      {/* Manual Logo Customizer Modal */}
      <LogoSettingsModal
        isOpen={isLogoModalOpen}
        onClose={() => setIsLogoModalOpen(false)}
        settings={logoSettings}
        onSaveSettings={handleSaveLogoSettings}
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

        {activeTab === 'studio' && (
          <VisualStudio
            styles={styles}
            onAddStyle={handleAddStyle}
            onDeleteStyle={handleDeleteStyle}
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
