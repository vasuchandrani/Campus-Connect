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
import { Textarea } from "../ui/Textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/Select";
import {
  ArrowLeft,
  BookOpen,
  Building2,
  Mail,
  Lock,
  CheckCircle2,
  KeyRound,
  Eye,
  EyeOff,
  User,
  GraduationCap,
  Loader2,
} from "lucide-react";
import { toast } from "../../hooks/use-toast";
import { useAuth } from "../../contexts/AuthContext";
import { publicApi, securityApi, departmentApi } from "../../services/api";

const ProfessorSignup = ({ onBack }) => {
  const [step, setStep] = useState(1);
  const [selectedCollegeId, setSelectedCollegeId] = useState("");
  const [collegeEmail, setCollegeEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [colleges, setColleges] = useState([]);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    department: "",
    about: "",
  });

  const navigate = useNavigate();
  const { professorSignup } = useAuth();

  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);

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

  // Fetch departments when college is selected
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

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!collegeEmail.trim()) {
      toast({
        title: "Error",
        description: "Institutional email cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    if (!collegeEmail.includes("@") || !collegeEmail.includes(".")) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setRequesting(true);
    try {
      const response = await securityApi.sendCode({
        email: collegeEmail.trim(),
        codeFor: "Professor Email verification",
      });

      if (response.message === "Verification code sent successfully") {
        toast({
          title: "OTP Sent",
          description: "A 6-digit verification code has been sent to your email.",
          variant: "success",
        });
        setFormData((prev) => ({ ...prev, email: collegeEmail.trim() }));
        setStep(3);
      } else {
        toast({
          title: "Notice",
          description: response.message || "Failed to send code.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Could not dispatch OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRequesting(false);
    }
  };

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

      if (response.message === "Code verified successfully") {
        toast({
          title: "Verified!",
          description: "Institutional email verified successfully.",
          variant: "success",
        });
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
        description: error.message || "Verification failed.",
        variant: "destructive",
      });
    } finally {
      setRequesting(false);
    }
  };

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
    if (!formData.department.trim()) {
      toast({
        title: "Error",
        description: "Department is required.",
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
      const redirectUrl = await professorSignup({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        collegeId: Number(selectedCollegeId),
        collegeName: selectedCollege?.name || "",
        department: formData.department.trim(),
        about: formData.about.trim(),
      });

      toast({
        title: "Welcome, Professor!",
        description: "Your academic account was created successfully.",
        variant: "success",
      });
      navigate(redirectUrl || "/campus-connect/professor/dashboard");
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
            <BookOpen className="w-7 h-7 text-primary" />
          </div>

          <CardTitle className="text-2xl font-bold">Professor Registration</CardTitle>
          <CardDescription>
            Join your institution's academic evaluation panel
          </CardDescription>

          {/* Progress Indicators */}
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
                  Choose the institution you are officially affiliated with
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="college-select">Affiliated College</Label>
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
                  Step 2: Email Verification
                </h3>
                <p className="text-xs text-muted-foreground">
                  Enter your email address to receive a 6-digit verification code
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prof-email">Email Address</Label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                  <Input
                    id="prof-email"
                    type="email"
                    required
                    placeholder="professor@example.com"
                    value={collegeEmail}
                    onChange={(e) => setCollegeEmail(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={requesting}>
                {requesting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending Verification Code...
                  </>
                ) : (
                  "Send 6-Digit Code"
                )}
              </Button>
            </form>
          )}

          {/* STEP 3: OTP Code */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="space-y-2 text-center">
                <h3 className="font-semibold text-foreground text-sm">
                  Step 3: Verify Your Identity
                </h3>
                <p className="text-xs text-muted-foreground">
                  Enter the 6-digit code sent to{" "}
                  <span className="font-medium text-foreground">{collegeEmail}</span>
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="otp-input">Verification Code</Label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                  <Input
                    id="otp-input"
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    className="pl-9 text-center font-mono tracking-widest text-lg"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleSendOTP}
                  disabled={requesting}
                >
                  Resend Code
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleVerifyOTP}
                  disabled={otp.length !== 6 || requesting}
                >
                  {requesting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify & Continue"
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: Profile Details */}
          {step === 4 && (
            <form onSubmit={handleFinalSubmit} className="space-y-4">
              <div className="space-y-1 text-center">
                <h3 className="font-semibold text-foreground text-sm flex items-center justify-center gap-1.5 text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" /> Email Verified
                </h3>
                <p className="text-xs text-muted-foreground">
                  Complete your academic profile details
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="prof-name">Full Name</Label>
                <div className="relative">
                  <User className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                  <Input
                    id="prof-name"
                    required
                    placeholder="Dr. Alan Turing"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="prof-dept">Academic Department *</Label>
                <Select
                  value={formData.department}
                  onValueChange={(val) =>
                    setFormData({ ...formData, department: val })
                  }
                  disabled={loadingDepartments}
                >
                  <SelectTrigger id="prof-dept" className="w-full">
                    <div className="flex items-center gap-2 truncate">
                      <GraduationCap className="w-4 h-4 text-muted-foreground shrink-0" />
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="prof-pwd">Password</Label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                    <Input
                      id="prof-pwd"
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="pl-9 pr-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
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
                  <Label htmlFor="prof-confirm-pwd">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                    <Input
                      id="prof-confirm-pwd"
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value,
                        })
                      }
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="prof-about">
                  Research Bio / Academic Overview (Optional)
                </Label>
                <Textarea
                  id="prof-about"
                  placeholder="Specialization, research interests, laboratory affiliations..."
                  rows={3}
                  value={formData.about}
                  onChange={(e) =>
                    setFormData({ ...formData, about: e.target.value })
                  }
                />
              </div>

              <Button type="submit" className="w-full mt-2" disabled={requesting}>
                {requesting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Complete Professor Registration"
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfessorSignup;
