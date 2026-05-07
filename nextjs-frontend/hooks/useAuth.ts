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
      
      // Initialize socket and join user room when authenticated
      if (data.user) {
        initializeSocket();
        joinUserRoom(data.user._id);
      }
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
    disconnectSocket();
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
