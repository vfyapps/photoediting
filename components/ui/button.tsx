import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  // background-color is intentionally NOT transitioned: it's driven by an
  // untyped CSS custom property (--primary etc.) that changes via the .dark
  // class, and transitioning an untyped var()-driven color gets stuck at
  // its pre-toggle value in at least Chromium (confirmed in fase-2
  // verification — see SKILL.md). transform/box-shadow are safe: real
  // properties, not indirected through a theme-switchable custom property.
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-body font-semibold transition-[transform,box-shadow] duration-fast ease-standard disabled:pointer-events-none disabled:opacity-45 focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 active:scale-[0.98] [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-vfy-teal rounded-md",
        secondary: "bg-secondary text-secondary-foreground border border-border hover:bg-muted rounded-md",
        ghost: "bg-transparent text-foreground hover:bg-secondary rounded-md",
        destructive: "bg-destructive text-destructive-foreground hover:bg-vfy-coral-hover rounded-md",
      },
      size: {
        sm: "h-8 px-3 text-[13px] rounded-sm",
        md: "h-9 px-4 text-sm",
        lg: "h-11 px-5 text-[15px]",
        icon: "size-9 rounded-full p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
