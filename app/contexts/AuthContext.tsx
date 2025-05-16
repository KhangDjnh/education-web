import React, { createContext, useState, useContext } from 'react';
import type { ReactNode } from 'react';

type User = {
  id: string;
  username: string;
  avatarUrl?: string;
};

type AuthContextType = {
  isLoggedIn: boolean;
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
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

  const login = (userData: User) => {
    setUser(userData);
    setIsLoggedIn(true);
    // In a real app, you might store user data in localStorage or a secure cookie
  };

  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
    // In a real app, you'd clear localStorage, cookies, etc.
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 