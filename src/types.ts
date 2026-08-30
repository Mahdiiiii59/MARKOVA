export interface Employee {
  id: number;
  name: string;
  role: string;
  dept: string;
  avatar: string;
  notes: string;
  facts?: Fact[];
  summaries?: Summary[];
}

export interface Fact {
  id: number;
  employeeId: number;
  factText: string;
  category: 'general' | 'performance' | 'client_fitting' | 'salary_commission' | 'financial' | 'attendance';
  createdAt: string;
}

export interface Summary {
  id: number;
  employeeId: number;
  summaryText: string;
  modelUsed: string;
  createdAt: string;
}

export interface DocumentRecord {
  id: number;
  filename: string;
  fileType: string;
  fileSize: number;
  employeeId: number | null;
  employeeName: string;
  topic: string;
  extractedText: string;
  summaryNotes: string;
  uploadDate: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  source?: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  title: string;
  titleFa?: string;
  createdAt: string;
  messages: ChatMessage[];
}

export interface SalesAnalytics {
  totalSalesTomans: number; // in Tomans
  totalTransactions: number;
  salesDays: number;
  avgTransactionTomans: number;
  medianBasketTomans: number;
  largestTransactionTomans: number;
  avgDailySalesTomans: number;
  medianDailySalesTomans: number;
  commissionEligibleSharePct: number;
  eligibleSalesSharePct: number;
  monthlyTrend: { month: string; salesTomans: number; transactions: number }[];
  biggestDays: { date: string; salesTomans: number; orders: number; topItems: string }[];
  amountDistribution: { range: string; count: number; percentage: number }[];
}
