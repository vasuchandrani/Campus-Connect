import "./JournalistSetting.css";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Label } from "../../../components/ui/Label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/Tabs";
import { Shield, User } from "lucide-react";
import { journalistNavItems } from "../../../config/Navigation";
import { useEffect, useState } from "react";
import { toast } from "../../../hooks/use-toast";
import { useAuth } from "../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import PageSkeleton from "../../../components/ui/PageSkeleton";
import { journalistApi, securityApi } from "../../../services/api";

const JournalistSetting = () => {
  // state variables
  const [user, setUser] = useState({
    fullName: "",
    about: "",
    portfolio: ""
  });

  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [requesting, setRequesting] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const { routeProtection } = useAuth();

  useEffect(() => {
    if (!routeProtection("JOURNALIST")) {
      navigate("/auth");
    }
  }, [navigate, routeProtection]);

  const handleChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value
    });
  };

  // get Profile
  const getProfile = async () => {
    try {
      const data = await journalistApi.getProfile();
      setUser({
        fullName: data.fullName || "",
        about: data.about || "",
        portfolio: data.portfolio || ""
      });
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    getProfile();
  }, []);

  // update profile
  const saveChanges = async () => {
    if (user.fullName.trim() === "") {
      toast({
        title: "Error",
        description: "Full name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    try {
      const payload = {
        fullName: user.fullName,
        about: user.about,
        portfolio: user.portfolio
      };
      setRequesting(true);
      const data = await journalistApi.updateProfile(payload);

      if (data.message === "Your profile has been updated successfully!") {
        toast({
          title: "Success",
          description: data.message,
          variant: "success",
        });
        getProfile();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to update profile. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "An error occurred while updating profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRequesting(false);
    }
  };

  // change password
  const updatePassword = async () => {
    if (newPassword.length < 6 || newPassword.trim() === "") {
      toast({
        title: "Error",
        description: "New password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New password and confirm password do not match.",
        variant: "destructive",
      });
      return;
    }

    try {
      setRequesting(true);
      const data = await securityApi.changePassword({
        oldPassword: currentPassword,
        newPassword,
        role: "JOURNALIST"
      });

      if (data.message === "Your password changed successfully!") {
        toast({
          title: "Success",
          description: data.message,
          variant: "success",
        });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to update password. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while updating password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRequesting(false);
    }
  };

  if (pageLoading) {
    return (
      <DashboardLayout navItems={journalistNavItems} title="Settings">
        <PageSkeleton variant="detail" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={journalistNavItems} title="Settings">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Settings</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage your account preferences
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="w-full grid grid-cols-2 sm:inline-flex sm:w-auto p-1 bg-muted/60 border border-border/60 rounded-xl gap-1">
            <TabsTrigger value="profile">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="w-4 h-4 mr-2" />
              Security
            </TabsTrigger>
          </TabsList>

          {/* PROFILE TAB */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal details
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input
                      name="fullName"
                      value={user.fullName}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>About</Label>
                    <Input
                      name="about"
                      value={user.about}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Portfolio Url</Label>
                    <Input
                      name="portfolio"
                      value={user.portfolio}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <Button onClick={() => saveChanges()} disabled={requesting}>
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SECURITY TAB */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage your account security
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Current Password</Label>
                    <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <Label>New Password</Label>
                    <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <Label>Confirm New Password</Label>
                    <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                  </div>
                </div>

                <Button onClick={() => updatePassword()} disabled={requesting}>
                  Update Password
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default JournalistSetting;