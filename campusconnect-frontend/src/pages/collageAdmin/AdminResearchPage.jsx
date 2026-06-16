import { useEffect, useState, useMemo,useCallback } from "react";
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
import { toast } from "../../hooks/use-toast";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Loading from "../../components/ui/Loading";
import EmptyState from "../../components/ui/EmptyState";

/* ---------------- MOCK DATA ---------------- */

const AdminResearchPage = () => {
  //baseUrl
  const baseUrl = `${import.meta.env.VITE_BACKEND_URL}/campus-connect/college-admin`;

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
  const [requesting, setRequesting] = useState(false);
  const [loading, setLoading] = useState({
    underReview: true,
    published: true,
    notReviewed: true,
    reviewers: true,
  });

  const navigate = useNavigate();
  const { routeProtection } = useAuth();

  useEffect(() => {
    if (!routeProtection("COLLEGE_ADMIN")) {
      navigate("/auth");
    }
  }, [navigate, routeProtection]);

  //handel assign reviewer
  const handleAssign = () => {
    if (!selectedReviewer || !assignPaper) return;

    assignReviewer(assignPaper.id, selectedReviewer);

    setAssignPaper(null);
    setSelectedReviewer(null);
    setNewReviewerEmail("");
  };

  //for searching papers by title
  const filterUnderReviewPapers = useMemo(() => {
    return underReviewPapers.filter((paper) =>
      paper.title.toLowerCase().includes(query.toLowerCase()),
    );
  }, [underReviewPapers, query]);

  const filterNotReviewedPapers = useMemo(() => {
    return notReviewedPapers.filter((paper) =>
      paper.title.toLowerCase().includes(query.toLowerCase()),
    );
  }, [notReviewedPapers, query]);

  const filterPublishedPapers = useMemo(() => {
    return publishedPapers.filter((paper) =>
      paper.title.toLowerCase().includes(query.toLowerCase()),
    );
  }, [publishedPapers, query]);

  //get papers which reviewer assign
  const getUnderReviewPapers = useCallback(async () => {
    setLoading((prev) => ({ ...prev, underReview: true }));

    try {
      const res = await fetch(`${baseUrl}/researches/under-reviewed`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      const data = await res.json();
      setUnderReviewPapers(data);
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "Failed to fetch under review papers",
        variant: "destructive",
      });
    } finally {
      setLoading((prev) => ({ ...prev, underReview: false }));
    }
  }, [baseUrl]);

  //all papers which not reviewer assign
  const fetchNotReviewedPapers = useCallback(async () => {
    setLoading((prev) => ({ ...prev, notReviewed: true }));

    try {
      const res = await fetch(`${baseUrl}/researches/not-reviewed`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      const data = await res.json();
      setNotReviewedPapers(data);
    } catch (err) {
      console.error("Error fetching not reviewed papers:", err);
    } finally {
      setLoading((prev) => ({ ...prev, notReviewed: false }));
    }
  }, [baseUrl]);

  //fetch all reviewers
  const fetchReviewers = useCallback(async () => {
    setLoading((prev) => ({ ...prev, reviewers: true }));

    try {
      const res = await fetch(`${baseUrl}/researches/reviewers`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      const data = await res.json();
      setReviewers(data);
    } catch (err) {
      console.error("Error fetching reviewers:", err);
    } finally {
      setLoading((prev) => ({ ...prev, reviewers: false }));
    }
  }, [baseUrl]);

  //fetch all published papers
  const fetchPublishedPapers = useCallback(async () => {
    setLoading((prev) => ({ ...prev, published: true }));

    try {
      const res = await fetch(`${baseUrl}/researches/reviewed`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      const data = await res.json();
      setPublishedPapers(data);
    } catch (err) {
      console.error("Error fetching published papers:", err);
      setPublishedPapers([]);
    } finally {
      setLoading((prev) => ({ ...prev, published: false }));
    }
  }, [baseUrl]);

  const assignReviewer = useCallback(async (paperId, reviewerId) => {
    setRequesting(true);
    const token = localStorage.getItem("authToken");
    await fetch(`${baseUrl}/researches/review/${paperId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(reviewerId),
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Failed to assign reviewer");
        }
        return await res.json();
      })
      .then((data) => {
        if (data.message === "Reviewer assigned successfully") {
          getUnderReviewPapers();
          fetchNotReviewedPapers();
          fetchPublishedPapers();
          fetchReviewers();
          toast({
            title: "Success",
            description: data.message,
            variant: "success",
          });
        } else {
          throw new Error(data.message || "Failed to assign reviewer");
        }
      })
      .catch((err) => {
        toast({
          title: "Error",
          description: err.message || "Failed to assign reviewer",
          variant: "destructive",
        });
      })
      .finally(() => {
        setRequesting(false);
      });
  }, [baseUrl, getUnderReviewPapers, fetchNotReviewedPapers, fetchPublishedPapers, fetchReviewers]);

  //download pdf
  const downloadPdf = useCallback(async (url, title) => {
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
  }, []);

  //load stats after component is loaded
  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        getUnderReviewPapers(),
        fetchNotReviewedPapers(),
        fetchPublishedPapers(),
        fetchReviewers(),
      ]);
    };

    fetchData();
  }, [getUnderReviewPapers, fetchNotReviewedPapers, fetchPublishedPapers, fetchReviewers]);

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

            <Input
              placeholder="Search papers..."
              className="pl-10"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
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
            {loading.notReviewed ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <Loading />
                </CardContent>
              </Card>
            ) : filterNotReviewedPapers.length === 0 ? (
              <EmptyState
                icon={<Search className="w-8 h-8 text-muted-foreground" />}
                title="No Papers Found"
                desc="There are no papers that need review."
              />
            ) : (
              filterNotReviewedPapers.map((paper) => (
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
                          disabled={requesting}
                          onClick={() => setViewPaper(paper)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Paper
                        </Button>

                        <Button
                          disabled={requesting}
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
              ))
            )}
          </TabsContent>
          {/* Under Review */}
          <TabsContent value="under-reviewed" className="mt-6 space-y-4">
            {loading.underReview ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <Loading />
                </CardContent>
              </Card>
            ) : filterUnderReviewPapers.length === 0 ? (
              <EmptyState
                icon={<Search className="w-8 h-8 text-muted-foreground" />}
                title="No Papers Found"
                desc="There are no papers currently under review."
              />
            ) : (
              filterUnderReviewPapers.map((paper) => (
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
                          disabled={requesting}
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
              ))
            )}
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
                  {loading.reviewers ? (
                    <Card>
                      <CardContent className="p-6 text-center">
                        <Loading />
                      </CardContent>
                    </Card>
                  ) : reviewers.length === 0 ? (
                    <EmptyState
                      icon={
                        <Search className="w-8 h-8 text-muted-foreground" />
                      }
                      title="No Reviewers Found"
                      desc="There are no reviewers available to assign."
                    />
                  ) : (
                    reviewers.map((reviewer) => (
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
                          <p className="font-medium text-sm">
                            {reviewer.fullName}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {reviewer.email}
                          </p>
                        </div>

                        {selectedReviewer === reviewer.id && (
                          <CheckCircle className="w-4 h-4 text-primary" />
                        )}
                      </div>
                    ))
                  )}
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
              {loading.published ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <Loading />
                  </CardContent>
                </Card>
              ) : filterPublishedPapers.length === 0 ? (
                <EmptyState
                  icon={<Search className="w-8 h-8 text-muted-foreground" />}
                  title="No Papers Found"
                  desc="There are no published papers."
                />
              ) : (
                filterPublishedPapers.map((paper) => (
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
                            disabled={requesting}
                            variant="outline"
                            size="sm"
                            onClick={() => setViewPaper(paper)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>

                          <Button
                            disabled={requesting}
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              downloadPdf(paper.pdfUrl, paper.title)
                            }
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
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
