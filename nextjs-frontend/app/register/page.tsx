"use client";

import { useState } from "react";
import Link from "next/link";
import { API_BASE } from "@/lib/api";
import { registerSchema, formatValidationErrors, type RegisterData } from "@/lib/validators";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setErrors({});
    setLoading(true);

    try {
      // Validate input with Zod
      const validatedData = registerSchema.parse({ username, email, password });

      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validatedData),
      });
      
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || `Registration failed: ${res.statusText}`);
      }
      
      const data = await res.json();
      
      if (data.data?.token) {
        localStorage.setItem('jwtToken', data.data.token);
        console.log('✅ Token stored in localStorage');
      }
      
      // Add small delay to ensure cookie is fully written before navigation
      setTimeout(() => {
        window.location.href = "/";
      }, 200);
    } catch (err: unknown) {
      console.error('Registration error:', err);
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
        setError("Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-white mb-2">Create account</h1>
      <p className="text-gray-400 mb-8">
        Already have an account?{" "}
        <Link href="/login" className="text-zinc-400 hover:text-zinc-200 underline underline-offset-2">
          Log in
        </Link>
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 px-4 py-3 text-sm">
            {error}
          </div>
        )}
        <div>
          <label className="block text-sm text-gray-300 mb-1">Username</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={`w-full rounded-md bg-zinc-900 border px-4 py-2 text-white focus:ring-1 focus:ring-zinc-600 outline-none ${
              errors.username ? 'border-red-500' : 'border-zinc-800'
            }`}
          />
          {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username}</p>}
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-1">Email</label>
          <input
            type="email"
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full rounded-md bg-zinc-900 border px-4 py-2 text-white focus:ring-1 focus:ring-zinc-600 outline-none ${
              errors.password ? 'border-red-500' : 'border-zinc-800'
            }`}
          />
          {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-zinc-100 text-zinc-950 font-medium py-3 hover:bg-white disabled:opacity-50"
        >
          {loading ? "Creating…" : "Sign up"}
        </button>
      </form>
    </div>
  );
}
