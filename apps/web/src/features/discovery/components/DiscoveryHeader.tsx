"use client";

import { LayoutGrid } from "lucide-react";

export function DiscoveryHeader() {
  return (
    <header className="pt-4 space-y-2">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-brand/10 flex items-center justify-center">
          <LayoutGrid className="text-brand" size={20} />
        </div>
        <h1 className="text-4xl font-black tracking-tight text-gray-900">
          Discovery <span className="text-brand">Center</span>
        </h1>
      </div>
      <p className="text-gray-500 font-medium max-w-lg leading-relaxed">
        Find your next challenge, workshop, or connection. Personalized for your
        interests and department.
      </p>
    </header>
  );
}
