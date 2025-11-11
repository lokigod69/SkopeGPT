import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TRPCProvider } from "@/lib/api/provider";
import { ClientInit } from "@/components/ClientInit";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Goal App - Discovery to Integration",
  description: "Build habits that stick. One micro-step at a time.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Goal App",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0B0D10",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning data-font-size="medium">
      <body className={`${inter.variable} font-sans min-h-dvh bg-slate-950 text-slate-100 antialiased`}>
        {/* Skip to main content link for screen readers */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>

        <ClientInit />
        <TRPCProvider>
          <main id="main-content" className="mx-auto w-full max-w-[720px] px-4 sm:px-6 pb-[env(safe-area-inset-bottom)]">
            {children}
          </main>
        </TRPCProvider>
      </body>
    </html>
  );
}
