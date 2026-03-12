import { useState, useEffect } from "react";
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
  DialogDescription
} from "../../components/ui/Dialog";
import { Megaphone, Plus, Eye, Edit, Trash2 } from "lucide-react";
import { clubAdminNavItems } from "../../config/Navigation";
import { useParams } from "react-router-dom";
import { toast } from "../../hooks/use-toast";

const ClubAdminAnnouncementsPage = () => {
  //Take clubId from URL params
  const { clubId } = useParams();
  //Base URL for API calls
  const baseurl = `http://localhost:8080/campus-connect/clubs/${clubId}/admin`;

  // State for announcements list and currently viewed announcement
  const [clubAnnouncements, setClubAnnouncements] = useState([]);
  const [viewAnnouncement, setViewAnnouncement] = useState(null);
  
  //Editing state
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  //Dialog states
  const [createOpen, setCreateOpen] = useState(false);
  // For edit mode, store the ID of the announcement being edited
  const [editingId, setEditingId] = useState(null);

  /* ---------------- NAV ---------------- */

  const updatenavItems = () => {
    return clubAdminNavItems.map((item) => ({
      ...item,
      href: item.href.replace(":clubId", clubId),
    }));
  };

  //Fetching Data from backend
  //1) Fetch club announcements
  const fetchClubAnnouncements = () => {
    fetch(`${baseurl}/announcements`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setClubAnnouncements(data))
      .catch(() => {
        toast({
          title: "Error",
          description: "Failed to load announcements",
          status: "error",
        });
      });
  };

  //2) Create or Update announcement based on whether we're in edit mode or not
  const handleSubmit = () => {
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
      .then((res) => {
        if (!res.ok) throw new Error("Request failed");
        return res.json();
      })
      .then((res) => {
        toast({
          title: "Success",
          description: res.message,
          status: "success",
        });
        fetchClubAnnouncements();
        resetForm();
      })
      .catch(() => {
        toast({
          title: "Error",
          description: "Operation failed",
          status: "error",
        });
      });
  };

  //3) Delete announcement
  const deleteAnnouncement = (id) => {
    fetch(`${baseurl}/announcements/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          toast({
            title: "Success",
            description: data.message,
            status: "success",
          });
          fetchClubAnnouncements();
        } else throw new Error();
      })
      .catch(() => {
        toast({
          title: "Error",
          description: "Failed to delete announcement",
          status: "error",
        });
      });
  };

  //Handle edit - populate form with existing data and open dialog
  const editAnnouncement = (announcement) => {
    setNewTitle(announcement.title);
    setNewContent(announcement.content);
    setEditingId(announcement.id);
    setCreateOpen(true);
  };

  //Reset form state after submission or when opening create dialog
  const resetForm = () => {
    setNewTitle("");
    setNewContent("");
    setEditingId(null);
    setCreateOpen(false);
  };

  //Fetch announcements on component mount and whenever clubId changes
  useEffect(() => {
    fetchClubAnnouncements();
  }, [clubId]);


  /* ---------------- UI ---------------- */

  return (
    <DashboardLayout navItems={updatenavItems()} title="Announcements">
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Announcements</h1>
            <p className="text-muted-foreground">
              Manage your club announcements
            </p>
          </div>

          {/* Create Announcement Button And Dialog */}
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingId(null)}>
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

                <Button className="w-full" onClick={handleSubmit}>
                  {editingId
                    ? "Update Announcement"
                    : "Publish Announcement"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* View Announcement Dialog */}
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

        {/* List of Announcements */}
        <div className="space-y-4">
          {/* If no announcements, show empty state */}
          {clubAnnouncements.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Megaphone className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No Announcements Yet
                </h3>
              </CardContent>
            </Card>
          ) : (
            clubAnnouncements.map((announcement) => (
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
                        onClick={() => setViewAnnouncement(announcement)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => editAnnouncement(announcement)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => deleteAnnouncement(announcement.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClubAdminAnnouncementsPage;
