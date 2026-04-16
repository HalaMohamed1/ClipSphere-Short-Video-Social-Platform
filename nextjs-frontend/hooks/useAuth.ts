"use client";

import { useState, useEffect, useCallback } from "react";
import { apiCall, API_BASE } from "../lib/api";

export interface User {
  _id: string;
  username: string;
  email?: string;
  avatarKey?: string;
  role?: string;
  bio?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiCall<{ user: User }>("/users/me");
      setUser(data.user);
      setError(null);
    } catch {
      setUser(null);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const logout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      /* ignore */
    }
    setUser(null);
    window.location.href = "/login";
  };

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    logout,
    refresh,
  };
}
