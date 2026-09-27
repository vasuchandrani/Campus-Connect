import "./ResearchPage.css";
import { useEffect, useState, useMemo, useCallback } from "react";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Input } from "../../../components/ui/Input";
import { Textarea } from "../../../components/ui/Textarea";
import { Label } from "../../../components/ui/Label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/Tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../../components/ui/Dialog";
import { toast } from "../../../hooks/use-toast";
import {
  Search,
  Download,
  Upload,
  Clock,
  User,
  ThumbsUp,
  Globe,
  Building2,
  FileText,
  Send,
  GraduationCap,
} from "lucide-react";
import { studentNavItems } from "../../../config/Navigation";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import PageSkeleton from "../../../components/ui/PageSkeleton";
import EmptyState from "../../../components/ui/EmptyState";
import { researchPaperApi } from "../../../services/api";

const ResearchPage = () => {
  // State variables
  const [campusPapers, setCampusPapers] = useState([]);
  const [globalPapers, setGlobalPapers] = useState([]);
  const [mySubmissionsData, setMySubmissionsData] = useState([]);
  const [activeTab, setActiveTab] = useState("campus");
  const [query, setQuery] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [viewPaper, setViewPaper] = useState(null);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [upvotingIds, setUpvotingIds] = useState(new Set());
  const [requesting, setRequesting] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    abstract: "",
    department: "",
    subject: "",
  });

  const navigate = useNavigate();
  const { routeProtection } = useAuth();

  useEffect(() => {
    if (!routeProtection("STUDENT")) {
      navigate("/auth");
    }
  }, [navigate, routeProtection]);

  // Load all research data
  const loadData = async () => {
    setLoading(true);
    try {
      const [campusData, globalData, myData] = await Promise.all([
        researchPaperApi.getCampusPapers().catch(() => []),
        researchPaperApi.getGlobalPapers().catch(() => []),
        researchPaperApi.getMySubmissions().catch(() => []),
      ]);
      setCampusPapers(Array.isArray(campusData) ? campusData : []);
      setGlobalPapers(Array.isArray(globalData) ? globalData : []);
      setMySubmissionsData(Array.isArray(myData) ? myData : []);
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "Failed to load research papers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Upvote toggle handler
  const handleToggleUpvote = async (e, paper, isGlobal) => {
    e.stopPropagation();
    const paperId = paper.id;
    if (upvotingIds.has(paperId)) return;

    setUpvotingIds((prev) => new Set(prev).add(paperId));

    const updateList = (list) =>
      list.map((item) => {
        if (item.id === paperId) {
          const currentlyUpvoted = !!item.isUpvoted;
          const count = Number(item.upvotesCount || 0);
          return {
            ...item,
            isUpvoted: !currentlyUpvoted,
            upvotesCount: currentlyUpvoted ? Math.max(0, count - 1) : count + 1,
          };
        }
        return item;
      });

    if (isGlobal) {
      setGlobalPapers(updateList);
    } else {
      setCampusPapers(updateList);
    }

    try {
      if (isGlobal) {
        await researchPaperApi.upvoteGlobal(paperId);
      } else {
        await researchPaperApi.upvoteCampus(paperId);
      }
    } catch (err) {
      loadData();
      toast({
        title: "Error",
        description: err.message || "Failed to toggle upvote",
        variant: "destructive",
      });
    } finally {
      setUpvotingIds((prev) => {
        const next = new Set(prev);
        next.delete(paperId);
        return next;
      });
    }
  };

  // Download PDF file
  const handleDownloadPdf = async (url, title) => {
    if (!url) return;
    try {
      setRequesting(true);
      const blob = await researchPaperApi.downloadPdf(url);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `${title || "research-paper"}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      toast({
        title: "Download Failed",
        description: error.message || "Failed to download PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRequesting(false);
    }
  };

  // Form input changes
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  // File upload change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast({
        title: "Invalid File",
        description: "Only PDF documents are accepted.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "PDF size must be less than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setPdfFile(file);
  };

  // Submit research paper
  const handleConfirmSubmit = async () => {
    if (
      !formData.title.trim() ||
      !formData.abstract.trim() ||
      !formData.department.trim() ||
      !formData.subject.trim()
    ) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (!pdfFile) {
      toast({
        title: "File Required",
        description: "Please attach your research paper PDF.",
        variant: "destructive",
      });
      return;
    }

    setRequesting(true);
    try {
      const dto = {
        title: formData.title,
        overview: formData.abstract,
        dept: formData.department,
        subject: formData.subject,
      };

      const data = new FormData();
      data.append("research", new Blob([JSON.stringify(dto)], { type: "application/json" }), "research.json");
      data.append("title", formData.title.trim());
      data.append("overview", formData.abstract.trim());
      data.append("dept", formData.department.trim());
      data.append("subject", formData.subject.trim());
      data.append("pdf", pdfFile);

      const response = await researchPaperApi.submitPaper(data);

      toast({
        title: "Submission Successful",
        description: response.message || "Your research paper has been submitted for review!",
      });

      setFormData({
        title: "",
        abstract: "",
        department: "",
        subject: "",
      });
      setPdfFile(null);
      setConfirmSubmit(false);
      setActiveTab("my-submissions");
      loadData();
    } catch (err) {
      toast({
        title: "Submission Failed",
        description: err.message || "Failed to submit research paper. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRequesting(false);
      setConfirmSubmit(false);
    }
  };

  // Search filter helpers
  const filterList = (list) => {
    return list.filter(
      (paper) =>
        paper.title?.toLowerCase().includes(query.toLowerCase()) ||
        paper.overview?.toLowerCase().includes(query.toLowerCase()) ||
        paper.subject?.toLowerCase().includes(query.toLowerCase()) ||
        paper.department?.toLowerCase().includes(query.toLowerCase()) ||
        paper.studentName?.toLowerCase().includes(query.toLowerCase()) ||
        paper.professorName?.toLowerCase().includes(query.toLowerCase()) ||
        paper.collegeName?.toLowerCase().includes(query.toLowerCase()),
    );
  };

  const filteredCampusPapers = useMemo(() => filterList(campusPapers), [campusPapers, query]);
  const filteredGlobalPapers = useMemo(() => filterList(globalPapers), [globalPapers, query]);
  const filteredMySubmissions = useMemo(() => filterList(mySubmissionsData), [mySubmissionsData, query]);

  const renderPaperCard = (paper, isGlobal) => {
    const isUpvoted = !!paper.isUpvoted;
    const count = paper.upvotesCount || 0;

    return (
      <Card
        key={paper.id}
        className="flex flex-col justify-between border-border/80 hover:border-primary/40 hover:shadow-md transition-all duration-200"
      >
        <CardContent className="p-4 sm:p-5 space-y-3 flex-1">
          <div className="flex items-center justify-between gap-2">
            {isGlobal ? (
              <Badge className="bg-purple-600 text-white text-[10px] font-bold">
                Global Edition
              </Badge>
            ) : (
              <Badge className="bg-primary text-primary-foreground text-[10px] font-bold">
                Campus Edition
              </Badge>
            )}

            {paper.department && (
              <Badge variant="outline" className="text-[10px] truncate max-w-[130px]">
                {paper.department}
              </Badge>
            )}
          </div>

          <div>
            <h3 className="text-base font-bold text-foreground line-clamp-2">
              {paper.title}
            </h3>
            {paper.subject && (
              <p className="text-xs font-semibold text-primary mt-0.5">
                Domain: {paper.subject}
              </p>
            )}
          </div>

          <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
            {paper.overview || "Scholarly research paper in campus repository."}
          </p>

          <div className="pt-2 border-t border-border/60 space-y-1 text-xs text-muted-foreground">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 font-medium text-foreground">
                <User className="w-3.5 h-3.5 text-primary" />
                {paper.studentName ||
                  (paper.professorName
                    ? `Prof. ${paper.professorName}`
                    : "Student Researcher")}
              </span>
              {paper.createdAt && (
                <span className="text-[11px]">
                  {new Date(paper.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              )}
            </div>
            {paper.collegeName && isGlobal && (
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground truncate">
                <Building2 className="w-3 h-3 text-primary shrink-0" />
                <span className="truncate">{paper.collegeName}</span>
              </div>
            )}
          </div>
        </CardContent>

        <div className="p-3 sm:p-4 pt-0 flex items-center gap-2">
          <Button
            variant={isUpvoted ? "default" : "outline"}
            size="sm"
            onClick={(e) => handleToggleUpvote(e, paper, isGlobal)}
            disabled={upvotingIds.has(paper.id)}
            className={`text-xs h-9 px-3 gap-1.5 font-semibold ${
              isUpvoted
                ? "bg-primary text-primary-foreground"
                : "hover:text-primary hover:border-primary/40"
            }`}
          >
            <ThumbsUp
              className={`w-3.5 h-3.5 ${
                isUpvoted ? "fill-current" : ""
              }`}
            />
            <span>{count}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewPaper(paper)}
            className="flex-1 text-xs font-semibold h-9"
          >
            <FileText className="w-3.5 h-3.5 mr-1.5" />
            View Abstract
          </Button>

          {paper.pdfUrl && (
            <Button
              size="sm"
              disabled={requesting}
              onClick={() => handleDownloadPdf(paper.pdfUrl, paper.title)}
              className="text-xs font-semibold h-9 px-3 gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">PDF</span>
            </Button>
          )}
        </div>
      </Card>
    );
  };

  return (
    <DashboardLayout navItems={studentNavItems} title="Research">
      {loading ? (
        <PageSkeleton />
      ) : (
        <div className="space-y-5 sm:space-y-6 w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-primary" />
                <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                  Academic Research & Publications
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Explore college research, cross-institutional academic papers, or submit your own research
              </p>
            </div>

            {activeTab !== "submit" && (
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search papers, domains..."
                  className="pl-9 h-9 text-xs sm:text-sm"
                />
              </div>
            )}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="w-full grid grid-cols-3 sm:inline-flex sm:w-auto p-1 bg-muted/60 border border-border/60 rounded-xl gap-1">
              <TabsTrigger
                value="campus"
                className="text-xs sm:text-sm font-semibold rounded-lg px-2.5 sm:px-3.5 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs flex items-center justify-center gap-1.5"
              >
                <Building2 className="w-3.5 h-3.5 shrink-0" />
                <span>Campus</span>
              </TabsTrigger>
              <TabsTrigger
                value="global"
                className="text-xs sm:text-sm font-semibold rounded-lg px-2.5 sm:px-3.5 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs flex items-center justify-center gap-1.5"
              >
                <Globe className="w-3.5 h-3.5 shrink-0" />
                <span>Global</span>
              </TabsTrigger>
              <TabsTrigger
                value="submit"
                className="text-xs sm:text-sm font-semibold rounded-lg px-2.5 sm:px-3.5 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs flex items-center justify-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Submit Paper</span>
              </TabsTrigger>
              <TabsTrigger
                value="my-submissions"
                className="text-xs sm:text-sm font-semibold rounded-lg px-2.5 sm:px-3.5 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs flex items-center justify-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">My Submissions</span>
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Campus Papers */}
            <TabsContent value="campus" className="space-y-4 pt-1">
              {filteredCampusPapers.length === 0 ? (
                <Card className="border-dashed border-border/80">
                  <CardContent className="py-12">
                    <EmptyState
                      icon={GraduationCap}
                      title={query ? "No Matching Research Papers" : "No Campus Papers Published"}
                      description={
                        query
                          ? `No research papers matching "${query}".`
                          : "There are currently no research papers published within your college."
                      }
                    />
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {filteredCampusPapers.map((paper) => renderPaperCard(paper, false))}
                </div>
              )}
            </TabsContent>

            {/* Tab 2: Global Papers */}
            <TabsContent value="global" className="space-y-4 pt-1">
              {filteredGlobalPapers.length === 0 ? (
                <Card className="border-dashed border-border/80">
                  <CardContent className="py-12">
                    <EmptyState
                      icon={Globe}
                      title={query ? "No Matching Research Papers" : "No Global Papers Published"}
                      description={
                        query
                          ? `No research papers matching "${query}".`
                          : "There are currently no global research papers available."
                      }
                    />
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {filteredGlobalPapers.map((paper) => renderPaperCard(paper, true))}
                </div>
              )}
            </TabsContent>

            {/* Tab 3: Submit Paper */}
            <TabsContent value="submit" className="space-y-4 pt-1">
              <Card className="border-border/80 max-w-2xl">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl font-bold">Submit Research Paper</CardTitle>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Submit your paper for faculty review and institutional academic indexing.
                  </p>
                </CardHeader>

                <CardContent className="p-4 sm:p-6 pt-0">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setConfirmSubmit(true);
                    }}
                    className="space-y-4"
                  >
                    <div className="space-y-1.5">
                      <Label htmlFor="title" className="text-xs font-bold text-foreground">
                        Research Paper Title *
                      </Label>
                      <Input
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="e.g. Distributed Consensus Architectures in Edge Computing"
                        className="h-9 text-xs sm:text-sm"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="space-y-1.5">
                        <Label htmlFor="subject" className="text-xs font-bold text-foreground">
                          Subject / Domain *
                        </Label>
                        <Input
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          placeholder="e.g. Artificial Intelligence"
                          className="h-9 text-xs sm:text-sm"
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="dept" className="text-xs font-bold text-foreground">
                          Department *
                        </Label>
                        <Input
                          id="dept"
                          name="department"
                          value={formData.department}
                          onChange={handleChange}
                          placeholder="e.g. Computer Science"
                          className="h-9 text-xs sm:text-sm"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="abstract" className="text-xs font-bold text-foreground">
                        Abstract / Overview *
                      </Label>
                      <Textarea
                        id="abstract"
                        name="abstract"
                        rows={4}
                        value={formData.abstract}
                        onChange={handleChange}
                        placeholder="Provide an overview, key methodology, findings, and conclusion of the research..."
                        className="text-xs sm:text-sm resize-none"
                        required
                      />
                    </div>

                    {/* PDF Upload Field */}
                    <div className="space-y-1.5">
                      <Label htmlFor="pdf" className="text-xs font-bold text-foreground">
                        Manuscript Document (PDF) *
                      </Label>
                      <div className="border-2 border-dashed border-border/80 rounded-xl p-4 text-center hover:border-primary/50 transition-colors bg-accent/10">
                        <input
                          id="pdf"
                          type="file"
                          accept=".pdf"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <label
                          htmlFor="pdf"
                          className="cursor-pointer flex flex-col items-center justify-center space-y-1.5"
                        >
                          <Upload className="w-8 h-8 text-primary/70" />
                          <span className="text-xs sm:text-sm font-semibold text-foreground">
                            {pdfFile ? pdfFile.name : "Click to select PDF document"}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            Maximum file size 10MB • Formatted PDF
                          </span>
                        </label>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={requesting}
                      className="w-full text-xs sm:text-sm font-semibold h-10 shadow-xs mt-2"
                    >
                      {requesting ? "Submitting Paper..." : "Submit for Academic Review"}
                      <Send className="w-4 h-4 ml-2" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 4: My Submissions */}
            <TabsContent value="my-submissions" className="space-y-4 pt-1">
              {filteredMySubmissions.length === 0 ? (
                <Card className="border-dashed border-border/80">
                  <CardContent className="py-12">
                    <EmptyState
                      icon={FileText}
                      title={query ? "No Matching Submissions" : "No Submissions Yet"}
                      description={
                        query
                          ? `No submissions matching "${query}".`
                          : "You haven't submitted any research papers. Use the 'Submit Paper' tab to get started!"
                      }
                    />
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {filteredMySubmissions.map((paper) => (
                    <Card
                      key={paper.id}
                      className="flex flex-col justify-between border-border/80 hover:border-primary/40 hover:shadow-md transition-all duration-200"
                    >
                      <CardContent className="p-4 sm:p-5 space-y-3 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <Badge
                            className={
                              paper.status?.toLowerCase() === "published" || paper.status?.toLowerCase() === "accepted"
                                ? "bg-primary text-primary-foreground text-[10px] font-bold"
                                : paper.status?.toLowerCase() === "rejected"
                                ? "bg-destructive text-destructive-foreground text-[10px] font-bold"
                                : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-bold"
                            }
                          >
                            {paper.status || "Pending"}
                          </Badge>

                          {paper.department && (
                            <Badge variant="outline" className="text-[10px] truncate max-w-[130px]">
                              {paper.department}
                            </Badge>
                          )}
                        </div>

                        <div>
                          <h3 className="text-base font-bold text-foreground line-clamp-2">
                            {paper.title}
                          </h3>
                          {paper.subject && (
                            <p className="text-xs font-semibold text-primary mt-0.5">
                              Domain: {paper.subject}
                            </p>
                          )}
                        </div>

                        <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                          {paper.overview || "Your submitted research paper."}
                        </p>

                        {paper.professorFeedback && (
                          <div className="p-2.5 bg-muted/40 rounded-lg text-xs border border-border/60">
                            <span className="font-semibold text-foreground">Professor Feedback: </span>
                            <span className="text-muted-foreground">{paper.professorFeedback}</span>
                          </div>
                        )}

                        <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1 font-medium text-foreground">
                            <Clock className="w-3.5 h-3.5 text-primary" />
                            Submitted:
                          </span>
                          {paper.createdAt && (
                            <span className="text-[11px]">
                              {new Date(paper.createdAt).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          )}
                        </div>
                      </CardContent>

                      <div className="p-3 sm:p-4 pt-0 flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setViewPaper(paper)}
                          className="flex-1 text-xs font-semibold h-9"
                        >
                          <FileText className="w-3.5 h-3.5 mr-1.5" />
                          View Abstract
                        </Button>

                        {paper.pdfUrl && (
                          <Button
                            size="sm"
                            disabled={requesting}
                            onClick={() => handleDownloadPdf(paper.pdfUrl, paper.title)}
                            className="text-xs font-semibold h-9 px-3 gap-1"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">PDF</span>
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* CONFIRMATION DIALOG */}
          <Dialog open={confirmSubmit} onOpenChange={setConfirmSubmit}>
            <DialogContent className="max-w-md w-full">
              <DialogHeader>
                <DialogTitle>Confirm Submission</DialogTitle>
                <DialogDescription>
                  Are you sure you want to submit &ldquo;{formData.title || "this research paper"}&rdquo;?
                  Once submitted, it will be assigned to a professor for evaluation.
                </DialogDescription>
              </DialogHeader>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  disabled={requesting}
                  variant="outline"
                  onClick={() => setConfirmSubmit(false)}
                >
                  Cancel
                </Button>
                <Button disabled={requesting} onClick={handleConfirmSubmit}>
                  {requesting ? "Submitting..." : "Confirm & Submit"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Paper Detail Dialog */}
          <Dialog
            open={!!viewPaper}
            onOpenChange={(open) => !open && setViewPaper(null)}
          >
            <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl p-4 sm:p-6">
              <DialogHeader>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge
                      className={
                        viewPaper?.isGlobal
                          ? "bg-purple-600 text-white text-[10px]"
                          : "bg-primary text-primary-foreground text-[10px]"
                      }
                    >
                      {viewPaper?.isGlobal ? "Global Research Paper" : "Campus Research Paper"}
                    </Badge>
                    {viewPaper?.department && (
                      <Badge variant="outline" className="text-[10px]">
                        {viewPaper.department}
                      </Badge>
                    )}
                  </div>
                  <DialogTitle className="text-lg sm:text-xl font-bold text-foreground">
                    {viewPaper?.title}
                  </DialogTitle>
                  {viewPaper?.subject && (
                    <DialogDescription className="text-xs sm:text-sm text-primary font-medium">
                      Domain / Field: {viewPaper.subject}
                    </DialogDescription>
                  )}
                </div>
              </DialogHeader>

              <div className="space-y-4 pt-2">
                <div className="text-xs text-muted-foreground flex items-center justify-between border-b border-border/60 pb-2">
                  <span>
                    Author:{" "}
                    <strong>
                      {viewPaper?.studentName ||
                        (viewPaper?.professorName
                          ? `Prof. ${viewPaper.professorName}`
                          : "Student Researcher")}
                    </strong>
                  </span>
                  <span>
                    Published:{" "}
                    {viewPaper?.createdAt
                      ? new Date(viewPaper.createdAt).toLocaleDateString()
                      : "Recently"}
                  </span>
                </div>

                {viewPaper?.collegeName && (
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>Institution: {viewPaper.collegeName}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Abstract & Methodology
                  </h4>
                  <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                    {viewPaper?.overview || "No abstract provided."}
                  </p>
                </div>

                {viewPaper?.professorFeedback && (
                  <div className="p-3 bg-muted/40 rounded-xl text-xs border border-border/60 space-y-1">
                    <span className="font-bold text-foreground">Professor Evaluation & Feedback:</span>
                    <p className="text-muted-foreground">{viewPaper.professorFeedback}</p>
                  </div>
                )}

                <div className="pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
                    <ThumbsUp className="w-3.5 h-3.5 text-primary" />
                    <span>{viewPaper?.upvotesCount || 0} Upvotes</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {viewPaper?.pdfUrl && (
                      <Button
                        size="sm"
                        disabled={requesting}
                        onClick={() => handleDownloadPdf(viewPaper.pdfUrl, viewPaper.title)}
                        className="text-xs font-semibold h-9 gap-1.5 shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download PDF
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewPaper(null)}
                      className="text-xs h-9"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ResearchPage;
