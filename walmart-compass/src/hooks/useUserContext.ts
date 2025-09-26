import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface UserContext {
  preferences: {
    dietaryRestrictions: string[];
    brandPreferences: string[];
    organicPreference: boolean;
  };
  shoppingHistory: Array<{
    items: string[];
    date: string;
    context?: string;
  }>;
}

export function useUserContext() {
  const { user } = useAuth();
  const [userContext, setUserContext] = useState<UserContext | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user context from database
  const loadUserContext = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/user-context');
      if (response.ok) {
        const data = await response.json();
        setUserContext(data);
      } else {
        console.error('Failed to load user context');
      }
    } catch (error) {
      console.error('Error loading user context:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Update user preferences
  const updatePreferences = useCallback(async (preferences: Partial<UserContext['preferences']>) => {
    if (!user || !userContext) return;

    try {
      const response = await fetch('/api/user-context', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preferences: {
            ...userContext.preferences,
            ...preferences
          }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setUserContext(prev => prev ? {
          ...prev,
          preferences: data.preferences
        } : null);
      } else {
        console.error('Failed to update preferences');
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  }, [user, userContext]);

  // Load user context on mount and when user changes
  useEffect(() => {
    loadUserContext();
  }, [loadUserContext]);

  return {
    userContext,
    loading,
    updatePreferences,
    refetch: loadUserContext
  };
}
