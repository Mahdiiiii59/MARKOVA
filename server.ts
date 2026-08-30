import express from 'express';
import path from 'path';
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

// In-Memory Staff Data
const employeesData = [
  {
    id: 1,
    name: 'Saeid',
    role: 'Professional Salesman',
    dept: 'Bespoke Tailoring & VIP Accounts',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    notes: 'Handles Italian Super 150s-180s wool, bespoke fittings, VIP clients.'
  },
  {
    id: 2,
    name: 'Micheal',
    role: 'Salesman',
    dept: 'Showroom Floor & Customer Fittings',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    notes: 'Showroom alterations turnaround, custom lining selection.'
  },
  {
    id: 3,
    name: 'Mostafa',
    role: 'Salesman',
    dept: 'Retail Suits & Ready-to-Wear Collections',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    notes: 'Off-the-rack inventory movement, seasonal blazers, accessories.'
  },
  {
    id: 4,
    name: 'Asadi',
    role: 'Accountant',
    dept: 'Fabric Mill Invoicing & Payroll Audits',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    notes: 'Fabric import tariffs, tailor piece-rate compensations, monthly cashflow.'
  }
];

let factsData = [
  { id: 1, employeeId: 1, factText: 'Saeid closed a 5-suit bespoke deal with the private diplomatic mission ($7,200 / 1.251B Tomans).', category: 'performance', createdAt: '2026-08-28 14:30' },
  { id: 2, employeeId: 1, factText: 'Requested new fabric swatches from Biella mill (Super 160s dark navy).', category: 'client_fitting', createdAt: '2026-08-29 11:15' },
  { id: 3, employeeId: 2, factText: 'Micheal coordinated with the master tailor to expedite 4 tuxedo alterations for weekend gala.', category: 'performance', createdAt: '2026-08-27 16:45' },
  { id: 4, employeeId: 3, factText: 'Mostafa exceeded weekly ready-to-wear blazer quota by 15%.', category: 'performance', createdAt: '2026-08-29 18:20' },
  { id: 5, employeeId: 4, factText: 'Asadi reconciled all raw wool import payments with zero discrepancies for Q3.', category: 'financial', createdAt: '2026-08-30 10:00' }
];

let summariesData = [
  {
    id: 1,
    employeeId: 1,
    summaryText: `Role: Professional Salesman (Bespoke Tailoring & VIP Accounts)
Recent updates: Closed 5 bespoke suits with diplomatic mission (1.251B Tomans). Requested Biella mill navy swatches.
Performance: High tier. Exceeding bespoke targets.
Project: VIP Autumn Executive Wardrobing Campaign.
Salary: Base + 6% Bespoke Commission.
Strengths: Impeccable fitting precision, high client loyalty.
Risks: European fabric shipment delays.
Recommended actions: Provide preview access to new Huddersfield flannel collection.`,
    modelUsed: 'Hermes-Agent (markova_workspace)',
    createdAt: '2026-08-29 17:00'
  }
];

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

// SYSTEM PROMPT
const BRAND_SYSTEM_PROMPT = `You are MARKOVA AI, the private AI Chief of Staff and strategic executive advisor to Nima Changizi, CEO of MARKOVA (a luxury bespoke suit and tailoring house), engineered by NEXURA AI Lab.

Key Directives:
1. Address Nima Changizi with professional brevity, clarity, and intelligence.
2. Keep responses direct and concise. Use clear, simple language without unnecessary explanations.
3. You have full awareness of showroom sales metrics (Total: 38.12 Billion Tomans / 381.2 Billion Rials across 168 orders, 88 days, 72.1% revenue from bespoke) and staff intelligence (Saeid, Micheal, Mostafa, Asadi).
4. If asked to generate a summary for any staff member, follow the 8-point schema:
Role:
Recent updates:
Performance:
Project:
Salary:
Strengths:
Risks:
Recommended actions:
(Use 'No data available' for missing fields; use 'None needed at this time' if no action is required).`;

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

// Direct Executive Chat
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;

    const allFactsSummary = employeesData.map(e => {
      const fList = factsData.filter(f => f.employeeId === e.id).map(f => f.factText).join('; ');
      return `${e.name} (${e.role}): ${fList || 'No updates'}`;
    }).join('\n');

    const promptWithContext = `[STAFF KNOWLEDGE BASE]:
${allFactsSummary}

[SHOWROOM FINANCIAL CONTEXT]:
${latestBusinessAnalysis}

[MESSAGE FROM CEO NIMA CHANGIZI]:
${message}`;

    const ai = getAIClient();
    if (!ai) {
      const fallbackReply = `Good morning, Nima. MARKOVA AI is online in local memory mode. We are tracking 38.12 Billion Tomans across 168 orders and your 4 staff members (Saeid, Micheal, Mostafa, Asadi). Configure GEMINI_API_KEY in Settings for live cloud generative intelligence.`;
      return res.json({
        reply: fallbackReply,
        source: 'Hermes Workspace Memory'
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: promptWithContext,
      config: {
        systemInstruction: BRAND_SYSTEM_PROMPT,
        temperature: 0.3,
        maxOutputTokens: 1000
      }
    });

    res.json({
      reply: response.text || 'I have analyzed your request and updated the workspace memory.',
      source: 'Hermes Workspace'
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: error.message || 'Internal AI router error',
      reply: `⚠️ Error during AI inference: ${error.message || 'Unknown error'}. Falling back to cached memory.`,
      source: 'Local Memory'
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

    const prompt = `Perform a high-level strategic business audit and revenue structure analysis for CEO Nima Changizi.
Analyze the following hard numbers:
${businessMetricsContext}

Provide a concise executive breakdown covering:
1. Revenue Concentration & Bespoke Efficiency (72.1% revenue from 50% transactions)
2. Daily Cashflow Stability (Avg 433.2M vs Median 327M Tomans)
3. Actionable Strategic Takeaways for Q4 inventory and salesman incentives.
Keep the tone executive, direct, and free of filler words.`;

    const ai = getAIClient();
    let analysisText = '';
    let modelName = 'Gemini 2.0 Flash (Specialized Business Model)';

    if (ai) {
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
        config: {
          systemInstruction: BRAND_SYSTEM_PROMPT,
          temperature: 0.2
        }
      });
      analysisText = response.text || 'Business analysis generated.';
    } else {
      modelName = 'Hermes Local Engine (LiteLLM Offline)';
      analysisText = `1. Revenue Concentration: High efficiency in bespoke suits. While representing only 50% of volume, they generate 72.1% (27.48B Tomans) of gross sales.
2. Daily Cashflow: Average daily sales of 433.2M Tomans vs Median of 327M indicates strong upside driven by periodic high-ticket VIP orders (e.g. 1.251B single deal).
3. Strategic Takeaways: Increase Super 150s fabric allocation and adjust ready-to-wear salesmen incentives to cross-sell bespoke upgrades.`;
    }

    // Persist into Hermes memory
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

// Generate Summary
app.post('/api/generate-summary', async (req, res) => {
  try {
    const { employeeId } = req.body;
    const emp = employeesData.find(e => e.id === Number(employeeId));
    if (!emp) return res.status(404).json({ error: 'Employee not found' });

    const empFacts = factsData.filter(f => f.employeeId === emp.id).map(f => `- ${f.factText}`).join('\n');

    const prompt = `Generate an executive intelligence summary for ${emp.name} (${emp.role}, ${emp.dept}) at MARKOVA for CEO Nima Changizi.
Here are recent factual records from memory:
${empFacts || 'No specific logged notes.'}

Format STRICTLY using this exact schema:
Role:
Recent updates:
Performance:
Project:
Salary:
Strengths:
Risks:
Recommended actions:

(Use 'No data available' for missing fields; use 'None needed at this time' for Recommended actions if no immediate action is required.)`;

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
      summaryOutput = response.text || 'No data generated.';
    } else {
      summaryOutput = `Role: ${emp.role} (${emp.dept})
Recent updates: ${factsData.filter(f => f.employeeId === emp.id).map(f => f.factText).join('; ') || 'No data available'}
Performance: High standard execution on showroom targets.
Project: Autumn Bespoke & RTW Collection.
Salary: Executive Base + Bespoke Commission.
Strengths: High dedication, showroom relationship management.
Risks: European fabric supply chain lead times.
Recommended actions: None needed at this time.`;
    }

    const newSummary = {
      id: Date.now(),
      employeeId: emp.id,
      summaryText: summaryOutput,
      modelUsed: ai ? 'Hermes-Agent (Gemini 2.0 Flash)' : 'Hermes-Agent (Workspace Memory)',
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
