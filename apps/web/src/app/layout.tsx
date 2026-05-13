import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import SmoothScroll from "@/components/ui/SmoothScroll";
import { Toaster } from "@/components/shared/ToastController";

const sans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const brand = Space_Grotesk({
  variable: "--font-brand",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CEMS: Campus Event Management System",
  description:
    "Discover, organize, and participate in campus events at Addis Ababa Science and Technology University.",
};

import { SupportFAB } from "@/features/support/components/SupportFAB";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${brand.variable} antialiased font-sans`}
      suppressHydrationWarning
    >
      <body className="flex flex-col">
        <Toaster 
          position="top-right"
          richColors
          theme="system"
          toastOptions={{
            style: {
              background: 'var(--background)',
              backdropFilter: 'blur(8px)',
              border: '1px solid var(--border)',
              borderRadius: '1rem',
              fontFamily: 'var(--font-brand)',
              color: 'var(--color-brand)',
            },
            className: 'font-brand font-bold',
          }}
        />
        <Providers>
          <SmoothScroll>{children}</SmoothScroll>
          <SupportFAB />
        </Providers>
      </body>
    </html>
  );
}
