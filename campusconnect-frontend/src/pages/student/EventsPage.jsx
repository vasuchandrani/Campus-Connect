import { use, useEffect, useState } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { CheckCircle } from "lucide-react";
import { studentNavItems } from "../../config/Navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../components/ui/Dialog";
import { Eye } from "lucide-react";
import { toast } from "../../hooks/use-toast";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/Tabs";
import { useNavigate } from "react-router-dom";

const EventsPage = () => {

  // Base URL for API calls related to student events
  const baseUrl = "http://localhost:8080/campus-connect/student";

  const navigate = useNavigate();

  // State variables
  const [events, setEvents] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Fetch events from API
  const getEvents = async () => {
    fetch(`${baseUrl}/events`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched events:", data);
        setEvents(data);
      })
      .catch((err) => {
        console.error("Error fetching events:", err);
        alert("Failed to load events");
      });
  };

  //set registered events whenever events change
  useEffect(() => {
    const registed = events.filter((e) => e.register);
    setRegisteredEvents(registed);
  }, [events]);

  //change registration status for an event
  const toggleRegistration = (eventId) => {
    const eventObj = events.find((e) => e.id === eventId);
    if (eventObj.register) {

      fetch(`${baseUrl}/events/${eventId}/unregister`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      })
        .then(async (res) => {
          if (res.ok) {
            toast({
              title: "Success",
              description: "Unregistered from event",
            });
            await getEvents();
          } else {
            throw new Error("Failed to unregister");
          }
        })
        .catch((err) => {
          toast({
            title: "Error",
            description: "Failed to unregister from event",
            variant: "destructive",
          });
        });
    } else {

      fetch(`${baseUrl}/events/${eventId}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      })
        .then(async (res) => {
          if (res.ok) {
            toast({
              title: "Success",
              description: "Registered for event",
            });
            await getEvents();
          } else {
            throw new Error("Failed to register");
          }
        })
        .catch((err) => {
          toast({
            title: "Error",
            description: "Failed to register for event",
            variant: "destructive",
          });
        });
    }
  };

  // Sort events: registered events first
  const sortedEvents = [...events].sort((a, b) => {
    const aRegistered = registeredEvents.some((re) => re.id === a.id);
    const bRegistered = registeredEvents.some((re) => re.id === b.id);

    return bRegistered - aRegistered; // true=1, false=0
  });

  // Separate events into upcoming and finished
  const now = new Date();
  const upcomingEvents = sortedEvents.filter(
    (e) => new Date(e.eventDate) >= now
  );
  const finishedEvents = sortedEvents.filter(
    (e) => new Date(e.eventDate) < now
  );

  // Load events on component mount
  useEffect(() => {
    getEvents();
  }, []);

  return (
    <DashboardLayout navItems={studentNavItems} title="Events">
      <div className="space-y-6">

        <h1 className="text-3xl font-bold">Events</h1>

        <Tabs defaultValue="upcoming">

          <TabsList>
            <TabsTrigger value="upcoming">
              Happening & Upcoming ({upcomingEvents.length})
            </TabsTrigger>
            <TabsTrigger value="finished">
              Finished ({finishedEvents.length})
            </TabsTrigger>
          </TabsList>

          {/* UPCOMING EVENTS */}
          <TabsContent value="upcoming" className="mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Dialog
                open={!!selectedEvent}
                onOpenChange={() => setSelectedEvent(null)}
              >
                {/* Event details dialog */}
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Event Details</DialogTitle>
                    <DialogDescription>
                      Review the details of this event
                    </DialogDescription>
                  </DialogHeader>
                  {selectedEvent && (
                    <div className="space-y-4 pt-4">
                      <p>
                        <strong>Title:</strong> {selectedEvent.title}
                      </p>
                      <p>
                        <strong>Description:</strong> {selectedEvent.description}
                      </p>
                      <p>
                        <strong>Date & Time:</strong>{" "}
                        {selectedEvent.eventDate.split("T")[0]} •{" "}
                        {selectedEvent.eventDate.split("T")[1]}
                      </p>
                      <p>
                        <strong>Location:</strong> {selectedEvent.location}
                      </p>
                      <p>
                        <strong>Club:</strong> {selectedEvent.clubName}
                      </p>
                      <p>
                        <strong>Registration End:</strong>{" "}
                        {selectedEvent.registrationEnd.split("T")[0]} •{" "}
                        {selectedEvent.registrationEnd.split("T")[1]}
                      </p>
                    </div>
                  )}
                </DialogContent>
              </Dialog>

              {upcomingEvents.map((event) => {
                const isRegistered = registeredEvents.some(
                  (re) => re.id === event.id,
                );

                return (
                  <Card
                    key={event.id}
                    className="border-border/50 overflow-hidden"
                  >
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-40 object-cover"
                    />
                    <CardContent className="p-5 pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{event.clubName}</Badge>
                      </div>

                      <h4 className="font-semibold mb-2">{event.title}</h4>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {event.description.substring(0, 25) +
                          (event.description.length > 25 ? "..." : "")}
                      </p>

                      <div className="flex gap-2">
                        {event.registrationOpen ? (
                          <Button
                            className="flex-1"
                            variant={isRegistered ? "outline" : "default"}
                            onClick={() => toggleRegistration(event.id)}
                          >
                            {isRegistered ? (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Registered
                              </>
                            ) : (
                              "Register"
                            )}
                          </Button>)
                          :(
                            <Button disabled className="flex-1">
                              Registration Closed
                            </Button>
                          )}

                        {/* Eye icon button for event details */}
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => setSelectedEvent(event)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* FINISHED EVENTS */}
          <TabsContent value="finished" className="mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {finishedEvents.map((event) => (
                <Card
                  key={event.id}
                  className="border-border/50 overflow-hidden"
                >
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-40 object-cover opacity-70"
                  />
                  <CardContent className="p-5 pt-4">
                    <Badge variant="secondary" className="mb-2">
                      Finished
                    </Badge>

                    <h4 className="font-semibold mb-2">{event.title}</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      {event.description}
                    </p>

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate(`/campus-connect/student/events/${event.id}`)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

        </Tabs>

      </div>
    </DashboardLayout>
  );
};

export default EventsPage;
