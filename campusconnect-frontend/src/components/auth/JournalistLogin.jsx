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
import { ArrowLeft, Newspaper, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "../ui/Alert";
import { useNavigate } from "react-router-dom";

const JournalistLogin = ({ onBack }) => {

  //stat variables
  const [step, setStep] = useState("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

    const success = await login(email, password, "journalist");
    
    if (typeof success === "string" && success !== "Invalid credentials") {
      navigate(success);
    } else {
      setError("Invalid credentials");
    }
  };

  //baseUrl
  const baseUrl = "http://localhost:8080/campus-connect/security";

  //handle send otp for forgot password
  const handleSendOtp = (e) => {
    e.preventDefault();
    fetch(`${baseUrl}/send-code`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email: resetEmail , codeFor:"EMAIL_VERIFICATION FOR RESET_PASSWORD" })
    })
      .then((response) => response.json())
      .then((data) => {
        if(data.message === "Verification code sent successfully") {
          alert("OTP sent to " + resetEmail);
          setStep("reset");
        } else {
          alert(data.message || "Failed to send OTP.");
        }
      })
      .catch((error) => {
        console.error("Error sending OTP:", error);
        alert("An error occurred while sending OTP.");
      });
  };

  //handle changing password
  const handleForgot = (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    fetch(`${baseUrl}/reset-pwd`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email: resetEmail, code:otp, password:newPassword ,role:"JOURNALIST" })
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message === "Your password changed successfully!") {
          alert("Password reset successful!");
          navigate("/");
        } else {
          alert(data.message || "Failed to reset password.");
        }
      })
      .catch((error) => {
        console.error("Error resetting password:", error);
        alert("An error occurred while resetting password.");
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
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}

          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Newspaper className="w-8 h-8 text-primary" />
          </div>

          <CardTitle>Journalist Login</CardTitle>

          <CardDescription>
            Login with the credentials provided by your college administrator
          </CardDescription>

        </CardHeader>

        <CardContent>

          {step === "login" && (
            <>
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 mb-4">
                <p className="text-sm text-amber-800">
                  <strong>Note:</strong> Journalists are assigned by college
                  admins. If you don't have access, please contact your college
                  administration.
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

                <Button type="submit" className="w-full">
                  Login as Journalist
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

              <Button type="submit" className="w-full">
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

              <Button type="submit" className="w-full">
                Reset Password
              </Button>

            </form>
          )}

        </CardContent>
      </Card>
    </div>
  );
};

export default JournalistLogin;