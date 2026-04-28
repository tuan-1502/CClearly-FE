import { createContext, useContext, useEffect, useState } from 'react';
import { authRequest } from '@/api/auth';
import { useSessionStore, ROLES } from '@/stores/sessionStore';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const { accessToken, refreshToken, setSession, clearSession, user } =
    useSessionStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      // Check for token in URL (from email verification or password reset)
      const urlParams = new URLSearchParams(window.location.search);
      const tokenFromUrl = urlParams.get('token');
      const refreshFromUrl = urlParams.get('refreshToken');

      if (tokenFromUrl && refreshFromUrl) {
        setSession({ accessToken: tokenFromUrl, refreshToken: refreshFromUrl });
        window.history.replaceState({}, '', window.location.pathname);
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = (accessToken, refreshToken) => {
    setSession({ accessToken, refreshToken });
  };

  const logout = async () => {
    try {
      await authRequest.logout();
    } catch {
      // ignore error, clear session anyway
    }
    clearSession();
  };

  // Check if user has specific role
  const hasRole = (roles) => {
    if (!user) return false;
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    return user.role === roles;
  };

  // Check if user is admin (manager or system admin)
  const isAdmin = () => {
    return hasRole([ROLES.MANAGER, ROLES.ADMIN]);
  };

  // Check if user is staff (sales or operations)
  const isStaff = () => {
    return hasRole([ROLES.SALES, ROLES.OPERATIONS, ROLES.MANAGER, ROLES.ADMIN]);
  };

  const value = {
    isAuthenticated: !!accessToken,
    isLoading,
    user,
    login,
    logout,
    hasRole,
    isAdmin,
    isStaff,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export { ROLES };

