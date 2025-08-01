// Enhanced API client with token support for iframe environments
import { getStoredAuthData } from './auth-persistence';

// Get auth token from localStorage
function getAuthToken(): string | null {
  return localStorage.getItem('parentjourney_token');
}

// Enhanced fetch function that includes auth token
export async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getAuthToken();
  
  // Add authorization header if token exists
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Always include credentials for session-based auth compatibility
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers,
  });
  
  // If unauthorized and we have a token, try to refresh auth status
  if (response.status === 401 && token) {
    console.log('API request unauthorized, clearing stored token');
    localStorage.removeItem('parentjourney_token');
    localStorage.removeItem('parentjourney_auth');
  }
  
  return response;
}

// API request helper for React Query
export const apiRequest = async (url: string, options: RequestInit = {}) => {
  const response = await authenticatedFetch(url, options);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }
  
  return response.json();
};