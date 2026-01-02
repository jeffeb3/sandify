/* global localStorage, navigator */

import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import enTranslations from "./locales/en.json"
import zhTranslations from "./locales/zh.json"

// All available translations (add new languages here)
const translations = {
  en: enTranslations,
  zh: zhTranslations,
}

// Normalize language code (e.g., zh-CN → zh)
const normalizeLanguage = (lang) => {
  if (!lang) return null
  if (lang.startsWith("zh")) return "zh"

  return lang.split("-")[0]
}

// Detect language: localStorage > browser > default to English
const detectLanguage = () => {
  const saved = normalizeLanguage(localStorage.getItem("sandify-language"))
  if (saved && translations[saved]) return saved

  const browser = normalizeLanguage(navigator.language)
  if (browser && translations[browser]) return browser

  return "en"
}

const detectedLang = detectLanguage()

// Build resources - always include English for named key fallbacks
const resources = {
  en: { translation: enTranslations },
  ...(translations[detectedLang] && detectedLang !== "en"
    ? { [detectedLang]: { translation: translations[detectedLang] } }
    : {}),
}

// Initialize i18next with natural language keys pattern
// English strings are used as keys, other translations loaded on demand
i18n.use(initReactI18next).init({
  resources,
  lng: detectedLang,
  fallbackLng: "en",
  nsSeparator: false,
  keySeparator: false,
  interpolation: {
    escapeValue: false,
  },
  returnEmptyString: false,
  parseMissingKeyHandler: (key) => key,
})

export const changeLanguage = async (language) => {
  const lang = normalizeLanguage(language)

  // Add translations if available and not already loaded
  if (translations[lang] && !i18n.hasResourceBundle(lang, "translation")) {
    i18n.addResourceBundle(lang, "translation", translations[lang], true, true)
  }

  localStorage.setItem("sandify-language", lang)
  await i18n.changeLanguage(lang)
}

export default i18n
