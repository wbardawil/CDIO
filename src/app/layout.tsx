import type { Metadata } from "next";
import Link from "next/link";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Fraunces carries authority — a serif headline reads "advisor", not
// "SaaS". Wired to the --font-serif token in globals.css.
const fraunces = Fraunces({
  variable: "--font-fraunces",
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
        className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">
          <div className="flex-1">{children}</div>
          <footer className="border-t border-hair bg-paper print:hidden">
            <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-3 text-xs text-faint">
              <span>
                &copy; {new Date().getFullYear()} AI-CDIO &middot; Fractional
                Executive OS
              </span>
              <nav className="flex flex-wrap items-center gap-4">
                <Link href="/terms" className="hover:text-ink">
                  Terms
                </Link>
                <Link href="/privacy" className="hover:text-ink">
                  Privacy
                </Link>
                <Link href="/ai-disclaimer" className="hover:text-ink">
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
