import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./Dialog";
import { Button } from "./Button";
import { AlertTriangle, CheckCircle2, AlertCircle, Trash2 } from "lucide-react";

/**
 * Reusable Confirmation Dialog for destructive, approval, or irreversible actions.
 */
export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText,
  cancelText = "Cancel",
  variant = "destructive", // "destructive" | "success" | "warning" | "default"
  icon: CustomIcon,
  loading = false,
  onConfirm,
}) {
  const getIcon = () => {
    if (CustomIcon) return <CustomIcon className="w-5 h-5" />;
    switch (variant) {
      case "success":
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-amber-500" />;
      case "destructive":
      default:
        return <Trash2 className="w-5 h-5 text-destructive" />;
    }
  };

  const getBadgeBg = () => {
    switch (variant) {
      case "success":
        return "bg-emerald-500/10 border-emerald-500/20";
      case "warning":
        return "bg-amber-500/10 border-amber-500/20";
      case "destructive":
      default:
        return "bg-destructive/10 border-destructive/20";
    }
  };

  const getDefaultConfirmText = () => {
    if (confirmText) return confirmText;
    switch (variant) {
      case "success":
        return "Approve";
      case "warning":
        return "Continue";
      case "destructive":
      default:
        return "Delete";
    }
  };

  const getButtonVariant = () => {
    if (variant === "destructive") return "destructive";
    if (variant === "success") return "default";
    return "default";
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !loading && onOpenChange(val)}>
      <DialogContent className="w-[95vw] sm:max-w-md rounded-2xl p-4 sm:p-6">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${getBadgeBg()}`}
            >
              {getIcon()}
            </div>
            <div className="text-left space-y-0.5">
              <DialogTitle className="text-base sm:text-lg font-bold text-foreground">
                {title}
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-3 sm:pt-4 border-t border-border/60">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={loading}
            className="w-full sm:w-auto text-xs h-9"
            onClick={() => onOpenChange(false)}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={getButtonVariant()}
            size="sm"
            disabled={loading}
            className="w-full sm:w-auto text-xs h-9 font-medium shadow-xs"
            onClick={async () => {
              if (onConfirm) {
                await onConfirm();
              }
            }}
          >
            {loading ? "Processing..." : getDefaultConfirmText()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
