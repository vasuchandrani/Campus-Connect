import "./StudentSetting.css";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Label } from "../../../components/ui/Label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/Tabs";
import { Shield, User, Key, Save, Building2 } from "lucide-react";
import { studentNavItems } from "../../../config/Navigation";
import { useEffect, useState } from "react";
import { toast } from "../../../hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import PageSkeleton from "../../../components/ui/PageSkeleton";
import { studentApi, securityApi, departmentApi } from "../../../services/api";

const StudentSetting = () => {
  const [user, setUser] = useState({
    fullName: "",
    gender: "",
    department: "",
  });
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState("");
  const [department, setDepartment] = useState("");
  const [departments, setDepartments] = useState([]);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [requesting, setRequesting] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const navigate = useNavigate();
  const { routeProtection } = useAuth();

  useEffect(() => {
    if (!routeProtection("STUDENT")) {
      navigate("/auth");
    }
  }, [navigate, routeProtection]);

  useEffect(() => {
    getStudentInfo();
  }, []);

  // get student info
  const getStudentInfo = async () => {
    try {
      const [profileData, deptsData] = await Promise.all([
        studentApi.getProfile(),
        departmentApi.getMyCollegeDepartments().catch(() => []),
      ]);
      setUser(profileData);
      setFullName(profileData.fullName || "");
      setGender(profileData.gender || "");
      setDepartment(profileData.department || "");
      setDepartments(Array.isArray(deptsData) ? deptsData : []);
    } catch (err) {
      console.error("Failed to fetch student info:", err);
    } finally {
      setPageLoading(false);
    }
  };

  // update password
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
      const data = await securityApi.changePassword({
        oldPassword: currentPassword,
        newPassword,
        role: "STUDENT",
      });

      toast({
        title: "Password Updated",
        description: data.message || "Your password has been changed successfully!",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast({
        title: "Update Failed",
        description: err.message || "Failed to update password. Please check your current password.",
        variant: "destructive",
      });
    } finally {
      setRequesting(false);
    }
  };

  // update profile
  const saveChanges = async () => {
    if (!fullName.trim()) {
      toast({
        title: "Validation Error",
        description: "Full name cannot be empty.",
        variant: "destructive",
      });
      return;
    }
    if (!gender.trim()) {
      toast({
        title: "Validation Error",
        description: "Please select a gender.",
        variant: "destructive",
      });
      return;
    }
    setRequesting(true);
    try {
      const selectedDeptObj = departments.find((d) => d.name === department);
      const data = await studentApi.updateProfile({
        fullName,
        gender,
        department,
        departmentId: selectedDeptObj?.id,
      });
      toast({
        title: "Profile Updated",
        description: data.message || "Profile updated successfully!",
      });
      getStudentInfo();
    } catch (err) {
      toast({
        title: "Update Failed",
        description: err.message || "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setRequesting(false);
    }
  };

  if (pageLoading) {
    return (
      <DashboardLayout navItems={studentNavItems} title="Settings" bell={true}>
        <PageSkeleton variant="detail" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      navItems={studentNavItems}
      title="Settings"
      bell={true}
    >
      <div className="max-w-4xl mx-auto space-y-5 sm:space-y-6 w-full">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
            Account Settings
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage your personal profile, credentials, and account preferences
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="w-full grid grid-cols-2 sm:inline-flex sm:w-auto p-1 bg-muted/60 border border-border/60 rounded-xl gap-1">
            <TabsTrigger
              value="profile"
              className="text-xs sm:text-sm font-semibold rounded-lg py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs flex items-center justify-center gap-1.5"
            >
              <User className="w-3.5 h-3.5 shrink-0" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="text-xs sm:text-sm font-semibold rounded-lg py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs flex items-center justify-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5 shrink-0" />
              <span>Security</span>
            </TabsTrigger>
          </TabsList>

          {/* PROFILE TAB */}
          <TabsContent value="profile" className="space-y-4 pt-1">
            <Card className="border-border/80">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg font-bold">Personal Profile Information</CardTitle>
                <CardDescription className="text-xs sm:text-sm text-muted-foreground">
                  Update your profile information and personal details
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-foreground">Full Name *</Label>
                    <Input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter full name"
                      className="h-9 text-xs sm:text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-foreground">Gender *</Label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs sm:text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="" className="bg-popover text-popover-foreground">Select Gender</option>
                      <option value="MALE" className="bg-popover text-popover-foreground">Male</option>
                      <option value="FEMALE" className="bg-popover text-popover-foreground">Female</option>
                      <option value="OTHER" className="bg-popover text-popover-foreground">Other</option>
                    </select>
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-primary" />
                      Academic Department
                    </Label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
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

                <div className="pt-2 flex justify-end">
                  <Button
                    onClick={saveChanges}
                    disabled={requesting}
                    className="text-xs sm:text-sm font-semibold h-9 px-4 gap-1.5 shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {requesting ? "Saving..." : "Save Profile Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SECURITY TAB */}
          <TabsContent value="security" className="space-y-4 pt-1">
            <Card className="border-border/80">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg font-bold">Account Security & Credentials</CardTitle>
                <CardDescription className="text-xs sm:text-sm text-muted-foreground">
                  Update your account password to ensure your student profile remains secure
                </CardDescription>
              </CardHeader>

              <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
                <div className="space-y-3.5 max-w-lg">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-foreground">Current Password *</Label>
                    <Input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="h-9 text-xs sm:text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-foreground">New Password *</Label>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="h-9 text-xs sm:text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-foreground">Confirm New Password *</Label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="h-9 text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    onClick={updatePassword}
                    disabled={requesting}
                    className="text-xs sm:text-sm font-semibold h-9 px-4 gap-1.5 shadow-xs"
                  >
                    <Key className="w-3.5 h-3.5" />
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
};

export default StudentSetting;
