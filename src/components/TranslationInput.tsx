import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, Copy, RotateCcw } from 'lucide-react';
import { Language } from '../types/translation';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

interface TranslationInputProps {
  text: string;
  onTextChange: (text: string) => void;
  language: Language;
  placeholder: string;
  isLoading?: boolean;
  readOnly?: boolean;
  onSpeak?: () => void;
  onCopy?: () => void;
}

export const TranslationInput: React.FC<TranslationInputProps> = ({
  text,
  onTextChange,
  language,
  placeholder,
  isLoading = false,
  readOnly = false,
  onSpeak,
  onCopy,
}) => {
  const { voiceState, startListening, stopListening, speak } = useSpeechRecognition();
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (voiceState.transcript && !readOnly) {
      onTextChange(voiceState.transcript);
    }
  }, [voiceState.transcript, onTextChange, readOnly]);

  const handleVoiceToggle = () => {
    if (voiceState.isListening) {
      stopListening();
    } else {
      const langCode = language.code === 'auto' ? 'en-US' : `${language.code}-${language.code.toUpperCase()}`;
      startListening(langCode);
    }
  };

  const handleSpeak = () => {
    if (text) {
      const langCode = language.code === 'auto' ? 'en-US' : `${language.code}-${language.code.toUpperCase()}`;
      speak(text, langCode);
    }
    onSpeak?.();
  };

  const handleCopy = async () => {
    if (text) {
      try {
        await navigator.clipboard.writeText(text);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy text:', error);
      }
    }
    onCopy?.();
  };

  const handleClear = () => {
    onTextChange('');
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700 flex items-center space-x-2">
          <span className="text-lg">{language.flag}</span>
          <span>{language.name}</span>
        </span>
        
        <div className="flex items-center space-x-2">
          {!readOnly && voiceState.isSupported && (
            <button
              onClick={handleVoiceToggle}
              className={`p-2 rounded-full transition-all duration-200 ${
                voiceState.isListening
                  ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={voiceState.isListening ? 'Stop listening' : 'Start voice input'}
            >
              {voiceState.isListening ? (
                <MicOff className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>
          )}
          
          {text && (
            <>
              <button
                onClick={handleSpeak}
                className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all duration-200"
                title="Speak text"
              >
                <Volume2 className="w-4 h-4" />
              </button>
              
              <button
                onClick={handleCopy}
                className={`p-2 rounded-full transition-all duration-200 ${
                  isCopied
                    ? 'bg-green-100 text-green-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={isCopied ? 'Copied!' : 'Copy text'}
              >
                <Copy className="w-4 h-4" />
              </button>
              
              {!readOnly && (
                <button
                  onClick={handleClear}
                  className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all duration-200"
                  title="Clear text"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
      
      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder={placeholder}
          readOnly={readOnly}
          className={`w-full h-32 p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
            readOnly 
              ? 'bg-gray-50 border-gray-200' 
              : 'bg-white border-gray-300 hover:border-blue-400'
          } ${
            language.rtl ? 'text-right' : 'text-left'
          }`}
          dir={language.rtl ? 'rtl' : 'ltr'}
        />
        
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
              <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
        
        {voiceState.isListening && !readOnly && (
          <div className="absolute bottom-2 right-2 flex items-center space-x-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span>Listening...</span>
          </div>
        )}
      </div>
      
      {voiceState.confidence > 0 && !readOnly && (
        <div className="mt-2 text-xs text-gray-500">
          Confidence: {Math.round(voiceState.confidence * 100)}%
        </div>
      )}
    </div>
  );
};