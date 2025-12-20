import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/api.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          // getCurrentUser returns the parsed user object directly from localStorage
          const storedUser = authService.getCurrentUser();
          if (storedUser && storedUser.user) {
            setUser(storedUser.user);
          } else if (storedUser) {
            setUser(storedUser);
          } else {
            // If we have a token but no user info, clear token
            localStorage.removeItem("token");
            localStorage.removeItem("user");
          }
        } catch (error) {
          console.error("Failed to fetch user", error);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (credentials) => {
    const response = await authService.login(credentials);
    const { token, user } = response.data;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
  };

  const register = async (userData) => {
    const response = await authService.register(userData);
    const { token, user } = response.data;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const hasRole = (requiredRole) => {
    return user?.role === requiredRole;
  };

  const isLandlord = () => user?.role === 'landlord' || user?.role === 'agent';
  const isTenant = () => user?.role === 'tenant' || user?.role === 'general';
  const isCompany = () => user?.role === 'company';
  const isAgent = () => user?.role === 'agent';

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, hasRole, isLandlord, isTenant, isCompany, isAgent }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
