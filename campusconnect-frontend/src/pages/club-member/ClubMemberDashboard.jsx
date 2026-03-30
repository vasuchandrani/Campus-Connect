import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import {
  CalendarDays,
  Heart,
  UserCheck,
  UsersRound,
  ChevronRight,
  Clock,
  MapPin,
  BellOff
} from "lucide-react";
import { clubMemberNavItems } from "../../config/Navigation";
import { useParams } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { toast } from "../../hooks/use-toast";
import { useNavigate } from "react-router-dom";
import EmptyState from "../../components/ui/EmptyState";
import Loading from "../../components/ui/Loading";

const ClubMemberDashboard = () => {
  // Get clubId from URL params
  const { clubId } = useParams();

  const navigate = useNavigate();

  // Base URL for API calls related to this club
  const baseUrl = `${import.meta.env.VITE_BACKEND_URL}/campus-connect/clubs/${clubId}/member`;

  //--------------Nav---------------//
  const updateNavItems = useCallback(() => {
    return clubMemberNavItems.map((item) => {
      return {
        ...item,
        href: item.href.replace(":clubId", clubId),
      };
    });
  }, [clubId]);

  // State variables
  const [clubAnnouncements, setClubAnnouncements] = useState([]);
  const [clubEvents, setClubEvents] = useState([]);
  const [stats, setStats] = useState({
    events: 0,
    followers: 0,
    members: 0,
    teams: 0,
  });
  const [clubName, setClubName] = useState("Club Name");
  const [loading, setLoading] = useState({
    announcements: true,
    events: true,
  });

  //fetch club name
  const fetchClubName = async() => {
    await fetch(`${baseUrl}/club-name`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    })
      .then(async (res) => await res.text())
      .then((text) => setClubName(text))
      .catch((err) => {
        toast({
          title: "Error",
          description: err.message||"Failed to fetch club details",
          variant: "destructive",
        });
      });
  };

  //fetch stats
  const fetchStates = async () => {
    await fetch(`${baseUrl}/stats`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    })
      .then(async (res) => await res.json())
      .then((data) => {
        setStats({
          events: data.events,
          followers: data.followers,
          members: data.members,
          teams: data.teams,
        });
      })
      .catch((err) => {
        toast({
          title: "Error",
          description: err.message||"Failed to fetch stats",
          variant: "destructive",
        });
      });
  };

  //fetch club announcements
  const fetchClubAnnouncements = async () => {
    setLoading((prev) => ({ ...prev, announcements: true }));
    await fetch(`${baseUrl}/top-announcements`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    })
      .then(async (res) => await res.json())
      .then((data) => {
        setClubAnnouncements(data);
      })
      .catch((err) => {
        toast({
          title: "Error",
          description: err.message || "Failed to fetch announcements",
          variant: "destructive",
        });
      }).finally(() => {
        setLoading((prev) => ({ ...prev, announcements: false }));
      });
  };

  //fetch club events
  const fetchClubEvents = async () => {
    setLoading((prev) => ({ ...prev, events: true }));
    await fetch(`${baseUrl}/top-events`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    })
      .then(async (res) => await res.json())
      .then((data) => {
        setClubEvents(data);
      })
      .catch((err) => {
        toast({
          title: "Error",
          description: err.message || "Failed to fetch events",
          variant: "destructive",
        });
      }).finally(() => {
        setLoading((prev) => ({ ...prev, events: false }));
      });
  };

  //load club details on component mount and whenever clubId changes
  useEffect(() => {
    const fetchData = async () => {
      try{
        await Promise.all([fetchClubName(), fetchStates(), fetchClubAnnouncements(), fetchClubEvents()]);
      }
      catch (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch club details",
          variant: "destructive",
        });
      }
    };

    fetchData();
  }, [clubId]);

  //---------------------------UI----------------------------//
  return (
    <DashboardLayout navItems={updateNavItems()} title="Club Member Dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/5 rounded-2xl p-6 border border-primary/20">
          <h2 className="text-2xl font-bold mb-2">{clubName}!</h2>
          <p className="text-muted-foreground">
            Here's a quick overview of your club activities and stats
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Followers */}
          <Card>
            <CardContent className="p-6 flex items-center gap-4 min-h-[110px]">
              <Heart className="w-6 h-6 text-accent" />

              <div className="flex flex-col justify-center ml-10">
                <p className="text-2xl font-bold">{stats.followers}</p>
                <p className="text-sm text-muted-foreground">Followers</p>
              </div>
            </CardContent>
          </Card>

          {/* Active Events */}
          <Card>
            <CardContent className="p-6 flex items-center gap-4 min-h-[110px]">
              <CalendarDays className="w-6 h-6 text-primary" />

              <div className="flex flex-col justify-center ml-10">
                <p className="text-2xl font-bold">{stats.events}</p>
                <p className="text-sm text-muted-foreground">Active Events</p>
              </div>
            </CardContent>
          </Card>

          {/* Members */}
          <Card>
            <CardContent className="p-6 flex items-center gap-4 min-h-[110px]">
              <UserCheck className="w-6 h-6 text-primary" />

              <div className="flex flex-col justify-center ml-10">
                <p className="text-2xl font-bold">{stats.members}</p>
                <p className="text-sm text-muted-foreground">Fellow Members</p>
              </div>
            </CardContent>
          </Card>

          {/* Teams */}
          <Card>
            <CardContent className="pt-4 flex items-center gap-4 min-h-[110px]">
              <UsersRound className="w-6 h-6 text-accent" />

              <div className="flex flex-col justify-center ml-10">
                <p className="text-2xl font-bold">{stats.teams}</p>
                <p className="text-sm text-muted-foreground">Teams</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Announcements */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Club Announcements</h3>
              <Button variant="ghost" size="sm" onClick={() => {
                navigate(`/campus-connect/club-member/${clubId}/announcements`);
              }}>
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

              {loading.announcements ? (
                <Loading />
              ) : clubAnnouncements.length === 0 ? (
                <EmptyState
                  title="No Announcements"
                  desc="There are no announcements for this club yet."
                  icon={<BellOff className="w-8 h-8 text-muted-foreground" />}
                />
              ) : (
            clubAnnouncements.map((a) => (
              <Card key={a.id}>
                <CardContent className="pt-4">
                  <div className="flex justify-between gap-4">
                    <div>
                      {a.priority === "high" && (
                        <Badge variant="destructive" className="mb-1">
                          Important
                        </Badge>
                      )}
                      <h4 className="font-medium">{a.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {a.content.substring(0, 100) +
                          (a.content.length > 100 ? "..." : "")}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {a.date}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )))}
          </div>

          {/* Events */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Upcoming Events</h3>
              <Button variant="ghost" size="sm" onClick={() => {
                navigate(`/campus-connect/club-member/${clubId}/events`);
              }}>
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            {loading.events ? (
              <Loading />
            ) : clubEvents.length === 0 ? (
              <EmptyState
                title="No Events"
                desc="There are no upcoming events for this club yet."
                icon={<CalendarDays className="w-8 h-8 text-muted-foreground" />}
              />
            ) : (
            clubEvents.map((e) => (
              <Card key={e.id} className="relative">
                <CardContent className="pt-4">
                  {/* Status Badge Top Right */}
                  <Badge
                    className="absolute top-4 right-4"
                    variant={
                      e.status === "UPCOMING"
                        ? "default"
                        : e.status === "LIVE"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {e.status}
                  </Badge>

                  <h4 className="font-medium mb-2">{e.title}</h4>

                  <div className="text-sm text-muted-foreground space-y-1">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {e.startTime.split("T")[0]} at{" "}
                      {e.startTime.split("T")[1].substring(0, 5)}
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {e.location}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClubMemberDashboard;
