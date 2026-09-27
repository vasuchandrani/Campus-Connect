import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { cva } from "class-variance-authority";
import { X } from "lucide-react";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

/* =====================
   PROVIDER & VIEWPORT
===================== */

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef(
  ({ className, ...props }, ref) => (
    <ToastPrimitives.Viewport
      ref={ref}
      className={cn(
        "fixed bottom-4 right-4 z-[100] flex max-h-screen w-full max-w-[92vw] sm:max-w-[420px] flex-col-reverse gap-2.5 p-0 pointer-events-none items-end outline-none",
        className
      )}
      {...props}
    />
  )
);

ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

/* =====================
   VARIANTS
===================== */

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full max-w-sm sm:max-w-md items-start justify-between gap-3 overflow-hidden rounded-2xl border p-3.5 sm:p-4 shadow-xl backdrop-blur-md transition-all " +
    "data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] " +
    "data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none " +
    "data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out " +
    "data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full " +
    "data-[state=open]:slide-in-from-bottom-full sm:data-[state=open]:slide-in-from-right-full",
  {
    variants: {
      variant: {
        default:
          "border-border/80 bg-card/95 text-card-foreground shadow-black/5 dark:shadow-black/20",
        destructive:
          "border-destructive/30 bg-card/95 text-card-foreground shadow-destructive/10 dark:border-destructive/40",
        success:
          "border-emerald-500/30 bg-card/95 text-card-foreground shadow-emerald-500/10 dark:border-emerald-500/40",
        warning:
          "border-amber-500/30 bg-card/95 text-card-foreground shadow-amber-500/10 dark:border-amber-500/40",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

/* =====================
   TOAST ROOT
===================== */

const Toast = React.forwardRef(
  ({ className, variant, ...props }, ref) => (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  )
);

Toast.displayName = ToastPrimitives.Root.displayName;

/* =====================
   ACTION
===================== */

const ToastAction = React.forwardRef(
  ({ className, ...props }, ref) => (
    <ToastPrimitives.Action
      ref={ref}
      className={cn(
        "inline-flex h-8 shrink-0 items-center justify-center rounded-lg border border-border bg-background px-3 text-xs font-semibold text-foreground transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        className
      )}
      {...props}
    />
  )
);

ToastAction.displayName = ToastPrimitives.Action.displayName;

/* =====================
   CLOSE
===================== */

const ToastClose = React.forwardRef(
  ({ className, ...props }, ref) => (
    <ToastPrimitives.Close
      ref={ref}
      className={cn(
        "rounded-lg p-1 text-muted-foreground/60 opacity-80 transition-all hover:opacity-100 hover:text-foreground hover:bg-muted focus:outline-none shrink-0",
        className
      )}
      toast-close=""
      {...props}
    >
      <X className="h-4 w-4" />
    </ToastPrimitives.Close>
  )
);

ToastClose.displayName = ToastPrimitives.Close.displayName;

/* =====================
   TITLE & DESCRIPTION
===================== */

const ToastTitle = React.forwardRef(
  ({ className, ...props }, ref) => (
    <ToastPrimitives.Title
      ref={ref}
      className={cn("text-sm font-semibold text-foreground tracking-tight leading-snug", className)}
      {...props}
    />
  )
);

ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef(
  ({ className, ...props }, ref) => (
    <ToastPrimitives.Description
      ref={ref}
      className={cn("text-xs text-muted-foreground leading-relaxed break-words", className)}
      {...props}
    />
  )
);

ToastDescription.displayName = ToastPrimitives.Description.displayName;

/* =====================
   EXPORTS
===================== */

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
};
