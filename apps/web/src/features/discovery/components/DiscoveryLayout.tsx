"use client";

import { ProtectedRoute } from "@/features/permissions/components/ProtectedRoute";
import { DiscoveryNavbar } from "./DiscoveryNavbar";

export function DiscoveryLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <DiscoveryNavbar />
        <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
