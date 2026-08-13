import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, ...props }, ref) => {
    return (
      <input
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          "h-9 w-full rounded-sm border border-border bg-card px-3 font-body text-sm text-foreground",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-1",
          "aria-[invalid=true]:border-destructive",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
