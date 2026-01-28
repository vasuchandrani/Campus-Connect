import * as React from "react";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function alertVariants({ variant = "default" } = {}) {
  const base =
    "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground";
  const variants = {
    default: "bg-background text-foreground",
    destructive:
      "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
  };
  return cn(base, variants[variant]);
}

function Alert({ className, variant, children, ...props }) {
  return (
    <div role="alert" className={cn(alertVariants({ variant }), className)} {...props}>
      {children}
    </div>
  );
}

function AlertTitle({ className, children, ...props }) {
  return (
    <h5 className={cn("mb-1 font-medium leading-none tracking-tight", className)} {...props}>
      {children}
    </h5>
  );
}

function AlertDescription({ className, children, ...props }) {
  return (
    <div className={cn("text-sm [&_p]:leading-relaxed", className)} {...props}>
      {children}
    </div>
  );
}

export { Alert, AlertTitle, AlertDescription };
