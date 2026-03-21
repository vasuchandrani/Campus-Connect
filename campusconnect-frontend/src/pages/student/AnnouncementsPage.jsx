import { useEffect, useState } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { Card, CardContent } from "../../components/ui/Card";
import { studentNavItems } from "../../config/Navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/Dialog";
import { toast } from "../../hooks/use-toast";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Loading from "../../components/ui/Loading";
import AnnouncementCard from "../../components/ui/AnnouncementCard";
import EmptyState from "../../components/ui/EmptyState";
import {MegaphoneOff} from "lucide-react";


const AnnouncementsPage = () => {
  // State variables
  const [announcements, setAnnouncements] = useState([]);
  const [viewAnnouncement, setViewAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  // Base URL for API calls related to student announcements
  const baseUrl = `${import.meta.env.VITE_BACKEND_URL}/campus-connect/student`;
  const navigate=useNavigate();
  const { routeProtection } = useAuth();
  useEffect(() => {
    if (!routeProtection("STUDENT")) {
      navigate("/auth");
    }
  },[navigate,routeProtection]);

  // Fetch announcements 
  const fetchAnnouncements = () => {
    setLoading(true);
    fetch(`${baseUrl}/announcements`, {
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
          description: err.message||"Failed to fetch announcements",
          variant:"destructive",
        });
      }).finally(() => {
        setLoading(false);
      });
  };

  // Load announcements on component mount
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  return (
    <DashboardLayout navItems={studentNavItems} title="Announcements" bell={true}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Announcements</h1>
          <p className="text-muted-foreground">
            Stay updated with club announcements
          </p>
        </div>
        {/* Announcements List */}
        {/* If no announcements, show empty state */}
        {loading ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Loading />
            </CardContent>
          </Card>
        ) :
        announcements.length === 0 ? (
          <EmptyState className="pt-4"
            icon={<MegaphoneOff className="text-4xl" />}
            title="No Announcements"
            desc="There are no announcements at the moment."
          />
        ) : (
          <div>

            {/* Announcement details dialog */}
            <Dialog
              open={!!viewAnnouncement}
              onOpenChange={(open) => !open && setViewAnnouncement(null)}
            >
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Announcement Details</DialogTitle>
                  
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
                      <p>{viewAnnouncement.createdAt.split("T")[0]} at {viewAnnouncement.createdAt.split("T")[1].split(".")[0]}</p>
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
            <AnnouncementCard key={a.id} announcement={a} onView={() => setViewAnnouncement(a)} />
          ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};


export default AnnouncementsPage;
