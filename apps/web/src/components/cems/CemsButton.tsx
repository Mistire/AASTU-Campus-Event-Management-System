"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { type ComponentProps } from "react";

/**
 * Extended brand variants layered on top of the base shadcn button.
 * These add CEMS-specific appearances while keeping the accessible
 * primitives from @base-ui underneath.
 */
const cemsButtonVariants = cva("", {
  variants: {
    cemsVariant: {
      /** Solid brand fill */
      brand:
        "bg-brand text-white hover:bg-brand/90 border-brand focus-visible:ring-brand/40 shadow-sm shadow-brand/20",
      /** Brand outline */
      "brand-outline":
        "border-brand/30 text-brand bg-transparent hover:bg-brand/5 focus-visible:ring-brand/30",
      /** Subtle brand tint */
      "brand-subtle":
        "bg-brand/5 text-brand border-transparent hover:bg-brand/10",
      /** Ghost with brand hover */
      "brand-ghost":
        "text-gray-500 bg-transparent border-transparent hover:bg-brand/5 hover:text-brand",
    },
  },
});

export type CemsButtonVariant = NonNullable<
  VariantProps<typeof cemsButtonVariants>["cemsVariant"]
>;

import { Loader2 } from "lucide-react";

interface CemsButtonProps extends ComponentProps<typeof Button> {
  /** CEMS brand variant — overrides the shadcn `variant` prop when set */
  cemsVariant?: CemsButtonVariant;
  /** Shows a spinner and disables the button */
  loading?: boolean;
}

/**
 * CEMS Button — wraps shadcn Button with 4 branded variants.
 *
 * Usage:
 *   <CemsButton cemsVariant="brand">Save</CemsButton>
 *   <CemsButton cemsVariant="brand-outline" size="sm">Cancel</CemsButton>
 *
 * You can still use standard shadcn variants:
 *   <CemsButton variant="destructive">Delete</CemsButton>
 */
export function CemsButton({
  cemsVariant,
  className,
  loading,
  disabled,
  children,
  ...props
}: CemsButtonProps) {
  return (
    <Button
      className={cn(
        cemsVariant && cemsButtonVariants({ cemsVariant }),
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin mr-1.5" />}
      {children}
    </Button>
  );
}

export { cemsButtonVariants };
