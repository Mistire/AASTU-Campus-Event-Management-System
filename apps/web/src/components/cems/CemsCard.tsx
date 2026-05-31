import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

/* ─── Variant types ──────────────────────────────────────────────── */
type CemsCardVariant = "default" | "glass" | "flat" | "outlined";

/* ─── Root Card ──────────────────────────────────────────────────── */
interface CemsCardProps extends React.ComponentProps<"div"> {
  variant?: CemsCardVariant;
  /** Subtle hover lift effect */
  hoverable?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<CemsCardVariant, string> = {
  default:
    "bg-white dark:bg-gray-900 rounded-lg shadow-sm shadow-gray-200/60 dark:shadow-none ring-1 ring-gray-100 dark:ring-gray-800",
  glass:
    "bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-lg shadow-sm ring-1 ring-white/40 dark:ring-gray-800",
  flat: "bg-gray-50/60 dark:bg-gray-800/40 rounded-lg ring-0 shadow-none",
  outlined: "bg-white dark:bg-transparent rounded-lg ring-1 ring-gray-200 dark:ring-gray-800 shadow-none",
};

/**
 * CEMS Card — wraps shadcn Card with brand-consistent styling.
 *
 * Variants:
 *  - `default` — subtle shadow + ring (dashboard cards)
 *  - `glass`   — glassmorphism (overlays, modals)
 *  - `flat`    — no shadow, muted bg (nested sections)
 *  - `outlined` — border only (forms)
 */
export function CemsCard({
  variant = "default",
  hoverable = false,
  className,
  children,
  ...props
}: CemsCardProps) {
  return (
    <Card
      className={cn(
        variantStyles[variant],
        hoverable &&
          "transition-all duration-300 hover:shadow-md hover:shadow-gray-200/80 dark:hover:shadow-brand/5 hover:-translate-y-0.5",
        "overflow-hidden",
        className,
      )}
      {...props}
    >
      {children}
    </Card>
  );
}

/* ─── Card Header ────────────────────────────────────────────────── */
interface CemsCardHeaderProps extends Omit<React.ComponentProps<"div">, "title"> {
  /** Optional icon (rendered in a brand-tinted box) */
  icon?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Right-aligned action slot */
  action?: React.ReactNode;
  /** Render a bottom border */
  bordered?: boolean;
}

export function CemsCardHeader({
  icon,
  title,
  description,
  action,
  bordered = false,
  className,
  children,
  ...props
}: CemsCardHeaderProps) {
  return (
    <CardHeader
      className={cn(
        "px-5 py-4",
        bordered && "border-b border-gray-100 dark:border-gray-800",
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
        <div className="flex-1 min-w-0">
          {title && (
            <CardTitle className="text-sm font-bold text-gray-900 dark:text-white tracking-tight leading-tight">
              {title}
            </CardTitle>
          )}
          {description && (
            <CardDescription className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              {description}
            </CardDescription>
          )}
        </div>
        {action && <CardAction>{action}</CardAction>}
      </div>
      {children}
    </CardHeader>
  );
}

/* ─── Card Content ───────────────────────────────────────────────── */
export function CemsCardContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <CardContent className={cn("px-5 py-4", className)} {...props} />;
}

/* ─── Card Footer ────────────────────────────────────────────────── */
export function CemsCardFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <CardFooter
      className={cn(
        "px-5 py-3 border-t border-gray-50 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/30",
        className,
      )}
      {...props}
    />
  );
}
