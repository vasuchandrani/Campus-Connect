import { useEffect, useState } from "react";
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
import { useMemo } from "react";

const EventsPage = () => {
  // Base URL for API calls related to student events
  const baseUrl = "http://localhost:8080/campus-connect/student";

  const navigate = useNavigate();

  // State variables
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [finishedEvents, setFinishedEvents] = useState([]);
      const [now, setNow] = useState(new Date());

  useEffect(() => {
  const interval = setInterval(() => {
    setNow(new Date());
  }, 1000);

  return () => clearInterval(interval);
}, []);

//get event status base on current time and event start/end time
const getEventStatus = (event) => {
  const start = new Date(event.startTime);
  const end = new Date(event.endTime);

  if (now >= start && now <= end) return "LIVE";
  if (now < start) return "UPCOMING";
  return "FINISHED";
};

//get is registration open based on current time and registration end time
const isRegistrationOpen = (event) => {
  if (!event.registrationEnd) return false;
  return new Date() < new Date(event.registrationEnd);
};

  // Fetch Upcomming events from API
  const getEvents = async () => {
    fetch(`${baseUrl}/events/active`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setUpcomingEvents(data);
      })
      .catch((err) => {
        console.error("Error fetching events:", err);
        alert("Failed to load events");
      });
  };

  const getFinishedEvents = async () => {
    fetch(`${baseUrl}/events/finished`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setFinishedEvents(data);
      })
      .catch((err) => {
        console.error("Error fetching finished events:", err);
        alert("Failed to load finished events");
      });
  };

  //set registered events whenever events change
  useEffect(() => {
    const registed = upcomingEvents.filter((e) => e.register);
    setRegisteredEvents(registed);
  }, [upcomingEvents]);

  //change registration status for an event
  const toggleRegistration = (eventId) => {
    const eventObj = upcomingEvents.find((e) => e.id === eventId);
    if (eventObj.register) {
      fetch(`${baseUrl}/events/active/${eventId}/unregister`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      })
        .then(async (res) => {
          const data = await res.json();
          if (res.ok) {
            toast({
              title: "Success",
              description: data.message,
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
      fetch(`${baseUrl}/events/active/${eventId}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      })
        .then(async (res) => {
          const data = await res.json();
          if (res.ok) {
            toast({
              title: "Success",
              description: data.message,
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

  //sort events - live first, then upcoming (registered first, then nearest date)
  const sortedEvents = useMemo(() => {
    const statusPriority = {
      LIVE: 1,
      UPCOMING: 2,
    };

    return [...upcomingEvents].sort((a, b) => {
      // 1️⃣ Sort by status priority
      const statusDiff =
        (statusPriority[a.status] || 99) - (statusPriority[b.status] || 99);

      if (statusDiff !== 0) return statusDiff;

      // 2️⃣ If both UPCOMING → registered first
      if (a.status === "UPCOMING") {
        if (a.register && !b.register) return -1;
        if (!a.register && b.register) return 1;

        // 3️⃣ Then nearest date
        return new Date(a.eventDate) - new Date(b.eventDate);
      }

      return 0;
    });
  }, [upcomingEvents]);

  // Load events on component mount
  useEffect(() => {
    getEvents();
    getFinishedEvents();
  }, []);

    //formate date and time for display
  const formatDate = (dateTime) => {
    if (!dateTime) return { date: "", time: "" };
    const [date, time] = dateTime.split("T");
    return { date, time: time.substring(0, 5) };
  };

  return (
    <DashboardLayout navItems={studentNavItems} title="Events" bell={true}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Events</h1>

        <Tabs defaultValue="upcoming">
          <TabsList>
            <TabsTrigger value="upcoming">
              Active  ({upcomingEvents.length})
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
                      {formatDate(selectedEvent.startTime).date}
                    </p>

                    <p>
                      <strong>Start Time:</strong>{" "}
                      {formatDate(selectedEvent.startTime).time}
                    </p>
                    <p>
                      {selectedEvent.endTime && (
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
                    </div>
                  )}
                </DialogContent>
              </Dialog>

              {sortedEvents.map((event) => {
                  const status = getEventStatus(event);
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
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">{event.clubName}</Badge>

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
                      </div>

                      <h4 className="font-semibold mb-2">{event.title}</h4>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {event.description.substring(0, 25) +
                          (event.description.length > 25 ? "..." : "")}
                      </p>

                      <div className="flex gap-2">
                        {isRegistrationOpen(event) ? (
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
                          </Button>
                        ) : (
                          <Button disabled className="flex-1">
                            {isRegistered ? (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Registered
                              </>
                            ) : (
                              "Registration Closed"
                            )}
                          </Button>
                        )}

                        {/* Eye icon button for event details */}
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            setSelectedEvent({
                              ...event,
                              eventDate: event.eventDate,
                              registrationEnd: event.registrationEnd,
                              endDate: event.endDate,
                            });
                          }}
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
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {event.description.substring(0, 40) +
                        (event.description.length > 40 ? "..." : "")}
                    </p>

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() =>
                        navigate(`/campus-connect/student/events/${event.id}`)
                      }
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
