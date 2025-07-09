'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User } from 'firebase/auth';
import authService from '../services/auth';
import { logAuthEvent } from '@repo/firebase';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = authService.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
      setIsLoading(false);
      
      // Log auth state changes
      if (firebaseUser) {
        console.log(`User authenticated: ${firebaseUser.email}`);
      } else {
        console.log('User signed out');
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Redirect to login if not authenticated and not already on login page
    if (!isLoading && !user && pathname !== '/login') {
      router.push('/login');
    }
  }, [user, isLoading, pathname, router]);

  const login = async (email: string, password: string) => {
    try {
      const firebaseUser = await authService.signIn(email, password);
      setUser(firebaseUser);
      
      // Log successful login
      await logAuthEvent('login', {
        email: firebaseUser.email,
        timestamp: new Date().toISOString()
      }, {
        userId: firebaseUser.uid,
        userEmail: firebaseUser.email || 'unknown'
      });
      
      router.push('/'); // Redirect to dashboard after login
    } catch (error) {
      // Re-throw error to be handled by the login form
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Log logout before signing out
      if (user) {
        await logAuthEvent('logout', {
          email: user.email,
          timestamp: new Date().toISOString()
        }, {
          userId: user.uid,
          userEmail: user.email || 'unknown'
        });
      }
      
      await authService.signOut();
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, clear local state
      setUser(null);
      router.push('/login');
    }
  };

  const resetPassword = async (email: string) => {
    await authService.sendPasswordResetEmail(email);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
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