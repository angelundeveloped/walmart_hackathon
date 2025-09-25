'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import { DEFAULT_PREFERENCES } from '@/lib/constants'

interface UserPreferences {
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

interface PreferencesContextType {
  preferences: UserPreferences
  updatePreferences: (newPreferences: Partial<UserPreferences>) => void
  isLoading: boolean
}


const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined)

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const { profile, updateProfile } = useAuth()
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (profile?.preferences) {
      setPreferences({ ...DEFAULT_PREFERENCES, ...profile.preferences })
    }
  }, [profile])

  const updatePreferences = async (newPreferences: Partial<UserPreferences>) => {
    setIsLoading(true)
    try {
      const updatedPreferences = { ...preferences, ...newPreferences }
      setPreferences(updatedPreferences)
      await updateProfile({ preferences: updatedPreferences })
    } catch (error) {
      console.error('Error updating preferences:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const value = {
    preferences,
    updatePreferences,
    isLoading
  }

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  )
}

export function usePreferences() {
  const context = useContext(PreferencesContext)
  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider')
  }
  return context
}
