import React from "react";
import { useToast } from "../../hooks/use-toast";
import {
  Toast,
  ToastClose,
  ToastProvider,
  ToastViewport,
  ToastTitle,
  ToastDescription,
} from "./Toast";
import { CheckCircle2, AlertCircle, AlertTriangle, Info } from "lucide-react";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider duration={4000}>
      {toasts.map(({ id, title, description, action, variant = "default", ...props }) => {
        // Icon according to variant
        const renderIcon = () => {
          if (variant === "success") {
            return (
              <div className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            );
          }
          if (variant === "destructive" || variant === "error") {
            return (
              <div className="p-1.5 rounded-xl bg-destructive/10 text-destructive shrink-0 mt-0.5">
                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            );
          }
          if (variant === "warning") {
            return (
              <div className="p-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
                <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            );
          }
          return (
            <div className="p-1.5 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
              <Info className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          );
        };

        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="flex items-start gap-3 w-full min-w-0">
              {renderIcon()}
              <div className="flex-1 min-w-0 pt-0.5">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription className={title ? "mt-1" : ""}>
                    {description}
                  </ToastDescription>
                )}
                {action && <div className="mt-2">{action}</div>}
              </div>
            </div>
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
