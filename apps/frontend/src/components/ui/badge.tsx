import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium transition-colors", {
  variants: {
    variant: {
      default: "border-transparent bg-[#E8F0FE] text-[#1A73E8]",
      secondary: "border-transparent bg-[rgba(52,168,83,0.12)] text-[#34A853]",
      destructive: "border-transparent bg-[rgba(234,67,53,0.12)] text-[#EA4335]",
      outline: "border-[#DADCE0] bg-white text-[#5F6368]"
    }
  },
  defaultVariants: {
    variant: "default"
  }
});

export interface BadgeProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export const Badge = ({ className, variant, ...props }: BadgeProps) => <div className={cn(badgeVariants({ variant }), className)} {...props} />;
