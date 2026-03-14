import { useState } from "react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";
import { useNavigate } from "react-router-dom";
import { toast } from "../../hooks/use-toast";

const StudentLogin = ({
  email,
  setEmail,
  password,
  setPassword,
  handleSimpleLogin,
  label,
}) => {

  //stat variables
  const [step, setStep] = useState("login");
  const [requesting,setRequesting] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const baseUrl = "https://campus-connect-nzc9.onrender.com/campus-connect/security";
  //send otp
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setRequesting(true);
    await fetch(`${baseUrl}/send-code`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email: resetEmail , codeFor:"Email verification for reset password" })
    })
      .then(async (response) => await response.json())
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
            description: data.message || "Failed to send OTP.",
            variant: "destructive",
          });
        }
      })
      .catch((error) => {
        console.error("Error sending OTP:", error);
        toast({
          title: "Error",
          description: "An error occurred while sending OTP. Please try again.",
          variant: "destructive",
        });
      }); 
    setRequesting(false);
  };

  //handle resetpassword
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setRequesting(true);

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      setRequesting(false);
      return;
    }

    await fetch(`${baseUrl}/reset-pwd`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email: resetEmail, code: otp, password: newPassword, role: "STUDENT" })
    })
      .then((response) => response.json())
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
        console.error("Error resetting password:", error);
        toast({
          title: "Error",
          description: "An error occurred while resetting password. Please try again.",
          variant: "destructive",
        });
      });
    setRequesting(false);
  };

  if (step === "login") {
    return (
      <form onSubmit={handleSimpleLogin} className="space-y-4">

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@university.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
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
          Login as {label}
        </Button>

      </form>
    );
  }

  if (step === "forgot") {
    return (
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
    );
  }

  if (step === "reset") {
    return (
      <form onSubmit={handleResetPassword} className="space-y-4">

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
    );
  }
};

export default StudentLogin;