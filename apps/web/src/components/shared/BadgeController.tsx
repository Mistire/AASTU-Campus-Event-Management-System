import { Badge, badgeVariants } from "@/components/ui/badge";
import { ReactNode, ComponentProps } from "react";
import { type VariantProps } from "class-variance-authority";

interface BadgeControllerProps extends ComponentProps<"span">, VariantProps<typeof badgeVariants> {
  children: ReactNode;
  icon?: ReactNode;
}

export const BadgeController = ({ children, icon, className, variant, ...props }: BadgeControllerProps) => {
  return (
    <Badge 
      variant={variant} 
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 whitespace-nowrap ${className || ""}`}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </Badge>
  );
};
