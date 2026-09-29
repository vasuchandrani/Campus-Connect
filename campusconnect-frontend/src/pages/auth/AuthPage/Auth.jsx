import "./AuthPage.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/Card";
import {
  GraduationCap,
  BookOpen,
  Building2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import ProfessorAuth from "../../../components/auth/ProfessorAuth";
import StudentAuth from "../../../components/auth/StudentAuth";
import CollegeAdminAuth from "../../../components/auth/CollegeAdminAuth";
import { toast } from "../../../hooks/use-toast";

// configuration for primary user roles
const roleConfig = {
  collegeAdmin: {
    icon: Building2,
    label: "College Admin",
    description: "Manage institution profiles, subscriptions, faculty, and departments",
    accentBg: "bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 group-hover:bg-blue-500/25",
    borderHover: "hover:border-blue-500/50",
    badge: "Institution Management",
  },
  professor: {
    icon: BookOpen,
    label: "Faculty Professor",
    description: "Evaluate student research submissions, evaluate papers, and mentor clubs",
    accentBg: "bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 group-hover:bg-amber-500/25",
    borderHover: "hover:border-amber-500/50",
    badge: "Academic Mentorship",
  },
  student: {
    icon: GraduationCap,
    label: "Student",
    description: "Explore campus clubs, register for live events, and publish research",
    accentBg: "bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500/25",
    borderHover: "hover:border-emerald-500/50",
    badge: "Student Portal",
    hasSignup: true,
  },
};

const Auth = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setIsLogin(true);
  };

  const handleBack = () => {
    setSelectedRole(null);
    setEmail("");
    setPassword("");
  };

  const handleSimpleLogin = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (selectedRole) {
      const result = await login(email, password, selectedRole);
      if (typeof result === "string" && result === "EXPIRE subscription") {
        toast({
          description:
            "Your College's subscription has expired. Please contact the administrator.",
          variant: "destructive",
        });
      } else if (
        typeof result === "string" &&
        result.startsWith("/")
      ) {
        navigate(result);
      } else {
        toast({
          description:
            result || "Invalid email or password. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  // select role view
  if (!selectedRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-5xl">
          {/* Header */}
          <div className="text-center mb-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>CampusConnect Unified Access</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Choose Your Role
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto">
              Select your portal below to sign in or register your account on CampusConnect
            </p>
          </div>

          {/* Role Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.keys(roleConfig).map((role) => {
              const config = roleConfig[role];
              const Icon = config.icon;
              return (
                <Card
                  key={role}
                  className={`cursor-pointer border border-border/70 bg-card/80 backdrop-blur-xs ${config.borderHover} hover:shadow-xl transition-all duration-300 group hover:-translate-y-1 rounded-2xl flex flex-col justify-between`}
                  onClick={() => handleRoleSelect(role)}
                >
                  <CardHeader className="text-center pb-3">
                    <div
                      className={`mx-auto w-16 h-16 rounded-2xl ${config.accentBg} flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-105 shadow-xs`}
                    >
                      <Icon className="w-8 h-8" />
                    </div>
                    <div className="inline-block mx-auto mb-1">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80 bg-muted/60 px-2.5 py-0.5 rounded-full">
                        {config.badge}
                      </span>
                    </div>
                    <CardTitle className="text-xl font-bold text-foreground">
                      {config.label}
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed pt-1">
                      {config.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-0 text-center">
                    <div className="w-full pt-4 border-t border-border/50 flex items-center justify-center gap-2 text-xs font-semibold text-primary group-hover:text-primary transition-colors">
                      <span>Enter Portal</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Bottom navigation */}
          <div className="text-center mt-10">
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to CampusConnect Home</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const config = roleConfig[selectedRole];

  // render login/signup forms based on selected role
  if (selectedRole === "professor") {
    return (
      <ProfessorAuth
        handleBack={handleBack}
        isLogin={isLogin}
        setIsLogin={setIsLogin}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        handleSimpleLogin={handleSimpleLogin}
      />
    );
  }

  if (selectedRole === "collegeAdmin") {
    return (
      <CollegeAdminAuth
        handleBack={handleBack}
        isLogin={isLogin}
        setIsLogin={setIsLogin}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        handleSimpleLogin={handleSimpleLogin}
      />
    );
  }

  if (selectedRole === "student") {
    return (
      <StudentAuth
        config={config}
        handleBack={handleBack}
        isLogin={isLogin}
        setIsLogin={setIsLogin}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        handleSimpleLogin={handleSimpleLogin}
      />
    );
  }
};

export default Auth;
