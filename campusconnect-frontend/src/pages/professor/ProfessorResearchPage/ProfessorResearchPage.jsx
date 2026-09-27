import "./ProfessorResearchPage.css";
import React, { useState, useEffect } from "react";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import { Card, CardContent } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Input } from "../../../components/ui/Input";
import { Textarea } from "../../../components/ui/Textarea";
import { Label } from "../../../components/ui/Label";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../../components/ui/Tabs";
import {
  GraduationCap,
  Globe,
  Upload,
  Search,
  ThumbsUp,
  FileText,
  Building2,
  User,
  ExternalLink,
  Send,
  CheckCircle2,
  Clock,
  Sparkles,
  Share2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../../components/ui/Dialog";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import { professorNavItems } from "../../../config/Navigation";
import { useAuth } from "../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import EmptyState from "../../../components/ui/EmptyState";
import PageSkeleton from "../../../components/ui/PageSkeleton";
import { professorApi } from "../../../services/api";
import { toast } from "../../../hooks/use-toast";

const navItems = professorNavItems;

export default function ProfessorResearchPage() {
  const navigate = useNavigate();
  const { routeProtection } = useAuth();

  const [activeTab, setActiveTab] = useState("campus");
  const [campusPapers, setCampusPapers] = useState([]);
  const [globalPapers, setGlobalPapers] = useState([]);
  const [myPapers, setMyPapers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Submission Form State
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    dept: "",
    overview: "",
  });
  const [pdfFile, setPdfFile] = useState(null);

  // Global Syndication Request Confirmation
  const [globalRequestPaper, setGlobalRequestPaper] = useState(null);
  const [confirmingGlobal, setConfirmingGlobal] = useState(false);

  // View Paper Modal
  const [selectedPaper, setSelectedPaper] = useState(null);

  useEffect(() => {
    if (!routeProtection("PROFESSOR")) {
      navigate("/auth");
      return;
    }
    loadResearchData();
  }, [navigate, routeProtection]);

  const loadResearchData = async () => {
    setLoading(true);
    try {
      const [campusRes, globalRes, myRes] = await Promise.allSettled([
        professorApi.getCampusResearches(),
        professorApi.getGlobalResearches(),
        professorApi.getMyResearches(),
      ]);

      if (campusRes.status === "fulfilled" && Array.isArray(campusRes.value)) {
        setCampusPapers(campusRes.value);
      }
      if (globalRes.status === "fulfilled" && Array.isArray(globalRes.value)) {
        setGlobalPapers(globalRes.value);
      }
      if (myRes.status === "fulfilled" && Array.isArray(myRes.value)) {
        setMyPapers(myRes.value);
      }
    } catch (err) {
      console.error("Error loading research data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async (paper) => {
    const isGlobal = activeTab === "global";
    const prevUpvoted = paper.isUpvoted;
    const prevCount = paper.upvotesCount || 0;

    const updater = (list) =>
      list.map((p) =>
        p.id === paper.id
          ? {
              ...p,
              isUpvoted: !prevUpvoted,
              upvotesCount: prevUpvoted ? Math.max(0, prevCount - 1) : prevCount + 1,
            }
          : p
      );

    if (isGlobal) {
      setGlobalPapers((prev) => updater(prev));
    } else {
      setCampusPapers((prev) => updater(prev));
    }

    try {
      if (isGlobal) {
        await professorApi.upvoteGlobalResearch(paper.id);
      } else {
        await professorApi.upvoteCampusResearch(paper.id);
      }
    } catch (err) {
      console.error("Error upvoting paper:", err);
      // Revert
      const reverter = (list) =>
        list.map((p) =>
          p.id === paper.id
            ? {
                ...p,
                isUpvoted: prevUpvoted,
                upvotesCount: prevCount,
              }
            : p
        );
      if (isGlobal) {
        setGlobalPapers((prev) => reverter(prev));
      } else {
        setCampusPapers((prev) => reverter(prev));
      }
      toast({
        title: "Upvote failed",
        description: "Unable to record upvote. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubmitPaper = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.subject.trim() || !formData.dept.trim()) {
      toast({
        title: "Incomplete fields",
        description: "Please enter the title, subject domain, and department.",
        variant: "destructive",
      });
      return;
    }
    if (!formData.overview.trim()) {
      toast({
        title: "Abstract required",
        description: "Please provide a research overview or abstract.",
        variant: "destructive",
      });
      return;
    }
    if (!pdfFile) {
      toast({
        title: "PDF required",
        description: "Please select a PDF document of your research paper.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const data = new FormData();
      data.append("title", formData.title.trim());
      data.append("subject", formData.subject.trim());
      data.append("dept", formData.dept.trim());
      data.append("overview", formData.overview.trim());
      data.append("pdf", pdfFile);

      await professorApi.submitResearchPaper(data);
      toast({
        title: "Research Paper Published!",
        description: "Your paper has been directly published within the college research repository.",
      });

      // Reset form
      setFormData({ title: "", subject: "", dept: "", overview: "" });
      setPdfFile(null);
      // Refresh my papers & campus papers
      const [campusRes, myRes] = await Promise.allSettled([
        professorApi.getCampusResearches(),
        professorApi.getMyResearches(),
      ]);
      if (campusRes.status === "fulfilled" && Array.isArray(campusRes.value)) {
        setCampusPapers(campusRes.value);
      }
      if (myRes.status === "fulfilled" && Array.isArray(myRes.value)) {
        setMyPapers(myRes.value);
      }
    } catch (err) {
      console.error("Error submitting paper:", err);
      toast({
        title: "Submission failed",
        description: err.message || "Failed to publish research paper.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleApplyGlobalConfirm = async () => {
    if (!globalRequestPaper) return;
    setConfirmingGlobal(true);
    try {
      await professorApi.requestGlobalResearch(globalRequestPaper.id);
      toast({
        title: "Global Syndication Requested",
        description: "Your request has been submitted to the college administration for global review.",
      });
      setGlobalRequestPaper(null);
      // Refresh my papers
      const myRes = await professorApi.getMyResearches();
      if (Array.isArray(myRes)) {
        setMyPapers(myRes);
      }
    } catch (err) {
      console.error("Error requesting global syndication:", err);
      toast({
        title: "Request failed",
        description: err.message || "Could not submit global syndication request.",
        variant: "destructive",
      });
    } finally {
      setConfirmingGlobal(false);
    }
  };

  const getActiveList = () => {
    if (activeTab === "campus") return campusPapers;
    if (activeTab === "global") return globalPapers;
    return myPapers;
  };

  const filteredPapers = getActiveList().filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      (p.title && p.title.toLowerCase().includes(term)) ||
      (p.subject && p.subject.toLowerCase().includes(term)) ||
      (p.department && p.department.toLowerCase().includes(term)) ||
      (p.overview && p.overview.toLowerCase().includes(term)) ||
      (p.studentName && p.studentName.toLowerCase().includes(term)) ||
      (p.professorName && p.professorName.toLowerCase().includes(term)) ||
      (p.collegeName && p.collegeName.toLowerCase().includes(term))
    );
  });

  if (loading) {
    return (
      <DashboardLayout navItems={navItems} title="Research">
        <PageSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={navItems} title="Research">
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
              Explore college research, cross-institutional academic papers, or directly publish your own work
            </p>
          </div>

          {activeTab !== "submit" && (
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
              className="text-xs sm:text-sm font-semibold rounded-lg px-2.5 sm:px-3.5 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs flex items-center justify-center"
            >
              <span>Campus</span>
            </TabsTrigger>
            <TabsTrigger
              value="global"
              className="text-xs sm:text-sm font-semibold rounded-lg px-2.5 sm:px-3.5 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs flex items-center justify-center"
            >
              <span>Global</span>
            </TabsTrigger>
            <TabsTrigger
              value="submit"
              className="text-xs sm:text-sm font-semibold rounded-lg px-2.5 sm:px-3.5 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs flex items-center justify-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Submit Paper</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Campus Papers */}
          <TabsContent value="campus" className="space-y-4 pt-1">
            {filteredPapers.length === 0 ? (
              <Card className="border-dashed border-border/80">
                <CardContent className="py-12">
                  <EmptyState
                    icon={GraduationCap}
                    title={searchTerm ? "No Matching Research Papers" : "No Campus Papers Published"}
                    description={
                      searchTerm
                        ? `No research papers matching "${searchTerm}".`
                        : "There are currently no research papers published within your college."
                    }
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {filteredPapers.map((paper) => (
                  <Card
                    key={paper.id}
                    className="flex flex-col justify-between border-border/80 hover:border-primary/40 hover:shadow-md transition-all duration-200"
                  >
                    <CardContent className="p-4 sm:p-5 space-y-3 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        {paper.isGlobal ? (
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
                                : "Faculty Paper")}
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
                      </div>
                    </CardContent>

                    <div className="p-3 sm:p-4 pt-0 flex items-center gap-2">
                      <Button
                        variant={paper.isUpvoted ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleUpvote(paper)}
                        className={`text-xs h-9 px-3 gap-1.5 font-semibold ${
                          paper.isUpvoted
                            ? "bg-primary text-primary-foreground"
                            : "hover:text-primary hover:border-primary/40"
                        }`}
                      >
                        <ThumbsUp
                          className={`w-3.5 h-3.5 ${
                            paper.isUpvoted ? "fill-current" : ""
                          }`}
                        />
                        <span>{paper.upvotesCount || 0}</span>
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedPaper(paper)}
                        className="flex-1 text-xs font-semibold h-9"
                      >
                        <FileText className="w-3.5 h-3.5 mr-1.5" />
                        View Abstract
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Tab 2: Global Papers */}
          <TabsContent value="global" className="space-y-4 pt-1">
            {filteredPapers.length === 0 ? (
              <Card className="border-dashed border-border/80">
                <CardContent className="py-12">
                  <EmptyState
                    icon={Globe}
                    title={searchTerm ? "No Matching Global Papers" : "No Global Research Published"}
                    description={
                      searchTerm
                        ? `No global papers matching "${searchTerm}".`
                        : "No cross-institution papers have been globally published yet."
                    }
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {filteredPapers.map((paper) => (
                  <Card
                    key={paper.id}
                    className="flex flex-col justify-between border-border/80 hover:border-primary/40 hover:shadow-md transition-all duration-200"
                  >
                    <CardContent className="p-4 sm:p-5 space-y-3 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <Badge className="bg-purple-600 text-white text-[10px] font-bold">
                          Global Edition
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
                        {paper.overview || "Scholarly research paper in global repository."}
                      </p>

                      <div className="pt-2 border-t border-border/60 space-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1 font-medium text-foreground">
                            <User className="w-3.5 h-3.5 text-primary" />
                            {paper.studentName ||
                              (paper.professorName
                                ? `Prof. ${paper.professorName}`
                                : "Author")}
                          </span>
                        </div>
                        {paper.collegeName && (
                          <div className="flex items-center gap-1 text-[11px] text-muted-foreground truncate">
                            <Building2 className="w-3 h-3 text-primary shrink-0" />
                            <span className="truncate">{paper.collegeName}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>

                    <div className="p-3 sm:p-4 pt-0 flex items-center gap-2">
                      <Button
                        variant={paper.isUpvoted ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleUpvote(paper)}
                        className={`text-xs h-9 px-3 gap-1.5 font-semibold ${
                          paper.isUpvoted
                            ? "bg-primary text-primary-foreground"
                            : "hover:text-primary hover:border-primary/40"
                        }`}
                      >
                        <ThumbsUp
                          className={`w-3.5 h-3.5 ${
                            paper.isUpvoted ? "fill-current" : ""
                          }`}
                        />
                        <span>{paper.upvotesCount || 0}</span>
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedPaper(paper)}
                        className="flex-1 text-xs font-semibold h-9"
                      >
                        <FileText className="w-3.5 h-3.5 mr-1.5" />
                        View Abstract
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Tab 3: Submit my Research paper */}
          <TabsContent value="submit" className="space-y-8 pt-1">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Submission Form */}
              <Card className="lg:col-span-7 border-border/80 shadow-xs">
                <CardContent className="p-5 sm:p-7 space-y-5">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
                      <Sparkles className="w-3.5 h-3.5" />
                      Direct Faculty Publication
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-foreground">
                      Submit Research Manuscript
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      As a faculty member, your paper is directly published within your college immediately upon submission. You can apply for global syndication anytime.
                    </p>
                  </div>

                  <form onSubmit={handleSubmitPaper} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="title" className="text-xs font-bold text-foreground">
                        Paper Title *
                      </Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g. Advancements in Distributed Consensus Architectures"
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
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          placeholder="e.g. Distributed Systems / AI"
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
                          value={formData.dept}
                          onChange={(e) => setFormData({ ...formData, dept: e.target.value })}
                          placeholder="e.g. Computer Science & Eng."
                          className="h-9 text-xs sm:text-sm"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="overview" className="text-xs font-bold text-foreground">
                        Abstract / Overview *
                      </Label>
                      <Textarea
                        id="overview"
                        rows={4}
                        value={formData.overview}
                        onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
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
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setPdfFile(e.target.files[0]);
                            }
                          }}
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
                            Maximum file size 5MB • Formatted PDF
                          </span>
                        </label>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={submitting}
                      className="w-full text-xs sm:text-sm font-semibold h-10 shadow-xs mt-2"
                    >
                      {submitting ? "Publishing Paper..." : "Publish to College Repository"}
                      <Send className="w-4 h-4 ml-2" />
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* My Authored Papers Section */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-primary" />
                    <h3 className="text-base font-bold text-foreground">
                      My Authored Papers
                    </h3>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Faculty Archive
                  </Badge>
                </div>

                {myPapers.length === 0 ? (
                  <Card className="border-dashed border-border/80">
                    <CardContent className="py-10">
                      <EmptyState
                        icon={GraduationCap}
                        title="No Authored Papers Yet"
                        description="Research papers you submit will appear here with global publishing status and syndication request options."
                      />
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                    {myPapers.map((paper) => {
                      const isGlobalPublished =
                        paper.isGlobal || paper.status === "GLOBALLY_PUBLISHED";
                      const isGlobalRequested =
                        paper.status === "GLOBALIZATION_REQUESTED";

                      return (
                        <Card key={paper.id} className="border-border/80">
                          <CardContent className="p-4 space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="text-sm font-bold text-foreground line-clamp-2">
                                {paper.title}
                              </h4>
                              {isGlobalPublished ? (
                                <Badge className="bg-purple-600 text-white text-[10px] shrink-0 font-bold">
                                  Globally Published
                                </Badge>
                              ) : isGlobalRequested ? (
                                <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px] shrink-0 font-bold">
                                  Global Requested
                                </Badge>
                              ) : (
                                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] shrink-0 font-bold">
                                  Campus Published
                                </Badge>
                              )}
                            </div>

                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {paper.overview}
                            </p>

                            <div className="pt-2 border-t border-border/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                              <span className="text-muted-foreground text-[11px]">
                                {paper.createdAt
                                  ? new Date(paper.createdAt).toLocaleDateString()
                                  : "Recently"}
                              </span>

                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedPaper(paper)}
                                  className="h-8 text-xs px-2.5"
                                >
                                  View Details
                                </Button>

                                {/* Apply for Global Button */}
                                {!isGlobalPublished && !isGlobalRequested && (
                                  <Button
                                    size="sm"
                                    onClick={() => setGlobalRequestPaper(paper)}
                                    className="h-8 text-xs font-semibold px-2.5 shadow-xs"
                                  >
                                    <Globe className="w-3.5 h-3.5 mr-1" />
                                    Apply for Global
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Paper Detail Dialog */}
        <Dialog
          open={!!selectedPaper}
          onOpenChange={(open) => !open && setSelectedPaper(null)}
        >
          <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl p-4 sm:p-6">
            <DialogHeader>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge
                    className={
                      selectedPaper?.isGlobal
                        ? "bg-purple-600 text-white text-[10px]"
                        : "bg-primary text-primary-foreground text-[10px]"
                    }
                  >
                    {selectedPaper?.isGlobal ? "Global Research Paper" : "Campus Research Paper"}
                  </Badge>
                  {selectedPaper?.department && (
                    <Badge variant="outline" className="text-[10px]">
                      {selectedPaper.department}
                    </Badge>
                  )}
                </div>
                <DialogTitle className="text-lg sm:text-xl font-bold text-foreground">
                  {selectedPaper?.title}
                </DialogTitle>
                {selectedPaper?.subject && (
                  <DialogDescription className="text-xs sm:text-sm text-primary font-medium">
                    Domain / Field: {selectedPaper.subject}
                  </DialogDescription>
                )}
              </div>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              <div className="text-xs text-muted-foreground flex items-center justify-between border-b border-border/60 pb-2">
                <span>
                  Author:{" "}
                  <strong>
                    {selectedPaper?.studentName ||
                      (selectedPaper?.professorName
                        ? `Prof. ${selectedPaper.professorName}`
                        : "Faculty Paper")}
                  </strong>
                </span>
                {selectedPaper?.createdAt && (
                  <span>
                    Published on {new Date(selectedPaper.createdAt).toLocaleDateString()}
                  </span>
                )}
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Abstract & Overview
                </h4>
                <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                  {selectedPaper?.overview || "No extended abstract provided."}
                </p>
              </div>

              {selectedPaper?.professorFeedback && (
                <div className="p-3 rounded-xl bg-accent/30 border border-border/60 space-y-1">
                  <h5 className="text-xs font-bold text-foreground">
                    Peer Review Feedback:
                  </h5>
                  <p className="text-xs text-muted-foreground italic">
                    "{selectedPaper.professorFeedback}"
                  </p>
                </div>
              )}

              {selectedPaper?.pdfUrl && (
                <div className="pt-2">
                  <Button
                    onClick={() => window.open(selectedPaper.pdfUrl, "_blank")}
                    size="sm"
                    className="w-full text-xs font-semibold h-9 shadow-xs"
                  >
                    <ExternalLink className="w-4 h-4 mr-1.5" />
                    Open Full PDF Document
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Apply for Global Confirmation Dialog */}
        <ConfirmDialog
          open={!!globalRequestPaper}
          onOpenChange={(open) => !open && setGlobalRequestPaper(null)}
          title="Apply for Global Publication?"
          description={`Are you sure you want to request global syndication for "${globalRequestPaper?.title}"? Once submitted, college administration will evaluate your paper for publication across all participating institutions.`}
          confirmText="Apply for Global"
          variant="default"
          icon={Globe}
          loading={confirmingGlobal}
          onConfirm={handleApplyGlobalConfirm}
        />
      </div>
    </DashboardLayout>
  );
}
