import { useState } from "react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";
import { useNavigate } from "react-router-dom";
import { toast } from "../../hooks/use-toast";

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

  //baseUrl
  const baseUrl = "https://campus-connect-nzc9.onrender.com/campus-connect/security";


  //change password
  const handleForgot = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New password and confirm password do not match",
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
      body: JSON.stringify({ email: resetEmail, code:otp, password:newPassword ,role:"COLLEGE_ADMIN" })
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message === "your password changed successfully") {
          toast({
            title: "Success",
            description: "Your password has been reset successfully. Please login with your new password.",
            variant: "success",
          });
          navigate("/");
        } else {
          toast({
            title: "Error",
            description: data.message || "Failed to reset password. Please try again.",
            variant: "destructive",
          });
        }
      })
      .catch((err) => {
        toast({
          title: "Error",
          description: err.message||"An error occurred while resetting password.",
          variant: "destructive",
        });
      }).finally(()=>setRequesting(false));
  };

  //send otp
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setRequesting(true);
    await fetch(`${baseUrl}/send-code`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email: resetEmail , codeFor:"Email verification for reset password"})
    })
      .then((response) => response.json())
      .then((data) => {
        if(data.message === "verification code sent successfully"){ 
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
      })
      .catch((error) => {
        toast({
          title: "Error",
          description: error.message || "An error occurred while sending OTP. Please try again.",
          variant: "destructive",
        });
      }).finally(()=>setRequesting(false));
  };

  //normal login
  if (step === "login") {
    return (
      <form onSubmit={handleSimpleLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="admin@college.edu"
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
            onClick={() => setStep("email")}
            className="text-sm text-green-600 hover:underline"
          >
            Forgot Password?
          </button>
        </div>

        <Button disabled={requesting} type="submit" className="w-full">
          Login as College Admin
        </Button>
      </form>
    );
  }

  //if forgot password
  if (step === "email") {
    return (
      <form
        onSubmit={(e) => {
          handleSendOtp(e);
        }}
        className="space-y-4"
      >
        <div className="space-y-2">
          <Label>Enter Email</Label>
          <Input
            type="email"
            placeholder="Enter your email"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            required
          />
        </div>

        <Button disable={requesting} type="submit" className="w-full" >
          Send OTP
        </Button>
      </form>
    );
  }

  if (step === "reset") {
    return (
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

        <Button disabled={requesting} type="submit" className="w-full">
          Reset Password
        </Button>
      </form>
    );
  }
};

export default CollegeAdminLogin;