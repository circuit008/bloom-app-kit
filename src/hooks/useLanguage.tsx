import { createContext, useContext, useState, useEffect, useCallback } from "react";
import translations, { type Lang, type TranslationKey } from "@/i18n/translations";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  setLang: () => {},
  t: (key) => key,
});

function detectDefaultLang(): Lang {
  // Check browser language
  const browserLang = navigator.language?.toLowerCase();
  if (browserLang?.startsWith("fr")) return "fr";

  // Check timezone for Quebec
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (tz?.includes("Toronto") || tz?.includes("Montreal")) return "fr";

  return "en";
}

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem("preferred_language") as Lang;
    return saved === "fr" ? "fr" : saved === "en" ? "en" : detectDefaultLang();
  });

  // Load from profile
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("user_profiles")
        .select("preferred_language")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data?.preferred_language && (data.preferred_language === "en" || data.preferred_language === "fr")) {
        setLangState(data.preferred_language as Lang);
        localStorage.setItem("preferred_language", data.preferred_language);
      }
    })();
  }, [user]);

  const setLang = useCallback(async (newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem("preferred_language", newLang);
    if (user) {
      await supabase
        .from("user_profiles")
        .update({ preferred_language: newLang })
        .eq("user_id", user.id);
    }
  }, [user]);

  const t = useCallback((key: TranslationKey): string => {
    return translations[key]?.[lang] || key;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
