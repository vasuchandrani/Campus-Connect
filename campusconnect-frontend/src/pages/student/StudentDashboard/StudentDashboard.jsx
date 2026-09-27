import "./StudentDashboard.css";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import { Card, CardContent } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Input } from "../../../components/ui/Input";
import { Textarea } from "../../../components/ui/Textarea";
import { Label } from "../../../components/ui/Label";
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/Avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../../components/ui/Dialog";
import {
  Calendar,
  Building2,
  BookOpen,
  Users,
  ArrowUpRight,
  ArrowRight,
  Shield,
  Plus,
  ChevronRight,
  Clock,
  MapPin,
  Sparkles,
  Newspaper,
  Crown,
  User,
  PenTool,
  Loader2,
  Eye,
} from "lucide-react";
import { studentNavItems } from "../../../config/Navigation";
import { useAuth } from "../../../contexts/AuthContext";
import SubDashboardLoginDialog from "../../../components/dashboard/SubDashboardLoginDialog";
import { studentApi, eventApi } from "../../../services/api";
import { toast } from "../../../hooks/use-toast";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user, routeProtection, subLoginJournalist, subLoginClub } = useAuth();
  const isSwitchingSessionRef = useRef(false);

  // Authentication check
  useEffect(() => {
    if (isSwitchingSessionRef.current) return;
    const currentRole = localStorage.getItem("role");
    if (currentRole === "JOURNALIST") {
      navigate("/campus-connect/journalist/dashboard", { replace: true });
      return;
    }
    if (!routeProtection("STUDENT")) {
      navigate("/auth");
    }
  }, [navigate, routeProtection]);

  // Page State
  const [pageLoading, setPageLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [userDepartment, setUserDepartment] = useState("");
  const [stats, setStats] = useState({
    upcomingEvents: 0,
    collegeClubs: 0,
    myResearches: 0,
    joinedClubs: 0,
  });
  const [userClubs, setUserClubs] = useState([]);
  const [isJournalist, setIsJournalist] = useState(false);
  const [topEvents, setTopEvents] = useState([]);

  // Journalist sub-login dialog
  const [journalistDialogOpen, setJournalistDialogOpen] = useState(false);
  const [journalistSubmitting, setJournalistSubmitting] = useState(false);
  const [journalistError, setJournalistError] = useState("");

  // Club sub-login dialog
  const [clubLoginDialogOpen, setClubLoginDialogOpen] = useState(false);
  const [selectedClubForLogin, setSelectedClubForLogin] = useState(null);
  const [clubSubmitting, setClubSubmitting] = useState(false);
  const [clubLoginError, setClubLoginError] = useState("");

  // Request new club dialog
  const [clubRequestOpen, setClubRequestOpen] = useState(false);
  const [clubReqName, setClubReqName] = useState("");
  const [clubReqDesc, setClubReqDesc] = useState("");
  const [submittingClubReq, setSubmittingClubReq] = useState(false);

  // Become journalist request dialog
  const [hasPendingJournalistReq, setHasPendingJournalistReq] = useState(false);
  const [journalistReqOpen, setJournalistReqOpen] = useState(false);
  const [journalistWhy, setJournalistWhy] = useState("");
  const [journalistExp, setJournalistExp] = useState("");
  const [journalistPortfolio, setJournalistPortfolio] = useState("");
  const [submittingJournalistReq, setSubmittingJournalistReq] = useState(false);

  // Event preview modal
  const [selectedEventModal, setSelectedEventModal] = useState(null);

  // Load Dashboard Data
  const loadDashboardData = useCallback(async () => {
    try {
      const [nameRes, statsRes, clubsRes, eventsRes, journalistRes, profileRes] =
        await Promise.all([
          studentApi.getName().catch(() => ""),
          studentApi.getStats().catch(() => ({})),
          studentApi.getJoinedClubs().catch(() => []),
          studentApi.getTopEvents().catch(async () => {
            try {
              const active = await eventApi.getActiveEvents();
              return Array.isArray(active) ? active : [];
            } catch {
              return [];
            }
          }),
          studentApi.getJournalistStatus().catch(() => null),
          studentApi.getProfile().catch(() => null),
        ]);

      setUserName(typeof nameRes === "string" ? nameRes : (profileRes?.fullName || ""));
      if (profileRes?.department) {
        setUserDepartment(profileRes.department);
      }
      setStats({
        upcomingEvents: Number(statsRes?.upcomingEvents || 0),
        collegeClubs: Number(statsRes?.collegeClubs || 0),
        myResearches: Number(statsRes?.myResearches || 0),
        joinedClubs: Number(statsRes?.joinedClubs || 0),
      });

      setUserClubs(
        Array.isArray(clubsRes)
          ? clubsRes.map((c) => ({
            club: c,
            role: c.role || "MEMBER",
          }))
          : []
      );

      setTopEvents(Array.isArray(eventsRes) ? eventsRes.slice(0, 5) : []);

      if (journalistRes && (journalistRes.isJournalist || journalistRes.journalist)) {
        setIsJournalist(true);
        setHasPendingJournalistReq(false);
      } else {
        setIsJournalist(false);
        setHasPendingJournalistReq(Boolean(journalistRes?.hasPendingRequest));
      }
    } catch (err) {
      console.error("Dashboard overview fetch error:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to load dashboard overview data",
        variant: "destructive",
      });
    } finally {
      setPageLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Handle Journalist Sub-Login
  const handleJournalistSubLogin = async (password) => {
    setJournalistSubmitting(true);
    setJournalistError("");
    isSwitchingSessionRef.current = true;
    try {
      const redirectUrl = await subLoginJournalist(password);
      toast({
        title: "Session Swapped",
        description: "Welcome to Journalist Workspace! Student session cleared.",
      });
      setJournalistDialogOpen(false);
      navigate(redirectUrl, { replace: true });
    } catch (err) {
      isSwitchingSessionRef.current = false;
      let msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.data?.message ||
        err.data?.error ||
        err.message ||
        "Invalid journalist password. Please try again.";
      if (typeof msg === "string") {
        msg = msg.replace(/^Something went wrong:\s*/i, "");
        msg = msg.replace(/^\d{3}\s+[A-Z_]+(?:\s+["']?|:\s*["']?)/i, "");
        msg = msg.replace(/^["']|["']$/g, "").trim();
      }
      if (!msg) msg = "Invalid journalist password. Please try again.";
      setJournalistError(msg);
    } finally {
      setJournalistSubmitting(false);
    }
  };

  // Handle Club Sub-Login
  const handleClubCardClick = (club, role) => {
    setSelectedClubForLogin({ ...club, role });
    setClubLoginError("");
    setClubLoginDialogOpen(true);
  };

  const handleClubSubLogin = async (password) => {
    if (!selectedClubForLogin) return;
    setClubSubmitting(true);
    setClubLoginError("");
    isSwitchingSessionRef.current = true;
    try {
      const redirectUrl = await subLoginClub(selectedClubForLogin.id, password);
      const isAdmin = selectedClubForLogin.role === "ADMIN";
      toast({
        title: "Session Swapped",
        description: `Welcome to ${selectedClubForLogin.name} ${isAdmin ? "Admin Console" : "Member Portal"}!`,
      });
      setClubLoginDialogOpen(false);
      navigate(redirectUrl, { replace: true });
    } catch (err) {
      isSwitchingSessionRef.current = false;
      let msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.data?.message ||
        err.data?.error ||
        err.message ||
        "Invalid club portal password. Please try again.";
      if (typeof msg === "string") {
        msg = msg.replace(/^Something went wrong:\s*/i, "");
        msg = msg.replace(/^\d{3}\s+[A-Z_]+(?:\s+["']?|:\s*["']?)/i, "");
        msg = msg.replace(/^["']|["']$/g, "").trim();
      }
      if (!msg) msg = "Invalid club portal password. Please try again.";
      setClubLoginError(msg);
    } finally {
      setClubSubmitting(false);
    }
  };

  // Handle Request New Club
  const handleClubRequestSubmit = async () => {
    if (!clubReqName.trim() || !clubReqDesc.trim()) {
      toast({
        title: "Missing Information",
        description: "Please specify both the club name and mission description.",
        variant: "destructive",
      });
      return;
    }

    setSubmittingClubReq(true);
    try {
      const res = await studentApi.requestClub({
        clubName: clubReqName.trim(),
        clubDescription: clubReqDesc.trim(),
      });
      toast({
        title: "Proposal Submitted",
        description:
          res?.message ||
          "Your club proposal has been dispatched to college administration.",
      });
      setClubRequestOpen(false);
      setClubReqName("");
      setClubReqDesc("");
    } catch (err) {
      toast({
        title: "Submission Error",
        description: err.message || "Could not submit club request.",
        variant: "destructive",
      });
    } finally {
      setSubmittingClubReq(false);
    }
  };

  // Handle Become Journalist Request Submit
  const handleJournalistReqSubmit = async () => {
    if (!journalistWhy.trim() || !journalistExp.trim()) {
      toast({
        title: "Required Fields Missing",
        description: "Please explain why you want to join and your relevant experience.",
        variant: "destructive",
      });
      return;
    }

    setSubmittingJournalistReq(true);
    try {
      const res = await studentApi.requestBecomeJournalist({
        why: journalistWhy.trim(),
        experience: journalistExp.trim(),
        portfolioLink: journalistPortfolio.trim(),
      });

      toast({
        title: "Request Submitted",
        description:
          res?.message || "Your request to become a journalist has been submitted!",
      });

      setJournalistWhy("");
      setJournalistExp("");
      setJournalistPortfolio("");
      setJournalistReqOpen(false);
      setHasPendingJournalistReq(true);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to submit journalist request. Please try again.";
      toast({
        title: "Submission Error",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setSubmittingJournalistReq(false);
    }
  };

  // Calculate event time status
  const getEventTimeStatus = (event) => {
    if (!event?.startTime) return "UPCOMING";
    const now = new Date();
    const start = new Date(event.startTime);
    const end = event.endTime ? new Date(event.endTime) : start;

    if (now >= start && now <= end) return "LIVE";
    if (now < start) return "UPCOMING";
    return "FINISHED";
  };

  // 4 Core Stat Cards configuration (Exact style match to CollegeAdminDashboard)
  const statItems = [
    {
      label: "Upcoming Events",
      value: stats.upcomingEvents ?? 0,
      icon: Calendar,
      subtitle: "Campus & live happenings",
      route: "/campus-connect/student/events",
      color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    },
    {
      label: "Clubs in College",
      value: stats.collegeClubs ?? 0,
      icon: Building2,
      subtitle: "Student-run societies",
      route: "/campus-connect/student/clubs",
      color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
    },
    {
      label: "My Research",
      value: stats.myResearches ?? 0,
      icon: BookOpen,
      subtitle: "Submitted & verified papers",
      route: "/campus-connect/student/research",
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      label: "Joined Clubs",
      value: stats.joinedClubs ?? 0,
      icon: Users,
      subtitle: "Active memberships & roles",
      route: "/campus-connect/student/clubs",
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    },
  ];

  // Tailored Skeleton matching CollegeAdminDashboard
  if (pageLoading) {
    return (
      <DashboardLayout navItems={studentNavItems} title="Dashboard">
        <div className="space-y-6 animate-pulse">
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

          {/* POR Skeleton */}
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

          {/* Events Skeleton */}
          <div className="space-y-3">
            <div className="h-5 w-40 bg-muted rounded" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="h-24 rounded-2xl border border-border/60 bg-card/60 p-3.5 flex gap-3.5 items-center"
                >
                  <div className="w-16 h-16 rounded-xl bg-muted shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-40 bg-muted rounded" />
                    <div className="h-3 w-28 bg-muted/60 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={studentNavItems} title="Dashboard">
      <div className="space-y-5 sm:space-y-6 w-full max-w-7xl mx-auto pb-10">
        {/* Welcome / Overview Header Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-card via-card/90 to-primary/5 p-4 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant="outline"
                  className="text-[10px] sm:text-[11px] font-semibold border-primary/20 bg-primary/10 text-primary uppercase tracking-wider"
                >
                  Student Portal
                </Badge>
                {userDepartment && (
                  <Badge
                    variant="secondary"
                    className="text-[10px] sm:text-[11px] font-medium bg-secondary/80 text-secondary-foreground flex items-center gap-1"
                  >
                    <Building2 className="w-3 h-3 text-primary" />
                    <span>{userDepartment}</span>
                  </Badge>
                )}
                <span className="text-[11px] sm:text-xs text-muted-foreground">
                  • Academic Active
                </span>
              </div>
              <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-foreground">
                Welcome back, {userName || user?.name || "Student"}!
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed line-clamp-2 sm:line-clamp-none">
                Access your student leadership positions, discover campus organizations, and follow live university events.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-0.5 sm:pt-0 shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8 sm:h-9 px-3 flex-1 sm:flex-none border-border/80 hover:bg-muted/60"
                onClick={() => navigate("/campus-connect/student/clubs")}
              >
                Browse Clubs
              </Button>
              <Button
                size="sm"
                className="text-xs h-8 sm:h-9 px-3.5 flex-1 sm:flex-none font-medium shadow-xs"
                onClick={() => navigate("/campus-connect/student/events")}
              >
                <span>Explore Events</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* 4 Core Stat Cards - Exact CollegeAdminDashboard Ultra-Responsive Styling */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 w-full">
          {statItems.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card
                key={idx}
                className="border-border/70 bg-card/80 backdrop-blur-xs hover:border-primary/40 hover:shadow-xs active:scale-[0.98] transition-all cursor-pointer group rounded-xl sm:rounded-2xl w-full min-w-0 overflow-hidden relative"
                onClick={() => navigate(stat.route)}
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

        {/* Section: Positions of Responsibility */}
        <div className="space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                Positions of Responsibility
              </h2>
              <p className="text-xs text-muted-foreground">
                Your student leadership roles, club management portals, and editorial privileges
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              {!isJournalist && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setJournalistReqOpen(true)}
                  disabled={hasPendingJournalistReq}
                  className="gap-1.5 text-xs h-8 sm:h-9 border-border/80 shadow-xs"
                >
                  <PenTool className="w-3.5 h-3.5 text-primary" />
                  <span>
                    {hasPendingJournalistReq ? "Journalist Request Pending" : "Become Journalist"}
                  </span>
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setClubRequestOpen(true)}
                className="gap-1.5 text-xs h-8 sm:h-9 border-border/80 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Request New Club</span>
              </Button>
            </div>
          </div>

          {userClubs.length === 0 && !isJournalist && !hasPendingJournalistReq ? (
            <Card className="border-border/70 border-dashed bg-card/50 rounded-2xl">
              <CardContent className="p-6 sm:p-8 text-center">
                <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3 text-muted-foreground">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-sm sm:text-base text-foreground mb-1">
                  No Active Leadership Positions
                </h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto mb-4 leading-relaxed">
                  You are not currently appointed to any club boards or journalist roles. Explore clubs to enroll, submit a proposal to launch a new organization, or apply to become a campus journalist!
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-8 sm:h-9"
                    onClick={() => navigate("/campus-connect/student/clubs")}
                  >
                    Browse Clubs Directory
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-8 sm:h-9 gap-1.5 shadow-xs"
                    onClick={() => setClubRequestOpen(true)}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Propose New Club
                  </Button>
                  <Button
                    size="sm"
                    className="text-xs h-8 sm:h-9 gap-1.5 shadow-xs"
                    onClick={() => setJournalistReqOpen(true)}
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    Become Journalist
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Pending Journalist Application Card */}
              {!isJournalist && hasPendingJournalistReq && (
                <Card className="border-border/70 bg-card/70 backdrop-blur-xs overflow-hidden flex flex-col justify-between rounded-xl sm:rounded-2xl opacity-90">
                  <div>
                    <div className="relative h-36 sm:h-40 bg-muted overflow-hidden">
                      <img
                        src="https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=600&auto=format&fit=crop&q=80"
                        alt="Campus Journalist Application"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-amber-500/90 text-white dark:bg-amber-500/90 dark:text-white border-0 text-[10px] sm:text-[11px] font-semibold flex items-center gap-1 shadow-xs backdrop-blur-xs">
                          <Clock className="w-3 h-3" />
                          Application Pending
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h3 className="font-bold text-sm sm:text-base text-foreground line-clamp-1">
                          Campus Journalist
                        </h3>
                        <Badge
                          variant="outline"
                          className="text-[11px] shrink-0 flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                        >
                          Reviewing
                        </Badge>
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        Your application to join the campus newspaper editorial team has been submitted and is under administrative review.
                      </p>
                    </CardContent>
                  </div>

                  <div className="p-4 sm:p-5 pt-0">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled
                      className="w-full text-xs h-8 sm:h-9 border-amber-500/30 text-amber-600 dark:text-amber-400 font-medium cursor-not-allowed opacity-85"
                    >
                      <Clock className="w-3.5 h-3.5 mr-1.5" />
                      Under Administrative Review
                    </Button>
                  </div>
                </Card>
              )}

              {/* Journalist Role Card */}
              {isJournalist && (
                <Card
                  className="border-border/70 bg-card/70 backdrop-blur-xs overflow-hidden hover:border-border hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between group rounded-xl sm:rounded-2xl"
                  onClick={() => {
                    setJournalistError("");
                    setJournalistDialogOpen(true);
                  }}
                >
                  <div>
                    <div className="relative h-36 sm:h-40 bg-muted overflow-hidden">
                      <img
                        src="https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&auto=format&fit=crop&q=80"
                        alt="Campus Journalist"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-primary text-primary-foreground border-0 text-[10px] sm:text-[11px] font-semibold flex items-center gap-1 shadow-xs backdrop-blur-xs">
                          <Newspaper className="w-3 h-3" />
                          Editorial Board
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h3 className="font-bold text-sm sm:text-base text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                          Campus Journalist
                        </h3>
                        <Badge
                          variant="outline"
                          className="text-[11px] shrink-0 flex items-center gap-1 bg-muted/40"
                        >
                          Press
                        </Badge>
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        Official campus press reporter. Draft, review, and publish university newspaper articles.
                      </p>
                    </CardContent>
                  </div>

                  <div className="p-4 sm:p-5 pt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs h-8 sm:h-9 border-border/80 hover:bg-muted/60"
                      onClick={(e) => {
                        e.stopPropagation();
                        setJournalistError("");
                        setJournalistDialogOpen(true);
                      }}
                    >
                      <Eye className="w-3.5 h-3.5 mr-1.5" />
                      Enter Journalist Workspace
                    </Button>
                  </div>
                </Card>
              )}

              {/* Joined Clubs Cards (Admin or Member) */}
              {userClubs.map(({ club, role }) => {
                const isAdmin = role === "ADMIN";
                return (
                  <Card
                    key={club.id}
                    className="border-border/70 bg-card/80 backdrop-blur-xs overflow-hidden hover:border-primary/40 hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col justify-between group rounded-2xl relative min-w-0"
                    onClick={() => handleClubCardClick(club, role)}
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

                        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
                          {isAdmin ? (
                            <Badge className="bg-amber-500/90 text-white dark:bg-amber-500/90 dark:text-white border-0 text-[10px] sm:text-[11px] font-semibold flex items-center gap-1 shadow-xs backdrop-blur-xs px-2 py-0.5">
                              <Crown className="w-3 h-3" />
                              Club Admin
                            </Badge>
                          ) : (
                            <Badge className="bg-background/85 text-foreground border-border/60 text-[10px] sm:text-[11px] font-semibold flex items-center gap-1 shadow-xs backdrop-blur-xs px-2 py-0.5">
                              <User className="w-3 h-3 text-primary" />
                              Club Member
                            </Badge>
                          )}
                        </div>

                        {club.members != null && (
                          <div className="absolute bottom-2.5 right-2.5 z-10">
                            <Badge
                              variant="secondary"
                              className="text-[11px] font-semibold flex items-center gap-1 py-0.5 px-2.5 bg-background/85 text-foreground backdrop-blur-xs border border-border/50 shadow-xs"
                            >
                              <Users className="w-3.5 h-3.5 text-primary" />
                              <span>{club.members}</span>
                            </Badge>
                          </div>
                        )}
                      </div>

                      {/* Card Content */}
                      <CardContent className="p-4 sm:p-5 space-y-2">
                        <div className="min-w-0">
                          <h3 className="font-bold text-base sm:text-lg text-foreground truncate group-hover:text-primary transition-colors leading-snug">
                            {club.name}
                          </h3>
                          {(club.tagline1 || club.category) && (
                            <p className="text-[11px] font-medium text-primary/80 truncate">
                              {club.tagline1 || club.category}
                            </p>
                          )}
                        </div>

                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed min-h-[2.25rem]">
                          {club.description || "Active student organization body."}
                        </p>
                      </CardContent>
                    </div>

                    <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs h-8 sm:h-9 border-border/80 hover:bg-primary hover:text-primary-foreground transition-colors justify-center gap-1.5 shadow-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClubCardClick(club, role);
                        }}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{isAdmin ? "Manage Club Console" : "Open Member Portal"}</span>
                        <ArrowUpRight className="w-3 h-3 ml-auto opacity-70" />
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Section: Active & Upcoming Events (Top 5) */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                Active & Upcoming Events
              </h2>
              <p className="text-xs text-muted-foreground">
                Campus and inter-college events happening now or scheduled soon
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary hover:text-primary gap-1 text-xs h-8 px-2.5"
              onClick={() => navigate("/campus-connect/student/events")}
            >
              <span>View all</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>

          {topEvents.length === 0 ? (
            <Card className="border-border/70 border-dashed bg-card/50 rounded-2xl">
              <CardContent className="p-6 sm:p-8 text-center">
                <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3 text-muted-foreground">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-sm sm:text-base text-foreground mb-1">
                  No Active Events Scheduled
                </h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-4">
                  There are no live or upcoming events registered right now. Check back soon for upcoming campus gatherings!
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-8 sm:h-9"
                  onClick={() => navigate("/campus-connect/student/events")}
                >
                  Explore Events Calendar
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {topEvents.map((event) => {
                const status = getEventTimeStatus(event);
                return (
                  <Card
                    key={event.id}
                    className="border-border/70 bg-card/80 backdrop-blur-xs hover:border-primary/40 hover:shadow-xs transition-all cursor-pointer overflow-hidden rounded-xl sm:rounded-2xl group"
                    onClick={() => {
                      if (event.id) {
                        navigate(`/campus-connect/student/events/${event.id}`);
                      } else {
                        setSelectedEventModal(event);
                      }
                    }}
                  >
                    <CardContent className="p-3 sm:p-4 flex gap-3 sm:gap-4 items-center min-w-0">
                      <img
                        src={event.bannerUrl}
                        alt={event.title}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0 bg-muted border border-border/60 group-hover:scale-102 transition-transform"
                        onError={(e) => {
                          e.target.src =
                            "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&auto=format&fit=crop&q=60";
                        }}
                      />
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge
                            className={`text-[9px] uppercase font-bold shrink-0 px-1.5 py-0 ${status === "LIVE"
                                ? "bg-red-500 text-white animate-pulse"
                                : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                              }`}
                          >
                            {status}
                          </Badge>
                          {event.isGlobal && (
                            <Badge
                              variant="outline"
                              className="text-[9px] uppercase font-semibold text-muted-foreground px-1.5 py-0"
                            >
                              Global
                            </Badge>
                          )}
                        </div>

                        <h3 className="font-semibold text-xs sm:text-sm truncate text-foreground group-hover:text-primary transition-colors">
                          {event.title}
                        </h3>

                        <div className="text-[11px] sm:text-xs text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 pt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            {event.startTime ? event.startTime.split("T")[0] : "TBA"}
                          </span>
                          <span className="flex items-center gap-1 truncate">
                            <MapPin className="w-3 h-3 text-muted-foreground" />
                            {event.location || "Campus Venue"}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0 text-muted-foreground/50 group-hover:text-foreground transition-colors pr-1">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODALS & DIALOGS                                          */}
      {/* ========================================================= */}

      {/* Sub-Dashboard Login Dialog for Journalist */}
      <SubDashboardLoginDialog
        open={journalistDialogOpen}
        onOpenChange={setJournalistDialogOpen}
        title="Journalist Workspace Login"
        description="Enter your journalist credentials to switch into the editorial newsroom."
        icon={Newspaper}
        onSubmit={handleJournalistSubLogin}
        loading={journalistSubmitting}
        error={journalistError}
      />

      {/* Sub-Dashboard Login Dialog for Club Admin / Member */}
      <SubDashboardLoginDialog
        open={clubLoginDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedClubForLogin(null);
            setClubLoginError("");
          }
          setClubLoginDialogOpen(open);
        }}
        title={`${selectedClubForLogin?.name || "Club"} Portal Login`}
        description={`Enter your ${selectedClubForLogin?.role === "ADMIN" ? "Club Admin" : "Club Member"} portal password to proceed.`}
        icon={selectedClubForLogin?.role === "ADMIN" ? Crown : Users}
        onSubmit={handleClubSubLogin}
        loading={clubSubmitting}
        error={clubLoginError}
      />

      {/* Request Club Modal */}
      <Dialog open={clubRequestOpen} onOpenChange={setClubRequestOpen}>
        <DialogContent className="max-w-md w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Request Club Registration</DialogTitle>
            <DialogDescription>
              Propose a new student organization to college administration for official recognition.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="newClubName" className="text-xs font-semibold">
                Club Name *
              </Label>
              <Input
                id="newClubName"
                placeholder="e.g., Quantum Computing Society"
                value={clubReqName}
                onChange={(e) => setClubReqName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="newClubDesc" className="text-xs font-semibold">
                Mission & Planned Activities *
              </Label>
              <Textarea
                id="newClubDesc"
                rows={4}
                placeholder="Describe the club's objectives, intended members, workshops, and campus activities..."
                value={clubReqDesc}
                onChange={(e) => setClubReqDesc(e.target.value)}
              />
            </div>

            <Button
              className="w-full text-xs font-semibold shadow-xs"
              disabled={submittingClubReq}
              onClick={handleClubRequestSubmit}
            >
              {submittingClubReq ? "Submitting Proposal..." : "Submit Club Proposal"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Become a Journalist Modal */}
      <Dialog open={journalistReqOpen} onOpenChange={setJournalistReqOpen}>
        <DialogContent className="max-w-md w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PenTool className="w-4 h-4 text-primary" />
              <span>Apply to Become a Student Journalist</span>
            </DialogTitle>
            <DialogDescription>
              Share your journalism experience to submit and publish articles in the Campus Chronicle.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="journalistWhy" className="text-xs font-semibold">
                Why do you want to join? *
              </Label>
              <Textarea
                id="journalistWhy"
                placeholder="Tell us about your interests in student news and campus reporting..."
                value={journalistWhy}
                onChange={(e) => setJournalistWhy(e.target.value)}
                className="text-xs sm:text-sm min-h-[80px]"
                rows={3}
                disabled={submittingJournalistReq}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="journalistExp" className="text-xs font-semibold">
                Writing or Journalism Experience *
              </Label>
              <Textarea
                id="journalistExp"
                placeholder="Past publications, articles, editorial work, or writing clubs..."
                value={journalistExp}
                onChange={(e) => setJournalistExp(e.target.value)}
                className="text-xs sm:text-sm min-h-[80px]"
                rows={3}
                disabled={submittingJournalistReq}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="journalistPortfolio" className="text-xs font-semibold">
                Portfolio Link (optional)
              </Label>
              <Input
                id="journalistPortfolio"
                placeholder="https://your-portfolio.com or Drive link"
                value={journalistPortfolio}
                onChange={(e) => setJournalistPortfolio(e.target.value)}
                className="text-xs sm:text-sm h-9"
                disabled={submittingJournalistReq}
              />
            </div>

            <Button
              className="w-full text-xs font-semibold shadow-xs"
              disabled={submittingJournalistReq}
              onClick={handleJournalistReqSubmit}
            >
              {submittingJournalistReq ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                  Submitting Request...
                </>
              ) : (
                "Submit Request"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quick Event Details Modal (Fallback) */}
      <Dialog
        open={!!selectedEventModal}
        onOpenChange={(open) => !open && setSelectedEventModal(null)}
      >
        <DialogContent className="max-w-lg w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">
              {selectedEventModal?.title || "Event Details"}
            </DialogTitle>
            <DialogDescription>
              Complete scheduling and venue details.
            </DialogDescription>
          </DialogHeader>

          {selectedEventModal && (
            <div className="space-y-4 pt-2 text-xs sm:text-sm">
              <img
                src={selectedEventModal.bannerUrl}
                alt={selectedEventModal.title}
                className="w-full h-44 rounded-xl object-cover border border-border/60"
                onError={(e) => {
                  e.target.src =
                    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60";
                }}
              />

              <div className="space-y-2 rounded-xl bg-muted/40 p-3 text-xs">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>
                    <strong className="font-semibold">Start:</strong>{" "}
                    {selectedEventModal.startTime?.replace("T", " • ") || "TBA"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>
                    <strong className="font-semibold">Location:</strong>{" "}
                    {selectedEventModal.location || "Campus Venue"}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-1">
                  Description
                </h4>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-xs sm:text-sm">
                  {selectedEventModal.description || "No description provided."}
                </p>
              </div>

              <DialogFooter className="pt-2">
                <Button
                  className="w-full text-xs"
                  onClick={() => {
                    const id = selectedEventModal.id;
                    setSelectedEventModal(null);
                    if (id) {
                      navigate(`/campus-connect/student/events/${id}`);
                    }
                  }}
                >
                  Go to Event Page
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
