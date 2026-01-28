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
import {
  ArrowLeft,
  Building2,
  Check,
  Crown,
  Zap,
  Star,
  ImageOff,
} from "lucide-react";

// subscription plans data
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
    features: [
      "Up to 20 clubs",
      "Advanced analytics",
      "Priority support",
      "5 admin accounts",
      "Custom branding",
    ],
    popular: true,
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
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    phone: "",
    website: "",
    domain: "",
    description: "",
    adminName: "",
  });
  const [selectedPlan, setSelectedPlan] = useState(null);
  const { collegeSignup } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDetailsSubmit = async (e) => {
    e.preventDefault();

    // college form data send to database and get redirect url
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

    if (redirectUrl) {
      navigate(redirectUrl);
    }
  };

  const handlePlanSelect = (planId) => {
    setSelectedPlan(planId);
  };

  const handlePlanConfirm = () => {
    if (selectedPlan) {
      navigate("/admin-dashboard");
    }
  };

  // Step 2: Plan Selection
  if (step === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Choose Your Plan
            </h1>
            <p className="text-muted-foreground">
              Select a subscription plan that fits your institution
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {subscriptionPlans.map((plan) => {
              const Icon = plan.icon;
              return (
                <Card
                  key={plan.id}
                  className={`cursor-pointer transition-all duration-300 relative ${
                    selectedPlan === plan.id
                      ? "border-primary shadow-lg ring-2 ring-primary"
                      : "hover:border-primary/50 hover:shadow-md"
                  } ${plan.popular ? "md:-mt-4 md:mb-4" : ""}`}
                  onClick={() => handlePlanSelect(plan.id)}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
                      Most Popular
                    </div>
                  )}

                  <CardHeader className="text-center">
                    <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription className="text-2xl font-bold text-foreground">
                      {plan.price}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li
                          key={index}
                          className="flex items-center gap-2 text-sm"
                        >
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
              onClick={handlePlanConfirm}
              disabled={!selectedPlan}
              className="px-8"
            >
              Continue with{" "}
              {selectedPlan
                ? subscriptionPlans.find((p) => p.id === selectedPlan)?.name
                : "Plan"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Step 1: College Details Form
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
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
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <CardTitle>Register Your College</CardTitle>
          <CardDescription>
            Enter your institution details to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleDetailsSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="name">College/University Name *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="State University"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="name">College Admin Full Name *</Label>
                <Input
                  id="adminName"
                  name="adminName"
                  placeholder="John Doe"
                  value={formData.adminName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="email">Official Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@university.edu"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="domain">Domain</Label>
                <Input
                  id="domain"
                  name="domain"
                  type="text"
                  placeholder="university.edu"
                  value={formData.domain}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  name="address"
                  placeholder="123 University Ave, City, State"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+1 234 567 8900"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  name="website"
                  type="url"
                  placeholder="https://university.edu"
                  value={formData.website}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="description">About Your Institution</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Brief description of your institution..."
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
            </div>
            <Button type="submit" className="w-full">
              Continue to Plans
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CollegeSignup;
