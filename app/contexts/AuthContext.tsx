import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
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
  isInitialized: boolean;
  login: (accessToken: string, user: User, roles: string[]) => void;
  logout: () => void;
  getToken: () => string | null;
  validateSession: () => Promise<boolean>;
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
  const [lastValidationTime, setLastValidationTime] = useState<number>(0);
  const [isInitialized, setIsInitialized] = useState(false);

  // Check if user is already logged in on mount
  useEffect(() => {
    const initializeAuth = async () => {
      console.log("Initializing authentication state...");
      try {
        const savedToken = localStorage.getItem('accessToken');
        const savedUser = localStorage.getItem('user');
        const savedRoles = localStorage.getItem('roles');
        
        if (savedToken && savedUser && savedRoles) {
          // First set the state from localStorage to prevent flashing
          setIsLoggedIn(true);
          setUser(JSON.parse(savedUser));
          setRoles(JSON.parse(savedRoles));
          
          console.log("Found saved auth state, validating token...");
          
          // Then validate the token with the backend
          const isValid = await validateTokenWithBackend(savedToken);
          
          if (isValid) {
            console.log("Token validation successful");
            setLastValidationTime(Date.now());
          } else {
            console.log("Token invalid, clearing auth state");
            clearAuthData();
          }
        }
      } catch (error) {
        console.error("Error during auth initialization:", error);
        clearAuthData();
      } finally {
        console.log("Auth initialization complete");
        setIsInitialized(true);
      }
    };
    
    initializeAuth();
  }, []);
  
  // Helper function to validate token with backend
  const validateTokenWithBackend = async (token: string): Promise<boolean> => {
    try {
      console.log("Validating token with backend...");
      const response = await fetch("http://localhost:8080/education/api/auth/validate-token", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Return true if token is valid (200 OK)
      const isValid = response.ok;
      console.log(`Token validation result: ${isValid ? 'valid' : 'invalid'}`);
      return isValid;
    } catch (error) {
      console.error("Token validation error:", error);
      return false;
    }
  };
  
  // Clear auth data from state and localStorage
  const clearAuthData = () => {
    console.log("Clearing auth data");
    setUser(null);
    setRoles([]);
    setIsLoggedIn(false);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    localStorage.removeItem('roles');
    localStorage.removeItem('userId');
  };

  const login = (accessToken: string, userData: User, userRoles: string[]) => {
    console.log("Login successful, setting auth state");
    // Store in state
    setUser(userData);
    setRoles(userRoles);
    setIsLoggedIn(true);
    setLastValidationTime(Date.now());
    
    // Store in localStorage for persistence
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('roles', JSON.stringify(userRoles));
    localStorage.setItem('userId', userData.id.toString());
  };

  const logout = () => {
    console.log("Logging out, clearing auth state");
    clearAuthData();
  };

  const getToken = (): string | null => {
    return localStorage.getItem('accessToken');
  };
  
  // Session validation with caching to prevent excessive API calls
  const validateSession = useCallback(async (): Promise<boolean> => {
    console.log("Validating session...");
    
    // If not initialized yet, return the current login state
    if (!isInitialized) {
      console.log("Auth not initialized, returning current state:", isLoggedIn);
      return isLoggedIn;
    }
    
    // If validated within the last minute, assume still valid
    const VALIDATION_CACHE_TIME = 60 * 1000; // 1 minute
    const currentTime = Date.now();
    const token = getToken();
    
    if (isLoggedIn && (currentTime - lastValidationTime < VALIDATION_CACHE_TIME)) {
      console.log("Using cached validation result (valid)");
      return true;
    }
    
    if (!token) {
      console.log("No token found, session invalid");
      clearAuthData();
      return false;
    }
    
    try {
      const isValid = await validateTokenWithBackend(token);
      if (isValid) {
        console.log("Session validation successful");
        setLastValidationTime(currentTime);
        return true;
      } else {
        console.log("Session validation failed");
        clearAuthData();
        return false;
      }
    } catch (error) {
      console.error("Session validation error:", error);
      clearAuthData();
      return false;
    }
  }, [isLoggedIn, lastValidationTime, isInitialized]);

  const contextValue = {
    isLoggedIn, 
    user, 
    roles, 
    isInitialized,
    login, 
    logout, 
    getToken,
    validateSession 
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 