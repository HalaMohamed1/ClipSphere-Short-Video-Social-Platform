"use client";

import { useState, useEffect, useCallback } from "react";
import { apiCall, API_BASE } from "../lib/api";
import { initializeSocket, joinUserRoom, disconnectSocket } from "../lib/socket";

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
    } catch (err) {
      setUser(null);
      // Silently fail if not authenticated
      setError(null);
      console.debug("Auth refresh failed (expected if not logged in):", err instanceof Error ? err.message : "Unknown error");
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
    } catch (err) {
      console.debug("Logout request failed:", err instanceof Error ? err.message : "Unknown error");
    }
    // Clear user state
    setUser(null);
    setError(null);
    // Clear token from localStorage
    localStorage.removeItem('jwtToken');
    console.log('🧹 Token cleared from localStorage');
    // Clear token cookie by setting it to empty
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    // Redirect to login page
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
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
