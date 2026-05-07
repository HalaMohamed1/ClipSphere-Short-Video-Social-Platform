"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { API_BASE } from "@/lib/api";
import { loginSchema, formatValidationErrors, type LoginData } from "@/lib/validators";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setErrors({});
    setLoading(true);

    try {
      // Validate input with Zod
      const validatedData = loginSchema.parse({ email, password });

      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validatedData),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }
      
      // Store token in localStorage for Socket.io authentication
      if (data.data?.token) {
        localStorage.setItem('jwtToken', data.data.token);
        console.log('✅ Token stored in localStorage for Socket.io');
      }
      
      window.location.href = callbackUrl;
    } catch (err: unknown) {
      if (err instanceof Error) {
        // Check if it's a Zod validation error
        if (err.message.includes('[') && err.message.includes(']')) {
          try {
            const zodError = JSON.parse(err.message);
            if (zodError.errors) {
              setErrors(formatValidationErrors(zodError));
            } else {
              setError(err.message);
            }
          } catch {
            setError(err.message);
          }
        } else {
          setError(err.message);
        }
      } else {
        setError("Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-gray-400">Loading…</div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-white mb-2">Log in</h1>
      <p className="text-gray-400 mb-8">
        New here?{" "}
        <Link href="/register" className="text-zinc-400 hover:text-zinc-200 underline underline-offset-2">
          Create an account
        </Link>
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 px-4 py-3 text-sm">
            {error}
          </div>
        )}
        <div>
          <label className="block text-sm text-gray-300 mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full rounded-md bg-zinc-900 border px-4 py-2 text-white focus:ring-1 focus:ring-zinc-600 outline-none ${
              errors.email ? 'border-red-500' : 'border-zinc-800'
            }`}
          />
          {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-1">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="w-full rounded-md bg-zinc-900 border border-zinc-800 px-4 py-2 text-white focus:ring-1 focus:ring-zinc-600 outline-none"
          />
          {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-zinc-100 text-zinc-950 font-medium py-3 hover:bg-white disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto px-4 py-16 text-gray-400">Loading…</div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
