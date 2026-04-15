import { cn } from "@/lib/utils";
import { cemsColors, type CemsStatusVariant } from "./theme";

interface CemsStatusDotProps {
  variant?: CemsStatusVariant;
  pulse?: boolean;
  className?: string;
}

export function CemsStatusDot({ variant = "neutral", pulse = false, className }: CemsStatusDotProps) {
  const colors = cemsColors.status[variant];

  return (
    <span
      className={cn(
        "inline-block w-2 h-2 rounded-full shrink-0",
        colors.dot,
        pulse && "animate-pulse",
        className,
      )}
    />
  );
}
