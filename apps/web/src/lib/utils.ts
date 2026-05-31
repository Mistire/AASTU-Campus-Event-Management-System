import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function truncate(text: string, length: number = 25) {
  if (!text) return "";
  return text.length > length ? text.substring(0, length) + "..." : text;
}
