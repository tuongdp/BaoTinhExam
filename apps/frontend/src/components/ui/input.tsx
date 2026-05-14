import type { InputHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export const Input = ({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) => (
  <input
    className={cn(
      "flex min-h-11 w-full rounded border border-input bg-background px-4 py-3 text-sm text-[#202124] file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#9AA0A6] hover:border-[#80868B] focus-visible:border-primary disabled:cursor-not-allowed disabled:bg-[#F3F3F3] disabled:text-[#9AA0A6] disabled:opacity-60",
      className
    )}
    {...props}
  />
);
