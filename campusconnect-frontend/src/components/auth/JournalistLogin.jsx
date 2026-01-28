import { useState } from "react";
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
import { ArrowLeft, Newspaper, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "../ui/Alert";
import { useNavigate } from "react-router-dom";

const JournalistLogin = ({ onBack }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  // login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const success = await login(email, password, "journalist");
    if (typeof success === "string" && success !== "Invalid credentials") {
      navigate(success);
    } else {
      alert("Invalid credentials");
    }
  };
  // journalist login form
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
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

          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Newspaper className="w-8 h-8 text-primary" />
          </div>

          <CardTitle>Journalist Login</CardTitle>
          <CardDescription>
            Login with the credentials provided by your college administrator
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 mb-4">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> Journalists are assigned by college admins.
              If you don't have access, please contact your college
              administration.
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full">
              Login as Journalist
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default JournalistLogin;
