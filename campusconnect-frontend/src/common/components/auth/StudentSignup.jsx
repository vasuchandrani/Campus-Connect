import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";
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
  Building2,
  Mail,
  Lock,
  CheckCircle2,
  KeyRound,
  Eye,
  EyeOff,
  User,
  Loader2,
  Calendar,
  Users,
} from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/InputOtp";
import { toast } from "../../hooks/use-toast";
import { useAuth } from "../../contexts/AuthContext";
import { publicApi, securityApi, departmentApi } from "../../services/api";

const StudentSignup = ({ onBack }) => {
  const [step, setStep] = useState(1);
  const [selectedCollegeId, setSelectedCollegeId] = useState("");
  const [collegeEmail, setCollegeEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [colleges, setColleges] = useState([]);

  // Data for final registration form
  const [formData, setFormData] = useState({
    fullName: "",
    id: "", // Student ID / Enrollment No
    email: "",
    password: "",
    confirmPassword: "",
    department: "",
    year: "1",
    gender: "",
  });

  const navigate = useNavigate();
  const { studentSignup } = useAuth();

  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);

  // Fetch registered colleges
  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const data = await publicApi.getColleges();
        setColleges(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch colleges:", error);
      }
    };
    fetchColleges();
  }, []);

  // Fetch departments when selected college changes
  useEffect(() => {
    if (!selectedCollegeId) {
      setDepartments([]);
      return;
    }
    const fetchDepartments = async () => {
      setLoadingDepartments(true);
      try {
        const res = await departmentApi.getByCollegeId(selectedCollegeId);
        const list = Array.isArray(res) ? res : [];
        setDepartments(list);
        if (list.length > 0) {
          setFormData((prev) => {
            const hasGeneral = list.some((d) => d.name.toLowerCase() === "general");
            const defaultDept = hasGeneral
              ? list.find((d) => d.name.toLowerCase() === "general")?.name
              : list[0]?.name;
            return {
              ...prev,
              department: prev.department && list.some((d) => d.name === prev.department)
                ? prev.department
                : (defaultDept || "")
            };
          });
        }
      } catch (err) {
        console.error("Failed to load departments:", err);
        setDepartments([{ id: 0, name: "General", code: "GEN" }]);
      } finally {
        setLoadingDepartments(false);
      }
    };
    fetchDepartments();
  }, [selectedCollegeId]);

  const selectedCollege = colleges.find(
    (c) => String(c.id) === String(selectedCollegeId)
  );

  const handleCollegeSelect = (collegeId) => {
    setSelectedCollegeId(collegeId);
  };

  const handleNextFromCollege = () => {
    if (!selectedCollegeId) {
      toast({
        title: "Required",
        description: "Please select your affiliated college.",
        variant: "destructive",
      });
      return;
    }
    setStep(2);
  };

  // Step 2: Send OTP to verify email
  const handleSendOTP = async (e) => {
    e.preventDefault();
    const emailToVerify = collegeEmail.trim();

    if (!emailToVerify) {
      toast({
        title: "Error",
        description: "Student email cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    if (!emailToVerify.includes("@") || !emailToVerify.includes(".")) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    // Check college domain if available
    if (selectedCollege?.domain) {
      const emailDomain = emailToVerify.split("@")[1]?.toLowerCase();
      const expectedDomain = selectedCollege.domain.toLowerCase().replace(/^@/, "");
      if (emailDomain && !emailDomain.includes(expectedDomain)) {
        toast({
          title: "Domain Mismatch",
          description: `Please use your official college email ending with @${expectedDomain}`,
          variant: "destructive",
        });
        return;
      }
    }

    setRequesting(true);
    try {
      const response = await securityApi.sendCode({
        email: emailToVerify,
        codeFor: "Student Email verification",
      });

      if (
        response.message === "Verification code sent successfully" ||
        response.message === "verification code sent successfully"
      ) {
        toast({
          title: "OTP Sent",
          description: "A 6-digit verification code has been sent to your email.",
          variant: "success",
        });
        setFormData((prev) => ({ ...prev, email: emailToVerify }));
        setStep(3);
      } else {
        toast({
          title: "Notice",
          description: response.message || "Failed to send verification code.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Could not dispatch verification code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRequesting(false);
    }
  };

  // Step 3: Verify OTP
  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Error",
        description: "Please enter the complete 6-digit verification code.",
        variant: "destructive",
      });
      return;
    }

    setRequesting(true);
    try {
      const response = await securityApi.verifyCode({
        email: collegeEmail.trim(),
        code: otp.trim(),
      });

      if (
        response.message === "Code verified successfully" ||
        response.message === "code verified successfully"
      ) {
        toast({
          title: "Verified!",
          description: "Student email verified successfully.",
          variant: "success",
        });
        setIsVerified(true);
        setStep(4);
      } else {
        toast({
          title: "Verification Failed",
          description: response.message || "Invalid verification code.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Verification failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRequesting(false);
    }
  };

  // Step 3: Resend OTP
  const resendOtp = async () => {
    setRequesting(true);
    try {
      const response = await securityApi.sendCode({
        email: collegeEmail.trim(),
        codeFor: "Student Email verification",
      });
      if (
        response.message === "Verification code sent successfully" ||
        response.message === "verification code sent successfully"
      ) {
        toast({
          title: "Code Resent",
          description: "A fresh 6-digit verification code has been sent.",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to resend code.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to resend OTP.",
        variant: "destructive",
      });
    } finally {
      setRequesting(false);
    }
  };

  // Step 4: Final Submission
  const handleFinalSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      toast({
        title: "Error",
        description: "Full name is required.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.id.trim()) {
      toast({
        title: "Error",
        description: "Student ID or Enrollment number is required.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.department.trim()) {
      toast({
        title: "Error",
        description: "Department is required.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.gender) {
      toast({
        title: "Error",
        description: "Please select your gender.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    setRequesting(true);
    try {
      const parsedYear = parseInt(String(formData.year).replace(/\D/g, ""), 10) || 1;
      const redirectUrl = await studentSignup({
        fullName: formData.fullName.trim(),
        id: formData.id.trim(),
        email: formData.email.trim() || collegeEmail.trim(),
        password: formData.password,
        collegeId: Number(selectedCollegeId),
        collegeName: selectedCollege?.name || "",
        department: formData.department.trim(),
        year: parsedYear,
        gender: formData.gender,
      });

      toast({
        title: "Welcome to CampusConnect!",
        description: "Your student account was created successfully.",
        variant: "success",
      });
      navigate(redirectUrl || "/campus-connect/student/dashboard");
    } catch (err) {
      toast({
        title: "Registration Error",
        description: err.message || "Failed to complete registration.",
        variant: "destructive",
      });
    } finally {
      setRequesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-xl border-border/60">
        <CardHeader className="text-center relative pb-4">
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-4 top-4"
            onClick={() => {
              if (step > 1) setStep(step - 1);
              else if (onBack) onBack();
            }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <GraduationCap className="w-7 h-7 text-primary" />
          </div>

          <CardTitle className="text-2xl font-bold">Student Registration</CardTitle>
          <CardDescription>
            Join your campus community on CampusConnect
          </CardDescription>

          {/* 4-Step Progress Indicators */}
          <div className="flex items-center justify-center gap-2 pt-4">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s === step
                    ? "w-8 bg-primary"
                    : s < step
                    ? "w-4 bg-primary/60"
                    : "w-4 bg-muted"
                }`}
              />
            ))}
          </div>
        </CardHeader>

        <CardContent className="pt-2">
          {/* STEP 1: Select College */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="space-y-2 text-center">
                <h3 className="font-semibold text-foreground text-sm">
                  Step 1: Select Your College
                </h3>
                <p className="text-xs text-muted-foreground">
                  Choose the institution you are currently enrolled in
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="college-select">Enrolled Institution</Label>
                <Select
                  value={String(selectedCollegeId)}
                  onValueChange={handleCollegeSelect}
                >
                  <SelectTrigger id="college-select" className="w-full">
                    <SelectValue placeholder="Choose an institution..." />
                  </SelectTrigger>
                  <SelectContent>
                    {colleges.map((college) => (
                      <SelectItem key={college.id} value={String(college.id)}>
                        {college.name || college.collegeName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCollege && (
                <div className="p-3 bg-muted/40 rounded-lg border border-border/50 text-xs space-y-1">
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <Building2 className="w-4 h-4 text-primary" />
                    <span>{selectedCollege.name || selectedCollege.collegeName}</span>
                  </div>
                  {selectedCollege.domain && (
                    <p className="text-muted-foreground pl-6">
                      Domain: <span className="font-mono text-primary">@{selectedCollege.domain}</span>
                    </p>
                  )}
                </div>
              )}

              <Button
                className="w-full mt-2"
                onClick={handleNextFromCollege}
                disabled={!selectedCollegeId}
              >
                Continue to Email Verification
              </Button>
            </div>
          )}

          {/* STEP 2: Email & Verification */}
          {step === 2 && (
            <form onSubmit={handleSendOTP} className="space-y-5">
              <div className="space-y-2 text-center">
                <h3 className="font-semibold text-foreground text-sm">
                  Step 2: Student Email Verification
                </h3>
                <p className="text-xs text-muted-foreground">
                  Enter your student email address to receive a 6-digit verification code
                </p>
              </div>

              {selectedCollege && (
                <div className="p-3 bg-muted/40 rounded-lg border border-border/50 text-xs flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {selectedCollege.name || selectedCollege.collegeName}
                    </p>
                    {selectedCollege.domain && (
                      <p className="text-muted-foreground text-[11px]">
                        Accepted domain: <span className="font-mono text-primary">@{selectedCollege.domain}</span>
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="student-email">Student Email Address</Label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    id="student-email"
                    type="email"
                    placeholder="student@university.edu"
                    className="pl-9"
                    value={collegeEmail}
                    onChange={(e) => setCollegeEmail(e.target.value)}
                    required
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  We'll send an OTP to this address to verify your student status
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={requesting}>
                {requesting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending Verification Code...
                  </>
                ) : (
                  "Send Verification Code"
                )}
              </Button>
            </form>
          )}

          {/* STEP 3: OTP Code */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="space-y-2 text-center">
                <h3 className="font-semibold text-foreground text-sm">
                  Step 3: Enter Verification Code
                </h3>
                <p className="text-xs text-muted-foreground">
                  We've sent a 6-digit code to <span className="font-medium text-foreground">{collegeEmail}</span>
                </p>
              </div>

              <div className="flex justify-center py-2">
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
                className="w-full"
                onClick={handleVerifyOTP}
                disabled={otp.length !== 6 || requesting}
              >
                {requesting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify Code"
                )}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={resendOtp}
                  disabled={requesting}
                  className="text-xs text-primary hover:underline font-medium inline-flex items-center gap-1"
                >
                  <KeyRound className="w-3 h-3" />
                  Didn't receive code? Resend OTP
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Profile Details & Password */}
          {step === 4 && (
            <form onSubmit={handleFinalSubmit} className="space-y-4">
              <div className="space-y-1 text-center pb-1">
                <h3 className="font-semibold text-foreground text-sm">
                  Step 4: Academic Details & Password
                </h3>
                <p className="text-xs text-muted-foreground">
                  Set up your credentials and academic information
                </p>
              </div>

              {/* Verified Email Banner */}
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-medium truncate">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span className="truncate">{formData.email || collegeEmail}</span>
                </div>
                <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full shrink-0">
                  Verified
                </span>
              </div>

              {/* Full Name */}
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Full Name *</Label>
                <div className="relative">
                  <User className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    id="fullName"
                    placeholder="e.g. Alex Johnson"
                    className="pl-9"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              {/* Student ID / Enrollment No */}
              <div className="space-y-1.5">
                <Label htmlFor="studentId">Student ID / Enrollment Number *</Label>
                <div className="relative">
                  <GraduationCap className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    id="studentId"
                    placeholder="e.g. 21ITU042 or STU2024001"
                    className="pl-9"
                    value={formData.id}
                    onChange={(e) =>
                      setFormData({ ...formData, id: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              {/* Department & Year (2 Columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="department">Department *</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(val) =>
                      setFormData({ ...formData, department: val })
                    }
                    disabled={loadingDepartments}
                  >
                    <SelectTrigger id="department" className="w-full">
                      <div className="flex items-center gap-2 truncate">
                        <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
                        <SelectValue placeholder={loadingDepartments ? "Loading departments..." : "Select Department"} />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id || dept.name} value={dept.name}>
                          {dept.name} {dept.code && dept.code !== dept.name ? `(${dept.code})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="year">Academic Year *</Label>
                  <Select
                    value={String(formData.year)}
                    onValueChange={(val) =>
                      setFormData({ ...formData, year: val })
                    }
                  >
                    <SelectTrigger id="year" className="w-full">
                      <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1st Year (Freshman)</SelectItem>
                      <SelectItem value="2">2nd Year (Sophomore)</SelectItem>
                      <SelectItem value="3">3rd Year (Junior)</SelectItem>
                      <SelectItem value="4">4th Year (Senior)</SelectItem>
                      <SelectItem value="5">5th Year / Postgraduate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Gender */}
              <div className="space-y-1.5">
                <Label htmlFor="gender">Gender *</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(val) =>
                    setFormData({ ...formData, gender: val })
                  }
                >
                  <SelectTrigger id="gender" className="w-full">
                    <SelectValue placeholder="Select Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Password & Confirm Password (2 Columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-9 pr-9"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      required
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-9"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full mt-3"
                disabled={requesting}
              >
                {requesting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Completing Registration...
                  </>
                ) : (
                  "Complete Student Registration"
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentSignup;
