import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { checkAuthStatus, getStoredAuthData, checkLoginFlag, clearLoginFlag } from '@/utils/auth-persistence';

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
  hasJustLoggedIn: boolean;
  isLoading: boolean;
}

export function useAuth(): AuthState & { clearLoginStatus: () => void } {
  const [authState, setAuthState] = useState<AuthState>(() => {
    // Check for existing auth data instead of clearing it
    const storedAuth = getStoredAuthData();
    
    return {
      user: storedAuth?.user || null,
      isAuthenticated: storedAuth?.isAuthenticated || false,
      hasJustSignedUp: storedAuth?.hasJustSignedUp || false,
      hasJustLoggedIn: false, // Always false on initial load
      isLoading: true,
    };
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/auth/user'],
    queryFn: checkAuthStatus,
    retry: 1, // Allow one retry for network issues
    refetchOnWindowFocus: false, // Reduce unnecessary refetches
    staleTime: 5000, // Cache for 5 seconds to prevent duplicate calls
    refetchInterval: false, // Disable polling to reduce server load
  });

  useEffect(() => {
    if (isLoading) {
      setAuthState(prev => ({ ...prev, isLoading: true }));
    } else if (error) {
      const newState = {
        user: null,
        isAuthenticated: false,
        hasJustSignedUp: false,
        hasJustLoggedIn: false,
        isLoading: false,
      };
      setAuthState(newState);
      // Clear saved auth state on error
      localStorage.removeItem('authState');
    } else if (data) {
      const wasAuthenticated = authState.isAuthenticated;
      const isNowAuthenticated = data.success || false;
      
      // Check for login flag without clearing it immediately
      const justLoggedIn = checkLoginFlag();
      console.log('Auth state transition:', { wasAuthenticated, isNowAuthenticated, justLoggedIn });
      
      // Detect successful login transition and ensure flag is honored
      const isLoginTransition = !wasAuthenticated && isNowAuthenticated;
      
      // Additional debug for login flag timing
      if (justLoggedIn) {
        console.log('Login flag detected - welcome modal should appear');
      }
      
      // For login transitions, ensure the flag is checked regardless of timing
      const shouldShowLoginModal = justLoggedIn || isLoginTransition;
      
      const newState = {
        user: data.user || null,
        isAuthenticated: isNowAuthenticated,
        hasJustSignedUp: data.hasJustSignedUp || false,
        hasJustLoggedIn: shouldShowLoginModal, // Use flag or detect transition
        isLoading: false,
      };
      setAuthState(newState);
      // Save successful auth state to localStorage
      if (newState.isAuthenticated) {
        localStorage.setItem('authState', JSON.stringify(newState));
      }
    }
  }, [data, isLoading, error, authState.isAuthenticated]);

  const clearLoginStatus = () => {
    console.log('Clearing login status...');
    clearLoginFlag(); // Clear the localStorage flag
    setAuthState(prev => ({ ...prev, hasJustLoggedIn: false }));
  };

  return { ...authState, clearLoginStatus };
}

export function useLogout() {
  const queryClient = useQueryClient();
  
  return async () => {
    try {
      // Clear all local storage auth data first
      localStorage.removeItem('authState');
      localStorage.removeItem('parentjourney_auth');
      localStorage.removeItem('parentjourney_token');
      localStorage.removeItem('parentjourney_just_logged_in'); // Clear login flag on logout
      
      // Call server logout
      await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include'
      });
      
      // Clear query cache
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      queryClient.clear(); // Clear all cached data
      
      // Force page reload to ensure clean state
      window.location.reload();
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local data even if server request fails
      localStorage.removeItem('authState');
      localStorage.removeItem('parentjourney_auth');
      localStorage.removeItem('parentjourney_token');
      queryClient.clear();
      window.location.reload();
    }
  };
}