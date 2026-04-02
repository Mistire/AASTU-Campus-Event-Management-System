import { Badge, BadgeProps } from "@/components/ui/badge";
import { ReactNode } from "react";

interface BadgeControllerProps extends BadgeProps {
  children: ReactNode;
  icon?: ReactNode;
}

export const BadgeController = ({ children, icon, className, ...props }: BadgeControllerProps) => {
  return (
    <Badge {...props} className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 whitespace-nowrap ${className || ""}`}>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </Badge>
  );
};
