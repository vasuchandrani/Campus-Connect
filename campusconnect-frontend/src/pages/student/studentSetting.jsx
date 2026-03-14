import DashboardLayout from "../../components/dashboard/DashboardLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/Tabs";
import { Shield, User } from "lucide-react";
import { studentNavItems } from "../../config/Navigation";
import { useEffect, useState } from "react";
import { toast } from "../../hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const StudentSetting = () => {
  //state variables
  const [user,setUser]=useState({
    name: "",
    gender:""
  })
  const [fullName, setFullName] = useState(user?.name || "");
  const [gender, setGender] = useState(user?.gender || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [requesting,setRequesting]=useState(false);

  //baseUrl
  const baseUrl= "https://campus-connect-nzc9.onrender.com/campus-connect/student";

        const navigate = useNavigate();
      const { routeProtection } = useAuth();
      useEffect(() => {
        if (!routeProtection("STUDENT")) {
          navigate("/auth");
        }
      },[]);

  //update password
  const updatePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New password and confirm password do not match",
        variant: "destructive",
      });
      return;
    }
    setRequesting(false);
    await fetch("https://campus-connect-nzc9.onrender.com/campus-connect/security/change-pwd", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
      body: JSON.stringify({
        oldPassword: currentPassword,
        newPassword,
        role: "STUDENT"
      }),
    })
    .then((res) => res.json())
      .then((res) => {
        if (res.ok) {
          const data=res.json();
          if(data.message==="Your password changed successfully!"){
            toast({
              title: "Success",
              description: data.message,
              variant: "success",
            });
            setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
          }
          else{
            toast({
              title: "Error",
              description: data.message || "Failed to update password. Please try again.",
              variant: "destructive",
            });
          }
         
          
        } else if (res.status === 400) {
          toast({
            title: "Error",
            description: res.message || "Incorrect current password.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: res.message || "Failed to update password. Please try again.",
            variant: "destructive",
          });
        }
      })
      .catch((err) => {
        toast({
          title: "Error",
          description: err.message || "An error occurred while updating password. Please try again.",
          variant: "destructive",
        });
      }).finally(() => {
        setRequesting(false);
      });

  };

  //get student info
   const getStudentInfo = () => {
      fetch(`${baseUrl}/profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setUser(data);
          setFullName(data.fullName);
          setGender(data.gender);
        })
        .catch((err) => {
          console.error("Failed to fetch student info:", err);
        }); 
  };

  //update profile
  const saveChanges = async () => {
    setRequesting(true);
    await fetch(`${baseUrl}/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
      body: JSON.stringify({ fullName,  gender }),
    })
      .then(async (res) => {
        const data=await res.json();
        if(data.message==="Your profile has been updated successfully!"){
          toast({
            title: "Success",
            description: data.message,
            variant: "success",
          });
        } else {
          toast({
            title: "Error",
            description: data.message || "Failed to update profile. Please try again.",
            variant: "destructive",
          });
        }
      })
      .catch((err) => {
        toast({
          title: "Error",
          description: err.message || "An error occurred while updating profile. Please try again.",
          variant: "destructive",
        });
      })
      .finally(() => {
        setRequesting(false);
      });
  };

  useEffect(() => {
    getStudentInfo();
  }, []);

  return (
    <DashboardLayout navItems={studentNavItems} title="Settings" bell={true}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account preferences
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
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
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full border rounded-md px-3 py-2 bg-background"
                    >
                      <option value="">Select Gender</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
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
                <CardDescription>Manage your account security</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Current Password</Label>
                    <Input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>New Password</Label>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Confirm New Password</Label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
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

export default StudentSetting;
