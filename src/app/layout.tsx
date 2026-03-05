import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WikiForge - AI-Powered Encyclopedia Platform",
  description:
    "Create and manage AI-powered encyclopedias on any topic",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50 text-gray-900 font-sans">
        <div className="ambient-sphere ambient-sphere--left" aria-hidden="true" />
        <div className="ambient-sphere ambient-sphere--right" aria-hidden="true" />

        <div className="relative z-10">
          <nav className="bg-white/90 border-b border-gray-200 backdrop-blur-sm">
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
              <a href="/" className="text-xl font-bold text-blue-600">
                WikiForge
              </a>
              <a
                href="/wiki/new"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Create Wiki
              </a>
            </div>
          </nav>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
