import { Button, ButtonProps } from "@/components/ui/button";
import { ReactNode } from "react";

interface ButtonControllerProps extends ButtonProps {
  children: ReactNode;
  loading?: boolean;
}

export const ButtonController = ({ children, loading, disabled, ...props }: ButtonControllerProps) => {
  return (
    <Button disabled={loading || disabled} {...props}>
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
