// Authentication persistence utilities for iframe environments
export interface AuthData {
  user: {
    id: string;
    username: string;
    name: string;
    email: string;
  };
  isAuthenticated: boolean;
  hasJustSignedUp: boolean;
  timestamp: number;
}

// Store authentication data with timestamp
export function storeAuthData(authData: Partial<AuthData>): void {
  const data: AuthData = {
    user: authData.user || null,
    isAuthenticated: !!authData.isAuthenticated,
    hasJustSignedUp: !!authData.hasJustSignedUp,
    timestamp: Date.now()
  };
  
  localStorage.setItem('parentjourney_auth', JSON.stringify(data));
  console.log('Stored auth data:', data);
}

// Retrieve authentication data if still valid (within 24 hours)
export function getStoredAuthData(): AuthData | null {
  try {
    const stored = localStorage.getItem('parentjourney_auth');
    if (!stored) return null;
    
    const data: AuthData = JSON.parse(stored);
    const age = Date.now() - data.timestamp;
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    if (age > maxAge) {
      console.log('Stored auth data expired, removing');
      localStorage.removeItem('parentjourney_auth');
      return null;
    }
    
    console.log('Retrieved valid stored auth data:', data);
    return data;
  } catch (error) {
    console.error('Error retrieving stored auth data:', error);
    localStorage.removeItem('parentjourney_auth');
    return null;
  }
}

// Clear authentication data
export function clearAuthData(): void {
  localStorage.removeItem('parentjourney_auth');
  localStorage.removeItem('parentjourney_token');
  console.log('Cleared auth data');
}

// Perform login with mobile browser compatibility
export async function performLogin(identifier: string, password: string): Promise<{ success: boolean; user?: any; error?: string; authToken?: string }> {
  try {
    // Trim whitespace from identifier to prevent login issues
    const trimmedIdentifier = identifier.trim();
    const userAgent = navigator.userAgent;
    const isMobileBrowser = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    
    console.log('Attempting login with:', { identifier: trimmedIdentifier, mobile: isMobileBrowser });
    
    const response = await fetch('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': userAgent, // Ensure user agent is sent
      },
      credentials: 'include', // Always include credentials for session support
      body: JSON.stringify({ identifier: trimmedIdentifier, password }),
    });

    const result = await response.json();
    console.log('Login response:', { status: response.status, result });

    if (response.ok && result.success) {
      // Store authentication data for iframe persistence
      storeAuthData({
        user: result.user,
        isAuthenticated: true,
        hasJustSignedUp: result.hasJustSignedUp || false
      });
      
      // Store auth token for API requests
      if (result.authToken) {
        localStorage.setItem('parentjourney_token', result.authToken);
        console.log('Stored auth token for API requests');
      }
      
      return { 
        success: true, 
        user: result.user, 
        authToken: result.authToken,
        hasJustSignedUp: result.hasJustSignedUp || false
      };
    } else {
      return { success: false, error: result.error || 'Login failed' };
    }
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Network error during login' };
  }
}

// Check authentication status with fallback to stored data
export async function checkAuthStatus(): Promise<{ success: boolean; user?: any; hasJustSignedUp?: boolean }> {
  try {
    console.log('Checking auth status...');
    
    // Get auth token for iframe compatibility
    const token = localStorage.getItem('parentjourney_token');
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch('/auth/user', {
      method: 'GET',
      credentials: 'include',
      headers,
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Server auth result:', result);
      
      if (result.success) {
        // Update stored data with server response
        storeAuthData({
          user: result.user,
          isAuthenticated: true,
          hasJustSignedUp: result.hasJustSignedUp || false
        });
        
        // Store/update auth token if provided
        if (result.authToken) {
          localStorage.setItem('parentjourney_token', result.authToken);
        }
        
        return result;
      }
    }

    // If server auth fails, try stored data as fallback for iframe environments
    console.log('Server auth failed, checking stored data...');
    const storedAuth = getStoredAuthData();
    if (storedAuth && storedAuth.isAuthenticated) {
      console.log('Using stored auth data as fallback');
      return {
        success: true,
        user: storedAuth.user,
        hasJustSignedUp: storedAuth.hasJustSignedUp
      };
    }

    return { success: false };
  } catch (error) {
    console.error('Auth check error:', error);
    
    // Try stored data as final fallback
    const storedAuth = getStoredAuthData();
    if (storedAuth && storedAuth.isAuthenticated) {
      console.log('Using stored auth data after network error');
      return {
        success: true,
        user: storedAuth.user,
        hasJustSignedUp: storedAuth.hasJustSignedUp
      };
    }

    return { success: false };
  }
}