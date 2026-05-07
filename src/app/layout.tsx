import type { Metadata } from "next";
import Link from "next/link";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI-CDIO · Fractional Executive OS",
  description:
    "Methodology operating system for fractional CDIOs and the CEOs they advise.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">
          <div className="flex-1">{children}</div>
          <footer className="border-t border-gray-200 bg-gray-50 print:hidden">
            <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">
              <span>
                &copy; {new Date().getFullYear()} AI-CDIO &middot; Fractional
                Executive OS
              </span>
              <nav className="flex flex-wrap items-center gap-4">
                <Link href="/terms" className="hover:text-gray-900">
                  Terms
                </Link>
                <Link href="/privacy" className="hover:text-gray-900">
                  Privacy
                </Link>
                <Link href="/ai-disclaimer" className="hover:text-gray-900">
                  AI Disclaimer
                </Link>
              </nav>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
