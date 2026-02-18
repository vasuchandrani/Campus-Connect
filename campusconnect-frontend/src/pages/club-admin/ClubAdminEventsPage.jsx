import { useEffect, useState } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
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
import { Plus, Clock, MapPin, Edit, Trash2, Eye } from "lucide-react";
import { clubAdminNavItems } from "../../config/Navigation";
import { useParams } from "react-router-dom";
import { toast } from "../../hooks/use-toast";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/Tabs";
import { useNavigate } from "react-router-dom";
import { FileText } from "lucide-react";
import { marked } from "marked";

const ClubAdminEventsPage = () => {
  // Get clubId from URL params
  let { clubId } = useParams();

  // Base URL for API calls related to this club
  const baseUrl = `http://localhost:8080/campus-connect/clubs/${clubId}/admin`;

  const navigate = useNavigate();

  //---------Navs------------//
  const updatenavItems = () => {
    return clubAdminNavItems.map((item) => ({
      ...item,
      href: item.href.replace(":clubId", clubId),
    }));
  };

  // State variables
  const [clubEvents, setClubEvents] = useState([]);
  const [dialogType, setDialogType] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [overviewEvent, setOverviewEvent] = useState(null);
  const [overviewTab, setOverviewTab] = useState("write");
  const [overviewMarkdown, setOverviewMarkdown] = useState("");
  const [overviewPhotos, setOverviewPhotos] = useState([]);
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    time: "",
    registrationEnd: "",
    location: "",
    description: "",
    image: "",
  });

  const renderedPreview = marked.parse(overviewMarkdown || "");

  //formate date and time for display
  const formatDate = (dateTime) => {
    if (!dateTime) return { date: "", time: "" };
    const [date, time] = dateTime.split("T");
    return { date, time: time.substring(0, 5) };
  };

  //1) Fetch club events
  const fetchClubEvents = () => {
    const token = localStorage.getItem("authToken");

    fetch(`${baseUrl}/events`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setClubEvents(data))
      .catch((err) => {
        toast({
          title: "Error",
          description: "Failed to fetch club events",
          status: "error",
        });
      });
  };

  // Create event on form submission
  const handleCreateEvent = () => {
    const token = localStorage.getItem("authToken");

    const eventDate = `${newEvent.date}T${newEvent.time}:00`;
    const registrationEnd = `${newEvent.registrationEnd}T23:59:59`;

    const payload = {
      title: newEvent.title,
      description: newEvent.description,
      location: newEvent.location,
      imageUrl: newEvent.image,
      eventDate,
      registrationEnd,
    };

    fetch(`${baseUrl}/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })
      .then(() => {
        toast({
          title: "Success",
          description: "Event created successfully",
          status: "success",
        });
        fetchClubEvents();
      })
      .catch((err) => {
        toast({
          title: "Error",
          description: "Failed to create event",
          status: "error",
        });
      });

    setCreateOpen(false);
    setNewEvent({
      title: "",
      date: "",
      time: "",
      registrationEnd: "",
      location: "",
      description: "",
      image: "",
    });
  };

  // Handle edit - save changes to event
  const handleSaveEdit = () => {
    const token = localStorage.getItem("authToken");

    const eventDate = `${selectedEvent.date}T${selectedEvent.time}:00`;
    const registrationEnd = `${selectedEvent.registrationEndDate}T23:59:59`;

    const payload = {
      title: selectedEvent.title,
      description: selectedEvent.description,
      location: selectedEvent.location,
      imageUrl: selectedEvent.image,
      eventDate,
      registrationEnd,
    };

    fetch(`${baseUrl}/events/${selectedEvent.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })
      .then(() => {
        fetchClubEvents();
        toast({
          title: "Success",
          description: "Event updated successfully",
          status: "success",
        });
      })
      .catch((err) => {
        toast({
          title: "Error",
          description: "Failed to update event",
          status: "error",
        });
      });

    setDialogType(null);
    setSelectedEvent(null);
  };

  // Handle delete event
  const handleDelete = (id) => {
    const token = localStorage.getItem("authToken");

    fetch(`${baseUrl}/events/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => {
        fetchClubEvents();
        toast({
          title: "Success",
          description: "Event deleted successfully",
          status: "success",
        });
      })
      .catch((err) => {
        toast({
          title: "Error",
          description: "Failed to delete event",
          status: "error",
        });
      });
  };

  const upcomingEvents = clubEvents.filter(
    (event) => new Date(event.eventDate) > new Date(),
  );
  const pastEvents = clubEvents.filter(
    (event) => new Date(event.eventDate) <= new Date(),
  );

  // load events on component mount and whenever clubId changes
  useEffect(() => {
    fetchClubEvents();
  }, [clubId]);

  const handleAddPhoto = () => {
    if (!newPhotoUrl.trim()) return;
    if (overviewPhotos.length >= 10) return;

    setOverviewPhotos([...overviewPhotos, newPhotoUrl.trim()]);
    setNewPhotoUrl("");
  };

  const handleRemovePhoto = (index) => {
    setOverviewPhotos(overviewPhotos.filter((_, i) => i !== index));
  };

  const handleGenerateOverview = async () => {
    setIsGenerating(true);

    // fake delay
    setTimeout(() => {
      setOverviewMarkdown(
        `## ${overviewEvent?.title}

This event was successfully conducted at ${overviewEvent?.location}.

### Highlights
- Amazing participation
- Interactive sessions
- Great feedback from attendees

Overall, the event was a big success 🎉`,
      );
      setIsGenerating(false);
    }, 1500);
  };

  //---------------------------UI---------------------------//

  return (
    <DashboardLayout navItems={updatenavItems()} title="Events">
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex justify-between">
          <div>
            <h1 className="text-3xl font-bold">Events</h1>
            <p className="text-muted-foreground">Manage your club events</p>
          </div>

          {/* CREATE */}
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </DialogTrigger>

            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Event</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 pt-4">
                <Label>Title</Label>
                <Input
                  placeholder="Event Title"
                  value={newEvent.title}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, title: e.target.value })
                  }
                />

                <Label>Image URL</Label>
                <Input
                  value={newEvent.image}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, image: e.target.value })
                  }
                />

                {newEvent.image && (
                  <img
                    src={newEvent.image}
                    className="w-full h-40 object-cover rounded-lg"
                  />
                )}

                <div className="grid grid-cols-2 gap-4">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, date: e.target.value })
                    }
                  />
                  <Label>Time</Label>
                  <Input
                    type="time"
                    value={newEvent.time}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, time: e.target.value })
                    }
                  />
                </div>

                <Label>Registration End Date</Label>
                <Input
                  type="date"
                  value={newEvent.registrationEnd}
                  onChange={(e) =>
                    setNewEvent({
                      ...newEvent,
                      registrationEnd: e.target.value,
                    })
                  }
                />
                <Label>Location</Label>
                <Input
                  placeholder="Location"
                  value={newEvent.location}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, location: e.target.value })
                  }
                />
                <Label>Description</Label>
                <Textarea
                  placeholder="Description"
                  value={newEvent.description}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, description: e.target.value })
                  }
                />

                <Button className="w-full" onClick={handleCreateEvent}>
                  Create Event
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* VIEW + EDIT DIALOG */}
        <Dialog
          open={dialogType !== null}
          onOpenChange={() => setDialogType(null)}
        >
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {dialogType === "view" ? "Event Details" : "Edit Event"}
              </DialogTitle>
            </DialogHeader>

            {selectedEvent && (
              <div className="space-y-4 pt-4">
                {selectedEvent.image && (
                  <img
                    src={selectedEvent.image}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                )}

                {dialogType === "view" ? (
                  <>
                    <p>
                      <strong>Title:</strong> {selectedEvent.title}
                    </p>
                    <p>
                      <strong>Description:</strong> {selectedEvent.description}
                    </p>
                    <p>
                      <strong>Location:</strong> {selectedEvent.location}
                    </p>
                    <p>
                      <strong>Date:</strong>{" "}
                      {formatDate(selectedEvent.eventDate).date}
                    </p>
                    <p>
                      <strong>Time:</strong>{" "}
                      {formatDate(selectedEvent.eventDate).time}
                    </p>
                    <p>
                      <strong>Registration End:</strong>{" "}
                      {formatDate(selectedEvent.registrationEnd).date}
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      {selectedEvent.status.replace(/"/g, "")}
                    </p>
                    <p>
                      <strong>Registered:</strong>{" "}
                      {selectedEvent.register ? "Yes" : "No"}
                    </p>
                  </>
                ) : (
                  <>
                    <Label>Image URL</Label>
                    <Input
                      value={selectedEvent.image}
                      onChange={(e) =>
                        setSelectedEvent({
                          ...selectedEvent,
                          image: e.target.value,
                        })
                      }
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={selectedEvent.date || ""}
                        onChange={(e) =>
                          setSelectedEvent({
                            ...selectedEvent,
                            date: e.target.value,
                          })
                        }
                      />
                      <Label>Time</Label>
                      <Input
                        type="time"
                        value={selectedEvent.time || ""}
                        onChange={(e) =>
                          setSelectedEvent({
                            ...selectedEvent,
                            time: e.target.value,
                          })
                        }
                      />
                    </div>

                    <Label>Registration End Date</Label>
                    <Input
                      type="date"
                      value={selectedEvent.registrationEndDate || ""}
                      onChange={(e) =>
                        setSelectedEvent({
                          ...selectedEvent,
                          registrationEndDate: e.target.value,
                        })
                      }
                    />
                    <Label>Location</Label>
                    <Input
                      value={selectedEvent.location}
                      onChange={(e) =>
                        setSelectedEvent({
                          ...selectedEvent,
                          location: e.target.value,
                        })
                      }
                    />
                    <Label>Description</Label>
                    <Textarea
                      value={selectedEvent.description}
                      onChange={(e) =>
                        setSelectedEvent({
                          ...selectedEvent,
                          description: e.target.value,
                        })
                      }
                    />

                    <Button onClick={handleSaveEdit} className="w-full">
                      Save Changes
                    </Button>
                  </>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Add Overview Dialog */}
        <Dialog
          open={!!overviewEvent}
          onOpenChange={(open) => {
            if (!open) {
              setOverviewEvent(null);
              setOverviewMarkdown("");
              setOverviewPhotos([]);
              setOverviewTab("write");
            }
          }}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Add Event Overview — {overviewEvent?.title}
              </DialogTitle>
              <DialogDescription>
                Write in Markdown and add event photos. Switch to Preview to see
                the rendered result.
              </DialogDescription>
            </DialogHeader>

            <Tabs
              value={overviewTab}
              onValueChange={setOverviewTab}
              className="w-full"
            >
              <TabsList className="w-full">
                <TabsTrigger value="write" className="flex-1">
                  Write
                </TabsTrigger>
                <TabsTrigger value="preview" className="flex-1">
                  Preview
                </TabsTrigger>
              </TabsList>

              {/* WRITE TAB */}
              <TabsContent value="write" className="space-y-4">
                <Textarea
                  placeholder="## Event Overview

Write your markdown here..."
                  className="min-h-[200px] font-mono text-sm"
                  value={overviewMarkdown}
                  onChange={(e) => setOverviewMarkdown(e.target.value)}
                />

                {/* PHOTOS */}
                <div className="space-y-3">
                  <Label>Event Photos ({overviewPhotos.length}/10)</Label>

                  <div className="flex gap-2">
                    <Input
                      placeholder="Paste image URL..."
                      value={newPhotoUrl}
                      onChange={(e) => setNewPhotoUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddPhoto();
                        }
                      }}
                      disabled={overviewPhotos.length >= 10}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddPhoto}
                      disabled={
                        overviewPhotos.length >= 10 || !newPhotoUrl.trim()
                      }
                    >
                      +
                    </Button>
                  </div>

                  {overviewPhotos.length > 0 && (
                    <div className="grid grid-cols-5 gap-2">
                      {overviewPhotos.map((photo, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={photo}
                            alt="event"
                            className="w-full h-16 object-cover rounded-md border"
                          />
                          <button
                            onClick={() => handleRemovePhoto(index)}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            x
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* PREVIEW TAB */}
              <TabsContent value="preview">
                <Card className="border-border/50">
                  <CardContent className="p-4 min-h-[200px]">
                    {overviewMarkdown ? (
                      <div
                        className="prose prose-sm  text-black"
                        dangerouslySetInnerHTML={{
                          __html: renderedPreview,
                        }}
                      />
                    ) : (
                      <p className="text-muted-foreground text-center py-8">
                        Nothing to preview yet. Write some markdown first.
                      </p>
                    )}
                  </CardContent>
                </Card>

                {overviewPhotos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    {overviewPhotos.map((photo, index) => (
                      <img
                        key={index}
                        src={photo}
                        alt="event"
                        className="w-full h-24 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleGenerateOverview}
                disabled={isGenerating}
              >
                {isGenerating ? "Generating..." : "Generate Overview"}
              </Button>

              <Button className="flex-1">Save Overview</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* EVENTS LIST WITH TABS */}
        <Tabs defaultValue="upcoming" className="mt-4">
          <TabsList>
            <TabsTrigger value="upcoming">
              Upcoming & Live ({upcomingEvents.length})
            </TabsTrigger>
            <TabsTrigger value="finished">
              Finished ({pastEvents.length})
            </TabsTrigger>
          </TabsList>

          {/* ================= UPCOMING TAB ================= */}
          <TabsContent value="upcoming" className="mt-6">
            <div className="grid md:grid-cols-3 gap-4">
              {upcomingEvents.map((event) => {
                const formatted = formatDate(event.eventDate);

                return (
                  <Card key={event.id} className="border-border/50">
                    {event.image && (
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                    )}

                    <CardContent className="p-6">
                      {/* 🔥 KEEP YOUR EXISTING ACTION BUTTONS */}
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedEvent(event);
                            setDialogType("view");
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const { date, time } = formatDate(event.eventDate);
                            const regEnd = formatDate(
                              event.registrationEnd,
                            ).date;

                            setSelectedEvent({
                              ...event,
                              date,
                              time,
                              registrationEndDate: regEnd,
                            });

                            setDialogType("edit");
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleDelete(event.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <h3 className="text-xl font-semibold mb-3">
                        {event.title}
                      </h3>

                      <p className="text-muted-foreground text-sm mb-4">
                        {event.description.substring(0, 100)}
                        {event.description.length > 100 && "..."}
                      </p>

                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>
                            {formatted.date} at {formatted.time}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{event.location}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* ================= FINISHED TAB (CHANGED UI) ================= */}
          <TabsContent value="finished" className="mt-6">
            <div className="grid md:grid-cols-3 gap-4">
              {pastEvents.map((event) => {
                const formatted = formatDate(event.eventDate);

                return (
                  <Card
                    key={event.id}
                    className="border-border/50 overflow-hidden"
                  >
                    {event.image && (
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                    )}

                    <CardContent className="p-6">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-xl font-semibold">{event.title}</h3>
                        <span className="text-xs bg-secondary px-2 py-1 rounded">
                          Finished
                        </span>
                      </div>

                      <p className="text-muted-foreground text-sm mb-4">
                        {event.description.substring(0, 120)}
                      </p>

                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>
                            {formatted.date} at {formatted.time}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{event.location}</span>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-center">
                        <Button
                          variant="outline"
                          className="w-auto"
                          onClick={() =>
                            navigate(
                              `/campus-connect/club-admin/${clubId}/events/${event.id}`,
                            )
                          }
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                        <Button
                          variant="secondary"
                          className="w-auto"
                          onClick={() => setOverviewEvent(event)}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Add Overview
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ClubAdminEventsPage;
