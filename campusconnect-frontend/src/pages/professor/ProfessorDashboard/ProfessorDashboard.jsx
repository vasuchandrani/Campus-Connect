import "./ProfessorDashboard.css";
import React, { useState, useEffect } from "react";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import { Card, CardContent } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import {
  Clock,
  CheckCircle2,
  Users,
  GraduationCap,
  Megaphone,
  Calendar,
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  Building2,
  ChevronRight,
  Sparkles,
  MapPin,
  ExternalLink,
  Eye,
} from "lucide-react";
import { professorNavItems } from "../../../config/Navigation";
import { useAuth } from "../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import EmptyState from "../../../components/ui/EmptyState";
import PageSkeleton from "../../../components/ui/PageSkeleton";
import SubDashboardLoginDialog from "../../../components/dashboard/SubDashboardLoginDialog";
import { professorApi } from "../../../services/api";
import { toast } from "../../../hooks/use-toast";

const navItems = professorNavItems;

export default function ProfessorDashboard() {
  const navigate = useNavigate();
  const { routeProtection, subLoginMentor } = useAuth();

  const [user, setUser] = useState({ name: "", college: "" });
  const [stats, setStats] = useState({
    pendingReviews: 0,
    reviewed: 0,
    mentoredClubs: 0,
    myResearches: 0,
  });
  const [mentoredClubs, setMentoredClubs] = useState([]);
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Club Mentor Login Dialog State
  const [mentorLoginOpen, setMentorLoginOpen] = useState(false);
  const [selectedClubForMentor, setSelectedClubForMentor] = useState(null);
  const [mentorLoginLoading, setMentorLoginLoading] = useState(false);
  const [mentorLoginError, setMentorLoginError] = useState("");

  const handleOpenMentorDialog = (club) => {
    setSelectedClubForMentor(club);
    setMentorLoginError("");
    setMentorLoginOpen(true);
  };

  const handleMentorSubLogin = async (password) => {
    if (!selectedClubForMentor) return;
    setMentorLoginLoading(true);
    setMentorLoginError("");
    try {
      const redirectUrl = await subLoginMentor(selectedClubForMentor.id, password);
      toast({
        title: "Session Swapped",
        description: `Welcome to ${selectedClubForMentor.name} Mentor Portal!`,
      });
      setMentorLoginOpen(false);
      navigate(redirectUrl, { replace: true });
    } catch (err) {
      let msg = err.response?.data?.message || err.message || "Invalid mentor portal password. Please try again.";
      if (typeof msg === "string") {
        msg = msg.replace(/^\d{3}\s+[A-Z_]+(?:\s+["']?|:\s*["']?)/i, "").replace(/^["']|["']$/g, "").trim();
      }
      setMentorLoginError(msg || "Invalid mentor password.");
    } finally {
      setMentorLoginLoading(false);
    }
  };

  useEffect(() => {
    if (!routeProtection("PROFESSOR")) {
      navigate("/auth");
      return;
    }
    loadDashboardData();
  }, [navigate, routeProtection]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [detailsData, statsData, clubsData, announcementsData, eventsData] =
        await Promise.allSettled([
          professorApi.getDetails(),
          professorApi.getStats(),
          professorApi.getMentoredClubs(),
          professorApi.getRecentAnnouncements(),
          professorApi.getRecentEvents(),
        ]);

      if (detailsData.status === "fulfilled" && detailsData.value) {
        setUser({
          name: detailsData.value.professorName || "Professor",
          college: detailsData.value.collegeName || "Institution",
          department: detailsData.value.departmentName || detailsData.value.department || "",
        });
      }

      if (statsData.status === "fulfilled" && statsData.value) {
        setStats({
          pendingReviews: statsData.value.pendingReviews || 0,
          reviewed: statsData.value.reviewed || 0,
          mentoredClubs: statsData.value.mentoredClubs || 0,
          myResearches: statsData.value.myResearches || 0,
        });
      }

      if (clubsData.status === "fulfilled" && Array.isArray(clubsData.value)) {
        setMentoredClubs(clubsData.value);
      }

      if (
        announcementsData.status === "fulfilled" &&
        Array.isArray(announcementsData.value)
      ) {
        setRecentAnnouncements(announcementsData.value);
      }

      if (eventsData.status === "fulfilled" && Array.isArray(eventsData.value)) {
        setRecentEvents(eventsData.value);
      }
    } catch (err) {
      console.error("Error loading professor dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const statItems = [
    {
      label: "Pending Reviews",
      value: stats.pendingReviews ?? 0,
      icon: Clock,
      subtitle: "Awaiting peer review",
      route: "/campus-connect/professor/review",
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    },
    {
      label: "Evaluated Researches",
      value: stats.reviewed ?? 0,
      icon: CheckCircle2,
      subtitle: "Completed paper reviews",
      route: "/campus-connect/professor/review",
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      label: "Mentored Clubs",
      value: stats.mentoredClubs ?? 0,
      icon: Users,
      subtitle: "Official faculty mentorship",
      onClick: () => {
        const el = document.getElementById("mentored-clubs-section");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      },
      color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    },
    {
      label: "My Research Papers",
      value: stats.myResearches ?? 0,
      icon: GraduationCap,
      subtitle: "Authored publications",
      route: "/campus-connect/professor/research",
      color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    },
  ];

  if (loading) {
    return (
      <DashboardLayout navItems={navItems} title="Dashboard">
        <div className="space-y-5 sm:space-y-6 animate-pulse">
          {/* Top Banner Skeleton */}
          <div className="rounded-2xl border border-border/60 bg-card/60 p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-2 w-full sm:w-1/2">
              <div className="h-3.5 w-28 bg-muted rounded-md" />
              <div className="h-6 sm:h-7 w-52 bg-muted rounded-lg" />
              <div className="h-3.5 w-72 bg-muted/70 rounded-md" />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="h-9 w-28 bg-muted rounded-lg flex-1 sm:flex-none" />
              <div className="h-9 w-28 bg-muted rounded-lg flex-1 sm:flex-none" />
            </div>
          </div>

          {/* 4 Stat Cards Skeleton */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="p-3 sm:p-4.5 rounded-xl sm:rounded-2xl border border-border/60 bg-card/60 flex flex-col items-center justify-center text-center space-y-2 relative"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-muted mx-auto" />
                <div className="space-y-1 pt-1 flex flex-col items-center w-full">
                  <div className="h-6 sm:h-7 w-16 bg-muted rounded-md mx-auto" />
                  <div className="h-3.5 w-24 bg-muted/70 rounded mx-auto" />
                </div>
              </div>
            ))}
          </div>

          {/* Mentored Clubs Skeleton */}
          <div className="space-y-3">
            <div className="h-5 w-48 bg-muted rounded" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-36 rounded-2xl border border-border/60 bg-card/60 p-4 space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-muted" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-4 w-28 bg-muted rounded" />
                      <div className="h-3 w-16 bg-muted/70 rounded" />
                    </div>
                  </div>
                  <div className="h-3 w-full bg-muted/60 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={navItems} title="Dashboard">
      <div className="space-y-5 sm:space-y-6">
        {/* Welcome / Overview Header Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-card via-card/90 to-primary/5 p-4 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="text-[10px] sm:text-[11px] font-semibold border-primary/20 bg-primary/10 text-primary uppercase tracking-wider"
                >
                  Faculty Portal
                </Badge>
                <span className="text-[11px] sm:text-xs text-muted-foreground">
                  • Academic Active
                </span>
              </div>
              <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-foreground">
                Welcome back, Prof. {user.name || "Faculty"}!
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground leading-relaxed">
                <span className="inline-flex items-center gap-1.5 font-medium text-foreground/80">
                  <Building2 className="w-3.5 h-3.5 text-primary" />
                  {user.college || "University Faculty"}
                </span>
                {user.department && (
                  <>
                    <span className="hidden sm:inline">•</span>
                    <Badge
                      variant="secondary"
                      className="text-[10px] sm:text-[11px] font-medium bg-secondary/80 text-secondary-foreground"
                    >
                      {user.department}
                    </Badge>
                  </>
                )}
                <span className="hidden sm:inline">•</span>
                <span>Academic Session 2026-27</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-0.5 sm:pt-0 shrink-0 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8 sm:h-9 px-3 flex-1 sm:flex-none border-border/80 hover:bg-muted/60 font-medium"
                onClick={() => navigate("/campus-connect/professor/research")}
              >
                <span>Submit Research</span>
                <GraduationCap className="w-3.5 h-3.5 ml-1.5" />
              </Button>
              <Button
                size="sm"
                className="text-xs h-8 sm:h-9 px-3.5 flex-1 sm:flex-none font-medium shadow-xs"
                onClick={() => navigate("/campus-connect/professor/review")}
              >
                <span>Evaluate Papers</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* 4 Core Stat Cards - Exact CollegeAdmin / Student Match */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 w-full">
          {statItems.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card
                key={idx}
                className="border-border/70 bg-card/80 backdrop-blur-xs hover:border-primary/40 hover:shadow-xs active:scale-[0.98] transition-all cursor-pointer group rounded-xl sm:rounded-2xl w-full min-w-0 overflow-hidden relative"
                onClick={() => {
                  if (stat.onClick) stat.onClick();
                  else if (stat.route) navigate(stat.route);
                }}
              >
                <CardContent className="p-3 sm:p-4.5 flex flex-col items-center justify-center text-center h-full min-w-0">
                  <ArrowUpRight className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-foreground transition-colors shrink-0" />
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 border ${stat.color} transition-transform group-hover:scale-105 mb-1 sm:mb-1.5 mx-auto`}
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>

                  <div className="w-full min-w-0 text-center">
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground truncate">
                      {stat.value.toLocaleString()}
                    </p>
                    <p className="text-xs sm:text-sm font-semibold text-foreground/80 mt-0.5 leading-snug truncate">
                      {stat.label}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Position of Responsibility (Mentored Clubs) */}
        <div id="mentored-clubs-section" className="space-y-3 sm:space-y-4 pt-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
                  Position of Responsibility
                </h2>
                <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20">
                  Faculty Mentorship
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Clubs and student organizations operating under your official faculty mentorship
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/campus-connect/professor/clubs")}
              className="text-xs text-muted-foreground hover:text-foreground self-start sm:self-auto h-8 px-2.5"
            >
              Browse All Clubs
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>

          {mentoredClubs.length === 0 ? (
            <EmptyState
              icon={<ShieldCheck className="w-8 h-8 text-muted-foreground" />}
              title="No Mentored Clubs Assigned"
              desc="You are currently not assigned as a faculty mentor for any campus clubs. Once the college administration designates you as a mentor, they will appear here with dedicated management controls."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {mentoredClubs.map((club) => (
                <Card
                  key={club.id}
                  className="border-border/70 bg-card/70 backdrop-blur-xs overflow-hidden hover:border-border hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between group rounded-xl sm:rounded-2xl"
                  onClick={() => handleOpenMentorDialog(club)}
                >
                  <div>
                    {/* Logo / Banner */}
                    <div className="relative h-36 sm:h-40 bg-muted overflow-hidden">
                      <img
                        src={
                          club.logoUrl ||
                          "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=600&auto=format&fit=crop&q=80"
                        }
                        alt={club.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-emerald-500/90 text-white border-0 text-[10px] sm:text-[11px] font-semibold flex items-center gap-1 shadow-xs backdrop-blur-xs">
                          Mentored by You
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h3 className="font-bold text-sm sm:text-base text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                          {club.name}
                        </h3>
                        <Badge
                          variant="outline"
                          className="text-[11px] shrink-0 flex items-center gap-1 bg-muted/40"
                        >
                          <Users className="w-3 h-3" />
                          {club.members ?? club.memberCount ?? 0}
                        </Badge>
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {club.description || "Active student organization fostering leadership, innovation, and campus community engagement."}
                      </p>

                      <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                        <span className="font-medium text-foreground truncate max-w-[140px] sm:max-w-none text-[11px]">
                          Lead: {club.adminName || "Student Admin"}
                        </span>
                        {club.website && (
                          <a
                            href={club.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-primary hover:underline inline-flex items-center gap-1 text-[11px] shrink-0"
                          >
                            Website
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </div>

                  <div className="p-4 sm:p-5 pt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs h-8 sm:h-9 border-border/80 hover:bg-muted/60"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenMentorDialog(club);
                      }}
                    >
                      <Eye className="w-3.5 h-3.5 mr-1.5" />
                      Open Mentor Dashboard
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Recent Feeds: Announcements & Events */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 pt-1">
          {/* Announcements Section */}
          <div className="space-y-3 sm:space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                <h2 className="text-base sm:text-lg font-bold text-foreground">
                  Club Announcements Feed
                </h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/campus-connect/professor/announcements")}
                className="text-xs text-muted-foreground hover:text-foreground h-8 px-2"
              >
                View All
                <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </Button>
            </div>

            {recentAnnouncements.length === 0 ? (
              <EmptyState
                icon={<Megaphone className="w-8 h-8 text-muted-foreground" />}
                title="No Recent Announcements"
                desc="No club announcements have been published recently."
              />
            ) : (
              <div className="space-y-2.5">
                {recentAnnouncements.slice(0, 4).map((ann, idx) => (
                  <Card
                    key={ann.id || idx}
                    className="border-border/80 hover:border-primary/30 transition-colors"
                  >
                    <CardContent className="p-3.5 sm:p-4 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <Badge
                          variant="outline"
                          className="text-[10px] font-semibold bg-primary/5 text-primary border-primary/20"
                        >
                          {ann.clubName || "Campus Club"}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground">
                          {ann.createdAt
                            ? new Date(ann.createdAt).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                              })
                            : "Recent"}
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-foreground line-clamp-1">
                        {ann.title}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {ann.message || ann.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Events Section */}
          <div className="space-y-3 sm:space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                <h2 className="text-base sm:text-lg font-bold text-foreground">
                  Upcoming Club Events Pipeline
                </h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/campus-connect/professor/events")}
                className="text-xs text-muted-foreground hover:text-foreground h-8 px-2"
              >
                View All
                <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </Button>
            </div>

            {recentEvents.length === 0 ? (
              <EmptyState
                icon={<Calendar className="w-8 h-8 text-muted-foreground" />}
                title="No Upcoming Events"
                desc="No upcoming events scheduled by campus clubs currently."
              />
            ) : (
              <div className="space-y-2.5">
                {recentEvents.slice(0, 4).map((evt, idx) => (
                  <Card
                    key={evt.id || idx}
                    className="border-border/80 hover:border-primary/30 transition-colors"
                  >
                    <CardContent className="p-3.5 sm:p-4 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <Badge
                          variant="outline"
                          className="text-[10px] font-semibold bg-primary/5 text-primary border-primary/20"
                        >
                          {evt.clubName || "Campus Event"}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="text-[10px] font-medium"
                        >
                          {evt.isGlobal ? "Global" : "Campus"}
                        </Badge>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-foreground line-clamp-1">
                        {evt.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                        {evt.eventDate && (
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-primary" />
                            {new Date(evt.eventDate).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        )}
                        {evt.venue && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-primary" />
                            {evt.venue}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Club Mentor Login Dialog */}
      <SubDashboardLoginDialog
        open={mentorLoginOpen}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedClubForMentor(null);
            setMentorLoginError("");
          }
          setMentorLoginOpen(open);
        }}
        title={`${selectedClubForMentor?.name || "Club"} Mentor Login`}
        description="Enter the mentor portal password generated for this club to proceed to the Club Mentor Dashboard."
        icon={ShieldCheck}
        onSubmit={handleMentorSubLogin}
        loading={mentorLoginLoading}
        error={mentorLoginError}
      />
    </DashboardLayout>
  );
}
