import "./ProfessorSettings.css";
import React, { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Label } from "../../../components/ui/Label";
import { Badge } from "../../../components/ui/Badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/Tabs";
import { Shield, User, Key, Building2, Save } from "lucide-react";
import { professorNavItems } from "../../../config/Navigation";
import { toast } from "../../../hooks/use-toast";
import { useAuth } from "../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import PageSkeleton from "../../../components/ui/PageSkeleton";
import { professorApi, securityApi, departmentApi } from "../../../services/api";

const navItems = professorNavItems;

export default function ProfessorSettings() {
  const navigate = useNavigate();
  const { routeProtection } = useAuth();

  const [user, setUser] = useState({
    fullName: "",
    email: "",
    department: "",
    departmentId: null,
  });
  const [departments, setDepartments] = useState([]);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [requesting, setRequesting] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (!routeProtection("PROFESSOR")) {
      navigate("/auth");
      return;
    }
    fetchProfile();
  }, [navigate, routeProtection]);

  const fetchProfile = async () => {
    try {
      const [data, deptsData] = await Promise.all([
        professorApi.getProfile(),
        departmentApi.getMyCollegeDepartments().catch(() => []),
      ]);
      setUser({
        fullName: data.fullName || "",
        email: data.email || "",
        department: data.department || data.departmentName || "",
        departmentId: data.departmentId || null,
      });
      setDepartments(Array.isArray(deptsData) ? deptsData : []);
    } catch (error) {
      toast({
        title: "Failed to fetch profile",
        description: error.message || "An error occurred while fetching profile information.",
        variant: "destructive",
      });
    } finally {
      setPageLoading(false);
    }
  };

  const handleChange = useCallback((e) => {
    setUser((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }, []);

  const saveChanges = async () => {
    if (!user.fullName.trim()) {
      toast({
        title: "Validation Error",
        description: "Full name cannot be empty.",
        variant: "destructive",
      });
      return;
    }
    if (!user.email.trim()) {
      toast({
        title: "Validation Error",
        description: "Email cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    setRequesting(true);
    try {
      const selectedDeptObj = departments.find((d) => d.name === user.department);
      const res = await professorApi.updateProfile({
        ...user,
        departmentId: selectedDeptObj?.id || user.departmentId,
      });
      toast({
        title: "Profile Updated",
        description: res.message || "Your profile has been updated successfully!",
        variant: "success",
      });
      fetchProfile();
    } catch (error) {
      toast({
        title: "Update Failed",
        description: error.message || "An error occurred while updating profile.",
        variant: "destructive",
      });
    } finally {
      setRequesting(false);
    }
  };

  const updatePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirm password do not match.",
        variant: "destructive",
      });
      return;
    }
    if (newPassword.length < 6 || !newPassword.trim()) {
      toast({
        title: "Password Too Short",
        description: "New password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setRequesting(true);
    try {
      const res = await securityApi.changePassword({
        oldPassword: currentPassword,
        newPassword,
        role: "PROFESSOR",
      });
      toast({
        title: "Password Updated",
        description: res.message || "Your password has been changed successfully!",
        variant: "success",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast({
        title: "Update Failed",
        description: err.message || "An error occurred while changing your password.",
        variant: "destructive",
      });
    } finally {
      setRequesting(false);
    }
  };

  if (pageLoading) {
    return (
      <DashboardLayout navItems={navItems} title="Settings">
        <PageSkeleton variant="detail" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={navItems} title="Settings">
      <div className="max-w-4xl mx-auto space-y-5 sm:space-y-6 w-full">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
            Account Settings
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage your faculty profile information, login credentials, and security preferences
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="w-full grid grid-cols-2 sm:inline-flex sm:w-auto p-1 bg-muted/60 border border-border/60 rounded-xl gap-1">
            <TabsTrigger
              value="profile"
              className="text-xs sm:text-sm font-semibold rounded-lg px-3.5 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs"
            >
              <User className="w-4 h-4 mr-1.5" />
              Profile Details
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="text-xs sm:text-sm font-semibold rounded-lg px-3.5 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs"
            >
              <Shield className="w-4 h-4 mr-1.5" />
              Security & Credentials
            </TabsTrigger>
          </TabsList>

          {/* PROFILE TAB */}
          <TabsContent value="profile">
            <Card className="border-border/80 shadow-xs">
              <CardHeader className="pb-4">
                <CardTitle className="text-base sm:text-lg font-bold">
                  Personal Information
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Update your contact email and public academic name displayed across the portal
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-foreground">
                      Full Name *
                    </Label>
                    <Input
                      name="fullName"
                      value={user.fullName}
                      onChange={handleChange}
                      className="h-9 text-xs sm:text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-foreground">
                      Institutional Email *
                    </Label>
                    <Input
                      type="email"
                      name="email"
                      value={user.email}
                      onChange={handleChange}
                      className="h-9 text-xs sm:text-sm"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-primary" />
                      Academic Department
                    </Label>
                    <select
                      name="department"
                      value={user.department}
                      onChange={handleChange}
                      className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs sm:text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="" className="bg-popover text-popover-foreground">Select Department</option>
                      {departments.map((dept) => (
                        <option
                          key={dept.id || dept.name}
                          value={dept.name}
                          className="bg-popover text-popover-foreground"
                        >
                          {dept.name} {dept.code && dept.code !== dept.name ? `(${dept.code})` : ""}
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-muted-foreground">
                      Only departments affiliated with your registered college are available.
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    disabled={requesting}
                    onClick={saveChanges}
                    size="sm"
                    className="text-xs sm:text-sm font-semibold h-9 px-4 shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5 mr-1.5" />
                    {requesting ? "Saving Changes..." : "Save Profile Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SECURITY TAB */}
          <TabsContent value="security">
            <Card className="border-border/80 shadow-xs">
              <CardHeader className="pb-4">
                <CardTitle className="text-base sm:text-lg font-bold">
                  Change Password
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Update your faculty portal password. Ensure it has at least 6 characters.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 max-w-md">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-foreground">
                    Current Password *
                  </Label>
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="h-9 text-xs sm:text-sm"
                    placeholder="Enter current password"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-foreground">
                    New Password *
                  </Label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="h-9 text-xs sm:text-sm"
                    placeholder="Enter new password (min 6 chars)"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-foreground">
                    Confirm New Password *
                  </Label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-9 text-xs sm:text-sm"
                    placeholder="Re-enter new password"
                  />
                </div>

                <div className="pt-2">
                  <Button
                    onClick={updatePassword}
                    disabled={requesting}
                    size="sm"
                    className="text-xs sm:text-sm font-semibold h-9 px-4 shadow-xs"
                  >
                    <Key className="w-3.5 h-3.5 mr-1.5" />
                    {requesting ? "Updating..." : "Update Password"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
