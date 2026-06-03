import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import SmoothScroll from "@/components/ui/SmoothScroll";
import { Toaster } from "@/components/shared/ToastController";

export const metadata: Metadata = {
  title: "CEMS: Campus Event Management System",
  description:
    "Discover, organize, and participate in campus events at Addis Ababa Science and Technology University.",
  // Next.js 13+ serves /manifest.webmanifest automatically via the manifest.ts route handler.
  // No need to set `manifest` here — it would create a duplicate link tag.
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CEMS",
    startupImage: "/icon-512.png",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#38bdf8" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

import { SupportFAB } from "@/features/support/components/SupportFAB";
import { PWAInstallPrompt } from "@/components/shared/PWAInstallPrompt";
import Script from "next/script";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="antialiased font-sans"
      suppressHydrationWarning
    >
      <head>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className="flex flex-col min-h-screen">
        <Toaster
          position="top-right"
          richColors
          theme="system"
          toastOptions={{
            style: {
              background: "var(--background)",
              backdropFilter: "blur(8px)",
              border: "1px solid var(--border)",
              borderRadius: "1rem",
              fontFamily: "var(--font-brand)",
              color: "var(--color-brand)",
            },
            className: "font-brand font-bold",
          }}
        />
        <Providers>
          {children}
          <SupportFAB />
          <PWAInstallPrompt />
        </Providers>
      </body>
    </html>
  );
}

