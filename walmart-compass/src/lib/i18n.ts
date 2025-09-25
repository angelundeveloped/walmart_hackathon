// Internationalization configuration and utilities
export const locales = ['en', 'es'] as const;
export type Locale = typeof locales[number];
export const defaultLocale: Locale = 'en';

// Dictionary type definition
export type Dictionary = {
  common: {
    loading: string;
    error: string;
    retry: string;
    cancel: string;
    save: string;
    close: string;
    back: string;
    next: string;
    done: string;
  };
  header: {
    title: string;
    subtitle: string;
    beta: string;
    uwbActive: string;
    aiReady: string;
  };
  map: {
    title: string;
    legend: string;
    preferences: string;
    simple: string;
    advanced: string;
    sections: string;
    dietary: string;
    brands: string;
    cart: string;
    items: string;
    route: string;
    anchors: string;
    services: string;
    checkout: string;
    direction: string;
    controls: string;
  };
  chat: {
    placeholder: string;
    send: string;
    thinking: string;
    error: string;
  };
  shopping: {
    title: string;
    empty: string;
    similar: string;
    remove: string;
    completed: string;
  };
  auth: {
    signIn: string;
    signOut: string;
    signInWithGoogle: string;
  };
  preferences: {
    title: string;
    mapDisplay: string;
    showItems: string;
    showRoute: string;
    showAnchors: string;
    showServices: string;
    dietaryPreferences: string;
    brandPreferences: string;
    organicPreference: string;
    preferOrganic: string;
  };
  footer: {
    description: string;
  };
};

// Dictionary loading function
export async function getDictionary(locale: Locale): Promise<Dictionary> {
  const dictionaries = {
    en: () => import('./dictionaries/en.json').then((module) => module.default),
    es: () => import('./dictionaries/es.json').then((module) => module.default),
  };
  
  return dictionaries[locale]();
}

// Locale detection utility
export function getLocaleFromHeaders(headers: Headers): Locale {
  const acceptLanguage = headers.get('accept-language') || '';
  const languages = acceptLanguage
    .split(',')
    .map(lang => lang.split(';')[0].trim())
    .map(lang => lang.split('-')[0]); // Extract language code (en, es)
  
  for (const lang of languages) {
    if (locales.includes(lang as Locale)) {
      return lang as Locale;
    }
  }
  
  return defaultLocale;
}
