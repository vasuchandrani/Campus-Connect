import "./AdminSettingsPage.css";
import { useState, useEffect } from "react";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import { collegeAdminNavItems } from "../../../config/Navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Textarea } from "../../../components/ui/Textarea";
import { Label } from "../../../components/ui/Label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/Tabs";
import { Badge } from "../../../components/ui/Badge";
import {
  Globe,
  CreditCard,
  Shield,
  Check,
  Building2,
  Lock,
  Download,
  CheckCircle2,
  AlertCircle,
  FileText,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "../../../hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../../components/ui/Dialog";
import { collegeAdminApi, securityApi, publicApi, departmentApi } from "../../../services/api";

export default function AdminSettingsPage() {
  const [profile, setProfile] = useState({
    adminName: "",
    adminEmail: "",
    adminPhone: "",
    institutionName: "",
    institutionDomain: "",
    website: "",
    description: "",
    address: "",
  });

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [requesting, setRequesting] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);

  const navigate = useNavigate();
  const { routeProtection } = useAuth();

  useEffect(() => {
    if (!routeProtection("COLLEGE_ADMIN")) {
      navigate("/auth");
    }
  }, [navigate, routeProtection]);

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const rawPlans = import.meta.env.VITE_SUBSCRIPTION_PLANS || "[]";

  const getSubscriptionPlans = () => {
    try {
      return JSON.parse(rawPlans);
    } catch {
      return [];
    }
  };

  const subscriptionPlans = getSubscriptionPlans();

  const getSubscription = async () => {
    try {
      const data = await collegeAdminApi.getSubscription();
      setSubscription(data);
    } catch (error) {
      console.error("Error fetching subscription:", error);
    }
  };

  const getInvoices = async () => {
    try {
      const data = await collegeAdminApi.getSubscriptionHistory();
      setInvoices(Array.isArray(data) ? data : []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load invoices.",
        variant: "destructive",
      });
    }
  };

  const handleViewInvoices = async () => {
    setRequesting(true);
    await getInvoices();
    setInvoiceOpen(true);
    setRequesting(false);
  };

  const saveProfile = async () => {
    if (!profile.adminName.trim()) {
      toast({
        title: "Admin Name Required",
        description: "Please enter the administrative officer's name.",
        variant: "destructive",
      });
      return;
    }
    if (!profile.adminEmail.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter a valid admin email.",
        variant: "destructive",
      });
      return;
    }
    if (!profile.institutionName.trim()) {
      toast({
        title: "Institution Name Required",
        description: "Please provide the official institution name.",
        variant: "destructive",
      });
      return;
    }
    if (!profile.institutionDomain.trim()) {
      toast({
        title: "Domain Required",
        description: "Institution domain cannot be empty.",
        variant: "destructive",
      });
      return;
    }
    if (!profile.address.trim()) {
      toast({
        title: "Address Required",
        description: "Campus address cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    try {
      const payload = {
        fullName: profile.adminName,
        email: profile.adminEmail,
        phoneNumber: profile.adminPhone,
        collegeName: profile.institutionName,
        domain: profile.institutionDomain,
        website: profile.website,
        collegeDescription: profile.description,
        collegeAddress: profile.address,
      };
      setRequesting(true);
      const data = await collegeAdminApi.updateProfile(payload);

      if (data.message === "Your profile has been updated successfully!") {
        toast({
          title: "Profile Saved",
          description: data.message,
          variant: "success",
        });
      } else {
        toast({
          title: "Update Notice",
          description: data.message || "Profile updated successfully.",
          variant: "default",
        });
      }
    } catch (error) {
      toast({
        title: "Update Failed",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setRequesting(false);
    }
  };

  const getProfile = async () => {
    try {
      const data = await collegeAdminApi.getProfile();
      setProfile({
        adminName: data.fullName || "",
        adminEmail: data.email || "",
        adminPhone: data.phoneNumber || "",
        institutionName: data.collegeName || "",
        institutionDomain: data.domain || "",
        website: data.website || "",
        description: data.collegeDescription || "",
        address: data.collegeAddress || "",
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const [departments, setDepartments] = useState([]);
  const [newDeptName, setNewDeptName] = useState("");
  const [newDeptCode, setNewDeptCode] = useState("");
  const [deptSaving, setDeptSaving] = useState(false);

  const loadDepartments = async () => {
    try {
      const data = await departmentApi.getMyCollegeDepartments();
      setDepartments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const handleCreateDepartment = async (e) => {
    e?.preventDefault?.();
    if (!newDeptName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a department name.",
        variant: "destructive",
      });
      return;
    }
    setDeptSaving(true);
    try {
      await departmentApi.create({
        name: newDeptName.trim(),
        code: newDeptCode.trim() || undefined,
      });
      toast({
        title: "Department Created",
        description: `Department "${newDeptName.trim()}" has been successfully added.`,
      });
      setNewDeptName("");
      setNewDeptCode("");
      loadDepartments();
    } catch (err) {
      toast({
        title: "Failed to Add Department",
        description: err.message || "An error occurred while creating department.",
        variant: "destructive",
      });
    } finally {
      setDeptSaving(false);
    }
  };

  const handleDeleteDepartment = async (dept) => {
    if (dept.name?.toLowerCase() === "general") {
      toast({
        title: "Protected Department",
        description: "The 'General' department is mandatory and cannot be deleted.",
        variant: "destructive",
      });
      return;
    }
    if (!window.confirm(`Are you sure you want to delete "${dept.name}"?`)) {
      return;
    }
    try {
      await departmentApi.delete(dept.id);
      toast({
        title: "Department Removed",
        description: `Department "${dept.name}" has been deleted.`,
      });
      loadDepartments();
    } catch (err) {
      toast({
        title: "Delete Failed",
        description: err.message || "Could not delete department.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      setPageLoading(true);
      try {
        await Promise.all([getProfile(), getSubscription(), loadDepartments()]);
      } catch (err) {
        console.error("Error loading settings:", err);
      } finally {
        setPageLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const downloadPdf = async (url, title) => {
    try {
      const blob = await publicApi.downloadBlob(url);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `${title}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const changePassword = async () => {
    if (newPassword.length < 6 || newPassword.trim() === "") {
      toast({
        title: "Password Too Short",
        description: "New password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({
        title: "Mismatch",
        description: "New password and confirmation do not match.",
        variant: "destructive",
      });
      return;
    }
    setRequesting(true);
    try {
      const res = await securityApi.changePassword({
        oldPassword: currentPassword,
        newPassword,
        role: "COLLEGE_ADMIN",
      });
      if (res.message === "Your password changed successfully!") {
        toast({
          title: "Password Changed",
          description: res.message,
          variant: "success",
        });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast({
          title: "Password Update Notice",
          description: res.message || "Password updated.",
          variant: "default",
        });
      }
    } catch (err) {
      toast({
        title: "Update Failed",
        description: err.message || "Could not update password.",
        variant: "destructive",
      });
    } finally {
      setRequesting(false);
    }
  };

  const handlePlanConfirm = async () => {
    if (!selectedPlan) return;
    const plan = subscriptionPlans.find((p) => p.id === selectedPlan);
    try {
      const orderData = await collegeAdminApi.createOrder({
        amount: plan.amount,
        currency: "INR",
      });

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.orderId,
        name: "Campus Connect",
        description: `${plan.name} Subscription`,
        handler: function (response) {
          updatePackage({
            planName: plan.name,
            amount: plan.amount,
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
          });
        },
        theme: {
          color: "#10b981",
        },
      };

      const razor = new window.Razorpay(options);
      razor.open();
    } catch (err) {
      console.error(err);
    }
  };

  const updatePackage = (data) => {
    toast({
      title: "Payment Received",
      description: "Subscription renewed for: " + data.planName,
      variant: "success",
    });
    getSubscription();
  };

  // Tailored Settings Skeleton
  if (pageLoading) {
    return (
      <DashboardLayout navItems={collegeAdminNavItems} title="Settings">
        <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
          <div className="space-y-2">
            <div className="h-6 w-44 bg-muted rounded" />
            <div className="h-3.5 w-64 bg-muted/60 rounded" />
          </div>
          <div className="flex gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-9 w-28 bg-muted rounded-xl" />
            ))}
          </div>
          <div className="rounded-2xl border border-border/60 bg-card/60 p-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="h-3.5 w-24 bg-muted rounded" />
                  <div className="h-9 w-full bg-muted rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={collegeAdminNavItems} title="Settings">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Institution Settings
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Configure campus profile, subscription billing, and administrative security.
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <div className="w-full">
            <TabsList className="w-full grid grid-cols-2 sm:grid-cols-4 sm:inline-flex sm:w-auto p-1 bg-muted/60 border border-border/60 rounded-xl gap-1">
              <TabsTrigger
                value="profile"
                className="text-xs sm:text-sm py-2 px-2.5 rounded-lg justify-center font-medium"
              >
                <Globe className="w-3.5 h-3.5 mr-1.5 shrink-0 hidden xs:inline-block sm:inline-block" />
                Profile
              </TabsTrigger>
              <TabsTrigger
                value="departments"
                className="text-xs sm:text-sm py-2 px-2.5 rounded-lg justify-center font-medium"
              >
                <Building2 className="w-3.5 h-3.5 mr-1.5 shrink-0 hidden xs:inline-block sm:inline-block" />
                Departments
              </TabsTrigger>
              <TabsTrigger
                value="subscription"
                className="text-xs sm:text-sm py-2 px-2.5 rounded-lg justify-center font-medium"
              >
                <CreditCard className="w-3.5 h-3.5 mr-1.5 shrink-0 hidden xs:inline-block sm:inline-block" />
                Subscription
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="text-xs sm:text-sm py-2 px-2.5 rounded-lg justify-center font-medium"
              >
                <Shield className="w-3.5 h-3.5 mr-1.5 shrink-0 hidden xs:inline-block sm:inline-block" />
                Security
              </TabsTrigger>
            </TabsList>
          </div>

          {/* TAB 1: PROFILE */}
          <TabsContent value="profile">
            <Card className="border-border/70 bg-card/70 backdrop-blur-xs">
              <CardHeader className="p-4 sm:p-6 pb-3">
                <CardTitle className="text-base sm:text-lg font-bold text-foreground">
                  Institution Public Profile
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Information displayed across student feeds and inter-college directories.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-4 sm:p-6 pt-2 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Admin Officer Name</Label>
                    <Input
                      name="adminName"
                      className="text-xs sm:text-sm h-9"
                      value={profile.adminName}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Admin Email</Label>
                    <Input
                      name="adminEmail"
                      className="text-xs sm:text-sm h-9"
                      value={profile.adminEmail}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Admin Phone Number</Label>
                    <Input
                      name="adminPhone"
                      className="text-xs sm:text-sm h-9"
                      value={profile.adminPhone}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Institution Domain</Label>
                    <Input
                      name="institutionDomain"
                      className="text-xs sm:text-sm h-9"
                      value={profile.institutionDomain}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Institution Name</Label>
                    <Input
                      name="institutionName"
                      className="text-xs sm:text-sm h-9"
                      value={profile.institutionName}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Official Website</Label>
                    <Input
                      name="website"
                      className="text-xs sm:text-sm h-9"
                      value={profile.website}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Institution Overview</Label>
                  <Textarea
                    name="description"
                    className="min-h-20 text-xs sm:text-sm"
                    value={profile.description}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Campus Address</Label>
                  <Input
                    name="address"
                    className="text-xs sm:text-sm h-9"
                    value={profile.address}
                    onChange={handleChange}
                  />
                </div>

                <div className="pt-2">
                  <Button
                    onClick={saveProfile}
                    disabled={requesting}
                    className="text-xs sm:text-sm h-9 w-full sm:w-auto shadow-xs"
                  >
                    {requesting ? "Saving Changes..." : "Save Profile Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: DEPARTMENTS */}
          <TabsContent value="departments" className="space-y-5">
            <Card className="border-border/70 bg-card/70 backdrop-blur-xs">
              <CardHeader className="p-4 sm:p-6 pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-primary" />
                      Academic Departments
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm mt-0.5">
                      Configure and manage academic departments established at your institution.
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="w-fit text-xs font-semibold px-2.5 py-0.5">
                    {departments.length} Active {departments.length === 1 ? "Department" : "Departments"}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-4 sm:p-6 pt-2 space-y-5">
                {/* Add Department Form */}
                <form onSubmit={handleCreateDepartment} className="p-3.5 rounded-xl border border-border/80 bg-muted/20 space-y-3">
                  <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-primary" />
                    Add New Department
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1 sm:col-span-2">
                      <Label className="text-xs font-semibold">Department Name *</Label>
                      <Input
                        placeholder="e.g. Electrical & Electronics Engineering"
                        value={newDeptName}
                        onChange={(e) => setNewDeptName(e.target.value)}
                        className="text-xs sm:text-sm h-9"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Short Code (Optional)</Label>
                      <Input
                        placeholder="e.g. EEE"
                        value={newDeptCode}
                        onChange={(e) => setNewDeptCode(e.target.value.toUpperCase())}
                        className="text-xs sm:text-sm h-9 uppercase"
                        maxLength={20}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-1">
                    <Button
                      type="submit"
                      disabled={deptSaving || !newDeptName.trim()}
                      size="sm"
                      className="text-xs font-semibold h-8.5 px-3.5"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      {deptSaving ? "Adding..." : "Add Department"}
                    </Button>
                  </div>
                </form>

                {/* Departments Grid / List */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-muted-foreground">
                    Configured Departments:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {departments.map((dept) => {
                      const isGeneral = dept.name?.toLowerCase() === "general";
                      return (
                        <div
                          key={dept.id || dept.name}
                          className="flex items-center justify-between p-3 rounded-xl border border-border/70 bg-card hover:border-primary/40 transition-all group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                              {dept.code ? dept.code.slice(0, 3) : dept.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-xs sm:text-sm text-foreground truncate flex items-center gap-1.5">
                                <span className="truncate">{dept.name}</span>
                                {isGeneral && (
                                  <Badge variant="secondary" className="text-[9px] uppercase px-1.5 py-0 font-bold bg-primary/15 text-primary">
                                    Default
                                  </Badge>
                                )}
                              </div>
                              <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                                <span>Code: {dept.code || "N/A"}</span>
                              </div>
                            </div>
                          </div>

                          <div>
                            {isGeneral ? (
                              <span className="text-muted-foreground/50 p-1.5 inline-flex" title="Default department cannot be deleted">
                                <Lock className="w-3.5 h-3.5" />
                              </span>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteDepartment(dept)}
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                                title="Delete department"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: SUBSCRIPTION */}
          <TabsContent value="subscription">
            <Card className="border-border/70 bg-card/70 backdrop-blur-xs">
              <CardHeader className="p-4 sm:p-6 pb-3">
                <CardTitle className="text-base sm:text-lg font-bold text-foreground">
                  Subscription & Billing
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Active tier license and verified invoice receipts.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-4 sm:p-6 pt-2 space-y-4">
                <div className="p-4 rounded-xl border border-border/70 bg-primary/5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {subscription?.planName ? (
                      <>
                        <div>
                          <h3 className="text-base sm:text-lg font-bold text-foreground">
                            {subscription.planName}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Active until{" "}
                            {new Date(
                              subscription.endDate
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className="bg-primary/10 text-primary border-primary/20 text-xs self-start sm:self-auto">
                          Active License
                        </Badge>
                      </>
                    ) : (
                      <>
                        <div>
                          <h3 className="text-base sm:text-lg font-bold text-destructive">
                            Plan Expired
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Subscription has ended. Renew license to unlock full features.
                          </p>
                        </div>
                        <Badge
                          variant="destructive"
                          className="text-xs self-start sm:self-auto"
                        >
                          Expired
                        </Badge>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-9 border-border/80"
                    disabled={requesting}
                    onClick={handleViewInvoices}
                  >
                    <FileText className="w-3.5 h-3.5 mr-1.5" />
                    View Invoices
                  </Button>

                  {subscription?.planName == null && (
                    <Button
                      size="sm"
                      className="text-xs h-9 shadow-xs"
                      disabled={requesting}
                      onClick={() => setPlanDialogOpen(true)}
                    >
                      Upgrade Plan
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: SECURITY */}
          <TabsContent value="security">
            <Card className="border-border/70 bg-card/70 backdrop-blur-xs">
              <CardHeader className="p-4 sm:p-6 pb-3">
                <CardTitle className="text-base sm:text-lg font-bold text-foreground">
                  Security & Access Credentials
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Update administrative password for this college command account.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-4 sm:p-6 pt-2 space-y-4">
                <div className="space-y-3 max-w-md">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Current Password</Label>
                    <Input
                      type="password"
                      className="text-xs sm:text-sm h-9"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">New Password</Label>
                    <Input
                      type="password"
                      className="text-xs sm:text-sm h-9"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Confirm New Password</Label>
                    <Input
                      type="password"
                      className="text-xs sm:text-sm h-9"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    onClick={changePassword}
                    disabled={requesting}
                    className="text-xs sm:text-sm h-9 w-full sm:w-auto shadow-xs"
                  >
                    {requesting ? "Updating..." : "Update Security Password"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* MODAL: INVOICE HISTORY */}
        <Dialog open={invoiceOpen} onOpenChange={setInvoiceOpen}>
          <DialogContent className="w-[95vw] sm:max-w-xl max-h-[85vh] overflow-y-auto rounded-2xl p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <span>Invoice Billing History</span>
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                Download verified tax receipts and payment summaries.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2">
              {invoices.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">
                  No billing history found.
                </p>
              ) : (
                invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="p-3.5 rounded-xl border border-border/70 bg-card/70 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-xs sm:text-sm text-foreground">
                          Invoice #{invoice.id}
                        </p>
                        {new Date(invoice.endDate) > new Date() && (
                          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] py-0">
                            Active
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {invoice.startDate?.split("T")[0]} • ₹{invoice.amount}
                      </p>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-8"
                      onClick={() =>
                        downloadPdf(
                          invoice.invoiceUrl,
                          `CampusConnect_Invoice_${invoice.startDate?.split("T")[0]}`
                        )
                      }
                    >
                      <Download className="w-3.5 h-3.5 mr-1" />
                      Download
                    </Button>
                  </div>
                ))
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-9 w-full sm:w-auto"
                onClick={() => setInvoiceOpen(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* MODAL: UPGRADE PLAN */}
        <Dialog open={planDialogOpen} onOpenChange={setPlanDialogOpen}>
          <DialogContent className="w-[95vw] sm:max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg font-bold">
                Select Subscription Tier
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                Choose the right license package for your academic institution.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 py-3">
              {subscriptionPlans.map((plan) => {
                const isSelected = selectedPlan === plan.id;
                return (
                  <Card
                    key={plan.id}
                    className={`cursor-pointer border-border/70 hover:border-primary/50 transition-all ${
                      isSelected
                        ? "border-primary ring-2 ring-primary bg-primary/5"
                        : "bg-card/70"
                    }`}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm sm:text-base font-bold text-foreground">
                        {plan.name}
                      </CardTitle>
                      <CardDescription className="text-xs font-semibold text-primary">
                        {plan.price}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="p-4 pt-1 space-y-2">
                      {plan.features?.map((f, i) => (
                        <div
                          key={i}
                          className="flex items-start text-xs text-muted-foreground gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="leading-snug">{f}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0 pt-2 border-t border-border/50">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-9"
                onClick={() => setPlanDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="text-xs h-9 shadow-xs"
                disabled={!selectedPlan}
                onClick={handlePlanConfirm}
              >
                Proceed to Checkout
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
