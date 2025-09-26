import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Database types
export interface UserProfile {
  id: string
  email: string
  name: string
  preferences: {
    mapFilters: {
      showSections: string[]
      showItems: boolean
      showRoute: boolean
      showAnchors: boolean
      showServices: boolean
    }
    dietaryRestrictions: string[]
    brandPreferences: string[]
    organicPreference: boolean
  }
  created_at: string
}

export interface StoreItem {
  id: string
  name: string
  category: string
  description: string
  coordinates: { x: number; y: number }
  price: number
  in_stock: boolean
  embedding?: number[] // OpenAI embeddings
  created_at: string
}

export interface ChatSession {
  id: string
  user_id: string
  messages: Array<{
    id: string
    text: string
    isUser: boolean
    timestamp: string
  }>
  created_at: string
  updated_at: string
}

export interface ActiveShoppingList {
  id: string
  user_id: string
  items: Array<{
    id: string
    name: string
    category: string
    isCompleted: boolean
    location?: { x: number; y: number }
  }>
  created_at: string
  updated_at: string
}

export interface ShoppingHistory {
  id: string
  user_id: string
  items: Array<{
    id: string
    name: string
    coordinates: { x: number; y: number }
    completed: boolean
  }>
  route_data?: {
    path: Array<{ x: number; y: number }>
    total_distance: number
  }
  completed_at?: string
  created_at: string
}