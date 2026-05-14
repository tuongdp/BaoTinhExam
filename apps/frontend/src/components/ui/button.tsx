import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import { cn } from "../../lib/utils";

export const Button = ({ className, children, ...props }: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) => (
  <button
    className={cn(
      "inline-flex h-10 items-center justify-center gap-2 rounded-md border border-transparent bg-primary px-4 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60",
      className
    )}
    {...props}
  >
    {children}
  </button>
);
