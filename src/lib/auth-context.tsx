"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { UserRole } from '@/lib/auth/rbac';

export interface AuthUser {
  id: string;
  partyId: string;
  displayName: string;
  email: string | null;
  role: UserRole;
  orgId: string;
}

interface AuthContextType {
  partyId: string | null;
  isConnected: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  connect: (id: string) => void;
  disconnect: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [partyId, setPartyId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);

  const fetchMe = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const json = await res.json();
        const u = json.data?.user;
        if (u) {
          setUser(u);
          setPartyId(u.partyId);
          setIsConnected(true);
          return;
        }
      }
    } catch {
      // API not available yet — fall back to localStorage
    }

    const saved = localStorage.getItem('flowryd_party_id');
    if (saved) {
      setPartyId(saved);
      setIsConnected(true);
    }
  }, []);

  useEffect(() => {
    fetchMe().finally(() => setIsLoading(false));
  }, [fetchMe]);

  useEffect(() => {
    if (!isConnected) return;
    const REFRESH_INTERVAL = 12 * 60 * 1000;
    const interval = setInterval(async () => {
      try {
        await fetch('/api/auth/refresh', { method: 'POST' });
      } catch {}
    }, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [isConnected]);

  const connect = (id: string) => {
    setPartyId(id);
    setIsConnected(true);
    localStorage.setItem('flowryd_party_id', id);
  };

  const disconnect = () => {
    setPartyId(null);
    setIsConnected(false);
    setUser(null);
    localStorage.removeItem('flowryd_party_id');
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ partyId, isConnected, isLoading, user, connect, disconnect }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useCantonAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useCantonAuth must be used within an AuthProvider');
  }
  return context;
};
