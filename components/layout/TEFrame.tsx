"use client";

import { Navigation } from "./Navigation";

interface TEFrameProps {
  children: React.ReactNode;
}

export function TEFrame({ children }: TEFrameProps) {
  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="te-frame min-h-[calc(100vh-2rem)] md:min-h-[calc(100vh-3rem)] lg:min-h-[calc(100vh-4rem)] p-4 md:p-6 lg:p-8">
        {/* Corner indicators */}
        <div className="te-corner te-corner-tl" />
        <div className="te-corner te-corner-tr" />
        <div className="te-corner te-corner-bl" />
        <div className="te-corner te-corner-br" />

        {/* Navigation */}
        <Navigation />

        {/* Main content */}
        <main className="mt-8">{children}</main>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-te-gray">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-te-dark/60">
            <p>© {new Date().getFullYear()} Ashwin Kumar Uppala</p>
            <p className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Built with Next.js
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
