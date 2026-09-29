import "./ClubAdminAnnouncementsPage.css";
import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import { Card, CardContent } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Input } from "../../../components/ui/Input";
import { Textarea } from "../../../components/ui/Textarea";
import { Label } from "../../../components/ui/Label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from "../../../components/ui/Dialog";
import { MarkdownEditor } from "../../../components/ui/MarkdownEditor";
import { MarkdownViewer } from "../../../components/ui/MarkdownViewer";
import { Megaphone, Plus, Eye, Edit, Trash2, Calendar } from "lucide-react";
import { clubAdminNavItems } from "../../../config/Navigation";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "../../../hooks/use-toast";
import PageSkeleton from "../../../components/ui/PageSkeleton";
import EmptyState from "../../../components/ui/EmptyState";
import { useAuth } from "../../../contexts/AuthContext";
import { clubAdminApi } from "../../../services/api";

const ClubAdminAnnouncementsPage = () => {
  //Take clubId from URL params
  const { clubId } = useParams();
  const { isClubAdmin } = useAuth();
  const navigate = useNavigate();

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

  const [requesting, setRequesting] = useState(false);

  const [loading, setLoading] = useState(true);
  /* ---------------- NAV ---------------- */

  const updatenavItems = useCallback(() => {
    return clubAdminNavItems.map((item) => ({
      ...item,
      href: item.href.replace(":clubId", clubId),
    }));
  }, [clubId]);

  //Fetching Data from backend
  //1) Fetch club announcements
  const fetchClubAnnouncements = async () => {
    setLoading(true);
    try {
      const data = await clubAdminApi.getAnnouncements(clubId);
      setClubAnnouncements(data || []);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load announcements",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  //2) Create or Update announcement based on whether we're in edit mode or not
  const handleSubmit = async () => {
    setRequesting(true);
    const payload = {
      title: newTitle,
      content: newContent,
    };

    try {
      let res;
      if (editingId) {
        res = await clubAdminApi.updateAnnouncement(clubId, editingId, payload);
      } else {
        res = await clubAdminApi.createAnnouncement(clubId, payload);
      }

      toast({
        title: "Success",
        description: res?.message || (editingId ? "Announcement updated successfully" : "Announcement created successfully"),
        variant: "success",
      });
      fetchClubAnnouncements();
      resetForm();
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "Failed to save announcement",
        variant: "destructive",
      });
    } finally {
      setRequesting(false);
    }
  };

  //3) Delete announcement
  const deleteAnnouncement = async (id) => {
    setRequesting(true);
    try {
      const data = await clubAdminApi.deleteAnnouncement(clubId, id);
      toast({
        title: "Success",
        description: data?.message || "Announcement deleted successfully",
        variant: "success",
      });
      fetchClubAnnouncements();
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "Failed to delete announcement",
        variant: "destructive",
      });
    } finally {
      setRequesting(false);
    }
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
    const checkAdminAndFetchData = async () => {
      try {
        const admin = await isClubAdmin(clubId);
        if (!admin) {
          toast({
            title: "Unauthorized",
            description: "You are not an admin of this club",
            variant: "destructive",
          });
          navigate(-1);
          return;
        }
        fetchClubAnnouncements();
      } catch (error) {
        toast({
          title: "Unauthorized",
          description: "You are not an admin of this club",
          variant: "destructive",
        });
        navigate(-1);
        return;
       }
      };
      checkAdminAndFetchData();
  }, [clubId]);

  /* ---------------- UI ---------------- */
  if (loading) {
    return (
      <DashboardLayout navItems={updatenavItems()} title="Announcements">
        <PageSkeleton variant="cards" />
      </DashboardLayout>
    );
  }

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
              <Button onClick={() =>{ 
                resetForm();
               setEditingId(null)}} disabled={requesting}>
                <Plus className="w-4 h-4 mr-2" />
                New Announcement
              </Button>
            </DialogTrigger>

            <DialogContent className="max-h-[90vh] overflow-y-auto">
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
                  <MarkdownEditor
                    value={newContent}
                    onChange={(val) => setNewContent(val)}
                    placeholder="Write announcement in Markdown..."
                    rows={6}
                  />
                </div>

                <Button className="w-full" onClick={handleSubmit} disabled={requesting}>
                  {editingId
                    ? "Update Announcement"
                    : "Publish Announcement"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* View Announcement Dialog */}
        {/* View Dialog */}
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
                    content={viewAnnouncement.content || viewAnnouncement.message || viewAnnouncement.description}
                  />
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* List of Announcements */}
        <div className="space-y-4">
          {/* If no announcements, show empty state */}
          {clubAnnouncements.length === 0 ? (
            <EmptyState
              title="No Announcements"
              desc="You haven't created any announcements yet."
              icon={<Megaphone className="text-4xl" />} />
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
                        disabled={requesting}
                        onClick={() => setViewAnnouncement(announcement) }
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
                        disabled={requesting}
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
