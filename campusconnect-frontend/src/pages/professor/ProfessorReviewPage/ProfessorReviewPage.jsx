import "./ProfessorReviewPage.css";
import React, { useState, useEffect, useMemo, useRef } from "react";
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
  CheckSquare,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Search,
  ExternalLink,
  MessageSquare,
  User,
  Building2,
  Calendar,
  AlertCircle,
  Check,
  X,
  ChevronDown,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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

function SortDropdown({ value, onChange, className = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const currentLabel = value === "newest" ? "Newest First" : "Oldest First";

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full sm:w-auto h-8 px-2 sm:px-3 rounded-lg border border-border/70 bg-background/80 hover:bg-accent/40 text-[11px] sm:text-xs font-semibold text-foreground inline-flex items-center justify-center gap-1 sm:gap-1.5 transition-all shadow-2xs cursor-pointer select-none focus:outline-hidden focus:ring-1 focus:ring-primary text-center"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate">{currentLabel}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-muted-foreground opacity-70 transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180 text-primary" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 sm:right-auto sm:left-0 top-full mt-1.5 w-36 rounded-xl border border-border/80 bg-popover/95 backdrop-blur-md p-1 text-popover-foreground shadow-lg z-50 animate-in fade-in-0 zoom-in-95 duration-150"
          role="listbox"
        >
          <button
            type="button"
            role="option"
            aria-selected={value === "newest"}
            onClick={() => {
              onChange("newest");
              setIsOpen(false);
            }}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer select-none text-left ${
              value === "newest"
                ? "bg-primary/10 text-primary font-semibold"
                : "text-foreground hover:bg-accent/60"
            }`}
          >
            <span>Newest First</span>
            {value === "newest" && (
              <Check className="w-3.5 h-3.5 text-primary shrink-0 ml-1.5" />
            )}
          </button>
          <button
            type="button"
            role="option"
            aria-selected={value === "oldest"}
            onClick={() => {
              onChange("oldest");
              setIsOpen(false);
            }}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer select-none text-left ${
              value === "oldest"
                ? "bg-primary/10 text-primary font-semibold"
                : "text-foreground hover:bg-accent/60"
            }`}
          >
            <span>Oldest First</span>
            {value === "oldest" && (
              <Check className="w-3.5 h-3.5 text-primary shrink-0 ml-1.5" />
            )}
          </button>
        </div>
      )}
    </div>
  );
}

export default function ProfessorReviewPage() {
  const navigate = useNavigate();
  const { routeProtection } = useAuth();

  const [activeTab, setActiveTab] = useState("pending");
  const [pendingPapers, setPendingPapers] = useState([]);
  const [reviewedPapers, setReviewedPapers] = useState([]);
  const [evaluatedFilter, setEvaluatedFilter] = useState("ALL"); // ALL | APPROVED | REJECTED
  const [sortOrder, setSortOrder] = useState("newest"); // newest | oldest
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Review Evaluation Modal State
  const [evaluatingPaper, setEvaluatingPaper] = useState(null);
  const [evalAction, setEvalAction] = useState(null); // "accept" | "reject"
  const [feedbackText, setFeedbackText] = useState("");

  // Confirmation Dialog State
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  // View Abstract Modal
  const [selectedPaper, setSelectedPaper] = useState(null);

  useEffect(() => {
    if (!routeProtection("PROFESSOR")) {
      navigate("/auth");
      return;
    }
    loadReviewData();
  }, [navigate, routeProtection]);

  const loadReviewData = async () => {
    setLoading(true);
    try {
      const [pendingRes, reviewedRes] = await Promise.allSettled([
        professorApi.getPendingResearches(),
        professorApi.getReviewedResearches(),
      ]);

      if (pendingRes.status === "fulfilled" && Array.isArray(pendingRes.value)) {
        setPendingPapers(pendingRes.value);
      }
      if (reviewedRes.status === "fulfilled" && Array.isArray(reviewedRes.value)) {
        setReviewedPapers(reviewedRes.value);
      }
    } catch (err) {
      console.error("Error loading review data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartReview = (paper, action) => {
    setEvaluatingPaper(paper);
    setEvalAction(action);
    setFeedbackText("");
  };

  const handlePromptConfirm = () => {
    if (!feedbackText.trim()) {
      toast({
        title: "Feedback required",
        description: "Please provide constructive reviewer feedback before proceeding.",
        variant: "destructive",
      });
      return;
    }
    setConfirmOpen(true);
  };

  const handleConfirmDecision = async () => {
    if (!evaluatingPaper || !evalAction) return;

    setProcessing(true);
    try {
      if (evalAction === "accept") {
        await professorApi.acceptResearch(evaluatingPaper.id, {
          feedback: feedbackText.trim(),
        });
        toast({
          title: "Research Paper Approved!",
          description: "The paper has been accepted and published to the campus repository.",
        });
      } else {
        await professorApi.rejectResearch(evaluatingPaper.id, {
          feedback: feedbackText.trim(),
        });
        toast({
          title: "Research Paper Rejected",
          description: "The decision and feedback have been delivered to the student author.",
        });
      }

      setConfirmOpen(false);
      setEvaluatingPaper(null);
      setEvalAction(null);
      setFeedbackText("");
      // Refresh papers
      await loadReviewData();
    } catch (err) {
      console.error("Error submitting evaluation decision:", err);
      toast({
        title: "Action failed",
        description: err.message || "Failed to process research evaluation.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  // Filter & sort evaluated papers by filter state, sorting & search
  const filteredReviewed = useMemo(() => {
    return reviewedPapers
      .filter((paper) => {
        const matchesDecision =
          evaluatedFilter === "ALL" ||
          (evaluatedFilter === "APPROVED" &&
            (paper.status === "ACCEPTED" || paper.status === "APPROVED")) ||
          (evaluatedFilter === "REJECTED" && paper.status === "REJECTED");

        const term = searchTerm.toLowerCase();
        const matchesSearch =
          !term ||
          (paper.title && paper.title.toLowerCase().includes(term)) ||
          (paper.studentName && paper.studentName.toLowerCase().includes(term)) ||
          (paper.department && paper.department.toLowerCase().includes(term)) ||
          (paper.subject && paper.subject.toLowerCase().includes(term));

        return matchesDecision && matchesSearch;
      })
      .sort((a, b) => {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return sortOrder === "newest" ? timeB - timeA : timeA - timeB;
      });
  }, [reviewedPapers, evaluatedFilter, searchTerm, sortOrder]);

  const filteredPending = pendingPapers.filter((paper) => {
    const term = searchTerm.toLowerCase();
    return (
      (paper.title && paper.title.toLowerCase().includes(term)) ||
      (paper.studentName && paper.studentName.toLowerCase().includes(term)) ||
      (paper.department && paper.department.toLowerCase().includes(term)) ||
      (paper.subject && paper.subject.toLowerCase().includes(term))
    );
  });

  if (loading) {
    return (
      <DashboardLayout navItems={navItems} title="Peer Review">
        <PageSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={navItems} title="Peer Review">
      <div className="space-y-5 sm:space-y-6 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <CheckSquare className="w-6 h-6 text-primary" />
              <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                Peer Review & Academic Evaluations
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Evaluate student research manuscripts assigned to you by college administration
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search papers, student author..."
              className="pl-9 h-9 text-xs sm:text-sm"
            />
          </div>
        </div>

        {/* Subtabs without number badges */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="w-full grid grid-cols-2 sm:inline-flex sm:w-auto p-1 bg-muted/60 border border-border/60 rounded-xl gap-1">
            <TabsTrigger
              value="pending"
              className="text-xs sm:text-sm font-semibold rounded-lg px-3 sm:px-3.5 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs flex items-center justify-center"
            >
              Pending Evaluation
            </TabsTrigger>
            <TabsTrigger
              value="evaluated"
              className="text-xs sm:text-sm font-semibold rounded-lg px-3 sm:px-3.5 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs flex items-center justify-center"
            >
              Evaluated
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Pending Evaluation */}
          <TabsContent value="pending" className="space-y-4 pt-1">
            {filteredPending.length === 0 ? (
              <Card className="border-dashed border-border/80">
                <CardContent className="py-12">
                  <EmptyState
                    icon={CheckCircle2}
                    title="No Pending Evaluations"
                    description={
                      searchTerm
                        ? `No pending papers matching "${searchTerm}".`
                        : "You have reviewed all assigned student research papers. Excellent job!"
                    }
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                {filteredPending.map((paper) => (
                  <Card
                    key={paper.id}
                    className="flex flex-col justify-between border-border/80 hover:border-primary/40 hover:shadow-md transition-all duration-200"
                  >
                    <CardContent className="p-5 space-y-3.5 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <Badge
                          variant="outline"
                          className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px] font-bold flex items-center gap-1"
                        >
                          <Clock className="w-3 h-3" />
                          Under Review
                        </Badge>
                        {paper.department && (
                          <Badge variant="secondary" className="text-[10px]">
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
                        {paper.overview || "Student submitted research manuscript."}
                      </p>

                      <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1 font-medium text-foreground">
                          <User className="w-3.5 h-3.5 text-primary" />
                          {paper.studentName || "Student Author"}
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
                    </CardContent>

                    {/* Review Actions */}
                    <div className="p-4 pt-0 border-t border-border/40 bg-accent/10 flex flex-col sm:flex-row items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedPaper(paper)}
                        className="w-full sm:w-auto text-xs h-9 font-semibold"
                      >
                        <FileText className="w-3.5 h-3.5 mr-1" />
                        Abstract & PDF
                      </Button>

                      <div className="flex items-center gap-2 w-full sm:flex-1">
                        <Button
                          size="sm"
                          onClick={() => handleStartReview(paper, "accept")}
                          className="flex-1 text-xs h-9 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5 mr-1" />
                          Approve
                        </Button>

                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleStartReview(paper, "reject")}
                          className="flex-1 text-xs h-9 font-semibold shadow-xs"
                        >
                          <X className="w-3.5 h-3.5 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Tab 2: Evaluated */}
          <TabsContent value="evaluated" className="space-y-4 pt-1">
            {/* Filter & Sort Controls */}
            <div className="w-full sm:w-auto flex sm:inline-flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 pb-1">
              {/* 3 Status Tabs - takes 3 equal parts on mobile, natural on desktop */}
              <div className="flex-3 sm:flex-none basis-3/4 sm:basis-auto flex items-center rounded-lg bg-muted/60 p-0.5 border border-border/60">
                <button
                  type="button"
                  onClick={() => setEvaluatedFilter("ALL")}
                  className={`flex-1 sm:flex-none h-8 px-2 sm:px-3 rounded-md text-[11px] sm:text-xs font-semibold transition-all cursor-pointer select-none inline-flex items-center justify-center text-center truncate ${
                    evaluatedFilter === "ALL"
                      ? "bg-primary text-primary-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setEvaluatedFilter("APPROVED")}
                  className={`flex-1 sm:flex-none h-8 px-2 sm:px-3 rounded-md text-[11px] sm:text-xs font-semibold transition-all cursor-pointer select-none inline-flex items-center justify-center text-center truncate ${
                    evaluatedFilter === "APPROVED"
                      ? "bg-primary text-primary-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Approved
                </button>
                <button
                  type="button"
                  onClick={() => setEvaluatedFilter("REJECTED")}
                  className={`flex-1 sm:flex-none h-8 px-2 sm:px-3 rounded-md text-[11px] sm:text-xs font-semibold transition-all cursor-pointer select-none inline-flex items-center justify-center text-center truncate ${
                    evaluatedFilter === "REJECTED"
                      ? "bg-primary text-primary-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Rejected
                </button>
              </div>

              {/* Minimal Separation */}
              <div className="h-4 w-px bg-border/80 mx-0.5 hidden sm:block" />

              {/* 4th Sort Tab - takes 1 equal part on mobile, natural on desktop */}
              <SortDropdown
                value={sortOrder}
                onChange={setSortOrder}
                className="flex-1 sm:flex-none basis-1/4 sm:basis-auto"
              />
            </div>

            {filteredReviewed.length === 0 ? (
              <Card className="border-dashed border-border/80">
                <CardContent className="py-12">
                  <EmptyState
                    icon={CheckSquare}
                    title="No Evaluated Papers Found"
                    description={
                      searchTerm
                        ? `No reviewed papers matching "${searchTerm}".`
                        : "No research papers have been reviewed under the selected filter."
                    }
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                {filteredReviewed.map((paper) => {
                  const isApproved =
                    paper.status === "ACCEPTED" || paper.status === "APPROVED";

                  return (
                    <Card
                      key={paper.id}
                      className="flex flex-col justify-between border-border/80 hover:border-primary/40 hover:shadow-xs transition-all duration-200"
                    >
                      <CardContent className="p-5 space-y-3.5 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          {isApproved ? (
                            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-bold">
                              Approved & Published
                            </Badge>
                          ) : (
                            <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-[10px] font-bold">
                              Rejected
                            </Badge>
                          )}
                          {paper.department && (
                            <Badge variant="secondary" className="text-[10px]">
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

                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {paper.overview}
                        </p>

                        {/* Reviewer Feedback Snippet */}
                        {paper.professorFeedback && (
                          <div className="p-2.5 rounded-lg bg-accent/40 border border-border/50 text-xs">
                            <span className="font-bold text-foreground text-[11px] block mb-0.5">
                              Your Peer Review Feedback:
                            </span>
                            <p className="text-muted-foreground italic line-clamp-2">
                              "{paper.professorFeedback}"
                            </p>
                          </div>
                        )}

                        <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">
                            Author: {paper.studentName || "Student Author"}
                          </span>
                          {paper.createdAt && (
                            <span className="text-[11px]">
                              {new Date(paper.createdAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </CardContent>

                      <div className="p-4 pt-0 flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedPaper(paper)}
                          className="w-full text-xs font-semibold h-9"
                        >
                          <FileText className="w-3.5 h-3.5 mr-1.5" />
                          View Manuscript Details
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Evaluation Input Dialog */}
        <Dialog
          open={!!evaluatingPaper && !confirmOpen}
          onOpenChange={(open) => !open && setEvaluatingPaper(null)}
        >
          <DialogContent className="w-[95vw] sm:max-w-lg rounded-2xl p-4 sm:p-6">
            <DialogHeader>
              <div className="space-y-1">
                <Badge
                  className={
                    evalAction === "accept"
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs"
                      : "bg-destructive/10 text-destructive border-destructive/20 text-xs"
                  }
                >
                  {evalAction === "accept" ? "Approving Manuscript" : "Rejecting Manuscript"}
                </Badge>
                <DialogTitle className="text-base sm:text-lg font-bold text-foreground">
                  {evaluatingPaper?.title}
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
                  Author: {evaluatingPaper?.studentName} • {evaluatingPaper?.department}
                </DialogDescription>
              </div>
            </DialogHeader>

            <div className="space-y-3.5 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="feedback" className="text-xs font-bold text-foreground">
                  {evalAction === "accept" ? "Review Comments & Commendations *" : "Rejection Reasons & Actionable Feedback *"}
                </Label>
                <Textarea
                  id="feedback"
                  rows={4}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder={
                    evalAction === "accept"
                      ? "Write positive remarks, peer review commendations, or recommendations for future publication..."
                      : "Explain the academic deficiencies, lack of citations, or methodology flaws that led to rejection..."
                  }
                  className="text-xs sm:text-sm resize-none"
                  required
                />
              </div>

              {evaluatingPaper?.pdfUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(evaluatingPaper.pdfUrl, "_blank")}
                  className="text-xs text-primary hover:underline p-0 h-auto font-medium"
                >
                  <ExternalLink className="w-3.5 h-3.5 mr-1" />
                  Review Attached PDF in New Tab
                </Button>
              )}
            </div>

            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-3 border-t border-border/60">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEvaluatingPaper(null)}
                className="w-full sm:w-auto text-xs h-9"
              >
                Cancel
              </Button>
              <Button
                variant={evalAction === "accept" ? "default" : "destructive"}
                size="sm"
                onClick={handlePromptConfirm}
                className="w-full sm:w-auto text-xs h-9 font-semibold"
              >
                Continue to Final Decision
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Action Confirmation Dialog with ConfirmDialog */}
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title={
            evalAction === "accept"
              ? "Confirm Acceptance & Publication?"
              : "Confirm Rejection of Manuscript?"
          }
          description={
            evalAction === "accept"
              ? `Are you sure you want to approve and publish "${evaluatingPaper?.title}"? It will immediately be indexed in the college research repository.`
              : `Are you sure you want to reject "${evaluatingPaper?.title}"? The student author will receive your peer review remarks.`
          }
          confirmText={evalAction === "accept" ? "Approve & Publish" : "Reject Manuscript"}
          variant={evalAction === "accept" ? "success" : "destructive"}
          icon={evalAction === "accept" ? CheckCircle2 : XCircle}
          loading={processing}
          onConfirm={handleConfirmDecision}
        />

        {/* Paper Detail Dialog */}
        <Dialog
          open={!!selectedPaper}
          onOpenChange={(open) => !open && setSelectedPaper(null)}
        >
          <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl p-4 sm:p-6">
            <DialogHeader>
              <div className="space-y-1">
                <DialogTitle className="text-lg sm:text-xl font-bold text-foreground">
                  {selectedPaper?.title}
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
                  Author: {selectedPaper?.studentName} • {selectedPaper?.department}
                </DialogDescription>
              </div>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Manuscript Abstract
                </h4>
                <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                  {selectedPaper?.overview || "No extended abstract provided."}
                </p>
              </div>

              {selectedPaper?.professorFeedback && (
                <div className="p-3 rounded-xl bg-accent/30 border border-border/60 space-y-1">
                  <h5 className="text-xs font-bold text-foreground">
                    Reviewer Feedback:
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
                    Open Manuscript Document (PDF)
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
