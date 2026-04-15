import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { cemsColors, type CemsStatusVariant } from "./theme";
import { CemsStatusDot } from "./CemsStatusDot";
import { type ReactNode, type ComponentProps } from "react";

interface CemsBadgeProps extends Omit<ComponentProps<"span">, "color"> {
  /** Preset semantic variant — auto-applies colors */
  status?: CemsStatusVariant;
  /** Show a pulsing dot inside the badge */
  dot?: boolean;
  /** Optional icon before text */
  icon?: ReactNode;
  children: ReactNode;
}

/**
 * CEMS Badge — wraps shadcn Badge with brand-consistent status presets.
 *
 * Usage:
 *   <CemsBadge status="success" dot>Approved</CemsBadge>
 *   <CemsBadge status="warning">Pending</CemsBadge>
 */
export function CemsBadge({
  status = "neutral",
  dot = false,
  icon,
  children,
  className,
  ...props
}: CemsBadgeProps) {
  const s = cemsColors.status[status];

  return (
    <Badge
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest border whitespace-nowrap",
        s.bg,
        s.text,
        s.border,
        className,
      )}
      {...props}
    >
      {dot && <CemsStatusDot variant={status} pulse />}
      {icon && <span className="flex-shrink-0 [&_svg]:size-3">{icon}</span>}
      {children}
    </Badge>
  );
}
