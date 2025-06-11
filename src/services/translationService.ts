import { Language } from '../types/translation';
import { languages } from '../data/languages';

// Real AI translation service using MyMemory API
export class TranslationService {
  private static instance: TranslationService;
  private readonly baseUrl = 'https://api.mymemory.translated.net/get';

  private constructor() {}

  static getInstance(): TranslationService {
    if (!TranslationService.instance) {
      TranslationService.instance = new TranslationService();
    }
    return TranslationService.instance;
  }

  async translate(text: string, sourceLanguage: Language, targetLanguage: Language): Promise<string> {
    try {
      // Don't translate if source and target are the same
      if (sourceLanguage.code === targetLanguage.code) {
        return text;
      }

      const sourceLang = sourceLanguage.code;
      const targetLang = targetLanguage.code;

      const url = `${this.baseUrl}?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Translation API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.responseStatus === 200 && data.responseData) {
        const translatedText = data.responseData.translatedText;
        
        // Check if translation actually happened (sometimes API returns same text)
        if (translatedText.toLowerCase().trim() === text.toLowerCase().trim()) {
          // Try alternative translation approach or return a clear indication
          return await this.fallbackTranslation(text, sourceLanguage, targetLanguage);
        }
        
        return translatedText;
      } else {
        throw new Error('Translation failed: Invalid response from API');
      }
    } catch (error) {
      console.error('Translation error:', error);
      
      // Fallback to a simple transformation to show something is happening
      if (error instanceof Error && error.message.includes('fetch')) {
        throw new Error('Translation service unavailable. Please check your internet connection.');
      }
      
      throw new Error('Translation failed. Please try again.');
    }
  }

  private async fallbackTranslation(text: string, sourceLanguage: Language, targetLanguage: Language): Promise<string> {
    // Try with Google Translate API as fallback
    try {
      const googleUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLanguage.code}&tl=${targetLanguage.code}&dt=t&q=${encodeURIComponent(text)}`;
      
      const response = await fetch(googleUrl);
      const data = await response.json();
      
      if (data && data[0] && data[0][0] && data[0][0][0]) {
        return data[0][0][0];
      }
    } catch (error) {
      console.error('Fallback translation failed:', error);
    }
    
    // If all else fails, return a clear indication that translation couldn't be performed
    return `[Translation from ${sourceLanguage.name} to ${targetLanguage.name} unavailable]`;
  }

  async detectLanguage(text: string): Promise<Language> {
    try {
      // First try the heuristic detection which is more reliable
      const heuristicResult = this.heuristicLanguageDetection(text);
      
      // If heuristic detection found a specific language (not English default), use it
      if (heuristicResult.code !== 'en' || this.isLikelyEnglish(text)) {
        return heuristicResult;
      }

      // Otherwise try API detection as backup
      const url = `${this.baseUrl}?q=${encodeURIComponent(text)}&langpair=auto|en`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        return heuristicResult;
      }

      const data = await response.json();
      
      if (data.responseStatus === 200 && data.responseData) {
        // For now, rely on heuristic detection as it's more accurate
        return heuristicResult;
      }
      
      return heuristicResult;
    } catch (error) {
      console.error('Language detection error:', error);
      return this.heuristicLanguageDetection(text);
    }
  }

  private isLikelyEnglish(text: string): boolean {
    const englishWords = /\b(the|and|or|but|in|on|at|to|for|of|with|by|from|up|about|into|over|after|is|are|was|were|be|been|being|have|has|had|do|does|did|will|would|could|should|may|might|can|must|shall|this|that|these|those|i|you|he|she|it|we|they|me|him|her|us|them|my|your|his|her|its|our|their|a|an|not|no|yes|hello|hi|thank|thanks|please|sorry|excuse|welcome)\b/gi;
    const matches = text.match(englishWords);
    return matches && matches.length > 0;
  }

  private isTransliteratedHindi(text: string): boolean {
    const lowerText = text.toLowerCase();
    
    // Common Hindi words written in English/Roman script
    const hindiWords = [
      // Greetings
      'namaste', 'namaskar', 'adaab', 'sat sri akal',
      // Common words
      'aap', 'tum', 'main', 'hum', 'kya', 'kaise', 'kaun', 'kahan', 'kab', 'kyun',
      'hai', 'hain', 'tha', 'thi', 'the', 'hoga', 'hogi', 'honge',
      'accha', 'theek', 'sahi', 'galat', 'bura', 'sundar', 'khushi', 'dukh',
      'paani', 'khana', 'ghar', 'school', 'kaam', 'paise', 'rupaye',
      'mata', 'pita', 'bhai', 'behen', 'beta', 'beti', 'dost', 'sahab',
      'dhanyawad', 'shukriya', 'maaf', 'sorry', 'please', 'kripaya',
      'haan', 'nahi', 'bilkul', 'shayad', 'zaroor', 'kabhi', 'hamesha',
      // Numbers
      'ek', 'do', 'teen', 'char', 'paanch', 'chhe', 'saat', 'aath', 'nau', 'das',
      // Time
      'subah', 'dopahar', 'shaam', 'raat', 'kal', 'aaj', 'parso',
      // Common phrases
      'kya haal', 'kaise ho', 'kya kar rahe', 'kahan ja rahe', 'kitna paisa',
      'bahut accha', 'bahut bura', 'thoda sa', 'zyada', 'kam', 'poora',
      // Verbs
      'jana', 'aana', 'khana', 'peena', 'sona', 'uthna', 'baithna', 'khada',
      'dekhna', 'sunna', 'bolna', 'kehna', 'samjhna', 'padhna', 'likhna',
      'khelna', 'hasna', 'rona', 'gaana', 'naachna', 'daudna', 'chalna'
    ];
    
    // Check for Hindi words
    for (const word of hindiWords) {
      if (lowerText.includes(word)) {
        return true;
      }
    }
    
    // Check for common Hindi patterns
    const hindiPatterns = [
      /\b\w+ji\b/g,           // Words ending with 'ji' (respectful suffix)
      /\b\w+wala\b/g,         // Words ending with 'wala'
      /\b\w+kar\b/g,          // Words ending with 'kar'
      /\bke\s+\w+\b/g,        // 'ke' followed by word
      /\bki\s+\w+\b/g,        // 'ki' followed by word
      /\bka\s+\w+\b/g,        // 'ka' followed by word
      /\bmein\s+\w+\b/g,      // 'mein' followed by word
      /\bse\s+\w+\b/g,        // 'se' followed by word
      /\bko\s+\w+\b/g,        // 'ko' followed by word
      /\brahe\s+hain\b/g,     // 'rahe hain' pattern
      /\braha\s+hai\b/g,      // 'raha hai' pattern
      /\bho\s+gaya\b/g,       // 'ho gaya' pattern
      /\bkar\s+diya\b/g,      // 'kar diya' pattern
    ];
    
    for (const pattern of hindiPatterns) {
      if (pattern.test(lowerText)) {
        return true;
      }
    }
    
    // Check for transliterated Devanagari sounds
    const devanagariSounds = [
      'bh', 'ch', 'dh', 'gh', 'jh', 'kh', 'ph', 'rh', 'sh', 'th', 'zh',
      'aa', 'ee', 'oo', 'ai', 'au', 'ri', 'ru'
    ];
    
    let soundCount = 0;
    for (const sound of devanagariSounds) {
      if (lowerText.includes(sound)) {
        soundCount++;
      }
    }
    
    // If multiple Devanagari sounds are present, likely Hindi
    return soundCount >= 2;
  }

  private heuristicLanguageDetection(text: string): Language {
    const lowerText = text.toLowerCase();
    
    // Check for transliterated Hindi first (before other checks)
    if (this.isTransliteratedHindi(text)) {
      return languages.find(l => l.code === 'hi')!;
    }
    
    // Hindi indicators (Devanagari script)
    if (/[अ-ह]/.test(text) || /[०-९]/.test(text)) {
      return languages.find(l => l.code === 'hi')!;
    }
    
    // Arabic indicators
    if (/[ا-ي]/.test(text) || /[٠-٩]/.test(text)) {
      return languages.find(l => l.code === 'ar')!;
    }
    
    // Russian indicators (Cyrillic)
    if (/[а-я]/.test(lowerText) || /[А-Я]/.test(text)) {
      return languages.find(l => l.code === 'ru')!;
    }
    
    // Japanese indicators
    if (/[ひらがなカタカナ一-龯]/.test(text)) {
      return languages.find(l => l.code === 'ja')!;
    }
    
    // Korean indicators
    if (/[가-힣]/.test(text)) {
      return languages.find(l => l.code === 'ko')!;
    }
    
    // Chinese indicators
    if (/[一-龯]/.test(text)) {
      return languages.find(l => l.code === 'zh')!;
    }
    
    // Spanish indicators
    if (/[¡¿ñáéíóúü]/.test(lowerText) || 
        /\b(el|la|los|las|un|una|de|del|en|con|por|para|que|es|son|está|están|hola|gracias|por favor)\b/.test(lowerText)) {
      return languages.find(l => l.code === 'es')!;
    }
    
    // French indicators
    if (/[àâäéèêëîïôöùûüÿç]/.test(lowerText) || 
        /\b(le|la|les|un|une|de|du|des|et|ou|avec|pour|que|est|sont|bonjour|merci|s'il vous plaît)\b/.test(lowerText)) {
      return languages.find(l => l.code === 'fr')!;
    }
    
    // German indicators
    if (/[äöüß]/.test(lowerText) || 
        /\b(der|die|das|ein|eine|und|oder|mit|für|dass|ist|sind|hallo|danke|bitte)\b/.test(lowerText)) {
      return languages.find(l => l.code === 'de')!;
    }
    
    // Italian indicators
    if (/[àèéìíîòóù]/.test(lowerText) || 
        /\b(il|la|lo|gli|le|un|una|di|del|della|e|o|con|per|che|è|sono|ciao|grazie|prego)\b/.test(lowerText)) {
      return languages.find(l => l.code === 'it')!;
    }
    
    // Portuguese indicators
    if (/[ãõáéíóúâêîôûàç]/.test(lowerText) || 
        /\b(o|a|os|as|um|uma|de|do|da|dos|das|e|ou|com|para|que|é|são|olá|obrigado|por favor)\b/.test(lowerText)) {
      return languages.find(l => l.code === 'pt')!;
    }
    
    // Default to English if no patterns match
    return languages.find(l => l.code === 'en')!;
  }
}