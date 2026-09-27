import "./StudentNewspaperPage.css";
import { useState, useMemo, useEffect } from "react";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import { Card, CardContent } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Badge } from "../../../components/ui/Badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../../components/ui/Dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../components/ui/Tabs";
import {
  Search,
  BookOpen,
  Newspaper,
  ThumbsUp,
  Globe,
  Building2,
  PenTool,
  User,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { studentNavItems } from "../../../config/Navigation";
import { marked } from "marked";
import { Textarea } from "../../../components/ui/Textarea";
import { Label } from "../../../components/ui/Label";
import { toast } from "../../../hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import PageSkeleton from "../../../components/ui/PageSkeleton";
import EmptyState from "../../../components/ui/EmptyState";
import { newspaperApi, studentApi } from "../../../services/api";

const StudentNewspaperPage = () => {
  // State variables
  const [campusNews, setCampusNews] = useState([]);
  const [globalNews, setGlobalNews] = useState([]);
  const [activeTab, setActiveTab] = useState("campus");
  const [viewArticle, setViewArticle] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [requestOpen, setRequestOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [experience, setExperience] = useState("");
  const [portfolioLink, setPortfolioLink] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [upvotingIds, setUpvotingIds] = useState(new Set());

  const navigate = useNavigate();
  const { routeProtection } = useAuth();

  useEffect(() => {
    if (!routeProtection("STUDENT")) {
      navigate("/auth");
    }
  }, [navigate, routeProtection]);

  // Compile Markdown for article modal
  const renderedContent = useMemo(() => {
    if (!viewArticle?.content) return "";
    return marked.parse(viewArticle.content.trim());
  }, [viewArticle?.content]);

  // Fetch newspaper articles (campus + global)
  const fetchArticles = async () => {
    setLoading(true);
    try {
      const [campusData, globalData] = await Promise.all([
        newspaperApi.getCampusNews().catch(() => []),
        newspaperApi.getGlobalNews().catch(() => []),
      ]);
      setCampusNews(Array.isArray(campusData) ? campusData : []);
      setGlobalNews(Array.isArray(globalData) ? globalData : []);
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "Failed to fetch newspaper articles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  // Handle Upvote toggle (optimistic UI update)
  const handleToggleUpvote = async (e, article, isGlobal) => {
    e.stopPropagation();
    const articleId = article.id;
    if (upvotingIds.has(articleId)) return;

    setUpvotingIds((prev) => new Set(prev).add(articleId));

    // Optimistic toggle
    const updateList = (list) =>
      list.map((item) => {
        if (item.id === articleId) {
          const currentlyUpvoted = !!item.isUpvoted;
          const currentCount = Number(item.upvotesCount || 0);
          return {
            ...item,
            isUpvoted: !currentlyUpvoted,
            upvotesCount: currentlyUpvoted ? Math.max(0, currentCount - 1) : currentCount + 1,
          };
        }
        return item;
      });

    if (isGlobal) {
      setGlobalNews(updateList);
    } else {
      setCampusNews(updateList);
    }

    try {
      if (isGlobal) {
        await newspaperApi.upvoteGlobal(articleId);
      } else {
        await newspaperApi.upvoteCampus(articleId);
      }
    } catch (err) {
      fetchArticles();
      toast({
        title: "Error",
        description: err.message || "Failed to update upvote",
        variant: "destructive",
      });
    } finally {
      setUpvotingIds((prev) => {
        const next = new Set(prev);
        next.delete(articleId);
        return next;
      });
    }
  };

  // Filter articles based on active tab and search query
  const currentArticles = activeTab === "campus" ? campusNews : globalNews;
  const filteredArticles = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return currentArticles.filter(
      (a) =>
        (a.title && a.title.toLowerCase().includes(term)) ||
        (a.headline && a.headline.toLowerCase().includes(term)) ||
        (a.content && a.content.toLowerCase().includes(term)) ||
        (a.journalistName && a.journalistName.toLowerCase().includes(term)) ||
        (a.collegeName && a.collegeName.toLowerCase().includes(term))
    );
  }, [currentArticles, searchTerm]);

  // Submit journalist request
  const handleSubmitRequest = async () => {
    if (!reason.trim() || !experience.trim()) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const data = await studentApi.requestBecomeJournalist({
        why: reason,
        experience,
        portfolioLink,
      });

      toast({
        title: "Request Submitted",
        description: data.message || "Your request to become a journalist has been submitted!",
      });
      setReason("");
      setExperience("");
      setPortfolioLink("");
      setRequestOpen(false);
    } catch (err) {
      toast({
        title: "Error",
        description: err.response?.data?.message || err.message || "Failed to submit journalist request",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout navItems={studentNavItems} title="Newspaper">
      {loading ? (
        <PageSkeleton />
      ) : (
        <div className="space-y-5 sm:space-y-6 w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Newspaper className="w-6 h-6 text-primary" />
                <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                  Campus Chronicle & Newspapers
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Read student journalism, campus gazettes, and syndicated publications across partner colleges
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Become Journalist Button */}
              <Dialog open={requestOpen} onOpenChange={setRequestOpen}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRequestOpen(true)}
                  className="gap-1.5 text-xs font-semibold h-9"
                >
                  <PenTool className="w-3.5 h-3.5 text-primary" />
                  Become Journalist
                </Button>
                <DialogContent className="max-w-md w-full">
                  <DialogHeader>
                    <DialogTitle>Apply to Become a Student Journalist</DialogTitle>
                    <DialogDescription>
                      Share your journalism experience to submit and publish articles in the Campus Chronicle.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-3.5 pt-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold">Why do you want to join? *</Label>
                      <Textarea
                        placeholder="Tell us about your interests in student news..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="text-xs sm:text-sm"
                        rows={3}
                        disabled={submitting}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold">Relevant Experience *</Label>
                      <Textarea
                        placeholder="Past publications, articles, or writing clubs..."
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        className="text-xs sm:text-sm"
                        rows={3}
                        disabled={submitting}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold">Portfolio Link (optional)</Label>
                      <Input
                        placeholder="https://your-portfolio.com"
                        value={portfolioLink}
                        onChange={(e) => setPortfolioLink(e.target.value)}
                        className="h-9 text-xs sm:text-sm"
                        disabled={submitting}
                      />
                    </div>

                    <Button
                      className="w-full text-xs sm:text-sm font-semibold h-9"
                      onClick={handleSubmitRequest}
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Application"
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search articles, headlines..."
                  className="pl-9 h-9 text-xs sm:text-sm"
                />
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="w-full grid grid-cols-2 sm:inline-flex sm:w-auto p-1 bg-muted/60 border border-border/60 rounded-xl gap-1">
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
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4 pt-1">
              {filteredArticles.length === 0 ? (
                <Card className="border-dashed border-border/80">
                  <CardContent className="py-12">
                    <EmptyState
                      icon={Newspaper}
                      title={searchTerm ? "No Matching Newspapers" : `No ${activeTab === "campus" ? "Campus" : "Global"} Newspapers Found`}
                      description={
                        searchTerm
                          ? `No editions matching "${searchTerm}". Try a different keyword.`
                          : `No published newspaper editions found under the ${activeTab} section.`
                      }
                    />
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {filteredArticles.map((paper) => {
                    const isGlobal = activeTab === "global" || paper.isGlobal;
                    const isUpvoted = !!paper.isUpvoted;
                    const upvoteCount = paper.upvotesCount || 0;

                    return (
                      <Card
                        key={paper.id}
                        className="flex flex-col justify-between border-border/80 hover:border-primary/40 hover:shadow-md transition-all duration-200 overflow-hidden"
                      >
                        <div>
                          {/* Cover Preview Banner */}
                          <div className="h-44 w-full bg-gradient-to-br from-primary/10 via-accent/20 to-muted relative overflow-hidden border-b border-border/60">
                            {paper.imageUrl || paper.coverImage ? (
                              <img
                                src={paper.imageUrl || paper.coverImage}
                                alt={paper.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/60 p-4 text-center">
                                <Newspaper className="w-10 h-10 text-primary/40 mb-1" />
                                <span className="text-xs font-semibold">Campus Gazette Edition</span>
                              </div>
                            )}

                            {/* Tag: Campus Edition vs Global Edition */}
                            <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                              {isGlobal ? (
                                <Badge className="bg-purple-600 text-white text-[10px] font-bold shadow-xs">
                                  Global Edition
                                </Badge>
                              ) : (
                                <Badge className="bg-primary text-primary-foreground text-[10px] font-bold shadow-xs">
                                  Campus Edition
                                </Badge>
                              )}
                            </div>
                          </div>

                          <CardContent className="p-4 sm:p-5 space-y-3">
                            <div className="space-y-1">
                              <h3 className="text-base font-bold text-foreground line-clamp-2">
                                {paper.title}
                              </h3>
                              {paper.headline && (
                                <p className="text-xs font-medium text-foreground/80 line-clamp-1 italic">
                                  "{paper.headline}"
                                </p>
                              )}
                            </div>

                            <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                              {paper.content || paper.overview || "Read full gazette coverage and campus stories."}
                            </p>

                            <div className="pt-2 border-t border-border/60 space-y-1 text-xs text-muted-foreground">
                              <div className="flex items-center justify-between">
                                <span className="inline-flex items-center gap-1">
                                  <User className="w-3.5 h-3.5 text-primary" />
                                  {paper.journalistName || "Student Journalist"}
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
                              {paper.collegeName && (
                                <div className="flex items-center gap-1 text-[11px] text-muted-foreground truncate">
                                  <Building2 className="w-3 h-3 text-primary shrink-0" />
                                  <span className="truncate">{paper.collegeName}</span>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </div>

                        {/* Actions Footer */}
                        <div className="p-3 sm:p-4 pt-0 border-t border-border/40 mt-auto pt-3 flex items-center gap-2">
                          <Button
                            variant={isUpvoted ? "default" : "outline"}
                            size="sm"
                            onClick={(e) => handleToggleUpvote(e, paper, isGlobal)}
                            disabled={upvotingIds.has(paper.id)}
                            className={`text-xs h-9 px-3 gap-1.5 font-semibold ${isUpvoted
                                ? "bg-primary text-primary-foreground"
                                : "hover:text-primary hover:border-primary/40"
                              }`}
                          >
                            <ThumbsUp
                              className={`w-3.5 h-3.5 ${isUpvoted ? "fill-current" : ""}`}
                            />
                            <span>{upvoteCount}</span>
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setViewArticle(paper)}
                            className="flex-1 text-xs font-semibold h-9"
                          >
                            <BookOpen className="w-3.5 h-3.5 mr-1.5" />
                            Read Edition
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Reader Dialog */}
          <Dialog
            open={!!viewArticle}
            onOpenChange={(open) => !open && setViewArticle(null)}
          >
            <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl p-4 sm:p-6">
              <DialogHeader>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge
                      className={
                        viewArticle?.isGlobal
                          ? "bg-purple-600 text-white text-[10px]"
                          : "bg-primary text-primary-foreground text-[10px]"
                      }
                    >
                      {viewArticle?.isGlobal ? "Global Publication" : "Campus Publication"}
                    </Badge>
                    {viewArticle?.collegeName && (
                      <span className="text-xs text-muted-foreground">
                        {viewArticle.collegeName}
                      </span>
                    )}
                  </div>
                  <DialogTitle className="text-lg sm:text-xl font-bold text-foreground">
                    {viewArticle?.title}
                  </DialogTitle>
                  {viewArticle?.headline && (
                    <DialogDescription className="text-xs sm:text-sm text-foreground/80 italic">
                      "{viewArticle.headline}"
                    </DialogDescription>
                  )}
                </div>
              </DialogHeader>

              <div className="space-y-4 pt-2">
                {(viewArticle?.imageUrl || viewArticle?.coverImage) && (
                  <div className="rounded-xl overflow-hidden max-h-64 w-full border border-border/60">
                    <img
                      src={viewArticle.imageUrl || viewArticle.coverImage}
                      alt={viewArticle.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="text-xs text-muted-foreground flex items-center justify-between border-b border-border/60 pb-2">
                  <span>By {viewArticle?.journalistName || "Student Journalist"}</span>
                  {viewArticle?.createdAt && (
                    <span>
                      Published on{" "}
                      {new Date(viewArticle.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  )}
                </div>

                {renderedContent ? (
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: renderedContent }}
                  />
                ) : (
                  <div className="text-xs sm:text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                    {viewArticle?.content || viewArticle?.overview || "No extended content text."}
                  </div>
                )}

                {viewArticle?.pdfUrl && (
                  <div className="pt-2">
                    <Button
                      onClick={() => window.open(viewArticle.pdfUrl, "_blank")}
                      size="sm"
                      className="w-full text-xs font-semibold h-9 shadow-xs"
                    >
                      <ExternalLink className="w-4 h-4 mr-1.5" />
                      Open Full Gazette Document (PDF)
                    </Button>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </DashboardLayout>
  );
};

export default StudentNewspaperPage;
