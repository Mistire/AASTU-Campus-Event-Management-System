"use client";

import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

/* ─── Root ─────────────────────────────────────────────────────── */
export const CemsDropdown = DropdownMenu;
export const CemsDropdownTrigger = DropdownMenuTrigger;
export const CemsDropdownGroup = DropdownMenuGroup;
export const CemsDropdownSeparator = DropdownMenuSeparator;

/* ─── Content ──────────────────────────────────────────────────── */
interface CemsDropdownContentProps
  extends React.ComponentProps<typeof DropdownMenuContent> {}

export function CemsDropdownContent({
  className,
  ...props
}: CemsDropdownContentProps) {
  return (
    <DropdownMenuContent
      className={cn(
        "min-w-[200px] rounded-xl bg-white p-1.5 shadow-xl shadow-gray-200/50 ring-1 ring-gray-100 animate-in fade-in-0 zoom-in-95",
        className,
      )}
      {...props}
    />
  );
}

/* ─── Label ────────────────────────────────────────────────────── */
export function CemsDropdownLabel({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuLabel>) {
  return (
    <DropdownMenuLabel
      className={cn(
        "px-3 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest",
        className,
      )}
      {...props}
    />
  );
}

/* ─── Item ─────────────────────────────────────────────────────── */
interface CemsDropdownItemProps
  extends React.ComponentProps<typeof DropdownMenuItem> {
  /** Icon displayed before the label */
  icon?: React.ReactNode;
  /** Danger styling (red text, red hover) */
  danger?: boolean;
}

export function CemsDropdownItem({
  icon,
  danger = false,
  className,
  children,
  ...props
}: CemsDropdownItemProps) {
  return (
    <DropdownMenuItem
      className={cn(
        "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors",
        danger
          ? "text-red-500 focus:bg-red-50 focus:text-red-600"
          : "text-gray-600 focus:bg-brand/5 focus:text-brand",
        className,
      )}
      {...props}
    >
      {icon && (
        <span className="flex-shrink-0 [&_svg]:size-4 text-current opacity-70">
          {icon}
        </span>
      )}
      {children}
    </DropdownMenuItem>
  );
}
