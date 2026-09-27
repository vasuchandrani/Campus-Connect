import "./ProfessorClubsPage.css";
import React, { useState, useEffect } from "react";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import { Card, CardContent } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Input } from "../../../components/ui/Input";
import {
  Users,
  Search,
  ExternalLink,
  ShieldCheck,
  Eye,
  ArrowUpRight,
  Layers,
  Calendar,
  Sparkles,
  Building2,
  X,
  GraduationCap,
  UserCheck,
  Heart,
  HeartOff,
} from "lucide-react";
import { toast } from "../../../hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../../components/ui/Dialog";
import { professorNavItems } from "../../../config/Navigation";
import { useAuth } from "../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import EmptyState from "../../../components/ui/EmptyState";
import PageSkeleton from "../../../components/ui/PageSkeleton";
import SubDashboardLoginDialog from "../../../components/dashboard/SubDashboardLoginDialog";
import { professorApi } from "../../../services/api";

const navItems = professorNavItems;

export default function ProfessorClubsPage() {
  const navigate = useNavigate();
  const { routeProtection, subLoginMentor } = useAuth();

  const [clubs, setClubs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Mentor Portal Authentication Dialog State
  const [mentorLoginOpen, setMentorLoginOpen] = useState(false);
  const [mentorTargetClub, setMentorTargetClub] = useState(null);
  const [mentorLoading, setMentorLoading] = useState(false);
  const [mentorError, setMentorError] = useState("");

  const handleOpenMentorModal = (club) => {
    setMentorTargetClub(club);
    setMentorError("");
    setMentorLoginOpen(true);
  };

  const handleMentorLoginSubmit = async (password) => {
    if (!mentorTargetClub) return;
    setMentorLoading(true);
    setMentorError("");
    try {
      const redirectUrl = await subLoginMentor(mentorTargetClub.id, password);
      toast({
        title: "Session Swapped",
        description: `Welcome to ${mentorTargetClub.name} Mentor Portal!`,
      });
      setMentorLoginOpen(false);
      navigate(redirectUrl, { replace: true });
    } catch (err) {
      let msg = err.response?.data?.message || err.message || "Invalid mentor portal password. Please try again.";
      if (typeof msg === "string") {
        msg = msg.replace(/^\d{3}\s+[A-Z_]+(?:\s+["']?|:\s*["']?)/i, "").replace(/^["']|["']$/g, "").trim();
      }
      setMentorError(msg || "Invalid mentor password.");
    } finally {
      setMentorLoading(false);
    }
  };

  // Club Details Modal
  const [selectedClub, setSelectedClub] = useState(null);
  const [clubDetails, setClubDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    if (!routeProtection("PROFESSOR")) {
      navigate("/auth");
      return;
    }
    fetchClubs();
  }, [navigate, routeProtection]);

  const fetchClubs = async () => {
    setLoading(true);
    try {
      const data = await professorApi.getActiveClubs();
      if (Array.isArray(data)) {
        setClubs(data);
      }
    } catch (err) {
      console.error("Error fetching active clubs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetails = async (club) => {
    setSelectedClub(club);
    setDetailsLoading(true);
    try {
      const data = await professorApi.getClubDetail(club.id);
      setClubDetails(data);
    } catch (err) {
      console.error("Error fetching club details:", err);
      setClubDetails(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleToggleFollow = async (clubId, currentFollowState) => {
    if (followLoading) return;
    setFollowLoading(true);
    const nextState = !currentFollowState;
    try {
      const res = await professorApi.changeFollow(clubId, nextState);
      toast({
        title: "Success",
        description: res?.message || (nextState ? "Club followed" : "Club unfollowed"),
      });

      if (clubDetails && selectedClub?.id === clubId) {
        setClubDetails((prev) => ({
          ...prev,
          isFollowed: nextState,
          followerCount: nextState
            ? (prev.followerCount || 0) + 1
            : Math.max(0, (prev.followerCount || 0) - 1),
        }));
      }

      setClubs((prev) =>
        prev.map((c) =>
          c.id === clubId
            ? {
                ...c,
                isFollowed: nextState,
                followerCount: nextState
                  ? (c.followerCount || 0) + 1
                  : Math.max(0, (c.followerCount || 0) - 1),
              }
            : c
        )
      );
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "Failed to update follow status",
        variant: "destructive",
      });
    } finally {
      setFollowLoading(false);
    }
  };

  const filteredClubs = clubs.filter((c) => {
    const term = searchTerm.toLowerCase();
    return (
      (c.name && c.name.toLowerCase().includes(term)) ||
      (c.tagline1 && c.tagline1.toLowerCase().includes(term)) ||
      (c.mentorName && c.mentorName.toLowerCase().includes(term)) ||
      (c.adminName && c.adminName.toLowerCase().includes(term))
    );
  });

  if (loading) {
    return (
      <DashboardLayout navItems={navItems} title="Clubs">
        <PageSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={navItems} title="Clubs">
      <div className="space-y-5 sm:space-y-6 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" />
              <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                Campus Clubs Directory
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Explore and oversee all officially active student clubs and organizations in your college
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search clubs, mentors..."
              className="pl-9 h-9 text-xs sm:text-sm"
            />
          </div>
        </div>

        {/* Clubs Grid */}
        {filteredClubs.length === 0 ? (
          <Card className="border-dashed border-border/80">
            <CardContent className="py-12">
              <EmptyState
                icon={Users}
                title={searchTerm ? "No Matching Clubs" : "No Active Clubs Found"}
                description={
                  searchTerm
                    ? `No active clubs matching "${searchTerm}". Try a different keyword.`
                    : "No active clubs are currently registered in the college."
                }
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
            {filteredClubs.map((club) => (
              <Card
                key={club.id}
                className="border-border/70 bg-card/80 backdrop-blur-xs overflow-hidden hover:border-primary/40 hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col justify-between group rounded-2xl relative min-w-0"
                onClick={() => handleOpenDetails(club)}
              >
                <div>
                  {/* Full Top Image Banner */}
                  <div className="relative h-40 sm:h-44 bg-muted overflow-hidden">
                    <img
                      src={
                        club.logoUrl ||
                        "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=600&auto=format&fit=crop&q=80"
                      }
                      alt={club.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />

                    {/* Top Badges */}
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10 flex-wrap justify-end">
                      {club.isMentor && (
                        <Badge className="bg-emerald-500/90 text-white border-0 text-[10px] sm:text-[11px] font-semibold flex items-center gap-1 shadow-xs backdrop-blur-xs px-2 py-0.5">
                          <ShieldCheck className="w-3 h-3" />
                          You Mentor
                        </Badge>
                      )}
                      {(club.tagline1 || club.tagline2 || club.category) && (
                        <Badge className="bg-background/85 text-foreground border-border/60 text-[10px] sm:text-[11px] font-semibold shadow-xs backdrop-blur-xs px-2 py-0.5 max-w-[140px] truncate">
                          {club.tagline1 || club.tagline2 || club.category}
                        </Badge>
                      )}
                    </div>

                    {/* Member Count Pill on bottom-right of image */}
                    <div className="absolute bottom-2.5 right-2.5 z-10">
                      <Badge
                        variant="secondary"
                        className="text-[11px] font-semibold flex items-center gap-1 py-0.5 px-2.5 bg-background/85 text-foreground backdrop-blur-xs border border-border/50 shadow-xs"
                      >
                        <Users className="w-3.5 h-3.5 text-primary" />
                        <span>{club.members ?? club.memberCount ?? 0}</span>
                      </Badge>
                    </div>
                  </div>

                  {/* Card Content */}
                  <CardContent className="p-4 sm:p-5 space-y-2">
                    <div className="min-w-0">
                      <h3 className="font-bold text-base sm:text-lg text-foreground truncate group-hover:text-primary transition-colors leading-snug">
                        {club.name}
                      </h3>
                      {(club.tagline2 || club.category) && club.tagline1 && (
                        <p className="text-[11px] font-medium text-primary/80 truncate">
                          {club.tagline2 || club.category}
                        </p>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed min-h-[2.25rem]">
                      {club.description || "Active student organization at campus."}
                    </p>

                    {/* Leadership Metadata */}
                    <div className="pt-2.5 border-t border-border/60 space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center justify-between gap-1 text-[11px]">
                        <span className="flex items-center gap-1 text-muted-foreground shrink-0">
                          <GraduationCap className="w-3 h-3 text-primary" />
                          Faculty Mentor:
                        </span>
                        <span className="font-medium text-foreground truncate max-w-[140px]">
                          {club.isMentor ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">You (Faculty Mentor)</span>
                          ) : (
                            club.mentorName || "Assigned"
                          )}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-1 text-[11px]">
                        <span className="flex items-center gap-1 text-muted-foreground shrink-0">
                          <UserCheck className="w-3 h-3 text-primary" />
                          Student Lead:
                        </span>
                        <span className="font-medium text-foreground truncate max-w-[140px]">
                          {club.adminName || "Student Admin"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </div>

                {/* Actions Footer */}
                <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-1 flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDetails(club);
                    }}
                    className="flex-1 text-xs h-8 sm:h-9 border-border/80 hover:bg-muted/60 justify-center shadow-xs"
                  >
                    <Eye className="w-3.5 h-3.5 mr-1.5" />
                    <span>View Details</span>
                  </Button>

                  <Button
                    size="sm"
                    variant={club.isFollowed ? "secondary" : "outline"}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFollow(club.id, club.isFollowed);
                    }}
                    disabled={followLoading}
                    className="text-xs h-8 sm:h-9 shadow-xs px-2.5"
                    title={club.isFollowed ? "Unfollow Club" : "Follow Club"}
                  >
                    {club.isFollowed ? (
                      <HeartOff className="w-3.5 h-3.5 text-rose-500" />
                    ) : (
                      <Heart className="w-3.5 h-3.5 text-primary" />
                    )}
                  </Button>

                  {club.isMentor && (
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenMentorModal(club);
                      }}
                      className="flex-1 text-xs h-8 sm:h-9 shadow-xs justify-center gap-1 font-semibold"
                    >
                      <span>Mentor</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Club Details Modal */}
        <Dialog
          open={!!selectedClub}
          onOpenChange={(open) => !open && setSelectedClub(null)}
        >
          <DialogContent className="w-[95vw] sm:max-w-xl max-h-[85vh] overflow-y-auto rounded-2xl p-4 sm:p-6">
            <DialogHeader>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 overflow-hidden">
                    {selectedClub?.logoUrl ? (
                      <img
                        src={selectedClub.logoUrl}
                        alt={selectedClub.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Users className="w-6 h-6 text-primary" />
                    )}
                  </div>
                  <div>
                    <DialogTitle className="text-lg sm:text-xl font-bold text-foreground">
                      {selectedClub?.name}
                    </DialogTitle>
                    <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
                      {selectedClub?.tagline1 || selectedClub?.tagline2 || "Campus Student Organization"}
                    </DialogDescription>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant={clubDetails?.isFollowed ? "secondary" : "default"}
                  onClick={() => handleToggleFollow(selectedClub.id, clubDetails?.isFollowed)}
                  disabled={followLoading}
                  className="font-semibold text-xs h-8 shrink-0 self-start shadow-xs"
                >
                  {clubDetails?.isFollowed ? (
                    <>
                      <HeartOff className="w-3.5 h-3.5 mr-1.5 text-rose-500" />
                      Unfollow
                    </>
                  ) : (
                    <>
                      <Heart className="w-3.5 h-3.5 mr-1.5 fill-current" />
                      Follow
                    </>
                  )}
                </Button>
              </div>
            </DialogHeader>

            {detailsLoading ? (
              <div className="py-8 space-y-3">
                <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                <div className="h-16 bg-muted animate-pulse rounded" />
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                {/* Description */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    About the Club
                  </h4>
                  <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
                    {clubDetails?.description || selectedClub?.description || "No description provided."}
                  </p>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-2.5 rounded-xl bg-accent/40 border border-border/60 text-center">
                    <div className="text-lg font-bold text-foreground">
                      {clubDetails?.memberCount || 0}
                    </div>
                    <div className="text-[11px] text-muted-foreground font-medium">
                      Members
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-accent/40 border border-border/60 text-center">
                    <div className="text-lg font-bold text-foreground">
                      {clubDetails?.teamCount || 0}
                    </div>
                    <div className="text-[11px] text-muted-foreground font-medium">
                      Teams
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-accent/40 border border-border/60 text-center">
                    <div className="text-lg font-bold text-foreground">
                      {clubDetails?.eventCount || 0}
                    </div>
                    <div className="text-[11px] text-muted-foreground font-medium">
                      Events
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-accent/40 border border-border/60 text-center">
                    <div className="text-lg font-bold text-foreground">
                      {clubDetails?.followerCount || 0}
                    </div>
                    <div className="text-[11px] text-muted-foreground font-medium">
                      Followers
                    </div>
                  </div>
                </div>

                {/* Leadership Info */}
                <div className="p-3 rounded-xl bg-accent/30 border border-border/60 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Official Faculty Mentor:</span>
                    <span className="font-semibold text-foreground">
                      {selectedClub?.mentorName || (selectedClub?.isMentor ? "You" : "Assigned Faculty")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Club Administrator (Lead):</span>
                    <span className="font-semibold text-foreground">
                      {clubDetails?.clubAdmin?.name || selectedClub?.adminName || "Student Admin"}
                    </span>
                  </div>
                  {selectedClub?.website && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Official Website:</span>
                      <a
                        href={selectedClub.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline font-medium inline-flex items-center gap-1"
                      >
                        {selectedClub.website}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const id = selectedClub.id;
                      setSelectedClub(null);
                      navigate(`/campus-connect/professor/clubs/${id}`);
                    }}
                    className="flex-1 text-xs font-semibold h-9 shadow-xs"
                  >
                    View Full Club Page
                    <ArrowUpRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>

                  {selectedClub?.isMentor && (
                    <Button
                      onClick={() => {
                        const club = selectedClub;
                        setSelectedClub(null);
                        handleOpenMentorModal(club);
                      }}
                      className="flex-1 text-xs font-semibold h-9 shadow-xs"
                    >
                      Mentor Dashboard
                      <ArrowUpRight className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Club Mentor Login Dialog */}
        <SubDashboardLoginDialog
          open={mentorLoginOpen}
          onOpenChange={(open) => {
            if (!open) {
              setMentorTargetClub(null);
              setMentorError("");
            }
            setMentorLoginOpen(open);
          }}
          title={`${mentorTargetClub?.name || "Club"} Mentor Login`}
          description="Enter the mentor portal password generated for this club to proceed to the Club Mentor Dashboard."
          icon={ShieldCheck}
          onSubmit={handleMentorLoginSubmit}
          loading={mentorLoading}
          error={mentorError}
        />
      </div>
    </DashboardLayout>
  );
}
