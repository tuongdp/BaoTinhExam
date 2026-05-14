import type { ButtonHTMLAttributes } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-10 items-center justify-center gap-2 whitespace-nowrap rounded text-sm font-medium transition-[background,border-color,box-shadow,color] focus-visible:outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-[#F3F3F3] disabled:text-[#9AA0A6] disabled:opacity-60 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-none hover:bg-[#1557B0] hover:shadow-[0_2px_8px_rgba(0,0,0,0.15)] active:bg-[#0D47A1]",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background text-[#1A73E8] hover:border-[#80868B] hover:bg-[#F3F3F3] hover:shadow-[0_2px_8px_rgba(0,0,0,0.1)]",
        secondary: "border border-input bg-[#F8F9FA] text-[#1A73E8] hover:border-[#80868B] hover:bg-[#F3F3F3]",
        ghost: "border border-transparent text-[#1A73E8] hover:border-[#1A73E8] hover:bg-[rgba(26,115,232,0.08)]",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = ({ className, variant, size, asChild = false, ...props }: ButtonProps) => {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
};

export { buttonVariants };
