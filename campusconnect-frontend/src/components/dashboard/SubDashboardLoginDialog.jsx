import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/Dialog";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";
import { Lock, Eye, EyeOff, ShieldCheck, Loader2 } from "lucide-react";

export default function SubDashboardLoginDialog({
  open,
  onOpenChange,
  title = "Authentication Required",
  description = "Please enter your password to continue.",
  icon: Icon = Lock,
  onSubmit,
  loading = false,
  error = "",
  showEmail = false,
  email = "",
  onEmailChange,
}) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!password.trim()) return;
    onSubmit(password);
  };

  const handleClose = (isOpen) => {
    if (!isOpen) {
      setPassword("");
      setShowPassword(false);
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="text-center sm:text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <Icon className="w-6 h-6 text-primary" />
            </div>
            <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-1">
              {description}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {showEmail && (
              <div className="space-y-2">
                <Label htmlFor="auth-email">Student Email</Label>
                <Input
                  id="auth-email"
                  type="email"
                  placeholder="student@college.edu"
                  value={email}
                  onChange={(e) => onEmailChange && onEmailChange(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="sub-password">Password</Label>
              <div className="relative">
                <Input
                  id="sub-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                  autoFocus
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium">
                {typeof error === "string"
                  ? error
                      .replace(/^Something went wrong:\s*/i, "")
                      .replace(/^\d{3}\s+[A-Z_]+(?:\s+["']?|:\s*["']?)/i, "")
                      .replace(/^["']|["']$/g, "")
                      .trim()
                  : error}
              </div>
            )}

            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/60 text-xs text-muted-foreground border">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
              <span>
                Strict session security: your current session token will be safely swapped upon verification.
              </span>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !password.trim()}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify & Continue"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
