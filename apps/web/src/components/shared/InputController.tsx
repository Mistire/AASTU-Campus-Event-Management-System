import { Input } from "@/components/ui/input";
import { ComponentProps, forwardRef } from "react";

interface InputControllerProps extends ComponentProps<"input"> {
  label?: string;
  error?: string;
}

export const InputController = forwardRef<HTMLInputElement, InputControllerProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <Input
          ref={ref}
          className={className}
          {...props}
        />
        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

InputController.displayName = "InputController";
