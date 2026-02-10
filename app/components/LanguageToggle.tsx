'use client';
import { useLanguage } from '../context/LanguageContext';

export default function LanguageToggle() {
    const { language, setLanguage } = useLanguage();

    return (
        <div className="flex bg-gray-800/50 rounded-full p-1 border border-gray-700 backdrop-blur-sm">
            <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${language === 'en' ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' : 'text-gray-400 hover:text-gray-200'
                    }`}
            >
                EN
            </button>
            <button
                onClick={() => setLanguage('te')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${language === 'te' ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' : 'text-gray-400 hover:text-gray-200'
                    }`}
            >
                తెలుగు
            </button>
        </div>
    );
}
