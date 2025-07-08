'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (apiKey: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Note: In production, this should validate against a backend API
// For now, we're using the environment variable
const VALID_API_KEY = 'bLDL4wCSH77FkU4QHijvUCGvq4SQKZOWZL7XEjlmPHjtTcCaDETmmWZCtWhRuI36h1IcTZ2hy30Ke8oxFPqXMOsmaZ9cKTxEkXXS3fgw961TBzrhkD9pRi3jfUYwb36g';
const AUTH_STORAGE_KEY = 'admin_auth_token';
const AUTH_EXPIRY_KEY = 'admin_auth_expiry';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialize auth state from localStorage to prevent flash of content
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      const token = localStorage.getItem(AUTH_STORAGE_KEY);
      const expiry = localStorage.getItem(AUTH_EXPIRY_KEY);
      if (token && expiry) {
        const expiryTime = parseInt(expiry, 10);
        return Date.now() < expiryTime;
      }
    } catch (error) {
      console.error('Initial auth check failed:', error);
    }
    return false;
  });
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && pathname !== '/login') {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  const checkAuth = () => {
    try {
      const token = localStorage.getItem(AUTH_STORAGE_KEY);
      const expiry = localStorage.getItem(AUTH_EXPIRY_KEY);
      
      if (token && expiry) {
        const expiryTime = parseInt(expiry, 10);
        if (Date.now() < expiryTime) {
          setIsAuthenticated(true);
        } else {
          // Token expired
          localStorage.removeItem(AUTH_STORAGE_KEY);
          localStorage.removeItem(AUTH_EXPIRY_KEY);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (apiKey: string): Promise<boolean> => {
    // In production, this should make an API call to validate the key
    if (apiKey === VALID_API_KEY) {
      const token = btoa(apiKey + ':' + Date.now()); // Simple token generation
      const expiry = Date.now() + SESSION_DURATION;
      
      localStorage.setItem(AUTH_STORAGE_KEY, token);
      localStorage.setItem(AUTH_EXPIRY_KEY, expiry.toString());
      setIsAuthenticated(true);
      
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(AUTH_EXPIRY_KEY);
    setIsAuthenticated(false);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}