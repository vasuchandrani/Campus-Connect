import { Button } from "../ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/Tabs";
import { ArrowLeft, Building2 } from "lucide-react";

import CollegeAdminLogin from "./CollageAdminLogin";
import CollegeSignup from "./CollegeSignup";

const CollegeAdminAuth = ({
  handleBack,
  isLogin,
  setIsLogin,
  email,
  setEmail,
  password,
  setPassword,
  handleSimpleLogin,
}) => {
  if (!isLogin) {
    return <CollegeSignup onBack={handleBack} />;
  }

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
            <Building2 className="w-8 h-8 text-primary" />
          </div>

          <CardTitle>College Admin</CardTitle>
          <CardDescription>Manage your institution</CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs value="login">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup" onClick={() => setIsLogin(false)}>
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <CollegeAdminLogin
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                handleSimpleLogin={handleSimpleLogin}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default CollegeAdminAuth;
