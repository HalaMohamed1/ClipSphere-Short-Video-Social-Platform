"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../hooks/useAuth";

const SEARCH_DEBOUNCE_MS = 280;

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const qOnHome = pathname === "/" ? (searchParams.get("q") ?? "").trim() : "";
  const [searchInput, setSearchInput] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (pathname === "/") {
      setSearchInput(searchParams.get("q") ?? "");
    }
  }, [pathname, searchParams]);

  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    },
    []
  );

  const pushSearchUrl = (raw: string) => {
    const q = raw.trim();
    if (q) {
      router.replace(`/?q=${encodeURIComponent(q)}`);
    } else if (pathname === "/") {
      router.replace("/");
    }
  };

  const schedulePush = (raw: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      pushSearchUrl(raw);
    }, SEARCH_DEBOUNCE_MS);
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    pushSearchUrl(searchInput);
  };

  const clearSearch = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSearchInput("");
    if (pathname === "/" && qOnHome) router.replace("/");
  };

  return (
    <nav className="fixed w-full z-50 top-0 start-0 bg-zinc-950 border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center group">
              <div className="w-8 h-8 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="ml-3 text-xl font-semibold text-zinc-100">
                ClipSphere
              </span>
            </Link>
          </div>

          <form
            onSubmit={submitSearch}
            className="flex-1 max-w-md mx-4 md:mx-8 min-w-0"
            role="search"
          >
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-zinc-500 group-focus-within:text-zinc-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                name="q"
                type="text"
                enterKeyHint="search"
                autoComplete="off"
                value={searchInput}
                onChange={(e) => {
                  const v = e.target.value;
                  setSearchInput(v);
                  schedulePush(v);
                }}
                className="block w-full pl-10 pr-9 py-2 border border-zinc-800 rounded-md leading-5 bg-zinc-900 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-600 sm:text-sm"
                placeholder="Search videos…"
                aria-label="Search videos"
              />
              {searchInput ? (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-1.5 flex items-center justify-center rounded text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/80 p-1"
                  aria-label="Clear search"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-4 w-4"
                    aria-hidden
                  >
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                </button>
              ) : null}
            </div>
          </form>

          <div className="flex flex-shrink-0 items-center justify-center">
            {loading ? (
              <div className="h-8 w-8 rounded-full border-2 border-t-zinc-400 border-zinc-800 animate-spin" />
            ) : user ? (
              <div className="flex items-center gap-4">
                  <Link
                  href="/upload"
                  className="hidden sm:block text-sm font-medium text-zinc-200 hover:text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 px-4 py-2 rounded-md"
                >
                  Upload
                </Link>
                {user.role === "admin" && (
                  <Link
                    href="/admin"
                    className="hidden sm:block text-sm font-medium text-zinc-200 px-3 py-2 rounded-md border border-zinc-700 hover:bg-zinc-800"
                  >
                    Admin
                  </Link>
                )}
                <div className="relative group flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full p-[1px] bg-zinc-700 cursor-pointer">
                    <img
                      className="w-full h-full rounded-full object-cover border-2 border-black"
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=111111&color=ffffff`}
                      alt={user.username}
                    />
                  </div>
                  <Link
                    href="/settings"
                    className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                  >
                    Settings
                  </Link>
                  <button onClick={logout} className="text-sm font-medium text-zinc-500 hover:text-zinc-300 transition-colors">
                    Log out
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="text-zinc-300 hover:text-white font-medium text-sm py-2 px-4 rounded-md hover:bg-zinc-900">
                  Log in
                </Link>
                <Link href="/register" className="bg-zinc-100 text-zinc-950 font-medium text-sm px-5 py-2 rounded-md hover:bg-white">
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
