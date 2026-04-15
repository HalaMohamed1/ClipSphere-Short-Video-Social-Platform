"use client";

import { useState, useEffect } from "react";
import { apiUrl } from "../lib/apiBase";
import { clearSessionToken } from "../lib/session";

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
      const token = typeof window !== "undefined" ? localStorage.getItem("token")?.trim() : "";
      if (!token) {
        setUser(null);
        setError(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await fetch(apiUrl("/api/v1/users/me"), {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401) {
          clearSessionToken();
          setUser(null);
          setError(null);
          return;
        }

        if (!res.ok) {
          if (res.status >= 502) {
            throw new Error(
              "API unreachable (port 5000). Start the backend: from repo root run `npm run dev`, or `npm run dev:all` for API + Next."
            );
          }
          throw new Error("Failed to authenticate user");
        }

        const data = await res.json();
        setUser(data.data?.user || data.user || data);
        setError(null);
      } catch (err: unknown) {
        setUser(null);
        const msg = err instanceof Error ? err.message : "An authentication error occurred";
        if (msg === "Failed to fetch" || msg.includes("NetworkError")) {
          setError(
            "Cannot reach the API. Start Express on port 5000 (`npm run dev` in the repo root) and ensure MongoDB is running."
          );
        } else {
          setError(msg);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, []);

  const logout = () => {
    clearSessionToken();
    setUser(null);
    window.location.href = "/login";
  };

  return { user, loading, error, isAuthenticated: !!user, logout };
}
