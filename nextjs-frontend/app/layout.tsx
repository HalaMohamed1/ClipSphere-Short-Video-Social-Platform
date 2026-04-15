import React from "react";
import Navbar from "../components/Navbar";
import "./globals.css";

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
      <body className="bg-[#050505] min-h-screen text-gray-100 font-sans antialiased selection:bg-purple-500/30 selection:text-white overflow-x-hidden">
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden z-[-1] pointer-events-none">
          <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/10 blur-[150px]"></div>
          <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-rose-900/10 blur-[150px]"></div>
        </div>

        <Navbar />
        
        <main className="pt-24 pb-16 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
