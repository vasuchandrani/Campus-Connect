import { useEffect, useState, useMemo, useCallback } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { Label } from "../../components/ui/Label";
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
import { toast } from "../../hooks/use-toast";

import { Search, Download, Upload, Clock, User, SearchX } from "lucide-react";
import { studentNavItems } from "../../config/Navigation";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Loading from "../../components/ui/Loading";
import EmptyState from "../../components/ui/EmptyState";

const ResearchPage = () => {
  //state variables
  const [researchPapers, setResearchPapers] = useState([]);
  const [query, setQuery] = useState("");
  const [pdfFile, setPdfFile] = useState(null);

  const [mySubmissionsData, setMySubmissionsData] = useState([]);

  const [viewPaper, setViewPaper] = useState(null);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    abstract: "",
    department: "",
    subject: "",
  });
  const [requesting, setRequesting] = useState(false);
  const [loading, setLoading] = useState(true);

  //baseUrl
  const baseUrl = `${import.meta.env.VITE_BACKEND_URL}/campus-connect/student`;

  const navigate = useNavigate();
  const { routeProtection } = useAuth();
  useEffect(() => {
    if (!routeProtection("STUDENT")) {
      navigate("/auth");
    }
  }, [navigate, routeProtection]);

  //cancle submit
  const handleCancelSubmit = () => {
    setConfirmSubmit(false);
  };

  //confirm submit research paper
  const handleConfirmSubmit = async () => {
    if (
      formData.title.trim() === "" ||
      formData.abstract.trim() === "" ||
      formData.department.trim() === "" ||
      formData.subject.trim() === ""
    ) {
      toast({
        title: "Error",
        description: "Please fill in all the fields.",
        variant: "destructive",
      });
      return;
    }

    if (!pdfFile) {
      toast({
        title: "Error",
        description: "Please upload your research paper in PDF format.",
        variant: "destructive",
      });
      return;
    }

    setRequesting(true);
    const token = localStorage.getItem("authToken");
    const dto = {
      title: formData.title,
      overview: formData.abstract,
      dept: formData.department,
      subject: formData.subject,
    };
    const data = new FormData();

    // DTO as JSON
    data.append(
      "research",
      new Blob([JSON.stringify(dto)], { type: "application/json" }),
    );

    // PDF file
    data.append("pdf", pdfFile);

    await fetch(`${baseUrl}/researches`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: data,
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to submit research paper");
        }
        return res.json();
      })
      .then((data) => {
        if (data.message === "Your Research Paper has been submitted") {
          toast({
            title: "Success",
            description: data.message,
          });
          setFormData({
            title: "",
            abstract: "",
            department: "",
            subject: "",
          });
          setPdfFile(null);
          fetchMySubmissions();
          fetchResearchPapers();
        } else {
          throw new Error(data.message);
        }
      })
      .catch((err) => {
        console.error("Error submitting research paper:", err);
        toast({
          title: "Error",
          description:
            err.message || "Failed to submit research paper. Please try again.",
          variant: "destructive",
        });
      })
      .finally(() => {
        setConfirmSubmit(false);
        setRequesting(false);
      });
  };

  // upload file
  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (file.type !== "application/pdf") {
      toast({
        title: "Error",
        description: "Only PDF files are allowed.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size must be less than 10MB.",
        variant: "destructive",
      });

      return;
    }

    setPdfFile(file);
  };

  // download pdf
  const downloadPdf = async (url, title) => {
    try {
      setRequesting(true);
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
      toast({
        title: "Error",
        description:
          error.message || "Failed to download PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRequesting(false);
    }
  };

  //fetch my reasearch papers
  const fetchMySubmissions = async () => {
    try {
      const res = await fetch(`${baseUrl}/researches/mine`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      const data = await res.json();
      setMySubmissionsData(data);
    } catch (err) {
      console.error("Error fetching my submissions:", err);
      toast({
        title: "Error",
        description: "Failed to fetch my submissions",
        variant: "destructive",
      });
    }
  };

  //fetch all
  const fetchResearchPapers = async () => {
    try {
      const res = await fetch(`${baseUrl}/researches`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      const data = await res.json();
      setResearchPapers(data);
    } catch (err) {
      console.error("Error fetching research papers:", err);
      toast({
        title: "Error",
        description: "Failed to fetch research papers",
        variant: "destructive",
      });
    }
  };

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      await Promise.all([fetchResearchPapers(), fetchMySubmissions()]);

      setLoading(false);
    };

    loadData();
  }, []);

  //for searching
  const filteredPapers = useMemo(() => {
    return researchPapers.filter((paper) =>
      paper.title.toLowerCase().includes(query.toLowerCase()),
    );
  }, [researchPapers, query]);

  const filteredMySubmissions = useMemo(() => {
    return mySubmissionsData.filter((paper) =>
      paper.title.toLowerCase().includes(query.toLowerCase()),
    );
  }, [mySubmissionsData, query]);

  if (loading) {
    return (
      <DashboardLayout
        navItems={studentNavItems}
        title="Research Papers"
        bell={true}
      >
        <Card>
          <CardContent className="p-6 text-center">
            <Loading />
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      navItems={studentNavItems}
      title="Research Papers"
      bell={true}
    >
      <div className="space-y-6">
        <Tabs defaultValue="browse" className="w-full">
          {/* Header */}

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <TabsList>
              <TabsTrigger value="browse">Browse Papers</TabsTrigger>
              <TabsTrigger value="submit">Submit Paper</TabsTrigger>
              <TabsTrigger value="my-submissions">My Submissions</TabsTrigger>
            </TabsList>

            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

              <Input
                placeholder="Search papers..."
                className="pl-10"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          {/* ---------------- BROWSE PAPERS ---------------- */}

          <TabsContent value="browse" className="mt-0">
            <div className="space-y-4">
              {filteredPapers.length === 0 ? (
                <div className="col-span-full w-full">
                  <EmptyState
                    className="col-span-full"
                    icon={
                      <SearchX className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
                    }
                    title="No Papers Found"
                    desc="Try adjusting your search query."
                  />
                </div>
              ) : (
                filteredPapers.map((paper) => (
                  <Card
                    key={paper.id}
                    className="border-border/50 hover:shadow-soft transition-shadow"
                  >
                    <CardContent className="p-6 pt-4">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{paper.department}</Badge>

                            <Badge className="bg-primary/10 text-primary border-0">
                              Published
                            </Badge>
                          </div>

                          <h3 className="text-lg font-semibold mb-2">
                            {paper.title}
                          </h3>

                          <p className="text-muted-foreground mb-3">
                            {paper.overview.length > 150
                              ? paper.overview.substring(0, 150) + "..."
                              : paper.overview}
                          </p>

                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              <span>{paper.studentName}</span>
                            </div>

                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{paper.createdAt.split("T")[0]}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setViewPaper(paper)}
                          >
                            View Details
                          </Button>

                          <Button
                            disabled={requesting}
                            onClick={() =>
                              downloadPdf(paper.pdfUrl, paper.title)
                            }
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download PDF
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* ---------------- SUBMIT PAPER ---------------- */}

          <TabsContent value="submit" className="mt-0">
            <Card className="border-border/50 max-w-2xl">
              <CardHeader>
                <CardTitle>Submit Research Paper</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Paper Title</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Enter the title of your research paper"
                    value={formData.title}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="abstract">Abstract</Label>
                  <Textarea
                    id="abstract"
                    name="abstract"
                    placeholder="Write a brief summary of your research..."
                    className="min-h-32"
                    value={formData.abstract}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    name="department"
                    id="department"
                    value={formData.department}
                    placeholder="e.g., Computer Science"
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    name="subject"
                    id="subject"
                    value={formData.subject}
                    placeholder="e.g., Machine Learning"
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Upload Paper (PDF)</Label>

                  <label className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer block">
                    <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />

                    <p className="text-sm text-muted-foreground mb-1">
                      Drag and drop your PDF here, or click to browse
                    </p>

                    <p className="text-xs text-muted-foreground">
                      Max file size: 10MB
                    </p>

                    {pdfFile && (
                      <p className="text-sm text-green-600 mt-2">
                        Selected: {pdfFile.name}
                      </p>
                    )}

                    <input
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  disabled={requesting}
                  onClick={() => setConfirmSubmit(true)}
                >
                  Submit for Review
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <Dialog
            open={confirmSubmit}
            onOpenChange={(open) => setConfirmSubmit(open)}
          >
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Submit Research Paper</DialogTitle>
                <DialogDescription>
                  Are you sure you want to submit this research paper for
                  review? Once submitted, it will be reviewed by the admin
                  before publishing.
                </DialogDescription>
              </DialogHeader>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  disabled={requesting}
                  variant="outline"
                  onClick={handleCancelSubmit}
                >
                  Cancel
                </Button>

                <Button disabled={requesting} onClick={handleConfirmSubmit}>
                  Confirm Submit
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          {/* ---------------- MY SUBMISSIONS ---------------- */}

          <TabsContent value="my-submissions" className="mt-0">
            <div className="space-y-4">
              {filteredMySubmissions.length === 0 ? (
                <div className="col-span-full w-full">
                  <EmptyState
                    className="col-span-full"
                    icon={
                      <SearchX className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
                    }
                    title="No Submissions Found"
                    desc="You haven't submitted any research papers yet."
                  />
                </div>
              ) : (
                filteredMySubmissions.map((paper) => (
                  <Card key={paper.id} className="border-border/50">
                    <CardContent className="p-6 pt-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-yellow-500/10 text-yellow-600 border-0">
                              {paper.status}
                            </Badge>
                          </div>
                          {console.log(paper)}
                          <h3 className="font-semibold mb-1">{paper.title}</h3>

                          <p className="text-sm text-muted-foreground">
                            Submitted on {paper.createdAt.split("T")[0]}
                          </p>

                         {paper.reviewerFeedback && <p className="text-sm text-muted-foreground">
                            Feedback:{paper.reviewerFeedback}
                          </p>}
                          {!paper.reviewerFeedback &&<p className="text-sm text-muted-foreground">
                            Feedback: Pending
                          </p>}
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setViewPaper(paper)}
                        >
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ---------------- PAPER DETAILS DIALOG ---------------- */}

      <Dialog
        open={!!viewPaper}
        onOpenChange={(open) => !open && setViewPaper(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{viewPaper?.title}</DialogTitle>

            <DialogDescription>
              By {viewPaper?.studentName} • {viewPaper?.studentId}
            </DialogDescription>
          </DialogHeader>

          {viewPaper && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge
                  className={
                    viewPaper.status === "published"
                      ? "bg-primary/10 text-primary border-0"
                      : "bg-yellow-500/10 text-yellow-600 border-0"
                  }
                >
                  {viewPaper.status}
                </Badge>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Subject</h4>

                <p className="text-muted-foreground">{viewPaper.subject}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Overview</h4>

                <p className="text-muted-foreground">{viewPaper.overview}</p>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground border-t pt-4">
                <span>Submitted: {viewPaper.createdAt.split("T")[0]}</span>

                {viewPaper.status === "published" && (
                  <span>Published: {viewPaper.date}</span>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ResearchPage;
