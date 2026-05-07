"use client";

import React from "react";

export function ReviewCardSkeleton() {
  return (
    <div className="border border-zinc-800 rounded-lg p-4 bg-zinc-900/50 animate-fade-in">
      <div className="flex items-start gap-3">
        {}
        <div className="w-10 h-10 rounded-full bg-zinc-800 flex-shrink-0" />

        {}
        <div className="flex-1 min-w-0 space-y-2">
          {}
          <div className="flex items-center gap-2">
            <div className="h-3 bg-zinc-800 rounded w-1/4" />
            <div className="h-3 bg-zinc-800 rounded w-8" />
          </div>

          {}
          <div className="space-y-1">
            <div className="h-3 bg-zinc-800 rounded w-full" />
            <div className="h-3 bg-zinc-800 rounded w-5/6" />
          </div>

          {}
          <div className="h-2.5 bg-zinc-800 rounded w-1/6" />
        </div>
      </div>
    </div>
  );
}

export function ReviewsSectionSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <ReviewCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ProfileHeaderSkeleton() {
  return (
    <div className="space-y-4 pb-8 border-b border-zinc-800">
      {}
      <div className="w-full h-32 bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 bg-[length:200%_100%] animate-shimmer rounded-lg" />

      {}
      <div className="flex items-start gap-4">
        {}
        <div className="w-20 h-20 rounded-full bg-zinc-800 border-2 border-zinc-700 flex-shrink-0" />

        {}
        <div className="flex-1 space-y-2 pt-2">
          <div className="h-5 bg-zinc-800 rounded w-1/4" />
          <div className="h-3 bg-zinc-800 rounded w-1/3" />
          <div className="h-3 bg-zinc-800 rounded w-2/5 mt-3" />
        </div>
      </div>
    </div>
  );
}

export function SearchResultsSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="group block animate-fade-in"
        >
          <div className="relative aspect-[9/16] rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800">
            <div className="w-full h-full bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 bg-[length:200%_100%] animate-shimmer" />

            {}
            <div className="absolute top-3 right-3 bg-zinc-950 rounded border border-zinc-700">
              <div className="h-5 w-12 bg-zinc-800 rounded" />
            </div>

            {}
            <div className="absolute bottom-0 left-0 w-full p-4 bg-zinc-950/95 border-t border-zinc-800">
              <div className="flex items-end gap-3">
                <div className="w-11 h-11 rounded-full bg-zinc-800 border border-zinc-700 flex-shrink-0" />
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="h-3 bg-zinc-800 rounded w-full" />
                  <div className="h-2.5 bg-zinc-800 rounded w-2/3" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <div className="h-12 px-4 py-3 border-b border-zinc-800 flex items-center gap-4 bg-zinc-900/50 animate-fade-in">
      {}
      <div className="w-5 h-5 bg-zinc-800 rounded flex-shrink-0" />

      {}
      <div className="flex-1 flex gap-4">
        <div className="h-3 bg-zinc-800 rounded w-1/4" />
        <div className="h-3 bg-zinc-800 rounded w-1/3" />
        <div className="h-3 bg-zinc-800 rounded w-1/5" />
        <div className="h-3 bg-zinc-800 rounded w-1/6" />
      </div>

      {}
      <div className="w-8 h-8 bg-zinc-800 rounded" />
    </div>
  );
}

export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <TableRowSkeleton key={i} />
      ))}
    </div>
  );
}

export function CardGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-48 rounded-lg bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 bg-[length:200%_100%] animate-shimmer border border-zinc-800 animate-fade-in"
        />
      ))}
    </div>
  );
}

export function FormFieldSkeleton() {
  return (
    <div className="space-y-2">
      <div className="h-3 bg-zinc-800 rounded w-1/4" />
      <div className="h-10 bg-zinc-800 rounded" />
    </div>
  );
}

export function FormSkeleton({ fieldCount = 4 }: { fieldCount?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: fieldCount }).map((_, i) => (
        <FormFieldSkeleton key={i} />
      ))}
    </div>
  );
}

export function TextBlockSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => {
        const isLast = i === lines - 1;
        const width = isLast ? "w-5/6" : "w-full";
        return (
          <div key={i} className={`h-3 bg-zinc-800 rounded ${width}`} />
        );
      })}
    </div>
  );
}

export function HeaderSkeleton() {
  return (
    <div className="space-y-3 mb-8">
      <div className="h-8 bg-zinc-800 rounded w-1/3" />
      <div className="h-3 bg-zinc-800 rounded w-2/3" />
    </div>
  );
}
