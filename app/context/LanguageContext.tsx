'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'te';

interface Translations {
    [key: string]: {
        en: string;
        te: string;
    };
}

export const translations: Translations = {
    // Home Page
    happyBirthday: {
        en: "Happy 25th Birthday Gnanu",
        te: "జ్ఞానుకు 25వ పుట్టినరోజు శుభాకాంక్షలు"
    },
    heroDescription: {
        en: "A quarter-century of moments—some loud, some quiet, all meaningful. This gallery is a reflection of the life I’ve lived and the memories that continue to guide me.",
        te: "పాతికేళ్ల క్షణాలు—కొన్ని శబ్దంతో కూడినవి, కొన్ని నిశ్శబ్దమైనవి, అన్నీ అర్థవంతమైనవి. ఈ గ్యాలరీ నేను గడిపిన జీవితానికి మరియు నాకు మార్గనిర్దేశం చేసే జ్ఞాపకాలకు ప్రతిబింబం."
    },
    viewGallery: {
        en: "View Gallery",
        te: "గ్యాలరీని చూడండి"
    },
    uploadMemories: {
        en: "Upload Memories",
        te: "జ్ఞాపకాలను అప్‌లోడ్ చేయండి"
    },

    // Gallery Page
    theGallery: {
        en: "The Gallery",
        te: "గ్యాలరీ"
    },
    gallerySubtitle: {
        en: "A premium collection of high-resolution memories.",
        te: "అధిక రిజల్యూషన్ జ్ఞాపకాల ప్రీమియం సేకరణ."
    },
    photos: {
        en: "Photos",
        te: "ఫోటోలు"
    },
    videos: {
        en: "Videos",
        te: "వీడియోలు"
    },
    viewFullScreen: {
        en: "View in Full Screen",
        te: "పూర్తి స్క్రీన్‌లో చూడండి"
    },
    noMedia: {
        en: "No {type} available yet.",
        te: "ఇంకా {type} అందుబాటులో లేవు."
    },
    admin: {
        en: "Admin",
        te: "అడ్మిన్"
    },
    adminAccess: {
        en: "Admin Access",
        te: "అడ్మిన్ యాక్సెస్"
    },
    password: {
        en: "Password",
        te: "పాస్‌వర్డ్"
    },
    enterPassword: {
        en: "Enter admin password",
        te: "అడ్మిన్ పాస్‌వర్డ్ నమోదు చేయండి"
    },
    login: {
        en: "Login",
        te: "లాగిన్"
    },
    adminDashboard: {
        en: "Admin Dashboard",
        te: "అడ్మిన్ డాష్‌బోర్డ్"
    },
    logout: {
        en: "Logout",
        te: "లాగ్ అవుట్"
    },
    uploadNewMemories: {
        en: "Upload New Memories",
        te: "కొత్త జ్ఞాపకాలను అప్‌లోడ్ చేయండి"
    },
    clickToSelect: {
        en: "Click to select or drag and drop files here",
        te: "ఫైల్‌లను ఎంచుకోవడానికి ఇక్కడ క్లిక్ చేయండి లేదా డ్రాగ్ అండ్ డ్రాప్ చేయండి"
    },
    filesSelected: {
        en: "{count} files selected",
        te: "{count} ఫైల్‌లు ఎంచుకోబడ్డాయి"
    },
    uploadFiles: {
        en: "Upload Files",
        te: "ఫైల్‌లను అప్‌లోడ్ చేయండి"
    },
    uploading: {
        en: "Uploading...",
        te: "అప్‌లోడ్ అవుతోంది..."
    },
    allRightsReserved: {
        en: "All rights reserved.",
        te: "అన్ని హక్కులు రిజర్వు చేయబడ్డాయి."
    },
    back: {
        en: "Back",
        te: "వెనుకకు"
    },
    startSlideshow: {
        en: "Start Slideshow",
        te: "స్లైడ్ షో ప్రారంభించండి"
    },
    stopSlideshow: {
        en: "Stop Slideshow",
        te: "స్లైడ్ షో ఆపండి"
    }
};

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string, params?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>('en');

    useEffect(() => {
        const savedLang = localStorage.getItem('language') as Language;
        if (savedLang) setLanguage(savedLang);
    }, []);

    const handleSetLanguage = (lang: Language) => {
        setLanguage(lang);
        localStorage.setItem('language', lang);
    };

    const t = (key: string, params?: Record<string, string>) => {
        let text = translations[key]?.[language] || key;
        if (params) {
            Object.entries(params).forEach(([k, v]) => {
                text = text.replace(`{${k}}`, v);
            });
        }
        return text;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
