import { useState } from "react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";
import { useNavigate } from "react-router-dom";

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

  const [resetEmail, setResetEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const baseUrl = "http://localhost:8080/campus-connect/security";
  //send otp
  const handleSendOtp = (e) => {
    e.preventDefault();
    fetch(`${baseUrl}/send-code`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email: resetEmail , codeFor:"EMAIL_VERIFICATION FOR RESET_PASSWORD" })
    })
      .then(async (response) => await response.json())
      .then((data) => {
        if(data.message === "Verification code sent successfully") {
          alert("OTP sent to " + resetEmail);
          setStep("reset");
        } else {
          alert(data.message || "Failed to send OTP. Please try again.");
        }
      })
      .catch((error) => {
        console.error("Error sending OTP:", error);
        alert("An error occurred while sending OTP. Please try again.");
      }); 
  };

  //handle resetpassword
  const handleResetPassword = (e) => {
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
      body: JSON.stringify({ email: resetEmail, code: otp, password: newPassword, role: "STUDENT" })
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

        <Button type="submit" className="w-full">
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

        <Button type="submit" className="w-full">
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

        <Button type="submit" className="w-full">
          Reset Password
        </Button>

      </form>
    );
  }
};

export default StudentLogin;