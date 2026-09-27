import { Button } from "../ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/Tabs";
import { BookOpen, ArrowLeft } from "lucide-react";

import ProfessorLogin from "./ProfessorLogin";
import ProfessorSignup from "./ProfessorSignup";

const ProfessorAuth = ({
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
    return <ProfessorSignup onBack={() => setIsLogin(true)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-border/70 backdrop-blur-xs">
        <CardHeader className="text-center relative pb-2">
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-4 top-4"
            onClick={handleBack}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>

          <CardTitle className="text-2xl font-bold">Professor Portal</CardTitle>
          <CardDescription>
            Evaluate research papers & academic mentorship
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4">
          <Tabs value="login" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 p-1 bg-muted/70 rounded-xl">
              <TabsTrigger value="login" className="font-medium">
                Login
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                onClick={() => setIsLogin(false)}
                className="font-medium"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-2">
              <ProfessorLogin
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

export default ProfessorAuth;
