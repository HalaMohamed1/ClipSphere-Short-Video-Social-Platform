"use client";

import { useState, useEffect } from "react";

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        setLoading(true);
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        
        const res = await fetch(`${API_URL}/api/v1/users/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to authenticate user");
        }

        const data = await res.json();
        setUser(data.data?.user || data.user || data);
        setError(null);
      } catch (err: any) {
        setUser(null);
        setError(err.message || "An authentication error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/login";
  };

  return { user, loading, error, isAuthenticated: !!user, logout };
}
