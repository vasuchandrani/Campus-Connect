import { useState,useEffect } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/Tabs";
import { Textarea } from "../../components/ui/Textarea";
import { Label } from "../../components/ui/Label";
import { Clock, CheckCircle, Eye, Star, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/Dialog";
import { reviewerNavItems } from "../../config/Navigation";
import { toast } from "../../hooks/use-toast";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const navItems = reviewerNavItems;

/* ---------------- MOCK DATA ---------------- */


const ReviewerDashboard = () => {

  //state variables
  const [user, setUser] = useState({
    
  });

  const nevigate = useNavigate();
  
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [reviewedPapers, setReviewedPapers] = useState([]);
  const [stats, setStats] = useState({
    pending: 0,
    reviewed: 0,
  });

  const [pendingPapers,setPendingPapers] = useState([]);

  const [requesting,setRequesting] = useState(false);

  const baseUrl = `${import.meta.env.VITE_BACKEND_URL}/campus-connect/reviewer`;

        const { routeProtection } = useAuth();
    
      useEffect(() => {
        if (!routeProtection("REVIEWER")) {
          nevigate("/auth");
        }
      },[]);

  //fetch stats for dashboard
  const fetchStats = () => {
      fetch(`${baseUrl}/stats`,{
        method:"GET",
        headers:{
          "Content-Type":"application/json",
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
        },
      })
      .then(res => res.json())
      .then(data => {
        setStats({
          pending: data.pendingReviews,
          reviewed: data.reviewed,
        });
      })
      .catch(err => {
        console.error("Error fetching stats:", err);
      });
  };

  //fetch user details
  const fetchUserDetails = () => {
    fetch(`${baseUrl}/reviewer-detail`,{
      method:"GET",
      headers:{
        "Content-Type":"application/json",
        "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
      },
    })
    .then(res => res.json())
    .then(data => {
      setUser({
        name: data.reviewerName,
        college: data.collegeName,
      });
    })
    .catch(err => {
      console.error("Error fetching user details:", err);
    });
  };
  
  //fetch pending papers for review
  const fetchPendingPapers = () => {
    fetch(`${baseUrl}/pending`,{
      method:"GET",
      headers:{
        "Content-Type":"application/json",
        "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
      },
    })
    .then(res => res.json())
    .then(data => {
      setPendingPapers(data);
    })
    .catch(err => {
      console.error("Error fetching pending papers:", err);
    });
  };

//fetch reviewed papers
  const fetchReviewedPapers = () => {
    fetch(`${baseUrl}/reviewed`,{
      method:"GET",
      headers:{
        "Content-Type":"application/json",
        "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
      },
    })
    .then(res => res.json())
    .then(data => {
      setReviewedPapers(data);
    })
    .catch(err => {
      console.error("Error fetching reviewed papers:", err);
    });
  };

  useEffect(() => {
    fetchStats();
    fetchPendingPapers();
    fetchReviewedPapers();
    fetchUserDetails();
  }, []);


  //download research paper PDF
  const downloadPdf = async (url, title) => {
  try {
    const token = localStorage.getItem("authToken");

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const blob = await response.blob();

    const downloadUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `${title}.pdf`; // force pdf name
    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error("Download failed:", error);
  }
};

  const handleApprove = async(paperId) => {
    setRequesting(true);
    if (!feedback.trim()) {
      toast({
        title: "Please provide feedback",
        description: "Feedback is required before approving a paper.",
        variant: "destructive",
      });
      return;
    }

    await fetch(`${baseUrl}/pending/${paperId}/accept`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
      },
      body: JSON.stringify({
        feedback
      }),
    })
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        if(data.message ==="Research-Paper has been accepted & published") {
        fetchStats();
        fetchPendingPapers();
        fetchReviewedPapers();
        toast({
          title: "Paper approved successfully",
          description: "The paper has been approved.",
          variant: "success",
        });
        }
        else{
          toast({
            title: "Failed to approve paper",
            description: data.message || "An error occurred while approving the paper.",
            variant: "destructive",
          });
        }
      })
      .catch((err) => {
        toast({
          title: "Failed to submit review",
          description: err.message||"An error occurred while submitting your review.",
          variant: "destructive",
        });
      }).finally(() => {
        setRequesting(false);
      });
    setSelectedPaper(null);
    setFeedback("");
  };

  const handleReject = async (paperId) => {
    if (!feedback.trim()) {
      toast({
        title: "Please provide feedback",
        description: "Feedback is required before rejecting a paper.",
        variant: "destructive",
      });

      return;
    }
    setRequesting(false);
    await fetch(`${baseUrl}/pending/${paperId}/reject`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
      },
      body: JSON.stringify({
        feedback
      }),
    })
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        if(data.message ==="Research-Paper has been rejected") {
        fetchStats();
        fetchPendingPapers();
        fetchReviewedPapers();
        toast({
          title: "Paper rejected successfully",
          description: "The paper has been rejected.",
          variant: "success",
        });
      }
      else{
        toast({
          title: "Failed to reject paper",
          description: data.message || "An error occurred while rejecting the paper.",
          variant: "destructive",
        })
      }
    })
      .catch((err) => {
        toast({
          title: "Failed to submit review",
          description: err.message||"An error occurred while submitting your review.",
          variant: "destructive",
        });
      }).finally(() => {
        setRequesting(false);
      });
      
    setSelectedPaper(null);
    setFeedback("");
  };

  return (
    <DashboardLayout navItems={navItems} title="Reviewer Dashboard">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/5 rounded-2xl p-6 border border-primary/20">
          <h2 className="text-2xl font-bold mb-1">Welcome, {user?.name}!</h2>
          <p className="text-muted-foreground">
            Review and evaluate research paper submissions for {user?.college}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
          {/* Pending Reviews */}
          <Card className="border-border/50 pt-4">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-500" />
                </div>

                <div>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                  <p className="text-xs text-muted-foreground">
                    Pending Reviews
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reviewed */}
          <Card className="border-border/50 pt-4">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-primary" />
                </div>

                <div>
                  <p className="text-2xl font-bold">{stats.reviewed}</p>
                  <p className="text-xs text-muted-foreground">Reviewed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">
              Pending Reviews ({stats.pending})
            </TabsTrigger>
            <TabsTrigger value="reviewed">
              Reviewed ({stats.reviewed})
            </TabsTrigger>
          </TabsList>

          {/* Pending Papers */}
          <TabsContent value="pending" className="space-y-4">
            {pendingPapers.map((paper) => (
              <Card key={paper.id} className="border-border/50 pt-4">
                <CardContent className="p-6 flex justify-between">
                  <div className="flex gap-4">
                   
                    <div>
                      <h3 className="font-semibold text-lg">{paper.title}</h3>

                     

                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {paper.overview.length > 100
                          ? paper.overview.substring(0, 100) + "..."
                          : paper.overview}
                      </p>

                       <p className="text-sm text-muted-foreground">
                        by {paper.studentName} • {paper.department}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                        <Button
                          variant="outline"
                          disabled={requesting}
                          onClick={() => setSelectedPaper(paper)}
                        >
                          View Details
                        </Button>

                        <Button disabled={requesting} onClick={() => downloadPdf(paper.pdfUrl,paper.title)}>
                          <Download className="w-4 h-4 mr-2" />
                          Download PDF
                        </Button>
                      </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Reviewed */}
          <TabsContent value="reviewed" className="space-y-4">
            {reviewedPapers.map((reviewed) => {
            
              return (
                <Card key={reviewed.id}>
                  <CardContent className="p-6 flex justify-between items-center pt-4">
                    <div>
                      <h3 className="font-semibold">{reviewed.title}</h3>

                      <p className="text-sm text-muted-foreground">
                        by {reviewed.studentName}
                      </p>
                    </div>

                    <Badge >
                      {reviewed.status}
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>
          <Dialog
            open={!!selectedPaper}
            onOpenChange={() => setSelectedPaper(null)}
          >
            <DialogContent className="max-w-3xl">
              {selectedPaper && (
                <>
                  <DialogHeader>
                    <DialogTitle>{selectedPaper.title}</DialogTitle>
                    <DialogDescription>
                      by {selectedPaper.studentName} • {selectedPaper.department}
                    </DialogDescription>
                  </DialogHeader>

                  <div>
                      <h4 className="font-semibold">Subject</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedPaper.subject}
                      </p>
                    </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold">Abstract</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedPaper.overview}
                      </p>
                    </div>

                    

                    

                    <div>
                      <Label>Your Feedback</Label>

                      <Textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        rows={4}
                      />
                    </div>

                    <div className="flex gap-2 justify-end">
                      <Button
                      disabled={requesting}
                        variant="destructive"
                        onClick={() => handleReject(selectedPaper.id)}
                      >
                        Reject
                      </Button>

                      <Button disabled={requesting} onClick={() => handleApprove(selectedPaper.id)}>
                        Approve
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ReviewerDashboard;
