import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/Tabs";
import { Shield, User } from "lucide-react";
import { reviewerNavItems } from "../../config/Navigation";
import { useEffect, useState } from "react";
import { toast } from "../../hooks/use-toast";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const ReviewerSetting = () => {
  //stat variables
  const [user,setUser]=useState({
    fullName: "",
    email:""
  });

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [requesting,setRequesting] = useState(false);
  const navigate=useNavigate();

        const { routeProtection } = useAuth();
    
      useEffect(() => {
        if (!routeProtection("REVIEWER")) {
          navigate("/auth");
        }
      },[]);


  //fetch profile
  const fetchProfile = async () => {
    try {
      const response = await fetch(
        "http://localhost:8080/campus-connect/reviewer/profile",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`
          }
        }
      );

      const data = await response.json();
      setUser({
        fullName: data.fullName || "",
        email: data.email || ""
      });
    } catch (error) {
      toast({
        title: "Failed to fetch profile",
        description: error.message || "An error occurred while fetching profile information.",
        variant: "destructive",
      });
    }
  }

  useEffect(() => {
    fetchProfile();
  }, []);


  const handleChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value
    });
  };

  //update profile
  const saveChanges = async () => {
    setRequesting(true);
    await fetch("http://localhost:8080/campus-connect/reviewer/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`
      },
      body: JSON.stringify(user)
    })
    .then((res) => res.json())
    .then((res) => {
      if (res.message === "Your profile has been updated successfully!") {
        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully!",
          variant: "success",
        });
        fetchProfile();
        
      } else {
        toast({
          title: "Failed to update profile",
          description: res.message || "An error occurred while updating profile.",
          variant: "destructive",
        });
      }
    })
    .catch((error) => {
      toast({
        title: "Error",
        description: error.message || "An error occurred while updating profile. Please try again.",
        variant: "destructive",
      });
    }).finally(() => {
      setRequesting(false);
    });
  }

  //save new password
  const updatePassword = async () => {
    if(newPassword !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirm password do not match.",
        variant: "destructive",
      });
      return;
    }

    setRequesting(true);
    await fetch("http://localhost:8080/campus-connect/security/change-pwd", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`
      },
      body: JSON.stringify({
        oldPassword:currentPassword,
        newPassword,     
        role: "REVIEWER"
      })
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.message === "Your password changed successfully!") {
          toast({
            title: "Password Updated",
            description: "Your password has been updated successfully!",
            variant: "success",
          });
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        } else if (res.status === 400) {
          toast({
            title: "Incorrect Password",
            description: "Current password is incorrect. Please try again.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Failed to update password",
            description: res.message || "Failed to update password. Please try again.",
            variant: "destructive",
          });
        }
      })
      .catch((err) => {
        toast({
          title: "Error",
          description: err.message||"An error occurred while updating password. Please try again.",
          variant: "destructive",
        });
      }); 
  }


  return (
    <DashboardLayout navItems={reviewerNavItems} title="Settings">
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
                <CardDescription>
                  Update your personal details
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">


                <div className="grid gap-4 md:grid-cols-2">

                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input name="fullName" value={user.fullName} onChange={handleChange} />
                  </div>

                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" name="email" value={user.email} onChange={handleChange} />
                  </div>

                  

                </div>

                <Button disabled={requesting} onClick={() => saveChanges()}>
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

export default ReviewerSetting;