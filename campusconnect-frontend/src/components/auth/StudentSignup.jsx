import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/Select";
import {
  ArrowLeft,
  GraduationCap,
  CheckCircle,
  XCircle,
  Mail,
} from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/InputOtp";
import { toast } from "../../hooks/use-toast";

const StudentSignup = ({ onBack }) => {
  const [step, setStep] = useState(1);
  const [selectedCollegeId, setSelectedCollegeId] = useState("");
  const [collegeEmail, setCollegeEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [requesting, setRequesting] = useState(false);

  //Data for final registration form
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    collegeId: "",
    id: "",
    department: "",
    year: "",
    gender: "",
  });

  const navigate = useNavigate();
  const { studentSignup } = useAuth();

  const [colleges, setColleges] = useState([]);

  // fetch registered colleges from database
  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const response = await fetch(
          "http://localhost:8080/campus-connect/colleges",
        );
        const data = await response.json();
        setColleges(data);
      } catch (error) {
        console.error("Failed to fetch colleges:", error);
      }
    };

    fetchColleges();
  }, []);

  const selectedCollege = colleges.find((c) => c.id === selectedCollegeId);

  // on college select
  const handleCollegeSelect = async (collegeId) => {
    setSelectedCollegeId(collegeId);

    setFormData((prev) => ({
      ...prev,
      collegeId: selectedCollegeId,
    }));
  };

  const handleCheckCollege = () => {
    if (selectedCollegeId) setStep(2);
  };

  //send otp to verify email
  const handleSendOTP = async (e) => {
    e.preventDefault();
    // veryfy domain
    let domain = "";
    colleges.forEach((element) => {
      if (selectedCollegeId === element.id) {
        domain = element.domain;
      }
    });
    let currnetdomain = collegeEmail.split("@")[1];

    if (currnetdomain !== domain) {
      toast({
        title: "Error",
        description: "Invalid email domain.",
        variant: "destructive",
      });
      return;
    }

    // send otp
    setRequesting(true);
    try {
      const response = await fetch(
        "http://localhost:8080/campus-connect/security/send-code",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            codeFor: "Student Email verification",
          }),
        },
      ).then(async (res) => await res.json());

      if (response.message === "Verification code sent successfully") {
        toast({
          title: "Success",
          description: "OTP sent successfully.",
          variant: "success",
        });
        setStep(3);
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to send OTP.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while sending OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRequesting(false);
    }
  };

  //verify otp
  const handleVerifyOTP = async () => {
    setRequesting(true);
    if (otp.length === 6) {
      const response = await fetch(
        "http://localhost:8080/campus-connect/security/verify-code",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            code: otp,
          }),
        },
      ).then((res) => res.json());

      if (response.message === "Code verified successfully") {
        toast({
          title: "Success",
          description: "Email verified successfully.",
          variant: "success",
        });
        setIsVerified(true);
        setStep(4);
      } else {
        toast({
          title: "Error",
          description: "Invalid code.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Error",
        description: "Please enter a 6-digit code.",
        variant: "destructive",
      });
    }
    setRequesting(false);
  };

  // final submission
  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setRequesting(true);
    formData.collegeId = selectedCollegeId;
    const redirectUrl = await studentSignup(formData);
    setRequesting(false);
    navigate(redirectUrl);
  };

  //om back button
  const handleBack = () => {
    if (step === 1) {
      onBack();
    } else {
      setStep(step - 1);
    }
  };

  //resend otp
  const resendOtp = async () => {
    setRequesting(true);
    const response = await fetch(
      "http://localhost:8080/campus-connect/security/send-code",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          codeFor: "Student Email verification",
        }),
      },
    ).then((res) => res.json());
    if (response.message === "Verification code sent successfully") {
      toast({
        title: "Success",
        description: "OTP resent successfully.",
        variant: "success",
      });
    } else {
      toast({
        title: "Error",
        description: response.message || "Failed to resend OTP.",
        variant: "destructive",
      });
    }
    setRequesting(false);
  };

  // choose your college step
  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center relative">
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-4 top-4"
              onClick={handleBack}
              disabled={requesting}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <GraduationCap className="w-8 h-8 text-primary" />
            </div>

            <CardTitle>Student Registration</CardTitle>
            <CardDescription>Step 1: Select your college</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Select Your College</Label>

              <Select
                value={selectedCollegeId}
                onValueChange={(value) => handleCollegeSelect(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose your college" />
                </SelectTrigger>

                <SelectContent>
                  {colleges.map((college) => (
                    <SelectItem key={college.id} value={college.id}>
                      {college.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCollegeId && (
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-2 text-primary mb-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">College Found!</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {selectedCollege?.name} is registered on CampusConnect.
                </p>
              </div>
            )}

            {!colleges.length && (
              <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                <div className="flex items-center gap-2 text-destructive mb-2">
                  <XCircle className="w-5 h-5" />
                  <span className="font-semibold">College Not Found</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your college is not yet registered on CampusConnect. Please
                  contact your administration.
                </p>
              </div>
            )}

            <Button
              onClick={handleCheckCollege}
              className="w-full"
              disabled={!selectedCollegeId}
            >
              Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // email verification step
  if (step === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center relative">
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-4 top-4"
              disabled={requesting}
              onClick={() => setStep(1)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <CardTitle>Verify Your Email</CardTitle>

            <CardDescription>
              Step 2: Enter your college email address
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div className="p-3 rounded-lg bg-muted text-sm">
                <p className="font-medium">{selectedCollege?.name}</p>
                <p className="text-muted-foreground">
                  {selectedCollege?.address}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="collegeEmail">College Email Address</Label>
                <Input
                  id="collegeEmail"
                  type="email"
                  placeholder="you@university.edu"
                  value={collegeEmail}
                  onChange={(e) => {
                    setCollegeEmail(e.target.value);
                    setFormData({ ...formData, email: e.target.value });
                  }}
                  required
                />

                <p className="text-xs text-muted-foreground">
                  Use your official college email to verify your enrollment
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={requesting}>
                Send Verification Code
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // OTP verification step
  if (step === 3) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center relative">
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-4 top-4"
              disabled={requesting}
              onClick={() => setStep(2)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>

            <CardTitle>Enter Verification Code</CardTitle>

            <CardDescription>
              We've sent a 6-digit code to {collegeEmail}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button
              onClick={handleVerifyOTP}
              className="w-full"
              disabled={otp.length !== 6}
            >
              Verify Code
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Didn't receive the code?{" "}
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={resendOtp}
                disabled={requesting}
              >
                Resend
              </Button>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // final profile completion step
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-4 top-4"
            onClick={() => setStep(3)}
            disabled={requesting}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <GraduationCap className="w-8 h-8 text-primary" />
          </div>

          <CardTitle>Complete Your Profile</CardTitle>

          <CardDescription>Step 4: Enter your details</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleFinalSubmit} className="space-y-4">
            {isVerified && (
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-primary">
                  Email Verified
                </span>
              </div>
            )}

            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                required
              />
            </div>

            {/* Student Email */}
            <div className="space-y-2">
              <Label htmlFor="studentId">Student ID *</Label>
              <Input
                id="studentId"
                placeholder="STU2024001"
                value={formData.id}
                onChange={(e) =>
                  setFormData({ ...formData, id: e.target.value })
                }
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                placeholder="********"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
            </div>

            {/* Additional Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  placeholder="Computer Science"
                  value={formData.department}
                  onChange={(e) =>
                    setFormData({ ...formData, department: e.target.value })
                  }
                />
              </div>

              {/* Passing Year */}
              <div className="space-y-2">
                <Label htmlFor="year">Passing Year</Label>
                <Input
                  id="year"
                  placeholder="e.g., 2026"
                  value={formData.year}
                  onChange={(e) =>
                    setFormData({ ...formData, year: e.target.value })
                  }
                />
              </div>
              <Label>Gender</Label>
              <select
                name="gender"
                value={formData.gender}
                onChange={(e) =>
                  setFormData({ ...formData, gender: e.target.value })
                }
                className="w-full border rounded-md p-2 bg-background"
              >
                <option value="">Select Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <Button type="submit" className="w-full" disabled={requesting}>
              Complete Registration
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentSignup;
