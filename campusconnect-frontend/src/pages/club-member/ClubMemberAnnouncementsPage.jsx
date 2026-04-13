import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { Label } from "../../components/ui/Label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "../../components/ui/Dialog";
import { Megaphone, Plus, Eye, Edit, Trash2 } from "lucide-react";
import { clubMemberNavItems } from "../../config/Navigation";
import { useParams } from "react-router-dom";
import { toast } from "../../hooks/use-toast";
import Loading from "../../components/ui/Loading"
import EmptyState from "../../components/ui/EmptyState"

const ClubMemberAnnouncementsPage = () => {
  
  // Get clubId from URL params
  const { clubId } = useParams();

  // Base URL for API calls related to this club
  const baseurl = `${import.meta.env.VITE_BACKEND_URL}/campus-connect/clubs/${clubId}/member`;

  // State variables
  const [clubAnnouncements, setClubAnnouncements] = useState([]);
  const [viewAnnouncement, setViewAnnouncement] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); 
  const [requesting, setRequesting] = useState(false);
  const [loading,setLoading]=useState(true);

  /* ---------------- NAV ITEMS ---------------- */

  const updateNavItems = useCallback(() => {
    return clubMemberNavItems.map((item) => ({
      ...item,
      href: item.href.replace(":clubId", clubId),
    }));
  }, [clubId]);

  // Fetch announcements for this club
  const fetchAnnouncements = () => {
    setLoading(true);
    fetch(`${baseurl}/announcements`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setClubAnnouncements(data))
      .catch((err) => {
        toast({
          title: "Error",
          description: "Failed to fetch announcements",
          status: "error",
        });
      }).finally(()=>{
        setLoading(false);
      })
  };

  // Create or update an announcement
  const handleSubmit = async() => {
    setRequesting(true);
    const payload = {
      title: newTitle,
      content: newContent,
    };

    const method = editingId ? "PATCH" : "POST";
    const url = editingId
      ? `${baseurl}/announcements/${editingId}`
      : `${baseurl}/announcements`;

    fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Failed request");
        }
        return await res.json();
      })
      .then((res) => {
        if((!editingId && res.message==="Announcement created successfully")||
      (editingId && res.message==="Announcement updated successfully")){
        toast({
          title: "Success",
          description: res.message,
          variant: "success",
        });
        fetchAnnouncements();
        resetForm();
      } else {
        toast({
          title: "Error",
          description: res.message || "Operation failed",
          variant: "destructive",
        });
      }

      })
      .catch((err) => {
        toast({
          title: "Error",
          description: err.message || "Operation failed",
          variant: "destructive",
        });
      })
      .finally(() => {
        setRequesting(false);
      });
  };

  // Delete an announcement
  const deleteAnnouncement = async (id) => {
    setRequesting(true);
    fetch(`${baseurl}/announcements/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    })
      .then(async (res) => {
        const data = await res.json();
        if(data.message === "Announcement deleted successfully") {
          toast({
            title: "Success",
            description: data.message,
            variant: "success",
          });
          fetchAnnouncements();
        }
        else throw new Error(data.message || "Failed to delete announcement");
      })
      .catch((err) => {
        toast({
          title: "Error",
          description: err.message || "Failed to delete announcement",
          variant: "destructive",
        });
      }).finally(() => {
        setRequesting(false);
      });
  };

  // Populate form for editing
  const editAnnouncement = (announcement) => {
    setNewTitle(announcement.title);
    setNewContent(announcement.content);
    setEditingId(announcement.id); 
    setCreateOpen(true);
  };

  //clean up form after submission or when opening create dialog
  const resetForm = () => {
    setNewTitle("");
    setNewContent("");
    setEditingId(null);
    setCreateOpen(false);
  };

  //load announcements on component mount and whenever clubId changes
  useEffect(() => {
    fetchAnnouncements();
  }, [clubId]);

  /* ---------------- UI ---------------- */

    if (loading) {
    return (
       <DashboardLayout navItems={updateNavItems()} title="Announcements">
        <Loading/>
       </DashboardLayout>

    )
  }

  if(!loading && clubAnnouncements.length === 0){
    return (
      <DashboardLayout navItems={updateNavItems()} title="Announcements">
        <EmptyState
          icon={<Megaphone className="text-4xl" />}
          title="No Announcements"
          desc="There are no announcements for this club yet."
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={updateNavItems()} title="Announcements">
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Announcements</h1>
            <p className="text-muted-foreground">
              Manage your club announcements
            </p>
          </div>

          {/* Create Announcement Button */}
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button onClick={() =>{
                resetForm();
               setEditingId(null)}} disabled={requesting}>
                <Plus className="w-4 h-4 mr-2" />
                New Announcement
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Edit Announcement" : "Create Announcement"}
                </DialogTitle>
              </DialogHeader>
              <DialogDescription></DialogDescription>

              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Content</Label>
                  <Textarea
                    className="min-h-32"
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                  />
                </div>

                <Button className="w-full" onClick={handleSubmit} disabled={requesting}>
                  {editingId ? "Update Announcement" : "Publish Announcement"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* View Dialog */}
        <Dialog
          open={!!viewAnnouncement}
          onOpenChange={(open) => !open && setViewAnnouncement(null)}
        >
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Announcement Details</DialogTitle>
            </DialogHeader>
            <DialogDescription></DialogDescription>

            {viewAnnouncement && (
              <div className="space-y-4 pt-4">
                <p><strong>Title:</strong> {viewAnnouncement.title}</p>
                <p>
                  <strong>Date:</strong>{" "}
                  {viewAnnouncement.createdAt.split("T")[0]} at{" "}
                  {viewAnnouncement.createdAt.split("T")[1].split(".")[0]}
                </p>
                <p><strong>Content:</strong> {viewAnnouncement.content}</p>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Announcement List */}
        <div className="space-y-4">
            {clubAnnouncements.map((announcement) => (
              <Card key={announcement.id}>
                <CardContent className="pt-4">
                  <div className="flex justify-between">
                    <div>
                      <Badge variant="outline">
                        {announcement.createdAt.split("T")[0]} at{" "}
                        {announcement.createdAt.split("T")[1].split(".")[0]}
                      </Badge>

                      <h3 className="text-xl font-semibold mt-2">
                        {announcement.title}
                      </h3>

                      <p className="text-muted-foreground">
                        {announcement.content.substring(0, 100)}
                        {announcement.content.length > 100 && "..."}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={requesting}
                        onClick={() => setViewAnnouncement(announcement)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={requesting}
                        onClick={() => editAnnouncement(announcement)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        disabled={requesting}
                        onClick={() => deleteAnnouncement(announcement.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClubMemberAnnouncementsPage;
