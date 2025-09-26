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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
    error: null
  })

  const fetchUserProfile = useCallback(async (userId: string, userEmail?: string, userName?: string) => {
    try {
      console.log('Fetching profile for userId:', userId)
      const supabase = createClient()
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.log('Profile fetch error:', error.code, error.message)
        // If profile doesn't exist, create it
        if (error.code === 'PGRST116') {
          console.log('Creating new profile for user:', userId)
          const { data: newProfile, error: createError } = await supabase
            .from('user_profiles')
            .insert({
              id: userId,
              email: userEmail || '',
              name: userName || userEmail || 'User'
            })
            .select()
            .single()
          
          if (createError) {
            console.error('Error creating user profile:', createError)
            setAuthState(prev => ({ 
              ...prev, 
              error: 'Failed to create user profile' 
            }))
            return
          }
          
          console.log('Profile created successfully:', newProfile)
          setAuthState(prev => ({ 
            ...prev, 
            profile: newProfile
          }))
        } else {
          console.error('Error fetching user profile:', error)
          setAuthState(prev => ({ 
            ...prev, 
            error: 'Failed to fetch user profile' 
          }))
        }
      } else {
        console.log('Profile fetched successfully:', data)
        setAuthState(prev => ({ 
          ...prev, 
          profile: data
        }))
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      setAuthState(prev => ({ 
        ...prev, 
        error: 'An unexpected error occurred' 
      }))
    }
  }, [])

  useEffect(() => {
    const supabase = createClient()
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      console.log('Initial session loaded:', session?.user?.email || 'No user')
      setAuthState(prev => ({
        ...prev,
        session,
        user: session?.user ?? null,
        loading: false
      }))
      
      if (session?.user) {
        console.log('Fetching profile for user:', session.user.id)
        fetchUserProfile(
          session.user.id, 
          session.user.email,
          session.user.user_metadata?.name
        )
      }
    }).catch((error) => {
      console.error('Error getting initial session:', error)
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load session'
      }))
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: string, session: Session | null) => {
      console.log('Auth state change:', event, session?.user?.email)
      
      setAuthState(prev => ({
        ...prev,
        session,
        user: session?.user ?? null,
        loading: false
      }))
      
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
  }, [fetchUserProfile])

  const signInWithGoogle = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }))
      
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      
      if (error) {
        setAuthState(prev => ({ 
          ...prev, 
          loading: false, 
          error: 'Failed to sign in with Google' 
        }))
        throw error
      }
    } catch (error) {
      console.error('Error signing in with Google:', error)
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'An unexpected error occurred during sign in' 
      }))
    }
  }

  const signOut = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }))
      
      const supabase = createClient()
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        setAuthState(prev => ({ 
          ...prev, 
          loading: false, 
          error: 'Failed to sign out' 
        }))
        throw error
      }
    } catch (error) {
      console.error('Error signing out:', error)
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'An unexpected error occurred during sign out' 
      }))
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!authState.user) return

    try {
      setAuthState(prev => ({ ...prev, error: null }))
      
      const supabase = createClient()
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', authState.user.id)
        .select()
        .single()

      if (error) {
        setAuthState(prev => ({ 
          ...prev, 
          error: 'Failed to update profile' 
        }))
        throw error
      }
      
      setAuthState(prev => ({ 
        ...prev, 
        profile: data
      }))
    } catch (error) {
      console.error('Error updating profile:', error)
      setAuthState(prev => ({ 
        ...prev, 
        error: 'An unexpected error occurred while updating profile' 
      }))
    }
  }

  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }))
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
