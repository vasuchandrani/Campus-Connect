import { useEffect, useState } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/Tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../components/ui/Dialog";

import {
  Search,
  Eye,
  Clock,
  CheckCircle,
  Download,
  UserCheck,
} from "lucide-react";
import { collegeAdminNavItems } from "../../config/Navigation";

/* ---------------- MOCK DATA ---------------- */


const AdminResearchPage = () => {
  //baseUrl
  const baseUrl= "http://localhost:8080/campus-connect/college-admin";

  //state variables
  const [reviewers, setReviewers] = useState([]);
  const [viewPaper, setViewPaper] = useState(null);
  const [assignPaper, setAssignPaper] = useState(null);
  const [selectedReviewer, setSelectedReviewer] = useState(null);
  const [newReviewerEmail, setNewReviewerEmail] = useState("");
  const [underReviewPapers, setUnderReviewPapers] = useState([]);
  const [publishedPapers, setPublishedPapers] = useState([]);
  const [notReviewedPapers, setNotReviewedPapers] = useState([]);
  const [query, setQuery] = useState("");

  
  //handel assign reviewer
  const handleAssign = () => {
  if (!selectedReviewer || !assignPaper) return;

  assignReviewer(assignPaper.id, selectedReviewer);

  setAssignPaper(null);
  setSelectedReviewer(null);
  setNewReviewerEmail("");
};

//for searching papers by title
  const filterUnderReviewPapers = underReviewPapers.filter((paper) =>
    paper.title.toLowerCase().includes(query.toLowerCase()) 
  );

  const filterNotReviewedPapers = notReviewedPapers.filter((paper) =>
    paper.title.toLowerCase().includes(query.toLowerCase()) 
  );

  const filterPublishedPapers = publishedPapers.filter((paper) =>
    paper.title.toLowerCase().includes(query.toLowerCase()) 
  );

  //get papers which reviewer assign
  const getUnderReviewPapers = () => {
    const token = localStorage.getItem("authToken");
    fetch(`${baseUrl}/researches/under-reviewed`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setUnderReviewPapers(data);
      })
      .catch((err) => {
        console.error("Error fetching under review papers:", err);
      });
  }

  //all papers which not reviewer assign
  const fetchNotReviewedPapers = () => {
    const token = localStorage.getItem("authToken");
    fetch(`${baseUrl}/researches/not-reviewed`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setNotReviewedPapers(data);
      })
      .catch((err) => {
        console.error("Error fetching not reviewed papers:", err);
      });
  } 

  //fetch all reviewers
  const fetchReviewers = () => {
    const token = localStorage.getItem("authToken");
    fetch(`${baseUrl}/researches/reviewers`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setReviewers(data);
      })
      .catch((err) => {
        console.error("Error fetching reviewers:", err);
      });
  } 

  //fetch all published papers
  const fetchPublishedPapers = () => {
    const token = localStorage.getItem("authToken");
    try{fetch(`${baseUrl}/researches/reviewed`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setPublishedPapers(data);
      })
      .catch((err) => {
        console.error("Error fetching published papers:", err);
      });}
      catch(err){
        console.error("Error fetching published papers:", err);
        setPublishedPapers([]);
      }
  } 

  
  const assignReviewer = (paperId, reviewerId) => {
    const token = localStorage.getItem("authToken");
    fetch(`${baseUrl}/researches/review/${paperId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(reviewerId ),
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Failed to assign reviewer");
        }
        return await res.json();
      })
      .then((data) => {
        alert("Reviewer assigned successfully");
        getUnderReviewPapers();
        fetchNotReviewedPapers();
        fetchPublishedPapers();
        fetchReviewers();
      })
      .catch((err) => {
        console.error("Error assigning reviewer:", err);
        alert("Error assigning reviewer");
      });
  };


  //download pdf
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


//load stats after component is loaded
  useEffect(() => {
    getUnderReviewPapers();
    fetchPublishedPapers();
    fetchReviewers();
    fetchNotReviewedPapers();
  }, []);


  return (
    <DashboardLayout navItems={collegeAdminNavItems} title="Manage Research">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Research Management</h1>
            <p className="text-muted-foreground">
              Oversee research paper submissions and reviews
            </p>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

            <Input placeholder="Search papers..." className="pl-10" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="review">
          <TabsList>
            <TabsTrigger value="review">
              Not Review ({notReviewedPapers.length})
            </TabsTrigger>

            <TabsTrigger value="under-reviewed">
              Under Review ({underReviewPapers.length})
            </TabsTrigger>

            <TabsTrigger value="published">
              Published ({publishedPapers.length})
            </TabsTrigger>
          </TabsList>

          {/* Under Review */}
          <TabsContent value="review" className="mt-6 space-y-4">
            {filterNotReviewedPapers.map((paper) => (
              <Card key={paper.id} className="border-border/50">
                <CardContent className="p-6 pt-4">
                  <div className="flex gap-4">

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        

                        <Badge className="bg-yellow-500/10 text-yellow-600 border-0">
                          <Clock className="w-3 h-3 mr-1" />
                          Not Review
                        </Badge>
                      </div>

                      <h3 className="text-xl font-semibold mb-2">
                        {paper.title}
                      </h3>

                      <p className="text-sm text-muted-foreground mb-2">
                        By {paper.studentName} • {paper.department}
                      </p>

                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {paper.content}
                      </p>

                     
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setViewPaper(paper)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Paper
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => {
                          setAssignPaper(paper);
                          setSelectedReviewer(null);
                          setNewReviewerEmail("");
                        }}
                      >
                        <UserCheck className="w-4 h-4 mr-2" />
                        Assign Reviewer
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
          {/* Under Review */}
          <TabsContent value="under-reviewed" className="mt-6 space-y-4">
            {filterUnderReviewPapers.map((paper) => (
              <Card key={paper.id} className="border-border/50">
                <CardContent className="p-6 pt-4">
                  <div className="flex gap-4">

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        

                        <Badge className="bg-yellow-500/10 text-yellow-600 border-0">
                          <Clock className="w-3 h-3 mr-1" />
                          Under Reviewed
                        </Badge>
                      </div>

                      <h3 className="text-xl font-semibold mb-2">
                        {paper.title}
                      </h3>

                      <p className="text-sm text-muted-foreground mb-2">
                        {paper.overview.length > 100
                          ? paper.overview.substring(0, 100) + "..."
                          : paper.overview}
                      </p>

                      <p className="text-sm text-muted-foreground mb-2">
                        By {paper.studentName} • {paper.department}
                      </p>

                      

                      <p className="text-sm text-muted-foreground mt-2">
                        Assigned to {paper.reviewerName}
                      </p>
                     
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setViewPaper(paper)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Paper
                      </Button>
                      </div>

                   
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
          {/* Assign Reviewer Dialog */}

          <Dialog
            open={!!assignPaper}
            onOpenChange={() => setAssignPaper(null)}
          >
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Assign Reviewer</DialogTitle>

                <DialogDescription>
                  Select a reviewer for "{assignPaper?.title}"
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Reviewer List */}

                <div className="space-y-2">
                  {reviewers.map((reviewer) => (
                    <div
                      key={reviewer.id}
                      onClick={() => {
                        setSelectedReviewer(reviewer.id);
                      }}
                      className={`p-3 border rounded-lg cursor-pointer flex justify-between items-center ${
                        selectedReviewer === reviewer.id
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted"
                      }`}
                    >
                      <div>
                        <p className="font-medium text-sm">{reviewer.fullName}</p>

                        <p className="text-xs text-muted-foreground">
                          {reviewer.email} 
                        </p>
                      </div>

                      {selectedReviewer === reviewer.id && (
                        <CheckCircle className="w-4 h-4 text-primary" />
                      )}
                    </div>
                  ))}
                </div>

                <Button
                  className="w-full"
                  disabled={!selectedReviewer && !newReviewerEmail}
                  onClick={handleAssign}
                >
                  <UserCheck className="w-4 h-4 mr-2" />
                  Assign Reviewer
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Published */}
          <TabsContent value="published" className="mt-6">
            <div className="space-y-4">
              {filterPublishedPapers.length > 0 && filterPublishedPapers.map((paper) => (
                <Card key={paper.id} className="border-border/50">
                  <CardContent className="p-6 pt-4">
                    <div className="flex gap-4">
                    

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          
                          <Badge className="bg-primary/10 text-primary border-0">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Published
                          </Badge>
                        </div>
                        


                        <h3 className="font-semibold">{paper.title}</h3>

                        <p className="text-sm text-muted-foreground mb-2">
                          {paper.overview.length > 100
                            ? paper.overview.substring(0, 100) + "..."
                            : paper.overview}
                        </p>

                        <p className="text-sm text-muted-foreground">
                          By {paper.studentName} • {paper.department}
                        </p>

                        <p className="text-sm text-muted-foreground">
                          Reviewed By {paper.reviewerName}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setViewPaper(paper)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>

                        <Button variant="outline" size="sm" onClick={()=>downloadPdf(paper.pdfUrl, paper.title)}>
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog */}
      <Dialog open={!!viewPaper} onOpenChange={() => setViewPaper(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{viewPaper?.title}</DialogTitle>

            <DialogDescription>
              By {viewPaper?.studentName} • {viewPaper?.department}
            </DialogDescription>
          </DialogHeader>

          {viewPaper && (
            <div className="space-y-4">


              <h3 className="text-lg font-semibold">Subject</h3>
              <p className="text-muted-foreground">{viewPaper.subject}</p>
              
              <h3 className="text-lg font-semibold">Abstract</h3>
              <p className="text-muted-foreground">{viewPaper.overview}</p>

              <div className="text-sm text-muted-foreground border-t pt-4">
                Submitted: {viewPaper.createdAt.split("T")[0]}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AdminResearchPage;
