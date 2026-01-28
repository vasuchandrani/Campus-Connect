import { Button } from "../ui/Button";
import {Card,CardContent,CardDescription,CardHeader,CardTitle} from "../ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/Tabs";
import { GraduationCap, ArrowLeft } from "lucide-react";

import StudentLogin from "./StudentLogin";
import StudentSignup from "./StudentSignup"; 

const StudentAuth = ({
  config = {
    icon: GraduationCap,
    label: "Student",
    description: "Access campus updates & events",
    hasSignup: true,
  },
  handleBack,
  isLogin,
  setIsLogin,
  email,
  setEmail,
  password,
  setPassword,
  handleSimpleLogin,
}) => {
  // student authentication form
  if (!isLogin) {
    return <StudentSignup onBack={handleBack} />;
  }

  const RoleIcon = config.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-4 top-4"
            onClick={handleBack}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <RoleIcon className="w-8 h-8 text-primary" />
          </div>

          <CardTitle>{config.label}</CardTitle>
          <CardDescription>{config.description}</CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs value="login">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              {config.hasSignup && (
                <TabsTrigger value="signup" onClick={() => setIsLogin(false)}>
                  Sign Up
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="login">
              <StudentLogin
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                handleSimpleLogin={handleSimpleLogin}
                label={config.label}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentAuth;
