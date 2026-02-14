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
} from "../../components/ui/Dialog";
import {
  Users,
  Plus,
  Clock,
  MapPin,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import { clubAdminNavItems } from "../../config/Navigation";
import { useParams } from "react-router-dom";
import { toast } from "../../hooks/use-toast";

const ClubAdminEventsPage = () => {

  // Get clubId from URL params
  let { clubId } = useParams();

  // Base URL for API calls related to this club
  const baseUrl = `http://localhost:8080/campus-connect/clubs/${clubId}/admin`;


  //---------Navs------------//
  const updatenavItems = () => {
    return clubAdminNavItems.map(item => ({
      ...item,
      href: item.href.replace(":clubId", clubId)
    }))
  }

  // State variables
  const [clubEvents, setClubEvents] = useState([]);
  const [dialogType, setDialogType] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    time: "",
    registrationEnd: "",
    location: "",
    description: "",
    image: "",
  });

  
  //formate date and time for display
  const formatDate = (dateTime) => {
    if (!dateTime) return { date: "", time: "" };
    const [date, time] = dateTime.split("T");
    return { date, time: time.substring(0,5) };
  };

  //1) Fetch club events
  const fetchClubEvents = () => {
    const token = localStorage.getItem("authToken");

    fetch(`${baseUrl}/events`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setClubEvents(data))
      .catch(err => {
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
      fetchClubEvents()
  })
    .catch(err => {
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
      .catch(err => {
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
      }).catch(err => {
        toast({
          title: "Error",
          description: "Failed to delete event",
          status: "error",
        });
      })
  };


  // load events on component mount and whenever clubId changes
  useEffect(() => {
    fetchClubEvents();
  }, [clubId]);

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
                    setNewEvent({ ...newEvent, registrationEnd: e.target.value })
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
        <Dialog open={dialogType !== null} onOpenChange={() => setDialogType(null)}>
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
                    <p><strong>Title:</strong> {selectedEvent.title}</p>
                    <p><strong>Description:</strong> {selectedEvent.description}</p>
                    <p><strong>Location:</strong> {selectedEvent.location}</p>
                    <p><strong>Date:</strong> {formatDate(selectedEvent.eventDate).date}</p>
                    <p><strong>Time:</strong> {formatDate(selectedEvent.eventDate).time}</p>
                    <p><strong>Registration End:</strong> {formatDate(selectedEvent.registrationEnd).date}</p>
                    <p><strong>Status:</strong> {selectedEvent.status.replace(/"/g, "")}</p>
                    <p><strong>Registered:</strong> {selectedEvent.register ? "Yes" : "No"}</p>
                  </>
                ) : (
                  <>
                    <Label>Image URL</Label>
                    <Input
                      value={selectedEvent.image}
                      onChange={(e) =>
                        setSelectedEvent({ ...selectedEvent, image: e.target.value })
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
                        setSelectedEvent({ ...selectedEvent, location: e.target.value })
                      }
                    />
                    <Label>Description</Label>
                    <Textarea
                      value={selectedEvent.description}
                      onChange={(e) =>
                        setSelectedEvent({ ...selectedEvent, description: e.target.value })
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

        {/* EVENTS LIST */}
        <div className="grid md:grid-cols-3 gap-4">
          {clubEvents.map((event) => {
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
                          const regEnd = formatDate(event.registrationEnd).date;

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
                    {event.description.substring(0, 100)}{event.description.length > 100 && "..."}
                  </p>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{formatted.date} at {formatted.time}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{event.location}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{event.register ? "Registered" : "Not Registered"}</span>
                    </div>
                  </div>

                </CardContent>
              </Card>
            );
          })}
        </div>

      </div>
    </DashboardLayout>
  );
};

export default ClubAdminEventsPage;


