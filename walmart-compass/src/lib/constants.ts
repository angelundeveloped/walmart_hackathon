// Shared constants for the Walmart Wavefinder application

export const SECTION_OPTIONS = [
  { id: 'dairy', name: 'Dairy', icon: '🥛' },
  { id: 'bakery', name: 'Bakery', icon: '🍞' },
  { id: 'produce', name: 'Produce', icon: '🥬' },
  { id: 'meat', name: 'Meat', icon: '🥩' },
  { id: 'frozen', name: 'Frozen', icon: '🧊' },
  { id: 'pantry', name: 'Pantry', icon: '🥫' },
  { id: 'beverages', name: 'Beverages', icon: '🥤' },
  { id: 'health', name: 'Health & Beauty', icon: '💄' },
  { id: 'household', name: 'Household', icon: '🧽' }
] as const;

export const DIETARY_OPTIONS = [
  'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free', 'Keto', 'Paleo', 'Low-Sodium'
] as const;

export const BRAND_OPTIONS = [
  'Great Value', 'Equate', "Parent's Choice", 'Marketside', "Sam's Choice", 'Mainstays'
] as const;

// Walmart brand colors
export const WALMART_COLORS = {
  BLUE: '#0071CE',
  YELLOW: '#FFC220',
  DARK_BLUE: '#0b4c8c'
} as const;

// Default preferences
export const DEFAULT_PREFERENCES = {
  mapFilters: {
    showSections: ['dairy', 'bakery', 'produce', 'meat', 'frozen', 'pantry', 'beverages', 'health', 'household'],
    showItems: true,
    showRoute: true,
    showAnchors: true,
    showServices: true
  },
  dietaryRestrictions: [],
  brandPreferences: [],
  organicPreference: false
};
