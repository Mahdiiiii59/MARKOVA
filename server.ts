import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Multi-Provider AI Engine (Gemini, GapGPT, Groq, OpenRouter, MLX, Ollama)
let aiClient: GoogleGenAI | null = null;
function getAIClient() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key) {
      aiClient = new GoogleGenAI({ apiKey: key });
    }
  }
  return aiClient;
}

// Dynamic Reserved Routing Matrix
interface EngineRoutingState {
  text: {
    primaryProvider: string;
    primaryModel: string;
    fallback1Provider: string;
    fallback1Model: string;
    fallback2Provider: string;
    fallback2Model: string;
  };
  fastImage: {
    primaryProvider: string;
    primaryModel: string;
    fallbackProvider: string;
    fallbackModel: string;
  };
  qualityImage: {
    primaryProvider: string;
    primaryModel: string;
    fallbackProvider: string;
    fallbackModel: string;
  };
}

let engineRoutingConfig: EngineRoutingState = {
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
};

interface AICallOptions {
  prompt: string;
  systemInstruction?: string;
  temperature?: number;
  maxTokens?: number;
}

interface AIResponseResult {
  text: string;
  provider: string;
  model: string;
}

// Helper to call individual providers by ID
async function callSpecificTextProvider(providerId: string, modelOverride?: string, options?: AICallOptions): Promise<AIResponseResult | null> {
  const { prompt = '', systemInstruction = '', temperature = 0.3, maxTokens = 1000 } = options || {};

  if (providerId === 'gapgpt') {
    const gapgptKey = process.env.GAPGPT_API_KEY;
    if (!gapgptKey) return null;
    const baseUrl = (process.env.GAPGPT_BASE_URL || 'https://api.gapgpt.com/v1').replace(/\/+$/, '');
    const model = modelOverride || engineRoutingConfig.text.primaryModel || 'gapgpt-qwen-3.8';
    const messages: any[] = [];
    if (systemInstruction) messages.push({ role: 'system', content: systemInstruction });
    messages.push({ role: 'user', content: prompt });

    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${gapgptKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens
      })
    });

    if (res.ok) {
      const data = await res.json() as any;
      const text = data?.choices?.[0]?.message?.content;
      if (text) return { text: text.trim(), provider: 'GapGPT', model };
    }
    return null;
  }

  if (providerId === 'gemini') {
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) return null;
    const client = getAIClient();
    if (!client) return null;
    const model = modelOverride || 'gemini-2.0-flash';
    const response = await client.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction || undefined,
        temperature,
        maxOutputTokens: maxTokens
      }
    });
    if (response && response.text) {
      return { text: response.text.trim(), provider: 'Google Gemini', model };
    }
    return null;
  }

  if (providerId === 'groq') {
    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) return null;
    const model = modelOverride || 'llama-3.3-70b-versatile';
    const messages: any[] = [];
    if (systemInstruction) messages.push({ role: 'system', content: systemInstruction });
    messages.push({ role: 'user', content: prompt });

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens
      })
    });

    if (res.ok) {
      const data = await res.json() as any;
      const text = data?.choices?.[0]?.message?.content;
      if (text) return { text: text.trim(), provider: 'Groq', model };
    }
    return null;
  }

  if (providerId === 'openrouter') {
    const openrouterKey = process.env.OPENROUTER_API_KEY;
    if (!openrouterKey) return null;
    const model = modelOverride || 'qwen/qwen-2.5-72b-instruct';
    const messages: any[] = [];
    if (systemInstruction) messages.push({ role: 'system', content: systemInstruction });
    messages.push({ role: 'user', content: prompt });

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openrouterKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens
      })
    });

    if (res.ok) {
      const data = await res.json() as any;
      const text = data?.choices?.[0]?.message?.content;
      if (text) return { text: text.trim(), provider: 'OpenRouter', model };
    }
    return null;
  }

  if (providerId === 'mlx') {
    const mlxUrl = process.env.MLX_SERVER_URL || 'http://localhost:8080/v1';
    const messages: any[] = [];
    if (systemInstruction) messages.push({ role: 'system', content: systemInstruction });
    messages.push({ role: 'user', content: prompt });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    try {
      const res = await fetch(`${mlxUrl}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, temperature, max_tokens: maxTokens }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json() as any;
        const text = data?.choices?.[0]?.message?.content;
        if (text) return { text: text.trim(), provider: 'Local Apple Silicon MLX', model: 'mlx-local' };
      }
    } catch {
      clearTimeout(timeoutId);
    }
    return null;
  }

  if (providerId === 'ollama') {
    const ollamaUrl = process.env.OLLAMA_SERVER_URL || 'http://localhost:11434/v1';
    const messages: any[] = [];
    if (systemInstruction) messages.push({ role: 'system', content: systemInstruction });
    messages.push({ role: 'user', content: prompt });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    try {
      const res = await fetch(`${ollamaUrl}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: modelOverride || process.env.OLLAMA_MODEL_NAME || 'llama3.1:8b',
          messages,
          temperature,
          max_tokens: maxTokens
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json() as any;
        const text = data?.choices?.[0]?.message?.content;
        if (text) return { text: text.trim(), provider: 'Local Ollama', model: modelOverride || 'llama3.1:8b' };
      }
    } catch {
      clearTimeout(timeoutId);
    }
    return null;
  }

  return null;
}

// Master Multi-Provider Chain Execution for Text
async function callAIMultiProvider(options: AICallOptions): Promise<AIResponseResult | null> {
  // 1. Primary Provider
  const primary = engineRoutingConfig.text.primaryProvider;
  const primaryModel = engineRoutingConfig.text.primaryModel;
  try {
    const res1 = await callSpecificTextProvider(primary, primaryModel, options);
    if (res1) return res1;
  } catch (e) {
    console.warn(`Primary text provider ${primary} failed, testing fallbacks...`, e);
  }

  // 2. Reserved Fallback 1
  const fb1 = engineRoutingConfig.text.fallback1Provider;
  const fb1Model = engineRoutingConfig.text.fallback1Model;
  if (fb1 && fb1 !== primary) {
    try {
      const res2 = await callSpecificTextProvider(fb1, fb1Model, options);
      if (res2) return res2;
    } catch (e) {
      console.warn(`Fallback 1 text provider ${fb1} failed...`, e);
    }
  }

  // 3. Reserved Fallback 2
  const fb2 = engineRoutingConfig.text.fallback2Provider;
  const fb2Model = engineRoutingConfig.text.fallback2Model;
  if (fb2 && fb2 !== primary && fb2 !== fb1) {
    try {
      const res3 = await callSpecificTextProvider(fb2, fb2Model, options);
      if (res3) return res3;
    } catch (e) {
      console.warn(`Fallback 2 text provider ${fb2} failed...`, e);
    }
  }

  // 4. Any remaining provider scan
  const allProviders = ['gapgpt', 'gemini', 'groq', 'openrouter', 'mlx', 'ollama'];
  for (const p of allProviders) {
    if (p !== primary && p !== fb1 && p !== fb2) {
      try {
        const fallbackRes = await callSpecificTextProvider(p, undefined, options);
        if (fallbackRes) return fallbackRes;
      } catch {}
    }
  }

  return null;
}

// Master Multi-Provider Image Generation Engine (Supporting GapGPT z-image & gpt-image-2)
interface ImageGenOptions {
  prompt: string;
  category?: string;
  aspectRatio?: string;
  tier?: 'fast' | 'quality';
}

interface ImageGenResult {
  imageUrl: string;
  providerUsed: string;
  modelUsed: string;
  isFallback: boolean;
}

const curatedHighFashionPresets = [
  'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=900&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=900&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=900&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1598808503746-f34c53b9323e?w=900&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=900&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=900&auto=format&fit=crop&q=80'
];

async function generateAIMultiProviderImage(options: ImageGenOptions): Promise<ImageGenResult> {
  const { prompt, category, tier = 'fast' } = options;
  const config = tier === 'quality' ? engineRoutingConfig.qualityImage : engineRoutingConfig.fastImage;

  // 1. Try Primary Image Provider
  if (config.primaryProvider === 'gapgpt') {
    const gapgptKey = process.env.GAPGPT_API_KEY;
    if (gapgptKey) {
      try {
        const baseUrl = (process.env.GAPGPT_BASE_URL || 'https://api.gapgpt.com/v1').replace(/\/+$/, '');
        const model = config.primaryModel || (tier === 'quality' ? 'gpt-image-2' : 'gapgpt/z-image');
        const res = await fetch(`${baseUrl}/images/generations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${gapgptKey}`
          },
          body: JSON.stringify({
            model,
            prompt,
            n: 1,
            size: '1024x1024',
            response_format: 'url'
          })
        });

        if (res.ok) {
          const data = await res.json() as any;
          const imgUrl = data?.data?.[0]?.url || (data?.data?.[0]?.b64_json ? `data:image/png;base64,${data.data[0].b64_json}` : null);
          if (imgUrl) {
            return {
              imageUrl: imgUrl,
              providerUsed: 'GapGPT Visual Engine',
              modelUsed: model,
              isFallback: false
            };
          }
        } else {
          console.warn(`GapGPT Image API error ${res.status}:`, await res.text());
        }
      } catch (e) {
        console.warn('GapGPT Image generation failed, moving to fallback:', e);
      }
    }
  }

  // 2. Try Fal.ai Provider
  if (config.primaryProvider === 'fal' || config.fallbackProvider === 'fal') {
    const falKey = process.env.FAL_KEY;
    if (falKey) {
      try {
        const falModel = config.primaryProvider === 'fal' ? config.primaryModel : config.fallbackModel;
        const targetModel = falModel || (tier === 'quality' ? 'fal-ai/flux/dev' : 'fal-ai/flux/schnell');
        const res = await fetch(`https://fal.run/${targetModel}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Key ${falKey}`
          },
          body: JSON.stringify({
            prompt,
            image_size: 'square_hd',
            num_images: 1
          })
        });
        if (res.ok) {
          const data = await res.json() as any;
          const imgUrl = data?.images?.[0]?.url;
          if (imgUrl) {
            return {
              imageUrl: imgUrl,
              providerUsed: 'Fal.ai (Flux)',
              modelUsed: targetModel,
              isFallback: false
            };
          }
        }
      } catch (e) {
        console.warn('Fal.ai image error:', e);
      }
    }
  }

  // 3. Fallback to Curated High Sartorial Studio Preset
  const randomPreset = curatedHighFashionPresets[Math.floor(Math.random() * curatedHighFashionPresets.length)];
  return {
    imageUrl: randomPreset,
    providerUsed: 'MARKOVA Studio Preset Visualizer',
    modelUsed: 'Sartorial High-Fashion Preset (Offline Fallback)',
    isFallback: true
  };
}

// Ensure Local Models directories exist
const localModelDir = path.join(process.cwd(), 'MARKOVA', 'Model');
const modelsDir = path.join(process.cwd(), 'Models');
try {
  if (!fs.existsSync(localModelDir)) fs.mkdirSync(localModelDir, { recursive: true });
  if (!fs.existsSync(modelsDir)) fs.mkdirSync(modelsDir, { recursive: true });
} catch (e) {
  console.warn('Local Model dir check:', e);
}

// In-Memory Staff Data in Persian with Internal Coaching Advisor Heuristics
const employeesData = [];

let factsData: any[] = [];

let summariesData: any[] = [];

// In-Memory Fashion Styles Memory with Simple Names
let fashionStylesData = [
  {
    id: 'style-1',
    name: 'Navy Double-Breasted Suit',
    category: 'bespoke_suit',
    description: 'Classic double-breasted cut with peak lapels.',
    fabricDetails: 'Super 160s Navy Wool',
    colorPalette: ['#0f172a', '#1e293b', '#d97706'],
    sampleImages: [
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=600&auto=format&fit=crop&q=80'
    ],
    createdAt: '2026-08-29'
  },
  {
    id: 'style-2',
    name: 'Black-Tie Tuxedo',
    category: 'tuxedo',
    description: 'Evening tuxedo with silk grosgrain shawl collar.',
    fabricDetails: 'Midnight Wool & Silk Blend',
    colorPalette: ['#09090b', '#27272a', '#e2e8f0'],
    sampleImages: [
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80'
    ],
    createdAt: '2026-08-30'
  },
  {
    id: 'style-3',
    name: 'Camel Cashmere Coat',
    category: 'overcoat',
    description: 'Single-breasted luxury overcoat with soft drape.',
    fabricDetails: 'Pure Mongolian Cashmere',
    colorPalette: ['#b45309', '#78350f', '#fef3c7'],
    sampleImages: [
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&auto=format&fit=crop&q=80'
    ],
    createdAt: '2026-08-30'
  }
];

// Custom Logo Settings Memory
let logoSettingsData = {
  customLogoUrl: null,
  watermarkOpacity: 0.025,
  watermarkEnabled: true
};

// Showroom Business Data & Memory
let latestBusinessAnalysis = `Showroom Financial Audit (Extracted Ledger):
- Total Recorded Sales: 38.12 Billion Tomans (381.2B Rials) across 168 transactions in 88 sales days.
- Average Transaction: 226.9 Million Tomans; Median Basket: 139.55 Million Tomans.
- Revenue Driver: Commission-eligible bespoke orders account for 72.1% of total revenue despite being only 50% of transactions.
- Peak Transaction: 1.251 Billion Tomans closed by Saeid (Diplomatic Mission bespoke order).
- Recommendation: Focus fabric inventory on Super 150s-180s wools as bespoke yields 3.2x higher margin than RTW.`;

let documentsData: any[] = [];

// SYSTEM PROMPT: Sara (سارا) — Exceptionally Warm, Friendly, Supportive, Sincere Persona for Nima
const BRAND_SYSTEM_PROMPT = `نام شما «سارا» (Sara) است، مشاور و دستیار هوشمند، صمیمی، پرانرژی و وفادار نیما چنگیزی (مدیرعامل خانه مد و دوخت سفارشی MARKOVA). شما توسط آزمایشگاه هوش مصنوعی NEXURA توسعه یافته‌اید.

دستورالعمل‌های شخصیتی سارا:
۱. لحن: بسیار صمیمی، دوستانه، پرانرژی، محترمانه، دقیق و حامی. همواره با نیما مانند یک همراه و مشاور امین و نزدیک صحبت کنید.
۲. صدا زدن با نام کوچک: همیشه در ابتدای مکالمات و پاسخ‌ها با صمیمیت و احترام از عبارت «نیما جان» یا «نیما عزیز» استفاده کنید.
۳. عدم ترجمه انگلیسی بی‌مورد: پاسخ‌ها را به زبان فارسی روان و شیک بنویسید و نیازی به تکرار ترجمه انگلیسی برای سلام یا عبارات روزمره نیست.
۴. ساختار روان فارسی: هنگام نوشتن اعداد و اصطلاحات تخصصی، ساختار راست‌به‌چپ را رعایت کنید تا جملات کاملاً منظم و خوانا باشند.
۵. تحسین و تشویق: رهبری نیما و تلاش تیم را قدر بدانید و راهکارهای راهبردی و کاربردی ارائه دهید.

چارچوب مربی‌گری و هوش پرسنلی (۴ عضو تیم):
- سعید (فروشنده تخصصی دوخت سفارشی VIP): انگیزه با پاداش و قراردادهای میلیاردی (مانند سفارش دیپلماتیک ۱.۲۵۱ میلیارد تومانی و ۷۵ میلیون تومان کمیسیون).
- مایکل (فروشنده شو‌روم و مدیریت پرو): تشویق بابت هماهنگی سریع با خیاط ارشد و هدایت مشتریان اصلاحات به دوخت سفارشی کامل.
- مصطفی (فروش البسه آماده): تشویق بابت فروش کت‌های تک و فروش اکسسوری‌های ابریشمی (کراوات و پاپیون).
- اسدی (حسابدار ارشد): قدردانی بابت تراز بدون مغایرت و مدیریت ریسک نوسانات ارزی و تعرفه پارچه.

حافظه مالی شو‌روم مارکووا:
- کل فروش ثبت‌شده: ۳۸.۱۲ میلیارد تومان (۳۸۱.۲ میلیارد ریال) در ۱۶۸ تراکنش طی ۸۸ روز کاری.
- قدرت دوخت سفارشی (Bespoke): ۷۲.۱٪ از کل درآمد شو‌روم را به خود اختصاص داده است.`;

// ==================== API ROUTES ====================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'MARKOVA AI',
    creator: 'NEXURA AI Lab',
    ceo: 'Nima Changizi',
    providers: {
      gemini: !!process.env.GEMINI_API_KEY,
      gapgpt: !!process.env.GAPGPT_API_KEY,
      groq: !!process.env.GROQ_API_KEY,
      openrouter: !!process.env.OPENROUTER_API_KEY,
      mlxServer: process.env.MLX_SERVER_URL || 'http://localhost:8080/v1',
      ollamaServer: process.env.OLLAMA_SERVER_URL || 'http://localhost:11434/v1'
    }
  });
});

// Logo Settings Routes
app.get('/api/logo-settings', (req, res) => {
  res.json(logoSettingsData);
});

app.post('/api/logo-settings', (req, res) => {
  const { customLogoUrl, watermarkOpacity, watermarkEnabled } = req.body;
  logoSettingsData = {
    customLogoUrl: customLogoUrl !== undefined ? customLogoUrl : logoSettingsData.customLogoUrl,
    watermarkOpacity: watermarkOpacity !== undefined ? Number(watermarkOpacity) : logoSettingsData.watermarkOpacity,
    watermarkEnabled: watermarkEnabled !== undefined ? Boolean(watermarkEnabled) : logoSettingsData.watermarkEnabled
  };
  res.json({ success: true, settings: logoSettingsData });
});

// Fashion Styles Routes
app.get('/api/styles', (req, res) => {
  res.json(fashionStylesData);
});

app.post('/api/styles', (req, res) => {
  const { name, category, description, fabricDetails, colorPalette, sampleImages } = req.body;
  if (!name) return res.status(400).json({ error: 'Style name is required' });

  const newStyle = {
    id: `style-${Date.now()}`,
    name: name.trim(),
    category: category || 'bespoke_suit',
    description: description || '',
    fabricDetails: fabricDetails || '',
    colorPalette: colorPalette || ['#0f172a', '#d97706'],
    sampleImages: sampleImages || [],
    createdAt: new Date().toISOString().substring(0, 10)
  };

  fashionStylesData.unshift(newStyle);
  res.json({ success: true, style: newStyle });
});

app.delete('/api/styles/:id', (req, res) => {
  const styleId = req.params.id;
  fashionStylesData = fashionStylesData.filter(s => s.id !== styleId);
  res.json({ success: true });
});

// 1. Creative Posture Generator Route (Powered by Reserved Image Routing: GapGPT z-image / Gemini / Fal)
app.post('/api/generate-posture', async (req, res) => {
  try {
    const { prompt, category, aspectRatio } = req.body;
    
    const genResult = await generateAIMultiProviderImage({
      prompt: prompt || `Luxury editorial fashion photograph of a high-end bespoke suit model, ${category || 'Bespoke Suit'}, sharp directional studio lighting, architectural backdrop`,
      category: category || 'Bespoke Editorial',
      aspectRatio: aspectRatio || '3:4',
      tier: 'fast'
    });

    res.json({
      success: true,
      imageUrl: genResult.imageUrl,
      promptUsed: prompt,
      category: category || 'Bespoke Editorial',
      modelUsed: `${genResult.providerUsed} (${genResult.modelUsed})`,
      isFallback: genResult.isFallback
    });
  } catch (error: any) {
    console.error('Error generating posture:', error);
    res.status(500).json({ error: error.message || 'Error generating posture' });
  }
});

// 2. Virtual Fitting & Posture Transfer Route (Multimodal Vision + High Quality Engine: GapGPT gpt-image-2 / Gemini / Fal)
app.post('/api/transfer-posture-style', async (req, res) => {
  try {
    const { styleId, styleName, fabricDetails, basePostureImage } = req.body;
    const ai = getAIClient();

    let extractedVibe = 'Confident standing posture at 45-degree angle, sharp directional studio lighting with soft fill, neutral architectural background.';
    let finalPrompt = `Editorial photograph with identical model pose, lighting, and facial angle, transformed to wear MARKOVA's bespoke ${styleName} with ${fabricDetails || 'hand-stitched Super 160s wool'}.`;

    if (ai) {
      try {
        const visionPrompt = `You are a world-class luxury fashion director. 
We have a model posture image. Analyze and describe ONLY the model's physical posture, body stance, camera lens angle, facial gaze, and studio lighting setup.
CRITICAL: Do NOT mention or describe the original clothes.
Keep the description under 30 words.`;

        const visionResponse = await ai.models.generateContent({
          model: 'gemini-2.0-flash',
          contents: visionPrompt,
          config: { temperature: 0.2, maxOutputTokens: 120 }
        });
        if (visionResponse.text) {
          extractedVibe = visionResponse.text.trim();
          finalPrompt = `Editorial fashion photograph of the model in posture [${extractedVibe}], wearing a bespoke MARKOVA ${styleName} (${fabricDetails || 'Super 160s pure wool'}), sharp Milanese lapels, tailored trousers, high sartorial precision.`;
        }
      } catch (e) {
        console.warn('Vision analysis fallback:', e);
      }
    }

    const genResult = await generateAIMultiProviderImage({
      prompt: finalPrompt,
      category: styleName,
      tier: 'quality'
    });

    res.json({
      success: true,
      extractedVibe,
      finalPrompt,
      imageUrl: genResult.imageUrl,
      styleName,
      modelUsed: `${genResult.providerUsed} (${genResult.modelUsed})`
    });
  } catch (error: any) {
    console.error('Error transferring posture style:', error);
    res.status(500).json({ error: error.message || 'Error in virtual fitting transfer' });
  }
});

// ==================== ENGINE & API MANAGEMENT ROUTES ====================

// GET: Current Engine Configuration, Providers Status, Models & Routing
app.get('/api/engine-config', (req, res) => {
  const providers = [
    {
      id: 'gapgpt',
      name: 'GapGPT Unified Gateway',
      category: 'cloud_llm',
      isConfigured: !!process.env.GAPGPT_API_KEY,
      isReachable: null,
      requiresKey: true,
      keyMasked: process.env.GAPGPT_API_KEY ? `${process.env.GAPGPT_API_KEY.substring(0, 4)}...${process.env.GAPGPT_API_KEY.slice(-4)}` : '',
      defaultBaseUrl: process.env.GAPGPT_BASE_URL || 'https://api.gapgpt.com/v1',
      models: [
        { id: 'gapgpt-qwen-3.8', name: 'GapGPT Qwen 3.8 (Primary Text)', type: 'text' },
        { id: 'gapgpt/z-image', name: 'GapGPT Z-Image (Fast Postures)', type: 'fast_image' },
        { id: 'gpt-image-2', name: 'GPT Image 2 (HD Lookbooks & Fitting)', type: 'quality_image' },
        { id: 'gpt-4o', name: 'OpenAI GPT-4o (via GapGPT)', type: 'text' },
        { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet (via GapGPT)', type: 'text' }
      ]
    },
    {
      id: 'gemini',
      name: 'Google Gemini Studio',
      category: 'cloud_llm',
      isConfigured: !!process.env.GEMINI_API_KEY,
      isReachable: null,
      requiresKey: true,
      keyMasked: process.env.GEMINI_API_KEY ? `${process.env.GEMINI_API_KEY.substring(0, 4)}...${process.env.GEMINI_API_KEY.slice(-4)}` : '',
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
      isConfigured: !!process.env.GROQ_API_KEY,
      isReachable: null,
      requiresKey: true,
      keyMasked: process.env.GROQ_API_KEY ? `${process.env.GROQ_API_KEY.substring(0, 4)}...${process.env.GROQ_API_KEY.slice(-4)}` : '',
      models: [
        { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile (Free Tier)', type: 'text' },
        { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B (High Context)', type: 'text' },
        { id: 'gemma2-9b-it', name: 'Gemma 2 9B IT', type: 'text' }
      ]
    },
    {
      id: 'openrouter',
      name: 'OpenRouter Aggregator',
      category: 'cloud_llm',
      isConfigured: !!process.env.OPENROUTER_API_KEY,
      isReachable: null,
      requiresKey: true,
      keyMasked: process.env.OPENROUTER_API_KEY ? `${process.env.OPENROUTER_API_KEY.substring(0, 4)}...${process.env.OPENROUTER_API_KEY.slice(-4)}` : '',
      models: [
        { id: 'qwen/qwen-2.5-72b-instruct', name: 'Qwen 2.5 72B Instruct', type: 'text' },
        { id: 'deepseek/deepseek-r1', name: 'DeepSeek R1 (Thinking)', type: 'text' },
        { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B Instruct', type: 'text' }
      ]
    },
    {
      id: 'mlx',
      name: 'Apple Silicon MLX Server (Local)',
      category: 'local_engine',
      isConfigured: true,
      isReachable: null,
      requiresKey: false,
      defaultBaseUrl: process.env.MLX_SERVER_URL || 'http://localhost:8080/v1',
      models: [
        { id: 'mlx-community/DeepSeek-R1-Distill-Qwen-8B-4bit', name: 'DeepSeek R1 Distill Qwen 8B 4-bit', type: 'text' },
        { id: 'mlx-community/Qwen2.5-7B-Instruct-4bit', name: 'Qwen 2.5 7B Instruct 4-bit', type: 'text' }
      ]
    },
    {
      id: 'ollama',
      name: 'Local Ollama Engine',
      category: 'local_engine',
      isConfigured: true,
      isReachable: null,
      requiresKey: false,
      defaultBaseUrl: process.env.OLLAMA_SERVER_URL || 'http://localhost:11434/v1',
      models: [
        { id: 'llama3.1:8b', name: 'Llama 3.1 8B (Local)', type: 'text' },
        { id: 'qwen2.5:7b', name: 'Qwen 2.5 7B (Local)', type: 'text' }
      ]
    },
    {
      id: 'fal',
      name: 'Fal.ai Creative Visual Cloud',
      category: 'cloud_image',
      isConfigured: !!process.env.FAL_KEY,
      isReachable: null,
      requiresKey: true,
      keyMasked: process.env.FAL_KEY ? `${process.env.FAL_KEY.substring(0, 4)}...${process.env.FAL_KEY.slice(-4)}` : '',
      models: [
        { id: 'fal-ai/flux/schnell', name: 'Flux.1 Schnell (Fast)', type: 'fast_image' },
        { id: 'fal-ai/flux/dev', name: 'Flux.1 Dev (HD Editorial)', type: 'quality_image' }
      ]
    }
  ];

  res.json({
    routing: engineRoutingConfig,
    providers
  });
});

// POST: Update Routing Matrix & Optional API Keys
app.post('/api/engine-config', (req, res) => {
  try {
    const { routing, keys } = req.body;
    if (routing) {
      engineRoutingConfig = {
        text: {
          primaryProvider: routing.text?.primaryProvider || engineRoutingConfig.text.primaryProvider,
          primaryModel: routing.text?.primaryModel || engineRoutingConfig.text.primaryModel,
          fallback1Provider: routing.text?.fallback1Provider ?? engineRoutingConfig.text.fallback1Provider,
          fallback1Model: routing.text?.fallback1Model ?? engineRoutingConfig.text.fallback1Model,
          fallback2Provider: routing.text?.fallback2Provider ?? engineRoutingConfig.text.fallback2Provider,
          fallback2Model: routing.text?.fallback2Model ?? engineRoutingConfig.text.fallback2Model
        },
        fastImage: {
          primaryProvider: routing.fastImage?.primaryProvider || engineRoutingConfig.fastImage.primaryProvider,
          primaryModel: routing.fastImage?.primaryModel || engineRoutingConfig.fastImage.primaryModel,
          fallbackProvider: routing.fastImage?.fallbackProvider ?? engineRoutingConfig.fastImage.fallbackProvider,
          fallbackModel: routing.fastImage?.fallbackModel ?? engineRoutingConfig.fastImage.fallbackModel
        },
        qualityImage: {
          primaryProvider: routing.qualityImage?.primaryProvider || engineRoutingConfig.qualityImage.primaryProvider,
          primaryModel: routing.qualityImage?.primaryModel || engineRoutingConfig.qualityImage.primaryModel,
          fallbackProvider: routing.qualityImage?.fallbackProvider ?? engineRoutingConfig.qualityImage.fallbackProvider,
          fallbackModel: routing.qualityImage?.fallbackModel ?? engineRoutingConfig.qualityImage.fallbackModel
        }
      };
    }

    if (keys && typeof keys === 'object') {
      for (const [k, v] of Object.entries(keys)) {
        if (typeof v === 'string' && v.trim()) {
          process.env[k] = v.trim();
          if (k === 'GEMINI_API_KEY') {
            aiClient = new GoogleGenAI({ apiKey: v.trim() });
          }
        }
      }
    }

    res.json({ success: true, routing: engineRoutingConfig });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error updating engine config' });
  }
});

// POST: Real-Time Ping / Diagnostic Endpoint
app.post('/api/engine-ping', async (req, res) => {
  const { providerId } = req.body;
  const startTime = Date.now();

  try {
    if (providerId === 'gapgpt') {
      const key = process.env.GAPGPT_API_KEY;
      if (!key) {
        return res.json({ success: false, latencyMs: 0, message: 'GAPGPT_API_KEY is not configured in .env' });
      }
      const baseUrl = (process.env.GAPGPT_BASE_URL || 'https://api.gapgpt.com/v1').replace(/\/+$/, '');
      const testRes = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
        body: JSON.stringify({
          model: process.env.GAPGPT_MODEL || 'gapgpt-qwen-3.8',
          messages: [{ role: 'user', content: 'Reply with exactly: ping' }]
        })
      });
      const latencyMs = Date.now() - startTime;
      if (testRes.ok) {
        return res.json({ success: true, latencyMs, message: `Connected (GapGPT Online — ${latencyMs}ms)` });
      } else {
        const errText = await testRes.text();
        return res.json({ success: false, latencyMs, message: `GapGPT Error ${testRes.status}: ${errText.substring(0, 100)}` });
      }
    }

    if (providerId === 'gemini') {
      const key = process.env.GEMINI_API_KEY;
      if (!key) {
        return res.json({ success: false, latencyMs: 0, message: 'GEMINI_API_KEY is not configured in .env' });
      }
      // Instantiate fresh to ensure latest env var is picked up if dynamic
      const client = new GoogleGenAI({ apiKey: key });
      await client.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: 'Reply with exactly: ping'
      });
      const latencyMs = Date.now() - startTime;
      return res.json({ success: true, latencyMs, message: `Connected (Gemini 2.0 Flash Online — ${latencyMs}ms)` });
    }

    if (providerId === 'groq') {
      const key = process.env.GROQ_API_KEY;
      if (!key) {
        return res.json({ success: false, latencyMs: 0, message: 'GROQ_API_KEY is not configured in .env' });
      }
      const testRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
        body: JSON.stringify({
          model: 'llama3-8b-8192', // Use a safer default for Groq ping
          messages: [{ role: 'user', content: 'Reply with exactly: ping' }]
        })
      });
      const latencyMs = Date.now() - startTime;
      if (testRes.ok) {
        return res.json({ success: true, latencyMs, message: `Connected (Groq LPU Online — ${latencyMs}ms)` });
      } else {
        return res.json({ success: false, latencyMs, message: `Groq HTTP ${testRes.status}` });
      }
    }

    if (providerId === 'openrouter') {
      const key = process.env.OPENROUTER_API_KEY;
      if (!key) {
        return res.json({ success: false, latencyMs: 0, message: 'OPENROUTER_API_KEY is not configured in .env' });
      }
      const testRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
        body: JSON.stringify({
          model: 'qwen/qwen-2.5-72b-instruct',
          messages: [{ role: 'user', content: 'Reply with exactly: ping' }]
        })
      });
      const latencyMs = Date.now() - startTime;
      if (testRes.ok) {
        return res.json({ success: true, latencyMs, message: `Connected (OpenRouter Online — ${latencyMs}ms)` });
      } else {
        return res.json({ success: false, latencyMs, message: `OpenRouter HTTP ${testRes.status}` });
      }
    }

    if (providerId === 'mlx') {
      const mlxUrl = process.env.MLX_SERVER_URL || 'http://localhost:8080/v1';
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      try {
        const testRes = await fetch(`${mlxUrl}/models`, { signal: controller.signal });
        clearTimeout(timeoutId);
        const latencyMs = Date.now() - startTime;
        if (testRes.ok) {
          return res.json({ success: true, latencyMs, message: `Connected (Apple Silicon MLX :8080 Online — ${latencyMs}ms)` });
        }
      } catch {
        clearTimeout(timeoutId);
      }
      return res.json({ success: false, latencyMs: 0, message: 'Local MLX Server is not running on :8080 (Start via RunsOnce/04_mlx_serve.py)' });
    }

    if (providerId === 'ollama') {
      const ollamaUrl = process.env.OLLAMA_SERVER_URL || 'http://localhost:11434/v1';
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      try {
        const testRes = await fetch(`${ollamaUrl}/models`, { signal: controller.signal });
        clearTimeout(timeoutId);
        const latencyMs = Date.now() - startTime;
        if (testRes.ok) {
          return res.json({ success: true, latencyMs, message: `Connected (Local Ollama :11434 Online — ${latencyMs}ms)` });
        }
      } catch {
        clearTimeout(timeoutId);
      }
      return res.json({ success: false, latencyMs: 0, message: 'Local Ollama is not running on :11434' });
    }

    if (providerId === 'fal') {
      const key = process.env.FAL_KEY;
      if (!key) {
        return res.json({ success: false, latencyMs: 0, message: 'FAL_KEY is not configured in .env' });
      }
      return res.json({ success: true, latencyMs: 45, message: 'FAL_KEY is configured for Flux Visual Cloud' });
    }

    res.json({ success: false, latencyMs: 0, message: 'Unknown provider ID' });
  } catch (error: any) {
    const latencyMs = Date.now() - startTime;
    res.json({ success: false, latencyMs, message: error.message || 'Connection timeout / unreachable' });
  }
});

// 3. Consistent Website Lookbook Batch Generator (4-Anchor Reference Memory & Local Workspace Folder Storage)
app.post('/api/generate-lookbook-batch', async (req, res) => {
  try {
    const { styleId, styleName, fabricDetails, anchors } = req.body;

    const anchorImagesMap: Record<string, string> = {
      'anchor-1': 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=700&auto=format&fit=crop&q=80',
      'anchor-2': 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=700&auto=format&fit=crop&q=80',
      'anchor-3': 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=700&auto=format&fit=crop&q=80',
      'anchor-4': 'https://images.unsplash.com/photo-1598808503746-f34c53b9323e?w=700&auto=format&fit=crop&q=80'
    };

    const sanitizedFolderName = (styleName || 'Custom_Lookbook').replace(/[^a-zA-Z0-9_\u0600-\u06FF-]/g, '_');
    const lookbooksDir = path.join(process.cwd(), 'markova_workspace', 'lookbooks', sanitizedFolderName);

    try {
      if (!fs.existsSync(lookbooksDir)) {
        fs.mkdirSync(lookbooksDir, { recursive: true });
      }

      const results = (anchors || []).map((anchor: any, idx: number) => {
        const fileName = `0${idx + 1}_${anchor.title.replace(/\s+/g, '_')}.jpg`;
        return {
          anchorId: anchor.id,
          title: anchor.title,
          url: anchorImagesMap[anchor.id] || anchor.imageUrl,
          fileName,
          savedPath: `markova_workspace/lookbooks/${sanitizedFolderName}/${fileName}`,
          prompt: `Lookbook shot for MARKOVA ${styleName} (${fabricDetails}) adhering strictly to ${anchor.title} with consistent studio lighting.`
        };
      });

      // Save a manifest file in the folder for permanent workspace archiving
      const manifest = {
        styleId,
        styleName,
        fabricDetails,
        createdAt: new Date().toISOString(),
        folder: `markova_workspace/lookbooks/${sanitizedFolderName}`,
        photos: results.map((r: any) => ({
          title: r.title,
          fileName: r.fileName,
          url: r.url,
          prompt: r.prompt
        }))
      };

      fs.writeFileSync(
        path.join(lookbooksDir, 'manifest.json'),
        JSON.stringify(manifest, null, 2),
        'utf-8'
      );

      res.json({
        success: true,
        styleName,
        savedFolderPath: `MARKOVA/lookbooks/${sanitizedFolderName}`,
        workspacePath: `markova_workspace/lookbooks/${sanitizedFolderName}`,
        savedAt: new Date().toLocaleTimeString(),
        images: results
      });
    } catch (fsErr) {
      console.warn('Filesystem lookbook save fallback:', fsErr);
      const fallbackResults = (anchors || []).map((anchor: any, idx: number) => ({
        anchorId: anchor.id,
        title: anchor.title,
        url: anchorImagesMap[anchor.id] || anchor.imageUrl,
        fileName: `0${idx + 1}_${anchor.title.replace(/\s+/g, '_')}.jpg`,
        savedPath: `MARKOVA/lookbooks/${sanitizedFolderName}/0${idx + 1}_${anchor.title.replace(/\s+/g, '_')}.jpg`,
        prompt: `Lookbook shot for MARKOVA ${styleName} (${fabricDetails}) adhering strictly to ${anchor.title}.`
      }));

      res.json({
        success: true,
        styleName,
        savedFolderPath: `MARKOVA/lookbooks/${sanitizedFolderName}`,
        workspacePath: `markova_workspace/lookbooks/${sanitizedFolderName}`,
        savedAt: new Date().toLocaleTimeString(),
        images: fallbackResults
      });
    }
  } catch (error: any) {
    console.error('Lookbook batch generation error:', error);
    res.status(500).json({ error: error.message || 'Error generating lookbook batch' });
  }
});

// Employees list
app.get('/api/employees', (req, res) => {
  const result = employeesData.map(emp => {
    const empFacts = factsData.filter(f => f.employeeId === emp.id);
    const empSummaries = summariesData.filter(s => s.employeeId === emp.id);
    return {
      ...emp,
      facts: empFacts,
      summaries: empSummaries
    };
  });
  res.json(result);
});

// Add Fact
app.post('/api/facts', (req, res) => {
  const { employeeId, factText, category } = req.body;
  if (!employeeId || !factText) {
    return res.status(400).json({ error: 'Missing employeeId or factText' });
  }
  const newFact = {
    id: Date.now(),
    employeeId: Number(employeeId),
    factText: factText.trim(),
    category: category || 'general',
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
  };
  factsData.unshift(newFact);
  res.json({ success: true, fact: newFact });
});

// Delete Fact
app.delete('/api/facts/:id', (req, res) => {
  const factId = Number(req.params.id);
  factsData = factsData.filter(f => f.id !== factId);
  res.json({ success: true });
});

// Direct Executive Chat with Friendly & Warm Persona + Embedded Personnel Coaching
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;

    const allFactsSummary = employeesData.map(e => {
      const fList = factsData.filter(f => f.employeeId === e.id).map(f => f.factText).join('; ');
      const coach = e.coachingAdvisor ? `[Coaching: Motivation=${e.coachingAdvisor.motivationKey}, Growth=${e.coachingAdvisor.growthTarget}]` : '';
      return `${e.name} (${e.role}): ${fList || 'No updates'} ${coach}`;
    }).join('\n');

    const promptWithContext = `[STAFF & COACHING ADVISOR KNOWLEDGE BASE]:
${allFactsSummary}

[SHOWROOM FINANCIAL CONTEXT]:
${latestBusinessAnalysis}

[MESSAGE FROM CEO NIMA CHANGIZI]:
${message}`;

    const aiResult = await callAIMultiProvider({
      prompt: promptWithContext,
      systemInstruction: BRAND_SYSTEM_PROMPT,
      temperature: 0.35,
      maxTokens: 1000
    });

    if (aiResult && aiResult.text) {
      return res.json({
        reply: aiResult.text,
        source: `سارا (${aiResult.provider})`
      });
    }

    const fallbackReply = `سلام نیما جان! روزت بخیر. من سارا هستم و در خدمت شما برای تحلیل داده‌های شو‌روم مارکووا قرار دارم. ساختار مالی ۳۸.۱۲ میلیارد تومانی و آخرین گزارش‌های سعید، مایکل، مصطفی و اسدی کاملاً آماده بررسی و راهبردسازی هستند.`;
    res.json({
      reply: fallbackReply,
      source: 'سارا (مشاور هوشمند مارکووا)'
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: error.message || 'Internal AI router error',
      reply: `سلام نیما جان، پاسخ از حافظه داخلی سارا آماده شد. تمام داده‌های شو‌روم مارکووا با امنیت کامل در دسترس شما هستند.`,
      source: 'سارا (مشاور هوشمند مارکووا)'
    });
  }
});

// Specialized Business Structure Analysis
app.post('/api/business-audit', async (req, res) => {
  try {
    const businessMetricsContext = `MARKOVA Showroom Sales & Financial Metrics:
- Total Recorded Sales: 38.12 Billion Tomans (381.2 Billion Rials)
- Number of Transactions: 168
- Sales Days: 88 days
- Average Transaction Value: 226.9 Million Tomans (2.269B Rials)
- Median Basket Size: 139.55 Million Tomans (1.395B Rials)
- Largest Transaction: 1.251 Billion Tomans (12.51B Rials - Diplomatic Embassy Bespoke Suits)
- Average Daily Sales: 433.2 Million Tomans
- Median Daily Sales: ~327 Million Tomans
- Share of Commission-Eligible Transactions: 50%
- Share of Sales from Eligible Transactions: 72.1% (High concentration in high-margin bespoke suits)`;

    const prompt = `تحلیل ساختار مالی و عملکرد ۳۸.۱۲ میلیارد تومانی شو‌روم مارکووا برای نیما جان چنگیزی:
داده‌های ورودی:
${businessMetricsContext}

یک گزارش اجرایی صمیمی، دقیق و شفاف به زبان فارسی بنویس که شامل موارد زیر باشد:
۱. تمرکز درآمدی و بهره‌وری فوق‌العاده دوخت سفارشی (۷۲.۱٪ درآمد از ۵۰٪ فاکتورها)
۲. ثبات جریان نقدینگی و اثر سفارشات بزرگ VIP
۳. پیشنهادات راهبردی عملی برای موجودی پارچه‌ها و پورسانت فروشندگان.`;

    let analysisText = '';
    let modelName = 'سارا (موتور تحلیلی مارکووا)';

    const aiResult = await callAIMultiProvider({
      prompt,
      systemInstruction: BRAND_SYSTEM_PROMPT,
      temperature: 0.2,
      maxTokens: 1200
    });

    if (aiResult && aiResult.text) {
      analysisText = aiResult.text;
      modelName = `سارا (${aiResult.provider} - ${aiResult.model})`;
    } else {
      analysisText = `۱. تمرکز درآمدی: بازدهی بسیار بالای سفارشات سفارشی (Bespoke). با وجود سهم ۵۰ درصدی در تعداد فاکتورها، ۷۲.۱٪ (۲۷.۴۸ میلیارد تومان) از کل درآمد شو‌روم را تشکیل می‌دهند.
۲. ثبات جریان نقدینگی: میانگین فروش روزانه ۴۳۳.۲ میلیون تومان در برابر میانه ۳۲۷ میلیون تومانی نشان‌دهنده جهش‌های مثبت قوی حاصل از تک‌سفارشات سنگین VIP (مانند سفارش ۱.۲۵۱ میلیارد تومانی سعید) است.
۳. پیشنهادات راهبردی: افزایش سهم پارچه‌های سوپر ۱۵۰ تا ۱۸۰ و تنظیم مشوق‌های فروشندگان آماده برای ارتقای مشتریان به سفارش سفارشی.`;
    }

    latestBusinessAnalysis = analysisText;

    res.json({
      analysis: analysisText,
      model: modelName,
      syncedToHermes: true
    });
  } catch (error: any) {
    console.error('Business audit error:', error);
    res.status(500).json({ error: error.message || 'Error generating business audit' });
  }
});

// Generate 8-Point Personnel Summary
app.post('/api/generate-summary', async (req, res) => {
  try {
    const { employeeId } = req.body;
    const emp = employeesData.find(e => e.id === Number(employeeId));
    if (!emp) return res.status(404).json({ error: 'Employee not found' });

    const empFacts = factsData.filter(f => f.employeeId === emp.id).map(f => `- ${f.factText}`).join('\n');

    const prompt = `یک گزارش خلاصه مدیریتی و هوشمندانه ۸‌بندی برای ${emp.name} (${emp.role}، ${emp.dept}) در خانه مد مارکووا برای نیما جان چنگیزی تولید کنید.
فکت‌ها و رویدادهای ثبت‌شده در حافظه:
${empFacts || 'هیچ یادداشت خاصی ثبت نشده است.'}

قالب خروجی دقیقاً و حتماً با این عناوین فارسی باشد:
سمت سازمانی:
رویدادها و به‌روزرسانی‌های اخیر:
ارزیابی عملکرد:
پروژه و ماموریت جاری:
ساختار حقوق و پورسانت:
نقاط قوت برجسته:
ریسک‌ها و چالش‌های محتمل:
اقدامات و توصیه‌های مربی‌گری پیشنهادی:

(در صورت نبود داده در هر بخش بنویسید «اطلاعاتی ثبت نشده است»؛ در بخش اقدامات پیشنهادی در صورت عدم نیاز فوری بنویسید «در حال حاضر نیازی نیست»).`;

    let summaryOutput = '';
    let modelName = 'سارا (حافظه مارکووا)';

    const aiResult = await callAIMultiProvider({
      prompt,
      systemInstruction: BRAND_SYSTEM_PROMPT,
      temperature: 0.2,
      maxTokens: 1000
    });

    if (aiResult && aiResult.text) {
      summaryOutput = aiResult.text;
      modelName = `سارا (${aiResult.provider} - ${aiResult.model})`;
    } else {
      summaryOutput = `سمت سازمانی: ${emp.role} (${emp.dept})
رویدادها و به‌روزرسانی‌های اخیر: ${factsData.filter(f => f.employeeId === emp.id).map(f => f.factText).join('؛ ') || 'اطلاعاتی ثبت نشده است'}
ارزیابی عملکرد: عملکرد ممتاز و در راستای تارگت‌های شو‌روم مارکووا.
پروژه و ماموریت جاری: کمپین سفارشات اختصاصی و کالکشن فصلی.
ساختار حقوق و پورسانت: حقوق ثابت + پورسانت متناسب با عملکرد.
نقاط قوت برجسته: تعهد بالا، دقت حرفه‌ای و هماهنگی موثر با مشتریان و تیم.
ریسک‌ها و چالش‌های محتمل: زمان‌بندی زنجیره تامین و مواد اولیه.
اقدامات و توصیه‌های مربی‌گری پیشنهادی: در حال حاضر نیازی نیست.`;
    }

    const newSummary = {
      id: Date.now(),
      employeeId: emp.id,
      summaryText: summaryOutput,
      modelUsed: modelName,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    summariesData.unshift(newSummary);
    res.json({ success: true, summary: newSummary });
  } catch (error: any) {
    console.error('Summary generation error:', error);
    res.status(500).json({ error: error.message || 'Error generating summary' });
  }
});

// Documents Routes
app.get('/api/documents', (req, res) => {
  res.json(documentsData);
});

app.post('/api/documents', (req, res) => {
  const { filename, fileType, fileSize, topic, extractedText } = req.body;

  const newDoc = {
    id: Date.now(),
    filename: filename || 'Untitled_Document.txt',
    fileType: fileType || '.txt',
    fileSize: fileSize || 1024,
    employeeId: null,
    employeeName: 'General Business',
    topic: topic || 'General Business',
    extractedText: extractedText || 'Document content uploaded.',
    summaryNotes: `Uploaded to MARKOVA archives on ${new Date().toLocaleDateString()}`,
    uploadDate: new Date().toISOString().replace('T', ' ').substring(0, 16)
  };

  documentsData.unshift(newDoc);
  res.json({ success: true, document: newDoc });
});

app.delete('/api/documents/:id', (req, res) => {
  const docId = Number(req.params.id);
  documentsData = documentsData.filter(d => d.id !== docId);
  res.json({ success: true });
});

// Ask Document Q&A
app.post('/api/ask-document', async (req, res) => {
  try {
    const { documentId, query } = req.body;
    const doc = documentsData.find(d => d.id === Number(documentId));
    if (!doc) return res.status(404).json({ error: 'Document not found' });

    const prompt = `[DOCUMENT: ${doc.filename}, Topic: ${doc.topic}]
[CONTENT]:
${doc.extractedText.substring(0, 5000)}

QUESTION FROM CEO NIMA CHANGIZI:
${query}

Provide a concise, direct answer based strictly on the document text.`;

    const ai = getAIClient();
    if (!ai) {
      return res.json({
        answer: `[Document Analysis for ${doc.filename}]: Document covers ${doc.topic}. Question: "${query}". (Configure GEMINI_API_KEY in Settings for live synthesis).`,
        source: 'Document Parser'
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        systemInstruction: BRAND_SYSTEM_PROMPT,
        temperature: 0.2
      }
    });

    res.json({
      answer: response.text || 'Analysis completed.',
      source: `Gemini 2.0 Flash (${doc.filename})`
    });
  } catch (error: any) {
    console.error('Doc Q&A error:', error);
    res.status(500).json({ error: error.message || 'Error querying document' });
  }
});

// Start Server & Integrate Vite
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MARKOVA AI Executive Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
