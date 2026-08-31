import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Copy,
  Check,
  Apple,
  Monitor,
  Activity,
  Server,
  Key,
  Layers,
  Code2,
  FileCode,
  Sparkles,
  ExternalLink,
  ChevronRight,
  SlidersHorizontal,
  Compass,
  AlertCircle,
  Cpu,
  RefreshCw,
  Zap,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Shield,
  Eye,
  EyeOff,
  Image as ImageIcon,
  MessageSquare
} from 'lucide-react';
import { ProviderDiagnostic, ReservedEngineRouting, ApiKeysPayload } from '../types';

interface EndpointSpec {
  method: 'GET' | 'POST' | 'DELETE';
  path: string;
  category: 'Intelligence & LLM' | 'Visual & Creative' | 'Personnel & CRM' | 'Data & Ledgers';
  summary: string;
  requestExample?: string;
  responseExample: string;
  futureNotes?: string;
}

export const SystemHub: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'routing' | 'apis' | 'telemetry' | 'future_guide' | 'scripts'>('routing');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [selectedEndpoint, setSelectedEndpoint] = useState<number>(0);
  const [selectedScriptFile, setSelectedScriptFile] = useState<string>('app.py');

  // Reserved Routing State
  const [routingConfig, setRoutingConfig] = useState<ReservedEngineRouting>({
    text: {
      primaryProvider: 'gapgpt',
      primaryModel: 'gapgpt-qwen-3.8',
      fallback1Provider: 'gemini',
      fallback1Model: 'gemini-2.0-flash',
      fallback2Provider: 'groq',
      fallback2Model: 'llama-3.3-70b-versatile'
    },
    fastImage: {
      primaryProvider: 'gapgpt',
      primaryModel: 'gapgpt/z-image',
      fallbackProvider: 'gemini',
      fallbackModel: 'imagen-3.0-generate-002'
    },
    qualityImage: {
      primaryProvider: 'gapgpt',
      primaryModel: 'gpt-image-2',
      fallbackProvider: 'fal',
      fallbackModel: 'fal-ai/flux/dev'
    }
  });

  // Providers List & Diagnostics
  const [providers, setProviders] = useState<ProviderDiagnostic[]>([
    {
      id: 'gapgpt',
      name: 'GapGPT Unified Gateway',
      category: 'cloud_llm',
      isConfigured: true,
      isReachable: null,
      requiresKey: true,
      models: [
        { id: 'gapgpt-qwen-3.8', name: 'GapGPT Qwen 3.8 (Primary Text)', type: 'text' },
        { id: 'gapgpt/z-image', name: 'GapGPT Z-Image (Fast Postures)', type: 'fast_image' },
        { id: 'gpt-image-2', name: 'GPT Image 2 (HD Lookbooks & Fitting)', type: 'quality_image' }
      ]
    },
    {
      id: 'gemini',
      name: 'Google Gemini Studio',
      category: 'cloud_llm',
      isConfigured: true,
      isReachable: null,
      requiresKey: true,
      models: [
        { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash (Fast Reasoning)', type: 'text' },
        { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro (Deep Analysis)', type: 'text' },
        { id: 'imagen-3.0-generate-002', name: 'Imagen 3 (Visual Fashion)', type: 'fast_image' }
      ]
    },
    {
      id: 'groq',
      name: 'Groq Ultra-Fast LPU',
      category: 'cloud_llm',
      isConfigured: false,
      isReachable: null,
      requiresKey: true,
      models: [
        { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile (Free Tier)', type: 'text' }
      ]
    },
    {
      id: 'openrouter',
      name: 'OpenRouter Aggregator',
      category: 'cloud_llm',
      isConfigured: false,
      isReachable: null,
      requiresKey: true,
      models: [
        { id: 'qwen/qwen-2.5-72b-instruct', name: 'Qwen 2.5 72B Instruct', type: 'text' }
      ]
    },
    {
      id: 'mlx',
      name: 'Apple Silicon MLX Server (Local)',
      category: 'local_engine',
      isConfigured: true,
      isReachable: null,
      requiresKey: false,
      models: [
        { id: 'mlx-community/DeepSeek-R1-Distill-Qwen-8B-4bit', name: 'DeepSeek R1 Distill Qwen 8B', type: 'text' }
      ]
    },
    {
      id: 'ollama',
      name: 'Local Ollama Engine',
      category: 'local_engine',
      isConfigured: true,
      isReachable: null,
      requiresKey: false,
      models: [
        { id: 'llama3.1:8b', name: 'Llama 3.1 8B (Local)', type: 'text' }
      ]
    },
    {
      id: 'fal',
      name: 'Fal.ai Visual Cloud',
      category: 'cloud_image',
      isConfigured: false,
      isReachable: null,
      requiresKey: true,
      models: [
        { id: 'fal-ai/flux/schnell', name: 'Flux.1 Schnell', type: 'fast_image' },
        { id: 'fal-ai/flux/dev', name: 'Flux.1 Dev', type: 'quality_image' }
      ]
    }
  ]);

  const [apiKeysInput, setApiKeysInput] = useState<ApiKeysPayload>({
    GAPGPT_API_KEY: '',
    GAPGPT_BASE_URL: '',
    GEMINI_API_KEY: '',
    GROQ_API_KEY: '',
    OPENROUTER_API_KEY: '',
    FAL_KEY: ''
  });
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [isPinging, setIsPinging] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Fetch initial config from server
  const fetchEngineConfig = async () => {
    try {
      const res = await fetch('/api/engine-config');
      if (res.ok) {
        const data = await res.json();
        if (data.routing) setRoutingConfig(data.routing);
        if (data.providers) setProviders(data.providers);
      }
    } catch (e) {
      console.warn('Failed to load engine config:', e);
    }
  };

  useEffect(() => {
    fetchEngineConfig();
  }, []);

  // Ping a single provider
  const pingProvider = async (providerId: string) => {
    setIsPinging(prev => ({ ...prev, [providerId]: true }));
    try {
      const res = await fetch('/api/engine-ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId })
      });
      const data = await res.json();
      setProviders(prev => prev.map(p => {
        if (p.id === providerId) {
          return {
            ...p,
            isReachable: data.success,
            latencyMs: data.latencyMs,
            statusMessage: data.message
          };
        }
        return p;
      }));
    } catch (e: any) {
      setProviders(prev => prev.map(p => {
        if (p.id === providerId) {
          return {
            ...p,
            isReachable: false,
            latencyMs: 0,
            statusMessage: e.message || 'Connection failed'
          };
        }
        return p;
      }));
    } finally {
      setIsPinging(prev => ({ ...prev, [providerId]: false }));
    }
  };

  // Ping all providers at once
  const pingAllProviders = async () => {
    for (const p of providers) {
      pingProvider(p.id);
    }
  };

  // Save updated routing and keys
  const handleSaveRoutingAndKeys = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    try {
      const filteredKeys: Record<string, string> = {};
      Object.entries(apiKeysInput).forEach(([k, v]) => {
        if (typeof v === 'string' && v.trim()) {
          filteredKeys[k] = v.trim();
        }
      });

      const res = await fetch('/api/engine-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          routing: routingConfig,
          keys: Object.keys(filteredKeys).length > 0 ? filteredKeys : undefined
        })
      });

      if (res.ok) {
        setSaveStatus('success');
        fetchEngineConfig();
        setTimeout(() => setSaveStatus(null), 3000);
      } else {
        setSaveStatus('error');
      }
    } catch {
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const [systemLogs] = useState<string[]>([
    '[SYSTEM] Booting MARKOVA AI runtime (NEXURA AI Lab)...',
    '[HERMES] Initializing Hermes workspace bridge at /markova_workspace/AGENTS.md',
    '[MEMORY] Loaded 5 employee facts and 1 8-point summary records from markova_data.db',
    '[SALES ENGINE] Cached 168 showroom transactions (38.12 Billion Tomans recorded)',
    '[RESERVED ROUTING] GapGPT Unified Key active for gapgpt-qwen-3.8, gapgpt/z-image, and gpt-image-2',
    '[RESERVED ROUTING] Fallback Matrix: Gemini 2.0 Flash -> Groq Llama 3.3 -> OpenRouter',
    '[IMAGERY] Creative engine online for Stance Generations & Virtual Bespoke fitting',
    '[SERVER] Ready and listening on port 3000'
  ]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Comprehensive Catalog of API Endpoints in MARKOVA AI
  const endpoints: EndpointSpec[] = [
    {
      method: 'POST',
      path: '/api/chat',
      category: 'Intelligence & LLM',
      summary: 'Executive conversation endpoint with Nima Changizi, incorporating brand memory and personnel context.',
      requestExample: JSON.stringify({
        message: 'وضعیت سفارشات سفارشی دیپلماتیک و انگیزه سعید را بررسی کن',
        history: [{ role: 'user', content: '...' }]
      }, null, 2),
      responseExample: JSON.stringify({
        response: 'سلام نیما جان! گزارش عملکرد سعید در سفارش دیپلماتیک فوق‌العاده است...',
        source: 'Hermes Executive Advisor'
      }, null, 2),
      futureNotes: 'If adding streaming or voice TTS in the future, modify the response structure in server.ts and ExecutiveChat.tsx.'
    },
    {
      method: 'POST',
      path: '/api/generate-posture',
      category: 'Visual & Creative',
      summary: 'Generates creative fashion poses and lighting angles using the Gemini Vision / Imagen model.',
      requestExample: JSON.stringify({
        prompt: 'High-end editorial fashion photography of a model in bespoke navy double-breasted suit...',
        category: 'Navy Double-Breasted Suit',
        aspectRatio: '3:4'
      }, null, 2),
      responseExample: JSON.stringify({
        success: true,
        imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800...',
        prompt: '...'
      }, null, 2),
      futureNotes: 'In the future, you can swap the image generator URL in server.ts (e.g. Midjourney API, Flux.1, or Stable Diffusion server).'
    },
    {
      method: 'POST',
      path: '/api/transfer-posture-style',
      category: 'Visual & Creative',
      summary: 'Transfers a chosen suit wardrobe style onto an uploaded base model pose/lighting reference.',
      requestExample: JSON.stringify({
        styleId: 'style-1',
        styleName: 'Navy Double-Breasted Suit',
        fabricDetails: 'Super 160s Navy Wool',
        basePostureImage: 'data:image/jpeg;base64,...'
      }, null, 2),
      responseExample: JSON.stringify({
        success: true,
        imageUrl: 'https://images.unsplash.com/...',
        extractedVibe: 'Model stance and lighting preserved.',
        finalPrompt: 'Editorial photograph of the model wearing MARKOVA Navy Double-Breasted Suit...'
      }, null, 2),
      futureNotes: 'To adjust prompt blending weights or swap with an inpainting controlnet API, customize server.ts at /api/transfer-posture-style.'
    },
    {
      method: 'POST',
      path: '/api/generate-lookbook-batch',
      category: 'Visual & Creative',
      summary: 'Generates standardized 4-angle lookbook photo sets (Front, Seated, Walking, Detail) for website catalogs.',
      requestExample: JSON.stringify({
        styleId: 'style-1',
        styleName: 'Navy Double-Breasted Suit',
        fabricDetails: 'Super 160s Navy Wool',
        anchors: ['anchor-1', 'anchor-2', 'anchor-3', 'anchor-4']
      }, null, 2),
      responseExample: JSON.stringify({
        styleName: 'Navy Double-Breasted Suit',
        images: [
          { anchorId: 'anchor-1', title: 'Front Standing View', url: 'https://...' },
          { anchorId: 'anchor-2', title: 'Seated Lounge View', url: 'https://...' },
          { anchorId: 'anchor-3', title: 'Walking Motion', url: 'https://...' },
          { anchorId: 'anchor-4', title: 'Fabric & Lapel Detail', url: 'https://...' }
        ]
      }, null, 2),
      futureNotes: 'To add new angles (e.g., Back Vent View, Cuff Stitching), update standardLookbookAnchors in VisualStudio.tsx.'
    },
    {
      method: 'GET',
      path: '/api/styles',
      category: 'Visual & Creative',
      summary: 'Retrieves all saved bespoke fashion styles from the wardrobe catalog.',
      responseExample: JSON.stringify([
        {
          id: 'style-1',
          name: 'Navy Double-Breasted Suit',
          sampleImages: ['https://...'],
          createdAt: '2026-08-30'
        }
      ], null, 2),
      futureNotes: 'To integrate persistent database storage, connect this endpoint to PostgreSQL or SQLite.'
    },
    {
      method: 'POST',
      path: '/api/styles',
      category: 'Visual & Creative',
      summary: 'Creates a new bespoke style in the wardrobe with uploaded photo samples.',
      requestExample: JSON.stringify({
        name: 'Burgundy Velvet Smoking Jacket',
        sampleImages: ['data:image/png;base64,...']
      }, null, 2),
      responseExample: JSON.stringify({
        success: true,
        style: { id: 'style-17250529', name: 'Burgundy Velvet Smoking Jacket' }
      }, null, 2)
    },
    {
      method: 'GET',
      path: '/api/employees',
      category: 'Personnel & CRM',
      summary: 'Fetches the 4 key showroom team profiles (Saeid, Micheal, Mostafa, Asadi) and their facts.',
      responseExample: JSON.stringify([
        {
          id: 'saeid',
          name: 'Saeid',
          role: 'VIP Bespoke & Master Tailor Liaison',
          facts: [{ id: 'fact-1', factText: 'Managed diplomatic VIP bespoke order...', createdAt: '1403-06' }]
        }
      ], null, 2)
    },
    {
      method: 'POST',
      path: '/api/employees/:id/facts',
      category: 'Personnel & CRM',
      summary: 'Appends a new performance fact or journal entry to an employee dossier.',
      requestExample: JSON.stringify({
        factText: 'Closed high-ticket Italian silk suit order for Ambassador.'
      }, null, 2),
      responseExample: JSON.stringify({
        success: true,
        fact: { id: 'fact-172505', factText: '...', createdAt: '1403-06-09' }
      }, null, 2)
    },
    {
      method: 'POST',
      path: '/api/employees/:id/summary',
      category: 'Personnel & CRM',
      summary: 'Triggers AI to generate the standardized 8-part executive personnel audit report.',
      responseExample: JSON.stringify({
        summaryText: 'نقش (Role): مدیریت مشتریان خاص و سفارشات دست‌دوز دیپلماتیک...'
      }, null, 2)
    },
    {
      method: 'GET',
      path: '/api/documents',
      category: 'Data & Ledgers',
      summary: 'Fetches financial ledgers and sales analytics summary (38.12B Tomans across 168 orders).',
      responseExample: JSON.stringify({
        totalSales: '38.12 Billion Tomans',
        totalOrders: 168,
        timeframe: '88 Days'
      }, null, 2)
    }
  ];

  // Map of future-proofing guides
  const futureModificationGuides = [
    {
      area: '1. Adding New Bespoke Styles or Modifying Style Properties',
      description: 'When the atelier expands into new categories (e.g. Overcoats, Tuxedos, Cashmere Knits) or needs more fields:',
      fileLocations: [
        { file: '/src/types.ts', what: 'Update `FashionStyle` interface if you add new metadata fields.' },
        { file: '/server.ts', what: 'Add initial preset items to `fashionStylesData` array (around line 115).' },
        { file: '/src/components/VisualStudio.tsx', what: 'Edit form inputs and the gallery cards.' }
      ],
      tip: 'Styles can be added dynamically from the Visual Studio UI without modifying code, but code presets provide defaults on server reboot.'
    },
    {
      area: '2. Customizing AI Persona & Coaching Logic',
      description: 'To tweak how MARKOVA AI talks to Nima, addresses the team, or coaches employees:',
      fileLocations: [
        { file: '/server.ts', what: 'Edit `BRAND_SYSTEM_PROMPT` (lines ~215-240) to add new coaching instructions, financial benchmarks, or brand tones.' },
        { file: '/src/components/ExecutiveChat.tsx', what: 'Edit `getPersianGreeting()` for custom time-of-day greetings.' }
      ],
      tip: 'The prompt includes strict guidelines to maintain a warm, friendly, brotherly tone with «نیما جان» and concise executive answers.'
    },
    {
      area: '3. Adjusting Visual Studio Photo Layouts & Display',
      description: 'To customize image aspect ratios, lookbook grid density, or photography presets:',
      fileLocations: [
        { file: '/src/components/VisualStudio.tsx', what: 'Modify `editorialPresets` for new prompt templates, or `standardLookbookAnchors` for catalog camera angles.' },
        { file: '/src/components/VisualStudio.tsx', what: 'Adjust grid classes (`grid-cols-2`, `grid-cols-4`) to change thumbnail sizes.' }
      ],
      tip: 'Use the new "Full Wardrobe Library" viewer modal to browse hundreds of high-res style cards with instant category search.'
    },
    {
      area: '4. Updating Personnel & Financial Figures',
      description: 'When financial quarterly benchmarks change or new staff join MARKOVA:',
      fileLocations: [
        { file: '/server.ts', what: 'Modify `employeesData` (line ~25) and `salesLedgerRecords`.' },
        { file: '/src/components/DocumentIntelligence.tsx', what: 'Update financial cards and sales charts.' }
      ],
      tip: 'You can also add live facts directly in the Personnel tab, which the AI automatically reads into its memory context.'
    },
    {
      area: '5. Changing Custom Brand Logo & Watermark',
      description: 'To replace the monogram or modify watermark visibility:',
      fileLocations: [
        { file: 'Click on the Sliders icon in the top-right navbar', what: 'Upload custom PNG/SVG logo and adjust watermark opacity in real-time.' },
        { file: '/src/components/MarkovaLogo.tsx', what: 'Modify default SVGs if you wish to alter the base vector monogram.' }
      ],
      tip: 'Settings persist in browser `localStorage` and automatically sync to the server.'
    }
  ];

  const filesContent: Record<string, { label: string; path: string; desc: string; code: string }> = {
    'app.py': {
      label: 'app.py',
      path: '/app.py',
      desc: 'Streamlit entry point: Clean Executive chat directly conversing with CEO Nima Changizi.',
      code: `import streamlit as st
import config
from hermes_bridge import HermesBridge
from litellm_router import route_chat

st.set_page_config(page_title="MARKOVA AI — by NEXURA AI Lab", page_icon="👔", layout="centered")

st.markdown("### Good morning, Nima.")
# Executive Chat directly connects to Hermes + LiteLLM fallback
...`
    },
    'hermes_bridge.py': {
      label: 'hermes_bridge.py',
      path: '/hermes_bridge.py',
      desc: 'Subprocess wrapper for Hermes Agent CLI with isolated markova_workspace and fact memorization.',
      code: `import os, subprocess
from pathlib import Path
from config import WORKSPACE_DIR

class HermesBridge:
    def __init__(self, workspace_path: Path = WORKSPACE_DIR):
        self.workspace_path = Path(workspace_path).resolve()
        self.hermes_bin = self._find_hermes()

    def chat(self, user_message: str):
        # hermes -z "<msg>" --in markova_workspace
        result = subprocess.run(
            [self.hermes_bin, "-z", user_message, "--in", str(self.workspace_path)],
            capture_output=True,
            text=True
        )
        return result.stdout.strip()`
    },
    'litellm_router.py': {
      label: 'litellm_router.py',
      path: '/litellm_router.py',
      desc: 'Specialized model routing: Business Analytics model vs Chat model with multi-tier fallback.',
      code: `import os
from config import GEMINI_API_KEY, OPENROUTER_API_KEY, GROQ_API_KEY, OLLAMA_MODEL_NAME

# Specialized API definitions for different tasks
MODELS_BY_TASK = {
    "business_audit": "gemini/gemini-2.0-flash",
    "executive_chat": "gemini/gemini-2.0-flash",
    "fast_summary": "gemini/gemini-2.0-flash"
}

FALLBACK_PROVIDERS = [
    {"name": "Google Gemini 2.0 Flash", "model": "gemini/gemini-2.0-flash", "api_key_env": "GEMINI_API_KEY"},
    {"name": "OpenRouter (Qwen 2.5 72B)", "model": "openrouter/qwen/qwen-2.5-72b-instruct", "api_key_env": "OPENROUTER_API_KEY"},
    {"name": "Groq (Llama 3.1 70B)", "model": "groq/llama-3.1-70b-versatile", "api_key_env": "GROQ_API_KEY"},
    {"name": "Local Ollama Engine", "model": f"ollama/{OLLAMA_MODEL_NAME}"}
]`
    },
    'database.py': {
      label: 'database.py',
      path: '/database.py',
      desc: 'Minimal SQLite storage for employee facts, 8-part summaries, and business sales ledger.',
      code: `import sqlite3
from config import DB_PATH

def init_db():
    conn = sqlite3.connect(str(DB_PATH), check_same_thread=False)
    # creates employees, facts, summaries, documents tables
    ...`
    },
    'config.py': {
      label: 'config.py',
      path: '/config.py',
      desc: 'System settings: CEO Name (Nima Changizi), local engines, and workspace directory.',
      code: `import os
from pathlib import Path

APP_NAME = "MARKOVA AI"
CREATED_BY = "NEXURA AI Lab"
CEO_NAME = "Nima Changizi"
ACTIVE_ENGINE = os.getenv("ACTIVE_ENGINE", "ollama").lower() # "mlx" or "ollama"`
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-100 tracking-tight">
              System & APIs
            </h1>
            <span className="text-xs font-mono uppercase tracking-widest text-amber-500 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded-full font-semibold">
              Architecture & Endpoints
            </span>
          </div>
          <p className="text-sm text-stone-400 mt-1">
            مشخصات کامل APIها، پایگاه داده، مانیتورینگ سیستم و راهنمای اعمال تغییرات آینده
          </p>
        </div>

        {/* Sub Navigation */}
        <div className="flex items-center gap-1.5 bg-stone-900/90 p-1 rounded-xl border border-stone-800/90 shadow-sm overflow-x-auto text-xs">
          <button
            onClick={() => setActiveSubTab('routing')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeSubTab === 'routing'
                ? 'bg-amber-600 text-stone-950 font-bold shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Reserved Engine & APIs</span>
          </button>

          <button
            onClick={() => setActiveSubTab('apis')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeSubTab === 'apis'
                ? 'bg-amber-600 text-stone-950 font-bold shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>API Catalog</span>
          </button>

          <button
            onClick={() => setActiveSubTab('future_guide')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeSubTab === 'future_guide'
                ? 'bg-amber-600 text-stone-950 font-bold shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Future Changes Guide</span>
          </button>

          <button
            onClick={() => setActiveSubTab('telemetry')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeSubTab === 'telemetry'
                ? 'bg-amber-600 text-stone-950 font-bold shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Live Telemetry</span>
          </button>

          <button
            onClick={() => setActiveSubTab('scripts')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeSubTab === 'scripts'
                ? 'bg-amber-600 text-stone-950 font-bold shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Offline Python/CLI</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          SUB-TAB 0: RESERVED ROUTING MATRIX & LIVE API AVAILABILITY
      ========================================================================= */}
      {activeSubTab === 'routing' && (
        <div className="space-y-8">
          
          {/* Top Info Banner */}
          <div className="bg-gradient-to-r from-stone-900 via-stone-900/90 to-amber-950/30 border border-amber-800/40 rounded-2xl p-5 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500" />
                  <h2 className="text-lg font-bold text-stone-100">
                    Live API Diagnostics & Reserved Engine Routing
                  </h2>
                </div>
                <p className="text-xs text-stone-300 max-w-3xl leading-relaxed">
                  این پنل وضعیت اتصال لحظه‌ای تمام APIها را بررسی کرده و امکان مسیریابی رزرو شده (<span className="text-amber-400 font-mono">Reserved Fallback Cascade</span>) برای متن، تصاویر سریع و تصاویر باکیفیت آتلیه را فراهم می‌کند. کلید یکتای <strong>GapGPT</strong> همزمان مدل‌های <span className="text-amber-400 font-mono">gapgpt-qwen-3.8</span> (متن)، <span className="text-amber-400 font-mono">gapgpt/z-image</span> (تصاویر سریع) و <span className="text-amber-400 font-mono">gpt-image-2</span> (لوک‌بوک‌های HD) را پوشش می‌دهد.
                </p>
              </div>

              <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0">
                <button
                  onClick={pingAllProviders}
                  className="flex items-center gap-2 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700/80 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                  <span>تست اتصال همه (Ping All)</span>
                </button>

                <button
                  onClick={handleSaveRoutingAndKeys}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-stone-950 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
                >
                  {isSaving ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : saveStatus === 'success' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-stone-950" />
                  ) : (
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                  )}
                  <span>{saveStatus === 'success' ? 'ذخیره شد!' : 'ذخیره تنظیمات روتینگ'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 1: LIVE API PROVIDER AVAILABILITY CARDS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-stone-300 flex items-center gap-2">
                <Server className="w-4 h-4 text-amber-500" />
                <span>وضعیت در دسترس بودن ارائه‌دهندگان (Provider Availability)</span>
              </h3>
              <span className="text-xs text-stone-500 font-mono">
                {providers.filter(p => p.isConfigured).length} of {providers.length} Configured
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {providers.map(p => {
                const isPingRunning = isPinging[p.id] || false;
                const isGapGPT = p.id === 'gapgpt';
                return (
                  <div
                    key={p.id}
                    className={`bg-stone-900/80 border rounded-2xl p-4.5 flex flex-col justify-between transition-all relative overflow-hidden ${
                      isGapGPT 
                        ? 'border-amber-700/60 bg-gradient-to-b from-stone-900 to-amber-950/20 shadow-lg' 
                        : p.isConfigured 
                        ? 'border-stone-800/90' 
                        : 'border-stone-800/40 opacity-75'
                    }`}
                  >
                    {isGapGPT && (
                      <div className="absolute -top-1 -right-1 bg-amber-500/20 border-b border-l border-amber-600/40 px-2 py-0.5 rounded-bl-lg text-[10px] font-bold text-amber-400 font-mono">
                        Unified 1-Key Multi-Model
                      </div>
                    )}

                    <div className="space-y-3">
                      {/* Provider Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-sm font-bold text-stone-100 flex items-center gap-1.5">
                            {p.name}
                          </h4>
                          <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider">
                            {p.category === 'cloud_llm' ? 'Cloud LLM / Vision' : p.category === 'cloud_image' ? 'Visual Cloud' : 'Local Machine (Offline)'}
                          </span>
                        </div>

                        {/* Status Pill */}
                        <div className="shrink-0">
                          {p.isReachable === true ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                              {p.latencyMs ? `${p.latencyMs}ms` : 'Connected'}
                            </span>
                          ) : p.isReachable === false ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-rose-950/60 text-rose-400 border border-rose-800/60">
                              <XCircle className="w-3 h-3" />
                              Offline
                            </span>
                          ) : p.isConfigured ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-amber-950/40 text-amber-400 border border-amber-800/40">
                              Configured
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-stone-800 text-stone-500 border border-stone-700/60">
                              No Key
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Key status */}
                      <div className="text-xs font-mono text-stone-400 bg-stone-950/60 px-2.5 py-1.5 rounded-lg border border-stone-800/80 flex items-center justify-between">
                        <span className="text-stone-500 text-[11px]">Key Status:</span>
                        <span className="text-stone-300 font-medium truncate max-w-[150px]">
                          {p.keyMasked ? p.keyMasked : p.requiresKey ? (p.isConfigured ? 'Active in env' : 'Missing in .env') : 'Local (No key needed)'}
                        </span>
                      </div>

                      {/* Supported Models Badges */}
                      <div className="space-y-1.5">
                        <div className="text-[11px] text-stone-400 font-medium">مدل‌های قابل استفاده:</div>
                        <div className="flex flex-wrap gap-1">
                          {p.models.map(m => (
                            <span
                              key={m.id}
                              className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${
                                m.type === 'quality_image'
                                  ? 'bg-amber-950/40 text-amber-300 border-amber-800/50'
                                  : m.type === 'fast_image'
                                  ? 'bg-indigo-950/40 text-indigo-300 border-indigo-800/50'
                                  : 'bg-stone-800/90 text-stone-300 border-stone-700/60'
                              }`}
                            >
                              {m.id}
                            </span>
                          ))}
                        </div>
                      </div>

                      {p.statusMessage && (
                        <p className={`text-[11px] font-mono leading-tight ${p.isReachable ? 'text-emerald-400/90' : 'text-rose-400/90'}`}>
                          {p.statusMessage}
                        </p>
                      )}
                    </div>

                    {/* Ping Button */}
                    <div className="pt-4 mt-2 border-t border-stone-800/80">
                      <button
                        onClick={() => pingProvider(p.id)}
                        disabled={isPingRunning}
                        className="w-full flex items-center justify-center gap-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 py-1.5 px-3 rounded-xl text-xs font-medium transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isPingRunning ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin text-amber-400" />
                            <span>در حال تست...</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-3 h-3 text-amber-400" />
                            <span>تست اتصال لحظه‌ای (Ping)</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: RESERVED ROUTING MATRIX (INTERACTIVE ENGINE CONFIG) */}
          <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-6 space-y-6 shadow-xl">
            <div className="border-b border-stone-800 pb-4">
              <h3 className="text-base font-bold text-stone-100 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-amber-500" />
                <span>ماتریس مسیریابی رزرو شده هوش مصنوعی (Reserved Fallback Routing Matrix)</span>
              </h3>
              <p className="text-xs text-stone-400 mt-1">
                برای هر سناریوی سیستم (گفتگوی متنی مدیریت، ساخت سریع فیگور، و آتلیه لوک‌بوک باکیفیت)، مدل اصلی و مدل‌های رزرو (Fallback) را انتخاب کنید. در صورت قطعی یا پایان اعتبار مدل اول، سیستم بدون توقف به مدل بعدی منتقل می‌شود.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Card 1: Text & Reasoning */}
              <div className="bg-stone-950/80 border border-stone-800/90 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2 border-b border-stone-800/80 pb-3">
                  <MessageSquare className="w-4 h-4 text-amber-400" />
                  <div>
                    <h4 className="text-sm font-bold text-stone-100">1. موتور متنی و تحلیلی</h4>
                    <span className="text-[10px] text-stone-400">گفتگوی مدیرعامل و تحلیل 8 بندی پرسنل</span>
                  </div>
                </div>

                {/* Primary */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-amber-400 flex items-center justify-between">
                    <span>مدل اصلی (Primary):</span>
                    <span className="text-[10px] font-mono text-stone-500">Tier 1</span>
                  </label>
                  <select
                    value={`${routingConfig.text.primaryProvider}:::${routingConfig.text.primaryModel}`}
                    onChange={(e) => {
                      const [provider, model] = e.target.value.split(':::');
                      setRoutingConfig(prev => ({
                        ...prev,
                        text: { ...prev.text, primaryProvider: provider, primaryModel: model }
                      }));
                    }}
                    className="w-full bg-stone-900 border border-stone-700 text-stone-200 text-xs rounded-lg p-2.5 font-mono focus:border-amber-500 focus:outline-none"
                  >
                    <option value="gapgpt:::gapgpt-qwen-3.8">GapGPT — gapgpt-qwen-3.8 (پیش‌فرض سریع)</option>
                    <option value="gapgpt:::gpt-4o">GapGPT — gpt-4o (استدلال سنگین)</option>
                    <option value="gapgpt:::claude-3-5-sonnet">GapGPT — Claude 3.5 Sonnet</option>
                    <option value="gemini:::gemini-2.0-flash">Google Gemini — gemini-2.0-flash</option>
                    <option value="gemini:::gemini-1.5-pro">Google Gemini — gemini-1.5-pro</option>
                    <option value="groq:::llama-3.3-70b-versatile">Groq LPU — Llama 3.3 70B (رایگان سریع)</option>
                    <option value="openrouter:::qwen/qwen-2.5-72b-instruct">OpenRouter — Qwen 2.5 72B</option>
                    <option value="mlx:::mlx-community/DeepSeek-R1-Distill-Qwen-8B-4bit">Local MLX — DeepSeek R1 8B (آفلاین مک)</option>
                    <option value="ollama:::llama3.1:8b">Local Ollama — Llama 3.1 8B (آفلاین)</option>
                  </select>
                </div>

                {/* Fallback 1 */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-stone-300 flex items-center justify-between">
                    <span>رزرو اول (Fallback 1):</span>
                    <span className="text-[10px] font-mono text-stone-500">Tier 2</span>
                  </label>
                  <select
                    value={`${routingConfig.text.fallback1Provider}:::${routingConfig.text.fallback1Model}`}
                    onChange={(e) => {
                      const [provider, model] = e.target.value.split(':::');
                      setRoutingConfig(prev => ({
                        ...prev,
                        text: { ...prev.text, fallback1Provider: provider, fallback1Model: model }
                      }));
                    }}
                    className="w-full bg-stone-900 border border-stone-800 text-stone-300 text-xs rounded-lg p-2.5 font-mono focus:border-amber-500 focus:outline-none"
                  >
                    <option value="gemini:::gemini-2.0-flash">Google Gemini — gemini-2.0-flash</option>
                    <option value="groq:::llama-3.3-70b-versatile">Groq LPU — Llama 3.3 70B</option>
                    <option value="gapgpt:::gapgpt-qwen-3.8">GapGPT — gapgpt-qwen-3.8</option>
                    <option value="openrouter:::qwen/qwen-2.5-72b-instruct">OpenRouter — Qwen 2.5 72B</option>
                    <option value="ollama:::llama3.1:8b">Local Ollama — Llama 3.1 8B</option>
                  </select>
                </div>

                {/* Fallback 2 */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-stone-400 flex items-center justify-between">
                    <span>رزرو دوم (Fallback 2):</span>
                    <span className="text-[10px] font-mono text-stone-500">Tier 3</span>
                  </label>
                  <select
                    value={`${routingConfig.text.fallback2Provider}:::${routingConfig.text.fallback2Model}`}
                    onChange={(e) => {
                      const [provider, model] = e.target.value.split(':::');
                      setRoutingConfig(prev => ({
                        ...prev,
                        text: { ...prev.text, fallback2Provider: provider, fallback2Model: model }
                      }));
                    }}
                    className="w-full bg-stone-900 border border-stone-800 text-stone-400 text-xs rounded-lg p-2.5 font-mono focus:border-amber-500 focus:outline-none"
                  >
                    <option value="groq:::llama-3.3-70b-versatile">Groq LPU — Llama 3.3 70B (رایگان)</option>
                    <option value="openrouter:::qwen/qwen-2.5-72b-instruct">OpenRouter — Qwen 2.5 72B</option>
                    <option value="ollama:::llama3.1:8b">Local Ollama — Llama 3.1 8B (آفلاین)</option>
                    <option value="gemini:::gemini-1.5-pro">Google Gemini — gemini-1.5-pro</option>
                  </select>
                </div>

                <div className="text-[11px] text-stone-400 bg-stone-900/90 p-2 rounded-lg border border-stone-800 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>ترتیب شکست خودکار: GapGPT &rarr; Gemini &rarr; Groq</span>
                </div>
              </div>

              {/* Card 2: Fast Image Creation */}
              <div className="bg-stone-950/80 border border-stone-800/90 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2 border-b border-stone-800/80 pb-3">
                  <Zap className="w-4 h-4 text-indigo-400" />
                  <div>
                    <h4 className="text-sm font-bold text-stone-100">2. تصویرسازی سریع (Fast Images)</h4>
                    <span className="text-[10px] text-stone-400">تولید ژست و زاویه‌های فیگوراتیو استودیو</span>
                  </div>
                </div>

                {/* Primary Fast Image */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-indigo-400 flex items-center justify-between">
                    <span>مدل اصلی تصویر سریع:</span>
                    <span className="text-[10px] font-mono text-stone-500">Tier 1</span>
                  </label>
                  <select
                    value={`${routingConfig.fastImage.primaryProvider}:::${routingConfig.fastImage.primaryModel}`}
                    onChange={(e) => {
                      const [provider, model] = e.target.value.split(':::');
                      setRoutingConfig(prev => ({
                        ...prev,
                        fastImage: { ...prev.fastImage, primaryProvider: provider, primaryModel: model }
                      }));
                    }}
                    className="w-full bg-stone-900 border border-stone-700 text-stone-200 text-xs rounded-lg p-2.5 font-mono focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="gapgpt:::gapgpt/z-image">GapGPT — gapgpt/z-image (سرعت فوق‌العاده)</option>
                    <option value="gemini:::imagen-3.0-generate-002">Google Gemini — Imagen 3 Studio</option>
                    <option value="fal:::fal-ai/flux/schnell">Fal.ai — Flux.1 Schnell (Fast)</option>
                  </select>
                </div>

                {/* Fallback Fast Image */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-stone-300 flex items-center justify-between">
                    <span>رزرو تصویر سریع (Fallback):</span>
                    <span className="text-[10px] font-mono text-stone-500">Tier 2</span>
                  </label>
                  <select
                    value={`${routingConfig.fastImage.fallbackProvider}:::${routingConfig.fastImage.fallbackModel}`}
                    onChange={(e) => {
                      const [provider, model] = e.target.value.split(':::');
                      setRoutingConfig(prev => ({
                        ...prev,
                        fastImage: { ...prev.fastImage, fallbackProvider: provider, fallbackModel: model }
                      }));
                    }}
                    className="w-full bg-stone-900 border border-stone-800 text-stone-300 text-xs rounded-lg p-2.5 font-mono focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="gemini:::imagen-3.0-generate-002">Google Gemini — Imagen 3 Studio</option>
                    <option value="fal:::fal-ai/flux/schnell">Fal.ai — Flux.1 Schnell</option>
                    <option value="gapgpt:::gapgpt/z-image">GapGPT — gapgpt/z-image</option>
                  </select>
                </div>

                <div className="text-[11px] text-stone-400 bg-stone-900/90 p-2 rounded-lg border border-stone-800 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>تولید فیگور با نسبت ابعاد ۳:۴ مدلسازی لوکس</span>
                </div>
              </div>

              {/* Card 3: Quality Image Engine */}
              <div className="bg-stone-950/80 border border-stone-800/90 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2 border-b border-stone-800/80 pb-3">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <div>
                    <h4 className="text-sm font-bold text-stone-100">3. تصویرسازی باکیفیت آتلیه (Quality HD)</h4>
                    <span className="text-[10px] text-stone-400">لوک‌بوک‌های سایت و پرو مجازی کت‌وشلوار</span>
                  </div>
                </div>

                {/* Primary Quality Image */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-amber-400 flex items-center justify-between">
                    <span>مدل اصلی تصویر HD:</span>
                    <span className="text-[10px] font-mono text-stone-500">Tier 1</span>
                  </label>
                  <select
                    value={`${routingConfig.qualityImage.primaryProvider}:::${routingConfig.qualityImage.primaryModel}`}
                    onChange={(e) => {
                      const [provider, model] = e.target.value.split(':::');
                      setRoutingConfig(prev => ({
                        ...prev,
                        qualityImage: { ...prev.qualityImage, primaryProvider: provider, primaryModel: model }
                      }));
                    }}
                    className="w-full bg-stone-900 border border-stone-700 text-stone-200 text-xs rounded-lg p-2.5 font-mono focus:border-amber-500 focus:outline-none"
                  >
                    <option value="gapgpt:::gpt-image-2">GapGPT — gpt-image-2 (کیفیت مستر لوک‌بوک)</option>
                    <option value="fal:::fal-ai/flux/dev">Fal.ai — Flux.1 Dev (کیفیت ادیتوریال)</option>
                    <option value="gemini:::imagen-3.0-generate-002">Google Gemini — Imagen 3 HD</option>
                  </select>
                </div>

                {/* Fallback Quality Image */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-stone-300 flex items-center justify-between">
                    <span>رزرو تصویر HD (Fallback):</span>
                    <span className="text-[10px] font-mono text-stone-500">Tier 2</span>
                  </label>
                  <select
                    value={`${routingConfig.qualityImage.fallbackProvider}:::${routingConfig.qualityImage.fallbackModel}`}
                    onChange={(e) => {
                      const [provider, model] = e.target.value.split(':::');
                      setRoutingConfig(prev => ({
                        ...prev,
                        qualityImage: { ...prev.qualityImage, fallbackProvider: provider, fallbackModel: model }
                      }));
                    }}
                    className="w-full bg-stone-900 border border-stone-800 text-stone-300 text-xs rounded-lg p-2.5 font-mono focus:border-amber-500 focus:outline-none"
                  >
                    <option value="fal:::fal-ai/flux/dev">Fal.ai — Flux.1 Dev</option>
                    <option value="gemini:::imagen-3.0-generate-002">Google Gemini — Imagen 3</option>
                    <option value="gapgpt:::gpt-image-2">GapGPT — gpt-image-2</option>
                  </select>
                </div>

                <div className="text-[11px] text-stone-400 bg-stone-900/90 p-2 rounded-lg border border-stone-800 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>انتقال بافت پارچه ایتالیایی با تفکیک Vision Prompt</span>
                </div>
              </div>

            </div>
          </div>

          {/* SECTION 3: API KEYS & CREDENTIALS VAULT */}
          <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-6 space-y-5 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-stone-100 flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-500" />
                  <span>مدیریت کلیدهای API و آدرس‌های سرور (Credentials & Gateways)</span>
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  کلیدهای جدید را در فیلدهای زیر وارد کرده و دکمه ذخیره را بزنید تا بلافاصله در سرور فعال شوند.
                </p>
              </div>

              <span className="text-[11px] font-mono text-amber-400 bg-amber-950/40 border border-amber-800/40 px-2.5 py-1 rounded-lg">
                Runtime Hot-Reload Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* GapGPT Key */}
              <div className="bg-stone-950/70 border border-amber-900/30 rounded-xl p-3.5 space-y-2">
                <label className="text-xs font-semibold text-amber-400 flex items-center justify-between">
                  <span>GAPGPT_API_KEY (یک کلید برای همه مدل‌ها)</span>
                  <button
                    onClick={() => setShowKeys(prev => ({ ...prev, gapgpt: !prev.gapgpt }))}
                    className="text-stone-400 hover:text-stone-200 cursor-pointer"
                  >
                    {showKeys.gapgpt ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </label>
                <input
                  type={showKeys.gapgpt ? 'text' : 'password'}
                  value={apiKeysInput.GAPGPT_API_KEY || ''}
                  onChange={(e) => setApiKeysInput(prev => ({ ...prev, GAPGPT_API_KEY: e.target.value }))}
                  placeholder="sk-gap-..."
                  className="w-full bg-stone-900 border border-stone-800 text-stone-200 text-xs rounded-lg p-2 font-mono focus:border-amber-500 focus:outline-none"
                />
                <p className="text-[10px] text-stone-500">پوشش gapgpt-qwen-3.8، gapgpt/z-image و gpt-image-2</p>
              </div>

              {/* GapGPT Base URL */}
              <div className="bg-stone-950/70 border border-stone-800/80 rounded-xl p-3.5 space-y-2">
                <label className="text-xs font-semibold text-stone-300">
                  GAPGPT_BASE_URL (آدرس Gateway)
                </label>
                <input
                  type="text"
                  value={apiKeysInput.GAPGPT_BASE_URL || ''}
                  onChange={(e) => setApiKeysInput(prev => ({ ...prev, GAPGPT_BASE_URL: e.target.value }))}
                  placeholder="https://api.gapgpt.com/v1"
                  className="w-full bg-stone-900 border border-stone-800 text-stone-200 text-xs rounded-lg p-2 font-mono focus:border-amber-500 focus:outline-none"
                />
                <p className="text-[10px] text-stone-500">پیش‌فرض: https://api.gapgpt.com/v1</p>
              </div>

              {/* Gemini Key */}
              <div className="bg-stone-950/70 border border-stone-800/80 rounded-xl p-3.5 space-y-2">
                <label className="text-xs font-semibold text-stone-300 flex items-center justify-between">
                  <span>GEMINI_API_KEY (Google AI Studio)</span>
                  <button
                    onClick={() => setShowKeys(prev => ({ ...prev, gemini: !prev.gemini }))}
                    className="text-stone-400 hover:text-stone-200 cursor-pointer"
                  >
                    {showKeys.gemini ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </label>
                <input
                  type={showKeys.gemini ? 'text' : 'password'}
                  value={apiKeysInput.GEMINI_API_KEY || ''}
                  onChange={(e) => setApiKeysInput(prev => ({ ...prev, GEMINI_API_KEY: e.target.value }))}
                  placeholder="AIzaSy..."
                  className="w-full bg-stone-900 border border-stone-800 text-stone-200 text-xs rounded-lg p-2 font-mono focus:border-amber-500 focus:outline-none"
                />
                <p className="text-[10px] text-stone-500">رزرو برای Gemini 2.0 Flash و Imagen 3</p>
              </div>

              {/* Groq Key */}
              <div className="bg-stone-950/70 border border-stone-800/80 rounded-xl p-3.5 space-y-2">
                <label className="text-xs font-semibold text-stone-300 flex items-center justify-between">
                  <span>GROQ_API_KEY (Groq LPU Free Tier)</span>
                  <button
                    onClick={() => setShowKeys(prev => ({ ...prev, groq: !prev.groq }))}
                    className="text-stone-400 hover:text-stone-200 cursor-pointer"
                  >
                    {showKeys.groq ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </label>
                <input
                  type={showKeys.groq ? 'text' : 'password'}
                  value={apiKeysInput.GROQ_API_KEY || ''}
                  onChange={(e) => setApiKeysInput(prev => ({ ...prev, GROQ_API_KEY: e.target.value }))}
                  placeholder="gsk_..."
                  className="w-full bg-stone-900 border border-stone-800 text-stone-200 text-xs rounded-lg p-2 font-mono focus:border-amber-500 focus:outline-none"
                />
                <p className="text-[10px] text-stone-500">Llama 3.3 70B با سرعت 400 توکن در ثانیه</p>
              </div>

              {/* OpenRouter Key */}
              <div className="bg-stone-950/70 border border-stone-800/80 rounded-xl p-3.5 space-y-2">
                <label className="text-xs font-semibold text-stone-300 flex items-center justify-between">
                  <span>OPENROUTER_API_KEY</span>
                  <button
                    onClick={() => setShowKeys(prev => ({ ...prev, openrouter: !prev.openrouter }))}
                    className="text-stone-400 hover:text-stone-200 cursor-pointer"
                  >
                    {showKeys.openrouter ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </label>
                <input
                  type={showKeys.openrouter ? 'text' : 'password'}
                  value={apiKeysInput.OPENROUTER_API_KEY || ''}
                  onChange={(e) => setApiKeysInput(prev => ({ ...prev, OPENROUTER_API_KEY: e.target.value }))}
                  placeholder="sk-or-..."
                  className="w-full bg-stone-900 border border-stone-800 text-stone-200 text-xs rounded-lg p-2 font-mono focus:border-amber-500 focus:outline-none"
                />
                <p className="text-[10px] text-stone-500">پوشش Qwen 2.5 72B و مدل‌های Open-Source</p>
              </div>

              {/* Fal.ai Key */}
              <div className="bg-stone-950/70 border border-stone-800/80 rounded-xl p-3.5 space-y-2">
                <label className="text-xs font-semibold text-stone-300 flex items-center justify-between">
                  <span>FAL_KEY (Visual Cloud)</span>
                  <button
                    onClick={() => setShowKeys(prev => ({ ...prev, fal: !prev.fal }))}
                    className="text-stone-400 hover:text-stone-200 cursor-pointer"
                  >
                    {showKeys.fal ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </label>
                <input
                  type={showKeys.fal ? 'text' : 'password'}
                  value={apiKeysInput.FAL_KEY || ''}
                  onChange={(e) => setApiKeysInput(prev => ({ ...prev, FAL_KEY: e.target.value }))}
                  placeholder="fal_key_..."
                  className="w-full bg-stone-900 border border-stone-800 text-stone-200 text-xs rounded-lg p-2 font-mono focus:border-amber-500 focus:outline-none"
                />
                <p className="text-[10px] text-stone-500">رزرو برای Flux.1 Dev و Flux Schnell</p>
              </div>

            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleSaveRoutingAndKeys}
                disabled={isSaving}
                className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold px-5 py-2.5 rounded-xl text-xs transition-all cursor-pointer shadow-md active:scale-95 disabled:opacity-50"
              >
                {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>اعمال کلیدها و ذخیره در سیستم (Save Keys & Routing)</span>
              </button>
            </div>
          </div>

        </div>
      )}


      {/* =========================================================================
          SUB-TAB 1: COMPLETE API CATALOG & INTERACTIVE TESTER
      ========================================================================= */}
      {activeSubTab === 'apis' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Endpoints Sidebar List */}
            <div className="lg:col-span-5 space-y-2">
              <div className="flex items-center justify-between px-2 pb-1 text-xs text-stone-400 font-medium">
                <span>Available Endpoints ({endpoints.length})</span>
                <span className="font-mono text-[11px] text-amber-500">Node/Express Server</span>
              </div>

              <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
                {endpoints.map((ep, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedEndpoint(idx)}
                    className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                      selectedEndpoint === idx
                        ? 'bg-stone-900 border-amber-500 text-stone-100 shadow-md ring-1 ring-amber-500/20'
                        : 'bg-stone-950/60 border-stone-800/80 text-stone-400 hover:border-stone-700 hover:text-stone-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        ep.method === 'GET'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                          : ep.method === 'POST'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800/50'
                          : 'bg-red-950 text-red-400 border border-red-800/50'
                      }`}>
                        {ep.method}
                      </span>
                      <span className="text-[10px] text-stone-500 font-mono truncate">
                        {ep.category}
                      </span>
                    </div>

                    <span className="font-mono text-xs font-semibold text-stone-200 truncate">
                      {ep.path}
                    </span>

                    <p className="text-[11px] text-stone-400 line-clamp-1">
                      {ep.summary}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Endpoint Detailed Card */}
            <div className="lg:col-span-7 space-y-4">
              {endpoints[selectedEndpoint] && (
                <div className="bg-stone-900/80 border border-stone-800/90 rounded-2xl p-5 sm:p-6 space-y-5 shadow-xl">
                  {/* Title & Route */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800 pb-4">
                    <div className="flex items-center gap-2.5">
                      <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-md ${
                        endpoints[selectedEndpoint].method === 'GET'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                          : endpoints[selectedEndpoint].method === 'POST'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                          : 'bg-red-950 text-red-300 border border-red-800/60'
                      }`}>
                        {endpoints[selectedEndpoint].method}
                      </span>
                      <span className="text-sm sm:text-base font-mono font-bold text-stone-100">
                        {endpoints[selectedEndpoint].path}
                      </span>
                    </div>

                    <button
                      onClick={() => copyToClipboard(endpoints[selectedEndpoint].path, 'path')}
                      className="text-xs text-stone-400 hover:text-stone-200 flex items-center gap-1 font-mono cursor-pointer"
                    >
                      {copiedText === 'path' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy Path</span>
                    </button>
                  </div>

                  <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-sans">
                    {endpoints[selectedEndpoint].summary}
                  </p>

                  {/* Request Payload Example (if any) */}
                  {endpoints[selectedEndpoint].requestExample && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-mono text-stone-400">
                        <span>Request Body (JSON):</span>
                        <button
                          onClick={() => copyToClipboard(endpoints[selectedEndpoint].requestExample!, 'req')}
                          className="hover:text-stone-200 flex items-center gap-1 cursor-pointer"
                        >
                          {copiedText === 'req' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>Copy</span>
                        </button>
                      </div>
                      <pre className="bg-stone-950 border border-stone-800 rounded-xl p-3.5 font-mono text-xs text-amber-300/90 overflow-x-auto">
                        <code>{endpoints[selectedEndpoint].requestExample}</code>
                      </pre>
                    </div>
                  )}

                  {/* Response Payload Example */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono text-stone-400">
                      <span>Sample Response (JSON):</span>
                      <button
                        onClick={() => copyToClipboard(endpoints[selectedEndpoint].responseExample, 'res')}
                        className="hover:text-stone-200 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedText === 'res' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>Copy</span>
                      </button>
                    </div>
                    <pre className="bg-stone-950 border border-stone-800 rounded-xl p-3.5 font-mono text-xs text-stone-300 overflow-x-auto max-h-48">
                      <code>{endpoints[selectedEndpoint].responseExample}</code>
                    </pre>
                  </div>

                  {/* Future Dev Notes */}
                  {endpoints[selectedEndpoint].futureNotes && (
                    <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/40 text-xs text-amber-300 flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <b className="font-semibold">Future Customization Note: </b>
                        <span>{endpoints[selectedEndpoint].futureNotes}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-TAB 2: FUTURE CHANGES & ARCHITECTURE GUIDE
      ========================================================================= */}
      {activeSubTab === 'future_guide' && (
        <div className="space-y-6">
          <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-stone-100 font-bold text-sm">
              <Compass className="w-4 h-4 text-amber-400" />
              <span>MARKOVA Atelier Customization Roadmap</span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              This guide provides exact locations and instructions for modifying the codebase when you introduce new fashion collections, change AI coaching prompts, adjust visual studio galleries, or connect external services.
            </p>
          </div>

          <div className="space-y-4">
            {futureModificationGuides.map((guide, idx) => (
              <div
                key={idx}
                className="bg-stone-900/70 border border-stone-800 rounded-2xl p-5 space-y-3.5 shadow-sm"
              >
                <div className="flex items-center gap-2 font-bold text-sm text-stone-200">
                  <span className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-xs font-mono">
                    {idx + 1}
                  </span>
                  <span>{guide.area}</span>
                </div>

                <p className="text-xs text-stone-400">
                  {guide.description}
                </p>

                {/* File Locations */}
                <div className="space-y-2 bg-stone-950/80 border border-stone-800 rounded-xl p-3.5">
                  {guide.fileLocations.map((loc, i) => (
                    <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                      <span className="font-mono text-amber-400 font-semibold bg-stone-900 px-2 py-0.5 rounded border border-stone-800 inline-block w-fit">
                        {loc.file}
                      </span>
                      <span className="text-stone-300 text-[11px] sm:text-xs">
                        {loc.what}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Pro-Tip */}
                <div className="text-[11px] text-stone-400 flex items-center gap-1.5 pt-1">
                  <span className="font-bold text-amber-500 uppercase tracking-wider text-[10px]">Tip:</span>
                  <span>{guide.tip}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-TAB 3: LIVE TELEMETRY & SERVER LOGS
      ========================================================================= */}
      {activeSubTab === 'telemetry' && (
        <div className="space-y-6">
          <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800/80 pb-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-stone-300">
                <Activity className="w-4 h-4 text-amber-400" />
                <span>Live System & Hermes Bridge Telemetry</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-mono text-emerald-400">All Engines Nominal</span>
              </div>
            </div>

            <div className="bg-stone-950 border border-stone-800/90 rounded-xl p-4 font-mono text-xs text-stone-300 space-y-2 max-h-72 overflow-y-auto">
              {systemLogs.map((log, index) => (
                <div key={index} className="leading-relaxed flex items-start gap-2">
                  <span className="text-stone-600 select-none">{String(index + 1).padStart(2, '0')}</span>
                  <span className={log.includes('HERMES') ? 'text-amber-400' : log.includes('ROUTER') ? 'text-sky-400' : log.includes('SALES') ? 'text-emerald-400' : 'text-stone-300'}>
                    {log}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick specs grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-1">
              <span className="text-stone-500 text-xs font-mono">Primary Model</span>
              <p className="text-sm font-bold text-stone-200">Gemini 2.0 Flash</p>
            </div>
            <div className="p-4 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-1">
              <span className="text-stone-500 text-xs font-mono">Local Engine Support</span>
              <p className="text-sm font-bold text-stone-200">Ollama (Llama 3.1) / MLX</p>
            </div>
            <div className="p-4 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-1">
              <span className="text-stone-500 text-xs font-mono">Host Environment</span>
              <p className="text-sm font-bold text-stone-200">Port 3000 (Express + Vite)</p>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-TAB 4: OFFLINE PYTHON SCRIPTS & LAUNCHERS
      ========================================================================= */}
      {activeSubTab === 'scripts' && (
        <div className="space-y-6">
          {/* Cross-Platform Execution Guides */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Windows */}
            <div className="bg-stone-900/60 border border-stone-800/80 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-stone-100 font-bold text-xs">
                <Monitor className="w-4 h-4 text-amber-500" />
                <span>Windows 1-Click Launcher (`Run_MARKOVA.bat`)</span>
              </div>
              <p className="text-xs text-stone-400">
                Displays the NEXURA AI Lab banner, verifies Node.js & dependencies, and boots the full-stack React 19 + Express engine at <code className="text-amber-400">http://localhost:3000</code>.
              </p>
              <div className="bg-stone-950 border border-stone-800 rounded-xl p-3 font-mono text-xs text-stone-300 space-y-1">
                <div className="text-stone-500">:: 1. Launch in Windows Command Prompt</div>
                <div>Run_MARKOVA.bat</div>
                <div className="text-stone-500">:: Or launch with npm</div>
                <div>npm run dev</div>
              </div>
            </div>

            {/* macOS */}
            <div className="bg-stone-900/60 border border-stone-800/80 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-stone-100 font-bold text-xs">
                <Apple className="w-4 h-4 text-amber-500" />
                <span>macOS / Linux Launcher (`Run_MARKOVA.command`)</span>
              </div>
              <p className="text-xs text-stone-400">
                Executes the full-stack suite with NEXURA ASCII art and auto-opens <code className="text-amber-400">http://localhost:3000</code> in your browser.
              </p>
              <div className="bg-stone-950 border border-stone-800 rounded-xl p-3 font-mono text-xs text-stone-300 space-y-1">
                <div className="text-stone-500"># 1. Run in Terminal</div>
                <div>chmod +x Run_MARKOVA.command</div>
                <div>./Run_MARKOVA.command</div>
              </div>
            </div>
          </div>

          {/* Code Viewer */}
          <div className="bg-stone-900/60 border border-stone-800/80 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800/80 pb-3">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {Object.keys(filesContent).map(fname => (
                  <button
                    key={fname}
                    onClick={() => setSelectedScriptFile(fname)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                      selectedScriptFile === fname
                        ? 'bg-amber-600 text-stone-950 font-bold'
                        : 'bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800'
                    }`}
                  >
                    {fname}
                  </button>
                ))}
              </div>

              <button
                onClick={() => copyToClipboard(filesContent[selectedScriptFile].code, selectedScriptFile)}
                className="flex items-center gap-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer self-start sm:self-auto"
              >
                {copiedText === selectedScriptFile ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Script</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-stone-400">
              {filesContent[selectedScriptFile].desc}
            </p>

            <pre className="bg-stone-950 border border-stone-800/90 rounded-xl p-4 font-mono text-xs text-stone-300 overflow-x-auto max-h-72">
              <code>{filesContent[selectedScriptFile].code}</code>
            </pre>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-xs text-stone-500 py-2 border-t border-stone-800/60 font-mono">
        MARKOVA AI Executive Architecture &bull; Engineered by NEXURA AI Lab
      </div>
    </div>
  );
};
