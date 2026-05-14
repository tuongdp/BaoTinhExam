import * as LabelPrimitive from "@radix-ui/react-label";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "../../lib/utils";

export const Label = ({ className, ...props }: ComponentPropsWithoutRef<typeof LabelPrimitive.Root>) => (
  <LabelPrimitive.Root className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)} {...props} />
);
