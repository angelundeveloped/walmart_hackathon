'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase'
import { UserProfile } from '@/lib/supabase'

interface AuthState {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  error: string | null
}

interface AuthContextType extends AuthState {
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Error message constants
const ERROR_MESSAGES = {
  CREATE_PROFILE: 'Failed to create user profile',
  FETCH_PROFILE: 'Failed to fetch user profile',
  UNEXPECTED_ERROR: 'An unexpected error occurred',
  LOAD_SESSION: 'Failed to load session',
  SIGN_IN_GOOGLE: 'Failed to sign in with Google',
  SIGN_IN_UNEXPECTED: 'An unexpected error occurred during sign in',
  SIGN_OUT: 'Failed to sign out',
  SIGN_OUT_UNEXPECTED: 'An unexpected error occurred during sign out',
  UPDATE_PROFILE: 'Failed to update profile',
  UPDATE_PROFILE_UNEXPECTED: 'An unexpected error occurred while updating profile'
} as const

// Database constants
const DB_TABLES = {
  USER_PROFILES: 'user_profiles'
} as const

const ERROR_CODES = {
  PROFILE_NOT_FOUND: 'PGRST116'
} as const

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
    error: null
  })

  // Helper functions for common state updates
  const setLoading = useCallback((loading: boolean) => {
    setAuthState(prev => ({ ...prev, loading }))
  }, [])

  const setError = useCallback((error: string | null) => {
    setAuthState(prev => ({ ...prev, error }))
  }, [])

  const setUserAndSession = useCallback((user: User | null, session: Session | null) => {
    setAuthState(prev => ({
      ...prev,
      user,
      session,
      loading: false
    }))
  }, [])

  const handleError = useCallback((error: unknown, errorMessage: string) => {
    console.error(errorMessage, error)
    setError(errorMessage)
    setLoading(false)
  }, [setError])

  const createUserProfile = useCallback(async (userId: string, userEmail?: string, userName?: string) => {
    const supabase = createClient()
    const { data: newProfile, error: createError } = await supabase
      .from(DB_TABLES.USER_PROFILES)
      .insert({
        id: userId,
        email: userEmail || '',
        name: userName || userEmail || 'User'
      })
      .select()
      .single()
    
    if (createError) {
      handleError(createError, ERROR_MESSAGES.CREATE_PROFILE)
      return null
    }
    
    setAuthState(prev => ({ 
      ...prev, 
      profile: newProfile
    }))
    return newProfile
  }, [setError, handleError])

  const fetchUserProfile = useCallback(async (userId: string, userEmail?: string, userName?: string) => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from(DB_TABLES.USER_PROFILES)
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.log('Profile fetch error:', error.code, error.message)
        // If profile doesn't exist, create it
        if (error.code === ERROR_CODES.PROFILE_NOT_FOUND) {
          await createUserProfile(userId, userEmail, userName)
        } else {
          handleError(error, ERROR_MESSAGES.FETCH_PROFILE)
        }
      } else {
        setAuthState(prev => ({ 
          ...prev, 
          profile: data
        }))
      }
    } catch (error) {
      handleError(error, ERROR_MESSAGES.UNEXPECTED_ERROR)
    }
  }, [setError, createUserProfile, handleError])

  useEffect(() => {
    const supabase = createClient()
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      setUserAndSession(session?.user ?? null, session)
      
      if (session?.user) {
        fetchUserProfile(
          session.user.id, 
          session.user.email,
          session.user.user_metadata?.name
        )
      }
    }).catch((error) => {
      handleError(error, ERROR_MESSAGES.LOAD_SESSION)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: string, session: Session | null) => {
      
      setUserAndSession(session?.user ?? null, session)
      
      if (session?.user) {
        await fetchUserProfile(
          session.user.id,
          session.user.email,
          session.user.user_metadata?.name
        )
      } else {
        setAuthState(prev => ({
          ...prev,
          profile: null,
          loading: false
        }))
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [fetchUserProfile, setUserAndSession, setLoading, setError, handleError])

  const signInWithGoogle = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      
      if (error) {
        setLoading(false)
        setError(ERROR_MESSAGES.SIGN_IN_GOOGLE)
        throw error
      }
    } catch (error) {
      handleError(error, ERROR_MESSAGES.SIGN_IN_UNEXPECTED)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const supabase = createClient()
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        setLoading(false)
        setError(ERROR_MESSAGES.SIGN_OUT)
        throw error
      }
      
      // Reset loading state after successful sign out
      setLoading(false)
    } catch (error) {
      handleError(error, ERROR_MESSAGES.SIGN_OUT_UNEXPECTED)
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!authState.user) return

    try {
      setError(null)
      
      const supabase = createClient()
      const { data, error } = await supabase
        .from(DB_TABLES.USER_PROFILES)
        .update(updates)
        .eq('id', authState.user.id)
        .select()
        .single()

      if (error) {
        setError(ERROR_MESSAGES.UPDATE_PROFILE)
        throw error
      }
      
      setAuthState(prev => ({ 
        ...prev, 
        profile: data
      }))
    } catch (error) {
      handleError(error, ERROR_MESSAGES.UPDATE_PROFILE_UNEXPECTED)
    }
  }

  const clearError = () => {
    setError(null)
  }

  const value = {
    ...authState,
    signInWithGoogle,
    signOut,
    updateProfile,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
