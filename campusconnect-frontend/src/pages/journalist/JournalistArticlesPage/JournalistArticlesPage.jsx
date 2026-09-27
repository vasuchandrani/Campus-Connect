import "./JournalistArticlesPage.css";
import { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import { Card, CardContent } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Badge } from "../../../components/ui/Badge";
import { journalistNavItems } from "../../../config/Navigation";
import { useAuth } from "../../../contexts/AuthContext";
import { journalistApi } from "../../../services/api";
import { toast } from "../../../hooks/use-toast";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import ArticleReaderModal from "../components/ArticleReaderModal";
import {
  FileText,
  PenSquare,
  Search,
  CheckCircle2,
  Globe,
  Heart,
  Calendar,
  Trash2,
  ArrowRight,
  BookOpen,
  Plus,
  Send,
  Loader2,
  X,
} from "lucide-react";

export default function JournalistArticlesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { routeProtection } = useAuth();

  // Authentication check
  useEffect(() => {
    if (!routeProtection("JOURNALIST")) {
      navigate("/auth");
    }
  }, [navigate, routeProtection]);

  // Page State
  const [loading, setLoading] = useState(true);
  const [articlesSubTab, setArticlesSubTab] = useState(
    location.state?.tab === "drafts" ? "drafts" : "published"
  );
  const [publishedArticles, setPublishedArticles] = useState([]);
  const [draftArticles, setDraftArticles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [upvotingIds, setUpvotingIds] = useState(new Set());

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    description: "",
    confirmText: "",
    variant: "destructive",
    onConfirm: null,
  });
  const [actionLoading, setActionLoading] = useState(false);

  // Article Reader modal state
  const [readerArticle, setReaderArticle] = useState(null);

  // Fetch articles and drafts
  const fetchArticlesData = async () => {
    try {
      const [publishedData, draftsData] = await Promise.all([
        journalistApi.getPublishedNewspapers().catch(() => []),
        journalistApi.getDrafts().catch(() => []),
      ]);
      setPublishedArticles(Array.isArray(publishedData) ? publishedData : []);
      setDraftArticles(Array.isArray(draftsData) ? draftsData : []);
    } catch (err) {
      console.error("Error loading articles:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to load articles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticlesData();
  }, []);

  // Upvote article handler with optimistic update
  const handleToggleUpvote = async (e, article) => {
    if (e && e.stopPropagation) e.stopPropagation();
    const articleId = article.id;
    if (upvotingIds.has(articleId)) return;

    setUpvotingIds((prev) => new Set(prev).add(articleId));

    const currentlyUpvoted = !!article.isUpvoted;
    const currentCount = Number(article.upvotesCount || 0);
    const updatedArticle = {
      ...article,
      isUpvoted: !currentlyUpvoted,
      upvotesCount: currentlyUpvoted ? Math.max(0, currentCount - 1) : currentCount + 1,
    };

    setPublishedArticles((prev) =>
      prev.map((item) => (item.id === articleId ? updatedArticle : item))
    );

    if (readerArticle && readerArticle.id === articleId) {
      setReaderArticle(updatedArticle);
    }

    try {
      await journalistApi.upvoteArticle(articleId);
    } catch (err) {
      setPublishedArticles((prev) =>
        prev.map((item) => (item.id === articleId ? article : item))
      );
      if (readerArticle && readerArticle.id === articleId) {
        setReaderArticle(article);
      }
      toast({
        title: "Action Failed",
        description: "Could not register upvote.",
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

  // Delete published article
  const handleDeletePublished = (article) => {
    setConfirmDialog({
      open: true,
      title: "Delete Published Article",
      description: `Permanently delete "${article.title || "this article"}"? This will remove the story from the campus newsfeed.`,
      confirmText: "Delete Article",
      variant: "destructive",
      onConfirm: async () => {
        try {
          setActionLoading(true);
          await journalistApi.deleteNewsPaper(article.id);
          toast({
            title: "Article Deleted",
            description: "The story has been removed from campus publication.",
            variant: "success",
          });
          setConfirmDialog((prev) => ({ ...prev, open: false }));
          await fetchArticlesData();
        } catch (err) {
          toast({
            title: "Deletion Failed",
            description: err.message || "Could not delete article",
            variant: "destructive",
          });
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  // Discard draft
  const handleDeleteDraft = (draft) => {
    setConfirmDialog({
      open: true,
      title: "Discard Draft",
      description: `Permanently discard "${draft.title || "Untitled Draft"}"? Unsaved work will be lost.`,
      confirmText: "Discard Draft",
      variant: "destructive",
      onConfirm: async () => {
        try {
          setActionLoading(true);
          await journalistApi.deleteDraft(draft.id);
          toast({
            title: "Draft Discarded",
            description: "The draft was permanently removed.",
            variant: "success",
          });
          setConfirmDialog((prev) => ({ ...prev, open: false }));
          await fetchArticlesData();
        } catch (err) {
          toast({
            title: "Error",
            description: err.message || "Failed to delete draft",
            variant: "destructive",
          });
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  // Publish draft directly
  const handlePublishDraftDirectly = (draft) => {
    setConfirmDialog({
      open: true,
      title: "Publish Draft to Campus",
      description: `Are you ready to publish "${draft.title || "Untitled"}" directly to your campus newsfeed?`,
      confirmText: "Publish Now",
      variant: "default",
      onConfirm: async () => {
        try {
          setActionLoading(true);
          await journalistApi.publishDraft(draft.id);
          toast({
            title: "Article Published!",
            description: "Your draft is now live in the university newspaper!",
            variant: "success",
          });
          setConfirmDialog((prev) => ({ ...prev, open: false }));
          await fetchArticlesData();
          setArticlesSubTab("published");
        } catch (err) {
          toast({
            title: "Publish Failed",
            description: err.message || "Could not publish draft",
            variant: "destructive",
          });
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  // Request Globalization
  const handleRequestGlobal = (article) => {
    setConfirmDialog({
      open: true,
      title: "Request Global Syndication",
      description: `Nominate "${article.title}" to be featured university-wide across partner campuses?`,
      confirmText: "Request Globalization",
      variant: "default",
      onConfirm: async () => {
        try {
          setActionLoading(true);
          await journalistApi.requestGlobal(article.id);
          toast({
            title: "Request Submitted",
            description: "Your article was submitted for global university syndication.",
            variant: "success",
          });
          setConfirmDialog((prev) => ({ ...prev, open: false }));
          await fetchArticlesData();
        } catch (err) {
          toast({
            title: "Request Failed",
            description: err.message || "Failed to request globalization",
            variant: "destructive",
          });
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  // Filtered lists based on search
  const filteredPublished = useMemo(() => {
    if (!searchQuery.trim()) return publishedArticles;
    const q = searchQuery.toLowerCase();
    return publishedArticles.filter(
      (a) =>
        (a.title && a.title.toLowerCase().includes(q)) ||
        (a.abstractText && a.abstractText.toLowerCase().includes(q)) ||
        (a.content && a.content.toLowerCase().includes(q))
    );
  }, [publishedArticles, searchQuery]);

  const filteredDrafts = useMemo(() => {
    if (!searchQuery.trim()) return draftArticles;
    const q = searchQuery.toLowerCase();
    return draftArticles.filter(
      (d) =>
        (d.title && d.title.toLowerCase().includes(q)) ||
        (d.abstractText && d.abstractText.toLowerCase().includes(q)) ||
        (d.content && d.content.toLowerCase().includes(q))
    );
  }, [draftArticles, searchQuery]);

  return (
    <DashboardLayout navItems={journalistNavItems} title="My Articles">
      <div className="space-y-5 sm:space-y-6 w-full max-w-7xl mx-auto pb-10">
        
        {/* ========================================================= */}
        {/* HEADER BANNER                                             */}
        {/* ========================================================= */}
        <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-card via-card/90 to-primary/5 p-4 sm:p-6 shadow-xs">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="text-[10px] sm:text-[11px] font-semibold border-primary/20 bg-primary/10 text-primary uppercase tracking-wider"
              >
                Editorial Archive
              </Badge>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
              <div className="flex items-start justify-between gap-3 min-w-0">
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-foreground">
                    My Articles & Newsroom Drafts
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 leading-relaxed">
                    Manage your campus publications, monitor readership upvotes, nominate stories for global syndication, and resume drafts.
                  </p>
                </div>

                <Button
                  size="sm"
                  className="sm:hidden text-xs h-8 px-2.5 font-semibold shadow-xs gap-1 shrink-0"
                  onClick={() => navigate("/campus-connect/journalist/write")}
                >
                  <PenSquare className="w-3.5 h-3.5" />
                  <span>Write</span>
                </Button>
              </div>

              <div className="hidden sm:flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  className="text-xs h-9 px-4 font-semibold shadow-xs gap-1.5 shrink-0"
                  onClick={() => navigate("/campus-connect/journalist/write")}
                >
                  <PenSquare className="w-3.5 h-3.5" />
                  <span>Write New Article</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* FILTER & TAB BAR                                          */}
        {/* ========================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
          {/* Segmented Sub-Tabs: 2-column grid on mobile, inline-flex on desktop */}
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-1.5 sm:gap-1 p-1 bg-muted/60 dark:bg-muted/40 rounded-xl border border-border/60 w-full sm:w-auto shrink-0">
            <button
              type="button"
              onClick={() => setArticlesSubTab("published")}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all w-full sm:w-auto ${
                articlesSubTab === "published"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Published</span>
            </button>

            <button
              type="button"
              onClick={() => setArticlesSubTab("drafts")}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all w-full sm:w-auto ${
                articlesSubTab === "drafts"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Drafts</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              type="text"
              placeholder="Search headline or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-8 text-xs h-9 bg-background border-border/70 rounded-xl w-full"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* ARTICLES CONTENT GRID                                     */}
        {/* ========================================================= */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-border/60 bg-card/60 p-4 space-y-3 animate-pulse"
              >
                <div className="aspect-video w-full rounded-xl bg-muted" />
                <div className="h-4 w-3/4 bg-muted rounded" />
                <div className="h-3 w-full bg-muted/60 rounded" />
              </div>
            ))}
          </div>
        ) : articlesSubTab === "published" ? (
          filteredPublished.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filteredPublished.map((article) => (
                <Card
                  key={article.id}
                  className="border-border/70 bg-card/80 hover:border-primary/40 hover:shadow-xs transition-all rounded-xl sm:rounded-2xl overflow-hidden flex flex-col justify-between group"
                >
                  <div>
                    {/* Cover Thumbnail */}
                    <div
                      className="relative aspect-video w-full bg-muted overflow-hidden cursor-pointer"
                      onClick={() => setReaderArticle(article)}
                    >
                      {article.imageUrl || (article.images && article.images[0]) ? (
                        <img
                          src={article.imageUrl || article.images[0]}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                          <BookOpen className="w-8 h-8" />
                        </div>
                      )}

                      {article.isGlobal && (
                        <Badge className="absolute top-2 left-2 bg-blue-500 text-white text-[10px] font-bold shadow-xs flex items-center gap-1 border-0">
                          <Globe className="w-2.5 h-2.5" />
                          Globalized
                        </Badge>
                      )}
                    </div>

                    {/* Body */}
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {article.date
                            ? new Date(article.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "Recent"}
                        </span>

                        <button
                          type="button"
                          onClick={(e) => handleToggleUpvote(e, article)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold transition-all ${
                            article.isUpvoted
                              ? "bg-rose-500/15 text-rose-500 border border-rose-500/30"
                              : "bg-muted text-muted-foreground hover:text-rose-500"
                          }`}
                        >
                          <Heart className={`w-3 h-3 ${article.isUpvoted ? "fill-rose-500" : ""}`} />
                          <span>{article.upvotesCount || 0}</span>
                        </button>
                      </div>

                      <h3
                        className="font-bold text-sm sm:text-base text-foreground line-clamp-2 leading-snug cursor-pointer group-hover:text-primary transition-colors"
                        onClick={() => setReaderArticle(article)}
                      >
                        {article.title}
                      </h3>

                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {article.abstractText || article.content || "No abstract available."}
                      </p>
                    </CardContent>
                  </div>

                  {/* Footer Actions */}
                  <div className="p-4 pt-0 border-t border-border/50 mt-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-7 px-2 text-primary font-semibold hover:bg-primary/10"
                        onClick={() => setReaderArticle(article)}
                      >
                        <span>Read Story</span>
                      </Button>

                      {!article.isGlobal && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-7 px-2 text-blue-500 hover:text-blue-600 hover:bg-blue-500/10 gap-1"
                          onClick={() => handleRequestGlobal(article)}
                        >
                          <Globe className="w-3 h-3" />
                          <span className="hidden sm:inline">Syndicate</span>
                        </Button>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeletePublished(article)}
                      title="Delete Article"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-border/70 bg-card/60 rounded-2xl p-8 sm:p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto text-primary">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="font-bold text-sm sm:text-base text-foreground">
                  {searchQuery ? "No matching published articles" : "No articles published yet"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {searchQuery
                    ? "Try adjusting your search terms or filter keywords."
                    : "Draft and publish your first newspaper story for the campus community."}
                </p>
              </div>
              <Button
                size="sm"
                className="text-xs h-9 px-4 gap-1.5 shadow-xs font-semibold"
                onClick={() => navigate("/campus-connect/journalist/write")}
              >
                <PenSquare className="w-3.5 h-3.5" />
                <span>Write New Article</span>
              </Button>
            </Card>
          )
        ) : (
          /* Drafts Tab */
          filteredDrafts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filteredDrafts.map((draft) => (
                <Card
                  key={draft.id}
                  className="border-border/70 bg-card/80 hover:border-primary/40 hover:shadow-xs transition-all rounded-xl sm:rounded-2xl p-4 flex flex-col justify-between group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-500 bg-amber-500/10">
                        In Progress Draft
                      </Badge>
                      <span className="text-[11px] text-muted-foreground">
                        {draft.date
                          ? new Date(draft.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                          : "Recent"}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm sm:text-base text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                      {draft.title || "Untitled Draft"}
                    </h3>

                    <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                      {draft.abstractText || draft.content || "No abstract or content entered yet..."}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-border/50 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        className="text-xs h-7 px-3 gap-1 font-semibold"
                        onClick={() => navigate("/campus-connect/journalist/write", { state: { editDraft: draft } })}
                      >
                        <PenSquare className="w-3 h-3" />
                        <span>Edit</span>
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7 px-2.5 gap-1 border-border/80"
                        onClick={() => handlePublishDraftDirectly(draft)}
                      >
                        <Send className="w-3 h-3 text-primary" />
                        <span>Publish</span>
                      </Button>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteDraft(draft)}
                      title="Discard Draft"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-border/70 bg-card/60 rounded-2xl p-8 sm:p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto text-amber-500">
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="font-bold text-sm sm:text-base text-foreground">
                  {searchQuery ? "No matching drafts found" : "No pending drafts"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  All your stories have been published or discarded.
                </p>
              </div>
              <Button
                size="sm"
                className="text-xs h-9 px-4 gap-1.5 shadow-xs font-semibold"
                onClick={() => navigate("/campus-connect/journalist/write")}
              >
                <PenSquare className="w-3.5 h-3.5" />
                <span>Start New Story</span>
              </Button>
            </Card>
          )
        )}

        {/* Article Reader Modal */}
        <ArticleReaderModal
          open={!!readerArticle}
          onOpenChange={(open) => !open && setReaderArticle(null)}
          article={readerArticle}
          onToggleUpvote={handleToggleUpvote}
        />

        {/* Confirm Action Dialog */}
        <ConfirmDialog
          open={confirmDialog.open}
          onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}
          title={confirmDialog.title}
          description={confirmDialog.description}
          confirmText={confirmDialog.confirmText}
          variant={confirmDialog.variant}
          loading={actionLoading}
          onConfirm={confirmDialog.onConfirm}
        />

      </div>
    </DashboardLayout>
  );
}
