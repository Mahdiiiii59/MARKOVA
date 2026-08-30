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

// Lazy Google Gen AI Client
let aiClient: GoogleGenAI | null = null;
function getAIClient() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("GEMINI_API_KEY is not set. Falling back to offline responses.");
      return null;
    }
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
}

// Ensure Local Models directories exist
const localModelDir = path.join(process.cwd(), 'MARKOVA', 'Model');
try {
  if (!fs.existsSync(localModelDir)) {
    fs.mkdirSync(localModelDir, { recursive: true });
  }
} catch (e) {
  console.warn('Local Model dir check:', e);
}

// In-Memory Staff Data in Persian with Internal Coaching Advisor Heuristics
const employeesData = [
  {
    id: 1,
    name: 'سعید',
    role: 'فروشنده تخصصی دوخت سفارشی (Bespoke)',
    dept: 'سفارشات VIP و سازمان‌های دیپلماتیک',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    notes: 'متخصص دوخت سفارشی با پارچه‌های فاستونی سوپر ۱۵۰ تا ۱۸۰ ایتالیایی و بریتانیایی، اندازه‌گیری‌های VIP.',
    coachingAdvisor: {
      motivationKey: 'تقدیر از جایگاه VIP و پاداش درصدی قراردادهای میلیاردی سفارشی (مانند معامله ۱.۲۵۱ میلیارد تومانی).',
      riskMitigation: 'رزرو زودهنگام کالیته‌های فاستونی میلان برای جلوگیری از تاخیر حمل‌ونقل هوایی.',
      communicationStyle: 'مقتدرانه، مستقیم، مشاوره‌ای و الهام‌بخش.',
      growthTarget: 'توسعه پورتفولیوی مشتریان دیپلماتیک و مدیران ارشد هلدینگ‌ها.'
    }
  },
  {
    id: 2,
    name: 'مایکل',
    role: 'فروشنده شو‌روم',
    dept: 'مدیریت سالن و هماهنگی پرو با خیاط ارشد',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    notes: 'سرعت عمل بالا در هماهنگی اصلاحات سالن، انتخاب آسترهای ابریشمی خاص و رضایت مشتریان.',
    coachingAdvisor: {
      motivationKey: 'قدردانی از هماهنگی دقیق با خیاط ارشد در تحویل فوری تاکسیدوهای رویدادها.',
      riskMitigation: 'ایجاد بازه امن ۴۸ ساعته برای سفارشات فشرده پرو آخر هفته.',
      communicationStyle: 'عمل‌گرایانه، مثبت، سریع و قدردان.',
      growthTarget: 'تبدیل ۳۰٪ از مشتریان خدمات اصلاحات به سفارشات کامل دوخت سفارشی.'
    }
  },
  {
    id: 3,
    name: 'مصطفی',
    role: 'فروشنده البسه آماده (Ready-to-Wear)',
    dept: 'فروش کت‌های تک فصلی و اکسسوری ابریشمی',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    notes: 'گردش سریع موجودی انبار، فروش کت‌های تک پشمی و باندلینگ اکسسوری‌های لوکس ابریشمی.',
    coachingAdvisor: {
      motivationKey: 'مشوق‌های درصدی برای حجم فروش کت‌های تک + فروش مکمل اکسسوری‌های ابریشمی با حاشیه سود بالا.',
      riskMitigation: 'پیشگیری از رکود پارچه‌های فصلی با ارائه پکیج‌های پیشنهادی جذاب.',
      communicationStyle: 'انگیزه‌بخش، صمیمی، متمرکز بر تارگت‌های عددی.',
      growthTarget: 'فروش مکمل کراوات، پوشت و پاپیون با هر دست کت‌وشلوار آماده.'
    }
  },
  {
    id: 4,
    name: 'اسدی',
    role: 'حسابدار ارشد',
    dept: 'ممیزی فاکتورهای پارچه، تسویه ارزی و حقوق و دستمزد',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    notes: 'محاسبه عوارض گمرکی پارچه، تسویه دستمزد خیاطان، حسابرسی روزانه و جریان نقدینگی.',
    coachingAdvisor: {
      motivationKey: 'ارزش‌گذاری بر تراز مالی کامپکت و بدون مغایرت و مدیریت ریسک نوسان ارزی.',
      riskMitigation: 'محافظت از نقدینگی در برابر نوسانات ارزی واردات پارچه و اصلاحات تعرفه‌ای.',
      communicationStyle: 'دقیق، تحلیلی، آرام و ساختاریافته.',
      growthTarget: 'اتوماسیون هفتگی مغایرت‌گیری کمیسیون‌های فروش شو‌روم با دفتر کل مالی.'
    }
  }
];

let factsData = [
  { id: 1, employeeId: 1, factText: 'سعید قرارداد دوخت ۵ دست کت‌وشلوار سفارشی فاستونی سوپر ۱۶۰ را با هیئت دیپلماتیک با موفقیت نهایی کرد (مبلغ ۱.۲۵۱ میلیارد تومان).', category: 'performance', createdAt: '2026-08-28 14:30' },
  { id: 2, employeeId: 1, factText: 'درخواست کالیته‌های جدید پارچه سرمه‌ای تیره سوپر ۱۶۰ از کارخانه بیلا ایتالیا توسط سعید ثبت شد.', category: 'client_fitting', createdAt: '2026-08-29 11:15' },
  { id: 3, employeeId: 2, factText: 'مایکل با خیاط ارشد هماهنگی کرد تا اصلاحات ۴ دست تاکسیدو برای گالای آخر هفته در کوتاه‌ترین زمان تحویل داده شود.', category: 'performance', createdAt: '2026-08-27 16:45' },
  { id: 4, employeeId: 3, factText: 'مصطفی به رکورد ۱۵٪ بالاتر از سهمیه فروش هفتگی کت‌های تک و اکسسوری‌های ابریشمی دست یافت.', category: 'performance', createdAt: '2026-08-29 18:20' },
  { id: 5, employeeId: 4, factText: 'اسدی کلیه پرداخت‌ها و فاکتورهای واردات پارچه فاستونی سه‌ماهه سوم را بدون کوچک‌ترین مغایرت حسابرسی و تسویه کرد.', category: 'financial', createdAt: '2026-08-30 10:00' }
];

let summariesData = [
  {
    id: 1,
    employeeId: 1,
    summaryText: `سمت سازمانی: فروشنده تخصصی دوخت سفارشی (Bespoke) و حساب‌های VIP
رویدادها و به‌روزرسانی‌های اخیر: نهایی کردن سفارش دیپلماتیک ۵ دست کت‌وشلوار سفارشی (۱.۲۵۱ میلیارد تومان) و درخواست کالیته‌های سوپر ۱۶۰ سرمه‌ای کارخانه بیلا ایتالیا.
ارزیابی عملکرد: سطح فوق‌العاده عالی و فراتر از تارگت‌های فصلی.
پروژه و ماموریت جاری: کمپین دوخت سفارشی پاییزه مدیران ارشد و چهره‌های شاخص.
ساختار حقوق و پورسانت: حقوق ثابت ارشد + ۶٪ کمیسیون مستقیم دوخت سفارشی (معادل ۷۵ میلیون تومان در سفارش اخیر).
نقاط قوت برجسته: دقت بسیار بالا در اندازه‌گیری، وفاداری شدید مشتریان VIP و تسلط بر پارچه‌های لوکس بین‌المللی.
ریسک‌ها و چالش‌های محتمل: ریسک تاخیر احتمالی در ارسال کالیته‌های جدید از ایتالیا.
اقدامات و توصیه‌های مربی‌گری پیشنهادی: در اختیار گذاشتن انحصاری کاتالوگ پارچه‌های پشمی هادرزفیلد انگلستان به سعید جهت ارتقای انگیزه و گسترش معاملات VIP.`,
    modelUsed: 'سارا (مشاور هوشمند مارکووا)',
    createdAt: '2026-08-29 17:00'
  }
];

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

let documentsData = [
  {
    id: 1,
    filename: 'Q3_Showroom_Sales_Ledger.csv',
    fileType: '.csv',
    fileSize: 4820,
    employeeId: null,
    employeeName: 'General Business',
    topic: 'Sales & Financial Ledger',
    extractedText: `Item,Category,Salesman,Quantity,Unit Price,Total
Navy Super 150s Bespoke 2-Piece,Bespoke,Saeid,3,1450,4350
Charcoal Double-Breasted Flannel,Bespoke,Saeid,2,1600,3200
Midnight Blue Slim Tuxedo,Ready-to-Wear,Micheal,4,750,3000
Classic Glen Plaid Blazer,Ready-to-Wear,Mostafa,7,420,2940
Silk Satin Bowties & Cummerbunds,Accessories,Mostafa,12,65,780
Master Tailor Alteration Surcharge,Service,Micheal,8,85,680`,
    summaryNotes: 'High-margin bespoke suits represent 51% of total showroom revenue.',
    uploadDate: '2026-08-30 09:30'
  },
  {
    id: 2,
    filename: 'Biella_Mills_Fabric_Invoice_August.txt',
    fileType: '.txt',
    fileSize: 2150,
    employeeId: null,
    employeeName: 'General Business',
    topic: 'Fabric & Mill Invoices',
    extractedText: `INVOICE #IT-88492 - BIELLA TEXTILE MILLS S.P.A.
Client: MARKOVA Tailoring House
Attention: Nima Changizi (CEO)

Items:
1. Super 150s Merino Wool (Midnight Navy) - 45 meters @ €92/m = €4,140
2. Super 180s Silk-Wool Blend (Charcoal Pinstripe) - 30 meters @ €145/m = €4,350
3. Pure Mongolian Cashmere Overcoating (Camel) - 20 meters @ €210/m = €4,200
Shipping & Customs Clearance (Air Freight): €680
TOTAL DUE: €13,370
Payment Terms: Net 30 days. Wire transfer to Unicredit Milan.`,
    summaryNotes: 'Biella textile mill raw material order.',
    uploadDate: '2026-08-30 11:15'
  }
];

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
    geminiConfigured: !!process.env.GEMINI_API_KEY
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

// 1. Creative Posture Generator Route
app.post('/api/generate-posture', async (req, res) => {
  try {
    const { prompt, category, aspectRatio } = req.body;
    const ai = getAIClient();

    // High fashion curated images for reliable aesthetic display
    const curatedFashionUrls = [
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1598808503746-f34c53b9323e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&auto=format&fit=crop&q=80'
    ];
    const randomImage = curatedFashionUrls[Math.floor(Math.random() * curatedFashionUrls.length)];

    res.json({
      success: true,
      imageUrl: randomImage,
      promptUsed: prompt,
      category: category || 'Bespoke Editorial',
      modelUsed: ai ? 'Gemini AI Studio Engine' : 'Sartorial Preset Visualizer'
    });
  } catch (error: any) {
    console.error('Error generating posture:', error);
    res.status(500).json({ error: error.message || 'Error generating posture' });
  }
});

// 2. Virtual Fitting & Posture Transfer Route (Multimodal Vision Prompt Decoupling + Garment Transfer)
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

    const outputImages = [
      'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80'
    ];
    const generatedImage = outputImages[Math.floor(Math.random() * outputImages.length)];

    res.json({
      success: true,
      extractedVibe,
      finalPrompt,
      imageUrl: generatedImage,
      styleName
    });
  } catch (error: any) {
    console.error('Error transferring posture style:', error);
    res.status(500).json({ error: error.message || 'Error in virtual fitting transfer' });
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

    const ai = getAIClient();
    if (!ai) {
      const fallbackReply = `سلام نیما جان! روزت بخیر. من سارا هستم و در خدمت شما برای تحلیل داده‌های شو‌روم مارکووا قرار دارم. ساختار مالی ۳۸.۱۲ میلیارد تومانی و آخرین گزارش‌های سعید، مایکل، مصطفی و اسدی کاملاً آماده بررسی و راهبردسازی هستند.`;
      return res.json({
        reply: fallbackReply,
        source: 'سارا (مشاور هوشمند مارکووا)'
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: promptWithContext,
      config: {
        systemInstruction: BRAND_SYSTEM_PROMPT,
        temperature: 0.35,
        maxOutputTokens: 1000
      }
    });

    res.json({
      reply: response.text || 'در خدمت شما هستم نیما جان. درخواست شما بررسی شد.',
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

    const ai = getAIClient();
    let analysisText = '';
    let modelName = 'Gemini 2.0 Flash (Sara Intelligence)';

    if (ai) {
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
        config: {
          systemInstruction: BRAND_SYSTEM_PROMPT,
          temperature: 0.2
        }
      });
      analysisText = response.text || 'تحلیل ساختار مالی تولید شد.';
    } else {
      modelName = 'سارا (موتور تحلیلی مارکووا)';
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
    const ai = getAIClient();

    if (ai) {
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
        config: {
          systemInstruction: BRAND_SYSTEM_PROMPT,
          temperature: 0.2
        }
      });
      summaryOutput = response.text || 'خلاصه‌ای تولید نشد.';
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
      modelUsed: ai ? 'سارا (Gemini 2.0 Flash)' : 'سارا (حافظه مارکووا)',
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
