import { use, useEffect, useState } from "react";
import { useParams, useNavigate, data } from "react-router-dom";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/Avatar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/Tabs";
import {
  Users,
  Calendar,
  ArrowLeft,
  Heart,
  HeartOff,
  Crown,
  UsersRound,
  Clock,
  MapPin,
} from "lucide-react";
import { studentNavItems } from "../../config/Navigation";
import { toast } from "../../hooks/use-toast";
import { useAuth } from "../../contexts/AuthContext";

/* ======================================================================== */

const ClubDetailPage = () => {
  // Get clubId from URL params
  const { clubId } = useParams();
  const navigate = useNavigate();
  // State variables
  const [club, setClub] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [teams, setTeams] = useState([]);
  const [clubMembers, setClubMembers] = useState([]);
  const [isFollowed, setIsFollowed] = useState(true);
  // Base URL for API calls related to student clubs
  const baseUrl = "http://localhost:8080/campus-connect/student";

    const { routeProtection } = useAuth();
    useEffect(() => {
      if (!routeProtection("STUDENT")) {
        navigate("/auth");
      }
    },[]);

  // Fetch club details
  const fetchClubDetails = () => {
    fetch(`${baseUrl}/clubs/${clubId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setClub({
          id: data.id,
          name: data.clubName,
          description: data.description,
          membersCount: data.memberCount,
          teamCount: data.teamCount,
          eventCount: data.eventCount,
          logoUrl: data.logoUrl,
          followerCount: data.followerCount,
          clubImage: data.imgUrl,
          adminId: data.clubAdmin.id,
          adminName: data.clubAdmin.name,
          adminImage: data.clubAdmin.image,
        });
        setAnnouncements(data.announcements);
        setEvents(data.events);
        setTeams(data.teams.sort((a, b) => a.name.localeCompare(b.name)));
        setClubMembers(data.members);
        setIsFollowed(data.isFollowed);
      })
      .catch((err) => {
        toast({
          title: "Error",
          description: err.message || "Failed to fetch club details",
          variant: "destructive",
        });
      });
  };

  //change follow status
  const toggleFollow = () => {
    const newFollowState = !isFollowed; // toggle

    fetch(`${baseUrl}/clubs/${clubId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
      body: JSON.stringify(newFollowState), // send raw boolean
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to update follow status");

        const data = await res.json();

        toast({
          title: "Success",
          description: data.message,
        });
        setIsFollowed(newFollowState);
        return data;
      })
      .catch((err) => {
        console.error(err);
        toast({
          title: "Error",
          description: err.message || "Failed to update follow status",
          variant: "destructive",
        });
      });
  };

  // Load club details on component mount and when clubId changes
  useEffect(() => {
    fetchClubDetails();
  }, [clubId, isFollowed]);

  //if club details are not avilable, show back button
  if (!club) {
    return (
      <DashboardLayout navItems={studentNavItems} title="Club Not Found">
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">
            This club does not exist.
          </p>
          <Button onClick={() => navigate("/campus-connect/student/clubs")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Clubs
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={studentNavItems} title={club.name} bell={true}>
      <div className="space-y-6">
        {/* Back */}
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Header */}
        <div className="relative rounded-2xl overflow-hidden">
          <img src={club.logoUrl} className="w-full h-56 object-cover" />
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
            <div>
              <h1 className="text-3xl text-white font-bold">{club.name}</h1>
              <p className="text-white/80">{club.description}</p>
            </div>
            <Button onClick={toggleFollow}>
              {isFollowed ? (
                <HeartOff className="mr-2" />
              ) : (
                <Heart className="mr-2" />
              )}
              {isFollowed ? "Unfollow" : "Follow"}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat icon={Users} value={club.membersCount} label="Members" />
          <Stat icon={UsersRound} value={club.teamCount} label="Teams" />
          <Stat icon={Calendar} value={club.eventCount} label="Events" />
          <Stat icon={Users} value={club.followerCount} label="Followers" />
        </div>

        {/* Admin */}
        <Card className="pt-5">
          <CardContent className="flex items-center gap-4 p-4">
            <Avatar>
              {club.clubAdminImage && club.clubAdminImage !== "" && (
                <AvatarImage src={club.clubAdminImage} />
              )}
              <AvatarFallback>{club.adminName[0]}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold flex items-center gap-2">
                {club.adminName}
                <Badge>
                  <Crown className="w-3 h-3 mr-1" />
                  Admin
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground">
                Club Administrator
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="teams">
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
          </TabsList>

          <TabsContent value="teams">
            {teams.map((team) => (
              <Card key={team.id} className="mb-3 pt-3">
                <CardContent className="p-4">
                  <p className="font-semibold">{team.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {team.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="members">
            <div className="grid md:grid-cols-2 gap-3">
              {clubMembers.map((m) => (
                <div
                  key={m.studentId}
                  className="flex gap-3 p-3 bg-muted rounded-lg"
                >
                  <Avatar>
                    {m.image && <AvatarImage src={m.image} />}
                    <AvatarFallback>{m.studentName[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{m.studentName}</p>
                    <p className="text-xs text-muted-foreground">{m.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="events">
            <div className="grid grid-cols-3 gap-3">
              {events.map((e) => (
                <Card key={e.id} className="mb-3">
                  <img src={e.image} className="h-32 w-full object-cover" />
                  <CardContent className="p-4">
                    <p className="font-semibold">{e.title}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Clock className="w-4 h-4" /> {e.startTime.split("T")[0]}{" "}
                      {e.startTime.split("T")[1]}
                    </p>
                    <p className="text-sm flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> {e.location}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="announcements">
            {announcements.map((a) => (
              <Card key={a.id} className="mb-3">
                <CardContent className="p-4">
                  <p className="font-semibold">{a.title}</p>
                  <p className="text-sm text-muted-foreground">{a.content}</p>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

/* Small helper */
const Stat = ({ icon: Icon, value, label }) => (
  <Card>
    <CardContent className="p-4 text-center pt-4">
      <Icon className="mx-auto mb-2" />
      <p className="text-xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </CardContent>
  </Card>
);

export default ClubDetailPage;
