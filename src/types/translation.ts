export interface Language {
  code: string;
  name: string;
  flag: string;
  rtl?: boolean;
}

export interface Translation {
  id: string;
  originalText: string;
  translatedText: string;
  sourceLanguage: Language;
  targetLanguage: Language;
  timestamp: Date;
  isFavorite: boolean;
  confidence?: number;
}

export interface TranslationHistory {
  translations: Translation[];
  favorites: Translation[];
}

export interface VoiceState {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  confidence: number;
}

export interface ConversationMode {
  isActive: boolean;
  language1: Language;
  language2: Language;
  messages: ConversationMessage[];
}

export interface ConversationMessage {
  id: string;
  text: string;
  translatedText: string;
  language: Language;
  timestamp: Date;
  speaker: 'user1' | 'user2';
}