import React, { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';

type User = {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  dob?: string;
  avatarUrl?: string;
};

type AuthContextType = {
  isLoggedIn: boolean;
  user: User | null;
  roles: string[];
  login: (accessToken: string, user: User, roles: string[]) => void;
  logout: () => void;
  getToken: () => string | null;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<string[]>([]);

  // Check if user is already logged in on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('accessToken');
    const savedUser = localStorage.getItem('user');
    const savedRoles = localStorage.getItem('roles');
    
    if (savedToken && savedUser && savedRoles) {
      setIsLoggedIn(true);
      setUser(JSON.parse(savedUser));
      setRoles(JSON.parse(savedRoles));
    }
  }, []);

  const login = (accessToken: string, userData: User, userRoles: string[]) => {
    // Store in state
    setUser(userData);
    setRoles(userRoles);
    setIsLoggedIn(true);
    
    // Store in localStorage for persistence
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('roles', JSON.stringify(userRoles));
  };

  const logout = () => {
    // Clear state
    setUser(null);
    setRoles([]);
    setIsLoggedIn(false);
    
    // Clear localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    localStorage.removeItem('roles');
  };

  const getToken = (): string | null => {
    return localStorage.getItem('accessToken');
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, roles, login, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 