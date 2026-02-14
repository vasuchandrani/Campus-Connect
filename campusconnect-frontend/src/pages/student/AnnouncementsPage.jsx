import { useEffect, useState } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { Card, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { studentNavItems } from "../../config/Navigation";
import { Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/Dialog";
import { Button } from "../../components/ui/Button";
import { toast } from "../../hooks/use-toast";


const AnnouncementsPage = () => {
  // State variables
  const [announcements, setAnnouncements] = useState([]);
  const [viewAnnouncement, setViewAnnouncement] = useState(null);
  // Base URL for API calls related to student announcements
  const baseUrl = "http://localhost:8080/campus-connect/student";

  // Fetch announcements 
  const fetchAnnouncements = () => {
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
          description: "Failed to fetch announcements",
          status: "error",
        });
      });
  };

  // Load announcements on component mount
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  return (
    <DashboardLayout navItems={studentNavItems} title="Announcements">
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
        {announcements.length === 0 ? (
          <EmptyState
            icon={<i className="ph ph-megaphone-simple text-4xl" />}
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


//-----------------------------HELPER COMPONENTS----------------------------//

const EmptyState = ({ icon, title, desc }) => (
  <Card className="border-dashed ">
    <CardContent className="p-8 text-center">
      {icon}
      <h4 className="font-medium mt-4">{title}</h4>
      <p className="text-sm text-muted-foreground">{desc}</p>
    </CardContent>
  </Card>
);

const AnnouncementCard = ({ announcement, onView }) => (
  <Card className="mb-3 pt-4">
    <CardContent className="p-4 flex justify-between items-start gap-4">
      {/* Left side: Text */}
      <div>
        <div className="flex gap-2 mb-1">
          <Badge variant="outline">{announcement.clubName}</Badge>
        </div>
        <h4 className="font-medium">{announcement.title}</h4>
        
        <p className="text-sm text-muted-foreground line-clamp-2">
          {announcement.content.substring(0, 35) + (announcement.content.length > 35 ? '...' : '')}
        </p>
      </div>

      {/* Right side: Eye button and date */}
      <div className="flex flex-col items-end gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onView} 
        >
          <Eye className="w-4 h-4" />
        </Button>
        <span className="text-xs text-muted-foreground">{announcement.createdAt.split("T")[0]} at {announcement.createdAt.split("T")[1].split(".")[0]}</span>
      </div>
    </CardContent>
  </Card>
);


export default AnnouncementsPage;
