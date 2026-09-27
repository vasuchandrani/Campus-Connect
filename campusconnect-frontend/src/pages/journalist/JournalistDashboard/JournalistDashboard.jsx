import "./JournalistDashboard.css";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import { Card, CardContent } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { journalistNavItems } from "../../../config/Navigation";
import { useAuth } from "../../../contexts/AuthContext";
import { journalistApi } from "../../../services/api";
import { toast } from "../../../hooks/use-toast";
import SubDashboardLoginDialog from "../../../components/dashboard/SubDashboardLoginDialog";
import ArticleReaderModal from "../components/ArticleReaderModal";
import {
  CheckCircle2,
  Globe,
  FileText,
  Flame,
  PenSquare,
  ArrowUpRight,
  ArrowRight,
  GraduationCap,
  Building2,
  Calendar,
  Heart,
  Eye,
  ShieldCheck,
  BookOpen,
} from "lucide-react";

export default function JournalistDashboard() {
  const navigate = useNavigate();
  const { routeProtection, returnToStudent } = useAuth();
  const isSwitchingSessionRef = useRef(false);

  // Authentication check
  useEffect(() => {
    if (isSwitchingSessionRef.current) return;
    const currentRole = localStorage.getItem("role");
    if (currentRole === "STUDENT") {
      navigate("/campus-connect/student/dashboard", { replace: true });
      return;
    }
    if (!routeProtection("JOURNALIST")) {
      navigate("/auth");
    }
  }, [navigate, routeProtection]);

  // Page States
  const [pageLoading, setPageLoading] = useState(true);
  const [journalistDetails, setJournalistDetails] = useState({
    name: "",
    college: "",
  });
  const [stats, setStats] = useState({
    published: 0,
    globalized: 0,
    draft: 0,
  });
  const [topArticles, setTopArticles] = useState([]);
  const [recentDrafts, setRecentDrafts] = useState([]);
  const [upvotingIds, setUpvotingIds] = useState(new Set());

  // Article Reader Modal
  const [readerArticle, setReaderArticle] = useState(null);

  // Return to Student Dialog State
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [returnLoading, setReturnLoading] = useState(false);
  const [returnError, setReturnError] = useState("");

  // Load All Dashboard Data
  const loadDashboardData = async () => {
    try {
      const [detailsData, statsData, topNewsData, draftsData] = await Promise.all([
        journalistApi.getDetails().catch(() => ({})),
        journalistApi.getStats().catch(() => ({})),
        journalistApi.getLatestNewspapers().catch(() => []),
        journalistApi.getDrafts().catch(() => []),
      ]);

      if (detailsData) {
        setJournalistDetails({
          name: detailsData.name || "Campus Journalist",
          college: detailsData.collegeName || "Your College",
          email: detailsData.email || "",
        });
      }

      if (statsData) {
        setStats({
          published: Number(statsData.published || 0),
          globalized: Number(statsData.globalized || 0),
          draft: Number(statsData.draft || 0),
        });
      }

      setTopArticles(Array.isArray(topNewsData) ? topNewsData : []);
      setRecentDrafts(Array.isArray(draftsData) ? draftsData.slice(0, 3) : []);
    } catch (err) {
      console.error("Error loading journalist dashboard overview:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to load dashboard overview data",
        variant: "destructive",
      });
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Return to student session
  const handleReturnToStudent = async (password) => {
    setReturnLoading(true);
    setReturnError("");
    isSwitchingSessionRef.current = true;
    try {
      const redirectUrl = await returnToStudent(password, journalistDetails.email);
      toast({
        title: "Session Swapped",
        description: "Welcome back to your Student Dashboard! Journalist session cleared.",
        variant: "success",
      });
      setReturnDialogOpen(false);
      navigate(redirectUrl, { replace: true });
    } catch (err) {
      isSwitchingSessionRef.current = false;
      let msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.data?.message ||
        err.data?.error ||
        err.message ||
        "Invalid password. Please verify your student password.";
      if (typeof msg === "string") {
        msg = msg.replace(/^Something went wrong:\s*/i, "");
        msg = msg.replace(/^\d{3}\s+[A-Z_]+(?:\s+["']?|:\s*["']?)/i, "");
        msg = msg.replace(/^["']|["']$/g, "").trim();
      }
      if (!msg) msg = "Invalid password. Please verify your student password.";
      setReturnError(msg);
    } finally {
      setReturnLoading(false);
    }
  };

  // Toggle upvote on top articles
  const handleToggleUpvote = async (e, article) => {
    if (e && e.stopPropagation) e.stopPropagation();
    const articleId = article.id;
    if (upvotingIds.has(articleId)) return;

    setUpvotingIds((prev) => new Set(prev).add(articleId));

    // Optimistic UI update
    const currentlyUpvoted = !!article.isUpvoted;
    const currentCount = Number(article.upvotesCount || 0);
    const updatedArticle = {
      ...article,
      isUpvoted: !currentlyUpvoted,
      upvotesCount: currentlyUpvoted ? Math.max(0, currentCount - 1) : currentCount + 1,
    };

    setTopArticles((prev) =>
      prev.map((item) => (item.id === articleId ? updatedArticle : item))
    );

    if (readerArticle && readerArticle.id === articleId) {
      setReaderArticle(updatedArticle);
    }

    try {
      await journalistApi.upvoteArticle(articleId);
    } catch (err) {
      // Revert on failure
      setTopArticles((prev) =>
        prev.map((item) => (item.id === articleId ? article : item))
      );
      if (readerArticle && readerArticle.id === articleId) {
        setReaderArticle(article);
      }
      toast({
        title: "Action Failed",
        description: "Could not register upvote. Please try again.",
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

  // 2 Primary Stat Cards as requested: My Published & My Globalized
  const statItems = [
    {
      label: "My Published",
      value: stats.published,
      icon: CheckCircle2,
      subtitle: "All published newspaper count",
      route: "/campus-connect/journalist/articles",
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      label: "My Globalized",
      value: stats.globalized,
      icon: Globe,
      subtitle: "Globally Published newspaper count",
      route: "/campus-connect/journalist/articles",
      color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    },
  ];

  // Custom Tailored Skeleton for Dashboard Loading (consistent with other dashboards)
  if (pageLoading) {
    return (
      <DashboardLayout navItems={journalistNavItems} title="Dashboard">
        <div className="space-y-5 sm:space-y-6 w-full max-w-7xl mx-auto pb-10 animate-pulse">
          {/* Top Banner Skeleton */}
          <div className="rounded-2xl border border-border/60 bg-card/60 p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-2 w-full sm:w-1/2">
              <div className="h-4 w-28 bg-muted rounded-md" />
              <div className="h-6 sm:h-7 w-52 bg-muted rounded-lg" />
              <div className="h-3.5 w-72 bg-muted/70 rounded-md" />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="h-9 w-36 bg-muted rounded-lg flex-1 sm:flex-none" />
            </div>
          </div>

          {/* 2 Stat Cards Skeleton - Always Side-by-Side */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-4 w-full">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="p-3 sm:p-4.5 rounded-xl sm:rounded-2xl border border-border/60 bg-card/60 flex flex-col items-center justify-center text-center space-y-2 relative"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-muted mx-auto" />
                <div className="space-y-1 pt-1 flex flex-col items-center">
                  <div className="h-5 sm:h-7 w-12 sm:w-16 bg-muted rounded-md" />
                  <div className="h-3 sm:h-3.5 w-20 sm:w-24 bg-muted/70 rounded" />
                </div>
              </div>
            ))}
          </div>

          {/* Main Grid Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
            <div className="lg:col-span-8 space-y-4">
              <div className="h-5 w-40 bg-muted rounded" />
              <div className="h-48 rounded-2xl border border-border/60 bg-card/60 p-4" />
            </div>
            <div className="lg:col-span-4 space-y-4">
              <div className="h-5 w-32 bg-muted rounded" />
              <div className="h-48 rounded-2xl border border-border/60 bg-card/60 p-4" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={journalistNavItems} title="Dashboard">
      <div className="space-y-5 sm:space-y-6 w-full max-w-7xl mx-auto pb-10">
        
        {/* ========================================================= */}
        {/* WELCOME / OVERVIEW HEADER BANNER                          */}
        {/* ========================================================= */}
        <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-card via-card/90 to-primary/5 p-4 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant="outline"
                  className="text-[10px] sm:text-[11px] font-semibold border-primary/20 bg-primary/10 text-primary uppercase tracking-wider"
                >
                  Journalist Desk
                </Badge>
                <span className="text-[11px] sm:text-xs text-muted-foreground flex items-center gap-1">
                  • <Building2 className="w-3 h-3 text-primary/70" />
                  {journalistDetails.college || "Campus Press"}
                </span>
              </div>
              <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-foreground">
                Welcome back, {journalistDetails.name || "Campus Journalist"}!
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed line-clamp-2 sm:line-clamp-none">
                Report campus stories, publish verified journalism, and elevate top breaking news to global syndication.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-0.5 sm:pt-0 shrink-0 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8 sm:h-9 px-3 border border-border/80 hover:border-primary/40 hover:bg-muted/60 text-foreground gap-1.5 shadow-xs"
                onClick={() => setReturnDialogOpen(true)}
                title="Return to Student Dashboard"
              >
                <GraduationCap className="w-3.5 h-3.5 text-primary" />
                <span>Return to Student</span>
              </Button>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2 PRIMARY STAT CARDS - SIDE-BY-SIDE ON ALL SCREENS       */}
        {/* ========================================================= */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 w-full">
          {statItems.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card
                key={idx}
                className="border-border/70 bg-card/80 backdrop-blur-xs hover:border-primary/40 hover:shadow-xs active:scale-[0.98] transition-all cursor-pointer group rounded-xl sm:rounded-2xl w-full min-w-0 overflow-hidden relative"
                onClick={() => stat.route && navigate(stat.route, { state: stat.state })}
              >
                <CardContent className="p-3 sm:p-4.5 flex flex-col items-center justify-center text-center h-full min-w-0">
                  <ArrowUpRight className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-foreground transition-colors shrink-0" />
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 border ${stat.color} transition-transform group-hover:scale-105 mb-1 sm:mb-1.5 mx-auto`}
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>

                  <div className="w-full min-w-0 text-center">
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground truncate">
                      {stat.value.toLocaleString()}
                    </p>
                    <p className="text-xs sm:text-sm font-semibold text-foreground/80 mt-0.5 leading-snug truncate">
                      {stat.label}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* ========================================================= */}
        {/* MAIN DASHBOARD CONTENT GRID (8 / 4 COLUMNS)               */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 w-full">
          
          {/* LEFT COLUMN: Top Headlines & In-Progress Drafts (8 Cols) */}
          <div className="lg:col-span-8 space-y-5 sm:space-y-6">
            
            {/* Top 3 Headlines Ranked by Upvotes */}
            <div className="space-y-3.5">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                    <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
                    <span>Top Headlines by You</span>
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Ranked by highest reader upvotes across the campus network
                  </p>
                </div>

                {topArticles.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-8 text-primary hover:text-primary/80 gap-1"
                    onClick={() => navigate("/campus-connect/journalist/articles")}
                  >
                    <span>View Archive</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>

              {topArticles.length > 0 ? (
                <div className="space-y-3">
                  {topArticles.map((article, idx) => (
                    <Card
                      key={article.id || idx}
                      className="border-border/70 bg-card/80 hover:border-primary/40 hover:shadow-xs transition-all overflow-hidden rounded-xl sm:rounded-2xl cursor-pointer group"
                      onClick={() => setReaderArticle(article)}
                    >
                      <CardContent className="p-3.5 sm:p-4 flex flex-col sm:flex-row gap-3.5 sm:gap-4 items-start sm:items-center">
                        {/* Cover Image Thumbnail */}
                        <div className="relative w-full sm:w-28 h-36 sm:h-24 rounded-xl overflow-hidden bg-muted shrink-0 border border-border/50">
                          {article.imageUrl || (article.images && article.images[0]) ? (
                            <img
                              src={article.imageUrl || article.images[0]}
                              alt={article.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                              <BookOpen className="w-6 h-6" />
                            </div>
                          )}

                          <span className="absolute top-1.5 left-1.5 bg-background/80 backdrop-blur-xs text-[10px] font-bold px-1.5 py-0.5 rounded-md text-foreground">
                            #{idx + 1}
                          </span>
                        </div>

                        {/* Article Info */}
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-semibold text-primary uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                              Headline
                            </span>
                            {article.isGlobal && (
                              <Badge className="bg-blue-500/10 text-blue-500 border border-blue-500/20 text-[10px] font-semibold flex items-center gap-1">
                                <Globe className="w-2.5 h-2.5" />
                                Globalized
                              </Badge>
                            )}
                            <span className="text-[11px] text-muted-foreground ml-auto flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {article.date
                                ? new Date(article.date).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                  })
                                : "Recent"}
                            </span>
                          </div>

                          <h3 className="font-bold text-sm sm:text-base text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                            {article.title}
                          </h3>

                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {article.abstractText || article.content || "No abstract preview available."}
                          </p>

                          <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={(e) => handleToggleUpvote(e, article)}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                                  article.isUpvoted
                                    ? "bg-rose-500/15 text-rose-500 border border-rose-500/30"
                                    : "bg-muted/70 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10"
                                }`}
                              >
                                <Heart className={`w-3 h-3 ${article.isUpvoted ? "fill-rose-500" : ""}`} />
                                <span>{article.upvotesCount || 0}</span>
                              </button>
                            </div>

                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs h-7 px-2.5 text-primary hover:text-primary/90 gap-1 font-semibold"
                            >
                              <span>Read Story</span>
                              <ArrowRight className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border-border/70 bg-card/60 rounded-2xl p-6 sm:p-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto text-primary">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div className="space-y-1 max-w-sm mx-auto">
                    <h3 className="font-bold text-sm sm:text-base text-foreground">
                      No published stories yet
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Report events, interview club organizers, and publish verified stories for the university community.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    className="text-xs h-9 px-4 gap-1.5 shadow-xs font-semibold"
                    onClick={() => navigate("/campus-connect/journalist/write")}
                  >
                    <PenSquare className="w-3.5 h-3.5" />
                    <span>Write Your First Article</span>
                  </Button>
                </Card>
              )}
            </div>

            {/* In-Progress Drafts Quick Widget */}
            <div className="space-y-3.5">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    <span>In-Progress Drafts</span>
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Unfinished stories waiting in your editorial workbench
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-8 text-primary hover:text-primary/80 gap-1"
                  onClick={() => navigate("/campus-connect/journalist/articles", { state: { tab: "drafts" } })}
                >
                  <span>Manage All</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>

              {recentDrafts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {recentDrafts.map((draft) => (
                    <Card
                      key={draft.id}
                      className="border-border/70 bg-card/70 hover:border-primary/40 hover:shadow-xs transition-all rounded-xl sm:rounded-2xl p-3.5 flex flex-col justify-between group"
                    >
                      <div className="space-y-1.5">
                        <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-500 bg-amber-500/10">
                          Draft
                        </Badge>
                        <h4 className="font-bold text-xs sm:text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                          {draft.title || "Untitled Draft"}
                        </h4>
                        <p className="text-[11px] text-muted-foreground line-clamp-2 leading-snug">
                          {draft.abstractText || draft.content || "No excerpt..."}
                        </p>
                      </div>

                      <div className="pt-3 mt-2 border-t border-border/50 flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">
                          {draft.date
                            ? new Date(draft.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                            : "Recent"}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs h-7 px-2 text-primary font-semibold gap-1"
                          onClick={() => navigate("/campus-connect/journalist/write", { state: { editDraft: draft } })}
                        >
                          <span>Resume</span>
                          <PenSquare className="w-3 h-3" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border/70 p-4 text-center text-xs text-muted-foreground bg-card/40">
                  No pending drafts saved. Click <span className="font-semibold text-foreground">Write Story</span> to start drafting a new piece.
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Editorial Guidelines (4 Cols) */}
          <div className="lg:col-span-4 space-y-5 sm:space-y-6">
            
            {/* Editorial Standards & Guidelines */}
            <Card className="border-border/70 bg-card/80 backdrop-blur-xs rounded-xl sm:rounded-2xl overflow-hidden shadow-xs">
              <CardContent className="p-4 sm:p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-foreground">Campus Press Standards</h3>
                    <p className="text-[11px] text-muted-foreground">Guidelines for publishing & syndication</p>
                  </div>
                </div>

                <ul className="space-y-2 text-xs text-muted-foreground leading-relaxed pt-1">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <span><strong>Factual & Verified:</strong> Double check facts with student club organizers or college reps before publishing.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <span><strong>High Quality Visuals:</strong> High resolution horizontal cover images ensure eligibility for university-wide globalization.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <span><strong>Reader Engagement:</strong> Stories exceeding community upvote benchmarks are nominated for global syndication.</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

          </div>
        </div>

        {/* ========================================================= */}
        {/* MODALS & DIALOGS                                          */}
        {/* ========================================================= */}

        {/* Article Reader Modal */}
        <ArticleReaderModal
          open={!!readerArticle}
          onOpenChange={(open) => !open && setReaderArticle(null)}
          article={readerArticle}
          onToggleUpvote={handleToggleUpvote}
          collegeName={journalistDetails.college}
        />

        {/* Return to Student Session Dialog */}
        <SubDashboardLoginDialog
          open={returnDialogOpen}
          onOpenChange={setReturnDialogOpen}
          title="Return to Student Dashboard"
          description="Enter your registered student password to verify and restore your student session."
          onSubmit={handleReturnToStudent}
          loading={returnLoading}
          error={returnError}
        />

      </div>
    </DashboardLayout>
  );
}
