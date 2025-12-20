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
          // getCurrentUser returns the user object directly from localStorage (synchronous)
          const storedUser = authService.getCurrentUser();
          if (storedUser) {
            setUser(storedUser);
          } else {
            // If we have a token but no user info, we might want to fetch profile or clear token
            // For now, let's assume if user is missing from local storage, session is invalid
            localStorage.removeItem("token");
          }
        } catch (error) {
          console.error("Failed to fetch user", error);
          localStorage.removeItem("token");
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
    setUser(user);
  };

  const register = async (userData) => {
    const response = await authService.register(userData);
    const { token, user } = response.data;
    localStorage.setItem("token", token);
    setUser(user);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
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
