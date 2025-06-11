import React, { useState, useEffect, useCallback } from 'react';
import { Languages, History, MessageCircle, ArrowRightLeft, Zap, Globe, Users, Volume2, X } from 'lucide-react';
interface Language {
  code: string;
  name: string;
}

interface TranslationResult {
  originalText: string;
  translatedText: string;
  sourceLanguage: Language;
  targetLanguage: Language;
  timestamp: string;
}

const languages: Language[] = [
  { code: 'auto', name: 'Auto-detect' },
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ru', name: 'Russian' },
  // Add more languages as needed
];

const LanguageSelector: React.FC<{
  selectedLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  label: string;
  excludeAuto?: boolean;
}> = ({ selectedLanguage, onLanguageChange, label, excludeAuto = false }) => {
  const availableLanguages = excludeAuto
    ? languages.filter((lang) => lang.code !== 'auto')
    : languages;

  return (
    <div>
      <label htmlFor={`language-select-${label}`} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        id={`language-select-${label}`}
        value={selectedLanguage.code}
        onChange={(e) => {
          const newLang = availableLanguages.find((lang) => lang.code === e.target.value);
          if (newLang) {
            onLanguageChange(newLang);
          }
        }}
        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
      >
        {availableLanguages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
};

const TranslationInput: React.FC<{
  text: string;
  onTextChange: (text: string) => void;
  language: Language;
  placeholder: string;
  readOnly?: boolean;
  isLoading?: boolean;
}> = ({ text, onTextChange, language, placeholder, readOnly = false, isLoading = false }) => {
  return (
    <div className="relative">
      <label htmlFor={`input-${language.code}`} className="block text-sm font-medium text-gray-700 mb-1">
        {language.name}
      </label>
      <textarea
        id={`input-${language.code}`}
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 resize-y min-h-[120px] max-h-[200px] text-gray-900 ${
          readOnly ? 'bg-gray-50' : 'bg-white'
        }`}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-md">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  );
};

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-auto overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-4 max-h-[calc(100vh-8rem)] overflow-y-auto">
          {children}
        </div>
        <div className="p-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const TranslationHistory: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  history: TranslationResult[];
}> = ({ isOpen, onClose, history }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Translation History">
      {history.length === 0 ? (
        <p className="text-gray-500">No translation history yet.</p>
      ) : (
        <ul className="space-y-4">
          {history.map((item, index) => (
            <li key={index} className="bg-gray-50 p-3 rounded-md border border-gray-100">
              <p className="text-sm font-medium text-gray-700">
                <span className="text-blue-600">{item.sourceLanguage.name}</span>: {item.originalText}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <span className="text-purple-600">{item.targetLanguage.name}</span>: {item.translatedText}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(item.timestamp).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
};

const ConversationMode: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Conversation Mode">
      <p className="text-gray-600">
        This is a placeholder for conversation mode. In a full implementation,
        this would allow two-way, real-time voice translation.
      </p>
      {/* Add your conversation mode UI and logic here */}
    </Modal>
  );
};


function App() {
  const [sourceLanguage, setSourceLanguage] = useState<Language>(languages[0]); // Auto-detect
  const [targetLanguage, setTargetLanguage] = useState<Language>(languages[1]); // English
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isConversationOpen, setIsConversationOpen] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [translationHistory, setTranslationHistory] = useState<TranslationResult[]>([]);


  const getLanguageNameByCode = (code: string) => {
    const lang = languages.find(l => l.code === code);
    return lang ? lang.name : code;
  };


  const callGeminiApi = useCallback(async (payload: any) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('API key not found. Please check your environment variables.');
    }
    
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (result.candidates && result.candidates.length > 0 &&
        result.candidates[0].content && result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0) {
      return result.candidates[0].content.parts[0].text;
    } else {
      console.error('Gemini API response structure unexpected:', result);
      throw new Error('Failed to get content from Gemini API.');
    }
  }, []);

  const detectLanguage = useCallback(async (text: string): Promise<string> => {
    const prompt = `Detect the language of the following text and respond with only the ISO 639-1 two-letter language code (e.g., 'en' for English, 'hi' for Hindi, 'fr' for French). If you cannot confidently detect it, respond with 'und' (undetermined).\n\nText: ${text}`;
    const payload = {
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    };
    const responseText = await callGeminiApi(payload);
    return responseText.trim().toLowerCase().slice(0, 2);
  }, [callGeminiApi]);

  const translateTextWithGemini = useCallback(async (text: string, sourceCode: string, targetCode: string): Promise<string> => {
    const sourceName = getLanguageNameByCode(sourceCode);
    const targetName = getLanguageNameByCode(targetCode);

    const prompt = `Translate the following text from ${sourceName} to ${targetName}:\n\n${text}`;
    const payload = {
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    };
    const responseText = await callGeminiApi(payload);
    return responseText;
  }, [callGeminiApi]);

  useEffect(() => {
    const performTranslation = async () => {
      if (!sourceText.trim()) {
        setTranslatedText('');
        setError(null);
        return;
      }

      setIsTranslating(true);
      setError(null);

      try {
        let actualSourceLanguage = sourceLanguage;
        if (sourceLanguage.code === 'auto') {
          const detectedCode = await detectLanguage(sourceText);
          const detectedLang = languages.find(lang => lang.code === detectedCode);
          if (detectedLang && detectedCode !== 'und') {
            actualSourceLanguage = detectedLang;
            console.log(`Detected language: ${actualSourceLanguage.name} (${actualSourceLanguage.code})`);
          } else {
            setError('Could not confidently auto-detect language. Please select it manually.');
            setIsTranslating(false);
            return;
          }
        }
        const translatedResult = await translateTextWithGemini(
          sourceText,
          actualSourceLanguage.code,
          targetLanguage.code
        );

        setTranslatedText(translatedResult);
        const newTranslation: TranslationResult = {
          originalText: sourceText,
          translatedText: translatedResult,
          sourceLanguage: actualSourceLanguage,
          targetLanguage: targetLanguage,
          timestamp: new Date().toISOString(),
        };
        setTranslationHistory((prevHistory) => [newTranslation, ...prevHistory]);

      } catch (err) {
        console.error('Translation process error:', err);
        setError('An error occurred during translation. Please try again.');
        setTranslatedText('');
      } finally {
        setIsTranslating(false);
      }
    };
    const timeoutId = setTimeout(performTranslation, 700); 
    return () => clearTimeout(timeoutId);
  }, [sourceText, sourceLanguage, targetLanguage, detectLanguage, translateTextWithGemini]);


  const handleSwapLanguages = () => {
    if (sourceLanguage.code !== 'auto') {
      const tempSourceLang = sourceLanguage;
      const tempTargetLang = targetLanguage;

      setSourceLanguage(tempTargetLang);
      setTargetLanguage(tempSourceLang);
      setSourceText(translatedText);
      setTranslatedText(sourceText);
      setError(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 font-inter">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Languages className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">AI Translator</h1>
                <p className="text-xs text-gray-500">Breaking language barriers worldwide</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsConversationOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Conversation</span>
              </button>
              
              <button
                onClick={() => setIsHistoryOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200"
              >
                <History className="w-4 h-4" />
                <span className="hidden sm:inline">History</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Translate Anything, Instantly
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Powered by advanced AI, our translator supports 30+ languages with real-time voice recognition, 
            conversation mode, and crystal-clear audio output.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 mt-8">
            <div className="flex items-center space-x-2 text-gray-600">
              <Zap className="w-5 h-5 text-blue-500" />
              <span className="text-sm">Instant Translation</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Volume2 className="w-5 h-5 text-green-500" />
              <span className="text-sm">Voice Recognition</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Globe className="w-5 h-5 text-purple-500" />
              <span className="text-sm">30+ Languages</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Users className="w-5 h-5 text-pink-500" />
              <span className="text-sm">Conversation Mode</span>
            </div>
          </div>
        </div>

        {/* Main Translation Interface */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-8">
            {/* Language Selectors */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div>
                <LanguageSelector
                  selectedLanguage={sourceLanguage}
                  onLanguageChange={setSourceLanguage}
                  label="From"
                />
              </div>
              
              <div className="flex items-end justify-center">
                <button
                  onClick={handleSwapLanguages}
                  disabled={sourceLanguage.code === 'auto' || isTranslating}
                  className={`p-3 rounded-full transition-all duration-200 ${
                    sourceLanguage.code === 'auto' || isTranslating
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-600 hover:scale-110 shadow-lg hover:shadow-xl'
                  }`}
                  title="Swap languages"
                >
                  <ArrowRightLeft className="w-5 h-5" />
                </button>
              </div>
              
              <div>
                <LanguageSelector
                  selectedLanguage={targetLanguage}
                  onLanguageChange={setTargetLanguage}
                  label="To"
                  excludeAuto
                />
              </div>
            </div>

            {/* Translation Inputs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <TranslationInput
                  text={sourceText}
                  onTextChange={setSourceText}
                  language={sourceLanguage}
                  placeholder="Enter text to translate..."
                  isLoading={sourceText.trim() !== '' && isTranslating && sourceLanguage.code === 'auto'}
                />
              </div>
              
              <div>
                <TranslationInput
                  text={translatedText}
                  onTextChange={() => {}} // Read-only
                  language={targetLanguage}
                  placeholder="Translation will appear here..."
                  readOnly
                  isLoading={isTranslating && sourceLanguage.code !== 'auto'}
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Features */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="text-sm text-gray-600">
                  <Volume2 className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                  <p className="font-medium">Voice Input</p>
                  <p className="text-xs">Speak naturally</p>
                </div>
                <div className="text-sm text-gray-600">
                  <Zap className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <p className="font-medium">Real-time</p>
                  <p className="text-xs">Instant results</p>
                </div>
                <div className="text-sm text-gray-600">
                  <Globe className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                  <p className="font-medium">30+ Languages</p>
                  <p className="text-xs">Global coverage</p>
                </div>
                <div className="text-sm text-gray-600">
                  <Users className="w-8 h-8 mx-auto mb-2 text-pink-500" />
                  <p className="font-medium">Conversations</p>
                  <p className="text-xs">Two-way chat</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <TranslationHistory 
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={translationHistory}
      />
      
      <ConversationMode
        isOpen={isConversationOpen}
        onClose={() => setIsConversationOpen(false)}
      />
    </div>
  );
}

export default App;
