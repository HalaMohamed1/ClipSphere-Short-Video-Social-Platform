"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "../hooks/useAuth";

export default function Navbar() {
  const { user, loading, logout } = useAuth();

  return (
    <nav className="fixed w-full z-50 top-0 start-0 backdrop-blur-md bg-black/60 border-b border-white/10 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-rose-500 shadow-lg shadow-rose-500/30 flex items-center justify-center transform group-hover:scale-105 transition-transform">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="ml-3 text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                ClipSphere
              </span>
            </Link>
          </div>

          <div className="flex-1 max-w-md mx-8 hidden md:block">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400 group-focus-within:text-purple-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-white/10 rounded-full leading-5 bg-white/5 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-300 sm:text-sm transition-all focus:bg-black/50"
                placeholder="Search videos, creators..."
              />
            </div>
          </div>

          <div className="flex flex-shrink-0 items-center justify-center">
            {loading ? (
              <div className="h-8 w-8 rounded-full border-2 border-t-purple-500 border-white/10 animate-spin" />
            ) : user ? (
              <div className="flex items-center gap-4">
                <Link
                  href="/upload"
                  className="hidden sm:block text-sm font-medium text-white/80 hover:text-white transition-colors bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full"
                >
                  Upload
                </Link>
                <div className="relative group flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full p-[2px] bg-gradient-to-tr from-purple-500 to-rose-500 cursor-pointer shadow-lg">
                    <img
                      className="w-full h-full rounded-full object-cover border-2 border-black"
                      src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=111111&color=ffffff`}
                      alt={user.name}
                    />
                  </div>
                  <button onClick={logout} className="text-sm font-medium text-rose-400 hover:text-rose-300 transition-colors">
                    Log out
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="text-white/80 hover:text-white font-medium text-sm transition-colors py-2 px-4 rounded-full hover:bg-white/5">
                  Log in
                </Link>
                <Link href="/register" className="bg-white text-black font-semibold text-sm px-5 py-2 rounded-full hover:bg-gray-200 transform hover:scale-[1.02] transition-all shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
