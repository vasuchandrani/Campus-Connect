import "./ClubDetailAdminPage.css";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import { Card, CardContent } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/Avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/Tabs";
import {
  Users,
  Calendar,
  Megaphone,
  ArrowLeft,
  Crown,
  UsersRound,
  Clock,
  MapPin,
  Building2,
  Sparkles,
  Heart,
  HeartOff,
} from "lucide-react";
import { toast } from "../../../hooks/use-toast";
import { collegeAdminNavItems } from "../../../config/Navigation";
import { useAuth } from "../../../contexts/AuthContext";
import EmptyState from "../../../components/ui/EmptyState";
import { collegeAdminApi } from "../../../services/api";

export default function ClubDetailAdminPage() {
  const { clubId } = useParams();
  const navigate = useNavigate();

  const [club, setClub] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [teams, setTeams] = useState([]);
  const [clubMembers, setClubMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowed, setIsFollowed] = useState(false);
  const [changeFollow, setChangeFollow] = useState(false);

  const { routeProtection } = useAuth();

  useEffect(() => {
    if (!routeProtection("COLLEGE_ADMIN")) {
      navigate("/auth");
    }
  }, [navigate, routeProtection]);

  const fetchClubDetails = async () => {
    setLoading(true);
    try {
      const data = await collegeAdminApi.getClubDetails(clubId);
      setClub({
        id: data.id || clubId,
        name: data.clubName || data.name,
        description: data.description,
        membersCount: data.memberCount,
        teamCount: data.teamCount,
        eventCount: data.eventCount,
        logoUrl: data.logoUrl,
        followerCount: data.followerCount,
        clubImage: data.imgUrl || data.logoUrl,
        adminId: data.clubAdmin?.id,
        adminName: data.clubAdmin?.name,
        adminImage: data.clubAdmin?.image,
      });
      setIsFollowed(Boolean(data.isFollowed));
      setAnnouncements(data.announcements || []);
      setEvents(data.events || []);
      setTeams(data.teams || []);
      setClubMembers(data.members || []);
    } catch (err) {
      toast({
        title: "Failed to Load Club",
        description: err.message || "Failed to load club details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubDetails();
  }, [clubId]);

  const toggleFollow = async () => {
    if (changeFollow) return;
    setChangeFollow(true);
    const newFollowState = !isFollowed;

    try {
      const data = await collegeAdminApi.changeFollow(clubId, newFollowState);
      toast({
        title: "Success",
        description: data?.message || (newFollowState ? "Club followed" : "Club unfollowed"),
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

  // Tailored Skeleton for Club Details
  if (loading) {
    return (
      <DashboardLayout navItems={collegeAdminNavItems} title="Club Details">
        <div className="space-y-6 animate-pulse">
          <div className="h-8 w-24 bg-muted rounded-lg" />
          <div className="h-48 sm:h-56 w-full bg-muted rounded-2xl" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 rounded-2xl border border-border/60 bg-card/60 p-4" />
            ))}
          </div>
          <div className="w-full grid grid-cols-2 sm:inline-flex sm:w-auto gap-1 p-1 bg-muted/30 border border-border/40 rounded-xl">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-8 sm:w-28 bg-muted rounded-lg" />
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-36 rounded-2xl border border-border/60 bg-card/60 p-4" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!club) {
    return (
      <DashboardLayout navItems={collegeAdminNavItems} title="Club Not Found">
        <div className="text-center py-16 space-y-4">
          <EmptyState
            icon={<Building2 className="w-10 h-10 text-muted-foreground" />}
            title="Club Not Found"
            desc="The requested student club does not exist or has been removed."
          />
          <Button
            size="sm"
            onClick={() => navigate("/campus-connect/college-admin/clubs")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Return to Clubs
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={collegeAdminNavItems} title={club.name}>
      <div className="space-y-6">
        {/* Navigation Back Link */}
        <Button
          variant="ghost"
          size="sm"
          className="text-xs h-8 text-muted-foreground hover:text-foreground -ml-2"
          onClick={() => navigate("/campus-connect/college-admin/clubs")}
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
          Back to Clubs
        </Button>

        {/* Hero Header Banner */}
        <div className="relative rounded-2xl overflow-hidden border border-border/70 bg-muted">
          <div className="relative h-44 sm:h-56 w-full overflow-hidden">
            <img
              src={
                club.logoUrl ||
                "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=1200&auto=format&fit=crop&q=80"
              }
              alt={club.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div className="space-y-1">
                <Badge className="text-[10px] bg-primary text-primary-foreground border-none">
                  Verified Campus Club
                </Badge>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight">
                  {club.name}
                </h1>
                <p className="text-xs sm:text-sm text-white/80 max-w-2xl line-clamp-2 leading-relaxed">
                  {club.description || "Active student organization."}
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
        </div>

        {/* 5 Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
          <Card className="border-border/70 bg-card/70 backdrop-blur-xs">
            <CardContent className="p-3.5 sm:p-4 text-center space-y-1">
              <Users className="w-4 h-4 mx-auto text-primary" />
              <p className="text-xl sm:text-2xl font-bold text-foreground">
                {club.membersCount ?? 0}
              </p>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Members
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/70 bg-card/70 backdrop-blur-xs">
            <CardContent className="p-3.5 sm:p-4 text-center space-y-1">
              <UsersRound className="w-4 h-4 mx-auto text-blue-500" />
              <p className="text-xl sm:text-2xl font-bold text-foreground">
                {club.teamCount ?? 0}
              </p>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Teams
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/70 bg-card/70 backdrop-blur-xs">
            <CardContent className="p-3.5 sm:p-4 text-center space-y-1">
              <Calendar className="w-4 h-4 mx-auto text-emerald-500" />
              <p className="text-xl sm:text-2xl font-bold text-foreground">
                {club.eventCount ?? 0}
              </p>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Events
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/70 bg-card/70 backdrop-blur-xs">
            <CardContent className="p-3.5 sm:p-4 text-center space-y-1">
              <Megaphone className="w-4 h-4 mx-auto text-amber-500" />
              <p className="text-xl sm:text-2xl font-bold text-foreground">
                {announcements.length}
              </p>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Posts
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/70 bg-card/70 backdrop-blur-xs col-span-2 sm:col-span-1">
            <CardContent className="p-3.5 sm:p-4 text-center space-y-1">
              <Heart className="w-4 h-4 mx-auto text-rose-500" />
              <p className="text-xl sm:text-2xl font-bold text-foreground">
                {club.followerCount ?? 0}
              </p>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Followers
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Club Admin Profile Row */}
        <Card className="border-border/70 bg-card/70 backdrop-blur-xs">
          <CardContent className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 border border-primary/30">
                {club.adminImage && <AvatarImage src={club.adminImage} />}
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                  {club.adminName ? club.adminName[0] : "A"}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs sm:text-sm font-bold text-foreground">
                    {club.adminName || "Student Club Admin"}
                  </p>
                  <Badge
                    variant="outline"
                    className="text-[10px] bg-primary/5 text-primary border-primary/20 py-0"
                  >
                    <Crown className="w-2.5 h-2.5 mr-1" />
                    Club Head
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Responsible for club activities & student coordination
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sub-Tabs: Teams, Members, Events, Announcements */}
        <Tabs defaultValue="teams" className="space-y-4">
          <div className="w-full">
            <TabsList className="w-full grid grid-cols-2 sm:inline-flex sm:w-auto p-1 bg-muted/60 dark:bg-muted/40 border border-border/60 rounded-xl gap-1.5 sm:gap-1">
              <TabsTrigger
                value="teams"
                className="text-xs sm:text-sm py-2 sm:py-1.5 px-3 rounded-lg justify-center font-medium w-full"
              >
                Teams
              </TabsTrigger>
              <TabsTrigger
                value="members"
                className="text-xs sm:text-sm py-2 sm:py-1.5 px-3 rounded-lg justify-center font-medium w-full"
              >
                Members
              </TabsTrigger>
              <TabsTrigger
                value="events"
                className="text-xs sm:text-sm py-2 sm:py-1.5 px-3 rounded-lg justify-center font-medium w-full"
              >
                Events
              </TabsTrigger>
              <TabsTrigger
                value="announcements"
                className="text-xs sm:text-sm py-2 sm:py-1.5 px-3 rounded-lg justify-center font-medium w-full"
              >
                Announcements
              </TabsTrigger>
            </TabsList>
          </div>

          {/* TEAMS */}
          <TabsContent value="teams" className="space-y-3">
            {teams.length === 0 ? (
              <Card className="border-border/70 bg-card/60">
                <CardContent className="p-8">
                  <EmptyState
                    icon={<UsersRound className="w-8 h-8 text-muted-foreground" />}
                    title="No Teams Established"
                    desc="This club has not formed any specific working committees or sub-teams yet."
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {teams.map((team) => (
                  <Card
                    key={team.id}
                    className="border-border/70 bg-card/70 backdrop-blur-xs hover:border-border transition-all"
                  >
                    <CardContent className="p-4 space-y-1.5">
                      <p className="font-bold text-xs sm:text-sm text-foreground">
                        {team.name}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {team.description || "General team operations."}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* MEMBERS */}
          <TabsContent value="members" className="space-y-3">
            {clubMembers.length === 0 ? (
              <Card className="border-border/70 bg-card/60">
                <CardContent className="p-8">
                  <EmptyState
                    icon={<Users className="w-8 h-8 text-muted-foreground" />}
                    title="No Member Records"
                    desc="No registered student members found in this club roster."
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {clubMembers.map((m) => (
                  <Card
                    key={m.studentId || m.id}
                    className="border-border/70 bg-card/70 backdrop-blur-xs"
                  >
                    <CardContent className="p-3.5 flex items-center gap-3">
                      <Avatar className="w-9 h-9 border border-border/60">
                        {m.image && <AvatarImage src={m.image} />}
                        <AvatarFallback className="bg-muted text-xs font-semibold">
                          {m.studentName ? m.studentName[0] : "S"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-foreground truncate">
                          {m.studentName}
                        </p>
                        <p className="text-[11px] text-muted-foreground capitalize truncate">
                          {m.role || "Member"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* EVENTS */}
          <TabsContent value="events" className="space-y-3">
            {events.length === 0 ? (
              <Card className="border-border/70 bg-card/60">
                <CardContent className="p-8">
                  <EmptyState
                    icon={<Calendar className="w-8 h-8 text-muted-foreground" />}
                    title="No Events Scheduled"
                    desc="This club has not scheduled any campus events yet."
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {events.map((e) => (
                  <Card
                    key={e.id}
                    className="border-border/70 bg-card/70 backdrop-blur-xs overflow-hidden hover:border-border hover:shadow-xs transition-all cursor-pointer"
                    onClick={() =>
                      navigate(`/campus-connect/college-admin/events/${e.id}`)
                    }
                  >
                    {e.image && (
                      <div className="h-32 w-full overflow-hidden bg-muted">
                        <img
                          src={e.image}
                          alt={e.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardContent className="p-4 space-y-2">
                      <p className="font-bold text-xs sm:text-sm text-foreground line-clamp-1">
                        {e.title}
                      </p>
                      {e.startTime && (
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                          <Clock className="w-3 h-3" />
                          <span>{e.startTime.split("T")[0]}</span>
                        </p>
                      )}
                      {e.location && (
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 truncate">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="truncate">{e.location}</span>
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ANNOUNCEMENTS */}
          <TabsContent value="announcements" className="space-y-3">
            {announcements.length === 0 ? (
              <Card className="border-border/70 bg-card/60">
                <CardContent className="p-8">
                  <EmptyState
                    icon={<Megaphone className="w-8 h-8 text-muted-foreground" />}
                    title="No Announcements"
                    desc="This club has not posted any announcements yet."
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {announcements.map((a) => (
                  <Card
                    key={a.id}
                    className="border-border/70 bg-card/70 backdrop-blur-xs"
                  >
                    <CardContent className="p-4 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-bold text-xs sm:text-sm text-foreground">
                          {a.title}
                        </p>
                        {a.priority === "high" && (
                          <Badge variant="destructive" className="text-[10px] py-0">
                            High Priority
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {a.content}
                      </p>
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
}
