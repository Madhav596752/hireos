// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authApi } from "@/api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("hireos_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  const setAuth = useCallback((userData, token) => {
    setUser(userData);
    localStorage.setItem("hireos_user", JSON.stringify(userData));
    if (token) localStorage.setItem("hireos_token", token);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("hireos_user");
    localStorage.removeItem("hireos_token");
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const { user, token } = await authApi.login(email, password);
      setAuth(user, token);
      return user;
    } finally {
      setLoading(false);
    }
  }, [setAuth]);

  const register = useCallback(async (data) => {
    setLoading(true);
    try {
      const { user, token } = await authApi.register(data);
      setAuth(user, token);
      return user;
    } finally {
      setLoading(false);
    }
  }, [setAuth]);

  // Refresh user data on mount if token exists
  useEffect(() => {
    const token = localStorage.getItem("hireos_token");
    if (token && !user) {
      authApi.getMe().then(setUser).catch(logout);
    }
  }, []); // eslint-disable-line

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
