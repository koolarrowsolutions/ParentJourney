import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

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
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    hasJustSignedUp: false,
    isLoading: true,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/auth/user'],
    queryFn: async () => {
      const response = await fetch('/api/auth/user');
      if (!response.ok) {
        throw new Error('Not authenticated');
      }
      return response.json();
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (isLoading) {
      setAuthState(prev => ({ ...prev, isLoading: true }));
    } else if (error) {
      setAuthState({
        user: null,
        isAuthenticated: false,
        hasJustSignedUp: false,
        isLoading: false,
      });
    } else if (data) {
      setAuthState({
        user: data.user || null,
        isAuthenticated: data.success || false,
        hasJustSignedUp: data.hasJustSignedUp || false,
        isLoading: false,
      });
    }
  }, [data, isLoading, error]);

  return authState;
}

export function useLogout() {
  const queryClient = useQueryClient();
  
  return async () => {
    try {
      await fetch('/auth/logout', { method: 'POST' });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      window.location.reload();
    } catch (error) {
      console.error('Logout error:', error);
      window.location.reload();
    }
  };
}