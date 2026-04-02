import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import SmoothScroll from "@/components/ui/SmoothScroll";
import { Toaster } from "sonner";

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
  description: "Discover, organize, and participate in campus events at Addis Ababa Science and Technology University.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${brand.variable} h-full antialiased font-sans`}
    >
      <body className="min-h-full flex flex-col">
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(8px)',
              border: '1px solid var(--border)',
              borderRadius: '1rem',
              fontFamily: 'var(--font-brand)',
              color: 'var(--primary)',
            },
            className: 'font-brand font-bold',
          }}
        />
        <Providers>
          <SmoothScroll>{children}</SmoothScroll>
        </Providers>
      </body>
    </html>
  );
}
