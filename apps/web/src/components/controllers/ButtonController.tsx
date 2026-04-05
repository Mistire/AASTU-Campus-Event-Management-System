import { Button, buttonVariants } from "@/components/ui/button";
import { ReactNode, ComponentProps } from "react";
import { type VariantProps } from "class-variance-authority";

interface ButtonControllerProps extends ComponentProps<"button">, VariantProps<typeof buttonVariants> {
  children: ReactNode;
  loading?: boolean;
}

export const ButtonController = ({ children, loading, disabled, variant, size, className, ...props }: ButtonControllerProps) => {
  return (
    <Button 
      disabled={loading || disabled} 
      variant={variant} 
      size={size} 
      className={className}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          {children}
        </span>
      ) : (
        children
      )}
    </Button>
  );
};
