// Authentication persistence utilities for iframe environments
export interface AuthData {
  user: {
    id: string;
    username: string;
    name: string;
    email: string;
  } | null;
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

// Set login flag to trigger modal
export function setLoginFlag(): void {
  localStorage.setItem('parentjourney_just_logged_in', 'true');
}

// Check login flag without clearing it
export function checkLoginFlag(): boolean {
  const flag = localStorage.getItem('parentjourney_just_logged_in');
  return flag === 'true';
}

// Clear login flag
export function clearLoginFlag(): void {
  localStorage.removeItem('parentjourney_just_logged_in');
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
  localStorage.removeItem('authToken');
  localStorage.removeItem('parentjourney_just_logged_in');
  localStorage.removeItem('hasCompletedOnboarding');
  localStorage.removeItem('hasDismissedOnboarding');
  console.log('Cleared all auth data');
}

// Complete authentication reset - clears everything and forces logout
export async function completeAuthReset(): Promise<void> {
  try {
    // Call logout API to clear server-side session
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('parentjourney_token') || ''}`,
      }
    });
  } catch (error) {
    console.log('Logout API call failed, continuing with cleanup');
  }
  
  // Clear all local storage
  clearAuthData();
  
  console.log('Complete authentication reset performed');
}

// Perform login with mobile browser compatibility
export async function performLogin(identifier: string, password: string): Promise<{ success: boolean; user?: any; error?: string; authToken?: string; hasJustSignedUp?: boolean }> {
  try {
    // Trim whitespace from identifier to prevent login issues
    const trimmedIdentifier = identifier.trim();
    const userAgent = navigator.userAgent;
    const isMobileBrowser = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    
    console.log('Attempting login with:', { identifier: trimmedIdentifier, mobile: isMobileBrowser });
    
    const response = await fetch('/api/auth/login', {
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
        localStorage.setItem('authToken', result.authToken);
        console.log('Stored auth token for API requests:', result.authToken.substring(0, 20) + '...');
        
        // Verify token was stored properly
        const storedToken = localStorage.getItem('authToken');
        console.log('Token verification - stored successfully:', !!storedToken && storedToken === result.authToken);
        
        // Token stored successfully - no additional action needed
        // The auth dialog will handle cache invalidation
      } else {
        console.warn('No auth token received in login response');
      }
      
      // Set login flag to trigger modal
      setLoginFlag();
      
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
    const token = localStorage.getItem('authToken');
    console.log('Auth check - checking token from localStorage:', !!token, token ? token.substring(0, 20) + '...' : 'none');
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('Auth check - sending request with token');
    } else {
      console.log('Auth check - no token found in localStorage');
    }
    
    const response = await fetch('/api/auth/user', {
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
          localStorage.setItem('authToken', result.authToken);
        }
        
        return result;
      } else {
        // Server explicitly says user is not authenticated - clear all local storage
        console.log('Server auth failed, clearing all local storage');
        clearAuthData();
        return { success: false };
      }
    }

    // Only use stored data as fallback for network errors, not authentication failures
    return { success: false };
  } catch (error) {
    console.error('Auth check error:', error);
    // Clear auth data on network errors to prevent stale data
    clearAuthData();
    return { success: false };
  }
}