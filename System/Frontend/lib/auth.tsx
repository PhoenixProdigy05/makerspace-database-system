'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from './api-client';
import { useRouter } from 'next/navigation';

interface User {
  email: string;
  fullName: string;
  role: string;
  id?: string;
  userId?: string;
  _id?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isFirstLogin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated on mount and determine welcome state
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      if (token && userStr) {
        try {
          const userData: User = JSON.parse(userStr);
          setUser(userData);

          const normalizedEmail = (userData.email || '').toLowerCase();
          const welcomeKey = `welcomeSeen:${normalizedEmail}`;
          const hasSeen = normalizedEmail ? localStorage.getItem(welcomeKey) : null;
          const justRegisteredEmail = localStorage.getItem('justRegisteredEmail');
          const normalizedJustRegistered = (justRegisteredEmail || '').toLowerCase();

          if (!hasSeen && normalizedJustRegistered && normalizedJustRegistered === normalizedEmail) {
            // Recently registered user who hasn't seen the greeting yet
            setIsFirstLogin(true);
            localStorage.setItem(welcomeKey, '1');
            localStorage.removeItem('justRegisteredEmail');
          } else {
            setIsFirstLogin(false);
            if (!hasSeen && normalizedEmail) {
              // Existing user: mark as seen so future logins are treated as returning
              localStorage.setItem(welcomeKey, '1');
            }
          }
        } catch (e) {
          // Invalid user data, clear it
          localStorage.removeItem('user');
          setIsFirstLogin(false);
        }
      } else {
        setIsFirstLogin(false);
      }
    } else {
      setIsFirstLogin(false);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.login(email, password);
      const userData = {
        email: response.email,
        fullName: response.fullName,
        role: response.role,
        id: response.id || response.userId || response._id,
        userId: response.userId || response.id || response._id,
        _id: response._id || response.id || response.userId,
      };
      setUser(userData);
      // Store user data in localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(userData));
        const normalizedEmail = (userData.email || '').toLowerCase();
        const welcomeKey = `welcomeSeen:${normalizedEmail}`;
        const justRegisteredEmail = localStorage.getItem('justRegisteredEmail');
        const normalizedJustRegistered = (justRegisteredEmail || '').toLowerCase();

        if (normalizedJustRegistered && normalizedJustRegistered === normalizedEmail) {
          // Freshly registered user: show "Welcome" once on first login
          setIsFirstLogin(true);
          localStorage.setItem(welcomeKey, '1');
          localStorage.removeItem('justRegisteredEmail');
        } else {
          // Any other case (including existing users logging in on a new device): treat as returning
          setIsFirstLogin(false);
          if (!localStorage.getItem(welcomeKey) && normalizedEmail) {
            localStorage.setItem(welcomeKey, '1');
          }
        }
      } else {
        setIsFirstLogin(false);
      }
      // Redirect based on role
      const role = (response.role || '').toLowerCase();
      if (role === 'admin') {
        router.push('/admin/dashboard');
      } else if (role === 'staff') {
        router.push('/staff');
      } else {
        router.push('/member');
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    apiClient.logout();
    setUser(null);
    setIsFirstLogin(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
    router.push('/login');
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isFirstLogin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

