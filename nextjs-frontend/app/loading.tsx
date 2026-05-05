"use client";

import React from "react";

export default function Loading() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-zinc-950/90 z-[100]">
      <div className="h-10 w-10 rounded-full border-2 border-zinc-700 border-t-zinc-300 animate-spin" />
      <p className="mt-6 text-zinc-500 text-sm font-medium tracking-wide uppercase">
        Loading…
      </p>
    </div>
  );
}
