/**
 * CEMS Design System — Configurable Theme
 *
 * Change these values to rebrand the entire app.
 * Every CEMS component pulls its colors from here.
 */

export const cemsColors = {
  /** Primary brand swatch (used for buttons, active sidebar, chart-1, etc.) */
  brand: {
    DEFAULT: "oklch(0.68 0.155 231)",  // sky-400 ish
    hover: "oklch(0.60 0.155 231)",
    subtle: "oklch(0.95 0.04 231)",    // very faint bg tint
    muted: "oklch(0.88 0.06 231)",     // softer ring / accent
    foreground: "#ffffff",
  },

  /** Chart palette — used by Recharts in order */
  chart: [
    "oklch(0.68 0.155 231)",   // brand blue
    "oklch(0.72 0.17 160)",    // emerald
    "oklch(0.75 0.18 85)",     // amber
    "oklch(0.65 0.20 310)",    // violet
    "oklch(0.70 0.19 15)",     // rose
    "oklch(0.60 0.12 200)",    // slate blue
  ],

  /** Semantic status colors */
  status: {
    success: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100", dot: "bg-emerald-500" },
    warning: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-100", dot: "bg-amber-500" },
    danger:  { bg: "bg-red-50", text: "text-red-600", border: "border-red-100", dot: "bg-red-500" },
    info:    { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100", dot: "bg-blue-500" },
    neutral: { bg: "bg-gray-50", text: "text-gray-500", border: "border-gray-100", dot: "bg-gray-400" },
  },
} as const;

/** Tailwind-friendly HEX approximations for Recharts (which needs actual color strings) */
export const chartColorsFallback = [
  "#38bdf8", // brand blue
  "#34d399", // emerald
  "#fbbf24", // amber
  "#a78bfa", // violet
  "#fb7185", // rose
  "#64748b", // slate
];

export type CemsStatusVariant = keyof typeof cemsColors.status;
