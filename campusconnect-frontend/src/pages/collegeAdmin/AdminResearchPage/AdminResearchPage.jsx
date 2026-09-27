import "./AdminResearchPage.css";
import { useEffect, useState, useMemo } from "react";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import { Card, CardContent } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Input } from "../../../components/ui/Input";
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
  DialogFooter,
} from "../../../components/ui/Dialog";
import {
  Search,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  Download,
  UserCheck,
  Globe,
  FileText,
  Send,
  Building2,
  GraduationCap,
  ThumbsUp,
  ExternalLink,
} from "lucide-react";
import { collegeAdminNavItems } from "../../../config/Navigation";
import { toast } from "../../../hooks/use-toast";
import { useAuth } from "../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import EmptyState from "../../../components/ui/EmptyState";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import { collegeAdminApi } from "../../../services/api";

export default function AdminResearchPage() {
  const navigate = useNavigate();
  const { routeProtection } = useAuth();

  // Data states
  const [notReviewedPapers, setNotReviewedPapers] = useState([]);
  const [campusPapers, setCampusPapers] = useState([]);
  const [globalPapers, setGlobalPapers] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [professors, setProfessors] = useState([]);

  // Confirmation dialog
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    description: "",
    confirmText: "",
    variant: "destructive",
    onConfirm: null,
  });

  // Modals & UI states
  const [viewPaper, setViewPaper] = useState(null);
  const [assignPaper, setAssignPaper] = useState(null);
  const [selectedProfessor, setSelectedProfessor] = useState("");
  const [query, setQuery] = useState("");
  const [requesting, setRequesting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!routeProtection("COLLEGE_ADMIN")) {
      navigate("/auth");
    }
  }, [navigate, routeProtection]);

  const fetchNotReviewed = async () => {
    try {
      const data = await collegeAdminApi.getNotReviewedResearches();
      setNotReviewedPapers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch unreviewed papers:", err);
    }
  };

  const fetchCampusPapers = async () => {
    try {
      const data = await collegeAdminApi.getCampusResearches();
      setCampusPapers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch campus research papers:", err);
    }
  };

  const fetchGlobalPapers = async () => {
    try {
      const data = await collegeAdminApi.getGlobalResearches();
      setGlobalPapers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch global research papers:", err);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const data = await collegeAdminApi.getGlobalResearchRequests();
      setPendingRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch research globalization requests:", err);
    }
  };

  const fetchProfessors = async () => {
    try {
      const data = await collegeAdminApi.getAllProfessors();
      setProfessors(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch professors:", err);
    }
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchNotReviewed(),
        fetchCampusPapers(),
        fetchGlobalPapers(),
        fetchPendingRequests(),
        fetchProfessors(),
      ]);
    } catch (err) {
      console.error("Error loading research data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  // Assign professor to unreviewed paper
  const handleAssignProfessor = async () => {
    if (!assignPaper || !selectedProfessor) {
      toast({
        title: "Selection Required",
        description: "Please select a professor to assign this paper.",
        variant: "destructive",
      });
      return;
    }

    setRequesting(true);
    try {
      const data = await collegeAdminApi.assignProfessor(
        assignPaper.id,
        Number(selectedProfessor)
      );
      toast({
        title: "Professor Assigned",
        description:
          data.message || "Research paper has been routed for faculty review.",
        variant: "success",
      });
      setAssignPaper(null);
      setSelectedProfessor("");
      await Promise.all([fetchNotReviewed(), fetchCampusPapers()]);
    } catch (err) {
      toast({
        title: "Assignment Failed",
        description: err.message || "Failed to assign professor.",
        variant: "destructive",
      });
    } finally {
      setRequesting(false);
    }
  };

  // Approve globalization request
  const handleApproveGlobal = async (researchId) => {
    setRequesting(true);
    try {
      const data = await collegeAdminApi.approveGlobalResearch(researchId);
      toast({
        title: "Published Globally",
        description:
          data.message || "Research paper is now published globally.",
        variant: "success",
      });
      setViewPaper(null);
      await Promise.all([
        fetchPendingRequests(),
        fetchGlobalPapers(),
        fetchCampusPapers(),
      ]);
    } catch (err) {
      toast({
        title: "Approval Failed",
        description: err.message || "Failed to approve global publication.",
        variant: "destructive",
      });
    } finally {
      setRequesting(false);
    }
  };

  // Reject globalization request
  const handleRejectGlobal = async (researchId) => {
    setRequesting(true);
    try {
      const data = await collegeAdminApi.rejectGlobalResearch(researchId);
      toast({
        title: "Request Rejected",
        description: data.message || "Globalization request rejected.",
        variant: "default",
      });
      setViewPaper(null);
      await Promise.all([fetchPendingRequests(), fetchCampusPapers()]);
    } catch (err) {
      toast({
        title: "Action Failed",
        description: err.message || "Failed to reject global request.",
        variant: "destructive",
      });
    } finally {
      setRequesting(false);
    }
  };

  // Request globalization for campus paper
  const handleRequestGlobalize = async (researchId) => {
    setRequesting(true);
    try {
      const data = await collegeAdminApi.requestGlobalResearch(researchId);
      toast({
        title: "Globalization Requested",
        description:
          data.message || "Submitted for global publication review.",
        variant: "success",
      });
      await Promise.all([fetchCampusPapers(), fetchPendingRequests()]);
    } catch (err) {
      toast({
        title: "Request Failed",
        description: err.message || "Failed to submit globalization request.",
        variant: "destructive",
      });
    } finally {
      setRequesting(false);
    }
  };

  const promptApproveGlobal = (paper) => {
    setConfirmDialog({
      open: true,
      title: "Publish Research Globally",
      description: `Approve and syndicate "${paper.title}" to the global inter-college research repository? It will be accessible across all participating institutions.`,
      confirmText: "Publish Globally",
      variant: "success",
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, open: false }));
        await handleApproveGlobal(paper.id);
      },
    });
  };

  const promptRejectGlobal = (paper) => {
    setConfirmDialog({
      open: true,
      title: "Reject Globalization Request",
      description: `Reject the global publication request for "${paper.title}"? The paper will remain listed under your campus research only.`,
      confirmText: "Reject Request",
      variant: "destructive",
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, open: false }));
        await handleRejectGlobal(paper.id);
      },
    });
  };

  const promptRequestGlobalize = (paper) => {
    setConfirmDialog({
      open: true,
      title: "Submit for Global Research",
      description: `Submit "${paper.title}" for review to be published across all participating institutions?`,
      confirmText: "Submit Request",
      variant: "default",
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, open: false }));
        await handleRequestGlobalize(paper.id);
      },
    });
  };

  // Filtered queries
  const filteredNotReviewed = useMemo(() => {
    return notReviewedPapers.filter(
      (p) =>
        (p.title || "").toLowerCase().includes(query.toLowerCase()) ||
        (p.studentName || "").toLowerCase().includes(query.toLowerCase()) ||
        (p.department || "").toLowerCase().includes(query.toLowerCase()) ||
        (p.subject || "").toLowerCase().includes(query.toLowerCase())
    );
  }, [notReviewedPapers, query]);

  const filteredCampus = useMemo(() => {
    return campusPapers.filter(
      (p) =>
        (p.title || "").toLowerCase().includes(query.toLowerCase()) ||
        (p.studentName || "").toLowerCase().includes(query.toLowerCase()) ||
        (p.department || "").toLowerCase().includes(query.toLowerCase()) ||
        (p.professorName || "").toLowerCase().includes(query.toLowerCase())
    );
  }, [campusPapers, query]);

  const filteredGlobal = useMemo(() => {
    return globalPapers.filter(
      (p) =>
        (p.title || "").toLowerCase().includes(query.toLowerCase()) ||
        (p.collegeName || "").toLowerCase().includes(query.toLowerCase()) ||
        (p.studentName || "").toLowerCase().includes(query.toLowerCase()) ||
        (p.department || "").toLowerCase().includes(query.toLowerCase())
    );
  }, [globalPapers, query]);

  const filteredPending = useMemo(() => {
    return pendingRequests.filter(
      (p) =>
        (p.title || "").toLowerCase().includes(query.toLowerCase()) ||
        (p.studentName || "").toLowerCase().includes(query.toLowerCase()) ||
        (p.collegeName || "").toLowerCase().includes(query.toLowerCase())
    );
  }, [pendingRequests, query]);

  // Tailored Skeleton
  if (loading) {
    return (
      <DashboardLayout navItems={collegeAdminNavItems} title="Research Management">
        <div className="space-y-6 animate-pulse">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-2">
              <div className="h-6 w-48 bg-muted rounded" />
              <div className="h-3.5 w-64 bg-muted/60 rounded" />
            </div>
            <div className="h-9 w-full sm:w-64 bg-muted rounded-lg" />
          </div>
          <div className="w-full grid grid-cols-2 sm:inline-flex sm:w-auto gap-1 p-1 bg-muted/30 border border-border/40 rounded-xl">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-8 sm:w-28 bg-muted rounded-lg" />
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-border/60 bg-card/60 p-5 space-y-3"
              >
                <div className="flex justify-between">
                  <div className="h-4 w-24 bg-muted rounded" />
                  <div className="h-4 w-16 bg-muted rounded" />
                </div>
                <div className="h-5 w-4/5 bg-muted rounded" />
                <div className="h-3 w-full bg-muted/60 rounded" />
                <div className="h-8 w-full bg-muted/70 rounded-lg pt-2" />
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={collegeAdminNavItems} title="Research Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Research Publications
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Assign faculty reviewers, oversee campus academic outputs, and process globalization requests.
            </p>
          </div>

          <div className="relative w-full sm:w-64 md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search papers, authors, subjects..."
              className="pl-9 text-xs sm:text-sm h-9 bg-card/80 border-border/70"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {/* 4 SUB TABS IN EXACT SPECIFIED ORDER:
            1. Not Reviewed (1st)
            2. Campus
            3. Global
            4. Pending Approval */}
        <Tabs defaultValue="not-reviewed" className="space-y-6">
          <div className="w-full">
            <TabsList className="w-full grid grid-cols-2 sm:inline-flex sm:w-auto p-1 bg-muted/60 dark:bg-muted/40 border border-border/60 rounded-xl gap-1.5 sm:gap-1">
              <TabsTrigger
                value="not-reviewed"
                className="text-xs sm:text-sm py-2 sm:py-1.5 px-3 rounded-lg justify-center font-medium w-full"
              >
                Not Reviewed
              </TabsTrigger>
              <TabsTrigger
                value="campus"
                className="text-xs sm:text-sm py-2 sm:py-1.5 px-3 rounded-lg justify-center font-medium w-full"
              >
                Campus
              </TabsTrigger>
              <TabsTrigger
                value="global"
                className="text-xs sm:text-sm py-2 sm:py-1.5 px-3 rounded-lg justify-center font-medium w-full"
              >
                Global
              </TabsTrigger>
              <TabsTrigger
                value="pending"
                className="text-xs sm:text-sm py-2 sm:py-1.5 px-3 rounded-lg justify-center font-medium w-full"
              >
                Pending Approval
              </TabsTrigger>
            </TabsList>
          </div>

          {/* TAB 1: NOT REVIEWED (1ST TAB - UNASSIGNED STUDENT PAPERS) */}
          <TabsContent value="not-reviewed" className="space-y-4">
            {filteredNotReviewed.length === 0 ? (
              <Card className="border-border/70 bg-card/60">
                <CardContent className="p-8">
                  <EmptyState
                    icon={<CheckCircle2 className="w-8 h-8 text-muted-foreground" />}
                    title="No Unassigned Papers"
                    desc="All student research papers have been routed to faculty professors for review."
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredNotReviewed.map((paper) => (
                  <Card
                    key={paper.id}
                    className="border-border/70 bg-card/70 backdrop-blur-xs hover:border-border hover:shadow-xs transition-all flex flex-col justify-between"
                  >
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <Badge
                          variant="outline"
                          className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/20"
                        >
                          Awaiting Reviewer
                        </Badge>
                        {paper.createdAt && (
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(paper.createdAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-sm sm:text-base text-foreground line-clamp-2 leading-snug">
                        {paper.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        {paper.department && (
                          <Badge variant="secondary" className="text-[10px] py-0">
                            {paper.department}
                          </Badge>
                        )}
                        {paper.subject && (
                          <Badge variant="outline" className="text-[10px] py-0">
                            {paper.subject}
                          </Badge>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                        {paper.overview}
                      </p>

                      <div className="bg-muted/50 p-2.5 rounded-xl text-xs mt-3 border border-border/50">
                        <p className="font-semibold text-foreground">
                          Author:{" "}
                          <span className="font-normal text-muted-foreground">
                            {paper.studentName}
                          </span>
                        </p>
                      </div>
                    </CardContent>

                    <div className="p-4 sm:p-5 pt-0 flex gap-2 border-t border-border/50 pt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-8 border-border/80"
                        onClick={() => setViewPaper(paper)}
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        Abstract
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 text-xs h-8 shadow-xs"
                        onClick={() => {
                          setAssignPaper(paper);
                          setSelectedProfessor(
                            professors.length > 0 ? String(professors[0].id) : ""
                          );
                        }}
                      >
                        <UserCheck className="w-3.5 h-3.5 mr-1.5" />
                        Assign Reviewer
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* TAB 2: CAMPUS (2ND TAB) */}
          <TabsContent value="campus" className="space-y-4">
            {filteredCampus.length === 0 ? (
              <Card className="border-border/70 bg-card/60">
                <CardContent className="p-8">
                  <EmptyState
                    icon={<FileText className="w-8 h-8 text-muted-foreground" />}
                    title="No Campus Research"
                    desc="No approved academic papers published in this institution yet."
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredCampus.map((paper) => {
                  const isGlobal =
                    paper.isGlobal ||
                    paper.status === "GLOBALLY_PUBLISHED";
                  const isPendingGlobal =
                    paper.status === "GLOBALIZATION_REQUESTED";

                  return (
                    <Card
                      key={paper.id}
                      className="border-border/70 bg-card/70 backdrop-blur-xs hover:border-border hover:shadow-xs transition-all flex flex-col justify-between"
                    >
                      <CardContent className="p-4 sm:p-5">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          {/* Campus vs Global Badges */}
                          {isGlobal ? (
                            <Badge className="text-[10px] bg-indigo-500/10 text-indigo-600 border-indigo-500/20">
                              <Globe className="w-3 h-3 mr-1" />
                              Globally Published
                            </Badge>
                          ) : isPendingGlobal ? (
                            <Badge className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/20">
                              Global Requested
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-[10px] border-emerald-500/30 text-emerald-600 bg-emerald-500/10"
                            >
                              Campus Published
                            </Badge>
                          )}

                          {paper.createdAt && (
                            <span className="text-[11px] text-muted-foreground">
                              {new Date(paper.createdAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>

                        <h3 className="font-bold text-sm sm:text-base text-foreground line-clamp-2 leading-snug">
                          {paper.title}
                        </h3>

                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          {paper.department && (
                            <Badge variant="secondary" className="text-[10px] py-0">
                              {paper.department}
                            </Badge>
                          )}
                          {paper.subject && (
                            <Badge variant="outline" className="text-[10px] py-0">
                              {paper.subject}
                            </Badge>
                          )}
                        </div>

                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                          {paper.overview}
                        </p>

                        <div className="flex flex-col gap-0.5 text-xs text-muted-foreground mt-3 pt-2.5 border-t border-border/50">
                          <p className="font-medium text-foreground truncate">
                            Author:{" "}
                            <span className="font-normal text-muted-foreground">
                              {paper.studentName || "Student Author"}
                            </span>
                          </p>
                          {paper.professorName && (
                            <p className="text-[11px] text-muted-foreground flex items-center gap-1 truncate">
                              <GraduationCap className="w-3 h-3 shrink-0" />
                              <span className="truncate">
                                Reviewer: {paper.professorName}
                              </span>
                            </p>
                          )}
                        </div>
                      </CardContent>

                      <div className="p-4 sm:p-5 pt-0 flex gap-2 border-t border-border/50 pt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs h-8 border-border/80"
                          onClick={() => setViewPaper(paper)}
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          View Paper
                        </Button>

                        {!isGlobal && !isPendingGlobal && (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="text-xs h-8"
                            title="Submit for global research repository"
                            disabled={requesting}
                            onClick={() => promptRequestGlobalize(paper)}
                          >
                            <Send className="w-3 h-3 mr-1" />
                            Globalize
                          </Button>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* TAB 3: GLOBAL (3RD TAB) */}
          <TabsContent value="global" className="space-y-4">
            {filteredGlobal.length === 0 ? (
              <Card className="border-border/70 bg-card/60">
                <CardContent className="p-8">
                  <EmptyState
                    icon={<Globe className="w-8 h-8 text-muted-foreground" />}
                    title="No Global Research"
                    desc="No research papers have been published globally across colleges yet."
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredGlobal.map((paper) => (
                  <Card
                    key={paper.id}
                    className="border-border/70 bg-card/70 backdrop-blur-xs hover:border-border hover:shadow-xs transition-all flex flex-col justify-between"
                  >
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <Badge className="text-[10px] bg-indigo-500/10 text-indigo-600 border-indigo-500/20">
                          <Globe className="w-3 h-3 mr-1" />
                          Global Publication
                        </Badge>
                        {paper.createdAt && (
                          <span className="text-[11px] text-muted-foreground">
                            {new Date(paper.createdAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-sm sm:text-base text-foreground line-clamp-2 leading-snug">
                        {paper.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        {paper.department && (
                          <Badge variant="secondary" className="text-[10px] py-0">
                            {paper.department}
                          </Badge>
                        )}
                        {paper.subject && (
                          <Badge variant="outline" className="text-[10px] py-0">
                            {paper.subject}
                          </Badge>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                        {paper.overview}
                      </p>

                      <div className="flex items-center justify-between text-xs text-muted-foreground mt-3 pt-2.5 border-t border-border/50">
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {paper.studentName || "Student Author"}
                          </p>
                          {paper.collegeName && (
                            <p className="text-[11px] text-muted-foreground flex items-center gap-1 truncate">
                              <Building2 className="w-3 h-3 shrink-0" />
                              <span className="truncate">
                                {paper.collegeName}
                              </span>
                            </p>
                          )}
                        </div>
                        <span className="flex items-center gap-1 font-semibold text-primary shrink-0 text-xs">
                          <ThumbsUp className="w-3.5 h-3.5" />
                          {paper.upvotesCount ?? 0}
                        </span>
                      </div>
                    </CardContent>

                    <div className="p-4 sm:p-5 pt-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs h-8 border-border/80"
                        onClick={() => setViewPaper(paper)}
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        View Abstract & PDF
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* TAB 4: PENDING APPROVAL (4TH TAB) */}
          <TabsContent value="pending" className="space-y-4">
            {filteredPending.length === 0 ? (
              <Card className="border-border/70 bg-card/60">
                <CardContent className="p-8">
                  <EmptyState
                    icon={<CheckCircle2 className="w-8 h-8 text-muted-foreground" />}
                    title="No Pending Requests"
                    desc="All research paper globalization proposals have been processed."
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {filteredPending.map((paper) => (
                  <Card
                    key={paper.id}
                    className="border-border/70 bg-card/70 backdrop-blur-xs flex flex-col justify-between"
                  >
                    <CardContent className="p-4 sm:p-6 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <Badge
                          variant="outline"
                          className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/20"
                        >
                          Globalization Requested
                        </Badge>
                        {paper.createdAt && (
                          <span className="text-[11px] text-muted-foreground">
                            {new Date(paper.createdAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-sm sm:text-base text-foreground leading-snug">
                        {paper.title}
                      </h3>

                      <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                        {paper.overview}
                      </p>

                      <div className="bg-muted/50 p-3 rounded-xl text-xs space-y-1 border border-border/50">
                        <p className="font-semibold text-foreground">
                          Author:{" "}
                          <span className="font-normal text-muted-foreground">
                            {paper.studentName}
                          </span>
                        </p>
                        <p className="font-semibold text-foreground">
                          College:{" "}
                          <span className="font-normal text-muted-foreground">
                            {paper.collegeName}
                          </span>
                        </p>
                      </div>
                    </CardContent>

                    <div className="p-4 sm:p-6 pt-0 flex flex-col sm:flex-row gap-2 border-t border-border/50 pt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-9"
                        onClick={() => setViewPaper(paper)}
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 text-xs h-9 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                        disabled={requesting}
                        onClick={() => promptApproveGlobal(paper)}
                      >
                        <Globe className="w-3.5 h-3.5 mr-1.5" />
                        Publish Globally
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-9 text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/5"
                        disabled={requesting}
                        onClick={() => promptRejectGlobal(paper)}
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1.5" />
                        Reject
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* MODAL: ASSIGN FACULTY REVIEWER */}
        <Dialog
          open={Boolean(assignPaper)}
          onOpenChange={(open) => !open && setAssignPaper(null)}
        >
          <DialogContent className="w-[95vw] sm:max-w-md max-h-[85vh] overflow-y-auto rounded-2xl p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-primary shrink-0" />
                <span>Assign Faculty Reviewer</span>
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                Select a faculty professor from your institution to evaluate this student research.
              </DialogDescription>
            </DialogHeader>

            {assignPaper && (
              <div className="space-y-3 py-2">
                <div className="p-3 bg-muted/60 rounded-xl border border-border/60 text-xs space-y-1">
                  <p className="font-semibold text-foreground">
                    Title:{" "}
                    <span className="font-normal text-muted-foreground">
                      {assignPaper.title}
                    </span>
                  </p>
                  <p className="font-semibold text-foreground">
                    Author:{" "}
                    <span className="font-normal text-muted-foreground">
                      {assignPaper.studentName} ({assignPaper.department})
                    </span>
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="prof-select"
                    className="text-xs sm:text-sm font-semibold text-foreground"
                  >
                    Select Faculty Professor{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  {professors.length === 0 ? (
                    <div className="p-3 bg-destructive/10 text-destructive text-xs rounded-xl border border-destructive/20">
                      No faculty professors registered in this institution. Please
                      add a professor first under Users.
                    </div>
                  ) : (
                    <select
                      id="prof-select"
                      className="w-full h-10 px-3 rounded-xl border border-input bg-background text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      value={selectedProfessor}
                      onChange={(e) => setSelectedProfessor(e.target.value)}
                      disabled={requesting}
                    >
                      <option value="" disabled>
                        Select a professor...
                      </option>
                      {professors.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} — {p.department || "Faculty"} (
                          {p.email || ""})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            )}

            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-9"
                onClick={() => setAssignPaper(null)}
                disabled={requesting}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="text-xs h-9"
                onClick={handleAssignProfessor}
                disabled={
                  !selectedProfessor ||
                  requesting ||
                  professors.length === 0
                }
              >
                {requesting ? "Assigning..." : "Assign & Route for Review"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* MODAL: VIEW PAPER ABSTRACT & DOWNLOAD PDF */}
        <Dialog
          open={Boolean(viewPaper)}
          onOpenChange={(open) => !open && setViewPaper(null)}
        >
          <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl p-4 sm:p-6">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <Badge variant="outline" className="text-[10px]">
                  {viewPaper?.isGlobal ||
                  viewPaper?.status === "GLOBALLY_PUBLISHED"
                    ? "Globally Published"
                    : "Campus Research"}
                </Badge>
                {viewPaper?.department && (
                  <Badge variant="secondary" className="text-[10px]">
                    {viewPaper.department}
                  </Badge>
                )}
              </div>
              <DialogTitle className="text-base sm:text-lg font-bold text-foreground leading-snug">
                {viewPaper?.title}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Author: {viewPaper?.studentName || "Student Author"}{" "}
                {viewPaper?.collegeName ? `• ${viewPaper.collegeName}` : ""}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2">
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-foreground mb-1">
                  Abstract / Executive Summary
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-line bg-muted/40 p-3.5 rounded-xl border border-border/60">
                  {viewPaper?.overview || "No overview provided."}
                </p>
              </div>

              {viewPaper?.pdfUrl && (
                <div className="pt-2">
                  <a
                    href={viewPaper.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-primary hover:underline bg-primary/5 px-3 py-2 rounded-xl border border-primary/20"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Official PDF Document</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0 pt-2 border-t border-border/50">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-9 w-full sm:w-auto"
                onClick={() => setViewPaper(null)}
              >
                Close
              </Button>
              {viewPaper &&
                viewPaper.status === "GLOBALIZATION_REQUESTED" && (
                  <Button
                    size="sm"
                    className="text-xs h-9 bg-indigo-600 hover:bg-indigo-700 text-white"
                    disabled={requesting}
                    onClick={() => promptApproveGlobal(viewPaper)}
                  >
                    <Globe className="w-3.5 h-3.5 mr-1.5" />
                    Approve & Publish Globally
                  </Button>
                )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* CONFIRMATION DIALOG */}
        <ConfirmDialog
          open={confirmDialog.open}
          onOpenChange={(open) =>
            setConfirmDialog((prev) => ({ ...prev, open }))
          }
          title={confirmDialog.title}
          description={confirmDialog.description}
          confirmText={confirmDialog.confirmText}
          variant={confirmDialog.variant}
          loading={requesting}
          onConfirm={confirmDialog.onConfirm}
        />
      </div>
    </DashboardLayout>
  );
}
