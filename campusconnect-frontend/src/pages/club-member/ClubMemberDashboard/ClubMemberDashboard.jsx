import "./ClubMemberDashboard.css";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../../components/ui/Card";
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
import { MarkdownEditor } from "../../../components/ui/MarkdownEditor";
import { MarkdownViewer } from "../../../components/ui/MarkdownViewer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/Select";
import {
  LayoutDashboard,
  Megaphone,
  Calendar,
  CalendarDays,
  Users,
  UserCheck,
  Layers,
  Heart,
  Clock,
  MapPin,
  Globe,
  Building2,
  Plus,
  Search,
  Trash2,
  Send,
  ShieldCheck,
  ChevronRight,
  FileText,
  ArrowLeft,
  ArrowUpRight,
  BellOff,
  CalendarX,
  UserX,
  Sparkles,
  GraduationCap,
  Eye,
  Edit2,
} from "lucide-react";
import { clubMemberNavItems } from "../../../config/Navigation";
import { useAuth } from "../../../contexts/AuthContext";
import EmptyState from "../../../components/ui/EmptyState";
import PageSkeleton from "../../../components/ui/PageSkeleton";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import SubDashboardLoginDialog from "../../../components/dashboard/SubDashboardLoginDialog";
import { clubMemberApi } from "../../../services/api";
import { toast } from "../../../hooks/use-toast";

export default function ClubMemberDashboard({ initialTab = "dashboard" }) {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isClubMember, returnToStudent } = useAuth();

  // Return to student state
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [returnLoading, setReturnLoading] = useState(false);
  const [returnError, setReturnError] = useState("");

  const handleReturnToStudent = async (password) => {
    setReturnLoading(true);
    setReturnError("");
    try {
      const redirectUrl = await returnToStudent(password, null, clubId);
      toast({
        title: "Session Swapped",
        description: "Welcome back to your Student Dashboard!",
      });
      setReturnDialogOpen(false);
      navigate(redirectUrl, { replace: true });
    } catch (err) {
      let msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.data?.message ||
        err.data?.error ||
        err.message ||
        "Invalid password. Please verify your student password.";
      if (typeof msg === "string") {
        msg = msg.replace(/^Something went wrong:\s*/i, "");
        msg = msg.replace(/^\d{3}\s+[A-Z_]+(?:\s+["']?|:\s*["']?)/i, "");
        msg = msg.replace(/^["']|["']$/g, "").trim();
      }
      if (!msg) msg = "Invalid password. Please verify your student password.";
      setReturnError(msg);
    } finally {
      setReturnLoading(false);
    }
  };

  // -------------------------------------------------------------
  // PRIMARY NAVIGATION & TAB STATE
  // -------------------------------------------------------------
  const getTabFromPath = () => {
    const path = location.pathname;
    if (path.includes("/announcements")) return "announcements";
    if (path.includes("/events")) return "events";
    if (path.includes("/members")) return "members";
    if (path.includes("/teams")) return "teams";
    return initialTab || "dashboard";
  };

  const [activeTab, setActiveTab] = useState(getTabFromPath);

  useEffect(() => {
    setActiveTab(getTabFromPath());
  }, [location.pathname, initialTab]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (tabId === "dashboard") {
      navigate(`/campus-connect/club-member/${clubId}/dashboard`, { replace: true });
    } else {
      navigate(`/campus-connect/club-member/${clubId}/${tabId}`, { replace: true });
    }
  };

  const updateNavItems = useCallback(() => {
    return clubMemberNavItems.map((item) => ({
      ...item,
      href: item.href.replace(":clubId", clubId),
    }));
  }, [clubId]);

  // -------------------------------------------------------------
  // GENERAL STATE
  // -------------------------------------------------------------
  const [pageLoading, setPageLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [clubName, setClubName] = useState("Club Portal");

  // Dashboard Overview Stats
  const [stats, setStats] = useState({
    followers: 0,
    members: 0,
    teams: 0,
    events: 0,
  });

  // Recent 5 Feeds for Dashboard Tab
  const [recentEvents, setRecentEvents] = useState([]);
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);

  // Announcements Tab State
  const [announcementSubtab, setAnnouncementSubtab] = useState("published");
  const [publishedAnnouncements, setPublishedAnnouncements] = useState([]);
  const [pendingAnnouncements, setPendingAnnouncements] = useState([]);
  const [draftAnnouncements, setDraftAnnouncements] = useState([]);
  const [announcementSearch, setAnnouncementSearch] = useState("");

  // Create Announcement Dialog State
  const [createAnnOpen, setCreateAnnOpen] = useState(false);
  const [annForm, setAnnForm] = useState({ title: "", content: "" });
  const [editingDraftId, setEditingDraftId] = useState(null);
  const [viewAnnouncement, setViewAnnouncement] = useState(null);
  const [submittingAnn, setSubmittingAnn] = useState(false);

  // Events Tab State
  const [eventSubtab, setEventSubtab] = useState("published");
  const [publishedEvents, setPublishedEvents] = useState([]);
  const [finishedEvents, setFinishedEvents] = useState([]);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [draftEvents, setDraftEvents] = useState([]);
  const [eventSearch, setEventSearch] = useState("");

  // Create Event Dialog State
  const [createEventOpen, setCreateEventOpen] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    eventType: "OFFLINE",
    isPublic: false,
    registrationPayment: "FREE",
    registrationStart: "",
    registrationEnd: "",
    startTime: "",
    endTime: "",
    location: { address: "", city: "", state: "", country: "" },
    batchYear: "",
    criteria: "",
    eligibility: "",
    prizeMoney: "",
    image: null,
  });
  const [eventImagePreview, setEventImagePreview] = useState(null);
  const [submittingEvent, setSubmittingEvent] = useState(false);

  // Members Tab State (Read-Only)
  const [membersList, setMembersList] = useState([]);
  const [memberSearch, setMemberSearch] = useState("");

  // Teams Tab State (Read-Only)
  const [teamsList, setTeamsList] = useState([]);
  const [teamSearch, setTeamSearch] = useState("");

  // Global Confirm Dialog
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    description: "",
    confirmText: "Confirm",
    variant: "destructive",
    loading: false,
    onConfirm: () => {},
  });

  // -------------------------------------------------------------
  // DATA FETCHING FUNCTIONS
  // -------------------------------------------------------------
  const fetchDashboardStatsAndFeeds = async () => {
    try {
      const [name, statsData, recAnn, pubEvents] = await Promise.all([
        clubMemberApi.getClubName(clubId).catch(() => "Club Portal"),
        clubMemberApi.getStats(clubId).catch(() => ({})),
        clubMemberApi.getLatestAnnouncements(clubId).catch(() => []),
        clubMemberApi.getPublishedEvents(clubId).catch(() => []),
      ]);

      if (typeof name === "string") setClubName(name);
      setStats({
        followers: statsData?.followers || 0,
        members: statsData?.members || 0,
        teams: statsData?.teams || 0,
        events: statsData?.events || 0,
      });

      setRecentAnnouncements(Array.isArray(recAnn) ? recAnn.slice(0, 5) : []);
      setRecentEvents(Array.isArray(pubEvents) ? pubEvents.slice(0, 5) : []);
    } catch (err) {
      console.error("Failed to load dashboard stats", err);
    }
  };

  const fetchAnnouncementsData = async () => {
    try {
      const [pub, pnd, drf] = await Promise.all([
        clubMemberApi.getPublishedAnnouncements(clubId).catch(() => []),
        clubMemberApi.getPendingAnnouncements(clubId).catch(() => []),
        clubMemberApi.getDraftAnnouncements(clubId).catch(() => []),
      ]);
      setPublishedAnnouncements(Array.isArray(pub) ? pub : []);
      setPendingAnnouncements(Array.isArray(pnd) ? pnd : []);
      setDraftAnnouncements(Array.isArray(drf) ? drf : []);
    } catch (err) {
      console.error("Failed to fetch announcements", err);
    }
  };

  const fetchEventsData = async () => {
    try {
      const [pub, fin, pnd, drf] = await Promise.all([
        clubMemberApi.getPublishedEvents(clubId).catch(() => []),
        clubMemberApi.getFinishedEvents(clubId).catch(() => []),
        clubMemberApi.getPendingEvents(clubId).catch(() => []),
        clubMemberApi.getDraftEvents(clubId).catch(() => []),
      ]);
      setPublishedEvents(Array.isArray(pub) ? pub : []);
      setFinishedEvents(Array.isArray(fin) ? fin : []);
      setPendingEvents(Array.isArray(pnd) ? pnd : []);
      setDraftEvents(Array.isArray(drf) ? drf : []);
    } catch (err) {
      console.error("Failed to fetch events", err);
    }
  };

  const fetchMembersData = async () => {
    try {
      const data = await clubMemberApi.getMembers(clubId);
      setMembersList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch members", err);
    }
  };

  const fetchTeamsData = async () => {
    try {
      const data = await clubMemberApi.getTeams(clubId);
      setTeamsList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch teams", err);
    }
  };

  const loadAllData = async () => {
    try {
      const authorized = await isClubMember(clubId);
      if (!authorized) {
        toast({
          title: "Access Restricted",
          description: "You are not an enrolled member of this club.",
          variant: "destructive",
        });
        navigate("/campus-connect/student/dashboard");
        return;
      }

      await Promise.all([
        fetchDashboardStatsAndFeeds(),
        fetchAnnouncementsData(),
        fetchEventsData(),
        fetchMembersData(),
        fetchTeamsData(),
      ]);
    } catch (err) {
      toast({
        title: "Error Loading Data",
        description: err?.message || "Failed to load club member dashboard",
        variant: "destructive",
      });
    } finally {
      setPageLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setPageLoading(true);
    loadAllData();
  }, [clubId]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
    toast({
      title: "Data Refreshed",
      description: "Club member dashboard metrics up to date.",
    });
  };

  // -------------------------------------------------------------
  // ANNOUNCEMENTS TAB HANDLERS
  // -------------------------------------------------------------
  const handleCreateAnnouncement = async (isDraft = false) => {
    if (!annForm.title.trim() || !annForm.content.trim()) {
      toast({
        title: "Validation Error",
        description: "Title and content are required.",
        variant: "destructive",
      });
      return;
    }
    setSubmittingAnn(true);
    try {
      if (editingDraftId) {
        // Updating an existing draft
        await clubMemberApi.updateAnnouncement(clubId, editingDraftId, annForm);
        if (isDraft) {
          toast({
            title: "Draft Updated",
            description: "Announcement draft updated successfully.",
          });
          setAnnouncementSubtab("draft");
        } else {
          await clubMemberApi.publishAnnouncementDraft(clubId, editingDraftId);
          toast({
            title: "Announcement Submitted",
            description: "Submitted for Club Admin approval.",
          });
          setAnnouncementSubtab("pending");
        }
      } else {
        if (isDraft) {
          await clubMemberApi.saveAnnouncementDraft(clubId, annForm);
          toast({
            title: "Draft Saved",
            description: "Announcement saved to your personal drafts.",
          });
          setAnnouncementSubtab("draft");
        } else {
          await clubMemberApi.createAnnouncement(clubId, annForm);
          toast({
            title: "Announcement Submitted",
            description: "Submitted for Club Admin approval.",
          });
          setAnnouncementSubtab("pending");
        }
      }
      setEditingDraftId(null);
      setAnnForm({ title: "", content: "" });
      setCreateAnnOpen(false);
      await Promise.all([fetchAnnouncementsData(), fetchDashboardStatsAndFeeds()]);
    } catch (err) {
      toast({
        title: "Error",
        description: err?.message || "Failed to process announcement.",
        variant: "destructive",
      });
    } finally {
      setSubmittingAnn(false);
    }
  };

  const handlePublishAnnDraft = (annId) => {
    setConfirmDialog({
      open: true,
      title: "Submit Draft for Approval?",
      description: "This announcement draft will be sent to the club administration for review.",
      confirmText: "Submit for Approval",
      variant: "default",
      loading: false,
      onConfirm: async () => {
        try {
          await clubMemberApi.publishAnnouncementDraft(clubId, annId);
          toast({
            title: "Draft Submitted",
            description: "Announcement submitted for approval.",
          });
          await Promise.all([fetchAnnouncementsData(), fetchDashboardStatsAndFeeds()]);
          setAnnouncementSubtab("pending");
        } catch (err) {
          toast({
            title: "Submission Failed",
            description: err?.message || "Failed to submit draft.",
            variant: "destructive",
          });
        } finally {
          setConfirmDialog((prev) => ({ ...prev, open: false }));
        }
      },
    });
  };

  const handleDeleteAnnDraft = (annId) => {
    setConfirmDialog({
      open: true,
      title: "Discard Draft Announcement?",
      description: "Are you sure you want to delete this saved draft?",
      confirmText: "Discard Draft",
      variant: "destructive",
      loading: false,
      onConfirm: async () => {
        try {
          await clubMemberApi.deleteAnnouncementDraft(clubId, annId);
          toast({
            title: "Draft Discarded",
            description: "Announcement draft was removed.",
          });
          await fetchAnnouncementsData();
        } catch (err) {
          toast({
            title: "Error",
            description: err?.message || "Failed to delete draft.",
            variant: "destructive",
          });
        } finally {
          setConfirmDialog((prev) => ({ ...prev, open: false }));
        }
      },
    });
  };

  // -------------------------------------------------------------
  // EVENTS TAB HANDLERS
  // -------------------------------------------------------------
  const handleEventImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setEventForm((prev) => ({ ...prev, image: file }));
      setEventImagePreview(URL.createObjectURL(file));
    }
  };

  const handleCreateEvent = async (isDraft = false) => {
    if (!eventForm.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Event title is required.",
        variant: "destructive",
      });
      return;
    }

    setSubmittingEvent(true);
    try {
      const payload = {
        title: eventForm.title.trim(),
        description: eventForm.description.trim(),
        eventType: eventForm.eventType || "OFFLINE",
        isPublic: Boolean(eventForm.isPublic),
        registrationPayment: eventForm.registrationPayment || "FREE",
        registrationStart: eventForm.registrationStart
          ? `${eventForm.registrationStart}:00`
          : null,
        registrationEnd: eventForm.registrationEnd
          ? `${eventForm.registrationEnd}:00`
          : null,
        startTime: eventForm.startTime ? `${eventForm.startTime}:00` : null,
        endTime: eventForm.endTime ? `${eventForm.endTime}:00` : null,
        location:
          typeof eventForm.location === "object"
            ? eventForm.location
            : { address: eventForm.location || "", city: "", state: "", country: "" },
        batchYear: eventForm.batchYear ? parseInt(eventForm.batchYear, 10) : null,
        criteria: eventForm.criteria ? eventForm.criteria.trim() : null,
        eligibility: eventForm.eligibility ? eventForm.eligibility.trim() : null,
        prizeMoney: eventForm.prizeMoney ? parseFloat(eventForm.prizeMoney) : null,
      };

      if (isDraft) {
        await clubMemberApi.saveEventDraft(clubId, payload);
        toast({
          title: "Draft Saved",
          description: "Event proposal draft saved successfully.",
        });
        setEventSubtab("draft");
      } else {
        const formData = new FormData();
        formData.append(
          "eventDto",
          new Blob([JSON.stringify(payload)], { type: "application/json" })
        );
        if (eventForm.image) {
          formData.append("image", eventForm.image);
        } else {
          toast({
            title: "Image Required",
            description: "Please attach a banner image for the event proposal.",
            variant: "destructive",
          });
          setSubmittingEvent(false);
          return;
        }

        await clubMemberApi.createEvent(clubId, formData);
        toast({
          title: "Proposal Submitted",
          description: "Event submitted for club admin approval.",
        });
        setEventSubtab("pending");
      }

      setEventForm({
        title: "",
        description: "",
        eventType: "OFFLINE",
        isPublic: false,
        registrationPayment: "FREE",
        registrationStart: "",
        registrationEnd: "",
        startTime: "",
        endTime: "",
        location: { address: "", city: "", state: "", country: "" },
        batchYear: "",
        criteria: "",
        eligibility: "",
        prizeMoney: "",
        image: null,
      });
      setEventImagePreview(null);
      setCreateEventOpen(false);
      await Promise.all([fetchEventsData(), fetchDashboardStatsAndFeeds()]);
    } catch (err) {
      toast({
        title: "Error",
        description: err?.message || "Failed to submit event.",
        variant: "destructive",
      });
    } finally {
      setSubmittingEvent(false);
    }
  };

  const handlePublishEventDraft = (eventId) => {
    setConfirmDialog({
      open: true,
      title: "Submit Event Draft for Approval?",
      description: "This proposal will be forwarded to the club administration for review and publishing.",
      confirmText: "Submit Proposal",
      variant: "default",
      loading: false,
      onConfirm: async () => {
        try {
          await clubMemberApi.publishEventDraft(clubId, eventId);
          toast({
            title: "Proposal Submitted",
            description: "Event draft submitted for approval.",
          });
          await Promise.all([fetchEventsData(), fetchDashboardStatsAndFeeds()]);
          setEventSubtab("pending");
        } catch (err) {
          toast({
            title: "Submission Failed",
            description: err?.message || "Could not submit event draft.",
            variant: "destructive",
          });
        } finally {
          setConfirmDialog((prev) => ({ ...prev, open: false }));
        }
      },
    });
  };

  const handleDeleteEventDraft = (eventId) => {
    setConfirmDialog({
      open: true,
      title: "Discard Event Draft?",
      description: "Permanently delete this event draft?",
      confirmText: "Discard Draft",
      variant: "destructive",
      loading: false,
      onConfirm: async () => {
        try {
          await clubMemberApi.deleteEventDraft(clubId, eventId);
          toast({
            title: "Draft Discarded",
            description: "Event draft removed.",
          });
          await fetchEventsData();
        } catch (err) {
          toast({
            title: "Error",
            description: err?.message || "Failed to delete draft.",
            variant: "destructive",
          });
        } finally {
          setConfirmDialog((prev) => ({ ...prev, open: false }));
        }
      },
    });
  };

  // -------------------------------------------------------------
  // FILTERED LISTS
  // -------------------------------------------------------------
  const filteredPublishedAnnouncements = useMemo(() => {
    return publishedAnnouncements.filter((a) =>
      a.title?.toLowerCase().includes(announcementSearch.toLowerCase()) ||
      a.content?.toLowerCase().includes(announcementSearch.toLowerCase())
    );
  }, [publishedAnnouncements, announcementSearch]);

  const filteredPendingAnnouncements = useMemo(() => {
    return pendingAnnouncements.filter((a) =>
      a.title?.toLowerCase().includes(announcementSearch.toLowerCase()) ||
      a.content?.toLowerCase().includes(announcementSearch.toLowerCase())
    );
  }, [pendingAnnouncements, announcementSearch]);

  const filteredDraftAnnouncements = useMemo(() => {
    return draftAnnouncements.filter((a) =>
      a.title?.toLowerCase().includes(announcementSearch.toLowerCase()) ||
      a.content?.toLowerCase().includes(announcementSearch.toLowerCase())
    );
  }, [draftAnnouncements, announcementSearch]);

  const filteredPublishedEvents = useMemo(() => {
    return publishedEvents.filter((e) =>
      e.title?.toLowerCase().includes(eventSearch.toLowerCase()) ||
      e.location?.toLowerCase().includes(eventSearch.toLowerCase())
    );
  }, [publishedEvents, eventSearch]);

  const filteredFinishedEvents = useMemo(() => {
    return finishedEvents.filter((e) =>
      e.title?.toLowerCase().includes(eventSearch.toLowerCase()) ||
      e.location?.toLowerCase().includes(eventSearch.toLowerCase())
    );
  }, [finishedEvents, eventSearch]);

  const filteredPendingEvents = useMemo(() => {
    return pendingEvents.filter((e) =>
      e.title?.toLowerCase().includes(eventSearch.toLowerCase()) ||
      e.location?.toLowerCase().includes(eventSearch.toLowerCase())
    );
  }, [pendingEvents, eventSearch]);

  const filteredDraftEvents = useMemo(() => {
    return draftEvents.filter((e) =>
      e.title?.toLowerCase().includes(eventSearch.toLowerCase()) ||
      e.location?.toLowerCase().includes(eventSearch.toLowerCase())
    );
  }, [draftEvents, eventSearch]);

  const filteredMembers = useMemo(() => {
    return membersList.filter((m) => {
      const q = memberSearch.toLowerCase();
      const name = m.studentName || m.fullName || "";
      const email = m.email || "";
      const dept = m.department || "";
      const roll = m.rollNumber || m.studentId || "";
      return (
        name.toLowerCase().includes(q) ||
        email.toLowerCase().includes(q) ||
        dept.toLowerCase().includes(q) ||
        String(roll).toLowerCase().includes(q)
      );
    });
  }, [membersList, memberSearch]);

  const filteredTeams = useMemo(() => {
    return teamsList.filter((t) => {
      const q = teamSearch.toLowerCase();
      return (
        t.name?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q)
      );
    });
  }, [teamsList, teamSearch]);

  // 4 Core Stat Cards Configuration (Unified with Student & Professor Dashboards)
  const statItems = [
    {
      label: "Active Community Followers",
      value: stats.followers ?? 0,
      icon: Users,
      subtitle: "Campus students following updates",
      route: `/campus-connect/club-member/${clubId}/dashboard`,
      color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    },
    {
      label: "Enrolled Club Members",
      value: stats.members ?? 0,
      icon: UserCheck,
      subtitle: "Active registered roster strength",
      route: `/campus-connect/club-member/${clubId}/members`,
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      label: "Operational Wings / Teams",
      value: stats.teams ?? 0,
      icon: Layers,
      subtitle: "Specialized functional wings",
      route: `/campus-connect/club-member/${clubId}/teams`,
      color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    },
    {
      label: "Active & Ongoing Events",
      value: stats.events ?? 0,
      icon: Calendar,
      subtitle: "Live, upcoming & registered",
      route: `/campus-connect/club-member/${clubId}/events`,
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    },
  ];

  if (pageLoading) {
    return (
      <DashboardLayout navItems={updateNavItems()} title="Club Member Portal">
        <PageSkeleton variant="dashboard" />
      </DashboardLayout>
    );
  }

  // -------------------------------------------------------------
  // RENDER
  // -------------------------------------------------------------
  return (
    <DashboardLayout navItems={updateNavItems()} title="Club Member Portal">
      <div className="space-y-5 sm:space-y-6 pb-12 max-w-7xl mx-auto px-2 sm:px-4 w-full min-w-0">
        {/* ========================================================= */}
        {/* TAB 1: DASHBOARD OVERVIEW                                 */}
        {/* ========================================================= */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Hero Header Banner - Ultra-Responsive (Only displayed on Dashboard tab) */}
            <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-card via-card/90 to-primary/5 p-4 sm:p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                  <Avatar className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-2 border-primary/30 shadow-xs shrink-0">
                    <AvatarFallback className="rounded-2xl bg-primary/20 text-primary font-bold text-xl">
                      {clubName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-foreground truncate">
                        {clubName}
                      </h1>
                      <Badge variant="secondary" className="text-[10px] sm:text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5">
                        Enrolled Member
                      </Badge>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
                      Active member portal: browse announcements, propose events, and view team rosters.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center shrink-0 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-8 sm:h-9 px-3 border border-border/80 hover:border-primary/40 hover:bg-muted/60 text-foreground gap-1.5 shadow-xs"
                    onClick={() => setReturnDialogOpen(true)}
                    title="Return to Student Dashboard"
                  >
                    <GraduationCap className="w-3.5 h-3.5 text-primary" />
                    <span>Return to Student</span>
                  </Button>
                </div>
              </div>
            </div>
            {/* 4 Core Stat Cards - Exact Dashboard Unified Anatomy */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 w-full">
              {statItems.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <Card
                    key={idx}
                    className="border-border/70 bg-card/80 backdrop-blur-xs hover:border-primary/40 hover:shadow-xs active:scale-[0.98] transition-all cursor-pointer group rounded-xl sm:rounded-2xl w-full min-w-0 overflow-hidden relative"
                    onClick={() => {
                      if (stat.route) {
                        const tabKey = stat.route.split("/").pop();
                        if (tabKey === "dashboard") {
                          // Already on dashboard
                        } else {
                          handleTabChange(tabKey);
                        }
                      }
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
                          {Number(stat.value || 0).toLocaleString()}
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

            {/* Recent Feeds: 2 Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Events (Fetch & Show 5) */}
              <Card className="rounded-2xl border-border/60 shadow-xs flex flex-col">
                <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border/50 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      Recent Events
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Latest 5 campus and global activities
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTabChange("events")}
                    className="h-8 text-xs font-semibold text-primary hover:text-primary/90"
                  >
                    View All
                    <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </CardHeader>
                <CardContent className="p-4 sm:p-5 flex-1">
                  {recentEvents.length === 0 ? (
                    <EmptyState
                      title="No Events Scheduled"
                      desc="No active or upcoming events scheduled for this club yet."
                      icon={<CalendarX className="w-8 h-8 text-muted-foreground/60" />}
                    />
                  ) : (
                    <div className="space-y-3">
                      {recentEvents.map((evt) => {
                        const isGlobal = Boolean(evt.isGlobal || evt.global || evt.state >= 5);
                        return (
                          <div
                            key={evt.id}
                            className="p-3.5 rounded-xl border border-border/50 bg-card hover:bg-muted/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div className="min-w-0 space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-xs sm:text-sm font-bold text-foreground truncate">
                                  {evt.title}
                                </h4>
                                {isGlobal ? (
                                  <Badge variant="default" className="text-[10px] font-semibold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1">
                                    <Globe className="w-3 h-3" />
                                    Global
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary" className="text-[10px] font-semibold flex items-center gap-1">
                                    <Building2 className="w-3 h-3" />
                                    Campus
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
                                {evt.startTime && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-primary" />
                                    {new Date(evt.startTime).toLocaleDateString()}
                                  </span>
                                )}
                                {evt.location && (
                                  <span className="flex items-center gap-1 truncate max-w-[180px]">
                                    <MapPin className="w-3 h-3 text-muted-foreground" />
                                    {evt.location}
                                  </span>
                                )}
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                navigate(`/campus-connect/club-member/${clubId}/events/${evt.id}`)
                              }
                              className="h-7 text-[11px] px-2.5 shrink-0 self-end sm:self-center"
                            >
                              Details
                              <ChevronRight className="w-3 h-3 ml-1" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Announcements (Fetch & Show 5) */}
              <Card className="rounded-2xl border-border/60 shadow-xs flex flex-col">
                <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border/50 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <Megaphone className="w-4 h-4 text-primary" />
                      Recent Announcements
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Latest 5 campus bulletins and updates
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTabChange("announcements")}
                    className="h-8 text-xs font-semibold text-primary hover:text-primary/90"
                  >
                    View All
                    <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </CardHeader>
                <CardContent className="p-4 sm:p-5 flex-1">
                  {recentAnnouncements.length === 0 ? (
                    <EmptyState
                      title="No Announcements"
                      desc="No recent bulletins or announcements published."
                      icon={<BellOff className="w-8 h-8 text-muted-foreground/60" />}
                    />
                  ) : (
                    <div className="space-y-3">
                      {recentAnnouncements.map((ann) => (
                        <div
                          key={ann.id}
                          className="p-3.5 rounded-xl border border-border/50 bg-card hover:bg-muted/40 transition-all space-y-1.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-xs sm:text-sm font-bold text-foreground truncate">
                              {ann.title}
                            </h4>
                            {ann.createdAt && (
                              <span className="text-[10px] text-muted-foreground shrink-0">
                                {new Date(ann.createdAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {ann.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: ANNOUNCEMENTS                                      */}
        {/* ========================================================= */}
        {activeTab === "announcements" && (
          <div className="space-y-4 sm:space-y-5">
            {/* Page Title Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
              <div className="flex items-start justify-between gap-3 min-w-0">
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-foreground">
                    Announcements & Notices
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
                    View club-wide updates and notices from administrators, or draft an announcement proposal.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingDraftId(null);
                    setAnnForm({ title: "", content: "" });
                    setCreateAnnOpen(true);
                  }}
                  className="sm:hidden h-8 text-xs font-semibold shadow-xs gap-1 px-2.5 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Draft</span>
                </Button>
              </div>

              <div className="hidden sm:flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingDraftId(null);
                    setAnnForm({ title: "", content: "" });
                    setCreateAnnOpen(true);
                  }}
                  className="h-9 text-xs font-semibold shadow-xs gap-1.5 px-3.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Draft Announcement</span>
                </Button>
              </div>
            </div>

            {/* Filter Bar: Search and Subtabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-0.5">
              <div className="relative w-full sm:max-w-xs md:max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Search announcements..."
                  value={announcementSearch}
                  onChange={(e) => setAnnouncementSearch(e.target.value)}
                  className="pl-9 text-xs sm:text-sm h-9 rounded-xl border-border/70 bg-background w-full"
                />
              </div>

              {/* 3 Subtabs: 2-column grid on mobile, inline-flex on desktop */}
              <div className="grid grid-cols-2 sm:flex sm:items-center gap-1.5 sm:gap-1 p-1 bg-muted/60 dark:bg-muted/40 rounded-xl border border-border/60 w-full sm:w-auto shrink-0">
                <button
                  type="button"
                  onClick={() => setAnnouncementSubtab("published")}
                  className={`w-full sm:w-auto px-3 py-2 sm:py-1.5 text-xs sm:text-sm rounded-lg font-semibold transition-all text-center justify-center flex items-center ${
                    announcementSubtab === "published"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                  }`}
                >
                  Published
                </button>

                <button
                  type="button"
                  onClick={() => setAnnouncementSubtab("pending")}
                  className={`w-full sm:w-auto px-3 py-2 sm:py-1.5 text-xs sm:text-sm rounded-lg font-semibold transition-all text-center justify-center flex items-center ${
                    announcementSubtab === "pending"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                  }`}
                >
                  Pending Approval
                </button>

                <button
                  type="button"
                  onClick={() => setAnnouncementSubtab("draft")}
                  className={`col-span-2 sm:col-span-1 w-full sm:w-auto px-3 py-2 sm:py-1.5 text-xs sm:text-sm rounded-lg font-semibold transition-all text-center justify-center flex items-center ${
                    announcementSubtab === "draft"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                  }`}
                >
                  My Drafts
                </button>
              </div>
            </div>

            {/* Subtab 1: Published Announcements */}
            {announcementSubtab === "published" && (
              <div className="space-y-3">
                {filteredPublishedAnnouncements.length === 0 ? (
                  <Card className="border-dashed border-border/80">
                    <CardContent className="py-12">
                      <EmptyState
                        title="No Published Announcements"
                        desc="There are currently no active announcements published for this club."
                        icon={<BellOff className="w-8 h-8 text-muted-foreground/60" />}
                      />
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {filteredPublishedAnnouncements.map((ann) => (
                      <Card key={ann.id} className="border-border/80 shadow-xs hover:border-primary/30 transition-colors">
                        <CardContent className="p-4 sm:p-5 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 mt-0.5">
                                <Megaphone className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-sm sm:text-base font-bold text-foreground leading-snug break-words">
                                  {ann.title}
                                </h4>
                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                  {ann.clubName || clubName || "Campus Club"}
                                </p>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-[10px] font-semibold shrink-0">
                              Published
                            </Badge>
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-3 whitespace-pre-line break-words pl-0 sm:pl-10.5">
                            {ann.content}
                          </p>
                          <div className="pt-2 text-[11px] text-muted-foreground flex flex-wrap items-center justify-between gap-1 border-t border-border/50">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setViewAnnouncement(ann)}
                              className="h-8 text-xs gap-1.5"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              View Full Details
                            </Button>
                            <span>{ann.createdAt ? new Date(ann.createdAt).toLocaleString() : ""}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Subtab 2: Pending Approval */}
            {announcementSubtab === "pending" && (
              <div className="space-y-3">
                {filteredPendingAnnouncements.length === 0 ? (
                  <Card className="border-dashed border-border/80">
                    <CardContent className="py-12">
                      <EmptyState
                        title="No Pending Announcements"
                        desc="You don't have any announcements waiting for approval."
                        icon={<ShieldCheck className="w-8 h-8 text-muted-foreground/60" />}
                      />
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {filteredPendingAnnouncements.map((ann) => (
                      <Card key={ann.id} className="border-border/80 shadow-xs hover:border-primary/30 transition-colors">
                        <CardContent className="p-4 sm:p-5 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 mt-0.5">
                                <Megaphone className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-sm sm:text-base font-bold text-foreground leading-snug break-words">
                                  {ann.title}
                                </h4>
                                <span className="text-[11px] text-muted-foreground block">
                                  Submitted on {ann.createdAt ? new Date(ann.createdAt).toLocaleString() : "Recently"}
                                </span>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-[10px] font-semibold text-amber-600 bg-amber-500/10 border-amber-500/20 shrink-0">
                              Awaiting Approval
                            </Badge>
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-3 whitespace-pre-line break-words pl-0 sm:pl-10.5">
                            {ann.content}
                          </p>
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border/50">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setViewAnnouncement(ann)}
                              className="h-8 text-xs gap-1.5"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              View Full Details
                            </Button>
                            <span className="text-[11px] text-amber-600 dark:text-amber-400">
                              Sent to Club Admin & Mentor for verification
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Subtab 3: My Drafts */}
            {announcementSubtab === "draft" && (
              <div className="space-y-3">
                {filteredDraftAnnouncements.length === 0 ? (
                  <Card className="border-dashed border-border/80">
                    <CardContent className="py-12">
                      <EmptyState
                        title="No Saved Drafts"
                        desc="You have not saved any announcement drafts."
                        icon={<FileText className="w-8 h-8 text-muted-foreground/60" />}
                      />
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {filteredDraftAnnouncements.map((ann) => (
                      <Card key={ann.id} className="border-border/80 shadow-xs hover:border-primary/30 transition-colors">
                        <CardContent className="p-4 sm:p-5 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
                                <FileText className="w-4 h-4" />
                              </div>
                              <div className="space-y-0.5 min-w-0">
                                <h4 className="text-sm sm:text-base font-bold text-foreground break-words leading-snug">
                                  {ann.title}
                                </h4>
                                <span className="text-[11px] text-muted-foreground block">
                                  Draft saved on {ann.createdAt ? new Date(ann.createdAt).toLocaleDateString() : "Recently"}
                                </span>
                              </div>
                            </div>
                            <Badge variant="secondary" className="text-[10px] font-semibold shrink-0">
                              Member Draft
                            </Badge>
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-3 whitespace-pre-line break-words pl-0 sm:pl-10.5">
                            {ann.content}
                          </p>
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border/50">
                            <div className="flex items-center gap-1.5">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteAnnDraft(ann.id)}
                                className="text-xs h-8 font-medium"
                              >
                                <Trash2 className="w-3.5 h-3.5 mr-1" />
                                Discard
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingDraftId(ann.id);
                                  setAnnForm({ title: ann.title || "", content: ann.content || "" });
                                  setCreateAnnOpen(true);
                                }}
                                className="text-xs h-8 gap-1.5"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                Edit Draft
                              </Button>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setViewAnnouncement(ann)}
                                className="text-xs h-8 gap-1.5"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                View Full Details
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handlePublishAnnDraft(ann.id)}
                                className="text-xs h-8 font-semibold shadow-xs"
                              >
                                <Send className="w-3.5 h-3.5 mr-1" />
                                Submit for Approval
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: EVENTS                                             */}
        {/* ========================================================= */}
        {activeTab === "events" && (
          <div className="space-y-4 sm:space-y-5">
            {/* Page Title Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
              <div className="flex items-start justify-between gap-3 min-w-0">
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-foreground">
                    Club Events & Proposals
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
                    Browse upcoming club activities, workshops, competitions, or propose a new event initiative.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    setEventForm({
                      title: "",
                      description: "",
                      eventType: "OFFLINE",
                      isPublic: false,
                      registrationPayment: "FREE",
                      registrationStart: "",
                      registrationEnd: "",
                      startTime: "",
                      endTime: "",
                      location: { address: "", city: "", state: "", country: "" },
                      batchYear: "",
                      criteria: "",
                      eligibility: "",
                      prizeMoney: "",
                      image: null,
                    });
                    setEventImagePreview(null);
                    setCreateEventOpen(true);
                  }}
                  className="sm:hidden h-8 text-xs font-semibold shadow-xs gap-1 px-2.5 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Propose</span>
                </Button>
              </div>

              <div className="hidden sm:flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  onClick={() => {
                    setEventForm({
                      title: "",
                      description: "",
                      eventType: "OFFLINE",
                      isPublic: false,
                      registrationPayment: "FREE",
                      registrationStart: "",
                      registrationEnd: "",
                      startTime: "",
                      endTime: "",
                      location: { address: "", city: "", state: "", country: "" },
                      batchYear: "",
                      criteria: "",
                      eligibility: "",
                      prizeMoney: "",
                      image: null,
                    });
                    setEventImagePreview(null);
                    setCreateEventOpen(true);
                  }}
                  className="h-9 text-xs font-semibold shadow-xs gap-1.5 px-3.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Propose Event</span>
                </Button>
              </div>
            </div>

            {/* Filter Bar: Search and Subtabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-0.5">
              <div className="relative w-full sm:max-w-xs md:max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Search events by title or venue..."
                  value={eventSearch}
                  onChange={(e) => setEventSearch(e.target.value)}
                  className="pl-9 text-xs sm:text-sm h-9 rounded-xl border-border/70 bg-background w-full"
                />
              </div>

              {/* 4 Subtabs: 2x2 grid on mobile, inline-flex on desktop */}
              <div className="grid grid-cols-2 sm:flex sm:items-center gap-1.5 sm:gap-1 p-1 bg-muted/60 dark:bg-muted/40 rounded-xl border border-border/60 w-full sm:w-auto shrink-0">
                <button
                  type="button"
                  onClick={() => setEventSubtab("published")}
                  className={`w-full sm:w-auto px-3 py-2 sm:py-1.5 text-xs sm:text-sm rounded-lg font-semibold transition-all text-center justify-center flex items-center ${
                    eventSubtab === "published"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                  }`}
                >
                  Published
                </button>

                <button
                  type="button"
                  onClick={() => setEventSubtab("finished")}
                  className={`w-full sm:w-auto px-3 py-2 sm:py-1.5 text-xs sm:text-sm rounded-lg font-semibold transition-all text-center justify-center flex items-center ${
                    eventSubtab === "finished"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                  }`}
                >
                  Finished
                </button>

                <button
                  type="button"
                  onClick={() => setEventSubtab("pending")}
                  className={`w-full sm:w-auto px-3 py-2 sm:py-1.5 text-xs sm:text-sm rounded-lg font-semibold transition-all text-center justify-center flex items-center ${
                    eventSubtab === "pending"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                  }`}
                >
                  Pending Approval
                </button>

                <button
                  type="button"
                  onClick={() => setEventSubtab("draft")}
                  className={`w-full sm:w-auto px-3 py-2 sm:py-1.5 text-xs sm:text-sm rounded-lg font-semibold transition-all text-center justify-center flex items-center ${
                    eventSubtab === "draft"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                  }`}
                >
                  My Drafts
                </button>
              </div>
            </div>

          {/* Subtab 1: Published Events */}
            {eventSubtab === "published" && (
              <div>
                {filteredPublishedEvents.length === 0 ? (
                  <EmptyState
                    title="No Published Events"
                    desc="There are currently no active published events for this club."
                    icon={<CalendarX className="w-8 h-8 text-muted-foreground/60" />}
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredPublishedEvents.map((evt) => {
                      const isGlobal = Boolean(evt.isGlobal || evt.global || evt.state >= 5);
                      return (
                        <Card key={evt.id} className="rounded-2xl border-border/60 hover:border-border transition-all shadow-xs overflow-hidden flex flex-col justify-between">
                          {evt.imageUrl && (
                            <div className="h-36 w-full overflow-hidden bg-muted/40">
                              <img
                                src={evt.imageUrl}
                                alt={evt.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <CardHeader className="p-4 pb-2">
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              {isGlobal ? (
                                <Badge variant="default" className="text-[10px] font-semibold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1">
                                  <Globe className="w-3 h-3" />
                                  Global Event
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-[10px] font-semibold flex items-center gap-1">
                                  <Building2 className="w-3 h-3" />
                                  Campus Event
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-[10px] text-emerald-600 bg-emerald-500/10 border-emerald-500/20">
                                Live
                              </Badge>
                            </div>
                            <CardTitle className="text-sm font-bold text-foreground line-clamp-1">
                              {evt.title}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-4 pt-1 space-y-2 flex-1">
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {evt.description}
                            </p>
                            <div className="space-y-1 text-[11px] text-muted-foreground pt-1">
                              {evt.startTime && (
                                <div className="flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                                  <span>{new Date(evt.startTime).toLocaleString()}</span>
                                </div>
                              )}
                              {evt.location && (
                                <div className="flex items-center gap-1.5">
                                  <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                  <span className="truncate">{evt.location}</span>
                                </div>
                              )}
                            </div>
                          </CardContent>
                          <div className="p-3 bg-muted/20 border-t border-border/40 flex items-center justify-end">
                            <Button
                              size="sm"
                              onClick={() =>
                                navigate(`/campus-connect/club-member/${clubId}/events/${evt.id}`)
                              }
                              className="h-7 text-xs font-semibold px-3"
                            >
                              Event Details
                              <ChevronRight className="w-3.5 h-3.5 ml-1" />
                            </Button>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Subtab 2: Finished Events */}
            {eventSubtab === "finished" && (
              <div>
                {filteredFinishedEvents.length === 0 ? (
                  <EmptyState
                    title="No Finished Events"
                    desc="No completed past events found for this club."
                    icon={<CalendarX className="w-8 h-8 text-muted-foreground/60" />}
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredFinishedEvents.map((evt) => (
                      <Card key={evt.id} className="rounded-2xl border-border/60 shadow-xs flex flex-col justify-between">
                        <CardHeader className="p-4 pb-2">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <Badge variant="outline" className="text-[10px] text-muted-foreground">
                              Finished
                            </Badge>
                            {evt.endTime && (
                              <span className="text-[10px] text-muted-foreground">
                                {new Date(evt.endTime).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <CardTitle className="text-sm font-bold text-foreground line-clamp-1">
                            {evt.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-1 flex-1">
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {evt.description}
                          </p>
                        </CardContent>
                        <div className="p-3 bg-muted/20 border-t border-border/40 flex items-center justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              navigate(`/campus-connect/club-member/${clubId}/events/${evt.id}`)
                            }
                            className="h-7 text-xs font-semibold"
                          >
                            View Summary
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Subtab 3: Pending Approval */}
            {eventSubtab === "pending" && (
              <div>
                {filteredPendingEvents.length === 0 ? (
                  <EmptyState
                    title="No Pending Proposals"
                    desc="You haven't submitted any event proposals that are waiting for approval."
                    icon={<ShieldCheck className="w-8 h-8 text-muted-foreground/60" />}
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredPendingEvents.map((evt) => (
                      <Card key={evt.id} className="rounded-2xl border-amber-500/30 bg-amber-500/5 shadow-xs flex flex-col justify-between">
                        <CardHeader className="p-4 pb-2">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <Badge variant="outline" className="text-[10px] bg-amber-500/15 text-amber-600 border-amber-500/30">
                              Under Review
                            </Badge>
                          </div>
                          <CardTitle className="text-sm font-bold text-foreground">
                            {evt.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-1 flex-1 space-y-2">
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {evt.description}
                          </p>
                          <div className="p-2 rounded-lg bg-background/60 border border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-400">
                            Sent to Club Admin & Mentor for institutional review.
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Subtab 4: My Drafts */}
            {eventSubtab === "draft" && (
              <div>
                {filteredDraftEvents.length === 0 ? (
                  <EmptyState
                    title="No Event Drafts"
                    desc="You do not have any saved event drafts."
                    icon={<FileText className="w-8 h-8 text-muted-foreground/60" />}
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredDraftEvents.map((evt) => (
                      <Card key={evt.id} className="rounded-2xl border-border/60 shadow-xs flex flex-col justify-between">
                        <CardHeader className="p-4 pb-2">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <Badge variant="secondary" className="text-[10px]">
                              Draft
                            </Badge>
                          </div>
                          <CardTitle className="text-sm font-bold text-foreground">
                            {evt.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-1 flex-1">
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {evt.description}
                          </p>
                          {evt.location && (
                            <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {evt.location}
                            </p>
                          )}
                        </CardContent>
                        <div className="p-3 bg-muted/20 border-t border-border/40 flex items-center justify-between">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteEventDraft(evt.id)}
                            className="h-7 text-xs text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1" />
                            Discard
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handlePublishEventDraft(evt.id)}
                            className="h-7 text-xs font-semibold shadow-xs"
                          >
                            <Send className="w-3.5 h-3.5 mr-1" />
                            Submit Proposal
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: MEMBERS (READ-ONLY)                                */}
        {/* ========================================================= */}
        {activeTab === "members" && (
          <div className="space-y-5">
            {/* Page Title Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4 pb-1">
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                    Club Members Directory
                  </h1>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  View fellow members, club leadership coordinators, and peer contributors.
                </p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search members by name, roll, department..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="pl-9 text-xs sm:text-sm h-9 rounded-xl border-border/70 bg-background"
                />
              </div>
            </div>

            {/* Members Directory */}
            {filteredMembers.length === 0 ? (
              <EmptyState
                title="No Members Found"
                desc={memberSearch ? "No members match your search criteria." : "No members have enrolled into this club yet."}
                icon={<UserX className="w-8 h-8 text-muted-foreground/60" />}
              />
            ) : (
              <Card className="rounded-2xl border-border/60 shadow-xs overflow-hidden">
                <div className="divide-y divide-border/60">
                  {filteredMembers.map((member) => {
                    const studentName = member.studentName || member.fullName || "Student Member";
                    const studentId = member.studentId || member.id;
                    const role = member.role || "MEMBER";
                    const email = member.email || "";

                    return (
                      <div
                        key={member.id || studentId}
                        className="p-3.5 sm:p-4 flex items-center justify-between gap-4 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar className="w-10 h-10 rounded-xl border border-border shrink-0">
                            {member.avatarUrl || member.image || member.avatar ? (
                              <AvatarImage
                                src={member.avatarUrl || member.image || member.avatar}
                                alt={studentName}
                                className="object-cover"
                              />
                            ) : null}
                            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs rounded-xl">
                              {studentName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-bold text-foreground truncate">
                              {studentName}
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate">
                              {email || member.rollNumber || "Enrolled Student"}
                            </p>
                          </div>
                        </div>

                        <Badge
                          variant={role === "ADMIN" || role === "PRESIDENT" ? "default" : "secondary"}
                          className="text-[10px] font-semibold uppercase px-2 py-0.5 shrink-0"
                        >
                          {role}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: TEAMS (READ-ONLY)                                  */}
        {/* ========================================================= */}
        {activeTab === "teams" && (
          <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4 pb-1">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  Teams
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  View teams and their members
                </p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search teams..."
                  value={teamSearch}
                  onChange={(e) => setTeamSearch(e.target.value)}
                  className="pl-9 text-xs sm:text-sm h-9 rounded-xl border-border/70 bg-background"
                />
              </div>
            </div>

            {/* Teams Grid */}
            {filteredTeams.length === 0 ? (
              <EmptyState
                title="No Teams Found"
                desc={
                  teamSearch
                    ? `No teams matching "${teamSearch}".`
                    : "Your club doesn't have any teams yet."
                }
                icon={<UsersRound className="w-8 h-8 text-muted-foreground/60" />}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredTeams.map((team) => {
                  const members = team.members || [];
                  return (
                    <Card
                      key={team.id || team.name}
                      className="rounded-2xl border-border/60 shadow-xs flex flex-col justify-between"
                    >
                      <CardHeader className="p-4 sm:p-5 pb-2">
                        <div className="min-w-0">
                          <CardTitle className="text-base font-bold text-foreground truncate">
                            {team.name}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                            {team.description || "No description provided."}
                          </p>
                        </div>
                        <div className="mt-2.5">
                          <Badge variant="secondary" className="text-[10px] font-semibold">
                            {team.membersCount || members.length} members
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="p-4 sm:p-5 pt-2 flex-1 space-y-2">
                        {members.length === 0 ? (
                          <p className="text-xs text-muted-foreground italic py-2">
                            No members in this team
                          </p>
                        ) : (
                          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                            {members.map((m) => {
                              const studentName = m.studentName || m.fullName || "Student Member";
                              const studentId = m.studentId || m.id;
                              return (
                                <div
                                  key={studentId || m.email}
                                  className="bg-muted/40 px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium truncate"
                                >
                                  {studentName}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* DIALOGS SECTION                                           */}
        {/* ========================================================= */}

        {/* 1. Dialog: Create/Edit Announcement */}
        <Dialog open={createAnnOpen} onOpenChange={(open) => {
          setCreateAnnOpen(open);
          if (!open) setEditingDraftId(null);
        }}>
          <DialogContent className="w-[95vw] sm:max-w-lg rounded-2xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg font-bold">
                {editingDraftId ? "Edit Announcement Draft" : "Draft Club Announcement"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {editingDraftId
                  ? "Update your saved draft announcement."
                  : `Prepare an announcement for review by ${clubName} admins.`}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Announcement Title *</Label>
                <Input
                  value={annForm.title}
                  onChange={(e) => setAnnForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Study Group Sessions Starting"
                  className="text-xs sm:text-sm h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Content / Body *</Label>
                <MarkdownEditor
                  value={annForm.content}
                  onChange={(val) => setAnnForm((prev) => ({ ...prev, content: val }))}
                  placeholder="Describe the update, timeline, links, instructions in Markdown..."
                  rows={6}
                />
              </div>
              <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-3 border-t border-border/60">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingDraftId(null);
                    setCreateAnnOpen(false);
                  }}
                  className="text-xs h-9"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={submittingAnn}
                  onClick={() => handleCreateAnnouncement(true)}
                  className="text-xs h-9 font-medium"
                >
                  {editingDraftId ? "Update Draft" : "Save as Draft"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={submittingAnn}
                  onClick={() => handleCreateAnnouncement(false)}
                  className="text-xs h-9 font-semibold shadow-xs"
                >
                  <Send className="w-3.5 h-3.5 mr-1" />
                  {submittingAnn ? "Submitting..." : "Submit for Approval"}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

        {/* 1.1 Dialog: View Full Announcement Details */}
        <Dialog
          open={!!viewAnnouncement}
          onOpenChange={(open) => !open && setViewAnnouncement(null)}
        >
          <DialogContent className="max-h-[90vh] max-w-lg w-full overflow-y-auto rounded-2xl p-4 sm:p-6">
            <DialogHeader>
              <div className="space-y-1">
                <Badge
                  variant="outline"
                  className="text-xs font-semibold bg-primary/5 text-primary border-primary/20 mb-1"
                >
                  {viewAnnouncement?.clubName || clubName || "Campus Club Announcement"}
                </Badge>
                <DialogTitle className="text-lg sm:text-xl font-bold text-foreground">
                  {viewAnnouncement?.title}
                </DialogTitle>
                <DialogDescription className="sr-only">Announcement details</DialogDescription>
              </div>
            </DialogHeader>

            {viewAnnouncement && (
              <div className="space-y-4 pt-2 text-sm">
                <div className="flex items-center gap-2 text-xs text-muted-foreground border-b border-border/60 pb-2">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  <span>
                    {viewAnnouncement.createdAt
                      ? new Date(viewAnnouncement.createdAt).toLocaleString()
                      : "Recently"}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                    Official Notice & Content
                  </h4>
                  <MarkdownViewer
                    content={viewAnnouncement.content || viewAnnouncement.message || viewAnnouncement.description}
                  />
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* 2. Dialog: Propose Event */}
        <Dialog open={createEventOpen} onOpenChange={setCreateEventOpen}>
          <DialogContent className="w-[95vw] sm:max-w-2xl rounded-2xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg font-bold">
                Propose New Event
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Submit an event proposal for review by {clubName} admins.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Event Title *</Label>
                <Input
                  value={eventForm.title}
                  onChange={(e) => setEventForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Peer Mentorship Workshop"
                  className="text-xs sm:text-sm h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Description</Label>
                <Textarea
                  value={eventForm.description}
                  onChange={(e) => setEventForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Overview, schedule, agenda, topics..."
                  rows={3}
                  className="text-xs sm:text-sm"
                />
              </div>

              {/* Event Type & Visibility & Payment Type */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Event Type</Label>
                  <Select
                    value={eventForm.eventType}
                    onValueChange={(val) => setEventForm((prev) => ({ ...prev, eventType: val }))}
                  >
                    <SelectTrigger className="h-9 text-xs sm:text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OFFLINE">Offline (In-Person)</SelectItem>
                      <SelectItem value="ONLINE">Online (Virtual)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Registration Type</Label>
                  <Select
                    value={eventForm.registrationPayment}
                    onValueChange={(val) => setEventForm((prev) => ({ ...prev, registrationPayment: val }))}
                  >
                    <SelectTrigger className="h-9 text-xs sm:text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FREE">Free Event</SelectItem>
                      <SelectItem value="PAID">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Visibility Scope</Label>
                  <div className="flex items-center h-9 px-2 rounded-lg border border-border/70 bg-background">
                    <label className="flex items-center gap-2 text-xs cursor-pointer w-full">
                      <input
                        type="checkbox"
                        checked={eventForm.isPublic}
                        onChange={(e) => setEventForm((prev) => ({ ...prev, isPublic: e.target.checked }))}
                        className="rounded border-border text-primary"
                      />
                      <span>Global (All Campuses)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Start & End Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Start Date & Time</Label>
                  <Input
                    type="datetime-local"
                    value={eventForm.startTime}
                    onChange={(e) => setEventForm((prev) => ({ ...prev, startTime: e.target.value }))}
                    className="text-xs h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">End Date & Time</Label>
                  <Input
                    type="datetime-local"
                    value={eventForm.endTime}
                    onChange={(e) => setEventForm((prev) => ({ ...prev, endTime: e.target.value }))}
                    className="text-xs h-9"
                  />
                </div>
              </div>

              {/* Registration Window */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Registration Start</Label>
                  <Input
                    type="datetime-local"
                    value={eventForm.registrationStart}
                    onChange={(e) => setEventForm((prev) => ({ ...prev, registrationStart: e.target.value }))}
                    className="text-xs h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Registration Deadline</Label>
                  <Input
                    type="datetime-local"
                    value={eventForm.registrationEnd}
                    onChange={(e) => setEventForm((prev) => ({ ...prev, registrationEnd: e.target.value }))}
                    className="text-xs h-9"
                  />
                </div>
              </div>

              {/* Location Fields */}
              <div className="p-3 rounded-xl border border-border/60 bg-muted/20 space-y-2.5">
                <p className="text-xs font-bold text-foreground">Location & Venue Details</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">Address / Campus Venue</Label>
                    <Input
                      placeholder="e.g. Hall 401 / Lab 2"
                      value={typeof eventForm.location === "object" ? eventForm.location.address : eventForm.location}
                      onChange={(e) =>
                        setEventForm((prev) => ({
                          ...prev,
                          location: {
                            ...(typeof prev.location === "object" ? prev.location : {}),
                            address: e.target.value,
                          },
                        }))
                      }
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">City</Label>
                    <Input
                      placeholder="City"
                      value={typeof eventForm.location === "object" ? eventForm.location.city || "" : ""}
                      onChange={(e) =>
                        setEventForm((prev) => ({
                          ...prev,
                          location: {
                            ...(typeof prev.location === "object" ? prev.location : {}),
                            city: e.target.value,
                          },
                        }))
                      }
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">State</Label>
                    <Input
                      placeholder="State"
                      value={typeof eventForm.location === "object" ? eventForm.location.state || "" : ""}
                      onChange={(e) =>
                        setEventForm((prev) => ({
                          ...prev,
                          location: {
                            ...(typeof prev.location === "object" ? prev.location : {}),
                            state: e.target.value,
                          },
                        }))
                      }
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">Country</Label>
                    <Input
                      placeholder="Country"
                      value={typeof eventForm.location === "object" ? eventForm.location.country || "" : ""}
                      onChange={(e) =>
                        setEventForm((prev) => ({
                          ...prev,
                          location: {
                            ...(typeof prev.location === "object" ? prev.location : {}),
                            country: e.target.value,
                          },
                        }))
                      }
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Extra Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Prize Pool (₹)</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 10000"
                    value={eventForm.prizeMoney}
                    onChange={(e) => setEventForm((prev) => ({ ...prev, prizeMoney: e.target.value }))}
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Target Batch Year</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 2026"
                    value={eventForm.batchYear}
                    onChange={(e) => setEventForm((prev) => ({ ...prev, batchYear: e.target.value }))}
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Eligibility</Label>
                  <Input
                    placeholder="e.g. Open to all members"
                    value={eventForm.eligibility}
                    onChange={(e) => setEventForm((prev) => ({ ...prev, eligibility: e.target.value }))}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              {/* Banner Image */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Event Banner Image *</Label>
                <div className="flex items-center gap-3">
                  {eventImagePreview && (
                    <img
                      src={eventImagePreview}
                      alt="Banner Preview"
                      className="w-16 h-12 object-cover rounded-lg border border-border shrink-0"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleEventImageSelect}
                    className="text-xs text-muted-foreground file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                  />
                </div>
              </div>

              <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-3 border-t border-border/60">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCreateEventOpen(false)}
                  className="text-xs h-9"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={submittingEvent}
                  onClick={() => handleCreateEvent(true)}
                  className="text-xs h-9 font-medium"
                >
                  Save as Draft
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={submittingEvent}
                  onClick={() => handleCreateEvent(false)}
                  className="text-xs h-9 font-semibold shadow-xs"
                >
                  <Send className="w-3.5 h-3.5 mr-1" />
                  {submittingEvent ? "Submitting..." : "Submit Proposal"}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

        {/* 3. Global Action Confirmation Dialog */}
        <ConfirmDialog
          open={confirmDialog.open}
          onOpenChange={(val) => setConfirmDialog((prev) => ({ ...prev, open: val }))}
          title={confirmDialog.title}
          description={confirmDialog.description}
          confirmText={confirmDialog.confirmText}
          variant={confirmDialog.variant}
          loading={confirmDialog.loading}
          onConfirm={confirmDialog.onConfirm}
        />

        {/* 4. Sub-Dashboard Return to Student Dialog */}
        <SubDashboardLoginDialog
          open={returnDialogOpen}
          onOpenChange={setReturnDialogOpen}
          title="Return to Student Dashboard"
          description="Enter your registered student password to verify and restore your student session."
          icon={GraduationCap}
          onSubmit={handleReturnToStudent}
          loading={returnLoading}
          error={returnError}
        />
      </div>
    </DashboardLayout>
  );
}
