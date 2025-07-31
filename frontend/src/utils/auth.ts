// Authentication utilities
export interface AuthToken {
  access_token: string;
  token_type: string;
  user_id: number;
  role: string;
}

export interface User {
  id: number;
  email: string;
  role: string;
  created_at: string;
}

// Token management
export const getToken = (): string | null => {
  return localStorage.getItem('access_token');
};

export const setToken = (token: string): void => {
  localStorage.setItem('access_token', token);
};

export const removeToken = (): void => {
  localStorage.removeItem('access_token');
};

export const getUserId = (): number | null => {
  const userId = localStorage.getItem('user_id');
  return userId ? parseInt(userId) : null;
};

export const setUserId = (userId: number): void => {
  localStorage.setItem('user_id', userId.toString());
};

export const removeUserId = (): void => {
  localStorage.removeItem('user_id');
};

export const getUserRole = (): string | null => {
  return localStorage.getItem('user_role');
};

export const setUserRole = (role: string): void => {
  localStorage.setItem('user_role', role);
};

export const removeUserRole = (): void => {
  localStorage.removeItem('user_role');
};

// Authentication state
export const isAuthenticated = (): boolean => {
  const token = getToken();
  return token !== null;
};

export const logout = (): void => {
  removeToken();
  removeUserId();
  removeUserRole();
};

// API headers
export const getAuthHeaders = (): HeadersInit => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Token expiration check
export const isTokenExpired = (): boolean => {
  const token = getToken();
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch {
    return true;
  }
};

// Auto logout on token expiration
export const checkTokenExpiration = (): void => {
  // Don't redirect if we're on the signup or login page
  const currentPath = window.location.pathname;
  if (currentPath === '/signup' || currentPath === '/login') {
    return;
  }
  
  if (isTokenExpired()) {
    logout();
    window.location.href = '/login';
  }
};

// Check token expiration every minute
setInterval(checkTokenExpiration, 60000); 

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const viewPitchDeck = async (applicationId: number): Promise<string> => {
  const token = localStorage.getItem('access_token');

  if (!token) {
    throw new Error('Authentication required');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/applications/download-pitch-deck/${applicationId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`View failed: ${response.status} - ${errorText}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    return url;

  } catch (error) {
    console.error('View error:', error);
    throw error;
  }
}; 