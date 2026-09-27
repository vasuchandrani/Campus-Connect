import "./StudentNotificationPage.css";
import { useEffect, useState } from "react";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import { studentNavItems } from "../../../config/Navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/Dialog";
import { toast } from "../../../hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import PageSkeleton from "../../../components/ui/PageSkeleton";
import AnnouncementCard from "../../../components/ui/AnnouncementCard";
import EmptyState from "../../../components/ui/EmptyState";
import { BellOff } from "lucide-react";
import { studentApi } from "../../../services/api";

const StudentNotificationPage = () => {
  // State variables
  const [announcements, setAnnouncements] = useState([]);
  const [viewAnnouncement, setViewAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { routeProtection } = useAuth();

  useEffect(() => {
    if (!routeProtection("STUDENT")) {
      navigate("/auth");
    }
  }, [navigate, routeProtection]);

  // Fetch notifications from followed clubs
  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const data = await studentApi.getNotifications();
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "Failed to fetch notifications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  return (
    <DashboardLayout
      navItems={studentNavItems}
      title="Notifications"
      bell={true}
    >
      {loading ? (
        <PageSkeleton variant="list" count={5} />
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Notifications</h1>
            <p className="text-muted-foreground text-sm">
              Recent updates and notices from your joined and followed clubs
            </p>
          </div>

          {/* Notifications List */}
          {announcements.length === 0 ? (
            <EmptyState
              className="pt-4"
              icon={<BellOff className="text-4xl text-muted-foreground mx-auto mb-4" />}
              title="No Notifications"
              desc="You are all caught up! There are no notifications right now."
            />
          ) : (
            <div className="space-y-4">
              {/* Notification details dialog */}
              <Dialog
                open={!!viewAnnouncement}
                onOpenChange={(open) => !open && setViewAnnouncement(null)}
              >
                <DialogContent className="max-h-[90vh] max-w-lg w-full overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Notification Details</DialogTitle>
                  </DialogHeader>

                  {viewAnnouncement && (
                    <div className="space-y-4 pt-2 text-sm">
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Title
                        </p>
                        <p className="font-semibold text-base sm:text-lg mt-0.5">
                          {viewAnnouncement.title}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Date & Time
                        </p>
                        <p className="text-muted-foreground mt-0.5">
                          {viewAnnouncement.createdAt?.split("T")[0]} at{" "}
                          {viewAnnouncement.createdAt?.split("T")[1]?.split(".")[0]}
                        </p>
                      </div>

                      {viewAnnouncement.clubName && (
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Club
                          </p>
                          <p className="font-medium text-muted-foreground mt-0.5">
                            {viewAnnouncement.clubName}
                          </p>
                        </div>
                      )}

                      <div className="pt-2 border-t border-border">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                          Content
                        </p>
                        <p className="text-foreground leading-relaxed whitespace-pre-line">
                          {viewAnnouncement.content}
                        </p>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>

              {announcements.map((a) => (
                <AnnouncementCard
                  key={a.id}
                  announcement={a}
                  onView={() => setViewAnnouncement(a)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default StudentNotificationPage;
