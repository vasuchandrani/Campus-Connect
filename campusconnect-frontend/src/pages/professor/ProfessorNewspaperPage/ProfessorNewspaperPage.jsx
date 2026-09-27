import "./ProfessorNewspaperPage.css";
import React, { useState, useEffect } from "react";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import { Card, CardContent } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Input } from "../../../components/ui/Input";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../../components/ui/Tabs";
import {
  Newspaper,
  Globe,
  Search,
  ThumbsUp,
  BookOpen,
  Calendar,
  Building2,
  ExternalLink,
  User,
  Eye,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../../components/ui/Dialog";
import { professorNavItems } from "../../../config/Navigation";
import { useAuth } from "../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import EmptyState from "../../../components/ui/EmptyState";
import PageSkeleton from "../../../components/ui/PageSkeleton";
import { professorApi } from "../../../services/api";
import { toast } from "../../../hooks/use-toast";

const navItems = professorNavItems;

export default function ProfessorNewspaperPage() {
  const navigate = useNavigate();
  const { routeProtection } = useAuth();

  const [activeTab, setActiveTab] = useState("campus");
  const [campusNews, setCampusNews] = useState([]);
  const [globalNews, setGlobalNews] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Read Modal
  const [selectedPaper, setSelectedPaper] = useState(null);

  useEffect(() => {
    if (!routeProtection("PROFESSOR")) {
      navigate("/auth");
      return;
    }
    loadNewspapers();
  }, [navigate, routeProtection]);

  const loadNewspapers = async () => {
    setLoading(true);
    try {
      const [campusRes, globalRes] = await Promise.allSettled([
        professorApi.getCampusNewspapers(),
        professorApi.getGlobalNewspapers(),
      ]);

      if (campusRes.status === "fulfilled" && Array.isArray(campusRes.value)) {
        setCampusNews(campusRes.value);
      }
      if (globalRes.status === "fulfilled" && Array.isArray(globalRes.value)) {
        setGlobalNews(globalRes.value);
      }
    } catch (err) {
      console.error("Error loading newspapers:", err);
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
      setGlobalNews((prev) => updater(prev));
    } else {
      setCampusNews((prev) => updater(prev));
    }

    try {
      if (isGlobal) {
        await professorApi.upvoteGlobalNewspaper(paper.id);
      } else {
        await professorApi.upvoteCampusNewspaper(paper.id);
      }
    } catch (err) {
      console.error("Error toggling upvote:", err);
      // Revert on failure
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
        setGlobalNews((prev) => reverter(prev));
      } else {
        setCampusNews((prev) => reverter(prev));
      }
      toast({
        title: "Upvote failed",
        description: "Could not update your upvote. Please try again.",
        variant: "destructive",
      });
    }
  };

  const currentList = activeTab === "campus" ? campusNews : globalNews;

  const filteredNews = currentList.filter((paper) => {
    const term = searchTerm.toLowerCase();
    return (
      (paper.title && paper.title.toLowerCase().includes(term)) ||
      (paper.headline && paper.headline.toLowerCase().includes(term)) ||
      (paper.content && paper.content.toLowerCase().includes(term)) ||
      (paper.journalistName && paper.journalistName.toLowerCase().includes(term)) ||
      (paper.collegeName && paper.collegeName.toLowerCase().includes(term))
    );
  });

  if (loading) {
    return (
      <DashboardLayout navItems={navItems} title="Newspaper">
        <PageSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={navItems} title="Newspaper">
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

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search articles, headlines..."
              className="pl-9 h-9 text-xs sm:text-sm"
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="w-full grid grid-cols-2 sm:inline-flex sm:w-auto p-1 bg-muted/60 border border-border/60 rounded-xl gap-1">
            <TabsTrigger
              value="campus"
              className="text-xs sm:text-sm font-semibold rounded-lg px-3 sm:px-3.5 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs flex items-center justify-center"
            >
              Campus
            </TabsTrigger>
            <TabsTrigger
              value="global"
              className="text-xs sm:text-sm font-semibold rounded-lg px-3 sm:px-3.5 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs flex items-center justify-center"
            >
              Global
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4 pt-1">
            {filteredNews.length === 0 ? (
              <Card className="border-dashed border-border/80">
                <CardContent className="py-12">
                  <EmptyState
                    icon={Newspaper}
                    title={searchTerm ? "No Matching Newspapers" : `No ${activeTab} Newspapers Found`}
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
                {filteredNews.map((paper) => (
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
                          {paper.isGlobal ? (
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

                    {/* Footer Actions */}
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
                        <BookOpen className="w-3.5 h-3.5 mr-1.5" />
                        Read Edition
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Reader Dialog */}
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
                    {selectedPaper?.isGlobal ? "Global Publication" : "Campus Publication"}
                  </Badge>
                  {selectedPaper?.collegeName && (
                    <span className="text-xs text-muted-foreground">
                      {selectedPaper.collegeName}
                    </span>
                  )}
                </div>
                <DialogTitle className="text-lg sm:text-xl font-bold text-foreground">
                  {selectedPaper?.title}
                </DialogTitle>
                {selectedPaper?.headline && (
                  <DialogDescription className="text-xs sm:text-sm text-foreground/80 italic">
                    "{selectedPaper.headline}"
                  </DialogDescription>
                )}
              </div>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              {(selectedPaper?.imageUrl || selectedPaper?.coverImage) && (
                <div className="rounded-xl overflow-hidden max-h-64 w-full border border-border/60">
                  <img
                    src={selectedPaper.imageUrl || selectedPaper.coverImage}
                    alt={selectedPaper.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="text-xs text-muted-foreground flex items-center justify-between border-b border-border/60 pb-2">
                <span>By {selectedPaper?.journalistName || "Student Journalist"}</span>
                {selectedPaper?.createdAt && (
                  <span>
                    Published on{" "}
                    {new Date(selectedPaper.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                )}
              </div>

              <div className="text-xs sm:text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                {selectedPaper?.content || selectedPaper?.overview || "No extended content text."}
              </div>

              {selectedPaper?.pdfUrl && (
                <div className="pt-2">
                  <Button
                    onClick={() => window.open(selectedPaper.pdfUrl, "_blank")}
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
    </DashboardLayout>
  );
}
