"use client";


export function DiscoveryHeader() {
  return (
    <header className="pt-1 space-y-2 ml-3">
      <div className="flex items-center gap-3">
        <h1 className="text-5xl font-black tracking-tight text-gray-900 uppercase leading-none">
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
