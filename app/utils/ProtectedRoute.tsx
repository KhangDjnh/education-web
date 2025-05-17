import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router";
import { useAuth } from "../contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRoles = [] 
}) => {
  const { isLoggedIn, roles, validateSession } = useAuth();
  const location = useLocation();
  const [isValidating, setIsValidating] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsValidating(true);
        
        // Check if session is valid
        const isSessionValid = await validateSession();
        
        if (!isSessionValid) {
          setIsAuthorized(false);
          return;
        }
        
        // Check if user has required roles (if any)
        if (requiredRoles.length > 0) {
          const hasRequiredRole = requiredRoles.some(role => roles.includes(role));
          setIsAuthorized(hasRequiredRole);
        } else {
          // If no specific roles required, just being logged in is enough
          setIsAuthorized(true);
        }
      } catch (error) {
        console.error("Auth validation error:", error);
        setIsAuthorized(false);
      } finally {
        setIsValidating(false);
      }
    };
    
    checkAuth();
  }, [validateSession, roles, requiredRoles, location.pathname]);

  // Show loading state while validating
  if (isValidating) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-600">Verifying your access...</p>
      </div>
    );
  }

  // Navigate to login if not authorized
  if (!isAuthorized) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // If everything is fine, render the children
  return <>{children}</>;
};

export default ProtectedRoute; 