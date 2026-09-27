import { useState } from "react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";
import { useNavigate } from "react-router-dom";
import { toast } from "../../hooks/use-toast";
import { securityApi } from "../../services/api";
import { Loader2, Mail, Lock, KeyRound } from "lucide-react";

const StudentLogin = ({
  email,
  setEmail,
  password,
  setPassword,
  handleSimpleLogin,
  label = "Student",
}) => {
  // state variables
  const [step, setStep] = useState("login");
  const [requesting, setRequesting] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

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
        data.message === "Verification code sent successfully" ||
        data.message === "verification code sent successfully"
      ) {
        toast({
          title: "OTP Sent",
          description: data.message,
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
        description:
          error.message || "An error occurred while sending OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRequesting(false);
    }
  };

  // handle reset password
  const handleResetPassword = async (e) => {
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
        description: "Passwords do not match.",
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
        role: "STUDENT",
      });
      if (
        data.message === "Your password changed successfully!" ||
        data.message === "your password changed successfully"
      ) {
        toast({
          title: "Success",
          description: data.message,
          variant: "success",
        });
        setStep("login");
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to reset password.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.message || "An error occurred while resetting password. Please try again.",
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

  if (step === "login") {
    return (
      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="student-email">Email</Label>
          <div className="relative">
            <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
            <Input
              id="student-email"
              type="email"
              placeholder="you@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="student-password">Password</Label>
          <div className="relative">
            <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
            <Input
              id="student-password"
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
              setStep("forgot");
            }}
            className="text-sm text-primary hover:underline"
          >
            Forgot Password?
          </button>
        </div>

        <Button type="submit" className="w-full" disabled={requesting}>
          {requesting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Logging in...
            </>
          ) : (
            `Login as ${label}`
          )}
        </Button>
      </form>
    );
  }

  if (step === "forgot") {
    return (
      <form onSubmit={handleSendOtp} className="space-y-4">
        <div className="space-y-1 text-center mb-2">
          <h3 className="font-semibold text-foreground text-sm">Reset Password</h3>
          <p className="text-xs text-muted-foreground">
            Enter your registered email to receive an OTP
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="student-reset-email">Email</Label>
          <div className="relative">
            <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
            <Input
              id="student-reset-email"
              type="email"
              placeholder="Enter your registered email"
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
          <Button type="submit" className="flex-1" disabled={requesting}>
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

  if (step === "reset") {
    return (
      <form onSubmit={handleResetPassword} className="space-y-4">
        <div className="space-y-1 text-center mb-2">
          <h3 className="font-semibold text-foreground text-sm">Create New Password</h3>
          <p className="text-xs text-muted-foreground">
            Enter the OTP sent to {resetEmail}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="student-otp">OTP Code</Label>
          <div className="relative">
            <KeyRound className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
            <Input
              id="student-otp"
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              className="pl-9 font-mono tracking-widest text-center"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="student-new-password">New Password</Label>
          <div className="relative">
            <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
            <Input
              id="student-new-password"
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="student-confirm-password">Confirm Password</Label>
          <div className="relative">
            <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
            <Input
              id="student-confirm-password"
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
            onClick={() => setStep("forgot")}
            disabled={requesting}
          >
            Back
          </Button>
          <Button type="submit" className="flex-1" disabled={requesting}>
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

export default StudentLogin;