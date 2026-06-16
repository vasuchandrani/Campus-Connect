import { useEffect,useCallback, useState } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/Tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../components/ui/Dialog";
import {
  Users,
  Search,
  CheckCircle,
  XCircle,
  Eye,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/DropdownMenu";
import { useNavigate } from "react-router-dom";
import { collegeAdminNavItems } from "../../config/Navigation";
import { toast } from "../../hooks/use-toast";
import { useAuth } from "../../contexts/AuthContext";
import { useMemo } from "react";
import Loading from "../../components/ui/Loading";
import EmptyState from "../../components/ui/EmptyState";

const navItems = collegeAdminNavItems;

const AdminClubsPage = () => {
  const navigate = useNavigate();

  // Base URL for all API calls in this page
  const baseUrl = `${import.meta.env.VITE_BACKEND_URL}/campus-connect/college-admin`;

  // State variables
  const [searchQuery, setSearchQuery] = useState("");
  const [reviewClub, setReviewClub] = useState(null);
  const [clubs, setClubs] = useState([]);
  const [pendingClubs, setPendingClubs] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [completedEvents, setCompletedEvents] = useState([]);
  const [viewAnnouncement, setViewAnnouncement] = useState(null);
  const [viewEvent, setViewEvent] = useState(null);
  const [requesting, setRequesting] = useState(false);
  const [loading, setLoading] = useState({
    clubs: false,
    pendingClubs: false,
    announcements: false,
    upcomingEvents: false,
    completedEvents: false,
  });

  const { routeProtection } = useAuth();

  useEffect(() => {
    if (!routeProtection("COLLEGE_ADMIN")) {
      navigate("/auth");
    }
  }, [navigate, routeProtection]);


    //fetch Announcements
  const fetchAnnouncements = useCallback(async () => {
    setLoading((prev) => ({ ...prev, announcements: true }));
    await fetch(`${baseUrl}/announcements`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    })
      .then(async (res) => await res.json())
      .then((data) => {
        setAnnouncements(data);
      })
      .catch((err) =>
        toast({
          title: "Error",
          description: err.message || "Failed to fetch announcements",
          variant: "destructive",
        }),
      ).finally(() => {
        setLoading((prev) => ({ ...prev, announcements: false }));
      });
  },[baseUrl]);
  
  //fetch pending club requests
  const fetchClubRequest = useCallback(async () => {
    setLoading((prev) => ({ ...prev, pendingClubs: true }));

    try {
      const res = await fetch(`${baseUrl}/club-request`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      const data = await res.json();
      setPendingClubs(data);
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch club requests",
        variant: "destructive",
      });
    } finally {
      setLoading((prev) => ({ ...prev, pendingClubs: false }));
    }
  },[baseUrl]);

  //fetch Upcomming events
  const fetchUpcomingEvents = useCallback(async () => {
    setLoading((prev) => ({ ...prev, upcomingEvents: true }));

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
      toast({
        title: "Error",
        description: err.message || "Failed to fetch upcoming events",
        variant: "destructive",
      });
    } finally {
      setLoading((prev) => ({ ...prev, upcomingEvents: false }));
    }
  },[baseUrl]);

  //fetch completed events
  const fetchCompletedEvents = useCallback(async () => {
    setLoading((prev) => ({ ...prev, completedEvents: true }));

    try {
      const res = await fetch(`${baseUrl}/events/finished`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      const data = await res.json();
      setCompletedEvents(data);
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "Failed to fetch completed events",
        variant: "destructive",
      });
    } finally {
      setLoading((prev) => ({ ...prev, completedEvents: false }));
    }
  },[baseUrl]);

  //fetch clubs
  const fetchClubs = useCallback(async () => {
    setLoading((prev) => ({ ...prev, clubs: true }));

    try {
      const res = await fetch(`${baseUrl}/clubs`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      const data = await res.json();
      setClubs(data);
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "Failed to fetch clubs",
        variant: "destructive",
      });
    } finally {
      setLoading((prev) => ({ ...prev, clubs: false }));
    }
  },[baseUrl]);

  //Approve club request
  const approveClub = useCallback((clubId) => {
    setRequesting(true);
    fetch(`${baseUrl}/club-request/${clubId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    })
      .then(async (res) => {
        const data = await res.json();
        if (data.message === "Club-request approved successfully") {
          toast({
            title: "Club approved",
            description: data.message,
            variant: "success",
          });
          fetchClubRequest(); // Refresh pending clubs list
          fetchClubs(); // Refresh active clubs list
        } else {
          throw new Error(data.message || "Failed to approve club request");
        }
      })
      .catch((err) =>
        toast({
          title: "Error",
          description: err.message || "Failed to approve club request",
          variant: "destructive",
        }),
      )
      .finally(() => {
        setRequesting(false);
      });
  },[baseUrl,fetchClubRequest,fetchClubs]);

  const [now, setNow] = useState(new Date());
  //get event status based on current time
  const getEventStatus = useCallback((event) => {
    const start = new Date(event.startTime);
    const end = new Date(event.endTime);

    if (now >= start && now <= end) return "LIVE";
    if (now < start) return "UPCOMING";
    return "FINISHED";
  }, [now]);

  

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  //Delete club request
  const deleteClubRequest = useCallback(async (clubId) => {
    setRequesting(true);
    await fetch(`${baseUrl}/club-request/${clubId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    })
      .then(async (res) => {
        const data = await res.json();
        if (data.message === "Club-request rejected successfully") {
          toast({
            title: "Club request rejected",
            description: data.message,
            variant: "destructive",
          });
        } else throw new Error(data.message || "Failed to reject club request");
      })
      .catch((err) =>
        toast({
          title: "Error",
          description: err.message || "Failed to reject club request",
          variant: "destructive",
        }),
      )
      .finally(() => {
        fetchClubRequest();
        setRequesting(false);
      });
  },[baseUrl,fetchClubRequest]);

  const deleteClub = useCallback(async (clubId) => {
    setRequesting(true);
    await fetch(`${baseUrl}/clubs/${clubId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    })
      .then(async (res) => {
        const data = await res.json();
        if (data.message === "Club deleted successfully!") {
          toast({
            title: "Club deleted",
            description: data.message,
            variant: "destructive",
          });
          fetchClubs();
        } else {
          throw new Error(data.message || "Failed to delete club");
        }
      })
      .catch((err) =>
        toast({
          title: "Error",
          description: err.message || "Failed to delete club",
          variant: "destructive",
        }),
      )
      .finally(() => {
        setRequesting(false);
      });
  },[baseUrl,fetchClubs]);

  //load data on component mount
  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        fetchClubs(),
        fetchClubRequest(),
        fetchAnnouncements(),
        fetchUpcomingEvents(),
        fetchCompletedEvents(),
      ]);
    };

    fetchData();
  }, [fetchClubs, fetchClubRequest, fetchAnnouncements, fetchUpcomingEvents, fetchCompletedEvents]);

  //sort upcoming events to show LIVE ones first
  const upcomming = useMemo(() => {
    return [...upcomingEvents].sort((a, b) => {
      const statusA = getEventStatus(a);
      const statusB = getEventStatus(b);

      if (statusA === "LIVE" && statusB !== "LIVE") return -1;
      if (statusA !== "LIVE" && statusB === "LIVE") return 1;

      return 0;
    });
  }, [upcomingEvents, getEventStatus]);



  //for searching
  const filteredClubs = useMemo(() => {
    return clubs.filter((club) =>
      club.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [clubs, searchQuery]);

  const filteredPendingClubs = useMemo(() => {
    return pendingClubs.filter((club) =>
      club.clubName.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [pendingClubs, searchQuery]);

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [announcements, searchQuery]);

  const filteredUpcomingEvents = useMemo(() => {
    return upcomming.filter((e) =>
      e.title.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [upcomming, searchQuery]);

  const filteredCompletedEvents = useMemo(() => {
    return completedEvents.filter((e) =>
      e.title.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [completedEvents, searchQuery]);

  //-----------------------------UI----------------------------//
  return (
    <DashboardLayout navItems={navItems} title="Manage Clubs">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Clubs Management</h1>
            <p className="text-muted-foreground">Manage all registered clubs</p>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search ..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Tabs for Active Clubs, Pending Requests, Announcements, Events */}
        <Tabs defaultValue="active">
          <TabsList className="flex flex-wrap gap-2 mb-15 w-full sm:w-fit">
            <TabsTrigger
              value="active"
              className="w-[48%] sm:w-auto text-center"
            >
              Active Clubs ({filteredClubs.length})
            </TabsTrigger>

            <TabsTrigger
              value="pending"
              className="w-[48%] sm:w-auto text-center"
            >
              Pending Approval ({filteredPendingClubs.length})
            </TabsTrigger>

            <TabsTrigger
              value="announcements"
              className="w-[48%] sm:w-auto text-center"
            >
              Announcements ({filteredAnnouncements.length})
            </TabsTrigger>

            <TabsTrigger
              value="upcoming"
              className="w-[48%] sm:w-auto text-center"
            >
              Active Events ({filteredUpcomingEvents.length})
            </TabsTrigger>

            <TabsTrigger
              value="completed"
              className="w-[48%] sm:w-auto text-center"
            >
              Completed Events ({filteredCompletedEvents.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-6">
            {/* Clubs Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading.clubs ? (
                <div className="col-span-full text-center py-10">
                  <Loading />
                </div>
              ) : filteredClubs.length === 0 ? (
                <div className="col-span-full w-full">
                  <EmptyState
                    className="col-span-full text-center py-10"
                    icon={<Search className="w-8 h-8 text-muted-foreground" />}
                    title="No Clubs Found"
                    desc="There are currently no clubs available. Please check back later."
                  />
                </div>
              ) : (
                filteredClubs.map((club) => (
                  <Card
                    key={club.id}
                    className="cursor-pointer hover:shadow-lg transition"
                    onClick={() =>
                      navigate(`/campus-connect/college-admin/clubs/${club.id}`)
                    }
                  >
                    {/* Image + 3-dot menu */}
                    <div className="relative">
                      <img
                        src={club.logoUrl}
                        alt={club.name}
                        className="w-full h-40 object-cover rounded-t-lg"
                      />

                      {/* 3-dot dropdown */}
                      <div className="absolute top-2 right-2 z-20">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={requesting}
                              className="bg-white/80 hover:bg-white"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(
                                  `/campus-connect/college-admin/clubs/${club.id}`,
                                );
                              }}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={(e) => {
                                deleteClub(club.id);
                                e.stopPropagation();
                              }}
                            >
                              Delete Club
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Card Content */}
                    <CardContent className="p-5 pt-4">
                      <div className="flex justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold">{club.name}</h3>
                        </div>

                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Users className="w-4 h-4" />
                          {club.members}
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mb-4">
                        {club.description.substring(0, 40) +
                          (club.description.length > 40 ? "..." : "")}
                      </p>

                      <Button
                        variant="outline"
                        className="w-full"
                        disabled={requesting}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(
                            `/campus-connect/college-admin/clubs/${club.id}`,
                          );
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="pending" className="mt-6">
            {/* Dialog for pending club requests */}
            <Dialog
              open={!!reviewClub}
              onOpenChange={(open) => !open && setReviewClub(null)}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Review Club Request</DialogTitle>
                  <DialogDescription>
                    Review the details of this club registration request
                  </DialogDescription>
                </DialogHeader>

                {reviewClub && (
                  <div className="space-y-4 pt-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Club Name
                      </p>
                      <p className="font-semibold text-lg">
                        {reviewClub.clubName}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Description
                      </p>
                      <p>{reviewClub.clubDescription}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Submitted By
                      </p>
                      <p>
                        {reviewClub.studentName} on{" "}
                        {reviewClub.createdAt.split("T")[0]}
                      </p>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        disabled={requesting}
                        className="flex-1 text-destructive"
                        onClick={() => {
                          deleteClubRequest(reviewClub.id);
                          setReviewClub(null);
                        }}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>

                      <Button
                        className="flex-1"
                        disabled={requesting}
                        onClick={() => {
                          approveClub(reviewClub.id);
                          setReviewClub(null);
                        }}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* Pending Clubs List */}
            <div className="space-y-4">
              {loading.pendingClubs ? (
                <div className="col-span-full text-center py-10">
                  <Loading />
                </div>
              ) : filteredPendingClubs.length === 0 ? (
                <div className="col-span-full w-full">
                  <EmptyState
                    className="text-center py-10"
                    icon={<Search className="w-8 h-8 text-muted-foreground" />}
                    title="No Pending Club Requests"
                    desc="There are no club registration requests to review."
                  />
                </div>
              ) : (
                filteredPendingClubs.map((club) => (
                  <Card key={club.id} className="border-border/50">
                    <CardContent className="p-6 pt-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-semibold">
                            {club.clubName}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Submitted by {club.studentName} on{" "}
                            {club.createdAt.split("T")[0]}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            disabled={requesting}
                            variant="outline"
                            onClick={() => {
                              setReviewClub(club);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Review
                          </Button>
                          <Button
                            disabled={requesting}
                            variant="outline"
                            className="text-destructive"
                            onClick={() => {
                              deleteClubRequest(club.id);
                            }}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                          <Button
                            disabled={requesting}
                            onClick={() => approveClub(club.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="announcements" className="mt-6">
            {/* Dialog for viewing announcement details */}
            <Dialog
              open={!!viewAnnouncement}
              onOpenChange={(open) => !open && setViewAnnouncement(null)}
            >
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Announcement Details</DialogTitle>
                </DialogHeader>

                {viewAnnouncement && (
                  <div className="space-y-4 pt-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Title
                      </p>
                      <p className="font-semibold text-lg">
                        {viewAnnouncement.title}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Date
                      </p>
                      <p>
                        {viewAnnouncement.createdAt.split("T")[0]} at{" "}
                        {viewAnnouncement.createdAt.split("T")[1].split(".")[0]}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Description
                      </p>
                      <p>{viewAnnouncement.content}</p>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* Announcements List */}
            <div className="space-y-4">
              {loading.announcements ? (
                <div className="col-span-full text-center py-10">
                  <Loading />
                </div>
              ) : filteredAnnouncements.length === 0 ? (
                <div className="col-span-full w-full">
                  <EmptyState
                    className="text-center py-10"
                    icon={<Search className="w-8 h-8 text-muted-foreground" />}
                    title="No Announcements"
                    desc="There are no announcements to display."
                  />
                </div>
              ) : (
                filteredAnnouncements.map((announcement) => (
                  <Card key={announcement.id} className="relative pt-4">
                    <CardContent className="p-6">
                      {/* 🔹 Top Row: Title + Eye Button */}
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="flex gap-2 mb-1">
                            <Badge variant="outline">
                              {announcement.clubName}
                            </Badge>
                          </div>
                          <h3 className="text-lg font-semibold">
                            {announcement.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {announcement.createdAt.split("T")[0]} at{" "}
                            {announcement.createdAt.split("T")[1].split(".")[0]}
                          </p>
                        </div>

                        {/*  Eye Button */}
                        <Button
                          disabled={requesting}
                          variant="ghost"
                          size="icon"
                          onClick={() => setViewAnnouncement(announcement)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* 🔹 Description */}
                      <p className="text-sm text-muted-foreground">
                        {announcement.content.substring(0, 35) +
                          (announcement.content.length > 35 ? "..." : "")}
                      </p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="upcoming" className="mt-6">
            {/* Event Details Dialog */}
            <Dialog
              open={!!viewEvent}
              onOpenChange={(open) => !open && setViewEvent(null)}
            >
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Event Details</DialogTitle>
                  <DialogDescription>
                    Review the details of this event
                  </DialogDescription>
                </DialogHeader>

                {viewEvent && (
                  <div className="space-y-4 pt-4">
                    <p>
                      <strong>Title:</strong> {viewEvent.title}
                    </p>

                    {viewEvent.description && (
                      <p>
                        <strong>Description:</strong> {viewEvent.description}
                      </p>
                    )}

                    {viewEvent.startTime && (
                      <p>
                        <strong>Date & Time:</strong>{" "}
                        {viewEvent.startTime.split("T")[0]} •{" "}
                        {viewEvent.startTime.split("T")[1]}
                      </p>
                    )}

                    <p>
                      <strong>Location:</strong> {viewEvent.location}
                    </p>

                    {viewEvent.clubName && (
                      <p>
                        <strong>Club:</strong> {viewEvent.clubName}
                      </p>
                    )}

                    {viewEvent.registrationEnd && (
                      <p>
                        <strong>Registration End:</strong>{" "}
                        {viewEvent.registrationEnd.split("T")[0]} •{" "}
                        {viewEvent.registrationEnd.split("T")[1]}
                      </p>
                    )}
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* Events Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading.upcomingEvents ? (
                <div className="col-span-full text-center py-10">
                  <Loading />
                </div>
              ) : filteredUpcomingEvents.length === 0 ? (
                <div className="col-span-full w-full">
                  <EmptyState
                    className="text-center py-10 w-full"
                    icon={<Search className="w-8 h-8 text-muted-foreground" />}
                    title="No Upcoming Events"
                    desc="There are no upcoming events to display."
                  />
                </div>
              ) : (
                filteredUpcomingEvents.map((event) => {
                  const status = getEventStatus(event);

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
                        <div className="flex items-center justify-between gap-2 mb-2">
                          {event.clubName && (
                            <Badge variant="outline">{event.clubName}</Badge>
                          )}

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

                        {event.description && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {event.description.substring(0, 40) +
                              (event.description.length > 40 ? "..." : "")}
                          </p>
                        )}

                        <Button
                          disabled={requesting}
                          variant="outline"
                          className="w-full"
                          onClick={() => setViewEvent(event)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Details
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading.completedEvents ? (
                <div className="col-span-full text-center py-10">
                  <Loading />
                </div>
              ) : filteredCompletedEvents.length === 0 ? (
                <div className="col-span-full w-full">
                  <EmptyState
                    className="col-span-full text-center py-10"
                    icon={<Search className="w-8 h-8 text-muted-foreground" />}
                    title="No Completed Events"
                    desc="There are no completed events to display."
                  />
                </div>
              ) : (
                filteredCompletedEvents.map((event) => (
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
                        {event.description.substring(0, 40) +
                          (event.description.length > 40 ? "..." : "")}
                      </p>

                      <Button
                        disabled={requesting}
                        variant="outline"
                        className="w-full"
                        onClick={() =>
                          navigate(
                            `/campus-connect/college-admin/events/${event.id}`,
                          )
                        }
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminClubsPage;
