import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/Card";
import { ArrowLeft, FileSearch, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "../ui/Alert";
import { useNavigate } from "react-router-dom";
import { toast } from "../../hooks/use-toast";

export default function ReviewerLogin({ onBack }) {

  //stat variables
  const [step, setStep] = useState("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [requesting,setRequesting] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setRequesting(true);
    const success = await login(email, password, "reviewer");
    setRequesting(false);
    if(typeof success=== "string" && success=== "EXPIRE subscription"){
            toast({
              title: "Subscription Expired",
              description: "Your College's subscription has expired. Please contact the administrator.",
              variant: "destructive",
            });
          }
    else if (typeof success === "string" && success !== "Invalid credentials") {
      toast({
        title: "Success",
        description: "Login successful!",
        variant: "success",
      });
      navigate(success);
    } else {
      toast({
        title: "Login Failed",
        description: success || "Invalid email or password. Please try again.",
        variant: "destructive",
      });
    }
  };

  //baseurl
  const baseUrl = "http://localhost:8080/campus-connect/security";

  //send otp
  const handleSendOtp = async(e) => {
    e.preventDefault();

    setRequesting(true);
    
    await fetch(`${baseUrl}/send-code`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email: resetEmail , codeFor:"Email verification for reset password" })
    }).then((response) => response.json())
    .then((data) => {
      if(data.message === "Verification code sent successfully") {
        toast({
          title: "OTP Sent",
          description: data.message,
          variant: "success",
        });
        setStep("reset");
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to send OTP. Please try again.",
          variant: "destructive",
        });
      }
    })
    .catch((error) => {
      toast({
        title: "Error",
        description: error.message || "An error occurred while sending OTP. Please try again.",
        variant: "destructive",
      });
    })
    .finally(() => {
      setRequesting(false);
    });

    
  };

  // change password
  const handleForgot = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }
    setRequesting(true);
    await fetch(`${baseUrl}/reset-pwd`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email: resetEmail, code:otp, password:newPassword ,role:"REVIEWER" })
    }).then((response) => response.json())
    .then((data) => {
      if (data.message === "Your password changed successfully!") {
        toast({
          title: "Success",
          description: data.message,
          variant: "success",
        });
        navigate("/");
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to reset password.",
          variant: "destructive",
        });
      }
    })
    .catch((error) => {
      toast({
        title: "Error",
        description: error.message || "An error occurred while resetting password.",
        variant: "destructive",
      });
    }).finally(() => {
      setRequesting(false);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">

        <CardHeader className="text-center relative">

          {step === "login" ? (
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-4 top-4"
              onClick={onBack}
              disabled={requesting}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-4 top-4"
              onClick={() => setStep("login")}
              disabled={requesting}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}

          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <FileSearch className="w-8 h-8 text-primary" />
          </div>

          <CardTitle>Reviewer Login</CardTitle>

          <CardDescription>
            Login with the credentials provided by your college administrator
          </CardDescription>

        </CardHeader>

        <CardContent>

          {step === "login" && (
            <>
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 mb-4">
                <p className="text-sm text-amber-800">
                  <strong>Note:</strong> Reviewers are assigned by college admins
                  to review research papers. If you don't have access, please
                  contact your college administration.
                </p>
              </div>

              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleLogin} className="space-y-4">

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="you@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setStep("forgot")}
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>

                <Button type="submit" className="w-full" disabled={requesting}>
                  Login as Reviewer
                </Button>

              </form>
            </>
          )}

          {step === "forgot" && (
            <form onSubmit={handleSendOtp} className="space-y-4">

              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="Enter your registered email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={requesting}>
                Send OTP
              </Button>

            </form>
          )}

          {step === "reset" && (
            <form onSubmit={handleForgot} className="space-y-4">

              <div className="space-y-2">
                <Label>OTP</Label>
                <Input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>New Password</Label>
                <Input
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Confirm Password</Label>
                <Input
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={requesting}>
                Reset Password
              </Button>

            </form>
          )}

        </CardContent>
      </Card>
    </div>
  );
}