import { useState, useEffect, useCallback } from 'react';
import { Translation, TranslationHistory } from '../types/translation';

const STORAGE_KEY = 'translation-history';

export const useTranslationHistory = () => {
  const [history, setHistory] = useState<TranslationHistory>({
    translations: [],
    favorites: [],
  });

  useEffect(() => {
    const savedHistory = localStorage.getItem(STORAGE_KEY);
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        // Convert timestamp strings back to Date objects
        parsed.translations = parsed.translations.map((t: any) => ({
          ...t,
          timestamp: new Date(t.timestamp),
        }));
        parsed.favorites = parsed.favorites.map((t: any) => ({
          ...t,
          timestamp: new Date(t.timestamp),
        }));
        setHistory(parsed);
      } catch (error) {
        console.error('Failed to load translation history:', error);
      }
    }
  }, []);

  const saveHistory = useCallback((newHistory: TranslationHistory) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    } catch (error) {
      console.error('Failed to save translation history:', error);
    }
  }, []);

  const addTranslation = useCallback((translation: Translation) => {
    setHistory(prev => {
      const newHistory = {
        ...prev,
        translations: [translation, ...prev.translations.slice(0, 99)], // Keep only last 100
      };
      saveHistory(newHistory);
      return newHistory;
    });
  }, [saveHistory]);

  const toggleFavorite = useCallback((translationId: string) => {
    setHistory(prev => {
      const translation = prev.translations.find(t => t.id === translationId);
      if (!translation) return prev;

      const updatedTranslation = { ...translation, isFavorite: !translation.isFavorite };
      
      const newHistory = {
        translations: prev.translations.map(t => 
          t.id === translationId ? updatedTranslation : t
        ),
        favorites: updatedTranslation.isFavorite 
          ? [updatedTranslation, ...prev.favorites]
          : prev.favorites.filter(t => t.id !== translationId),
      };
      
      saveHistory(newHistory);
      return newHistory;
    });
  }, [saveHistory]);

  const deleteTranslation = useCallback((translationId: string) => {
    setHistory(prev => {
      const newHistory = {
        translations: prev.translations.filter(t => t.id !== translationId),
        favorites: prev.favorites.filter(t => t.id !== translationId),
      };
      saveHistory(newHistory);
      return newHistory;
    });
  }, [saveHistory]);

  const clearHistory = useCallback(() => {
    const newHistory = { translations: [], favorites: [] };
    setHistory(newHistory);
    saveHistory(newHistory);
  }, [saveHistory]);

  return {
    history,
    addTranslation,
    toggleFavorite,
    deleteTranslation,
    clearHistory,
  };
};