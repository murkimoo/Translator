import React, { useState } from 'react';
import { Star, StarOff, Trash2, Search, Clock, Languages } from 'lucide-react';
import { Translation } from '../types/translation';
import { useTranslationHistory } from '../hooks/useTranslationHistory';

interface TranslationHistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TranslationHistory: React.FC<TranslationHistoryProps> = ({
  isOpen,
  onClose,
}) => {
  const { history, toggleFavorite, deleteTranslation, clearHistory } = useTranslationHistory();
  const [activeTab, setActiveTab] = useState<'recent' | 'favorites'>('recent');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTranslations = (activeTab === 'recent' ? history.translations : history.favorites)
    .filter(translation => 
      translation.originalText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      translation.translatedText.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-4/5 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Translation History</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span className="sr-only">Close</span>
              ✕
            </button>
          </div>
          
          <div className="flex space-x-1 mb-4">
            <button
              onClick={() => setActiveTab('recent')}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                activeTab === 'recent'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Clock className="w-4 h-4 inline mr-2" />
              Recent ({history.translations.length})
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                activeTab === 'favorites'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Star className="w-4 h-4 inline mr-2" />
              Favorites ({history.favorites.length})
            </button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search translations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="overflow-y-auto max-h-96 p-6">
          {filteredTranslations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Languages className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg mb-2">No translations found</p>
              <p className="text-sm">
                {activeTab === 'recent' 
                  ? 'Start translating to see your history here'
                  : 'Star translations to add them to favorites'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTranslations.map((translation) => (
                <div
                  key={translation.id}
                  className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span className="text-lg">{translation.sourceLanguage.flag}</span>
                      <span>{translation.sourceLanguage.name}</span>
                      <span>→</span>
                      <span className="text-lg">{translation.targetLanguage.flag}</span>
                      <span>{translation.targetLanguage.name}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">
                        {formatDate(translation.timestamp)}
                      </span>
                      <button
                        onClick={() => toggleFavorite(translation.id)}
                        className={`p-1 rounded-full transition-colors ${
                          translation.isFavorite
                            ? 'text-yellow-500 hover:text-yellow-600'
                            : 'text-gray-400 hover:text-yellow-500'
                        }`}
                      >
                        {translation.isFavorite ? (
                          <Star className="w-4 h-4 fill-current" />
                        ) : (
                          <StarOff className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => deleteTranslation(translation.id)}
                        className="p-1 rounded-full text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-gray-900">
                      <strong>Original:</strong> {translation.originalText}
                    </div>
                    <div className="text-blue-900">
                      <strong>Translation:</strong> {translation.translatedText}
                    </div>
                    {translation.confidence && (
                      <div className="text-xs text-gray-500">
                        Confidence: {Math.round(translation.confidence * 100)}%
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {(history.translations.length > 0 || history.favorites.length > 0) && (
          <div className="p-6 border-t border-gray-200">
            <button
              onClick={clearHistory}
              className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Clear All History
            </button>
          </div>
        )}
      </div>
    </div>
  );
};