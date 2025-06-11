import { useState, useCallback } from 'react';
import { Translation, Language } from '../types/translation';
import { TranslationService } from '../services/translationService';

export const useTranslation = () => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const translationService = TranslationService.getInstance();

  const translate = useCallback(async (
    text: string,
    sourceLanguage: Language,
    targetLanguage: Language
  ): Promise<Translation | null> => {
    if (!text.trim()) return null;

    setIsTranslating(true);
    setError(null);

    try {
      let actualSourceLanguage = sourceLanguage;
      let translatedText = '';

      // If source is auto-detect, we need to detect the language first
      if (sourceLanguage.code === 'auto') {
        // Detect the actual source language
        actualSourceLanguage = await translationService.detectLanguage(text);
        
        // If detected language is the same as target, no translation needed
        if (actualSourceLanguage.code === targetLanguage.code) {
          translatedText = text;
        } else {
          // Translate from detected language to target language
          translatedText = await translationService.translate(text, actualSourceLanguage, targetLanguage);
        }
      } else {
        // Direct translation from specified source to target
        if (sourceLanguage.code === targetLanguage.code) {
          translatedText = text;
        } else {
          translatedText = await translationService.translate(text, sourceLanguage, targetLanguage);
        }
      }
      
      const translation: Translation = {
        id: Date.now().toString(),
        originalText: text,
        translatedText,
        sourceLanguage: actualSourceLanguage,
        targetLanguage,
        timestamp: new Date(),
        isFavorite: false,
        confidence: 0.95 + Math.random() * 0.05, // Simulate confidence score
      };

      return translation;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Translation failed');
      return null;
    } finally {
      setIsTranslating(false);
    }
  }, [translationService]);

  return {
    translate,
    isTranslating,
    error,
    clearError: () => setError(null),
  };
};