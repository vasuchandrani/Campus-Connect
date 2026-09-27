import React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const Tabs = TabsPrimitive.Root;

function TabsList({ className = "", ...props }) {
  const hasCustomLayout =
    className.includes("grid") ||
    className.includes("flex") ||
    className.includes("inline-flex");

  return (
    <TabsPrimitive.List
      className={cn(
        !hasCustomLayout && "inline-flex h-10",
        "items-center justify-center rounded-xl bg-muted/60 p-1 text-muted-foreground border border-border/50",
        className
      )}
      {...props}
    />
  );
}

function TabsTrigger({ className, ...props }) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer select-none",
        "text-muted-foreground hover:text-foreground hover:bg-background/40",
        "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm data-[state=active]:font-semibold",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }) {
  return (
    <TabsPrimitive.Content
      className={cn(
        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
