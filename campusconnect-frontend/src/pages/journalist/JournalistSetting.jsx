import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/Tabs";
import { Shield, User } from "lucide-react";
import { journalistNavItems } from "../../config/Navigation";
import {  useEffect, useState } from "react";
import { toast } from "../../hooks/use-toast";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const JournalistSetting = () => {

  //stat variables
  const [user,setUser]=useState({
    fullName: "",
    about: "",
    portfolio: ""
  })

  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [requesting,setRequesting] = useState(false);

        const { routeProtection } = useAuth();
    
      useEffect(() => {
        if (!routeProtection("JOURNALIST")) {
          navigate("/auth");
        }
      },[]);

  //baseurl
  const baseUrl= "http://localhost:8080/campus-connect/journalist";

const handleChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value
    });
  };

  //get Profile
  const getProfile = async () => {
    try {
      const response = await fetch(
        `${baseUrl}/profile`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`
          }
        }
      );

      const data = await response.json();
      setUser({
        fullName: data.fullName||"" ,
        about: data.about||"",
        portfolio: data.portfolio||""
      });
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    }
  }

  useEffect(() => {
    getProfile();
  }, []);

  //update profile
const saveChanges = async () => {
    try {

      const payload={
        fullName: user.fullName,
        about: user.about,
        portfolio: user.portfolio
      }
      setRequesting(true);
      const response = await fetch(
        `${baseUrl}/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`
          },
          body: JSON.stringify(payload)
        }
      );

      const data = await response.json();

      if (data.message==="Your profile has been updated successfully!") {
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
      })
    }
    finally{
      setRequesting(false);
    }
  };


  //change password
  const updatePassword = async () => {
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
      const response = await fetch("http://localhost:8080/campus-connect/security/change-pwd", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`
        },
        body: JSON.stringify({
          oldPassword:currentPassword,
          newPassword,
          role: "JOURNALIST"
        })
        
      });
      const data=await response.json();
      
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
    }
    
      setRequesting(false);
  }


  return (
    <DashboardLayout navItems={journalistNavItems} title="Settings">
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