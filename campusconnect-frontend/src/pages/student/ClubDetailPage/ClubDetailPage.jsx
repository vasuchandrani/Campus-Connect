import "./ClubDetailPage.css";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import { Card, CardContent } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import PageSkeleton from "../../../components/ui/PageSkeleton";
import EmptyState from "../../../components/ui/EmptyState";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../../components/ui/Tabs";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/Avatar";
import { toast } from "../../../hooks/use-toast";
import { clubApi } from "../../../services/api";
import { useAuth } from "../../../contexts/AuthContext";
import {
  studentNavItems,
  professorNavItems,
  collegeAdminNavItems,
} from "../../../config/Navigation";
import {
  ArrowLeft,
  Users,
  UsersRound,
  Calendar,
  Crown,
  Clock,
  MapPin,
  Heart,
  HeartOff,
  User,
  CalendarSearch,
  Megaphone,
} from "lucide-react";

const ClubDetailPage = () => {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const { user, routeProtection } = useAuth();

  const [club, setClub] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [teams, setTeams] = useState([]);
  const [clubMembers, setClubMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowed, setIsFollowed] = useState(false);
  const [changeFollow, setChangeFollow] = useState(false);

  useEffect(() => {
    if (routeProtection) {
      routeProtection(["STUDENT", "PROFESSOR", "COLLEGE_ADMIN"]);
    }
  }, [routeProtection]);

  // Determine current role for navItems and back navigation
  const currentRole = user?.role || localStorage.getItem("role") || "STUDENT";
  const navItems =
    currentRole === "PROFESSOR"
      ? professorNavItems
      : currentRole === "COLLEGE_ADMIN"
        ? collegeAdminNavItems
        : studentNavItems;

  const backPath =
    currentRole === "PROFESSOR"
      ? "/campus-connect/professor/clubs"
      : currentRole === "COLLEGE_ADMIN"
        ? "/campus-connect/college-admin/clubs"
        : "/campus-connect/student/clubs";

  const fetchClubDetails = async () => {
    setLoading(true);
    try {
      const data = await clubApi.getClub(clubId);
      setClub({
        id: data.id,
        name: data.name,
        description: data.description,
        membersCount: data.memberCount,
        teamCount: data.teamCount,
        eventCount: data.eventCount,
        logoUrl: data.logoUrl,
        followerCount: data.followerCount,
        clubImage: data.imgUrl,
        adminId: data.clubAdmin?.id,
        adminName: data.clubAdmin?.name,
        adminImage: data.clubAdmin?.image,
      });

      setAnnouncements(data.announcements || []);
      setEvents(data.events || []);
      setTeams((data.teams || []).sort((a, b) => a.name.localeCompare(b.name)));
      setClubMembers(data.members || []);
      setIsFollowed(Boolean(data.isFollowed));
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "Failed to fetch club details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Change follow status
  const toggleFollow = async () => {
    if (changeFollow) return;

    setChangeFollow(true);
    const newFollowState = !isFollowed;

    try {
      const data = await clubApi.changeFollow(clubId, newFollowState);

      toast({
        title: "Success",
        description: data.message || "Follow status updated",
      });

      setIsFollowed(newFollowState);

      setClub((prev) => ({
        ...prev,
        followerCount: newFollowState
          ? (prev?.followerCount || 0) + 1
          : Math.max(0, (prev?.followerCount || 0) - 1),
      }));
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "Failed to update follow status",
        variant: "destructive",
      });
    } finally {
      setChangeFollow(false);
    }
  };

  // Load club details on component mount and when clubId changes
  useEffect(() => {
    if (clubId) {
      fetchClubDetails();
    }
  }, [clubId]);

  if (loading) {
    return (
      <DashboardLayout
        navItems={navItems}
        title="Club Details"
        bell={true}
      >
        <PageSkeleton variant="detail" />
      </DashboardLayout>
    );
  }

  // If club details are not available, show back button
  if (!club) {
    return (
      <DashboardLayout navItems={navItems} title="Club Not Found" bell={true}>
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">
            This club does not exist.
          </p>
          <Button onClick={() => navigate(backPath)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Clubs
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={navItems} title={club.name} bell={true}>
      <div className="space-y-6">
        {/* Back */}
        <Button variant="ghost" onClick={() => navigate(backPath)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Header */}
        <div className="relative rounded-2xl overflow-hidden shadow-sm border border-border/60">
          <img
            src={club.logoUrl || "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=1200&auto=format&fit=crop&q=80"}
            alt={club.name}
            className="w-full h-56 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
          <div className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl text-white font-bold tracking-tight">{club.name}</h1>
              <p className="text-white/85 text-xs sm:text-sm mt-1 max-w-2xl line-clamp-2">
                {club.description}
              </p>
            </div>
            <Button
              onClick={toggleFollow}
              disabled={changeFollow}
              variant={isFollowed ? "secondary" : "default"}
              className="shrink-0 font-semibold shadow-md transition-transform active:scale-95"
            >
              {isFollowed ? (
                <HeartOff className="w-4 h-4 mr-1.5 text-rose-500" />
              ) : (
                <Heart className="w-4 h-4 mr-1.5 fill-current" />
              )}
              {isFollowed ? "Unfollow" : "Follow"}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat icon={Users} value={club.membersCount || 0} label="Members" />
          <Stat icon={UsersRound} value={club.teamCount || 0} label="Teams" />
          <Stat icon={Calendar} value={club.eventCount || 0} label="Events" />
          <Stat icon={Users} value={club.followerCount || 0} label="Followers" />
        </div>

        {/* Admin */}
        <Card className="pt-2">
          <CardContent className="flex items-center gap-4 p-4">
            <Avatar className="w-12 h-12 border border-border/80">
              {club.adminImage && <AvatarImage src={club.adminImage} alt={club.adminName} />}
              <AvatarFallback>{club.adminName?.[0] || "A"}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold flex items-center gap-2 text-foreground">
                {club.adminName || "Club Lead"}
                <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                  <Crown className="w-3 h-3 mr-1" />
                  Admin
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Club Administrator
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="teams">
          <TabsList className="w-full grid grid-cols-2 sm:grid-cols-4 sm:inline-flex sm:w-auto h-auto p-1 bg-muted/60 border border-border/60 rounded-xl gap-1">
            <TabsTrigger value="teams" className="text-xs sm:text-sm py-2 sm:py-2.5">
              Teams
            </TabsTrigger>
            <TabsTrigger value="members" className="text-xs sm:text-sm py-2 sm:py-2.5">
              Members
            </TabsTrigger>
            <TabsTrigger value="events" className="text-xs sm:text-sm py-2 sm:py-2.5">
              Events
            </TabsTrigger>
            <TabsTrigger value="announcements" className="text-xs sm:text-sm py-2 sm:py-2.5">
              Announcements
            </TabsTrigger>
          </TabsList>

          <TabsContent value="teams" className="pt-2">
            {teams.length === 0 ? (
              <div className="col-span-full w-full">
                <EmptyState
                  icon={Users}
                  title="No Teams Found"
                  description="This club does not have any teams yet."
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {teams.map((team) => (
                  <Card key={team.id} className="border-border/70 hover:border-primary/40 transition-colors">
                    <CardContent className="p-4">
                      <p className="font-semibold text-foreground">{team.name}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        {team.description || "No description provided."}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="members" className="pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {clubMembers.length === 0 ? (
                <div className="col-span-full w-full">
                  <EmptyState
                    icon={User}
                    title="No Members Found"
                    description="This club does not have any members yet."
                  />
                </div>
              ) : (
                clubMembers.map((m) => (
                  <div
                    key={m.studentId || m.id}
                    className="flex items-center gap-3 p-3 bg-muted/60 rounded-xl border border-border/50"
                  >
                    <Avatar className="w-10 h-10">
                      {m.image && <AvatarImage src={m.image} alt={m.studentName || m.name} />}
                      <AvatarFallback>{(m.studentName || m.name || "M")[0]}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">{m.studentName || m.name}</p>
                      <p className="text-xs text-muted-foreground">{m.role || "Member"}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="events" className="pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {events.length === 0 ? (
                <div className="col-span-full w-full">
                  <EmptyState
                    icon={CalendarSearch}
                    title="No Events Found"
                    description="This club does not have any events scheduled."
                  />
                </div>
              ) : (
                events.map((e) => (
                  <Card key={e.id} className="overflow-hidden border-border/70">
                    {e.image && (
                      <img src={e.image} alt={e.title} className="h-36 w-full object-cover" />
                    )}
                    <CardContent className="p-4 space-y-2">
                      <p className="font-semibold text-foreground line-clamp-1">{e.title}</p>
                      {e.startTime && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-primary" />
                          <span>{e.startTime.split("T")[0]} {e.startTime.split("T")[1]?.substring(0, 5)}</span>
                        </p>
                      )}
                      {e.location && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-primary" />
                          <span>{e.location}</span>
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="announcements" className="pt-2">
            {announcements.length === 0 ? (
              <EmptyState
                icon={Megaphone}
                title="No Announcements"
                description="This club does not have any announcements."
              />
            ) : (
              <div className="space-y-3">
                {announcements.map((a) => (
                  <Card key={a.id} className="border-border/70">
                    <CardContent className="p-4">
                      <p className="font-semibold text-foreground">{a.title}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 leading-relaxed">{a.content}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

/* Small helper */
const Stat = ({ icon: Icon, value, label }) => (
  <Card className="border-border/70 shadow-xs">
    <CardContent className="p-4 text-center">
      <Icon className="w-5 h-5 mx-auto mb-1.5 text-primary" />
      <p className="text-xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </CardContent>
  </Card>
);

export default ClubDetailPage;
