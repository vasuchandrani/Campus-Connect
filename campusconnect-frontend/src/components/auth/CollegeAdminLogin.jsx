import { useState } from "react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";
import { useNavigate } from "react-router-dom";
import { toast } from "../../hooks/use-toast";
import { securityApi } from "../../services/api";
import { Loader2, Mail, Lock, KeyRound } from "lucide-react";

const CollegeAdminLogin = ({
  email,
  setEmail,
  password,
  setPassword,
  handleSimpleLogin,
}) => {
  const navigate = useNavigate();

  // State for forgot password flow
  const [step, setStep] = useState("login");
  const [resetEmail, setResetEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [requesting, setRequesting] = useState(false);

  // change password
  const handleForgot = async (e) => {
    e.preventDefault();
    if (newPassword.trim() === "" || newPassword.length < 6) {
      toast({
        title: "Error",
        description: "New password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New password and confirm password do not match.",
        variant: "destructive",
      });
      return;
    }

    setRequesting(true);
    try {
      const data = await securityApi.resetPassword({
        email: resetEmail.trim(),
        code: otp.trim(),
        password: newPassword,
        role: "COLLEGE_ADMIN",
      });
      if (
        data.message === "your password changed successfully" ||
        data.message === "Your password changed successfully!"
      ) {
        toast({
          title: "Success",
          description:
            "Your password has been reset successfully. Please login with your new password.",
          variant: "success",
        });
        setStep("login");
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to reset password. Please try again.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "An error occurred while resetting password.",
        variant: "destructive",
      });
    } finally {
      setRequesting(false);
    }
  };

  // send otp
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (resetEmail.trim() === "") {
      toast({
        title: "Error",
        description: "Email cannot be empty.",
        variant: "destructive",
      });
      return;
    }
    if (!resetEmail.includes("@") || !resetEmail.includes(".")) {
      toast({
        title: "Error",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setRequesting(true);
    try {
      const data = await securityApi.sendCode({
        email: resetEmail.trim(),
        codeFor: "Email verification for reset password",
      });
      if (
        data.message === "verification code sent successfully" ||
        data.message === "Verification code sent successfully"
      ) {
        toast({
          title: "Success",
          description: "OTP sent to " + resetEmail,
          variant: "success",
        });
        setStep("reset");
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to send OTP.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "An error occurred while sending OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRequesting(false);
    }
  };

  const handleLogin = async (e) => {
    setRequesting(true);
    await handleSimpleLogin(e);
    setRequesting(false);
  };

  // normal login
  if (step === "login") {
    return (
      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="admin-email">Email</Label>
          <div className="relative">
            <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
            <Input
              id="admin-email"
              type="email"
              placeholder="admin@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="admin-password">Password</Label>
          <div className="relative">
            <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
            <Input
              id="admin-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="pl-9"
            />
          </div>
        </div>

        <div className="text-right">
          <button
            type="button"
            onClick={() => {
              setResetEmail(email);
              setStep("email");
            }}
            className="text-sm text-primary hover:underline"
          >
            Forgot Password?
          </button>
        </div>

        <Button disabled={requesting} type="submit" className="w-full">
          {requesting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Logging in...
            </>
          ) : (
            "Login as College Admin"
          )}
        </Button>
      </form>
    );
  }

  // if forgot password
  if (step === "email") {
    return (
      <form onSubmit={handleSendOtp} className="space-y-4">
        <div className="space-y-1 text-center mb-2">
          <h3 className="font-semibold text-foreground text-sm">Reset Password</h3>
          <p className="text-xs text-muted-foreground">
            Enter your administrator email to receive an OTP
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="admin-reset-email">Administrator Email</Label>
          <div className="relative">
            <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
            <Input
              id="admin-reset-email"
              type="email"
              placeholder="admin@college.edu"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              required
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => setStep("login")}
            disabled={requesting}
          >
            Cancel
          </Button>
          <Button disabled={requesting} type="submit" className="flex-1">
            {requesting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending OTP...
              </>
            ) : (
              "Send OTP"
            )}
          </Button>
        </div>
      </form>
    );
  }

  // if reset password
  if (step === "reset") {
    return (
      <form onSubmit={handleForgot} className="space-y-4">
        <div className="space-y-1 text-center mb-2">
          <h3 className="font-semibold text-foreground text-sm">Create New Password</h3>
          <p className="text-xs text-muted-foreground">
            Enter the OTP code sent to {resetEmail}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="admin-otp">OTP Code</Label>
          <div className="relative">
            <KeyRound className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
            <Input
              id="admin-otp"
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              className="pl-9 font-mono tracking-widest text-center"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="admin-new-password">New Password</Label>
          <div className="relative">
            <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
            <Input
              id="admin-new-password"
              type="password"
              placeholder="Enter new password (min 6 chars)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="admin-confirm-password">Confirm Password</Label>
          <div className="relative">
            <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
            <Input
              id="admin-confirm-password"
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => setStep("email")}
            disabled={requesting}
          >
            Back
          </Button>
          <Button disabled={requesting} type="submit" className="flex-1">
            {requesting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Resetting...
              </>
            ) : (
              "Reset Password"
            )}
          </Button>
        </div>
      </form>
    );
  }
};

export default CollegeAdminLogin;