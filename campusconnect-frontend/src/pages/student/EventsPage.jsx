import { useCallback, useEffect, useState } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { studentNavItems } from "../../config/Navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../components/ui/Dialog";
import { toast } from "../../hooks/use-toast";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/Tabs";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { useAuth } from "../../contexts/AuthContext";
import Loading from "../../components/ui/Loading";
import EventCard from "../../components/ui/EventCard";
import FinishedEventCard from "../../components/ui/FinishedEventCard";
import EmptyState from "../../components/ui/EmptyState";
import {CalendarSearch} from "lucide-react"

const EventsPage = () => {
  // Base URL for API calls related to student events
  const baseUrl = `${import.meta.env.VITE_BACKEND_URL}/campus-connect/student`;

  const navigate = useNavigate();

  // State variables
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [finishedEvents, setFinishedEvents] = useState([]);
  const [now, setNow] = useState(new Date());
  const [requesting, setRequesting] = useState(false);
  const [loading, setLoading] = useState({
    upcoming: true,
    finished: true,
  });

  const { routeProtection } = useAuth();

  useEffect(() => {
    if (!routeProtection("STUDENT")) {
      navigate("/auth");
    }
  }, [navigate, routeProtection]);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  //get event status base on current time and event start/end time
  const getEventStatus = useCallback((event) => {
    const start = new Date(event.startTime);
    const end = new Date(event.endTime);

    if (now >= start && now <= end) return "LIVE";
    if (now < start) return "UPCOMING";
    return "FINISHED";
  }, [now]);

  //get is registration open based on current time and registration end time
  const isRegistrationOpen = useCallback((event) => {
    if (!event.registrationEnd) return false;
    return new Date() < new Date(event.registrationEnd);
  }, []);

  // Fetch Upcomming events from API
  const getEvents = useCallback(async () => {
    setLoading((prev) => ({ ...prev, upcoming: true }));

    try {
      const res = await fetch(`${baseUrl}/events/active`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      const data = await res.json();
      setUpcomingEvents(data);
    } catch (err) {
      console.error("Error fetching events:", err);
      alert("Failed to load events");
    } finally {
      setLoading((prev) => ({ ...prev, upcoming: false }));
    }
  }, [baseUrl]);
  const getFinishedEvents = useCallback(async () => {
    setLoading((prev) => ({ ...prev, finished: true }));

    try {
      const res = await fetch(`${baseUrl}/events/finished`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      const data = await res.json();
      setFinishedEvents(data);
    } catch (err) {
      console.error("Error fetching finished events:", err);
      toast({
        title: "Error",
        description: "Failed to load finished events",
        variant: "destructive",
      });
    } finally {
      setLoading((prev) => ({ ...prev, finished: false }));
    }
  }, [baseUrl]);

  //change registration status for an event
  const toggleRegistration = (eventId) => {
    const eventObj = upcomingEvents.find((e) => e.id === eventId);
    if (eventObj.register) {
      setRequesting(true);
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
        .catch(() => {
          toast({
            title: "Error",
            description: "Failed to unregister from event",
            variant: "destructive",
          });
        })
        .finally(() => {
          setRequesting(false);
        });
    } else {
      setRequesting(true);
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
        .catch(() => {
          toast({
            title: "Error",
            description: "Failed to register for event",
            variant: "destructive",
          });
        })
        .finally(() => {
          setRequesting(false);
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
      const statusA = getEventStatus(a);
      const statusB = getEventStatus(b);

      const statusDiff =
        (statusPriority[statusA] || 99) - (statusPriority[statusB] || 99);

      if (statusDiff !== 0) return statusDiff;

      if (statusA === "UPCOMING") {
        if (a.register && !b.register) return -1;
        if (!a.register && b.register) return 1;

        return new Date(a.startTime) - new Date(b.startTime);
      }

      return 0;
    });
  }, [upcomingEvents, getEventStatus]);

  // Load events on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([getEvents(), getFinishedEvents()]);
      } catch (err) {
        console.error("Error loading events:", err);
        toast({
          title: "Error",
          description: "Failed to load events",
          variant: "destructive",
        });
      }
    };

    loadData();
  }, [getEvents, getFinishedEvents]);

  //formate date and time for display
  const formatDate = useCallback((dateTime) => {
    if (!dateTime) return { date: "", time: "" };
    const [date, time] = dateTime.split("T");
    return { date, time: time.substring(0, 5) };
  }, []);

  return (
    <DashboardLayout navItems={studentNavItems} title="Events" bell={true}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Events</h1>

        <Tabs defaultValue="upcoming">
          <TabsList>
            <TabsTrigger value="upcoming">
              Active ({upcomingEvents.length})
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
                          <strong>Description:</strong>{" "}
                          {selectedEvent.description}
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
                              {selectedEvent.endTime
                                .split("T")[1]
                                .substring(0, 5)}
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
                                  {selectedEvent.speakers.map(
                                    (speaker, index) => (
                                      <li key={index}>{speaker.name}</li>
                                    ),
                                  )}
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
                                  {selectedEvent.sponsors.map(
                                    (sponsor, index) => (
                                      <li key={index}>{sponsor.name}</li>
                                    ),
                                  )}
                                </ul>
                              </>
                            )}
                        </div>
                      </>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
              {loading.upcoming ? (
                <div className="col-span-3">
                  <Loading />
                </div>
              ) :(
              sortedEvents.length === 0 ? (
                <div className="col-span-3">
                  <EmptyState
                    icon={<CalendarSearch className="w-8 h-8 text-muted-foreground mx-auto mb-4" />}
                    title="No Active Events"
                    desc="There are no active events at the moment."
                  />
                </div>
              ) : (
                sortedEvents.map((event) => {
                  const status = getEventStatus(event);
                  const isRegistered = event.register;

                  return (
                    <EventCard
                      key={event.id}
                      event={event}
                      status={status}
                      isRegistered={isRegistered}
                      requesting={requesting}
                      toggleRegistration={toggleRegistration}
                      setSelectedEvent={setSelectedEvent}
                      isRegistrationOpen={isRegistrationOpen}
                    />
                  );
                })
              ))}
            </div>
          </TabsContent>

          {/* FINISHED EVENTS */}
          <TabsContent value="finished" className="mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading.finished ? (
                <div className="col-span-3">
                  <Loading />
                </div>
              ) :(
              finishedEvents.length === 0 ? (
                <div className="col-span-3">
                  <EmptyState
                    icon={<CalendarSearch className="w-8 h-8 text-muted-foreground mx-auto mb-4" />}
                    title="No Finished Events"
                    desc="There are no finished events at the moment."
                  />
                </div>
              ) : (
                finishedEvents.map((event) => (
                  <FinishedEventCard
                    key={event.id}
                    event={event}
                    navigate={navigate}
                  />
                ))
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default EventsPage;
