export interface Employee {
  id: number;
  name: string;
  role: string;
  dept: string;
  avatar: string;
  notes: string;
  coachingAdvisor?: {
    motivationKey: string;
    riskMitigation: string;
    communicationStyle: string;
    growthTarget: string;
  };
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

export interface FashionStyle {
  id: string;
  name: string;
  category: 'bespoke_suit' | 'tuxedo' | 'overcoat' | 'smart_casual' | 'seasonal_flannel';
  description: string;
  fabricDetails: string;
  colorPalette: string[];
  sampleImages: string[]; // Base64 or image URLs
  createdAt: string;
}

export interface LookbookAnchor {
  id: string;
  title: string;
  poseDescription: string;
  cameraAngle: string;
  lightingVibe: string;
  imageUrl: string;
}

export interface GeneratedEditorial {
  id: string;
  prompt: string;
  aestheticCategory: string;
  imageUrl: string;
  createdAt: string;
  aspectRatio: string;
}

export interface TransferredFittingResult {
  id: string;
  basePostureImage: string;
  styleId: string;
  styleName: string;
  extractedVibePrompt: string;
  finalPrompt: string;
  generatedImageUrl: string;
  createdAt: string;
}

export interface LogoSettings {
  customLogoUrl: string | null;
  watermarkOpacity: number; // 0 to 1
  watermarkEnabled: boolean;
}

export interface ProviderDiagnostic {
  id: string;
  name: string;
  category: 'cloud_llm' | 'cloud_image' | 'local_engine';
  isConfigured: boolean;
  isReachable: boolean | null;
  latencyMs?: number;
  message?: string;
  models: { id: string; name: string; type: 'text' | 'fast_image' | 'quality_image' }[];
  requiresKey: boolean;
  keyMasked?: string;
  defaultBaseUrl?: string;
}

export interface ReservedEngineRouting {
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

export interface ApiKeysPayload {
  GAPGPT_API_KEY?: string;
  GAPGPT_BASE_URL?: string;
  GEMINI_API_KEY?: string;
  GROQ_API_KEY?: string;
  OPENROUTER_API_KEY?: string;
  FAL_KEY?: string;
  MLX_SERVER_URL?: string;
  OLLAMA_SERVER_URL?: string;
}

