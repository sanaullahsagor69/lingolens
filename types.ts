export interface MultilingualExample {
  language: string;
  phrase: string;
}

export interface SagorGlobalLink {
  language: string;
  phrase: string;
  context: string;
}

export interface TranslationResult {
  meaning: string;
  sourceNativeScript: string; // Renamed from nativeScript for clarity
  sourcePhoneticScript: string; // Renamed from phoneticScript
  targetScript: string; // New: Target Native Script
  targetPhonetic: string; // New: Target Phonetic
  culturalNuance: string; // English Insight
  culturalInsightTarget: string; // Target Language Insight
  inputLanguageSummary: string; // User's Guide (Input Language)
  intensity: number;
  equivalent: string;
  originalText: string;
  targetLanguage: string;
  detectedContext?: string;
  transcription?: string;
  sagorGlobalLink?: SagorGlobalLink;
  susInsight?: string;
}

export interface HistoryItem extends TranslationResult {
  id: string;
  timestamp: number;
}

export enum TargetLanguage {
  // Global Hub
  ENGLISH = 'English',
  CHINESE = 'Chinese (Simplified)',
  SPANISH = 'Spanish',
  FRENCH = 'French',
  PORTUGUESE = 'Portuguese',
  RUSSIAN = 'Russian',
  GERMAN = 'German',
  
  // Asia & Indo-Pacific
  HINDI = 'Hindi',
  BENGALI = 'Bengali',
  JAPANESE = 'Japanese',
  KOREAN = 'Korean',
  INDONESIAN = 'Indonesian',
  VIETNAMESE = 'Vietnamese',
  THAI = 'Thai',
  PUNJABI = 'Punjabi',
  TAMIL = 'Tamil',
  TELUGU = 'Telugu',
  MARATHI = 'Marathi',
  FILIPINO = 'Filipino (Tagalog)',
  
  // Middle East & Africa
  ARABIC = 'Arabic',
  PERSIAN = 'Persian (Farsi)',
  URDU = 'Urdu',
  SWAHILI = 'Swahili',
  
  // Digital/Europe
  DUTCH = 'Dutch',
  POLISH = 'Polish',
  ITALIAN = 'Italian',
  TURKISH = 'Turkish'
}

export type LoadingState = 'idle' | 'analyzing' | 'synthesizing' | 'error';