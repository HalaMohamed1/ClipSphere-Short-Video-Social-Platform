"use client";

import React, { Suspense } from "react";
import Feed from "../components/Feed";

function FeedFallback() {
  return (
    <div className="px-4 py-8 max-w-[1400px] mx-auto">
      <div className="h-10 w-48 bg-zinc-900 rounded-md animate-pulse mb-8" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="aspect-[9/16] rounded-lg bg-zinc-900 border border-zinc-800 animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Suspense fallback={<FeedFallback />}>
        <Feed />
      </Suspense>
    </div>
  );
}
