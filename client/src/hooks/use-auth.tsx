import { useState, useEffect, createContext, useContext } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<{
  authState: AuthState;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
} | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false
  });

  useEffect(() => {
    // Check for existing session
    fetch('/api/auth/user')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.user) {
          setAuthState({
            user: data.user,
            isLoading: false,
            isAuthenticated: true
          });
        } else {
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false
          });
        }
      })
      .catch(() => {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false
        });
      });
  }, []);

  const login = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    // Placeholder login logic
    console.log('Login attempt:', email);
    setAuthState({
      user: { id: '1', email, name: 'Demo User' },
      isLoading: false,
      isAuthenticated: true
    });
  };

  const logout = () => {
    setAuthState({
      user: null,
      isLoading: false,
      isAuthenticated: false
    });
  };

  return (
    <AuthContext.Provider value={{ authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function useLogout() {
  const { logout } = useAuth();
  return logout;
}