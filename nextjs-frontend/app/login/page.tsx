'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/auth/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Login failed');
      }

      const data = await response.json();
      if (data.data && data.data.token) {
        localStorage.setItem('authToken', data.data.token);
        router.push('/');
      } else {
        setError('No token received from server');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-700 rounded-lg p-8">
          <h1 className="text-3xl font-bold text-white mb-2">ClipSphere</h1>
          <p className="text-gray-400 mb-8">Sign in to your account</p>

          {error && (
            <div className="bg-red-500 text-white p-3 rounded mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-gray-900 text-white border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-white"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-gray-900 text-white border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-white"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white font-semibold py-2 rounded border border-white hover:bg-gray-900 disabled:opacity-50 transition"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-gray-400 mt-6">
            Don't have an account?{' '}
            <Link href="/signup" className="text-white hover:text-gray-300 underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
