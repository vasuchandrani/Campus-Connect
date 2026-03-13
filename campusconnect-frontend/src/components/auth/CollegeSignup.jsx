import { useState } from "react";
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
import { Textarea } from "../ui/Textarea";
import { ArrowLeft, Building2, Check, Crown, Zap, Star } from "lucide-react";

const subscriptionPlans = [
  {
    id: "basic",
    name: "Basic",
    price: "$99/month",
    icon: Zap,
    features: [
      "Up to 5 clubs",
      "Basic analytics",
      "Email support",
      "1 admin account",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: "$199/month",
    icon: Star,
    popular: true,
    features: [
      "Up to 20 clubs",
      "Advanced analytics",
      "Priority support",
      "5 admin accounts",
      "Custom branding",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "$399/month",
    icon: Crown,
    features: [
      "Unlimited clubs",
      "Full analytics suite",
      "24/7 support",
      "Unlimited admins",
      "API access",
      "White-label option",
    ],
  },
];

const CollegeSignup = ({ onBack }) => {
  //stat variables
  const navigate = useNavigate();
  const { collegeSignup } = useAuth();

  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [selectedPlan, setSelectedPlan] = useState(null);

  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
    address: "",
    phone: "",
    website: "",
    domain: "",
    description: "",
    adminName: "",
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  //send otp
  const handleSendOtp = () => {
    if (!formData.email) {
      alert("Please enter email first");
      return;
    }

    fetch("http://localhost:8080/campus-connect/security/send-code", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email: formData.email , codeFor:"COLLEGE_ADMIN EMAIL_VERIFICATION"})
    })
      .then((response) => response.json())
      .then((data) => {
        if(data.message === "verification code sent successfully"){
          alert("OTP sent to " + formData.email);
          setStep(2);
        } else {
          alert(data.message || "Failed to send OTP.");
        }
      })
      .catch((error) => {
        console.error("Error sending OTP:", error);
        alert("An error occurred while sending OTP.");
      });
  };

  //verify that otp
  const handleVerifyOtp = () => {
    if (otp === "") {
      alert("Please enter OTP");
      return;
    }
    fetch("http://localhost:8080/campus-connect/security/verify-code", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email: formData.email, code: otp })
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message === "Code verified successfully") {
          alert("OTP verified successfully!");
          setStep(3);
        } else {
          alert(data.message || "Invalid OTP. Please try again.");
        }
      })
      .catch((error) => {
        console.error("Error verifying OTP:", error);
        alert("An error occurred while verifying OTP.");
      });
  };

  //submit details and signup
  const handleDetailsSubmit = async () => {

    const redirectUrl = await collegeSignup({
      fullName: formData.adminName,
      email: formData.email,
      password: formData.password,
      phoneNumber: formData.phone,
      collegeName: formData.name,
      domain: formData.domain,
      address: formData.address,
      website: formData.website,
      aboutCollege: formData.description,
    });

    navigate(redirectUrl);
  };

  //conform selected plan and submit details
  const handlePlanConfirm = async() => {
    if (selectedPlan) {
      await handleDetailsSubmit();
    } 
  };

  if (step === 4) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            className="mb-6"
            onClick={() => setStep(3)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Choose Your Plan</h1>
            <p className="text-muted-foreground">Select a subscription plan</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {subscriptionPlans.map((plan) => {
              const Icon = plan.icon;

              return (
                <Card
                  key={plan.id}
                  className={`cursor-pointer transition-all ${
                    selectedPlan === plan.id
                      ? "border-primary ring-2 ring-primary"
                      : "hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  <CardHeader className="text-center">
                    <Icon className="w-8 h-8 mx-auto text-primary mb-2" />
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription className="text-xl font-bold">
                      {plan.price}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex gap-2 items-center">
                          <Check className="w-4 h-4 text-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="text-center">
            <Button
              size="lg"
              disabled={!selectedPlan}
              onClick={handlePlanConfirm}
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center relative">
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-4 top-4"
              onClick={() => onBack()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <Building2 className="w-10 h-10 mx-auto text-primary mb-2" />
            <CardTitle>Register Your College</CardTitle>
            <CardDescription>Fill your institution details</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={()=>{setStep(4)}} className="space-y-4">
              <div>
                <Label>College Name</Label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <Label>Admin Name</Label>
                <Input
                  name="adminName"
                  value={formData.adminName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <Label>Password</Label>
                <Input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <Label>Domain</Label>
                <Input
                  name="domain"
                  value={formData.domain}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label>Address</Label>
                <Textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label>Phone</Label>
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label>Website</Label>
                <Input
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>

              <Button type="submit" className="w-full">
                Continue to Plans
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center relative">
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-4 top-4"
              onClick={() => setStep(1)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <CardTitle>Verify OTP</CardTitle>
            <CardDescription>OTP sent to {formData.email}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Label>Enter OTP</Label>
            <Input value={otp} onChange={(e) => setOtp(e.target.value)} />

            <Button className="w-full" onClick={handleVerifyOtp}>
              Verify OTP
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-4 top-4"
            onClick={onBack}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <Building2 className="w-10 h-10 mx-auto text-primary mb-2" />
          <CardTitle>College Signup</CardTitle>
          <CardDescription>Enter your email to receive OTP</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Label>Email</Label>
          <Input
            type="email"
            name="email"
            placeholder="admin@college.edu"
            value={formData.email}
            onChange={handleInputChange}
          />

          <Button className="w-full" onClick={handleSendOtp}>
            Send OTP
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CollegeSignup;
