"use client";

import { ProtectedRoute } from "@/features/permissions/components/ProtectedRoute";
import { DiscoveryNavbar } from "./DiscoveryNavbar";
import { DiscoverySidebar } from "./DiscoverySidebar";

export function DiscoveryLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-black">
        <DiscoveryNavbar />
        <div className="pt-16 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="flex gap-10">
            <DiscoverySidebar />
            <main className="flex-1 min-w-0">
              {children}
            </main>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
