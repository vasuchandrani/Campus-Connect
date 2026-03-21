import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { BellOff, Eye, Heart } from "lucide-react";
import { CalendarDays, UserCheck, UsersRound } from "lucide-react";
import { clubAdminNavItems } from "../../config/Navigation";
import { useParams } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { toast } from "../../hooks/use-toast";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Loading from "../../components/ui/Loading";
import EmptyState from "../../components/ui/EmptyState";

const ClubAdminDashboard = () => {
  // Get clubId from URL params
  let { clubId } = useParams();

  const navigate = useNavigate();
  // Base URL for API calls related to this club
  const baseUrl = `${import.meta.env.VITE_BACKEND_URL}/campus-connect/clubs/${clubId}/admin`;

  //---------Navs------------//
  const updatenavItems = useCallback(() => {
    return clubAdminNavItems.map((item) => {
      return {
        ...item,
        href: item.href.replace(":clubId", clubId),
      };
    });
  }, [clubId]);

  // State variables
  const [clubAnnouncements, setClubAnnouncements] = useState([]);
  const [stats, setStats] = useState({
    members: 0,
    followers: 0,
    teams: 0,
    events: 0,
  });
  const [teams, setTeams] = useState([]);
  const [clubName, setClubName] = useState("Club Name");
  const [loading, setLoading] = useState({
    announcements: false,
    teams: false,
  });

  //1) Fetch club details including stats, announcements, teams etc.
  const fetchClubName = async () => {
    try {
      const res = await fetch(`${baseUrl}/club-name`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      const text = await res.text();
      setClubName(text);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to fetch club details",
        status: "error",
      });
    }
  };

  //2) Fetch stats
  const fetchStats = async () => {
    try {
      const res = await fetch(`${baseUrl}/stats`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      const data = await res.json();

      setStats({
        events: data.events,
        followers: data.followers,
        members: data.members,
        teams: data.teams,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to fetch stats",
        status: "error",
      });
    }
  };

  //3) Fetch teams
  const fetchTeams = async () => {
    setLoading((prev) => ({ ...prev, teams: true }));

    try {
      const res = await fetch(`${baseUrl}/team-names`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      const data = await res.json();
      setTeams(data);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to fetch teams",
        status: "error",
      });
    } finally {
      setLoading((prev) => ({ ...prev, teams: false }));
    }
  };

  //4) Fetch recent announcements
  const fetchClubAnnouncements = async () => {
    setLoading((prev) => ({ ...prev, announcements: true }));

    try {
      const res = await fetch(`${baseUrl}/top-announcements`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      const data = await res.json();
      setClubAnnouncements(data);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to fetch announcements",
        status: "error",
      });
    } finally {
      setLoading((prev) => ({ ...prev, announcements: false }));
    }
  };

  // Fetch all necessary data on component mount and whenever clubId changes
useEffect(() => {
  const fetchData = async () => {
    await Promise.all([
      fetchClubName(),
      fetchStats(),
      fetchClubAnnouncements(),
      fetchTeams(),
    ]);
  };

  fetchData();
}, [clubId]);

  return (
    <DashboardLayout navItems={updatenavItems()} title="Club Dashboard">
      <div className="space-y-6">
        {/* Club Header */}
        <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/5 rounded-2xl p-6 border border-primary/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold mb-1">{clubName}</h2>
              <p className="text-muted-foreground">
                Manage your club, members, and content
              </p>
            </div>
          </div>
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
            <CardContent className="p-6 flex items-center gap-4 min-h-[110px]">
              <UsersRound className="w-6 h-6 text-accent" />

              <div className="flex flex-col justify-center ml-10">
                <p className="text-2xl font-bold">{stats.teams}</p>
                <p className="text-sm text-muted-foreground">Teams</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Announcements & Team sections */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* ================= Recent Announcements ================= */}
          <div className="lg:col-span-2 space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Recent Announcements</h3>

              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  navigate(`/campus-connect/club-admin/${clubId}/announcements`)
                }
              >
                View All
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            {/* Announcement Cards */}
            <div className="space-y-3">
              {loading.announcements ? (
                <Loading />
              ) : clubAnnouncements.length === 0 ? (
                <EmptyState 
                  title="No Announcements"
                  desc="There are no announcements for this club yet."
                  icon={<BellOff className="w-8 h-8 text-muted-foreground" />}
                />
              ) : (
              
              clubAnnouncements &&
                clubAnnouncements.map((announcement) => (
                  <Card
                    key={announcement.id}
                    className="border-border/50 hover:shadow-sm transition"
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          {announcement.priority === "high" && (
                            <Badge
                              variant="destructive"
                              className="text-xs mb-1"
                            >
                              Important
                            </Badge>
                          )}

                          <h4 className="font-medium">{announcement.title}</h4>

                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {announcement.content.substring(0, 80) +
                              (announcement.content.length > 80 ? "..." : "")}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )))}
            </div>
          </div>

          {/* ================= Teams ================= */}
          <div className="space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Teams</h3>

              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  navigate(`/campus-connect/club-admin/${clubId}/teams`)
                }
              >
                View All
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            {/* Teams Card */}
            <Card className="border-border/50">
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {loading.teams ? (
                    <Loading />
                  ) : (
                     teams.length === 0 ? (
                      <EmptyState
                        title="No Teams"
                        desc="There are no teams created for this club yet."
                        icon={<UsersRound className="w-8 h-8 text-muted-foreground" />}
                      />
                     ):(
                  teams.map((team) => (
                    <div
                      key={team.name}
                      className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/40 transition"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {team.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {team.description}
                        </p>
                      </div>
                    </div>
                  ))))}

                 
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClubAdminDashboard;
