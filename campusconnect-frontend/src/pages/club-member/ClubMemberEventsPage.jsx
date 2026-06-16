import { useEffect, useState, useMemo, useCallback } from "react";
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
import { Plus, Clock, MapPin, Edit, Trash2, Eye,CalendarDays,CalendarCheck } from "lucide-react";
import { clubMemberNavItems } from "../../config/Navigation";
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
import Loading from "../../components/ui/Loading";
import EmptyState from "../../components/ui/EmptyState";
import { useAuth } from "../../contexts/AuthContext";

const ClubMemberEventsPage = () => {
  // Get clubId from URL params
  const { clubId } = useParams();
  const { isClubMember } = useAuth();

  // Base URL for API calls related to this club
  const baseUrl = `${import.meta.env.VITE_BACKEND_URL}/campus-connect/clubs/${clubId}/member`;

  const navigate = useNavigate();

  //------------------Nav----------------//
  const updateNavItems = useCallback(() => {
    return clubMemberNavItems.map((item) => ({
      ...item,
      href: item.href.replace(":clubId", clubId),
    }));
  }, [clubId]);

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
  const [newPhoto, setNewPhoto] = useState(null);
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
    image: null,
    speakers: [],
    sponsors: [],
  });
  const [now, setNow] = useState(new Date());
  const [existingImages, setExistingImages] = useState([]);
  const [requesting, setRequesting] = useState(false);
  const [loading, setLoading] = useState({
    past: false,
    upcoming: false,
  });

  const resetCreateEventForm = () => {
    setNewEvent({
      title: "",
      image: null,
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
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  //render preview of markdown overview
  const renderedPreview = marked.parse(overviewMarkdown || "");

  //format date and time for display
  const formatDate = useCallback((dateTime) => {
    if (!dateTime) return { date: "", time: "" };
    const [date, time] = dateTime.split("T");
    return { date, time: time.substring(0, 5) };
  }, []);

  const handleSelectPhoto = useCallback((e) => {
    const file = e.target.files[0];
    setNewPhoto(file);
  }, []);

  const fetchPastEvents = async () => {
    const token = localStorage.getItem("authToken");
    setLoading((prev) => ({ ...prev, past: true }));

    try {
      const res = await fetch(`${baseUrl}/events/finished`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch past events");

      const data = await res.json();
      setPastEvents(data);
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "Failed to fetch past events",
        variant: "destructive",
      });
    } finally {
      setLoading((prev) => ({ ...prev, past: false }));
    }
  };
  const fetchUpcomingEvents = async () => {
    const token = localStorage.getItem("authToken");
    setLoading((prev) => ({ ...prev, upcoming: true }));

    try {
      const res = await fetch(`${baseUrl}/events/active`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch upcoming events");

      const data = await res.json();
      setUpcomingEvents(data);
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "Failed to fetch upcoming events",
        variant: "destructive",
      });
    } finally {
      setLoading((prev) => ({ ...prev, upcoming: false }));
    }
  };
  // Fetch club events
  const fetchClubEvents = async () => {
    try {
      // run in parallel
      await Promise.all([fetchPastEvents(), fetchUpcomingEvents()]);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to fetch events",
        variant: "destructive",
      });
    }
  };

  const fetchEventOverviewDetails = async (eventId) => {
    const token = localStorage.getItem("authToken");

    try {
      const res = await fetch(`${baseUrl}/events/finished/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      setOverviewEvent(data);

      if (data.overview) setOverviewMarkdown(data.overview);

      if (data.images) setExistingImages(data.images);

      if (data.winners) setWinners(data.winners);

      setIsOverviewOpen(true);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load overview details",
        variant: "destructive",
      });
    }
  };

  const getEventStatus = useCallback(
    (event) => {
      const start = new Date(event.startTime);
      const end = new Date(event.endTime);

      if (now >= start && now <= end) return "LIVE";
      if (now < start) return "UPCOMING";
      return "FINISHED";
    },
    [now],
  );

  //handle create event
  const handleCreateEvent = async () => {
    const token = localStorage.getItem("authToken");

    const payload = {
      ...newEvent,
      startTime: `${newEvent.date}T${newEvent.time}:00`,
      endTime: `${newEvent.endDate}T${newEvent.endTime}:00`,
      registrationEnd: `${newEvent.registrationEnd}T23:59:59`,
      sponsors: sponsors,
      speakers: speakers,
    };

    try {
      setRequesting(true);
      const formData = new FormData();

      formData.append(
        "event",
        new Blob([JSON.stringify(payload)], { type: "application/json" }),
      );

      if (newEvent.image) {
        formData.append("image", newEvent.image);
      } else {
        toast({
          title: "Error",
          description: "Please upload an image for the event.",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/campus-connect/clubs/${clubId}/member/events/active`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      const data = await response.json();

      if (data.message === "Event created successfully") {
        toast({
          title: "Success",
          description: data.message,
          variant: "success",
        });
        fetchClubEvents();
        setCreateOpen(false);
        resetCreateEventForm();
      } else {
        toast({
          title: "error",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to create event",
        variant: "destructive",
      });
    } finally {
      setRequesting(false);
    }
  };

  //update event
  const handleSaveEdit = async () => {
    const token = localStorage.getItem("authToken");

    const startTime = `${selectedEvent.date}T${selectedEvent.time}:00`;
    const registrationEnd = `${selectedEvent.registrationEndDate}T23:59:59`;
    const endTime = `${selectedEvent.endDate}T${selectedEvent.endTime}:00`;

    const payload = {
      title: selectedEvent.title,
      description: selectedEvent.description,
      location: selectedEvent.location,
      startTime,
      registrationEnd,
      endTime,
      speakers: speakers,
      sponsors: sponsors,
    };

    const formData = new FormData();

    formData.append(
      "event",
      new Blob([JSON.stringify(payload)], { type: "application/json" }),
    );

    // append image only if user uploaded new one
    if (selectedEvent.image instanceof File) {
      formData.append("image", selectedEvent.image);
    } else {
      const emptyFile = new File([], "empty.jpg");
      formData.append("image", emptyFile);
    }

    try {
      setRequesting(true);

      const response = await fetch(
        `${baseUrl}/events/active/${selectedEvent.id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      const data = await response.json();

      if (data.message == "Event updated successfully") {
        fetchClubEvents();
        resetCreateEventForm();
        setCreateOpen(false);

        toast({
          title: "Success",
          description: data.message,
          variant: "success",
        });
      } else {
        toast({
          title: "error",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "Failed to update event",
        variant: "destructive",
      });
    } finally {
      setRequesting(false);
    }

    setDialogType(null);
    setSelectedEvent(null);
  };

  // Handle delete event
  const handleDelete = async (id) => {
    const token = localStorage.getItem("authToken");

    await fetch(`${baseUrl}/events/active/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        const data = await response.json();
        if (data.message === "Event deleted successfully") {
          fetchClubEvents();
          toast({
            title: "Success",
            description: data.message,
            variant: "success",
          });
        } else throw new Error(data.message || "Failed to delete event");
      })
      .catch((err) => {
        toast({
          title: "Error",
          description: err.message || "Failed to delete event",
          variant: "destructive",
        });
      })
      .finally(() => {
        setRequesting(false);
      });
  };

  //load events on component mount and whenever clubId changes
  useEffect(() => {
    const checkMembershipAndFetchData = async () => {
        try {
        const member = await isClubMember(clubId);
        if (!member) {
          toast({
            title: "Unauthorized",
            description: "You are not a member of this club",
            variant: "destructive",
          });
          navigate(-1);
          return;
        }
        else{
          fetchClubEvents();
        }
      }
        catch (error) {
          toast({
            title: "Error",
            description: "Failed to verify club membership",
            variant: "destructive",
          });
            navigate(-1);
        }
      }

    checkMembershipAndFetchData();
  }, [clubId]);

  //sort upcoming events - live first, then registration open, then by date
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

        return new Date(a.startTime) - new Date(b.startTime);
      }

      return 0;
    });
  }, [upcomingEvents]);

  //add photo to photo array for overview
  const handleAddPhoto = useCallback(() => {
    if (!newPhoto || existingImages.length + overviewPhotos.length >= 10)
      return;

    setOverviewPhotos([...overviewPhotos, newPhoto]);
    setNewPhoto(null);

    document.querySelector('input[type="file"]').value = "";
  }, [newPhoto, existingImages, overviewPhotos]);

  const handleRemoveExistingImage = (index) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  // generate markdown overview using AI
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
            variant: "success",
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to generate overview",
            variant: "destructive",
          });
        }
      })
      .catch((err) => {
        toast({
          title: "Error",
          description: "Failed to generate overview",
          variant: "destructive",
        });
      });
    setIsGenerating(false);
  };

  // Save markdown overview and photos to event
  const handleSaveOverview = async () => {
    setIsSaving(true);

    const token = localStorage.getItem("authToken");

    const formData = new FormData();

    const overviewRequest = {
      overview: overviewMarkdown,
      winners: winners,
      oldImages: existingImages,
    };

    formData.append(
      "overview",
      new Blob([JSON.stringify(overviewRequest)], { type: "application/json" }),
    );

    overviewPhotos.forEach((file) => {
      formData.append("images", file);
    });


    try {
      const response = await fetch(
        `${baseUrl}/events/finished/${overviewEvent.id}/save-overview`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      const data = await response.json();

      if (data.message === "Event Overview saved successfully") {
        toast({
          title: "Success",
          description: data.message,
          variant: "success",
        });

        setOverviewMarkdown("");
        setOverviewPhotos([]);
        setExistingImages([]);
        setWinners([]);
        setNewWinner({ name: "", email: "" });

        setIsSaving(false);

        setIsOverviewOpen(false);

        fetchClubEvents();
      } else {
        toast({
          title: "Error",
          description: data.message,
          variant: "destructive",
        });

        setIsSaving(false);
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to save overview",
        variant: "destructive",
      });

      setIsSaving(false);
    }
  };

  //add speaker to speakers array for overview
  const handleAddSpeaker = useCallback(() => {
    if (!newSpeaker.name.trim() || !newSpeaker.email.trim()) return;

    setSpeakers([...speakers, newSpeaker]);
    setNewSpeaker({ name: "", email: "", tagline: "" });
  }, [newSpeaker, speakers]);

  //remove speaker from speakers array for overview
  const handleRemoveSpeaker = useCallback((index) => {
    setSpeakers(speakers.filter((_, i) => i !== index));
  }, [speakers]);

  //add sponsor to sponsors array for overview
  const handleAddSponsor = useCallback(() => {
    if (!newSponsor.name.trim() || !newSponsor.tagline.trim()) return;

    setSponsors([...sponsors, newSponsor]);
    setNewSponsor({ name: "", tagline: "" });
  }, [newSponsor, sponsors]);

  //remove sponsor from sponsors array for overview
  const handleRemoveSponsor = useCallback((index) => {
    setSponsors(sponsors.filter((_, i) => i !== index));
  }, [sponsors]);

  //add winner to winners array for overview
  const handleAddWinner = useCallback(() => {
    if (!newWinner.name.trim() || !newWinner.email.trim()) return;

    setWinners([...winners, newWinner]);
    setNewWinner({ name: "", email: "" });
  }, [newWinner, winners]);

  //remove winner from winners array for overview
  const handleRemoveWinner = useCallback((index) => {
    setWinners(winners.filter((_, i) => i !== index));
  }, [winners]);

  //calculate event duration in hours and minutes
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

  //---------------------------UI----------------------------//
  return (
    <DashboardLayout navItems={updateNavItems()} title="Events">
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
                  image: null,
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
              <Button dissabled={requesting?.toString()}>
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

                <Label>Upload Image</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setNewEvent({
                        ...newEvent,
                        image: file,
                      });
                    }
                  }}
                />

                {/* Image Preview */}
                {newEvent.image && (
                  <img
                    alt="Event Preview"
                    src={URL.createObjectURL(newEvent.image)}
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

                <Button
                  className="w-full"
                  onClick={handleCreateEvent}
                  disabled={requesting}
                >
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
                {dialogType === "view" ? (
                  <>
                    {selectedEvent.image && (
                      <img
                        alt="Event Image"
                        src={selectedEvent.image}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    )}
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
                      {formatDate(selectedEvent.startTime).date}
                    </p>

                    <p>
                      <strong>Start Time:</strong>{" "}
                      {formatDate(selectedEvent.startTime).time}
                    </p>
                    <p>
                      {selectedEvent.startTime && selectedEvent.endTime && (
                        <span>
                          <strong>End Date:</strong>{" "}
                          {selectedEvent.endTime.split("T")[0]}
                        </span>
                      )}
                    </p>
                    <p>
                      {selectedEvent.endTime && (
                        <span>
                          <strong>End Time:</strong>{" "}
                          {selectedEvent.endTime.split("T")[1].substring(0, 5)}
                        </span>
                      )}
                    </p>
                    <p>
                      <strong>Registration End:</strong>{" "}
                      {formatDate(selectedEvent.registrationEnd).date}
                    </p>
                    {/* <p>
                      <strong>Status:</strong>{" "}
                      {selectedEvent.status.replace(/"/g, "")}
                    </p> */}
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
                    <Label>Upload Image</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setSelectedEvent({
                            ...selectedEvent,
                            image: file,
                          });
                        }
                      }}
                    />

                    {/* Image Preview */}
                    {selectedEvent.image && (
                      <img
                        src={
                          typeof selectedEvent.image === "string"
                            ? selectedEvent.image
                            : URL.createObjectURL(selectedEvent.image)
                        }
                        alt="Event Preview"

                        className="w-full h-40 object-cover rounded-lg"
                      />
                    )}
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
                          value={selectedEvent.endTime || ""}
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
                        disabled={!newSpeaker.name || !newSpeaker.email}
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
                          disabled={!newSponsor.name || !newSponsor.tagline}
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

                    <Button
                      onClick={handleSaveEdit}
                      className="w-full"
                      disabled={requesting}
                    >
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
              setExistingImages([]);
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
                  <Label>
                    Event Photos (
                    {existingImages.length + overviewPhotos.length}/10)
                  </Label>

                  <Label>Upload Overview Photos</Label>

                  <div className="flex gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleSelectPhoto}
                    />

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddPhoto}
                      disabled={!newPhoto}
                    >
                      +
                    </Button>
                  </div>
                  {(existingImages.length > 0 || overviewPhotos.length > 0) && (
                    <div className="grid grid-cols-3 gap-2 mt-4">
                      {/* Existing images */}
                      {existingImages.map((url, index) => (
                        <div key={`existing-${index}`} className="relative">
                          <img
                              alt={`Overview ${index + 1}`}
                            src={url}
                            className="w-full h-24 object-cover rounded-lg"
                          />

                          <button
                            onClick={() => handleRemoveExistingImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white text-xs px-1 rounded"
                          >
                            X
                          </button>
                        </div>
                      ))}

                      {/* Newly added photos */}
                      {overviewPhotos.map((photo, index) => (
                        <div key={`new-${index}`} className="relative">
                          <img
                            src={URL.createObjectURL(photo)}
                            className="w-full h-24 object-cover rounded-lg"
                            alt={`Overview ${index + 1}`}
                          />

                          <button
                            onClick={() =>
                              setOverviewPhotos(
                                overviewPhotos.filter((_, i) => i !== index),
                              )
                            }
                            className="absolute top-1 right-1 bg-red-500 text-white text-xs px-1 rounded"
                          >
                            X
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
                {(existingImages.length > 0 || overviewPhotos.length > 0) && (
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    {existingImages.map((url, index) => (
                      <img
                          alt={`Overview ${index + 1}`}
                        key={`existing-${index}`}
                        src={url}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                    ))}

                    {overviewPhotos.map((photo, index) => (
                      <img
                        alt={`Overview ${index + 1}`}
                        key={`new-${index}`}
                        src={URL.createObjectURL(photo)}
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
              {loading.upcoming ? (
                <div className="w-full col-span-3">
                  <Loading />
                </div>
              ) : (
                sortedEvents.length === 0 ? (
                  <div className="w-full col-span-3">
                    <EmptyState
                      title="No Active Events"
                      desc="There are no active events for this club at the moment."
                      icon={<CalendarDays className="w-8 h-8 text-muted-foreground" />}
                      />
                  </div>
                ) : (
                sortedEvents.map((event) => {
                  const formatted = formatDate(event.startTime);
                  const status = getEventStatus(event);
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
                            status === "LIVE"
                              ? "destructive"
                              : status === "UPCOMING"
                                ? "secondary"
                                : "default"
                          }
                        >
                          {status}
                        </Badge>
                        <div>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={requesting}
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
                            disabled={requesting}
                            onClick={() => {
                              const { date, time } = formatDate(
                                event.startTime,
                              );
                              const { date: endDate, time: endTime } =
                                formatDate(event.endTime);
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
                            disabled={requesting}
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
                          {event.startTime && event.endTime && (
                            <span className="text-sm">
                              Duration:{" "}
                              {getDuration(event.startTime, event.endTime)}
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })))}
            </div>
          </TabsContent>

          {/* ================= FINISHED TAB (CHANGED UI) ================= */}
          <TabsContent value="finished" className="mt-6">
            <div className="grid md:grid-cols-3 gap-4">
              {loading.past ? (
                <div className="w-full col-span-3">
                  <Loading />
                </div>
              ) : pastEvents.length === 0 ? (
                <div className="w-full col-span-3">
                  <EmptyState
                    title="No Finished Events"
                    desc="There are no finished events for this club yet."
                    icon={<CalendarCheck className="w-8 h-8 text-muted-foreground" />}
                    />
                </div>
              ) : (
              pastEvents.map((event) => {
                const formatted = formatDate(event.startTime);

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
                          disabled={requesting}
                          onClick={() =>
                            navigate(
                              `/campus-connect/club-member/${clubId}/events/${event.id}`,
                            )
                          }
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                        <Button
                          variant="secondary"
                          className="w-auto"
                          disabled={requesting}
                          onClick={() => {
                            fetchEventOverviewDetails(event.id);
                          }}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Add Overview
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              }))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ClubMemberEventsPage;
