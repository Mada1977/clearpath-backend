const i18next = require('i18next');

const SUPPORTED_LANGS = ['en', 'fr', 'ko', 'es', 'ro', 'pt', 'ar', 'de', 'it', 'tr'];
const RTL_LANGS       = ['ar'];

i18next.init({
  initImmediate: false,
  lng: 'en',
  fallbackLng: 'en',
  resources: {
    en: { translation: require('../locales/en.json') },
    fr: { translation: require('../locales/fr.json') },
    ko: { translation: require('../locales/ko.json') },
    es: { translation: require('../locales/es.json') },
    ro: { translation: require('../locales/ro.json') },
    pt: { translation: require('../locales/pt.json') },
    ar: { translation: require('../locales/ar.json') },
    de: { translation: require('../locales/de.json') },
    it: { translation: require('../locales/it.json') },
    tr: { translation: require('../locales/tr.json') },
  },
  interpolation: { escapeValue: false },
});

function resolveLang(locale) {
  const lang = (locale || 'en').split('-')[0].toLowerCase();
  return SUPPORTED_LANGS.includes(lang) ? lang : 'en';
}

/**
 * Translate a key for a given locale string (e.g. "fr-FR", "ar-SA", "en-US").
 * Falls back to English for unsupported locales.
 */
function t(locale, key, options) {
  return i18next.t(key, { lng: resolveLang(locale), ...options });
}

/**
 * Returns metadata for a locale — used by the frontend for layout decisions.
 */
function getLocaleInfo(locale) {
  const lang = resolveLang(locale);
  return { lang, rtl: RTL_LANGS.includes(lang) };
}

module.exports = { t, getLocaleInfo, SUPPORTED_LANGS };
