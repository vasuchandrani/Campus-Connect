import { useState,useEffect } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { collegeAdminNavItems } from "../../config/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { Label } from "../../components/ui/Label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/Tabs";
import { Globe, CreditCard, Shield } from "lucide-react";
import { toast } from "../../hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const AdminSettingsPage = () => {

  //state variables
  const [profile, setProfile] = useState({
    adminName: "",
    adminEmail: "",
    adminPhone: "",
    institutionName: "",
    institutionDomain: "",
    website: "",
    description: "",
    address: ""
  });

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [requesting,setRequesting] = useState(false);

    const navigate = useNavigate();
    const { routeProtection } = useAuth();
  
    useEffect(() => {
      if (!routeProtection("COLLEGE_ADMIN")) {
        navigate("/auth");
      }
    },[]);

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  //baseurl
  const baseUrl="http://localhost:8080/campus-connect/college-admin";

  //save profile
  const saveProfile = async () => {
    try {

      const payload={
        fullName: profile.adminName,
        email: profile.adminEmail,
        phoneNumber: profile.adminPhone,
        collegeName: profile.institutionName,
        domain: profile.institutionDomain,
        website: profile.website,
        collegeDescription: profile.description,
        collegeAddress: profile.address
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

      if (data.message === "Your profile has been updated successfully!") {
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

    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Something went wrong!",
        variant: "destructive",
      });
    } finally {
      setRequesting(false);
    }
  };

  //get profile details
  const getProfile = async () => {
    try {
      const response = await fetch(`${baseUrl}/profile`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`
        }
      });

      const data = await response.json();
      setProfile({
        adminName: data.fullName || "",
        adminEmail: data.email || "",
        adminPhone: data.phoneNumber || "",
        institutionName: data.collegeName || "",
        institutionDomain: data.domain || "",
        website: data.website || "",
        description: data.collegeDescription || "",
        address: data.collegeAddress || ""
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  useEffect(() => {
    getProfile();
   }, []);

   //change password
  const changePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast ({
        title: "Error",
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
        oldPassword: currentPassword,
        newPassword,
        role: "COLLEGE_ADMIN"
      }),
    })
    .then(async(res) => await res.json())
      .then((res) => {
        if (res.message === "Your password changed successfully!") {
          toast({
            title: "Success",
            description: res.message,
            variant: "success",
          });
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        } else {
          toast({
            title: "Error",
            description: res.message || "Failed to update password. Please try again.",
            variant: "destructive",
          });
        }
      })
      .catch((err) => {
        console.error("Error updating password:", err);
        toast({
          title: "Error",
          description: "An error occurred while updating password. Please try again.",
          variant: "destructive",
        });
      }).finally(() => setRequesting(false));
  };

  return (
    <DashboardLayout navItems={collegeAdminNavItems} title="Settings">

      <div className="max-w-4xl mx-auto space-y-6">

        <div>
          <h1 className="text-3xl font-bold">College Settings</h1>
          <p className="text-muted-foreground">
            Manage your institution's profile and preferences
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">

          <TabsList>

            <TabsTrigger value="profile">
              <Globe className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>

            <TabsTrigger value="subscription">
              <CreditCard className="w-4 h-4 mr-2" />
              Subscription
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
                <CardTitle>Institution Profile</CardTitle>

                <CardDescription>
                  Your college's public information on CampusConnect
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">

                <div className="grid md:grid-cols-2 gap-4">

                  <div className="space-y-2">
                    <Label>Admin Name</Label>
                    <Input
                      name="adminName"
                      value={profile.adminName}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Admin Email</Label>
                    <Input
                      name="adminEmail"
                      value={profile.adminEmail}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Admin Phone No</Label>
                    <Input
                      name="adminPhone"
                      value={profile.adminPhone}
                      onChange={handleChange}
                    />
                  </div>

                  <div></div>

                  <div>
                    <b>College Info:</b>
                  </div>

                  <div></div>

                  <div className="space-y-2">
                    <Label>Institution Name</Label>
                    <Input
                      name="institutionName"
                      value={profile.institutionName}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Institution Domain</Label>
                    <Input
                      name="institutionDomain"
                      value={profile.institutionDomain}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Website</Label>
                    <Input
                      name="website"
                      value={profile.website}
                      onChange={handleChange}
                    />
                  </div>

                </div>

                <div className="space-y-2">

                  <Label>Description</Label>

                  <Textarea
                    name="description"
                    className="min-h-24"
                    value={profile.description}
                    onChange={handleChange}
                  />

                </div>

                <div className="space-y-2">

                  <Label>Address</Label>

                  <Input
                    name="address"
                    value={profile.address}
                    onChange={handleChange}
                  />

                </div>

                <Button onClick={saveProfile} disabled={requesting}>
                  Save Changes
                </Button>

              </CardContent>

            </Card>

          </TabsContent>


          {/* SUBSCRIPTION TAB */}

          <TabsContent value="subscription">

            <Card>

              <CardHeader>
                <CardTitle>Subscription Plan</CardTitle>

                <CardDescription>
                  Manage your CampusConnect subscription
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">

                <div className="p-4 border rounded-lg bg-primary/5">

                  <div className="flex items-center justify-between mb-4">

                    <div>
                      <h3 className="text-xl font-bold">
                        Premium Plan
                      </h3>

                      <p className="text-muted-foreground">
                        Active until Dec 31, 2024
                      </p>
                    </div>

                    <span className="bg-primary text-white px-3 py-1 rounded text-sm">
                      Current Plan
                    </span>

                  </div>

                </div>

                <div className="flex gap-4">

                  <Button variant="outline" disabled={requesting}>
                    View Invoice History
                  </Button>

                  <Button disabled={requesting}>
                    Upgrade Plan
                  </Button>

                </div>

              </CardContent>

            </Card>

          </TabsContent>


          {/* SECURITY TAB */}

          <TabsContent value="security">

            <Card>

              <CardHeader>

                <CardTitle>
                  Security Settings
                </CardTitle>

                <CardDescription>
                  Manage admin access and security
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

                <Button onClick={changePassword} disabled={requesting}>
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

export default AdminSettingsPage;