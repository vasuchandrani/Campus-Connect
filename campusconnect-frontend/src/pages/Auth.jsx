import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import { GraduationCap, Newspaper, FileSearch, Building2 } from "lucide-react";
import JournalistLogin from "../components/auth/JournalistLogin";
import ReviewerLogin from "../components/auth/ReviewerLogin";
import StudentAuth from "../components/auth/StudentAuth";
import CollegeAdminAuth from "../components/auth/CollageAdminAuth";

// configuration for different user roles
const roleConfig = {
  collegeAdmin: { icon: Building2, label: "College Admin", description: "Manage your institution", hasSignup: true },
  journalist: { icon: Newspaper, label: "Journalist", description: "Write campus news", hasSignup: false },
  reviewer: { icon: FileSearch, label: "Reviewer", description: "Review research papers", hasSignup: false },
  student: { icon: GraduationCap, label: "Student", description: "Access campus updates & events", hasSignup: true },
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

  const handleSimpleLogin = async(e) => {
    e.preventDefault();

    if(selectedRole){
      const success = await login(email, password, selectedRole);

      if (typeof success === "string" && success !== "Invalid credentials") {
        navigate(success);
      } else {
        alert("Invalid credentials");
      }  
    }
  };

  // select role view
  if (!selectedRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <div className="w-full max-w-3xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to CampusConnect</h1>
            <p className="text-muted-foreground">Select your role to continue</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.keys(roleConfig).map((role) => {
              const config = roleConfig[role];
              const Icon = config.icon;
              return (
                <Card
                  key={role}
                  className="cursor-pointer hover:border-primary hover:shadow-lg transition-all duration-300 group"
                  onClick={() => handleRoleSelect(role)}
                >
                  <CardHeader className="text-center">
                    <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{config.label}</CardTitle>
                    <CardDescription>{config.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-xs text-muted-foreground">
                      {config.hasSignup ? "Login or Sign up" : "Login only (assigned by College Admin)"}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const config = roleConfig[selectedRole];

// render login/signup forms based on selected role
  if (selectedRole === "journalist") {
    return <JournalistLogin onBack={handleBack}/>;
  }

  if (selectedRole === "reviewer") {
    return <ReviewerLogin onBack={handleBack}/>;
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

    if(selectedRole === "student"){
      return <StudentAuth
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
    }
  
};

export default Auth;
