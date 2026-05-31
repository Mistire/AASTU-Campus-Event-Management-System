"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/* ─── Re-exports ───────────────────────────────────────────────── */
export const CemsDialog = Dialog;
export const CemsDialogTrigger = DialogTrigger;
export const CemsDialogClose = DialogClose;

/* ─── Content ──────────────────────────────────────────────────── */
interface CemsDialogContentProps
  extends React.ComponentProps<typeof DialogContent> {
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeMap = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-xl",
};

export function CemsDialogContent({
  size = "md",
  className,
  children,
  ...props
}: CemsDialogContentProps) {
  return (
    <DialogContent
      className={cn(
        "rounded-lg border-none bg-white dark:bg-gray-950 shadow-2xl shadow-gray-300/40 dark:shadow-none p-0 gap-0 overflow-hidden flex flex-col",
        sizeMap[size],
        className,
      )}
      {...props}
    >
      {children}
    </DialogContent>
  );
}

/* ─── Header ───────────────────────────────────────────────────── */
interface CemsDialogHeaderProps extends React.ComponentProps<"div"> {
  icon?: React.ReactNode;
}

export function CemsDialogHeader({
  icon,
  className,
  children,
  ...props
}: CemsDialogHeaderProps) {
  return (
    <DialogHeader
      className={cn(
        "px-6 py-4 border-b border-gray-100 dark:border-gray-800",
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-9 h-9 rounded-lg bg-brand/5 dark:bg-brand/10 flex items-center justify-center text-brand shrink-0 [&_svg]:size-[18px]">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </DialogHeader>
  );
}

/* ─── Title & Description ──────────────────────────────────────── */
export function CemsDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogTitle>) {
  return (
    <DialogTitle
      className={cn("text-sm font-bold text-gray-900 dark:text-white tracking-tight", className)}
      {...props}
    />
  );
}

export function CemsDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogDescription>) {
  return (
    <DialogDescription
      className={cn("text-xs text-gray-400 mt-0.5", className)}
      {...props}
    />
  );
}

/* ─── Footer ───────────────────────────────────────────────────── */
export function CemsDialogFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "px-8 py-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex items-center justify-end gap-3 mt-auto shrink-0",
        className,
      )}
      {...props}
    />
  );
}
