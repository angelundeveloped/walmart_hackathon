'use client'

import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'

export default function AuthButton() {
  const { user, loading, error, signInWithGoogle, signOut, clearError } = useAuth()
  const { dictionary } = useLanguage()

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm">Loading...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="text-red-500 text-sm text-center max-w-xs">
          {error}
        </div>
        <button
          onClick={clearError}
          className="text-xs text-gray-400 hover:text-gray-300 underline"
        >
          Dismiss
        </button>
      </div>
    )
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gray-800 bg-opacity-80 rounded-full flex items-center justify-center border border-gray-600">
            <span className="text-sm font-medium">
              {user.email?.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="text-sm hidden sm:block">
            {user.email}
          </span>
        </div>
        <button
          onClick={signOut}
          className="text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-1.5 bg-gray-800 bg-opacity-80 hover:bg-opacity-90 rounded-full transition-colors text-white font-medium border border-gray-600 hover:border-gray-500 touch-manipulation min-h-[44px] sm:min-h-auto"
        >
          {dictionary?.auth.signOut || "Sign Out"}
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={signInWithGoogle}
      className="flex items-center gap-2 px-4 py-2 bg-white text-blue-700 rounded-lg hover:bg-blue-50 transition-colors font-medium border border-blue-200 hover:border-blue-300"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="currentColor"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="currentColor"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="currentColor"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      {dictionary?.auth.signInWithGoogle || "Sign in with Google"}
    </button>
  )
}
