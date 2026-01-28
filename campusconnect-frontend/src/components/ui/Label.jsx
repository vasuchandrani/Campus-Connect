import React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const labelClass = "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70";

function Label({ className, ...props }) {
  return <LabelPrimitive.Root className={cn(labelClass, className)} {...props} />;
}

export { Label };
