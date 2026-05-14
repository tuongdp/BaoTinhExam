import type { TextareaHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export const Textarea = ({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    className={cn(
      "flex min-h-24 w-full rounded border border-input bg-background px-4 py-3 text-sm text-[#202124] placeholder:text-[#9AA0A6] hover:border-[#80868B] focus-visible:border-primary disabled:cursor-not-allowed disabled:bg-[#F3F3F3] disabled:text-[#9AA0A6] disabled:opacity-60",
      className
    )}
    {...props}
  />
);
