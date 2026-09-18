"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type SupportedLanguage = "en" | "hi" | "bn";

export interface LanguageInfo {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  short: string;
  flag: string;
}

export const LANGUAGES: Record<SupportedLanguage, LanguageInfo> = {
  en: {
    code: "en",
    name: "English",
    nativeName: "English",
    short: "EN",
    flag: "🇬🇧",
  },
  hi: {
    code: "hi",
    name: "Hindi",
    nativeName: "हिन्दी",
    short: "HI",
    flag: "🇮🇳",
  },
  bn: {
    code: "bn",
    name: "Bengali",
    nativeName: "বাংলা",
    short: "BN",
    flag: "🇮🇳",
  },
};

export const TRANSLATIONS: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    // Nav & Common
    "nav.home": "HOME",
    "nav.dashboard": "DASHBOARD",
    "nav.lent": "LENT",
    "nav.borrowed": "BORROWED",
    "nav.requests": "REQUESTS",
    "nav.notifications": "NOTIFICATIONS",
    "nav.selftrack": "SELF TRACK",
    "nav.profile": "PROFILE",
    "nav.settings": "SETTINGS",
    "nav.login": "LOGIN",
    "nav.logout": "SIGN OUT",
    "nav.back": "BACK",
    "nav.back_home": "BACK TO HOME",
    
    // Landing
    "hero.launch": "LAUNCH FLENDLY",
    "hero.how_it_works": "HOW IT WORKS",
    "hero.promise": "THE PROMISE",
    
    // Settings
    "settings.title": "SETTINGS // PREFERENCES",
    "settings.subtitle": "USER CONFIGURATION",
    "settings.appearance": "Appearance Mode",
    "settings.appearance_desc": "Choose your preferred light or dark theme palette.",
    "settings.language": "Language / भाषा / ভাষা",
    "settings.language_desc": "Choose your preferred language for navigation and workspace.",
    "settings.username": "Handle / Username",
    "settings.details": "Your Details",
    "settings.privacy": "Privacy & Visibility",
  },
  hi: {
    // Nav & Common
    "nav.home": "होम",
    "nav.dashboard": "डैशबोर्ड",
    "nav.lent": "उधार दिया",
    "nav.borrowed": "उधार लिया",
    "nav.requests": "अनुरोध",
    "nav.notifications": "सूचनाएं",
    "nav.selftrack": "निजी बहीखाता",
    "nav.profile": "प्रोफ़ाइल",
    "nav.settings": "सेटिंग्स",
    "nav.login": "लॉग इन",
    "nav.logout": "साइन आउट",
    "nav.back": "पीछे जाएं",
    "nav.back_home": "होम पर वापस जाएं",
    
    // Landing
    "hero.launch": "फ्लेंडली शुरू करें",
    "hero.how_it_works": "यह कैसे काम करता है",
    "hero.promise": "हमारा वादा",
    
    // Settings
    "settings.title": "सेटिंग्स // प्राथमिकताएं",
    "settings.subtitle": "उपयोगकर्ता कॉन्फ़िगरेशन",
    "settings.appearance": "दिखावट मोड",
    "settings.appearance_desc": "अपनी पसंदीदा लाइट या डार्क थीम चुनें।",
    "settings.language": "भाषा / Language / ভাষা",
    "settings.language_desc": "नेविगेशन और ऐप के लिए अपनी पसंदीदा भाषा चुनें।",
    "settings.username": "उपयोगकर्ता नाम / हैंडल",
    "settings.details": "आपका विवरण",
    "settings.privacy": "गोपनीयता और दृश्यता",
  },
  bn: {
    // Nav & Common
    "nav.home": "হোম",
    "nav.dashboard": "ড্যাশবোর্ড",
    "nav.lent": "ধার দেওয়া",
    "nav.borrowed": "ধার নেওয়া",
    "nav.requests": "অনুরোধ",
    "nav.notifications": "বিজ্ঞপ্তি",
    "nav.selftrack": "ব্যক্তিগত খাতা",
    "nav.profile": "প্রোফাইল",
    "nav.settings": "সেটিংস",
    "nav.login": "লগ ইন",
    "nav.logout": "সাইন আউট",
    "nav.back": "ফিরে যান",
    "nav.back_home": "হোমে ফিরে যান",
    
    // Landing
    "hero.launch": "ফ্লেন্ডলি শুরু করুন",
    "hero.how_it_works": "এটি কিভাবে কাজ করে",
    "hero.promise": "আমাদের অঙ্গীকার",
    
    // Settings
    "settings.title": "সেটিংস // পছন্দসমূহ",
    "settings.subtitle": "ব্যবহারকারী কনফিগারেশন",
    "settings.appearance": "থিম মোড",
    "settings.appearance_desc": "আপনার পছন্দের লাইট বা ডার্ক থিম প্যালেট নির্বাচন করুন।",
    "settings.language": "ভাষা / Language / भाषा",
    "settings.language_desc": "নেভিগেশন ও অ্যাপের জন্য আপনার পছন্দের ভাষা নির্বাচন করুন।",
    "settings.username": "ব্যবহারকারীর নাম / হ্যান্ডেল",
    "settings.details": "আপনার বিবরণ",
    "settings.privacy": "গোপনীয়তা ও দৃশ্যমানতা",
  },
};

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string, defaultText?: string) => string;
  languages: typeof LANGUAGES;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: (key, fallback) => fallback || key,
  languages: LANGUAGES,
});

const STORAGE_KEY = "flendly_language";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as SupportedLanguage | null;
      if (stored && (stored === "en" || stored === "hi" || stored === "bn")) {
        setLanguageState(stored);
      }
    } catch {
      // Ignore localStorage errors in SSR or restricted contexts
    }
    setMounted(true);
  }, []);

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
      document.cookie = `${STORAGE_KEY}=${lang}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {
      // Ignore storage errors
    }
  };

  const t = (key: string, defaultText?: string): string => {
    if (!mounted) return defaultText || key;
    return TRANSLATIONS[language]?.[key] || defaultText || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languages: LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
