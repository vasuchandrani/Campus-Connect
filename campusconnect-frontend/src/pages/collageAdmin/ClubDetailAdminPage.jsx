import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/Avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/Tabs";
import {
  Users,
  Calendar,
  Megaphone,
  ArrowLeft,
  Crown,
  UsersRound,
  Clock,
  MapPin,
} from "lucide-react";
import { toast } from "../../hooks/use-toast";
import {collegeAdminNavItems} from "../../config/Navigation";

/* ======================================================================== */

const ClubDetailAdminPage = () => {
  // Get clubId from URL params
  const { clubId } = useParams();
  const navigate = useNavigate();

  // Base URL for API calls related to this club
  const baseUrl = `http://localhost:8080/campus-connect/college-admin/clubs/${clubId}`;


  // State variables
  const [club, setClub] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [teams, setTeams] = useState([]);
  const [clubMembers, setClubMembers] = useState([]);


  // Fetch club details
  const fetchClubDetails = () => {
    const token = localStorage.getItem("authToken");

    fetch(`${baseUrl}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
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
          clubImage:data.imgUrl,
          adminId: data.clubAdmin.id,
          adminName: data.clubAdmin.name,
        })
        setAnnouncements(data.announcements);
        setEvents(data.events);
        setTeams(data.teams);
        setClubMembers(data.members);
      })
      .catch((err) => {
        toast({
          title: "Error",
          description: "Failed to load club details",
          variant: "destructive",
        });
      });
  };

  //load club details on component mount and whenever clubId changes
  useEffect(() => {
    fetchClubDetails();
  }, [clubId]);


  //-----------------------------UI----------------------------//
  {/* If club is not found, show Back to club button */}
  if (!club) {
    return (
      <DashboardLayout navItems={collegeAdminNavItems} title="Club Not Found">
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">This club does not exist.</p>
          <Button onClick={() => navigate("/campus-connect/college-admin/clubs")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Clubs
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  
  return (
    <DashboardLayout navItems={collegeAdminNavItems} title={club.name}>
      <div className="space-y-6">
        {/* Back */}
        <Button variant="ghost" onClick={() => navigate("/campus-connect/college-admin/clubs")}>
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
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat icon={Users} value={club.membersCount} label="Members" />
          <Stat icon={UsersRound} value={club.teamCount} label="Teams" />
          <Stat icon={Calendar} value={club.eventCount} label="Events" />
          <Stat icon={Megaphone} value={club.followerCount} label="Announcements" />
        </div>

        {/* Admin */}
        <Card className="pt-5">
          <CardContent className="flex items-center gap-4 p-4">
             <Avatar>
              <AvatarImage src={`https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHUndSzxcF1UbSXX3bVILVaUbSIhoc_GEA8g&s`} />
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

              <p className="text-sm text-muted-foreground">Club Administrator</p>
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
                  <p className="text-sm text-muted-foreground">{team.description}</p>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="members">
            <div className="grid md:grid-cols-2 gap-3">
              {clubMembers.map((m) => (
                <div key={m.studentId} className="flex gap-3 p-3 bg-muted rounded-lg">
                  <Avatar>
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
                    <Clock className="w-4 h-4" /> {e.eventDate.split("T")[0]} at {e.eventDate.split("T")[1].slice(0, 5)}
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
                  {a.priority === "high" && <Badge variant="destructive">Important</Badge>}
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

export default ClubDetailAdminPage ;
