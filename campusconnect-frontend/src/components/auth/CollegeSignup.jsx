import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot
} from "../ui/InputOtp";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/Card";
import { Textarea } from "../ui/Textarea";
import { ArrowLeft, Building2, Check, Crown, Zap, Star, CheckCircle  } from "lucide-react";
import {toast} from "../../hooks/use-toast"
import { set } from "date-fns";

// Get the raw string, or an empty array string if undefined
const rawPlans = import.meta.env.VITE_SUBSCRIPTION_PLANS || "[]";

const getSubscriptionPlans = () => {
  try {
    return JSON.parse(rawPlans);
  } catch (err) {
    console.error("Failed to parse VITE_SUBSCRIPTION_PLANS:", err);
    return []; 
  }
};

const subscriptionPlans = getSubscriptionPlans();

const iconMap = {
  basic: Zap,
  premium: Star,
  enterprise: Crown,
};

// Map icons safely
subscriptionPlans.forEach((plan) => {
  plan.icon = iconMap[plan.id] || Zap;
  plan.popular = plan.isPopular;
});

const CollegeSignup = ({ onBack }) => {
  const navigate = useNavigate();
  const { collegeSignup } = useAuth();
  const [requesting,setRequesting]=useState(false);

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

  // SEND OTP
  const handleSendOtp =async () => {
    if (!formData.email) {
      toast({
        title: "Error",
        description: "Please enter your email address to receive OTP.",
        variant: "destructive",
      });
      return;
    }
    setRequesting(true);
    await fetch("https://campus-connect-nzc9.onrender.com/campus-connect/security/send-code", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: formData.email,
        codeFor: "College Admin email verification",
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message === "Verification code sent successfully") {
          toast({
            title: "Success",
            description: "OTP sent to " + formData.email,
            variant: "success",
          });
          setStep(2);
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
      }).finally(() => {
        setRequesting(false);
      });
  };

  // VERIFY OTP
  const handleVerifyOtp = async () => {
    if (!otp) {
      toast({
        title: "Error",
        description: "Please enter the OTP sent to your email.",
        variant: "destructive",
      });
      return;
    }
    setRequesting(true);
    await fetch("https://campus-connect-nzc9.onrender.com/campus-connect/security/verify-code", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: formData.email, code: otp }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message === "Code verified successfully") {
          setStep(3);
        } else {
          throw new Error(data.message);
        }
      })
      .catch((error) => toast({
        title: "Error",
        description: error.message || "Invalid OTP. Please try again.",
        variant: "destructive",
      })).finally(() => {
      setRequesting(false);
    });
  };

  //Resend OTP
  const resendOtp = async () => {
    setRequesting(true);
    const response = await fetch(
      "https://campus-connect-nzc9.onrender.com/campus-connect/security/send-code",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          codeFor: "College Admin email verification",
        }),
      },
    ).then((res) => res.json());
    if (response) {
      toast({
            title: "Success",
            description: "OTP sent to " + formData.email,
            variant: "success",
          });
    } else {
      toast({
            title: "Error",
            description: response.message,
            variant: "destractive",
          });
    }
    setRequesting(false);
  };

  // RAZORPAY PAYMENT
  const handlePlanConfirm = async () => {
    if (!selectedPlan) return;

    const plan = subscriptionPlans.find((p) => p.id === selectedPlan);

    try {
      const orderRes = await fetch(
        "https://campus-connect-nzc9.onrender.com/campus-connect/college-admin/create-order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: plan.amount,
            currency: "INR",
          }),
        }
      );

      const orderData = await orderRes.json();

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.orderId,
        name: "Campus Connect",
        description: `${plan.name} Subscription`,
        handler: async function (response) {

          const verifyRes = await fetch(
            "https://campus-connect-nzc9.onrender.com/campus-connect/college-admin/verify",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            }
          );

          const verified = await verifyRes.json();

          if (!verified) {
            alert("Payment verification failed");
            return;
          }

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
            paid: true,
            subscription:{
              planName: plan.name,
              amount: plan.amount,
              durationInMonths: plan.durationInMonths,
              isLimited: plan.isLimited,
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
            }
          });

          navigate(redirectUrl);
        },
        prefill: {
          name: formData.adminName,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: "#10b981",
        },
      };

      const razor = new window.Razorpay(options);
      razor.open();
    } catch (err) {
      console.error(err);
      alert("Payment initialization failed");
    }
  };

  // PLAN PAGE
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

  // COLLEGE DETAILS
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
            <CardDescription>
              Fill your institution details
            </CardDescription>

          </CardHeader>

          <CardContent>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setStep(4);
              }}
              className="space-y-4"
            >

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

  // OTP
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

            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>

            <CardTitle>Enter Verification Code</CardTitle>

            <CardDescription>
              We've sent a 6-digit code to {formData.email}
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
              onClick={handleVerifyOtp}
              className="w-full"
              disabled={otp.length !== 6 || requesting}
            >
              Verify Code
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Didn't receive the code?{" "}
              <Button disabled={requesting} variant="link" className="p-0 h-auto" onClick={resendOtp}>
                Resend
              </Button>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // EMAIL
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
          <CardDescription>
            Enter your email to receive OTP
          </CardDescription>

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

          <Button disabled={requesting} className="w-full" onClick={handleSendOtp}>
            Send OTP
          </Button>

        </CardContent>
      </Card>

    </div>
  );
};

export default CollegeSignup;