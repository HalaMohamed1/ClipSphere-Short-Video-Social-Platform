"use client";

import React from "react";

export default function Loading() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md z-[100]">
      <div className="relative flex justify-center items-center w-24 h-24">
        {/* Outer glowing animated ring */}
        <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-purple-500 border-r-rose-500 border-b-amber-500 animate-[spin_1.5s_linear_infinite]" />
        
        {/* Inner static border */}
        <div className="absolute inset-2 rounded-full border border-white/10" />
        
        {/* Center logo pulsing */}
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.6)] flex items-center justify-center animate-pulse">
          <span className="text-white font-bold text-xl">C</span>
        </div>
      </div>
      
      <p className="mt-8 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 font-medium tracking-widest uppercase text-xs sm:text-sm animate-pulse">
        Loading clips...
      </p>
    </div>
  );
}
