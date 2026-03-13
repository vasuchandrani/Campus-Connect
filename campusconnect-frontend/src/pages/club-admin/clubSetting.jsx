import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { Label } from "../../components/ui/Label";
import { Avatar, AvatarFallback } from "../../components/ui/Avatar";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/Tabs";

import { Upload, Globe, Trash2 } from "lucide-react";
import { clubAdminNavItems } from "../../config/Navigation";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "../../components/ui/Dialog";
import { useRef } from "react";

const ClubSettingsPage = () => {
  let { clubId } = useParams();
  const [openTransferDialog, setOpenTransferDialog] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const fileInputRef = useRef(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const navigate = useNavigate();

  const [clubData, setClubData] = useState({
    name:"Tech Club",
    description:"A community of technology enthusiasts exploring the latest innovations and building cool projects together.",
    website:"https://techclub.example.com",
  });

  //upload logo
const handleLogoUpload = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  setLogoFile(file); 
  const imageUrl = URL.createObjectURL(file);
  setLogoPreview(imageUrl);
};

// dialog change leader
const handleDialogChange = (open) => {
  setOpenTransferDialog(open);

  if (!open) {
    setStep(1);
    setEmail("");
    setOtp("");
  }
};

  const updatenavItems = () => {
    return clubAdminNavItems.map((item) => ({
      ...item,
      href: item.href.replace(":clubId", clubId),
    }));
  };

  //send otp
  const handleEmailSubmit = async () => {

    await fetch(`http://localhost:8080/campus-connect/security/send-code`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
      body: JSON.stringify({ email, codeFor:"EMAIL_VERIFICATION FOR HANDOVER_LEADERSHIP" }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message === "Verification code sent successfully") {
          alert("Verification code sent to " + email);
          setEmail("");  
          setStep(2);
        } else {
          alert(data.message || "Failed to send verification code. Please try again.");
        }
      })
      .catch((err) => {
        console.error("Error sending verification code:", err);
        alert("An error occurred while sending verification code. Please try again.");
      });   

  };

  //verify otp and change leadership
  const handleOtpSubmit = async() => {
    if (!otp) {
      alert("Enter verification code");
      return;
    }

    if(!email) {
      alert("Email is missing. Please restart the transfer process.");
      return;
    }

    await fetch(`http://localhost:8080/campus-connect/clubs/${clubId}/admin/details/handover`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
      body: JSON.stringify({ newAdminEmail:email, verificationCode: otp }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message.startsWith("You handover the leadership")) {
          alert("Ownership transferred successfully!");
          setOpenTransferDialog(false);
          setEmail("");
          setOtp("");
          setStep(1);
          navigate("/");
        } else {
          alert(data.message || "Failed to transfer ownership. Please try again.");
        }
      })
      .catch((err) => {
        console.error("Error transferring ownership:", err);
        alert("An error occurred while transferring ownership. Please try again.");
      }); 
  };

  //save changes
const handleSaveChanges = async () => {
  const formData = new FormData();

  // JSON object
  formData.append(
    "profile",
    new Blob([JSON.stringify({
      clubName: clubData.name,
      clubDescription: clubData.description,
      website: clubData.website,
    })], {
      type: "application/json",
    })
  );

  // image
  if (logoFile) {
    formData.append("image", logoFile);
  }
  else{
    formData.append("image", null);
  }

  try {
    const response = await fetch(
      `http://localhost:8080/campus-connect/clubs/${clubId}/admin/details`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) throw new Error(data.message);

    alert("Changes saved successfully!");
  } catch (err) {
    console.error(err);
    alert("Failed to save changes.");
  }
};

//delete club
const deleteClub = async () => {
  fetch(`http://localhost:8080/campus-connect/clubs/${clubId}/admin/details/delete`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.message === "Club deleted successfully") {
        alert("Club deleted successfully!");
        navigate("/");
        
      } else {
        alert(data.message || "Failed to delete club. Please try again.");
      }
    })
    .catch((err) => {
      console.error("Error deleting club:", err);
      alert("An error occurred while deleting the club. Please try again.");
    });
};  

//get profile details
const getDetails = async () => {
  try {
    const response = await fetch(
      `http://localhost:8080/campus-connect/clubs/${clubId}/admin/details`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) throw new Error(data.message);

    setClubData({
      name: data.clubName||"",
      description: data.clubDescription||"",
      website: data.website||"",
    });
    setLogoPreview(data.logoUrl);
  } catch (err) {
    console.error(err);
    alert("Failed to fetch club details.");
  }
};

useState(() => {
  getDetails();
}, []);

  return (
    <DashboardLayout navItems={updatenavItems()} title="Club Settings">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Club Settings</h1>
          <p className="text-muted-foreground">
            Manage your club profile and preferences
          </p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList>
            <TabsTrigger value="general">
              <Globe className="w-4 h-4 mr-2" />
              General
            </TabsTrigger>

            <TabsTrigger value="danger">
              <Trash2 className="w-4 h-4 mr-2" />
              Danger Zone
            </TabsTrigger>
          </TabsList>

          {/* GENERAL TAB */}

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Club Profile</CardTitle>
                <CardDescription>
                  Update your club's public information
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="w-24 h-24">
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Club Logo"
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                        {clubData.name.charAt(0)}
                      </AvatarFallback>
                    )}
                  </Avatar>

                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Logo
                    </Button>

                    <p className="text-sm text-muted-foreground mt-2">
                      Recommended: 200x200px, PNG or JPG
                    </p>
                  </div>
                </div>

                <div>
                  <div className="space-y-2">
                    <Label>Club Name</Label>
                    <Input value={clubData.name} onChange={(e)=>setClubData({...clubData, name:e.target.value})} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>

                  <Textarea
                    className="min-h-32"
                    value={clubData.description}
                    onChange={(e)=>setClubData({...clubData, description:e.target.value})}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-1">
                  <div className="space-y-1">
                    <Label>Website</Label>
                    <Input placeholder="https://..." value={clubData.website} onChange={(e)=>setClubData({...clubData, website:e.target.value})} />
                  </div>

                </div>

                <Button onClick={handleSaveChanges}>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* DANGER ZONE */}

          <TabsContent value="danger">
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>

                <CardDescription>
                  Irreversible actions for your club
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Transfer Ownership</p>

                    <p className="text-sm text-muted-foreground">
                      Transfer club to another admin
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => setOpenTransferDialog(true)}
                  >
                    Transfer
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border border-destructive/30 rounded-lg">
                  <div>
                    <p className="font-medium text-destructive">Delete Club</p>

                    <p className="text-sm text-muted-foreground">
                      Permanently delete this club
                    </p>
                  </div>

                  <Button variant="destructive" onClick={() => deleteClub()}>
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <Dialog open={openTransferDialog} onOpenChange={handleDialogChange}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Transfer Ownership</DialogTitle>
                <DialogDescription></DialogDescription>
              </DialogHeader>

              {step === 1 && (
                <div className="space-y-3">
                  <Label>Enter Your Email</Label>

                  <Input
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />

                  <Button onClick={handleEmailSubmit}>Submit</Button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-3">
                  <Label>Enter Verification Code</Label>

                  <Input
                    type="text"
                    placeholder="Enter verification code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />

                  <Label className="text-sm text-muted-foreground">
                    Enter new Admin Email </Label>

                    <Input
                    type="email"
                    placeholder="Enter new admin email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />

                  <Button onClick={handleOtpSubmit}>Verify Verification Code</Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ClubSettingsPage;
