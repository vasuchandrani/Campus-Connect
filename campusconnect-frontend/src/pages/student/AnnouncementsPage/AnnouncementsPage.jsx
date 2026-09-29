import "./AnnouncementsPage.css";
import { useEffect, useState, useMemo } from "react";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import { studentNavItems } from "../../../config/Navigation";
import { Card, CardContent } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../../components/ui/Dialog";
import { MarkdownViewer } from "../../../components/ui/MarkdownViewer";
import { toast } from "../../../hooks/use-toast";
import { useAuth } from "../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import PageSkeleton from "../../../components/ui/PageSkeleton";
import EmptyState from "../../../components/ui/EmptyState";
import { Megaphone, Search, Calendar, Users, Eye } from "lucide-react";
import { announcementApi } from "../../../services/api";

const AnnouncementsPage = () => {
  // State variables
  const [announcements, setAnnouncements] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewAnnouncement, setViewAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { routeProtection } = useAuth();

  useEffect(() => {
    if (!routeProtection("STUDENT")) {
      navigate("/auth");
    }
  }, [navigate, routeProtection]);

  // Fetch club announcements
  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const data = await announcementApi.getAnnouncements();
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "Failed to fetch club announcements",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const filteredAnnouncements = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return announcements.filter(
      (ann) =>
        (ann.title && ann.title.toLowerCase().includes(term)) ||
        (ann.clubName && ann.clubName.toLowerCase().includes(term)) ||
        (ann.message && ann.message.toLowerCase().includes(term)) ||
        (ann.description && ann.description.toLowerCase().includes(term)) ||
        (ann.content && ann.content.toLowerCase().includes(term))
    );
  }, [announcements, searchTerm]);

  return (
    <DashboardLayout navItems={studentNavItems} title="Announcements" bell={true}>
      {loading ? (
        <PageSkeleton variant="list" count={5} />
      ) : (
        <div className="space-y-5 sm:space-y-6 max-w-5xl mx-auto w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Megaphone className="w-6 h-6 text-primary" />
                <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                  Campus Club Announcements
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Official circulars, updates, and notices broadcasted by student clubs across the college
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search announcements, clubs..."
                className="pl-9 h-9 text-xs sm:text-sm"
              />
            </div>
          </div>

          {/* Announcements List */}
          {filteredAnnouncements.length === 0 ? (
            <Card className="border-dashed border-border/80">
              <CardContent className="py-12">
                <EmptyState
                  icon={Megaphone}
                  title={searchTerm ? "No Matching Announcements" : "No Announcements Found"}
                  description={
                    searchTerm
                      ? `No announcements matching "${searchTerm}".`
                      : "No club announcements have been published in your college yet."
                  }
                />
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3.5">
              {filteredAnnouncements.map((ann, idx) => (
                <Card
                  key={ann.id || idx}
                  className="border-border/80 hover:border-primary/40 hover:shadow-xs transition-all duration-200"
                >
                  <CardContent className="p-4 sm:p-5 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant="outline"
                          className="text-xs font-semibold bg-primary/5 text-primary border-primary/20 flex items-center gap-1"
                        >
                          <Users className="w-3 h-3" />
                          {ann.clubName || "Campus Club"}
                        </Badge>
                        <h3 className="text-base sm:text-lg font-bold text-foreground">
                          {ann.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        <span>
                          {ann.createdAt
                            ? new Date(ann.createdAt).toLocaleDateString(undefined, {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                            : "Recently"}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                      {ann.message || ann.description || ann.content}
                    </p>

                    <div className="pt-2 flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewAnnouncement(ann)}
                        className="text-xs text-muted-foreground hover:text-primary h-7 px-2"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        View Full Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Announcement details dialog */}
          <Dialog
            open={!!viewAnnouncement}
            onOpenChange={(open) => !open && setViewAnnouncement(null)}
          >
            <DialogContent className="max-h-[90vh] max-w-lg w-full overflow-y-auto rounded-2xl p-4 sm:p-6">
              <DialogHeader>
                <div className="space-y-1">
                  <Badge
                    variant="outline"
                    className="text-xs font-semibold bg-primary/5 text-primary border-primary/20 mb-1"
                  >
                    {viewAnnouncement?.clubName || "Campus Club Announcement"}
                  </Badge>
                  <DialogTitle className="text-lg sm:text-xl font-bold text-foreground">
                    {viewAnnouncement?.title}
                  </DialogTitle>
                  <DialogDescription className="sr-only">Announcement details</DialogDescription>
                </div>
              </DialogHeader>

              {viewAnnouncement && (
                <div className="space-y-4 pt-2 text-sm">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground border-b border-border/60 pb-2">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    <span>
                      {viewAnnouncement.createdAt
                        ? new Date(viewAnnouncement.createdAt).toLocaleString()
                        : "Recently"}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      Official Notice & Content
                    </h4>
                    <MarkdownViewer
                      content={viewAnnouncement.message || viewAnnouncement.description || viewAnnouncement.content}
                    />
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AnnouncementsPage;
