import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { checkAuthStatus, getStoredAuthData } from '@/utils/auth-persistence';

interface AuthUser {
  id: string;
  username: string;
  name: string;
  email: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  hasJustSignedUp: boolean;
  isLoading: boolean;
}

export function useAuth(): AuthState {
  const [authState, setAuthState] = useState<AuthState>(() => {
    // Try to restore auth state from localStorage for better persistence
    const storedAuth = getStoredAuthData();
    if (storedAuth && storedAuth.isAuthenticated) {
      return {
        user: storedAuth.user,
        isAuthenticated: true,
        hasJustSignedUp: storedAuth.hasJustSignedUp,
        isLoading: true, // Always start loading to verify with server
      };
    }
    
    return {
      user: null,
      isAuthenticated: false,
      hasJustSignedUp: false,
      isLoading: true,
    };
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['/auth/user'],
    queryFn: checkAuthStatus,
    retry: 1, // Allow one retry for network issues
    refetchOnWindowFocus: true, // Allow refetch on focus to catch state changes
    staleTime: 1000 * 30, // Reduce to 30 seconds for better responsiveness
  });

  useEffect(() => {
    if (isLoading) {
      setAuthState(prev => ({ ...prev, isLoading: true }));
    } else if (error) {
      const newState = {
        user: null,
        isAuthenticated: false,
        hasJustSignedUp: false,
        isLoading: false,
      };
      setAuthState(newState);
      // Clear saved auth state on error
      localStorage.removeItem('authState');
    } else if (data) {
      const newState = {
        user: data.user || null,
        isAuthenticated: data.success || false,
        hasJustSignedUp: data.hasJustSignedUp || false,
        isLoading: false,
      };
      setAuthState(newState);
      // Save successful auth state to localStorage
      if (newState.isAuthenticated) {
        localStorage.setItem('authState', JSON.stringify(newState));
      }
    }
  }, [data, isLoading, error]);

  return authState;
}

export function useLogout() {
  const queryClient = useQueryClient();
  
  return async () => {
    try {
      await fetch('/auth/logout', { method: 'POST' });
      queryClient.invalidateQueries({ queryKey: ['/auth/user'] });
      // Use location.href for more reliable mobile navigation
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/';
    }
  };
}