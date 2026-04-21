import { Input } from "@/components/ui/input";
import { ComponentProps, forwardRef, ElementType } from "react";
import { cn } from "@/lib/utils";

interface InputControllerProps extends ComponentProps<"input"> {
  label?: string;
  error?: string;
  icon?: ElementType;
  labelClassName?: string;
}

export const InputController = forwardRef<HTMLInputElement, InputControllerProps>(
  ({ label, error, icon: Icon, className, labelClassName, ...props }, ref) => {
    return (
      <div className="w-full space-y-2 group">
        {label && (
          <div className="flex items-center gap-2 px-1">
            {Icon && <Icon size={12} className="text-brand/50 group-focus-within:text-brand transition-colors" />}
            <label className={cn(
              "text-[10px] font-black text-gray-400 uppercase tracking-widest group-focus-within:text-gray-600 transition-colors",
              labelClassName
            )}>
              {label}
            </label>
          </div>
        )}
        <Input
          ref={ref}
          className={cn(
            "h-12 rounded-xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all font-semibold",
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-[10px] font-black text-red-500 uppercase tracking-widest px-1 animate-in fade-in slide-in-from-top-1 duration-300">{error}</p>
        )}
      </div>
    );
  }
);

InputController.displayName = "InputController";
