"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  partyId: string | null;
  isConnected: boolean;
  connect: (id: string) => void;
  disconnect: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [partyId, setPartyId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('flowryd_party_id');
    if (saved) {
      setPartyId(saved);
      setIsConnected(true);
    }
  }, []);

  const connect = (id: string) => {
    setPartyId(id);
    setIsConnected(true);
    localStorage.setItem('flowryd_party_id', id);
  };

  const disconnect = () => {
    setPartyId(null);
    setIsConnected(false);
    localStorage.removeItem('flowryd_party_id');
  };

  return (
    <AuthContext.Provider value={{ partyId, isConnected, connect, disconnect }}>
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
