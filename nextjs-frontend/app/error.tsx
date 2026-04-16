"use client";

import React, { useEffect } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application Error Boundary Caught:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      <div className="bg-zinc-900 border border-zinc-800 p-8 md:p-10 rounded-lg max-w-lg w-full text-center">
        <div className="w-14 h-14 bg-red-950/50 border border-red-900/40 text-red-400 rounded-md flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h2 className="text-2xl font-semibold text-zinc-100 mb-3">Something went wrong</h2>
        <p className="text-zinc-500 mb-8 text-sm leading-relaxed">
          We could not load this content. Try again in a moment.
        </p>

        <button
          type="button"
          onClick={() => reset()}
          className="w-full bg-zinc-100 text-zinc-950 font-medium py-3 px-6 rounded-md hover:bg-white transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
