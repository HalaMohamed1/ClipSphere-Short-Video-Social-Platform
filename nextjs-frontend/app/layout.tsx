import React, { Suspense } from "react";
import "./globals.css";
import Navbar from "../components/Navbar";

export const metadata = {
  title: "ClipSphere | Short Video Social Platform",
  description: "Discover, share, and enjoy amazing short videos from around the world.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-zinc-950 min-h-screen text-zinc-100 font-sans antialiased selection:bg-zinc-700 selection:text-white overflow-x-hidden">
        <Suspense
          fallback={
            <nav className="fixed w-full z-50 top-0 start-0 h-16 bg-zinc-950 border-b border-zinc-800" />
          }
        >
          <Navbar />
        </Suspense>
        
        <main className="pt-24 pb-16 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
