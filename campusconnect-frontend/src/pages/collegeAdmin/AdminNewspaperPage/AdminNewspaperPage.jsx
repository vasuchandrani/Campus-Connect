import "./AdminNewspaperPage.css";
import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import { Card, CardContent } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Input } from "../../../components/ui/Input";
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
  Newspaper,
  Globe,
  Clock,
  User,
  Building2,
  CheckCircle2,
  XCircle,
  Send,
  Trash2,
  ThumbsUp,
  Share2,
} from "lucide-react";
import { collegeAdminNavItems } from "../../../config/Navigation";
import { toast } from "../../../hooks/use-toast";
import { marked } from "marked";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import EmptyState from "../../../components/ui/EmptyState";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import { collegeAdminApi } from "../../../services/api";

export default function AdminNewspaperPage() {
  const navigate = useNavigate();
  const { routeProtection } = useAuth();

  // Data states
  const [campusArticles, setCampusArticles] = useState([]);
  const [globalArticles, setGlobalArticles] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);

  // Confirmation dialog
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    description: "",
    confirmText: "",
    variant: "destructive",
    onConfirm: null,
  });

  // Preview state
  const [viewArticle, setViewArticle] = useState(null);
  const [query, setQuery] = useState("");
  const [requesting, setRequesting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!routeProtection("COLLEGE_ADMIN")) {
      navigate("/auth");
    }
  }, [navigate, routeProtection]);

  const fetchCampusArticles = async () => {
    try {
      const data = await collegeAdminApi.getCampusNewsPapers();
      setCampusArticles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch campus articles:", err);
    }
  };

  const fetchGlobalArticles = async () => {
    try {
      const data = await collegeAdminApi.getGlobalNewsPapers();
      setGlobalArticles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch global articles:", err);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const data = await collegeAdminApi.getGlobalNewsRequests();
      setPendingRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch pending globalization requests:", err);
    }
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchCampusArticles(),
        fetchGlobalArticles(),
        fetchPendingRequests(),
      ]);
    } catch (err) {
      console.error("Error loading newspapers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  // Approve globalization
  const handleApproveGlobal = async (articleId) => {
    setRequesting(true);
    try {
      const data = await collegeAdminApi.approveGlobalNewsPaper(articleId);
      toast({
        title: "Published Globally",
        description:
          data.message || "Newspaper is now published across all institutions.",
        variant: "success",
      });
      setViewArticle(null);
      await Promise.all([
        fetchPendingRequests(),
        fetchGlobalArticles(),
        fetchCampusArticles(),
      ]);
    } catch (err) {
      toast({
        title: "Approval Failed",
        description: err.message || "Failed to publish globally.",
        variant: "destructive",
      });
    } finally {
      setRequesting(false);
    }
  };

  // Reject globalization
  const handleRejectGlobal = async (articleId) => {
    setRequesting(true);
    try {
      const data = await collegeAdminApi.rejectGlobalNewsPaper(articleId);
      toast({
        title: "Request Rejected",
        description: data.message || "Globalization request rejected.",
        variant: "default",
      });
      setViewArticle(null);
      await Promise.all([fetchPendingRequests(), fetchCampusArticles()]);
    } catch (err) {
      toast({
        title: "Action Failed",
        description: err.message || "Failed to reject globalization.",
        variant: "destructive",
      });
    } finally {
      setRequesting(false);
    }
  };

  // Request globalization
  const handleRequestGlobalize = async (articleId) => {
    setRequesting(true);
    try {
      const data = await collegeAdminApi.requestGlobalNewsPaper(articleId);
      toast({
        title: "Globalization Requested",
        description:
          data.message || "Submitted for global network publication review.",
        variant: "success",
      });
      await Promise.all([fetchCampusArticles(), fetchPendingRequests()]);
    } catch (err) {
      toast({
        title: "Request Failed",
        description: err.message || "Failed to request globalization.",
        variant: "destructive",
      });
    } finally {
      setRequesting(false);
    }
  };

  // Unpublish
  const handleUnpublish = async (articleId) => {
    setRequesting(true);
    try {
      const data = await collegeAdminApi.unpublishNewsPaper(articleId);
      toast({
        title: "Edition Unpublished",
        description: data.message || "Newspaper unpublished successfully.",
        variant: "success",
      });
      await Promise.all([
        fetchCampusArticles(),
        fetchGlobalArticles(),
        fetchPendingRequests(),
      ]);
    } catch (err) {
      toast({
        title: "Unpublish Failed",
        description: err.message || "Failed to unpublish edition.",
        variant: "destructive",
      });
    } finally {
      setRequesting(false);
    }
  };

  const promptApproveGlobal = (article) => {
    setConfirmDialog({
      open: true,
      title: "Publish Globally",
      description: `Publish "${article.title}" to the global inter-college network? This edition will be visible across all participating campuses.`,
      confirmText: "Publish Globally",
      variant: "success",
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, open: false }));
        await handleApproveGlobal(article.id);
      },
    });
  };

  const promptRejectGlobal = (article) => {
    setConfirmDialog({
      open: true,
      title: "Reject Globalization Request",
      description: `Reject globalization for "${article.title}"? The article will remain available on your campus only.`,
      confirmText: "Reject Request",
      variant: "destructive",
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, open: false }));
        await handleRejectGlobal(article.id);
      },
    });
  };

  const promptRequestGlobalize = (article) => {
    setConfirmDialog({
      open: true,
      title: "Submit for Global Network",
      description: `Submit "${article.title}" for global syndication? Campus administrators across the network will be notified.`,
      confirmText: "Submit Request",
      variant: "default",
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, open: false }));
        await handleRequestGlobalize(article.id);
      },
    });
  };

  const promptUnpublish = (article) => {
    setConfirmDialog({
      open: true,
      title: "Unpublish Newspaper Edition",
      description: `Are you sure you want to unpublish "${article.title}"? It will be removed from campus readers' view.`,
      confirmText: "Unpublish Edition",
      variant: "destructive",
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, open: false }));
        await handleUnpublish(article.id);
      },
    });
  };

  // Filtered queries
  const filteredCampus = useMemo(() => {
    return campusArticles.filter(
      (a) =>
        (a.title || "").toLowerCase().includes(query.toLowerCase()) ||
        (a.journalistName || "").toLowerCase().includes(query.toLowerCase())
    );
  }, [campusArticles, query]);

  const filteredGlobal = useMemo(() => {
    return globalArticles.filter(
      (a) =>
        (a.title || "").toLowerCase().includes(query.toLowerCase()) ||
        (a.collegeName || "").toLowerCase().includes(query.toLowerCase()) ||
        (a.journalistName || "").toLowerCase().includes(query.toLowerCase())
    );
  }, [globalArticles, query]);

  const filteredPending = useMemo(() => {
    return pendingRequests.filter(
      (a) =>
        (a.title || "").toLowerCase().includes(query.toLowerCase()) ||
        (a.journalistName || "").toLowerCase().includes(query.toLowerCase()) ||
        (a.collegeName || "").toLowerCase().includes(query.toLowerCase())
    );
  }, [pendingRequests, query]);

  // Markdown rendering
  const renderedContent = useMemo(() => {
    if (!viewArticle?.content) return "";
    try {
      return marked.parse(viewArticle.content);
    } catch {
      return viewArticle.content;
    }
  }, [viewArticle?.content]);

  // Tailored Skeleton
  if (loading) {
    return (
      <DashboardLayout navItems={collegeAdminNavItems} title="Campus Newspapers">
        <div className="space-y-6 animate-pulse">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-2">
              <div className="h-6 w-48 bg-muted rounded" />
              <div className="h-3.5 w-64 bg-muted/60 rounded" />
            </div>
            <div className="h-9 w-full sm:w-64 bg-muted rounded-lg" />
          </div>
          <div className="w-full grid grid-cols-3 sm:inline-flex sm:w-auto gap-1 p-1 bg-muted/30 border border-border/40 rounded-xl">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-8 sm:w-28 bg-muted rounded-lg" />
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-border/60 bg-card/60 p-4 space-y-3"
              >
                <div className="h-40 bg-muted rounded-xl" />
                <div className="h-4 w-3/4 bg-muted rounded" />
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
    <DashboardLayout navItems={collegeAdminNavItems} title="Campus Newspapers">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Newspaper Editions
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Manage campus releases, discover global student journalism, and review publication queues.
            </p>
          </div>

          <div className="relative w-full sm:w-64 md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search articles, journalists..."
              className="pl-9 text-xs sm:text-sm h-9 bg-card/80 border-border/70"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {/* 3 SUB TABS IN EXACT ORDER:
            1. Campus
            2. Global
            3. Pending Approval */}
        <Tabs defaultValue="campus" className="space-y-6">
          <div className="w-full">
            <TabsList className="w-full grid grid-cols-2 sm:inline-flex sm:w-auto p-1 bg-muted/60 dark:bg-muted/40 border border-border/60 rounded-xl gap-1.5 sm:gap-1">
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
                className="col-span-2 sm:col-span-1 text-xs sm:text-sm py-2 sm:py-1.5 px-3 rounded-lg justify-center font-medium w-full"
              >
                Pending Approval
              </TabsTrigger>
            </TabsList>
          </div>

          {/* TAB 1: CAMPUS */}
          <TabsContent value="campus" className="space-y-4">
            {filteredCampus.length === 0 ? (
              <Card className="border-border/70 bg-card/60">
                <CardContent className="p-8">
                  <EmptyState
                    icon={<Newspaper className="w-8 h-8 text-muted-foreground" />}
                    title="No Campus Editions"
                    desc="Appointed campus journalists have not published any articles yet."
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredCampus.map((article) => {
                  const isGlobal =
                    article.isGlobal ||
                    article.status === "GLOBALLY_PUBLISHED";
                  const isPendingGlobal =
                    article.status === "GLOBALIZATION_REQUESTED";

                  return (
                    <Card
                      key={article.id}
                      className="border-border/70 bg-card/70 backdrop-blur-xs overflow-hidden hover:border-border hover:shadow-xs transition-all flex flex-col justify-between group"
                    >
                      <div>
                        {article.imageUrl ? (
                          <div className="h-40 w-full overflow-hidden bg-muted">
                            <img
                              src={article.imageUrl}
                              alt={article.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        ) : (
                          <div className="h-28 w-full bg-muted/60 flex items-center justify-center">
                            <Newspaper className="w-8 h-8 text-muted-foreground/50" />
                          </div>
                        )}

                        <CardContent className="p-4 sm:p-5">
                          <div className="flex items-center justify-between gap-2 mb-2">
                            {/* STATUS BADGES */}
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

                            {article.createdAt && (
                              <span className="text-[11px] text-muted-foreground">
                                {new Date(
                                  article.createdAt
                                ).toLocaleDateString()}
                              </span>
                            )}
                          </div>

                          <h3 className="font-bold text-sm sm:text-base text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                            {article.title}
                          </h3>

                          <p className="text-xs text-muted-foreground line-clamp-2 mt-2 leading-relaxed">
                            {article.content?.replace(/[#*`_]/g, "").slice(0, 140)}
                            ...
                          </p>

                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-4 pt-3 border-t border-border/50">
                            <User className="w-3 h-3 text-muted-foreground" />
                            <span className="font-medium text-foreground truncate">
                              {article.journalistName || "Staff Reporter"}
                            </span>
                          </div>
                        </CardContent>
                      </div>

                      <div className="p-4 sm:p-5 pt-0 flex gap-2 border-t border-border/50 pt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs h-8 border-border/80"
                          onClick={() => setViewArticle(article)}
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          Read
                        </Button>

                        {!isGlobal && !isPendingGlobal && (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="text-xs h-8"
                            title="Submit for global cross-college feed"
                            disabled={requesting}
                            onClick={() => promptRequestGlobalize(article)}
                          >
                            <Send className="w-3 h-3 mr-1" />
                            Globalize
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-8 text-destructive hover:text-destructive hover:bg-destructive/5 px-2"
                          title="Unpublish edition"
                          disabled={requesting}
                          onClick={() => promptUnpublish(article)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* TAB 2: GLOBAL */}
          <TabsContent value="global" className="space-y-4">
            {filteredGlobal.length === 0 ? (
              <Card className="border-border/70 bg-card/60">
                <CardContent className="p-8">
                  <EmptyState
                    icon={<Globe className="w-8 h-8 text-muted-foreground" />}
                    title="No Global Editions"
                    desc="No newspapers have been published globally across institutions yet."
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredGlobal.map((article) => (
                  <Card
                    key={article.id}
                    className="border-border/70 bg-card/70 backdrop-blur-xs overflow-hidden hover:border-border hover:shadow-xs transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {article.imageUrl ? (
                        <div className="h-40 w-full overflow-hidden bg-muted">
                          <img
                            src={article.imageUrl}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ) : (
                        <div className="h-28 w-full bg-muted/60 flex items-center justify-center">
                          <Globe className="w-8 h-8 text-muted-foreground/50" />
                        </div>
                      )}

                      <CardContent className="p-4 sm:p-5">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <Badge className="text-[10px] bg-indigo-500/10 text-indigo-600 border-indigo-500/20">
                            <Globe className="w-3 h-3 mr-1" />
                            Global Edition
                          </Badge>
                          {article.createdAt && (
                            <span className="text-[11px] text-muted-foreground">
                              {new Date(
                                article.createdAt
                              ).toLocaleDateString()}
                            </span>
                          )}
                        </div>

                        <h3 className="font-bold text-sm sm:text-base text-foreground line-clamp-2 leading-snug">
                          {article.title}
                        </h3>

                        <p className="text-xs text-muted-foreground line-clamp-2 mt-2 leading-relaxed">
                          {article.content?.replace(/[#*`_]/g, "").slice(0, 140)}
                          ...
                        </p>

                        <div className="flex items-center justify-between text-xs text-muted-foreground mt-4 pt-3 border-t border-border/50">
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate">
                              {article.journalistName || "Student Journalist"}
                            </p>
                            {article.collegeName && (
                              <p className="text-[11px] text-muted-foreground flex items-center gap-1 truncate">
                                <Building2 className="w-3 h-3 shrink-0" />
                                <span className="truncate">
                                  {article.collegeName}
                                </span>
                              </p>
                            )}
                          </div>
                          <span className="flex items-center gap-1 font-semibold text-primary shrink-0 text-xs">
                            <ThumbsUp className="w-3.5 h-3.5" />
                            {article.upvotesCount ?? 0}
                          </span>
                        </div>
                      </CardContent>
                    </div>

                    <div className="p-4 sm:p-5 pt-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs h-8 border-border/80"
                        onClick={() => setViewArticle(article)}
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        Read Story
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* TAB 3: PENDING APPROVAL */}
          <TabsContent value="pending" className="space-y-4">
            {filteredPending.length === 0 ? (
              <Card className="border-border/70 bg-card/60">
                <CardContent className="p-8">
                  <EmptyState
                    icon={<CheckCircle2 className="w-8 h-8 text-muted-foreground" />}
                    title="No Pending Requests"
                    desc="All requests to globalize campus newspapers have been processed."
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {filteredPending.map((article) => (
                  <Card
                    key={article.id}
                    className="border-border/70 bg-card/70 backdrop-blur-xs overflow-hidden flex flex-col justify-between"
                  >
                    <CardContent className="p-4 sm:p-6 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <Badge
                          variant="outline"
                          className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/20"
                        >
                          Globalization Requested
                        </Badge>
                        {article.createdAt && (
                          <span className="text-[11px] text-muted-foreground">
                            {new Date(
                              article.createdAt
                            ).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-sm sm:text-base text-foreground leading-snug">
                        {article.title}
                      </h3>

                      <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                        {article.content?.replace(/[#*`_]/g, "").slice(0, 160)}
                        ...
                      </p>

                      <div className="bg-muted/50 p-3 rounded-xl text-xs space-y-1 border border-border/50">
                        <p className="font-semibold text-foreground">
                          Reporter:{" "}
                          <span className="font-normal text-muted-foreground">
                            {article.journalistName}
                          </span>
                        </p>
                        <p className="font-semibold text-foreground">
                          College:{" "}
                          <span className="font-normal text-muted-foreground">
                            {article.collegeName}
                          </span>
                        </p>
                      </div>
                    </CardContent>

                    <div className="p-4 sm:p-6 pt-0 flex flex-col sm:flex-row gap-2 border-t border-border/50 pt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-9"
                        onClick={() => setViewArticle(article)}
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 text-xs h-9 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                        disabled={requesting}
                        onClick={() => promptApproveGlobal(article)}
                      >
                        <Globe className="w-3.5 h-3.5 mr-1.5" />
                        Publish Globally
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-9 text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/5"
                        disabled={requesting}
                        onClick={() => promptRejectGlobal(article)}
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

        {/* MODAL: READ ARTICLE */}
        <Dialog
          open={Boolean(viewArticle)}
          onOpenChange={(open) => !open && setViewArticle(null)}
        >
          <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl p-4 sm:p-6">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <Badge variant="outline" className="text-[10px]">
                  {viewArticle?.isGlobal ? "Global Edition" : "Campus Edition"}
                </Badge>
                {viewArticle?.createdAt && (
                  <span className="text-[11px] text-muted-foreground">
                    {new Date(viewArticle.createdAt).toLocaleDateString()}
                  </span>
                )}
              </div>
              <DialogTitle className="text-base sm:text-lg font-bold text-foreground leading-snug">
                {viewArticle?.title}
              </DialogTitle>
              <DialogDescription className="text-xs">
                By {viewArticle?.journalistName || "Staff Reporter"}{" "}
                {viewArticle?.collegeName ? `• ${viewArticle.collegeName}` : ""}
              </DialogDescription>
            </DialogHeader>

            {viewArticle?.imageUrl && (
              <div className="h-48 sm:h-64 w-full rounded-xl overflow-hidden bg-muted my-2">
                <img
                  src={viewArticle.imageUrl}
                  alt={viewArticle.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div
              className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-foreground py-2 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: renderedContent }}
            />

            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0 pt-2 border-t border-border/50">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-9 w-full sm:w-auto"
                onClick={() => setViewArticle(null)}
              >
                Close
              </Button>
              {viewArticle &&
                viewArticle.status === "GLOBALIZATION_REQUESTED" && (
                  <Button
                    size="sm"
                    className="text-xs h-9 bg-indigo-600 hover:bg-indigo-700 text-white"
                    disabled={requesting}
                    onClick={() => promptApproveGlobal(viewArticle)}
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