import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 backdrop-blur-md",
  {
    variants: {
      variant: {
        default:
          "border-primary/30 bg-primary/20 text-primary-foreground hover:bg-primary/30 hover:shadow-lg hover:shadow-primary/30",
        secondary:
          "border-white/20 bg-white/10 text-foreground hover:bg-white/20 hover:border-white/30",
        destructive:
          "border-destructive/30 bg-destructive/20 text-destructive-foreground hover:bg-destructive/30",
        outline: "text-foreground border-white/30 bg-white/5 hover:bg-white/10",
        glass: "glass-button text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
