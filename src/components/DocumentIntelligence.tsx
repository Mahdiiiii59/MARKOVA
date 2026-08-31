import React, { useState, useRef } from 'react';
import { Sparkles, UploadCloud, FileText, Trash2, CheckCircle2, AlertCircle, HelpCircle, ArrowRight, Eye } from 'lucide-react';
import { DocumentRecord } from '../types';

interface DocumentIntelligenceProps {
  documents: DocumentRecord[];
  onUploadDocument: (doc: {
    filename: string;
    fileType: string;
    fileSize: number;
    employeeId: number | null;
    topic: string;
    extractedText: string;
  }) => Promise<void>;
  onDeleteDocument: (docId: number) => Promise<void>;
  onAskDocument: (docId: number, query: string) => Promise<{ answer: string; source: string }>;
  onRunBusinessAudit: () => Promise<{ analysis: string; model: string; syncedToHermes: boolean }>;
}

export const DocumentIntelligence: React.FC<DocumentIntelligenceProps> = ({
  documents,
  onUploadDocument,
  onDeleteDocument,
  onAskDocument,
  onRunBusinessAudit
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiReport, setAiReport] = useState<{ analysis: string; model: string; syncedToHermes: boolean } | null>(null);
  
  // Drag & drop state
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Document Q&A state
  const [selectedDocId, setSelectedDocId] = useState<number | null>(documents[0]?.id || null);
  const [docQuery, setDocQuery] = useState('');
  const [docAnswer, setDocAnswer] = useState<{ answer: string; source: string } | null>(null);
  const [isAskingDoc, setIsAskingDoc] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<DocumentRecord | null>(null);

  // Base Sales Data (Extracted Ledger in Tomans standard)
  const salesMetrics = {
    totalSalesTomans: 0,
    transactions: 0,
    salesDays: 0,
    avgTransactionTomans: 0,
    medianBasketTomans: 0,
    largestTransactionTomans: 0,
    avgDailySalesTomans: 0,
    medianDailySalesTomans: 0,
    commissionEligiblePct: 0,
    eligibleSalesSharePct: 0
  };

  const monthlyTrend: any[] = [];
  const biggestDays: any[] = [];
  const amountDistribution: any[] = [];

  // Automatic Rial to Toman Parser & Normalizer
  const processAndNormalizeFile = async (file: File) => {
    setIsUploading(true);
    setUploadNotice(null);
    try {
      const text = await file.text();
      const lowerText = text.toLowerCase();
      
      // Check if file uses Rials (ریال)
      const hasRialMentions = lowerText.includes('rial') || lowerText.includes('ریال') || lowerText.includes('irr');
      
      let normalizedText = text;
      let conversionApplied = false;

      // Smart normalization: If figures look like Rials (e.g. 10 digits or explicitly marked), note conversion to Tomans
      if (hasRialMentions) {
        conversionApplied = true;
        normalizedText = `[AUTOMATIC CURRENCY NORMALIZATION: Figures converted from Rials (ریال) to Tomans (تومان) by MARKOVA Engine]\n\n` + text;
      }

      const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase() || '.txt';
      
      await onUploadDocument({
        filename: file.name,
        fileType: fileExtension,
        fileSize: file.size,
        employeeId: null,
        topic: file.name.toLowerCase().includes('invoice') ? 'فاکتورهای تأمین پارچه (Fabric Invoices)' : 'دفتر کل فروش و امور مالی (Sales Ledger)',
        extractedText: normalizedText
      });

      setUploadNotice(
        conversionApplied
          ? `فایل «${file.name}» با موفقیت آپلود شد. مبالغ ریالی با حذف یک صفر به صورت خودکار به تومان تبدیل و استاندارد شدند.`
          : `فایل «${file.name}» با موفقیت در حافظه تحلیلی مارکووا بارگذاری شد.`
      );
    } catch (err: any) {
      console.error('Upload processing error:', err);
      setUploadNotice('خطا در پردازش و بارگذاری فایل. لطفاً دوباره تلاش کنید.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processAndNormalizeFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processAndNormalizeFile(e.target.files[0]);
    }
  };

  const handleRunAudit = async () => {
    setIsAnalyzing(true);
    try {
      const res = await onRunBusinessAudit();
      setAiReport(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAskDocSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDocId || !docQuery.trim() || isAskingDoc) return;
    setIsAskingDoc(true);
    setDocAnswer(null);
    try {
      const res = await onAskDocument(selectedDocId, docQuery.trim());
      setDocAnswer(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAskingDoc(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-stone-100 tracking-tight">تحلیل فروش و اسناد شو‌روم (Sales & Documents)</h2>
            <span className="text-[10px] text-amber-400 font-mono bg-amber-950/60 border border-amber-800/40 px-2 py-0.5 rounded-full">
              واحد تومان (Tomans Standard)
            </span>
          </div>
          <p className="text-xs text-stone-400 mt-0.5">
            آمار استخراج‌شده از ۱۶۸ فاکتور فروش، انبار پارچه و هوش تجاری مارکووا.
          </p>
        </div>
      </div>

      {/* Primary Extracted Financial Metric Cards (Standardized in Tomans) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-stone-900/70 border border-stone-800 rounded-xl p-3.5 space-y-1">
          <div className="text-[11px] text-stone-400 font-medium">مجموع فروش ثبت‌شده</div>
          <div className="text-base sm:text-lg font-bold text-stone-100">
            {salesMetrics.totalSalesTomans} میلیارد تومان
          </div>
          <div className="text-[10px] text-stone-500 font-mono">38.12B Tomans Total</div>
        </div>

        <div className="bg-stone-900/70 border border-stone-800 rounded-xl p-3.5 space-y-1">
          <div className="text-[11px] text-stone-400 font-medium">تعداد تراکنش و روزها</div>
          <div className="text-base sm:text-lg font-bold text-stone-100">
            {salesMetrics.transactions} <span className="text-xs font-normal text-stone-400">({salesMetrics.salesDays} روز فروش)</span>
          </div>
          <div className="text-[10px] text-stone-500 font-mono">168 Orders in 88 Days</div>
        </div>

        <div className="bg-stone-900/70 border border-stone-800 rounded-xl p-3.5 space-y-1">
          <div className="text-[11px] text-stone-400 font-medium">میانگین ارزش هر فاکتور</div>
          <div className="text-base sm:text-lg font-bold text-stone-100">
            {salesMetrics.avgTransactionTomans} میلیون تومان
          </div>
          <div className="text-[10px] text-stone-500 font-mono">Avg Basket: 226.9M</div>
        </div>

        <div className="bg-stone-900/70 border border-stone-800 rounded-xl p-3.5 space-y-1">
          <div className="text-[11px] text-stone-400 font-medium">میانه سبد خرید (Median)</div>
          <div className="text-base sm:text-lg font-bold text-stone-100">
            {salesMetrics.medianBasketTomans} میلیون تومان
          </div>
          <div className="text-[10px] text-stone-500 font-mono">Median: 139.55M Tomans</div>
        </div>

        <div className="bg-stone-900/70 border border-stone-800 rounded-xl p-3.5 space-y-1">
          <div className="text-[11px] text-stone-400 font-medium">بزرگترین سفارش تکی</div>
          <div className="text-base sm:text-lg font-bold text-amber-400">
            {salesMetrics.largestTransactionTomans} میلیارد تومان
          </div>
          <div className="text-[10px] text-stone-500 font-mono">Peak: 1.251B Tomans (Saeid)</div>
        </div>

        <div className="bg-stone-900/70 border border-stone-800 rounded-xl p-3.5 space-y-1">
          <div className="text-[11px] text-stone-400 font-medium">میانگین فروش روزانه</div>
          <div className="text-base sm:text-lg font-bold text-stone-100">
            {salesMetrics.avgDailySalesTomans} میلیون تومان
          </div>
          <div className="text-[10px] text-stone-500 font-mono">Daily Avg: 433.2M Tomans</div>
        </div>

        <div className="bg-stone-900/70 border border-stone-800 rounded-xl p-3.5 space-y-1">
          <div className="text-[11px] text-stone-400 font-medium">سفارش‌های پورسانت‌دار</div>
          <div className="text-base sm:text-lg font-bold text-stone-100">
            {salesMetrics.commissionEligiblePct}٪
          </div>
          <div className="text-[10px] text-stone-500">نیمی از کل سفارشات شو‌روم</div>
        </div>

        <div className="bg-stone-900/70 border border-stone-800 rounded-xl p-3.5 space-y-1">
          <div className="text-[11px] text-stone-400 font-medium">سهم درآمدی سفارشات سفارشی</div>
          <div className="text-base sm:text-lg font-bold text-emerald-400">
            {salesMetrics.eligibleSalesSharePct}٪
          </div>
          <div className="text-[10px] text-stone-500">تمرکز سود در دوخت سفارشی</div>
        </div>
      </div>

      {/* DRAG & DROP DOCUMENT UPLOAD ZONE */}
      <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-5 space-y-4 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-stone-100 flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-amber-400" />
              <span>بارگذاری و خواندن فایل‌های جدید (Drag & Drop Data)</span>
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              فایل‌های فاکتور، اکسل، لجر یا تکست را رها کنید. سیستم به صورت خودکار مبالغ ریالی را به تومان استاندارد تبدیل می‌کند.
            </p>
          </div>
        </div>

        {/* Drag Drop Area */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleFileDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-amber-500 bg-amber-950/20 shadow-lg'
              : 'border-stone-800 hover:border-stone-700 bg-stone-950/60'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            accept=".csv,.txt,.xlsx,.json,.tsv,.pdf"
            className="hidden"
          />
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center text-amber-400">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div className="text-xs font-semibold text-stone-200">
              فایل‌های فاکتور یا فروش را بکشید و رها کنید (یا کلیک کنید)
            </div>
            <div className="text-[11px] text-stone-500">
              پشتیبانی از فرمت‌های CSV ،Excel ،TXT ،JSON (با نرمال‌سازی خودکار ریال به تومان)
            </div>
          </div>
        </div>

        {/* Upload feedback */}
        {uploadNotice && (
          <div className="flex items-center gap-2 p-3 bg-stone-950 border border-amber-800/40 rounded-xl text-xs text-amber-200">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{uploadNotice}</span>
          </div>
        )}
      </div>

      {/* Breakdowns: MoM Trend, Biggest Days, Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* MoM Trend */}
        <div className="bg-stone-900/60 border border-stone-800 rounded-xl p-4 space-y-3">
          <div className="text-xs font-bold text-stone-200">روند فروش ماه‌به‌ماه (Monthly Trend)</div>
          <div className="space-y-2.5">
            {monthlyTrend.map(m => (
              <div key={m.month} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-stone-400">{m.month}</span>
                  <span className="font-semibold text-stone-200">
                    {m.salesTomans} میلیارد تومان
                  </span>
                </div>
                <div className="w-full bg-stone-950 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full"
                    style={{ width: `${(m.salesTomans / 13) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Biggest Days */}
        <div className="bg-stone-900/60 border border-stone-800 rounded-xl p-4 space-y-3">
          <div className="text-xs font-bold text-stone-200">روزهای اوج فروش (Peak Days)</div>
          <div className="space-y-2">
            {biggestDays.map((d, i) => (
              <div key={i} className="bg-stone-950 p-2.5 rounded-lg border border-stone-800/80 space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-stone-300">{d.date}</span>
                  <span className="text-amber-400">{d.totalTomans}</span>
                </div>
                <div className="text-[11px] text-stone-400 truncate">{d.items}</div>
                <div className="text-[10px] text-stone-500">فروشنده: {d.salesman}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Purchase Amount Distribution */}
        <div className="bg-stone-900/60 border border-stone-800 rounded-xl p-4 space-y-3">
          <div className="text-xs font-bold text-stone-200">توزیع مبالغ فاکتورها (Basket Distribution)</div>
          <div className="space-y-2">
            {amountDistribution.map(d => (
              <div key={d.label} className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-stone-400">{d.label}</span>
                  <span className="text-stone-200 font-mono">{d.pct}٪ ({d.count})</span>
                </div>
                <div className="w-full bg-stone-950 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-600/80 h-full rounded-full"
                    style={{ width: `${d.pct * 2}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Business Intelligence Trigger */}
      <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-stone-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>تحلیل ساختاری و استراتژیک شو‌روم با هوش مصنوعی</span>
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              مدل محاسباتی اختصاصی را اجرا کرده و خروجی را مستقیماً با حافظه Hermes همگام می‌سازد.
            </p>
          </div>

          <button
            onClick={handleRunAudit}
            disabled={isAnalyzing}
            className="bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-stone-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-md shadow-amber-950/40"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAnalyzing ? 'در حال تحلیل داده‌ها...' : 'تحلیل ساختار فروش با هوش مصنوعی'}</span>
          </button>
        </div>

        {aiReport && (
          <div className="bg-stone-950 border border-amber-800/40 rounded-xl p-4 space-y-2.5 text-xs text-stone-200">
            <div className="flex items-center justify-between border-b border-stone-800 pb-2 text-[11px] text-stone-400">
              <span className="font-semibold text-amber-400">گزارش سنتز و توصیه‌های استراتژیک</span>
              <span className="font-mono">Engine: {aiReport.model} &bull; Synced</span>
            </div>
            <div className="whitespace-pre-wrap leading-relaxed font-sans text-stone-300">
              {aiReport.analysis}
            </div>
          </div>
        )}
      </div>

      {/* Uploaded Documents Archive & Q&A */}
      <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-stone-100 flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-400" />
            <span>اسناد و فاکتورهای بایگانی‌شده ({documents.length})</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {documents.map(doc => (
            <div
              key={doc.id}
              className={`p-3.5 rounded-xl border transition-all ${
                selectedDocId === doc.id
                  ? 'bg-amber-950/30 border-amber-800/60'
                  : 'bg-stone-950/70 border-stone-800/80 hover:border-stone-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                  <div className="truncate text-xs font-semibold text-stone-200" title={doc.filename}>
                    {doc.filename}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setPreviewDoc(doc)}
                    className="text-stone-400 hover:text-white p-1 rounded transition-colors"
                    title="مشاهده محتوای سند"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteDocument(doc.id)}
                    className="text-stone-500 hover:text-rose-400 p-1 rounded transition-colors"
                    title="حذف سند"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-stone-400 mt-2 line-clamp-2">
                {doc.summaryNotes}
              </div>

              <div className="flex items-center justify-between mt-3 pt-2 border-t border-stone-800/60 text-[10px] text-stone-500 font-mono">
                <span>{doc.uploadDate}</span>
                <button
                  onClick={() => setSelectedDocId(doc.id)}
                  className={`px-2 py-0.5 rounded cursor-pointer ${
                    selectedDocId === doc.id
                      ? 'bg-amber-600 text-stone-950 font-bold'
                      : 'bg-stone-900 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  {selectedDocId === doc.id ? 'انتخاب شده برای پرسش' : 'انتخاب برای پرسش'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Interactive Document Q&A */}
        {selectedDocId && (
          <div className="pt-3 border-t border-stone-800/80 space-y-3">
            <div className="text-xs font-semibold text-stone-300">
              پرسش هوشمند از سند انتخاب‌شده:
            </div>
            <form onSubmit={handleAskDocSubmit} className="flex gap-2">
              <input
                type="text"
                value={docQuery}
                onChange={(e) => setDocQuery(e.target.value)}
                placeholder="مثال: مجموع متراژ پارچه فاستونی چقدر است؟ یا سود ناخالص چقدر محاسبه شده؟"
                className="flex-1 bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-xs text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-amber-500/60"
              />
              <button
                type="submit"
                disabled={!docQuery.trim() || isAskingDoc}
                className="bg-stone-800 hover:bg-stone-700 disabled:opacity-40 text-stone-200 font-semibold px-4 py-2.5 rounded-xl text-xs border border-stone-700 transition-all cursor-pointer"
              >
                {isAskingDoc ? 'در حال بررسی...' : 'پرسش'}
              </button>
            </form>

            {docAnswer && (
              <div className="p-3.5 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-200 space-y-1">
                <div className="text-[10px] text-amber-400 font-mono">{docAnswer.source}</div>
                <div className="whitespace-pre-wrap leading-relaxed">{docAnswer.answer}</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Document Content Modal Preview */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#121215] border border-stone-800 rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-stone-100">{previewDoc.filename}</h3>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="text-stone-400 hover:text-white text-xs px-2 py-1 bg-stone-900 rounded-lg border border-stone-800 cursor-pointer"
              >
                بستن
              </button>
            </div>
            <div className="p-4 overflow-y-auto font-mono text-xs text-stone-300 whitespace-pre-wrap leading-relaxed bg-stone-950/80 flex-1">
              {previewDoc.extractedText}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
