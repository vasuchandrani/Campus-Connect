import { useEffect, useState } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { Card, CardContent } from "../../components/ui/Card";
import { studentNavItems } from "../../config/Navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/Dialog";
import { toast } from "../../hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Loading from "../../components/ui/Loading";
import AnnouncementCard from "../../components/ui/AnnouncementCard";
import EmptyState from "../../components/ui/EmptyState";
import {BellOff} from "lucide-react";

const StudentNotificationPage = () => {
  // State variables
  const [announcements, setAnnouncements] = useState([]);
  const [viewAnnouncement, setViewAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  // Base URL for API calls related to student announcements
  const baseUrl = `${import.meta.env.VITE_BACKEND_URL}/campus-connect/student`;

  const navigate = useNavigate();
  const { routeProtection } = useAuth();
  useEffect(() => {
    if (!routeProtection("STUDENT")) {
      navigate("/auth");
    }
  }, [navigate, routeProtection]);
  // Fetch announcements
  const fetchAnnouncements = () => {
    setLoading(true);
    fetch(`${baseUrl}/notifications`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setAnnouncements(data);
      })
      .catch((err) => {
        toast({
          title: "Error",
          description: "Failed to fetch notifications",
          variant: "destructive",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Load notifications on component mount
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  if (loading) {
    return (
      <DashboardLayout
        navItems={studentNavItems}
        title="Notifications"
        bell={true}
      >
        <Card>
          <CardContent className="p-6 text-center">
            <Loading />
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      navItems={studentNavItems}
      title="Notifications"
      bell={true}
    >
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            Stay updated with notifications
          </p>
        </div>
        {/* Notifications List */}
        {/* If no notifications, show empty state */}
        {announcements.length === 0 ? (
          <EmptyState
            icon={<BellOff className="text-4xl" />}
            title="No Notifications"
            desc="There are no notifications at the moment."
          />
        ) : (
          <div>
            {/* Notification details dialog */}
            <Dialog
              open={!!viewAnnouncement}
              onOpenChange={(open) => !open && setViewAnnouncement(null)}
            >
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Notification Details</DialogTitle>
                </DialogHeader>

                {viewAnnouncement && (
                  <div className="space-y-4 pt-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Title
                      </p>
                      <p className="font-semibold text-lg">
                        {viewAnnouncement.title}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Date
                      </p>
                      <p>
                        {viewAnnouncement.createdAt.split("T")[0]} at{" "}
                        {viewAnnouncement.createdAt.split("T")[1].split(".")[0]}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Content
                      </p>
                      <p>{viewAnnouncement.content}</p>
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
    </DashboardLayout>
  );
};

//-----------------------------HELPER COMPONENTS----------------------------//

export default StudentNotificationPage;
