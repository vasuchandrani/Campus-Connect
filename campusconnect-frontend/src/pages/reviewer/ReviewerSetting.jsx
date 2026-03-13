import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/Tabs";
import { Shield, User } from "lucide-react";
import { reviewerNavItems } from "../../config/Navigation";
import { useEffect, useState } from "react";

const ReviewerSetting = () => {
  //stat variables
  const [user,setUser]=useState({
    fullName: "",
    email:""
  });

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");


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
      console.error("Failed to fetch profile:", error);
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
        alert("Profile updated successfully!");
      } else {
        alert(res.message || "Failed to update profile. Please try again.");
      }
    })
    .catch((error) => {
      console.error("Error updating profile:", error);
      alert("An error occurred while updating profile.");
    });
  }

  //save new password
  const updatePassword = async () => {
    if(newPassword !== confirmPassword) {
      alert("New password and confirm password do not match.");
      return;
    }

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
          alert("Password updated successfully!");
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        } else if (res.status === 400) {
          alert("Current password is incorrect. Please try again.");
        } else {
          alert(res.message || "Failed to update password. Please try again.");
        }
      })
      .catch((err) => {
        console.error("Error updating password:", err);
        alert("An error occurred while updating password. Please try again.");
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

                <Button onClick={() => saveChanges()}>
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

                <Button onClick={() => updatePassword()}>
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