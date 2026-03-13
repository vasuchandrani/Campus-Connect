import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/Tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../components/ui/Dialog";

import {
  Shield,
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  LogOut,
  Eye,
  Mail,
  Globe,
  MapPin,
  CreditCard,
  Calendar,
  AlertCircle,
} from "lucide-react";

import { useToast } from "../../hooks/use-toast";

const AdminDashboard = () => {

  const navigate = useNavigate();
  const { toast } = useToast();

  /* ---------------- MOCK DATA ---------------- */

  const mockCollegeVerificationRequests = [
    {
      id: "1",
      collegeName: "DDU - Dharmsinh Desai University",
      adminName: "Ronak Gondaliya",
      adminEmail: "admin@ddu.ac.in",
      collegeDomain: "ddu.ac.in",
      collegeWebsite: "https://www.ddu.ac.in",
      collegeAddress: "Nadiad, Gujarat",
      subscriptionPlan: "Premium",
      paymentStatus: "completed",
      paymentAmount: 9999,
      paymentDate: "2026-03-10",
      submittedAt: "2026-03-08",
      status: "pending",
    },
    {
      id: "2",
      collegeName: "IIT Bombay",
      adminName: "Amit Sharma",
      adminEmail: "admin@iitb.ac.in",
      collegeDomain: "iitb.ac.in",
      collegeWebsite: "https://www.iitb.ac.in",
      collegeAddress: "Mumbai, Maharashtra",
      subscriptionPlan: "Enterprise",
      paymentStatus: "completed",
      paymentAmount: 20000,
      paymentDate: "2026-03-01",
      submittedAt: "2026-02-28",
      status: "verified",
    },
    {
      id: "3",
      collegeName: "NIT Surat",
      adminName: "Rahul Patel",
      adminEmail: "admin@nitsurat.ac.in",
      collegeDomain: "nitsurat.ac.in",
      collegeWebsite: "https://www.nitsurat.ac.in",
      collegeAddress: "Surat, Gujarat",
      subscriptionPlan: "Basic",
      paymentStatus: "pending",
      paymentAmount: 4999,
      submittedAt: "2026-03-05",
      status: "payment_pending",
    },
    {
      id: "4",
      collegeName: "DAIICT",
      adminName: "Neha Shah",
      adminEmail: "admin@daiict.ac.in",
      collegeDomain: "daiict.ac.in",
      collegeWebsite: "https://www.daiict.ac.in",
      collegeAddress: "Gandhinagar",
      subscriptionPlan: "Premium",
      paymentStatus: "completed",
      paymentAmount: 9999,
      submittedAt: "2026-03-02",
      status: "rejected",
    },
  ];

  const [requests, setRequests] = useState(mockCollegeVerificationRequests);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  /* ---------------- STATS ---------------- */

  const stats = {
    total: requests.length,
    verified: requests.filter((r) => r.status === "verified").length,
    pending: requests.filter((r) => r.status === "pending").length,
    paymentPending: requests.filter((r) => r.status === "payment_pending").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
  };

  /* ---------------- ACTIONS ---------------- */

  const handleLogout = () => {
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully.",
    });

    navigate("/admin/login");
  };

  const handleVerify = (id) => {

    setRequests(
      requests.map((r) =>
        r.id === id
          ? {
              ...r,
              status: "verified",
              verifiedAt: new Date().toISOString().split("T")[0],
            }
          : r
      )
    );

    toast({
      title: "College Verified",
      description: "Verification email will be sent to the college admin.",
    });

    setDetailsOpen(false);
  };

  const handleReject = (id) => {

    setRequests(
      requests.map((r) =>
        r.id === id ? { ...r, status: "rejected" } : r
      )
    );

    toast({
      title: "College Rejected",
      description: "The college registration has been rejected.",
      variant: "destructive",
    });

    setDetailsOpen(false);
  };

  const filteredRequests = requests.filter(
    (r) =>
      r.collegeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.adminEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status) => {

    switch (status) {

      case "verified":
        return (
          <Badge className="bg-green-500/10 text-green-600 border-0">
            <CheckCircle className="w-3 h-3 mr-1" />
            Verified
          </Badge>
        );

      case "pending":
        return (
          <Badge className="bg-yellow-500/10 text-yellow-600 border-0">
            <Clock className="w-3 h-3 mr-1" />
            Pending Review
          </Badge>
        );

      case "payment_pending":
        return (
          <Badge className="bg-orange-500/10 text-orange-600 border-0">
            <CreditCard className="w-3 h-3 mr-1" />
            Payment Pending
          </Badge>
        );

      case "rejected":
        return (
          <Badge className="bg-red-500/10 text-red-600 border-0">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );

      default:
        return null;
    }
  };

  const viewDetails = (request) => {
    setSelectedRequest(request);
    setDetailsOpen(true);
  };

  return (

    <div className="min-h-screen w-full bg-background">

      {/* HEADER */}

      <header className="border-b bg-background/100 backdrop-blur">

        <div className="container flex items-center justify-between h-16 mx-auto">

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>

            <div>
              <h1 className="font-bold">CampusConnect Admin</h1>
              <p className="text-xs text-muted-foreground">
                Administrative Dashboard
              </p>
            </div>

          </div>

          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>

        </div>

      </header>

      {/* MAIN */}

      <main className="w-full max-w-7xl mx-auto px-6 py-6 space-y-6">

        {/* STATS */}

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">

          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Building2 className="w-5 h-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Colleges</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.verified}</p>
                <p className="text-xs text-muted-foreground">Verified</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Clock className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{stats.paymentPending}</p>
                <p className="text-xs text-muted-foreground">Payment Pending</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <XCircle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{stats.rejected}</p>
                <p className="text-xs text-muted-foreground">Rejected</p>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* REQUEST LIST WITH TABS */}

        <Card>

          <CardHeader>

            <div className="flex justify-between items-center">

              <CardTitle>College Verification Requests</CardTitle>

              <div className="relative w-64">

                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

                <Input
                  placeholder="Search colleges..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />

              </div>

            </div>

          </CardHeader>

          <CardContent>

            <Tabs defaultValue="pending">

              <TabsList className="mb-4">

                <TabsTrigger value="pending">
                  Pending ({stats.pending})
                </TabsTrigger>

                <TabsTrigger value="verified">
                  Verified ({stats.verified})
                </TabsTrigger>

                <TabsTrigger value="all">All</TabsTrigger>

              </TabsList>

              {["pending", "verified", "all"].map((tab) => (

                <TabsContent key={tab} value={tab}>

                  <div className="space-y-3">

                    {filteredRequests
                      .filter((r) => tab === "all" || r.status === tab)
                      .map((request) => (

                        <Card key={request.id}>

                          <CardContent className="p-4 flex justify-between items-center">

                            <div>

                              <h4 className="font-semibold">
                                {request.collegeName}
                              </h4>

                              <p className="text-sm text-muted-foreground">
                                {request.adminEmail}
                              </p>

                              <div className="mt-1">
                                {getStatusBadge(request.status)}
                              </div>

                            </div>

                            <div className="flex gap-2">

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => viewDetails(request)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </Button>

                              {request.status === "pending" && (
                                <>
                                  <Button size="sm" onClick={() => handleVerify(request.id)}>
                                    Verify
                                  </Button>
                                  <Button variant="destructive" size="sm" onClick={() => handleReject(request.id)}>
                                    Reject
                                  </Button>
                                </>
                              )}

                            </div>

                          </CardContent>

                        </Card>

                      ))}

                    {filteredRequests.filter((r) => tab === "all" || r.status === tab).length === 0 && (

                      <div className="text-center py-8 text-muted-foreground">

                        <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />

                        <p>No requests found</p>

                      </div>

                    )}

                  </div>

                </TabsContent>

              ))}

            </Tabs>

          </CardContent>

        </Card>

      </main>

    </div>
  );
};

export default AdminDashboard;