"use client";

import { ThemeToggle } from "@/components/theme/ThemeToggle";

export function DiscoveryHeader() {
  return (
    <header className="pt-1 space-y-2 ml-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white uppercase leading-none">
             Discovery <span className="text-brand">Center</span>
          </h1>
        </div>
      </div>
      <p className="text-gray-500 dark:text-gray-400 font-medium max-w-lg leading-relaxed">
        Find your next challenge, workshop, or connection. Personalized for your
        interests and department.
      </p>
    </header>
  );
}
