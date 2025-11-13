
import React from 'react';
import { Language } from '../types';

interface LanguageSelectorProps {
  selectedLanguage: Language;
  onSelectLanguage: (language: Language) => void;
  isRecording: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ selectedLanguage, onSelectLanguage, isRecording }) => {
  const languages = [
    { code: Language.EN, name: 'English' },
    { code: Language.UR, name: 'Urdu (اردو)' },
  ];

  return (
    <div className="flex items-center justify-center space-x-2 my-4">
      {languages.map(({ code, name }) => (
        <button
          key={code}
          onClick={() => onSelectLanguage(code)}
          disabled={isRecording}
          className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
            ${selectedLanguage === code
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100'
            }
            ${isRecording ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {name}
        </button>
      ))}
    </div>
  );
};

export default LanguageSelector;
