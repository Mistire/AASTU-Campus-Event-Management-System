import { cn } from "@/lib/utils";
import Link from "next/link";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  href?: string;
  hideText?: boolean;
}

export default function Logo({ className, size = "md", href = "/", hideText = false }: LogoProps) {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl",
  };

  const bracketClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-2xl",
  };

  return (
    <Link 
      href={href} 
      className={cn("inline-flex items-center gap-1 group", className)}
    >
      <div className="font-brand flex items-center tracking-tighter">
        {!hideText && (
          <span className={cn(
            "text-brand font-bold opacity-30 select-none transition-opacity group-hover:opacity-60",
            bracketClasses[size]
          )}>
            [
          </span>
        )}
        <span className={cn(
          "mx-1 font-black bg-linear-to-r from-brand via-blue-500 to-cyan-400 bg-clip-text text-transparent transition-all duration-500 group-hover:from-blue-600 group-hover:to-brand",
          sizeClasses[size]
        )}>
          {hideText ? "C" : "CEMS"}
        </span>
        {!hideText && (
          <span className={cn(
            "text-brand font-bold opacity-30 select-none transition-opacity group-hover:opacity-60",
            bracketClasses[size]
          )}>
            ]
          </span>
        )}
      </div>
    </Link>
  );
}
