import React, { useState } from 'react';
import { MessageCircle, X, Volume2, Copy } from 'lucide-react';
import { Language, ConversationMode as ConversationModeType, ConversationMessage } from '../types/translation';
import { LanguageSelector } from './LanguageSelector';
import { useTranslation } from '../hooks/useTranslation';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

interface ConversationModeProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConversationMode: React.FC<ConversationModeProps> = ({
  isOpen,
  onClose,
}) => {
  const [conversationMode, setConversationMode] = useState<ConversationModeType>({
    isActive: false,
    language1: { code: 'en', name: 'English', flag: '🇺🇸' },
    language2: { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    messages: [],
  });
  
  const [inputText, setInputText] = useState('');
  const [currentSpeaker, setCurrentSpeaker] = useState<'user1' | 'user2'>('user1');
  const { translate, isTranslating } = useTranslation();
  const { speak } = useSpeechRecognition();

  const handleLanguageChange = (speaker: 'user1' | 'user2', language: Language) => {
    setConversationMode(prev => ({
      ...prev,
      [speaker === 'user1' ? 'language1' : 'language2']: language,
    }));
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const sourceLanguage = currentSpeaker === 'user1' ? conversationMode.language1 : conversationMode.language2;
    const targetLanguage = currentSpeaker === 'user1' ? conversationMode.language2 : conversationMode.language1;

    const translation = await translate(inputText, sourceLanguage, targetLanguage);
    
    if (translation) {
      const message: ConversationMessage = {
        id: Date.now().toString(),
        text: inputText,
        translatedText: translation.translatedText,
        language: sourceLanguage,
        timestamp: new Date(),
        speaker: currentSpeaker,
      };

      setConversationMode(prev => ({
        ...prev,
        messages: [...prev.messages, message],
      }));

      // Auto-speak the translation
      const langCode = targetLanguage.code === 'auto' ? 'en-US' : `${targetLanguage.code}-${targetLanguage.code.toUpperCase()}`;
      speak(translation.translatedText, langCode);
    }

    setInputText('');
  };

  const handleSpeakMessage = (text: string, language: Language) => {
    const langCode = language.code === 'auto' ? 'en-US' : `${language.code}-${language.code.toUpperCase()}`;
    speak(text, langCode);
  };

  const handleCopyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-4/5 overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
              <MessageCircle className="w-6 h-6 text-blue-500" />
              <span>Conversation Mode</span>
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <LanguageSelector
                selectedLanguage={conversationMode.language1}
                onLanguageChange={(lang) => handleLanguageChange('user1', lang)}
                label="Person 1 Language"
                excludeAuto
              />
            </div>
            <div>
              <LanguageSelector
                selectedLanguage={conversationMode.language2}
                onLanguageChange={(lang) => handleLanguageChange('user2', lang)}
                label="Person 2 Language"
                excludeAuto
              />
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {conversationMode.messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg mb-2">Start a conversation</p>
              <p className="text-sm">Type a message below to begin translating in real-time</p>
            </div>
          ) : (
            conversationMode.messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.speaker === 'user1' ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.speaker === 'user1'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-500 text-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs opacity-75">
                      {message.language.flag} {message.language.name}
                    </span>
                    <span className="text-xs opacity-75">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="font-medium">{message.text}</div>
                    <div className="text-sm opacity-90 border-t border-opacity-25 pt-2">
                      {message.translatedText}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-2">
                    <button
                      onClick={() => handleSpeakMessage(message.text, message.language)}
                      className="p-1 rounded-full hover:bg-black hover:bg-opacity-20 transition-colors"
                    >
                      <Volume2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleSpeakMessage(
                        message.translatedText,
                        message.speaker === 'user1' ? conversationMode.language2 : conversationMode.language1
                      )}
                      className="p-1 rounded-full hover:bg-black hover:bg-opacity-20 transition-colors"
                    >
                      <Volume2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleCopyMessage(message.text)}
                      className="p-1 rounded-full hover:bg-black hover:bg-opacity-20 transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => setCurrentSpeaker('user1')}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                currentSpeaker === 'user1'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {conversationMode.language1.flag} {conversationMode.language1.name}
            </button>
            <button
              onClick={() => setCurrentSpeaker('user2')}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                currentSpeaker === 'user2'
                  ? 'bg-gray-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {conversationMode.language2.flag} {conversationMode.language2.name}
            </button>
          </div>
          
          <div className="flex space-x-4">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={`Type in ${currentSpeaker === 'user1' ? conversationMode.language1.name : conversationMode.language2.name}...`}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isTranslating}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isTranslating}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isTranslating ? 'Translating...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};