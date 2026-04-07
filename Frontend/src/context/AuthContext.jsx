import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  getAccessToken,
} from '../services/authService';

// Create Auth Context
const AuthContext = createContext(null);

// Auth Provider Component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = getAccessToken();
        if (token) {
          const currentUser = await getCurrentUser();
          setUser(currentUser);
        }
      } catch (err) {
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Register handler
  const register = useCallback(async (username, email, password, passwordConfirm) => {
    try {
      setError(null);
      const response = await registerUser({
        username,
        email,
        password,
        passwordConfirm,
      });
      setUser(response.user);
      return response;
    } catch (err) {
      setError(err.message || 'Registration failed');
      throw err;
    }
  }, []);

  // Login handler
  const login = useCallback(async (email, password) => {
    try {
      setError(null);
      const response = await loginUser({ email, password });
      setUser(response.user);
      return response;
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    }
  }, []);

  // Logout handler
  const logout = useCallback(async () => {
    try {
      setError(null);
      await logoutUser();
      setUser(null);
    } catch (err) {
      setError(err.message || 'Logout failed');
      throw err;
    }
  }, []);

  // Check if user is authenticated
  const isAuthenticated = !!user && !!getAccessToken();

  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    register,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use Auth Context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
