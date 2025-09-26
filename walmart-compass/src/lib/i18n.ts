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
    yes: string;
    no: string;
    ok: string;
    processing: string;
    search: string;
    filter: string;
    clear: string;
    select: string;
    all: string;
    none: string;
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
    position: string;
    distance: string;
    closest: string;
    fromChat: string;
    itemDetails: string;
    location: string;
    units: string;
  };
  chat: {
    title: string;
    welcome: string;
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
    completedCount: string;
    addItem: string;
    findSimilar: string;
    noSimilarItems: string;
    similarItems: string;
    itemAdded: string;
    itemRemoved: string;
    itemCompleted: string;
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
  store: {
    sections: {
      produce: string;
      bakery: string;
      dairy: string;
      meat: string;
      frozen: string;
      pantry: string;
      beverages: string;
      health: string;
      household: string;
    };
    services: {
      mainEntrance: string;
      gardenCenter: string;
      checkout1: string;
      checkout2: string;
      checkout3: string;
      selfCheckout: string;
      pharmacy: string;
      customerService: string;
      moneyCenter: string;
    };
  };
  menu: {
    title: string;
    language: string;
    account: string;
    status: string;
    closeMenu: string;
  };
  navigation: {
    map: string;
    chat: string;
    list: string;
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

// Utility function to get translated store section name
export function getTranslatedSectionName(sectionKey: string, dictionary: Dictionary): string {
  const sectionMap: Record<string, keyof Dictionary['store']['sections']> = {
    'produce': 'produce',
    'bakery': 'bakery',
    'dairy': 'dairy',
    'meat': 'meat',
    'frozen': 'frozen',
    'pantry': 'pantry',
    'beverages': 'beverages',
    'health': 'health',
    'household': 'household',
    // Handle variations
    'meat & seafood': 'meat',
    'frozen foods': 'frozen',
    'pantry aisles': 'pantry',
    'health & beauty': 'health'
  };
  
  const normalizedKey = sectionKey.toLowerCase();
  const mappedKey = sectionMap[normalizedKey];
  
  if (mappedKey && dictionary.store.sections[mappedKey]) {
    return dictionary.store.sections[mappedKey];
  }
  
  // Fallback to original name if no translation found
  return sectionKey;
}

// Utility function to get translated service name
export function getTranslatedServiceName(serviceKey: string, dictionary: Dictionary): string {
  const serviceMap: Record<string, keyof Dictionary['store']['services']> = {
    'main entrance': 'mainEntrance',
    'garden center entrance': 'gardenCenter',
    'checkout lane 1': 'checkout1',
    'checkout lane 2': 'checkout2',
    'checkout lane 3': 'checkout3',
    'self checkout': 'selfCheckout',
    'pharmacy': 'pharmacy',
    'customer service': 'customerService',
    'money center': 'moneyCenter'
  };
  
  const normalizedKey = serviceKey.toLowerCase();
  const mappedKey = serviceMap[normalizedKey];
  
  if (mappedKey && dictionary.store.services[mappedKey]) {
    return dictionary.store.services[mappedKey];
  }
  
  // Fallback to original name if no translation found
  return serviceKey;
}
