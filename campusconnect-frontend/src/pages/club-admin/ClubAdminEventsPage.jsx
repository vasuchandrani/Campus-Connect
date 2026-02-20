import { useEffect, useState, useMemo } from "react";
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
import { Badge } from "../../components/ui/Badge";

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
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [dialogType, setDialogType] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [overviewEvent, setOverviewEvent] = useState(null);
  const [overviewTab, setOverviewTab] = useState("write");
  const [overviewMarkdown, setOverviewMarkdown] = useState("");
  const [overviewPhotos, setOverviewPhotos] = useState([]);
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isOverviewOpen, setIsOverviewOpen] = useState(false);
  const [speakers, setSpeakers] = useState([]);
  const [newSpeaker, setNewSpeaker] = useState({
    name: "",
    email: "",
    tagline: "",
  });
  const [sponsors, setSponsors] = useState([]);
  const [newSponsor, setNewSponsor] = useState({ name: "", tagline: "" });

  const [winners, setWinners] = useState([]);
  const [newWinner, setNewWinner] = useState({ name: "", email: "" });

  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    time: "",
    endDate: "",
    endTime: "",
    registrationEnd: "",
    location: "",
    description: "",
    image: "",
    speakers: [],
    sponsors: [],
  });

  //preview for overview
  const renderedPreview = marked.parse(overviewMarkdown || "");

  //formate date and time for display
  const formatDate = (dateTime) => {
    if (!dateTime) return { date: "", time: "" };
    const [date, time] = dateTime.split("T");
    return { date, time: time.substring(0, 5) };
  };

  // Fetch club events
  const fetchClubEvents = async () => {
    const token = localStorage.getItem("authToken");

    fetch(`${baseUrl}/events/finished`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setPastEvents(data);
      })
      .catch((err) =>
        toast({
          title: "Error",
          description: "Failed to fetch events",
          status: "error",
        }),
      );

    fetch(`${baseUrl}/events/active`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setUpcomingEvents(data);
      })
      .catch((err) =>
        toast({
          title: "Error",
          description: "Failed to fetch upcoming events",
          status: "error",
        }),
      );
  };

  // Create event on form submission
  const handleCreateEvent = () => {
    const token = localStorage.getItem("authToken");

    const eventDate = `${newEvent.date}T${newEvent.time}:00`;
    const registrationEnd = `${newEvent.registrationEnd}T23:59:59`;
    const endDate = `${newEvent.endDate}T${newEvent.endTime}:00`;

    const payload = {
      title: newEvent.title,
      description: newEvent.description,
      location: newEvent.location,
      imageUrl: newEvent.image,
      eventDate,
      registrationEnd,
      endDate,
      speakers,
      sponsors,
    };

    fetch(`${baseUrl}/events/active`, {
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
      endDate: "",
      endTime: "",
    });
  };

  // Handle edit - save changes to event
  const handleSaveEdit = () => {
    const token = localStorage.getItem("authToken");

    const eventDate = `${selectedEvent.date}T${selectedEvent.time}:00`;
    const registrationEnd = `${selectedEvent.registrationEndDate}T23:59:59`;
    const endDate = `${selectedEvent.endDate}T${selectedEvent.endTime}:00`;

    const payload = {
      title: selectedEvent.title,
      description: selectedEvent.description,
      location: selectedEvent.location,
      imageUrl: selectedEvent.image,
      eventDate,
      registrationEnd,
      endDate,
      speakers: speakers,
      sponsors: sponsors,
    };

    fetch(`${baseUrl}/events/active/${selectedEvent.id}`, {
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

    fetch(`${baseUrl}/events/active/${id}`, {
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

  // load events on component mount and whenever clubId changes
  useEffect(() => {
    fetchClubEvents();
  }, [clubId]);

  //add photo to overview photos array
  const handleAddPhoto = () => {
    if (!newPhotoUrl.trim()) return;
    if (overviewPhotos.length >= 10) return;

    setOverviewPhotos([...overviewPhotos, newPhotoUrl.trim()]);
    setNewPhotoUrl("");
  };

  //sort events - live events first, then upcoming sorted by registration status and date
  const sortedEvents = useMemo(() => {
    const statusPriority = {
      LIVE: 1,
      UPCOMING: 2,
    };

    return [...upcomingEvents].sort((a, b) => {
      const statusDiff =
        (statusPriority[a.status] || 99) - (statusPriority[b.status] || 99);

      if (statusDiff !== 0) return statusDiff;

      if (a.status === "UPCOMING") {
        if (a.register && !b.register) return -1;
        if (!a.register && b.register) return 1;

        return new Date(a.eventDate) - new Date(b.eventDate);
      }

      return 0;
    });
  }, [upcomingEvents]);

  //remove photo from overview photos array
  const handleRemovePhoto = (index) => {
    setOverviewPhotos(overviewPhotos.filter((_, i) => i !== index));
  };

  // Generate overview using AI
  const handleGenerateOverview = async () => {
    const token = localStorage.getItem("authToken");

    setIsGenerating(true);
    await fetch(
      `${baseUrl}/events/finished/${overviewEvent.id}/generate-overview`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    )
      .then(async (response) => {
        if (response.ok) {
          const data = await response.text();
          setOverviewMarkdown(data);
          toast({
            title: "Success",
            description: "Overview generated successfully",
            status: "success",
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to generate overview",
            status: "error",
          });
        }
      })
      .catch((err) => {
        toast({
          title: "Error",
          description: "Failed to generate overview",
          status: "error",
        });
      });
    setIsGenerating(false);
  };

  // Save overview to database
  const handleSaveOverview = async () => {
    setIsSaving(true);

    const token = localStorage.getItem("authToken");
    await fetch(
      `${baseUrl}/events/finished/${overviewEvent.id}/save-overview`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          overview: overviewMarkdown,
          imageUrls: overviewPhotos,
          winners: winners,
        }),
      },
    )
      .then((response) => {
        if (response.ok) {
          toast({
            title: "Success",
            description: "Overview saved successfully",
            status: "success",
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to save overview",
            status: "error",
          });
        }
      })
      .catch((err) => {
        toast({
          title: "Error",
          description: "Failed to save overview",
          status: "error",
        });
      });
    setIsSaving(false);
    setIsOverviewOpen(false);
  };

  //add speaker to speakers array
  const handleAddSpeaker = () => {
    if (!newSpeaker.name.trim() || !newSpeaker.email.trim()) return;

    setSpeakers([...speakers, newSpeaker]);
    setNewSpeaker({ name: "", email: "", tagline: "" });
  };

  //remove speaker from speakers array
  const handleRemoveSpeaker = (index) => {
    setSpeakers(speakers.filter((_, i) => i !== index));
  };

  //add sponsor to sponsors array
  const handleAddSponsor = () => {
    if (!newSponsor.name.trim() || !newSponsor.tagline.trim()) return;

    setSponsors([...sponsors, newSponsor]);
    setNewSponsor({ name: "", tagline: "" });
  };

  //remove sponsor from sponsors array
  const handleRemoveSponsor = (index) => {
    setSponsors(sponsors.filter((_, i) => i !== index));
  };

  //add winner to winners array
  const handleAddWinner = () => {
    if (!newWinner.name.trim() || !newWinner.email.trim()) return;

    setWinners([...winners, newWinner]);
    setNewWinner({ name: "", email: "" });
  };

  //remove winner from winners array
  const handleRemoveWinner = (index) => {
    setWinners(winners.filter((_, i) => i !== index));
  };

  //calculate event duration
  function getDuration(startDate, endDate) {
    if (!startDate || !endDate) return "";

    const start = new Date(startDate);
    const end = new Date(endDate);

    const diffMs = end - start; // milliseconds
    if (diffMs < 0) return "Invalid dates";

    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours}h ${minutes}m`;
  }
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
          <Dialog
            open={createOpen}
            onOpenChange={(open) => {
              setCreateOpen(open);

              if (!open) {
                // Reset main event form
                setNewEvent({
                  title: "",
                  image: "",
                  date: "",
                  time: "",
                  registrationEnd: "",
                  location: "",
                  description: "",
                  endDate: "",
                  endTime: "",
                });

                setSpeakers([]);
                setSponsors([]);

                setNewSpeaker({ name: "", email: "", tagline: "" });
                setNewSponsor({ name: "", tagline: "" });
              }
            }}
          >
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
                  <div>
                    <Label>EventDate</Label>
                    <Input
                      type="date"
                      value={newEvent.date}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, date: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>EventTime</Label>
                    <Input
                      type="time"
                      value={newEvent.time}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, time: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Event End Date</Label>
                    <Input
                      type="date"
                      value={newEvent.endDate}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, endDate: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>Event End Time</Label>
                    <Input
                      type="time"
                      value={newEvent.endTime}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, endTime: e.target.value })
                      }
                    />
                  </div>
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

                {/* SPEAKERS SECTION */}
                <div className="space-y-4 mt-6">
                  <Label>Speakers ({speakers.length})</Label>

                  {/* Add Speaker Form */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <Input
                      placeholder="Name"
                      value={newSpeaker.name}
                      onChange={(e) =>
                        setNewSpeaker({ ...newSpeaker, name: e.target.value })
                      }
                    />
                    <Input
                      placeholder="Email"
                      type="email"
                      value={newSpeaker.email}
                      onChange={(e) =>
                        setNewSpeaker({
                          ...newSpeaker,
                          email: e.target.value,
                        })
                      }
                    />
                    <Input
                      placeholder="Tagline (e.g. AI Expert)"
                      value={newSpeaker.tagline}
                      onChange={(e) =>
                        setNewSpeaker({
                          ...newSpeaker,
                          tagline: e.target.value,
                        })
                      }
                    />
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddSpeaker}
                    disabled={!newSpeaker.name || !newSpeaker.email}
                  >
                    + Add Speaker
                  </Button>

                  {/* Speaker List */}
                  {speakers.length > 0 && (
                    <div className="space-y-2">
                      {speakers.map((speaker, index) => (
                        <div
                          key={index}
                          className="border rounded-md p-3 flex justify-between items-start"
                        >
                          <div>
                            <p className="font-semibold">{speaker.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {speaker.email}
                            </p>
                            {speaker.tagline && (
                              <p className="text-xs italic mt-1">
                                {speaker.tagline}
                              </p>
                            )}
                          </div>

                          <button
                            onClick={() => handleRemoveSpeaker(index)}
                            className="text-destructive text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* SPONSORS SECTION */}
                <div className="space-y-4 mt-8">
                  <Label>Sponsors ({sponsors.length})</Label>

                  <div className="flex gap-2">
                    <Input
                      placeholder="Sponsor Name"
                      value={newSponsor.name}
                      onChange={(e) =>
                        setNewSponsor({ ...newSponsor, name: e.target.value })
                      }
                    />
                    <Input
                      placeholder="Tagline (e.g. Gold Sponsor)"
                      value={newSponsor.tagline}
                      onChange={(e) =>
                        setNewSponsor({
                          ...newSponsor,
                          tagline: e.target.value,
                        })
                      }
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddSponsor}
                      disabled={!newSponsor.name || !newSponsor.tagline}
                    >
                      + Add
                    </Button>
                  </div>

                  {sponsors.length > 0 && (
                    <div className="space-y-2">
                      {sponsors.map((sponsor, index) => (
                        <div
                          key={index}
                          className="border rounded-md p-3 flex justify-between"
                        >
                          <div>
                            <p className="font-semibold">{sponsor.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {sponsor.tagline}
                            </p>
                          </div>

                          <button
                            onClick={() => handleRemoveSponsor(index)}
                            className="text-destructive text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

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
          onOpenChange={(open) => {
            if (!open) {
              setDialogType(null);
              setSelectedEvent(null);
              setSpeakers([]);
              setSponsors([]);
              setNewSpeaker({ name: "", email: "", tagline: "" });
              setNewSponsor({ name: "", tagline: "" });
            }
          }}
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
                      <strong>start Date:</strong>{" "}
                      {formatDate(selectedEvent.eventDate).date}
                    </p>

                    <p>
                      <strong>Start Time:</strong>{" "}
                      {formatDate(selectedEvent.eventDate).time}
                    </p>
                    <p>
                      {selectedEvent.eventDate && selectedEvent.endDate && (
                        <span>
                          <strong>End Date:</strong>{" "}
                          {selectedEvent.endDate.split("T")[0]}
                        </span>
                      )}
                    </p>
                    <p>
                      {selectedEvent.endDate && (
                        <span>
                          <strong>End Time:</strong>{" "}
                          {selectedEvent.endDate.split("T")[1].substring(0, 5)}
                        </span>
                      )}
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
                      <strong>Registration Count:</strong>{" "}
                      {selectedEvent.registrationsCount}
                    </p>
                    <div>
                      {selectedEvent.speakers &&
                        selectedEvent.speakers.length > 0 && (
                          <>
                            <strong>Speakers:</strong>
                            <ul className="list-disc pl-5">
                              {selectedEvent.speakers.map((speaker, index) => (
                                <li key={index}>{speaker.name}</li>
                              ))}
                            </ul>
                          </>
                        )}
                    </div>

                    <div>
                      {selectedEvent.sponsors &&
                        selectedEvent.sponsors.length > 0 && (
                          <>
                            <strong>Sponsors:</strong>
                            <ul className="list-disc pl-5">
                              {selectedEvent.sponsors.map((sponsor, index) => (
                                <li key={index}>{sponsor.name}</li>
                              ))}
                            </ul>
                          </>
                        )}
                    </div>
                  </>
                ) : (
                  <>
                    {/* EVENT START */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Event Date</Label>
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
                      </div>

                      <div>
                        <Label>Event Time</Label>
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
                    </div>

                    {/* EVENT END */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Event End Date</Label>
                        <Input
                          type="date"
                          value={selectedEvent.endDate || ""}
                          onChange={(e) =>
                            setSelectedEvent({
                              ...selectedEvent,
                              endDate: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div>
                        <Label>Event End Time</Label>
                        <Input
                          type="time"
                          value={
                            selectedEvent.endTime || ""
                          }
                          onChange={(e) =>
                            setSelectedEvent({
                              ...selectedEvent,
                              endTime: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <Label>Registration End Date</Label>
                    <Input
                      type="date"
                      value={selectedEvent.registrationEnd?.split("T")[0] || ""}
                      onChange={(e) =>
                        setSelectedEvent({
                          ...selectedEvent,
                          registrationEnd: e.target.value,
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

                    {/* SPEAKERS SECTION */}
                    <div className="space-y-4 mt-6">
                      <Label>Speakers ({speakers.length})</Label>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <Input
                          placeholder="Name"
                          value={newSpeaker.name}
                          onChange={(e) =>
                            setNewSpeaker({
                              ...newSpeaker,
                              name: e.target.value,
                            })
                          }
                        />
                        <Input
                          placeholder="Email"
                          value={newSpeaker.email}
                          onChange={(e) =>
                            setNewSpeaker({
                              ...newSpeaker,
                              email: e.target.value,
                            })
                          }
                        />
                        <Input
                          placeholder="Tagline"
                          value={newSpeaker.tagline}
                          onChange={(e) =>
                            setNewSpeaker({
                              ...newSpeaker,
                              tagline: e.target.value,
                            })
                          }
                        />
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAddSpeaker}
                      >
                        + Add Speaker
                      </Button>

                      {speakers.map((speaker, index) => (
                        <div
                          key={index}
                          className="border rounded-md p-3 flex justify-between"
                        >
                          <div>
                            <p className="font-semibold">{speaker.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {speaker.email}
                            </p>
                            <p className="text-xs italic">{speaker.tagline}</p>
                          </div>
                          <button
                            onClick={() => handleRemoveSpeaker(index)}
                            className="text-destructive text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* SPONSORS SECTION */}
                    <div className="space-y-4 mt-8">
                      <Label>Sponsors ({sponsors.length})</Label>

                      <div className="flex gap-2">
                        <Input
                          placeholder="Name"
                          value={newSponsor.name}
                          onChange={(e) =>
                            setNewSponsor({
                              ...newSponsor,
                              name: e.target.value,
                            })
                          }
                        />
                        <Input
                          placeholder="Tagline"
                          value={newSponsor.tagline}
                          onChange={(e) =>
                            setNewSponsor({
                              ...newSponsor,
                              tagline: e.target.value,
                            })
                          }
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleAddSponsor}
                        >
                          + Add
                        </Button>
                      </div>

                      {sponsors.map((sponsor, index) => (
                        <div
                          key={index}
                          className="border rounded-md p-3 flex justify-between"
                        >
                          <div>
                            <p className="font-semibold">{sponsor.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {sponsor.tagline}
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemoveSponsor(index)}
                            className="text-destructive text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>

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
          open={isOverviewOpen}
          onOpenChange={(open) => {
            setIsOverviewOpen(open);

            if (!open) {
              setOverviewEvent(null);
              setOverviewMarkdown("");
              setOverviewPhotos([]);
              setOverviewTab("write");

              setWinners([]);

              setNewWinner({ name: "", email: "" });
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
                    {/* Photo Grid with Remove Button */}
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

                  {/* WINNERS SECTION */}
                  <div className="space-y-4 mt-8">
                    <Label>Winners ({winners.length})</Label>

                    <div className="flex gap-2">
                      <Input
                        placeholder="Winner Name"
                        value={newWinner.name}
                        onChange={(e) =>
                          setNewWinner({ ...newWinner, name: e.target.value })
                        }
                      />
                      <Input
                        placeholder="Email"
                        type="email"
                        value={newWinner.email}
                        onChange={(e) =>
                          setNewWinner({ ...newWinner, email: e.target.value })
                        }
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAddWinner}
                        disabled={!newWinner.name || !newWinner.email}
                      >
                        + Add
                      </Button>
                    </div>

                    {winners.length > 0 && (
                      <div className="space-y-2">
                        {winners.map((winner, index) => (
                          <div
                            key={index}
                            className="border rounded-md p-3 flex justify-between"
                          >
                            <div>
                              <p className="font-semibold">{winner.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {winner.email}
                              </p>
                            </div>

                            <button
                              onClick={() => handleRemoveWinner(index)}
                              className="text-destructive text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
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

              <Button
                className="flex-1"
                onClick={handleSaveOverview}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Overview"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* EVENTS LIST WITH TABS */}
        <Tabs defaultValue="upcoming" className="mt-4">
          <TabsList>
            <TabsTrigger value="upcoming">
              Active & Live ({sortedEvents.length})
            </TabsTrigger>
            <TabsTrigger value="finished">
              Finished ({pastEvents.length})
            </TabsTrigger>
          </TabsList>

          {/* ================= UPCOMING TAB ================= */}
          <TabsContent value="upcoming" className="mt-6">
            <div className="grid md:grid-cols-3 gap-4">
              {sortedEvents.map((event) => {
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
                      <div className="flex items-center justify-between mb-2">
                        <Badge
                          variant={
                            event.status === "LIVE"
                              ? "destructive"
                              : event.status === "UPCOMING"
                                ? "secondary"
                                : "default"
                          }
                        >
                          {event.status}
                        </Badge>
                        <div>
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
                              const { date, time } = formatDate(
                                event.eventDate,
                              );
                              const { date: endDate, time: endTime } =
                                formatDate(event.endDate);
                              const regEnd = formatDate(
                                event.registrationEnd,
                              ).date;

                              setSelectedEvent({
                                ...event,
                                date,
                                time,
                                endDate,
                                endTime,
                                registrationEndDate: regEnd,
                              });
                              setSpeakers(event.speakers || []);
                              setSponsors(event.sponsors || []);
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
                        <div>
                          {event.eventDate && event.endDate && (
                            <span className="text-sm">
                              Duration:{" "}
                              {getDuration(event.eventDate, event.endDate)}
                            </span>
                          )}
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
                        {event.description.substring(0, 40) +
                          (event.description.length > 40 ? "..." : "")}
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
                          onClick={() => {
                            setOverviewEvent(event);
                            setIsOverviewOpen(true);
                          }}
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
