"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "../hooks/useAuth";

export default function Navbar() {
  const { user, loading, logout } = useAuth();

  return (
    <nav className="fixed w-full z-50 top-0 start-0 backdrop-blur-md bg-gradient-to-b from-black to-gray-950 border-b border-gray-700 shadow-lg transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-gray-900 to-black shadow-lg shadow-white/10 flex items-center justify-center transform group-hover:scale-105 transition-transform">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="ml-3 text-xl font-black text-white drop-shadow-lg">
                ClipSphere
              </span>
            </Link>
          </div>

          <div className="flex-1 max-w-md mx-8 hidden md:block">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-500 group-focus-within:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-4 py-2.5 border border-gray-600 rounded-full leading-5 bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-white sm:text-sm transition-all focus:bg-gray-800 focus:shadow-[0_0_0_3px_rgba(255,255,255,0.1)]"
                placeholder="Search videos, creators..."
              />
            </div>
          </div>

          <div className="flex flex-shrink-0 items-center justify-center">
            {loading ? (
              <div className="h-8 w-8 rounded-full border-2 border-t-white border-white/10 animate-spin" />
            ) : user ? (
              <div className="flex items-center gap-4">
                <button className="hidden sm:block text-sm font-semibold text-white transition-colors hover:text-gray-100 px-5 py-2">
                  Upload
                </button>
                <div className="relative group flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full p-[2px] bg-gradient-to-tr from-gray-700 to-gray-900 cursor-pointer shadow-lg border-2 border-white/40 hover:border-white/60 transition-colors">
                    <img
                      className="w-full h-full rounded-full object-cover border-[1px] border-gray-800"
                      src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=111111&color=ffffff`}
                      alt={user.name}
                    />
                  </div>
                  <button onClick={logout} className="text-sm font-semibold text-white/90 hover:text-white transition-colors py-1.5 px-3 hover:bg-white/10 rounded-lg">
                    Log out
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="text-white hover:text-gray-200 font-medium text-sm transition-colors py-2 px-4">
                  Log in
                </Link>
                <Link href="/register" className="text-black font-semibold text-sm transition-colors py-2 px-5 rounded-full bg-white hover:bg-gray-100">
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
