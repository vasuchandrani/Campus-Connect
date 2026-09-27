import "./AdminClubsPage.css";
import { useEffect, useState, useMemo } from "react";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import { Card, CardContent } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Input } from "../../../components/ui/Input";
import { Label } from "../../../components/ui/Label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/Tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../../components/ui/Dialog";
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  MoreVertical,
  Calendar,
  Clock,
  MapPin,
  Megaphone,
  Building2,
  AlertTriangle,
  UserCheck,
  ExternalLink,
  Trash2,
  GraduationCap,
  ArrowUpRight,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/DropdownMenu";
import { useNavigate } from "react-router-dom";
import { collegeAdminNavItems } from "../../../config/Navigation";
import { toast } from "../../../hooks/use-toast";
import { useAuth } from "../../../contexts/AuthContext";
import EmptyState from "../../../components/ui/EmptyState";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import { collegeAdminApi } from "../../../services/api";

export default function AdminClubsPage() {
  const navigate = useNavigate();

  // State variables
  const [searchQuery, setSearchQuery] = useState("");
  const [clubs, setClubs] = useState([]);
  const [pendingClubs, setPendingClubs] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [completedEvents, setCompletedEvents] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [activeTab, setActiveTab] = useState("active");

  // Confirmation dialog
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    description: "",
    confirmText: "",
    variant: "destructive",
    onConfirm: null,
  });

  // Modals & details
  const [viewAnnouncement, setViewAnnouncement] = useState(null);
  const [approveDialog, setApproveDialog] = useState({
    open: false,
    clubReq: null,
    mentorId: "",
  });

  const [requesting, setRequesting] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const { routeProtection } = useAuth();

  useEffect(() => {
    if (!routeProtection("COLLEGE_ADMIN")) {
      navigate("/auth");
    }
  }, [navigate, routeProtection]);

  const fetchClubRequests = async () => {
    try {
      const data = await collegeAdminApi.getClubRequests();
      setPendingClubs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching club requests:", err);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const data = await collegeAdminApi.getAnnouncements();
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching announcements:", err);
    }
  };

  const fetchUpcomingEvents = async () => {
    try {
      const data = await collegeAdminApi.getActiveEvents();
      setUpcomingEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching upcoming events:", err);
    }
  };

  const fetchCompletedEvents = async () => {
    try {
      const data = await collegeAdminApi.getFinishedEvents();
      setCompletedEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching completed events:", err);
    }
  };

  const fetchClubs = async () => {
    try {
      const data = await collegeAdminApi.getClubs();
      setClubs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching clubs:", err);
    }
  };

  const fetchProfessors = async () => {
    try {
      const data = await collegeAdminApi.getProfessors();
      setProfessors(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching professors:", err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setPageLoading(true);
      try {
        await Promise.all([
          fetchClubs(),
          fetchClubRequests(),
          fetchAnnouncements(),
          fetchUpcomingEvents(),
          fetchCompletedEvents(),
          fetchProfessors(),
        ]);
      } catch (err) {
        console.error("Error loading clubs page data:", err);
      } finally {
        setPageLoading(false);
      }
    };

    fetchData();
  }, []);

  // If activeTab is 'pending' but there are no pending requests, switch back to 'active'
  useEffect(() => {
    if (pendingClubs.length === 0 && activeTab === "pending") {
      setActiveTab("active");
    }
  }, [pendingClubs, activeTab]);

  // Approve club with mentor
  const handleApproveClubWithMentor = async () => {
    if (!approveDialog.clubReq || !approveDialog.mentorId) {
      toast({
        title: "Mentor Selection Required",
        description: "Please assign a faculty professor as mentor for this club.",
        variant: "destructive",
      });
      return;
    }

    setRequesting(true);
    try {
      const data = await collegeAdminApi.acceptClubRequest(
        approveDialog.clubReq.id,
        Number(approveDialog.mentorId)
      );

      toast({
        title: "Club Approved",
        description:
          data.message || "Club created and faculty mentor assigned successfully.",
        variant: "success",
      });

      setApproveDialog({ open: false, clubReq: null, mentorId: "" });
      await Promise.all([fetchClubRequests(), fetchClubs()]);
    } catch (err) {
      toast({
        title: "Approval Failed",
        description: err.message || "Failed to approve club request.",
        variant: "destructive",
      });
    } finally {
      setRequesting(false);
    }
  };

  // Reject club request
  const handleRejectClub = async (clubReqId) => {
    setRequesting(true);
    try {
      const data = await collegeAdminApi.rejectClubRequest(clubReqId);
      toast({
        title: "Request Rejected",
        description: data.message || "Club request has been rejected.",
        variant: "default",
      });
      await fetchClubRequests();
    } catch (err) {
      toast({
        title: "Rejection Failed",
        description: err.message || "Failed to reject club request.",
        variant: "destructive",
      });
    } finally {
      setRequesting(false);
    }
  };

  const promptRejectClub = (club) => {
    setConfirmDialog({
      open: true,
      title: "Reject Club Proposal",
      description: `Are you sure you want to reject the proposal for "${club.clubName}"? This application will be permanently dismissed.`,
      confirmText: "Reject Proposal",
      variant: "destructive",
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, open: false }));
        await handleRejectClub(club.id);
      },
    });
  };

  // Delete club
  const handleDeleteClub = async (clubId) => {
    setRequesting(true);
    try {
      const data = await collegeAdminApi.deleteClub(clubId);
      toast({
        title: "Club Deleted",
        description: data.message || "Club deleted successfully.",
        variant: "success",
      });
      await fetchClubs();
    } catch (err) {
      toast({
        title: "Delete Failed",
        description: err.message || "Failed to delete club.",
        variant: "destructive",
      });
    } finally {
      setRequesting(false);
    }
  };

  const promptDeleteClub = (club) => {
    setConfirmDialog({
      open: true,
      title: "Delete Student Club",
      description: `Are you sure you want to delete "${club.name}"? All associated member rosters, teams, and events will be permanently removed.`,
      confirmText: "Delete Club",
      variant: "destructive",
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, open: false }));
        await handleDeleteClub(club.id);
      },
    });
  };

  // Search filter
  const filteredClubs = useMemo(() => {
    return clubs.filter(
      (c) =>
        (c.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.description || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [clubs, searchQuery]);

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter(
      (a) =>
        (a.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.content || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.clubName || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [announcements, searchQuery]);

  const filteredUpcomingEvents = useMemo(() => {
    return upcomingEvents.filter(
      (e) =>
        (e.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.clubName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.venue || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [upcomingEvents, searchQuery]);

  const filteredCompletedEvents = useMemo(() => {
    return completedEvents.filter(
      (e) =>
        (e.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.clubName || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [completedEvents, searchQuery]);

  const filteredPendingClubs = useMemo(() => {
    return pendingClubs.filter(
      (p) =>
        (p.clubName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.studentName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.clubDescription || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [pendingClubs, searchQuery]);

  // Tailored Skeleton
  if (pageLoading) {
    return (
      <DashboardLayout navItems={collegeAdminNavItems} title="Clubs Management">
        <div className="space-y-6 animate-pulse">
          {/* Header Skeleton */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-2">
              <div className="h-6 w-48 bg-muted rounded-md" />
              <div className="h-3.5 w-72 bg-muted/60 rounded" />
            </div>
            <div className="h-9 w-full sm:w-64 bg-muted rounded-lg" />
          </div>

          {/* Tab Bar Skeleton */}
          <div className="w-full grid grid-cols-2 sm:inline-flex sm:w-auto gap-1 p-1 bg-muted/30 border border-border/40 rounded-xl">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-8 sm:w-28 bg-muted rounded-lg" />
            ))}
            <div className="col-span-2 sm:col-span-1 h-8 sm:w-32 bg-muted rounded-lg" />
          </div>

          {/* Cards Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-border/60 bg-card/60 p-4 space-y-3"
              >
                <div className="h-36 bg-muted rounded-xl" />
                <div className="h-4 w-3/4 bg-muted rounded" />
                <div className="h-3 w-full bg-muted/60 rounded" />
                <div className="h-8 w-full bg-muted/70 rounded-lg pt-2" />
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={collegeAdminNavItems} title="Clubs Management">
      <div className="space-y-6">
        {/* Responsive Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Clubs & Campus Life
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Oversee recognized student clubs, announcements, events, and approval requests.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64 md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search clubs, events, posts..."
              className="pl-9 text-xs sm:text-sm h-9 bg-card/80 border-border/70"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* 5 SUB-TABS IN EXACT SPECIFIED ORDER:
            1. Active Clubs
            2. Announcements
            3. Active Events
            4. Completed Events
            5. Pending Approval */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Responsive 2x2 grid on mobile, inline-flex on desktop */}
          <div className="w-full">
            <TabsList className="w-full grid grid-cols-2 sm:inline-flex sm:w-auto p-1 bg-muted/60 dark:bg-muted/40 border border-border/60 rounded-xl gap-1.5 sm:gap-1">
              <TabsTrigger
                value="active"
                className="text-xs sm:text-sm py-2 sm:py-1.5 px-3 rounded-lg justify-center font-medium w-full"
              >
                Active Clubs
              </TabsTrigger>
              <TabsTrigger
                value="announcements"
                className="text-xs sm:text-sm py-2 sm:py-1.5 px-3 rounded-lg justify-center font-medium w-full"
              >
                Announcements
              </TabsTrigger>
              <TabsTrigger
                value="active-events"
                className="text-xs sm:text-sm py-2 sm:py-1.5 px-3 rounded-lg justify-center font-medium w-full"
              >
                Active Events
              </TabsTrigger>
              <TabsTrigger
                value="completed-events"
                className="text-xs sm:text-sm py-2 sm:py-1.5 px-3 rounded-lg justify-center font-medium w-full"
              >
                Completed Events
              </TabsTrigger>
              {pendingClubs.length > 0 && (
                <TabsTrigger
                  value="pending"
                  className="col-span-2 sm:col-span-1 text-xs sm:text-sm py-2 sm:py-1.5 px-3 rounded-lg justify-center font-medium w-full"
                >
                  Pending Approval
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          {/* TAB 1: ACTIVE CLUBS */}
          <TabsContent value="active" className="space-y-4">
            {filteredClubs.length === 0 ? (
              <Card className="border-border/70 bg-card/60">
                <CardContent className="p-8">
                  <EmptyState
                    icon={<Building2 className="w-8 h-8 text-muted-foreground" />}
                    title="No Active Clubs"
                    desc={
                      searchQuery
                        ? "No clubs match your search keywords."
                        : "There are no active clubs registered in this institution."
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
                    onClick={() =>
                      navigate(`/campus-connect/college-admin/clubs/${club.id}`)
                    }
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

                        {/* Top Badges & Actions */}
                        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
                          {(club.tagline1 || club.tagline2 || club.category) && (
                            <Badge className="bg-background/85 text-foreground border-border/60 text-[10px] sm:text-[11px] font-semibold shadow-xs backdrop-blur-xs px-2 py-0.5 max-w-[130px] truncate">
                              {club.tagline1 || club.tagline2 || club.category}
                            </Badge>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="secondary"
                                size="icon"
                                className="h-7 w-7 bg-background/80 backdrop-blur-xs hover:bg-background shadow-xs shrink-0 rounded-lg"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="w-3.5 h-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(
                                    `/campus-connect/college-admin/clubs/${club.id}`
                                  );
                                }}
                              >
                                <Eye className="w-3.5 h-3.5 mr-2 text-primary" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  promptDeleteClub(club);
                                }}
                              >
                                <Trash2 className="w-3.5 h-3.5 mr-2" />
                                Delete Club
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
                          {club.description || "Active student organization registered in college."}
                        </p>

                        {/* Leadership Metadata */}
                        <div className="pt-2.5 border-t border-border/60 space-y-1 text-xs text-muted-foreground">
                          {club.mentorName && (
                            <div className="flex items-center justify-between gap-1 text-[11px]">
                              <span className="flex items-center gap-1 text-muted-foreground shrink-0">
                                <GraduationCap className="w-3 h-3 text-primary" />
                                Faculty Mentor:
                              </span>
                              <span className="font-medium text-foreground truncate max-w-[140px]">
                                {club.mentorName}
                              </span>
                            </div>
                          )}
                          {club.adminName && (
                            <div className="flex items-center justify-between gap-1 text-[11px]">
                              <span className="flex items-center gap-1 text-muted-foreground shrink-0">
                                <UserCheck className="w-3 h-3 text-primary" />
                                Student Lead:
                              </span>
                              <span className="font-medium text-foreground truncate max-w-[140px]">
                                {club.adminName}
                              </span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </div>

                    {/* Action Footer */}
                    <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs h-8 sm:h-9 border-border/80 hover:bg-primary hover:text-primary-foreground transition-colors justify-center gap-1.5 shadow-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(
                            `/campus-connect/college-admin/clubs/${club.id}`
                          );
                        }}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Explore Club Details</span>
                        <ArrowUpRight className="w-3 h-3 ml-auto opacity-70" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* TAB 2: ANNOUNCEMENTS */}
          <TabsContent value="announcements" className="space-y-4">
            {filteredAnnouncements.length === 0 ? (
              <Card className="border-border/70 bg-card/60">
                <CardContent className="p-8">
                  <EmptyState
                    icon={<Megaphone className="w-8 h-8 text-muted-foreground" />}
                    title="No Announcements"
                    desc="No club announcements published yet."
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredAnnouncements.map((item) => (
                  <Card
                    key={item.id}
                    className="border-border/70 bg-card/70 backdrop-blur-xs hover:border-border transition-all"
                  >
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            variant="outline"
                            className="text-[11px] bg-primary/5 text-primary border-primary/20"
                          >
                            {item.clubName || "Campus Club"}
                          </Badge>
                          {item.createdAt && (
                            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(item.createdAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-8 text-muted-foreground hover:text-foreground self-start sm:self-auto"
                          onClick={() => setViewAnnouncement(item)}
                        >
                          Read Announcement
                        </Button>
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-foreground mt-2">
                        {item.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                        {item.content}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* TAB 3: ACTIVE EVENTS */}
          <TabsContent value="active-events" className="space-y-4">
            {filteredUpcomingEvents.length === 0 ? (
              <Card className="border-border/70 bg-card/60">
                <CardContent className="p-8">
                  <EmptyState
                    icon={<Calendar className="w-8 h-8 text-muted-foreground" />}
                    title="No Active Events"
                    desc="There are currently no live or upcoming events scheduled."
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredUpcomingEvents.map((event) => (
                  <Card
                    key={event.id}
                    className="border-border/70 bg-card/70 backdrop-blur-xs overflow-hidden hover:border-border hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between group"
                    onClick={() =>
                      navigate(`/campus-connect/college-admin/events/${event.id}`)
                    }
                  >
                    <div>
                      {event.bannerUrl && (
                        <div className="w-full h-36 bg-muted overflow-hidden">
                          <img
                            src={event.bannerUrl}
                            alt={event.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <CardContent className="p-4 sm:p-5">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-primary/5 text-primary border-primary/20"
                          >
                            {event.clubName || "Club"}
                          </Badge>
                          <span className="text-[11px] text-muted-foreground font-medium">
                            {event.startTime
                              ? new Date(event.startTime).toLocaleDateString()
                              : "Upcoming"}
                          </span>
                        </div>
                        <h3 className="font-bold text-sm sm:text-base text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                          {event.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                          {event.description || "No description provided."}
                        </p>
                      </CardContent>
                    </div>

                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0">
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-3 border-t border-border/50">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {event.startTime
                            ? new Date(event.startTime).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "Scheduled"}
                        </span>
                        {event.venue && (
                          <span className="flex items-center gap-1 truncate max-w-[130px]">
                            <MapPin className="w-3 h-3 shrink-0" />
                            <span className="truncate">{event.venue}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* TAB 4: COMPLETED EVENTS */}
          <TabsContent value="completed-events" className="space-y-4">
            {filteredCompletedEvents.length === 0 ? (
              <Card className="border-border/70 bg-card/60">
                <CardContent className="p-8">
                  <EmptyState
                    icon={<Calendar className="w-8 h-8 text-muted-foreground" />}
                    title="No Completed Events"
                    desc="No finished events archived yet."
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredCompletedEvents.map((event) => (
                  <Card
                    key={event.id}
                    className="border-border/70 bg-card/70 backdrop-blur-xs overflow-hidden hover:border-border transition-all cursor-pointer flex flex-col justify-between"
                    onClick={() =>
                      navigate(`/campus-connect/college-admin/events/${event.id}`)
                    }
                  >
                    <div>
                      {event.bannerUrl && (
                        <div className="w-full h-36 bg-muted overflow-hidden grayscale opacity-80">
                          <img
                            src={event.bannerUrl}
                            alt={event.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <CardContent className="p-4 sm:p-5">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <Badge variant="secondary" className="text-[10px]">
                            {event.clubName || "Club"}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="text-[10px] text-muted-foreground"
                          >
                            Archived
                          </Badge>
                        </div>
                        <h3 className="font-bold text-sm sm:text-base text-foreground line-clamp-1">
                          {event.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                          {event.description || "No description."}
                        </p>
                      </CardContent>
                    </div>

                    <div className="p-4 sm:p-5 pt-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs h-8 text-muted-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(
                            `/campus-connect/college-admin/events/${event.id}`
                          );
                        }}
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        View Archive
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* TAB 5: PENDING APPROVAL (CLUB CREATION APPLICATIONS) - ONLY SHOWN IF PENDING REQUESTS EXIST */}
          {pendingClubs.length > 0 && (
            <TabsContent value="pending" className="space-y-4">
              {filteredPendingClubs.length === 0 ? (
                <Card className="border-border/70 bg-card/60">
                  <CardContent className="p-8">
                    <EmptyState
                      icon={<Building2 className="w-8 h-8 text-muted-foreground" />}
                      title="No Pending Applications"
                      desc="No pending proposals match your search query."
                    />
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {filteredPendingClubs.map((club) => (
                    <Card
                      key={club.id}
                      className="border-border/70 bg-card/70 backdrop-blur-xs overflow-hidden hover:border-border hover:shadow-xs transition-all flex flex-col justify-between"
                    >
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div>
                            <Badge
                              variant="outline"
                              className="text-[11px] bg-amber-500/10 text-amber-600 border-amber-500/20 mb-1"
                            >
                              Pending Review
                            </Badge>
                            <h3 className="text-base sm:text-lg font-bold text-foreground">
                              {club.clubName}
                            </h3>
                          </div>
                          {club.createdAt && (
                            <span className="text-[11px] text-muted-foreground shrink-0">
                              {new Date(club.createdAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>

                        <div className="bg-muted/50 p-3 rounded-xl text-xs space-y-1 mb-3 border border-border/50">
                          <p className="font-semibold text-foreground">
                            Applicant:{" "}
                            <span className="font-normal text-muted-foreground">
                              {club.studentName || "Student"}
                            </span>
                          </p>
                          <p className="font-semibold text-foreground">
                            Email:{" "}
                            <span className="font-normal text-muted-foreground">
                              {club.studentEmail || "N/A"}
                            </span>
                          </p>
                        </div>

                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                          {club.clubDescription}
                        </p>
                      </CardContent>

                      <div className="p-4 sm:p-6 pt-0 flex flex-col sm:flex-row gap-2 border-t border-border/50 pt-4">
                        <Button
                          size="sm"
                          className="w-full sm:flex-1 h-10 min-h-[40px] text-xs sm:text-sm font-semibold shadow-xs shrink-0 rounded-xl"
                          disabled={requesting}
                          onClick={() => {
                            setApproveDialog({
                              open: true,
                              clubReq: club,
                              mentorId:
                                professors.length > 0
                                  ? String(professors[0].id)
                                  : "",
                            });
                          }}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1.5 shrink-0" />
                          Approve Club
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full sm:w-auto h-10 min-h-[40px] text-xs sm:text-sm font-semibold text-destructive border border-destructive/30 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 shrink-0 rounded-xl"
                          disabled={requesting}
                          onClick={() => promptRejectClub(club)}
                        >
                          <XCircle className="w-4 h-4 mr-1.5 shrink-0" />
                          Reject
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>

        {/* MODAL: APPROVE CLUB & SELECT FACULTY MENTOR */}
        <Dialog
          open={approveDialog.open}
          onOpenChange={(open) =>
            !requesting && setApproveDialog((prev) => ({ ...prev, open }))
          }
        >
          <DialogContent className="w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto rounded-2xl p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-primary shrink-0" />
                <span>Assign Faculty Mentor</span>
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                Select a faculty professor to officially oversee and mentor this student club.
              </DialogDescription>
            </DialogHeader>

            {approveDialog.clubReq && (
              <div className="space-y-4 py-2">
                <div className="p-3 bg-muted/60 rounded-xl border border-border/60 text-xs space-y-1">
                  <p className="font-semibold text-foreground">
                    Club Name:{" "}
                    <span className="font-normal text-muted-foreground">
                      {approveDialog.clubReq.clubName}
                    </span>
                  </p>
                  <p className="font-semibold text-foreground">
                    Applicant:{" "}
                    <span className="font-normal text-muted-foreground">
                      {approveDialog.clubReq.studentName} (
                      {approveDialog.clubReq.studentEmail})
                    </span>
                  </p>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="mentor-select"
                    className="text-xs sm:text-sm font-semibold text-foreground"
                  >
                    Select Faculty Mentor{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  {professors.length === 0 ? (
                    <div className="p-3 bg-destructive/10 text-destructive text-xs rounded-xl flex items-center gap-2 border border-destructive/20">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>
                        No professors registered in this college yet. Please add a
                        professor first under the Users tab.
                      </span>
                    </div>
                  ) : (
                    <select
                      id="mentor-select"
                      className="w-full h-10 px-3 rounded-xl border border-input bg-background text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      value={approveDialog.mentorId}
                      onChange={(e) =>
                        setApproveDialog((prev) => ({
                          ...prev,
                          mentorId: e.target.value,
                        }))
                      }
                      disabled={requesting}
                    >
                      <option value="" disabled>
                        Select a faculty mentor...
                      </option>
                      {professors.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} — {p.department || "Faculty"} (
                          {p.email || ""})
                        </option>
                      ))}
                    </select>
                  )}
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    A faculty mentor is mandatory to register and activate a
                    campus club in compliance with institution regulations.
                  </p>
                </div>
              </div>
            )}

            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-9"
                onClick={() =>
                  setApproveDialog({
                    open: false,
                    clubReq: null,
                    mentorId: "",
                  })
                }
                disabled={requesting}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="text-xs h-9"
                onClick={handleApproveClubWithMentor}
                disabled={
                  !approveDialog.mentorId ||
                  requesting ||
                  professors.length === 0
                }
              >
                {requesting ? "Creating Club..." : "Confirm & Create Club"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* MODAL: READ ANNOUNCEMENT */}
        <Dialog
          open={Boolean(viewAnnouncement)}
          onOpenChange={(open) => !open && setViewAnnouncement(null)}
        >
          <DialogContent className="w-[95vw] sm:max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl p-4 sm:p-6">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <Badge
                  variant="outline"
                  className="text-[10px] bg-primary/5 text-primary border-primary/20"
                >
                  {viewAnnouncement?.clubName || "Club Announcement"}
                </Badge>
                {viewAnnouncement?.createdAt && (
                  <span className="text-[11px] text-muted-foreground">
                    {new Date(viewAnnouncement.createdAt).toLocaleDateString()}
                  </span>
                )}
              </div>
              <DialogTitle className="text-base sm:text-lg font-bold text-foreground">
                {viewAnnouncement?.title}
              </DialogTitle>
            </DialogHeader>

            <div className="py-2 text-xs sm:text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
              {viewAnnouncement?.content}
            </div>

            <DialogFooter>
              <Button
                size="sm"
                className="text-xs h-9 w-full sm:w-auto"
                onClick={() => setViewAnnouncement(null)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* REUSABLE CONFIRMATION DIALOG */}
        <ConfirmDialog
          open={confirmDialog.open}
          onOpenChange={(open) =>
            setConfirmDialog((prev) => ({ ...prev, open }))
          }
          title={confirmDialog.title}
          description={confirmDialog.description}
          confirmText={confirmDialog.confirmText}
          variant={confirmDialog.variant}
          loading={requesting}
          onConfirm={confirmDialog.onConfirm}
        />
      </div>
    </DashboardLayout>
  );
}
