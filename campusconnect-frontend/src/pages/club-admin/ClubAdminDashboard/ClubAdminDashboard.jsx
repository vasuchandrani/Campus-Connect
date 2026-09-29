import "./ClubAdminDashboard.css";
import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
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
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../../components/ui/Select";
import {
  LayoutDashboard,
  Megaphone,
  Calendar,
  CalendarDays,
  Users,
  UserCheck,
  UsersRound,
  UserPlus,
  Layers,
  Settings as SettingsIcon,
  Heart,
  Clock,
  MapPin,
  Globe,
  Building2,
  Upload,
  Plus,
  Search,
  Trash2,
  Edit3,
  CheckCircle2,
  XCircle,
  Send,
  KeyRound,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  FileText,
  Sparkles,
  ArrowLeft,
  ArrowUpRight,
  MoreVertical,
  ArrowRight,
  BellOff,
  CalendarX,
  UserX,
  Download,
  GraduationCap,
  Eye,
  Edit2,
} from "lucide-react";
import { clubAdminNavItems } from "../../../config/Navigation";
import { useAuth } from "../../../contexts/AuthContext";
import EmptyState from "../../../components/ui/EmptyState";
import PageSkeleton from "../../../components/ui/PageSkeleton";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import SubDashboardLoginDialog from "../../../components/dashboard/SubDashboardLoginDialog";
import { clubAdminApi, securityApi } from "../../../services/api";
import { toast } from "../../../hooks/use-toast";

export default function ClubAdminDashboard({ initialTab = "dashboard" }) {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isClubAdmin, returnToStudent } = useAuth();

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
    if (path.includes("/settings")) return "settings";
    return initialTab || "dashboard";
  };

  const [activeTab, setActiveTab] = useState(getTabFromPath);

  useEffect(() => {
    setActiveTab(getTabFromPath());
  }, [location.pathname, initialTab]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (tabId === "dashboard") {
      navigate(`/campus-connect/club-admin/${clubId}/dashboard`, { replace: true });
    } else {
      navigate(`/campus-connect/club-admin/${clubId}/${tabId}`, { replace: true });
    }
  };

  // Nav Items with replaced :clubId
  const updatenavItems = useCallback(() => {
    return clubAdminNavItems.map((item) => ({
      ...item,
      href: item.href.replace(":clubId", clubId),
    }));
  }, [clubId]);

  // -------------------------------------------------------------
  // GENERAL STATE
  // -------------------------------------------------------------
  const [pageLoading, setPageLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [clubName, setClubName] = useState("Club Admin");

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
  const [draftAnnouncements, setDraftAnnouncements] = useState([]);
  const [pendingAnnouncements, setPendingAnnouncements] = useState([]);
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
  const [draftEvents, setDraftEvents] = useState([]);
  const [pendingEvents, setPendingEvents] = useState([]);
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
    registrationPlans: [],
    image: null,
  });
  const [newPlan, setNewPlan] = useState({
    planName: "",
    planDescription: "",
    amount: "",
    maxSeats: "",
  });
  const [eventImagePreview, setEventImagePreview] = useState(null);
  const [submittingEvent, setSubmittingEvent] = useState(false);

  // Members Tab State
  const [membersList, setMembersList] = useState([]);
  const [memberSearch, setMemberSearch] = useState("");
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [memberForm, setMemberForm] = useState({ email: "", role: "MEMBER" });
  const [submittingMember, setSubmittingMember] = useState(false);

  // Teams Tab State
  const [teamsList, setTeamsList] = useState([]);
  const [teamSearch, setTeamSearch] = useState("");
  const [createTeamOpen, setCreateTeamOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamDesc, setNewTeamDesc] = useState("");
  const [submittingTeam, setSubmittingTeam] = useState(false);

  // Settings Tab State
  const [clubProfile, setClubProfile] = useState({
    name: "",
    description: "",
    website: "",
    logoUrl: null,
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const logoInputRef = useRef(null);
  const [savingProfile, setSavingProfile] = useState(false);

  // Handover Leadership State
  const [handoverEmail, setHandoverEmail] = useState("");
  const [handoverOtp, setHandoverOtp] = useState("");
  const [handoverStep, setHandoverStep] = useState(1);
  const [submittingHandover, setSubmittingHandover] = useState(false);

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
        clubAdminApi.getClubName(clubId).catch(() => "Club Admin"),
        clubAdminApi.getStats(clubId).catch(() => ({})),
        clubAdminApi.getLatestAnnouncements(clubId).catch(() => []),
        clubAdminApi.getPublishedEvents(clubId).catch(() => []),
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
      const [pub, drf, pnd] = await Promise.all([
        clubAdminApi.getPublishedAnnouncements(clubId).catch(() => []),
        clubAdminApi.getDraftAnnouncements(clubId).catch(() => []),
        clubAdminApi.getPendingAnnouncements(clubId).catch(() => []),
      ]);
      setPublishedAnnouncements(Array.isArray(pub) ? pub : []);
      setDraftAnnouncements(Array.isArray(drf) ? drf : []);
      setPendingAnnouncements(Array.isArray(pnd) ? pnd : []);
    } catch (err) {
      console.error("Failed to fetch announcements", err);
    }
  };

  const fetchEventsData = async () => {
    try {
      const [pub, fin, drf, pnd] = await Promise.all([
        clubAdminApi.getPublishedEvents(clubId).catch(() => []),
        clubAdminApi.getFinishedEvents(clubId).catch(() => []),
        clubAdminApi.getDraftEvents(clubId).catch(() => []),
        clubAdminApi.getPendingEvents(clubId).catch(() => []),
      ]);
      setPublishedEvents(Array.isArray(pub) ? pub : []);
      setFinishedEvents(Array.isArray(fin) ? fin : []);
      setDraftEvents(Array.isArray(drf) ? drf : []);
      setPendingEvents(Array.isArray(pnd) ? pnd : []);
    } catch (err) {
      console.error("Failed to fetch events", err);
    }
  };

  const fetchMembersData = async () => {
    try {
      const data = await clubAdminApi.getMembers(clubId);
      setMembersList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch members", err);
    }
  };

  const fetchTeamsData = async () => {
    try {
      const data = await clubAdminApi.getTeams(clubId);
      setTeamsList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch teams", err);
    }
  };

  const fetchProfileData = async () => {
    try {
      const data = await clubAdminApi.getClubProfile(clubId);
      if (data) {
        setClubProfile({
          name: data.clubName || "",
          description: data.clubDescription || "",
          website: data.website || "",
          logoUrl: data.logoUrl || null,
        });
        setLogoPreview(data.logoUrl || null);
      }
    } catch (err) {
      console.error("Failed to fetch profile", err);
    }
  };

  // Main Initializer
  const loadAllData = async () => {
    try {
      const authorized = await isClubAdmin(clubId);
      if (!authorized) {
        toast({
          title: "Access Denied",
          description: "You do not hold administrative privileges for this club.",
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
        fetchProfileData(),
      ]);
    } catch (err) {
      toast({
        title: "Error Loading Dashboard",
        description: err?.message || "Failed to load club admin data",
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
      title: "Data Synced",
      description: "Club admin dashboard metrics refreshed.",
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
        await clubAdminApi.updateAnnouncement(clubId, editingDraftId, annForm);
        if (isDraft) {
          toast({
            title: "Draft Updated",
            description: "Announcement draft updated successfully.",
          });
          setAnnouncementSubtab("draft");
        } else {
          await clubAdminApi.publishAnnouncementDraft(clubId, editingDraftId);
          toast({
            title: "Announcement Published",
            description: "Announcement has been published or sent for approval.",
          });
          setAnnouncementSubtab("published");
        }
      } else {
        if (isDraft) {
          await clubAdminApi.saveAnnouncementDraft(clubId, annForm);
          toast({
            title: "Draft Saved",
            description: "Announcement saved to your drafts successfully.",
          });
          setAnnouncementSubtab("draft");
        } else {
          await clubAdminApi.createAnnouncement(clubId, annForm);
          toast({
            title: "Announcement Submitted",
            description: "Announcement has been published or sent for approval.",
          });
        }
      }
      setEditingDraftId(null);
      setAnnForm({ title: "", content: "" });
      setCreateAnnOpen(false);
      await Promise.all([fetchAnnouncementsData(), fetchDashboardStatsAndFeeds()]);
    } catch (err) {
      toast({
        title: "Error",
        description: err?.message || "Failed to save announcement.",
        variant: "destructive",
      });
    } finally {
      setSubmittingAnn(false);
    }
  };

  const handlePublishAnnDraft = (annId) => {
    setConfirmDialog({
      open: true,
      title: "Publish Draft Announcement?",
      description: "This announcement draft will be published for all students in your college.",
      confirmText: "Publish Now",
      variant: "default",
      loading: false,
      onConfirm: async () => {
        try {
          await clubAdminApi.publishAnnouncementDraft(clubId, annId);
          toast({
            title: "Draft Published",
            description: "Announcement is now live.",
          });
          await Promise.all([fetchAnnouncementsData(), fetchDashboardStatsAndFeeds()]);
          setAnnouncementSubtab("published");
        } catch (err) {
          toast({
            title: "Publish Failed",
            description: err?.message || "Failed to publish draft",
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
      title: "Delete Draft Announcement?",
      description: "Are you sure you want to permanently discard this draft?",
      confirmText: "Delete Draft",
      variant: "destructive",
      loading: false,
      onConfirm: async () => {
        try {
          await clubAdminApi.deleteAnnouncementDraft(clubId, annId);
          toast({
            title: "Draft Deleted",
            description: "Announcement draft was removed.",
          });
          await fetchAnnouncementsData();
        } catch (err) {
          toast({
            title: "Error",
            description: err?.message || "Failed to delete draft",
            variant: "destructive",
          });
        } finally {
          setConfirmDialog((prev) => ({ ...prev, open: false }));
        }
      },
    });
  };

  const handleDeletePublishedAnn = (annId) => {
    setConfirmDialog({
      open: true,
      title: "Delete Published Announcement?",
      description: "This will remove the announcement from the college feed.",
      confirmText: "Delete Announcement",
      variant: "destructive",
      loading: false,
      onConfirm: async () => {
        try {
          await clubAdminApi.deleteAnnouncement(clubId, annId);
          toast({
            title: "Announcement Deleted",
            description: "Announcement has been removed.",
          });
          await Promise.all([fetchAnnouncementsData(), fetchDashboardStatsAndFeeds()]);
        } catch (err) {
          toast({
            title: "Error",
            description: err?.message || "Failed to delete announcement",
            variant: "destructive",
          });
        } finally {
          setConfirmDialog((prev) => ({ ...prev, open: false }));
        }
      },
    });
  };

  const handleApproveAnnouncement = (annId) => {
    setConfirmDialog({
      open: true,
      title: "Approve Announcement?",
      description: "Are you sure you want to approve this announcement submission?",
      confirmText: "Approve Announcement",
      variant: "success",
      loading: false,
      onConfirm: async () => {
        try {
          await clubAdminApi.approveAnnouncement(clubId, annId);
          toast({
            title: "Announcement Approved",
            description: "The submission was approved and advanced in the workflow.",
          });
          await Promise.all([fetchAnnouncementsData(), fetchDashboardStatsAndFeeds()]);
        } catch (err) {
          toast({
            title: "Approval Failed",
            description: err?.message || "Could not approve announcement.",
            variant: "destructive",
          });
        } finally {
          setConfirmDialog((prev) => ({ ...prev, open: false }));
        }
      },
    });
  };

  const handleRejectAnnouncement = (annId) => {
    setConfirmDialog({
      open: true,
      title: "Reject Announcement?",
      description: "Are you sure you want to reject this announcement submission? This action cannot be undone.",
      confirmText: "Reject Announcement",
      variant: "destructive",
      loading: false,
      onConfirm: async () => {
        try {
          await clubAdminApi.rejectAnnouncement(clubId, annId);
          toast({
            title: "Announcement Rejected",
            description: "The pending announcement has been rejected.",
          });
          await Promise.all([fetchAnnouncementsData(), fetchDashboardStatsAndFeeds()]);
        } catch (err) {
          toast({
            title: "Rejection Failed",
            description: err?.message || "Could not reject announcement.",
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

  const handleAddPlan = () => {
    if (!newPlan.planName.trim() || !newPlan.amount) {
      toast({
        title: "Incomplete Plan",
        description: "Plan name and ticket price amount are required.",
        variant: "destructive",
      });
      return;
    }
    const planObj = {
      planName: newPlan.planName.trim(),
      planDescription: newPlan.planDescription.trim(),
      amount: parseFloat(newPlan.amount) || 0,
      maxSeats: newPlan.maxSeats ? parseInt(newPlan.maxSeats, 10) : null,
    };
    setEventForm((prev) => ({
      ...prev,
      registrationPlans: [...(prev.registrationPlans || []), planObj],
    }));
    setNewPlan({ planName: "", planDescription: "", amount: "", maxSeats: "" });
  };

  const handleRemovePlan = (idx) => {
    setEventForm((prev) => ({
      ...prev,
      registrationPlans: prev.registrationPlans.filter((_, i) => i !== idx),
    }));
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

    if (
      eventForm.registrationPayment === "PAID" &&
      (!eventForm.registrationPlans || eventForm.registrationPlans.length === 0)
    ) {
      toast({
        title: "Registration Plans Required",
        description: "Please add at least one registration plan for paid events.",
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
        registrationPlans:
          eventForm.registrationPayment === "PAID"
            ? eventForm.registrationPlans
            : [],
      };

      if (isDraft) {
        await clubAdminApi.saveEventDraft(clubId, payload);
        toast({
          title: "Draft Saved",
          description: "Event draft has been saved successfully.",
        });
        setEventSubtab("draft");
      } else {
        if (!eventForm.image) {
          toast({
            title: "Banner Required",
            description: "Please upload an event banner image to publish.",
            variant: "destructive",
          });
          setSubmittingEvent(false);
          return;
        }

        const formData = new FormData();
        formData.append(
          "eventDto",
          new Blob([JSON.stringify(payload)], { type: "application/json" })
        );
        formData.append("image", eventForm.image);

        await clubAdminApi.createEvent(clubId, formData);
        toast({
          title: "Event Created",
          description: "Event has been created or submitted for mentor approval.",
        });
        setEventSubtab("published");
      }

      // Reset form
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
        registrationPlans: [],
        image: null,
      });
      setNewPlan({ planName: "", planDescription: "", amount: "", maxSeats: "" });
      setEventImagePreview(null);
      setCreateEventOpen(false);
      await Promise.all([fetchEventsData(), fetchDashboardStatsAndFeeds()]);
    } catch (err) {
      toast({
        title: "Error",
        description: err?.message || "Failed to process event.",
        variant: "destructive",
      });
    } finally {
      setSubmittingEvent(false);
    }
  };

  const handlePublishEventDraft = (eventId) => {
    setConfirmDialog({
      open: true,
      title: "Publish Event Draft?",
      description: "This event will become active and available for campus registrations.",
      confirmText: "Publish Event",
      variant: "default",
      loading: false,
      onConfirm: async () => {
        try {
          await clubAdminApi.publishEventDraft(clubId, eventId);
          toast({
            title: "Draft Published",
            description: "Event is now officially active.",
          });
          await Promise.all([fetchEventsData(), fetchDashboardStatsAndFeeds()]);
          setEventSubtab("published");
        } catch (err) {
          toast({
            title: "Publish Failed",
            description: err?.message || "Could not publish event draft.",
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
      title: "Delete Event Draft?",
      description: "Permanently delete this event draft?",
      confirmText: "Delete Draft",
      variant: "destructive",
      loading: false,
      onConfirm: async () => {
        try {
          await clubAdminApi.deleteEventDraft(clubId, eventId);
          toast({
            title: "Draft Deleted",
            description: "Event draft was removed.",
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

  const handleApproveEvent = (eventId) => {
    setConfirmDialog({
      open: true,
      title: "Approve Event Proposal?",
      description: "Are you sure you want to approve this event proposal?",
      confirmText: "Approve Event",
      variant: "success",
      loading: false,
      onConfirm: async () => {
        try {
          await clubAdminApi.approveEvent(clubId, eventId);
          toast({
            title: "Event Approved",
            description: "Event approved and transitioned to the next stage.",
          });
          await Promise.all([fetchEventsData(), fetchDashboardStatsAndFeeds()]);
        } catch (err) {
          toast({
            title: "Approval Failed",
            description: err?.message || "Could not approve event.",
            variant: "destructive",
          });
        } finally {
          setConfirmDialog((prev) => ({ ...prev, open: false }));
        }
      },
    });
  };

  const handleRejectEvent = (eventId) => {
    setConfirmDialog({
      open: true,
      title: "Reject Event?",
      description: "Are you sure you want to reject this event proposal?",
      confirmText: "Reject",
      variant: "destructive",
      loading: false,
      onConfirm: async () => {
        try {
          await clubAdminApi.rejectEvent(clubId, eventId);
          toast({
            title: "Event Rejected",
            description: "Event submission has been rejected.",
          });
          await fetchEventsData();
        } catch (err) {
          toast({
            title: "Error",
            description: err?.message || "Failed to reject event.",
            variant: "destructive",
          });
        } finally {
          setConfirmDialog((prev) => ({ ...prev, open: false }));
        }
      },
    });
  };

  const handleDownloadRegistrations = async (eventId, eventTitle) => {
    try {
      const blob = await clubAdminApi.downloadRegistrations(clubId, eventId);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${eventTitle || "event"}_registrations.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast({
        title: "Downloaded",
        description: "Registrations list exported successfully.",
      });
    } catch (err) {
      toast({
        title: "Export Failed",
        description: "Could not download event registrations.",
        variant: "destructive",
      });
    }
  };

  // -------------------------------------------------------------
  // MEMBERS TAB HANDLERS
  // -------------------------------------------------------------
  const handleAddMember = async () => {
    if (!memberForm.email.trim()) {
      toast({
        title: "Validation Error",
        description: "Student email address is required.",
        variant: "destructive",
      });
      return;
    }
    setSubmittingMember(true);
    try {
      const res = await clubAdminApi.addMember(clubId, {
        email: memberForm.email.trim(),
        role: memberForm.role.toUpperCase(),
      });
      toast({
        title: "Member Enrolled",
        description: res?.message || "Student added to club members.",
      });
      setMemberForm({ email: "", role: "MEMBER" });
      setAddMemberOpen(false);
      await Promise.all([fetchMembersData(), fetchDashboardStatsAndFeeds()]);
    } catch (err) {
      toast({
        title: "Failed to Add Member",
        description: err?.message || "Check if the email belongs to a registered student.",
        variant: "destructive",
      });
    } finally {
      setSubmittingMember(false);
    }
  };

  const handleRemoveMember = (studentId, studentName) => {
    setConfirmDialog({
      open: true,
      title: "Remove Club Member?",
      description: `Are you sure you want to remove ${studentName || "this student"} from the club? They will lose access to member portals and teams.`,
      confirmText: "Remove Member",
      variant: "destructive",
      loading: false,
      onConfirm: async () => {
        try {
          await clubAdminApi.removeMember(clubId, studentId);
          toast({
            title: "Member Removed",
            description: "Student has been removed from club membership.",
          });
          await Promise.all([
            fetchMembersData(),
            fetchTeamsData(),
            fetchDashboardStatsAndFeeds(),
          ]);
        } catch (err) {
          toast({
            title: "Error",
            description: err?.message || "Failed to remove member.",
            variant: "destructive",
          });
        } finally {
          setConfirmDialog((prev) => ({ ...prev, open: false }));
        }
      },
    });
  };

  // -------------------------------------------------------------
  // TEAMS TAB HANDLERS
  // -------------------------------------------------------------
  const handleCreateTeamSubmit = async () => {
    if (!newTeamName.trim()) {
      toast({
        title: "Validation Error",
        description: "Team name is required.",
        variant: "destructive",
      });
      return;
    }
    setSubmittingTeam(true);
    try {
      const data = await clubAdminApi.createTeam(clubId, {
        name: newTeamName.trim(),
        description: newTeamDesc.trim(),
      });
      toast({
        title: "Success",
        description: data?.message || "Team created successfully.",
        variant: "success",
      });
      setNewTeamName("");
      setNewTeamDesc("");
      setCreateTeamOpen(false);
      await Promise.all([fetchTeamsData(), fetchDashboardStatsAndFeeds()]);
    } catch (err) {
      toast({
        title: "Error",
        description: err?.message || "Failed to create team.",
        variant: "destructive",
      });
    } finally {
      setSubmittingTeam(false);
    }
  };

  const handleDeleteTeamPrompt = (teamId, teamName) => {
    setConfirmDialog({
      open: true,
      title: "Delete Team?",
      description: `Are you sure you want to delete the team "${teamName}"? All member assignments to this team will be removed.`,
      confirmText: "Delete Team",
      variant: "destructive",
      loading: false,
      onConfirm: async () => {
        try {
          const data = await clubAdminApi.deleteTeam(clubId, teamId);
          toast({
            title: "Success",
            description: data?.message || "Team deleted successfully.",
            variant: "success",
          });
          await Promise.all([fetchTeamsData(), fetchDashboardStatsAndFeeds()]);
        } catch (err) {
          toast({
            title: "Error",
            description: err?.message || "Failed to delete team.",
            variant: "destructive",
          });
        } finally {
          setConfirmDialog((prev) => ({ ...prev, open: false }));
        }
      },
    });
  };

  const handleAddTeamMember = async (teamId, studentId) => {
    try {
      const data = await clubAdminApi.addTeamMember(clubId, teamId, studentId);
      toast({
        title: "Success",
        description: data?.message || "Member added to team successfully.",
        variant: "success",
      });
      await fetchTeamsData();
    } catch (err) {
      toast({
        title: "Error",
        description: err?.message || "Failed to add member to team.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveTeamMember = async (teamId, studentId) => {
    try {
      const data = await clubAdminApi.deleteTeamMember(clubId, teamId, studentId);
      toast({
        title: "Success",
        description: data?.message || "Member removed from team successfully.",
        variant: "success",
      });
      await fetchTeamsData();
    } catch (err) {
      toast({
        title: "Error",
        description: err?.message || "Failed to remove member from team.",
        variant: "destructive",
      });
    }
  };

  // -------------------------------------------------------------
  // SETTINGS TAB HANDLERS
  // -------------------------------------------------------------
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!clubProfile.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Club name cannot be blank.",
        variant: "destructive",
      });
      return;
    }
    setSavingProfile(true);
    try {
      const formData = new FormData();
      formData.append(
        "clubProfileDto",
        new Blob(
          [
            JSON.stringify({
              clubName: clubProfile.name.trim(),
              clubDescription: clubProfile.description.trim(),
              website: clubProfile.website.trim(),
            }),
          ],
          { type: "application/json" }
        )
      );
      if (logoFile) {
        formData.append("image", logoFile);
      } else {
        formData.append("image", null);
      }

      await clubAdminApi.modifyClubProfile(clubId, formData);
      toast({
        title: "Profile Saved",
        description: "Club profile details updated successfully.",
      });
      setClubName(clubProfile.name.trim());
      await fetchProfileData();
    } catch (err) {
      toast({
        title: "Update Failed",
        description: err?.message || "Failed to update club profile.",
        variant: "destructive",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  // Handover Leadership
  const handleSendHandoverOtp = async () => {
    if (!handoverEmail.trim()) {
      toast({
        title: "Email Required",
        description: "Enter the university email of the successor admin.",
        variant: "destructive",
      });
      return;
    }
    setSubmittingHandover(true);
    try {
      const res = await securityApi.sendCode({
        email: handoverEmail.trim(),
        codeFor: "Email verification for handover leadership",
      });
      if (res?.message === "Verification code sent successfully") {
        toast({
          title: "Verification Code Dispatched",
          description: `Security OTP sent to ${handoverEmail}.`,
        });
        setHandoverStep(2);
      } else {
        toast({
          title: "Dispatch Failed",
          description: res?.message || "Could not send OTP code.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Security Error",
        description: err?.message || "Failed to dispatch verification code.",
        variant: "destructive",
      });
    } finally {
      setSubmittingHandover(false);
    }
  };

  const handleConfirmHandover = async () => {
    if (!handoverOtp.trim()) {
      toast({
        title: "OTP Required",
        description: "Please enter the 6-digit verification code.",
        variant: "destructive",
      });
      return;
    }
    setSubmittingHandover(true);
    try {
      const res = await clubAdminApi.handOver(clubId, {
        newAdminEmail: handoverEmail.trim(),
        verificationCode: handoverOtp.trim(),
      });
      toast({
        title: "Leadership Transferred",
        description: res?.message || "Club presidency and admin rights handed over successfully.",
      });
      setHandoverStep(1);
      setHandoverEmail("");
      setHandoverOtp("");
      navigate("/campus-connect/student/dashboard");
    } catch (err) {
      toast({
        title: "Handover Failed",
        description: err?.message || "Invalid OTP code or transfer failed.",
        variant: "destructive",
      });
    } finally {
      setSubmittingHandover(false);
    }
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

  const filteredDraftAnnouncements = useMemo(() => {
    return draftAnnouncements.filter((a) =>
      a.title?.toLowerCase().includes(announcementSearch.toLowerCase()) ||
      a.content?.toLowerCase().includes(announcementSearch.toLowerCase())
    );
  }, [draftAnnouncements, announcementSearch]);

  const filteredPendingAnnouncements = useMemo(() => {
    return pendingAnnouncements.filter((a) =>
      a.title?.toLowerCase().includes(announcementSearch.toLowerCase()) ||
      a.content?.toLowerCase().includes(announcementSearch.toLowerCase())
    );
  }, [pendingAnnouncements, announcementSearch]);

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

  const filteredDraftEvents = useMemo(() => {
    return draftEvents.filter((e) =>
      e.title?.toLowerCase().includes(eventSearch.toLowerCase()) ||
      e.location?.toLowerCase().includes(eventSearch.toLowerCase())
    );
  }, [draftEvents, eventSearch]);

  const filteredPendingEvents = useMemo(() => {
    return pendingEvents.filter((e) =>
      e.title?.toLowerCase().includes(eventSearch.toLowerCase()) ||
      e.location?.toLowerCase().includes(eventSearch.toLowerCase())
    );
  }, [pendingEvents, eventSearch]);

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
      route: `/campus-connect/club-admin/${clubId}/dashboard`,
      color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    },
    {
      label: "Enrolled Club Members",
      value: stats.members ?? 0,
      icon: UserCheck,
      subtitle: "Active registered roster strength",
      route: `/campus-connect/club-admin/${clubId}/members`,
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      label: "Operational Wings / Teams",
      value: stats.teams ?? 0,
      icon: Layers,
      subtitle: "Specialized functional wings",
      route: `/campus-connect/club-admin/${clubId}/teams`,
      color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    },
    {
      label: "Active & Ongoing Events",
      value: stats.events ?? 0,
      icon: Calendar,
      subtitle: "Live, upcoming & scheduled",
      route: `/campus-connect/club-admin/${clubId}/events`,
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    },
  ];

  if (pageLoading) {
    return (
      <DashboardLayout navItems={updatenavItems()} title="Club Admin Portal">
        <PageSkeleton variant="dashboard" />
      </DashboardLayout>
    );
  }

  // -------------------------------------------------------------
  // RENDER
  // -------------------------------------------------------------
  return (
    <DashboardLayout navItems={updatenavItems()} title="Club Admin Portal">
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
                    {logoPreview ? (
                      <AvatarImage src={logoPreview} alt={clubName} className="object-cover" />
                    ) : (
                      <AvatarFallback className="rounded-2xl bg-primary/20 text-primary font-bold text-xl">
                        {clubName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-foreground truncate">
                        {clubName}
                      </h1>
                      <Badge variant="default" className="text-[10px] sm:text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5">
                        Club Admin
                      </Badge>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
                      Centralized command hub for announcements, events, teams, and member leadership.
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
                                navigate(`/campus-connect/club-admin/${clubId}/events/${evt.id}`)
                              }
                              className="h-7 text-[11px] px-2.5 shrink-0 self-end sm:self-center"
                            >
                              Manage
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
                      Latest 5 campus broadcasts and news
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
                    Announcements & Broadcasts
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
                    Publish official notices, campus broadcasts, and updates to club members.
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
                  <span>New</span>
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
                  <span>New Announcement</span>
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
                  onClick={() => setAnnouncementSubtab("draft")}
                  className={`w-full sm:w-auto px-3 py-2 sm:py-1.5 text-xs sm:text-sm rounded-lg font-semibold transition-all text-center justify-center flex items-center ${
                    announcementSubtab === "draft"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                  }`}
                >
                  My Drafts
                </button>

                <button
                  type="button"
                  onClick={() => setAnnouncementSubtab("pending")}
                  className={`col-span-2 sm:col-span-1 w-full sm:w-auto px-3 py-2 sm:py-1.5 text-xs sm:text-sm rounded-lg font-semibold transition-all text-center justify-center flex items-center ${
                    announcementSubtab === "pending"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                  }`}
                >
                  Pending Approval
                </button>
              </div>
            </div>

            {/* Subtab 1: Published */}
            {announcementSubtab === "published" && (
              <div className="space-y-3">
                {filteredPublishedAnnouncements.length === 0 ? (
                  <Card className="border-dashed border-border/80">
                    <CardContent className="py-12">
                      <EmptyState
                        title="No Published Announcements"
                        desc="There are currently no active announcements published within your club."
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
                            <div className="flex items-center gap-2">
                              <span>{ann.createdAt ? new Date(ann.createdAt).toLocaleString() : ""}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeletePublishedAnn(ann.id)}
                                className="h-8 text-xs text-destructive hover:bg-destructive/10 px-2.5"
                              >
                                <Trash2 className="w-3.5 h-3.5 mr-1" />
                                Delete
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

            {/* Subtab 2: My Draft */}
            {announcementSubtab === "draft" && (
              <div className="space-y-3">
                {filteredDraftAnnouncements.length === 0 ? (
                  <Card className="border-dashed border-border/80">
                    <CardContent className="py-12">
                      <EmptyState
                        title="No Saved Drafts"
                        desc="You haven't saved any announcement drafts yet."
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
                              Admin Draft
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
                                <Edit3 className="w-3.5 h-3.5" />
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
                                Publish Draft
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

            {/* Subtab 3: Pending Approval */}
            {announcementSubtab === "pending" && (
              <div className="space-y-3">
                {filteredPendingAnnouncements.length === 0 ? (
                  <Card className="border-dashed border-border/80">
                    <CardContent className="py-12">
                      <EmptyState
                        title="No Pending Announcements"
                        desc="There are no announcements currently waiting for review or approval."
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
                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                  Submitted by: {ann.authorName || "Club Member"}
                                </p>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-[10px] font-semibold text-amber-600 bg-amber-500/10 border-amber-500/20 shrink-0">
                              Awaiting Review
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
                            <div className="flex items-center gap-2">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleRejectAnnouncement(ann.id)}
                                className="text-xs h-8 font-medium bg-red-600 hover:bg-red-700 text-white"
                              >
                                <XCircle className="w-3.5 h-3.5 mr-1" />
                                Reject
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleApproveAnnouncement(ann.id)}
                                className="text-xs h-8 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                Approve & Publish
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
                    Events & Activities
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
                    Plan, publish, coordinate club workshops, hackathons, and monitor event proposals.
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
                      registrationPlans: [],
                      image: null,
                    });
                    setNewPlan({ planName: "", planDescription: "", amount: "", maxSeats: "" });
                    setEventImagePreview(null);
                    setCreateEventOpen(true);
                  }}
                  className="sm:hidden h-8 text-xs font-semibold shadow-xs gap-1 px-2.5 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create</span>
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
                      registrationPlans: [],
                      image: null,
                    });
                    setNewPlan({ planName: "", planDescription: "", amount: "", maxSeats: "" });
                    setEventImagePreview(null);
                    setCreateEventOpen(true);
                  }}
                  className="h-9 text-xs font-semibold shadow-xs gap-1.5 px-3.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Event</span>
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
                  onClick={() => setEventSubtab("draft")}
                  className={`w-full sm:w-auto px-3 py-2 sm:py-1.5 text-xs sm:text-sm rounded-lg font-semibold transition-all text-center justify-center flex items-center ${
                    eventSubtab === "draft"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                  }`}
                >
                  My Drafts
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
              </div>
            </div>

          {/* Subtab 1: Published Events */}
            {eventSubtab === "published" && (
              <div>
                {filteredPublishedEvents.length === 0 ? (
                  <EmptyState
                    title="No Published Events"
                    desc="There are currently no active events published for this club."
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
                                Active
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
                          <div className="p-3 bg-muted/20 border-t border-border/40 flex items-center justify-between gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadRegistrations(evt.id, evt.title)}
                              className="h-7 text-[11px] px-2 text-muted-foreground hover:text-foreground"
                            >
                              <Download className="w-3 h-3 mr-1" />
                              Registrations
                            </Button>
                            <Button
                              size="sm"
                              onClick={() =>
                                navigate(`/campus-connect/club-admin/${clubId}/events/${evt.id}`)
                              }
                              className="h-7 text-xs font-semibold px-3"
                            >
                              Manage
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
                    desc="There are no past or concluded events recorded for this club."
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
                        <div className="p-3 bg-muted/20 border-t border-border/40 flex items-center justify-between">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadRegistrations(evt.id, evt.title)}
                            className="h-7 text-[11px] text-muted-foreground"
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Export Data
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              navigate(`/campus-connect/club-admin/${clubId}/events/${evt.id}`)
                            }
                            className="h-7 text-xs font-semibold"
                          >
                            Overview
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Subtab 3: My Drafts */}
            {eventSubtab === "draft" && (
              <div>
                {filteredDraftEvents.length === 0 ? (
                  <EmptyState
                    title="No Event Drafts"
                    desc="You have not saved any draft events."
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
                            Publish Draft
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Subtab 4: Pending Approval */}
            {eventSubtab === "pending" && (
              <div>
                {filteredPendingEvents.length === 0 ? (
                  <EmptyState
                    title="No Pending Events"
                    desc="No event submissions currently awaiting review or approvals."
                    icon={<ShieldCheck className="w-8 h-8 text-muted-foreground/60" />}
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredPendingEvents.map((evt) => (
                      <Card key={evt.id} className="rounded-2xl border-amber-500/30 bg-amber-500/5 shadow-xs flex flex-col justify-between">
                        <CardHeader className="p-4 pb-2">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <Badge variant="outline" className="text-[10px] bg-amber-500/15 text-amber-600 border-amber-500/30">
                              Awaiting Approval
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
                        </CardContent>
                        <div className="p-3 bg-background/60 border-t border-amber-500/20 flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRejectEvent(evt.id)}
                            className="h-7 text-xs text-destructive hover:bg-destructive/10 border-destructive/30"
                          >
                            <XCircle className="w-3.5 h-3.5 mr-1" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleApproveEvent(evt.id)}
                            className="h-7 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                            Approve
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
        {/* TAB 4: MEMBERS                                            */}
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
                  <Badge variant="outline" className="text-xs px-2.5 py-0.5 font-semibold bg-muted/50">
                    {membersList.length} Enrolled
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Manage enrolled club members, designate leadership roles, and monitor team affiliations.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                <Button
                  size="sm"
                  onClick={() => {
                    setMemberForm({ email: "", role: "MEMBER" });
                    setAddMemberOpen(true);
                  }}
                  className="h-9 text-xs font-semibold shadow-xs gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Add Member</span>
                </Button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search members by name, roll, email..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="pl-9 text-xs sm:text-sm h-9 rounded-xl border-border/70 bg-background"
                />
              </div>
            </div>

            {/* Members List */}
            {filteredMembers.length === 0 ? (
              <EmptyState
                title="No Members Found"
                desc={memberSearch ? "No members match your search criteria." : "No members have been enrolled into this club yet."}
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
                            {member.avatarUrl || member.image ? (
                              <AvatarImage
                                src={member.avatarUrl || member.image}
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

                        <div className="flex items-center gap-3 shrink-0">
                          <Badge
                            variant={role === "ADMIN" || role === "PRESIDENT" ? "default" : "secondary"}
                            className="text-[10px] font-semibold uppercase px-2 py-0.5"
                          >
                            {role}
                          </Badge>

                          {role !== "PRESIDENT" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveMember(studentId, studentName)}
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              title="Remove member from club"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: TEAMS                                              */}
        {/* ========================================================= */}
        {activeTab === "teams" && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4 pb-1">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  Team Management
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Create teams and manage member assignments
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                <Button
                  size="sm"
                  onClick={() => {
                    setNewTeamName("");
                    setNewTeamDesc("");
                    setCreateTeamOpen(true);
                  }}
                  className="h-9 text-xs font-semibold shadow-xs gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Team</span>
                </Button>
              </div>
            </div>

            {/* Stats & Search Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              <Card className="rounded-2xl border-border/60 bg-card/60 shadow-xs">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                    <UsersRound className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-foreground">{teamsList.length}</p>
                    <p className="text-xs text-muted-foreground font-medium">Total Teams</p>
                  </div>
                </CardContent>
              </Card>

              <div className="sm:col-span-2 relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search teams by name or description..."
                  value={teamSearch}
                  onChange={(e) => setTeamSearch(e.target.value)}
                  className="pl-9 text-xs sm:text-sm h-10 rounded-xl border-border/70 bg-background w-full"
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
                    : "This club does not have any teams yet. Create a team to organize members."
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
                      className="rounded-2xl border-border/60 hover:border-border transition-all shadow-xs flex flex-col justify-between"
                    >
                      <CardHeader className="p-4 sm:p-5 pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <CardTitle className="text-base font-bold text-foreground truncate">
                              {team.name}
                            </CardTitle>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                              {team.description || "No description provided."}
                            </p>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                            onClick={() => handleDeleteTeamPrompt(team.id, team.name)}
                            title="Delete Team"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="mt-2.5">
                          <Badge variant="secondary" className="text-[10px] font-semibold">
                            {team.membersCount || members.length} members
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="p-4 sm:p-5 pt-2 flex-1 space-y-3">
                        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                          {members.length === 0 ? (
                            <p className="text-xs text-muted-foreground italic py-2">
                              No members assigned to this team yet.
                            </p>
                          ) : (
                            members.map((m) => {
                              const studentName = m.studentName || m.fullName || "Student Member";
                              const studentId = m.studentId || m.id;
                              return (
                                <div
                                  key={studentId || m.email}
                                  className="flex justify-between items-center bg-muted/40 px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium"
                                >
                                  <span className="truncate">{studentName}</span>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-6 w-6 text-muted-foreground hover:text-destructive shrink-0"
                                    onClick={() => handleRemoveTeamMember(team.id, studentId)}
                                    title="Remove from team"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                                  </Button>
                                </div>
                              );
                            })
                          )}
                        </div>

                        {/* Inline member selection */}
                        <div className="pt-2 border-t border-border/50">
                          <Select
                            value=""
                            onValueChange={(val) => {
                              if (val) handleAddTeamMember(team.id, val);
                            }}
                          >
                            <SelectTrigger className="h-8 text-xs bg-background">
                              <SelectValue placeholder="Add member to team..." />
                            </SelectTrigger>
                            <SelectContent>
                              {membersList
                                .filter(
                                  (m) =>
                                    !members.some(
                                      (tm) =>
                                        String(tm.studentId || tm.id) ===
                                        String(m.studentId || m.id)
                                    )
                                )
                                .map((m) => {
                                  const name = m.studentName || m.fullName || "Member";
                                  const sId = String(m.studentId || m.id);
                                  return (
                                    <SelectItem key={sId} value={sId} className="text-xs">
                                      {name} {m.email ? `(${m.email})` : ""}
                                    </SelectItem>
                                  );
                                })}
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: SETTINGS                                           */}
        {/* ========================================================= */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            {/* Page Title Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4 pb-1">
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                    Club Settings & Profile
                  </h1>
                  <Badge variant="outline" className="text-xs px-2.5 py-0.5 font-semibold bg-muted/50">
                    Configuration
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Manage public branding, contact portals, recruitment status, and administrative credentials.
                </p>
              </div>
            </div>
            {/* Section 1: Club Profile Configuration */}
            <Card className="rounded-2xl border-border/60 shadow-xs">
              <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3 border-b border-border/50">
                <CardTitle className="text-base sm:text-lg font-bold">
                  Club Profile Information
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Update public details, branding, and contact portals for your organization.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-4">
                <form onSubmit={handleSaveProfile} className="space-y-5">
                  {/* Logo Upload */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <Avatar className="w-20 h-20 rounded-2xl border-2 border-primary/20 shadow-xs">
                      {logoPreview ? (
                        <AvatarImage src={logoPreview} alt="Club Logo" className="object-cover" />
                      ) : (
                        <AvatarFallback className="rounded-2xl bg-primary/10 text-primary font-bold text-2xl">
                          {clubProfile.name ? clubProfile.name.charAt(0).toUpperCase() : "C"}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="space-y-1.5">
                      <p className="text-xs font-semibold text-foreground">Club Insignia / Logo</p>
                      <p className="text-[11px] text-muted-foreground">
                        Recommended format: Square PNG or JPG, max 2MB.
                      </p>
                      <input
                        type="file"
                        ref={logoInputRef}
                        onChange={handleLogoUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => logoInputRef.current?.click()}
                        className="h-8 text-xs font-medium"
                      >
                        <Upload className="w-3.5 h-3.5 mr-1.5" />
                        Choose New Logo
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="text-xs font-semibold text-foreground">Club Name *</Label>
                      <Input
                        value={clubProfile.name}
                        onChange={(e) => setClubProfile((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g. Google Developer Student Club"
                        className="text-xs sm:text-sm h-9"
                        required
                      />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="text-xs font-semibold text-foreground">Club Description</Label>
                      <Textarea
                        value={clubProfile.description}
                        onChange={(e) => setClubProfile((prev) => ({ ...prev, description: e.target.value }))}
                        placeholder="About mission, activities, projects..."
                        rows={4}
                        className="text-xs sm:text-sm"
                      />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="text-xs font-semibold text-foreground">Official Website / Portfolio Link</Label>
                      <div className="relative">
                        <Globe className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          value={clubProfile.website}
                          onChange={(e) => setClubProfile((prev) => ({ ...prev, website: e.target.value }))}
                          placeholder="https://myclub.university.edu"
                          className="pl-9 text-xs sm:text-sm h-9"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-3 border-t border-border/50">
                    <Button
                      type="submit"
                      disabled={savingProfile}
                      className="h-9 text-xs font-semibold shadow-xs px-5"
                    >
                      <ShieldCheck className="w-4 h-4 mr-1.5 text-emerald-400" />
                      {savingProfile ? "Saving Changes..." : "Save Club Profile"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Section 2: Leadership Handover */}
            <Card className="rounded-2xl border-amber-500/30 bg-amber-500/5 shadow-xs overflow-hidden">
              <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3 border-b border-amber-500/20">
                <div className="flex items-center gap-2 text-amber-600">
                  <KeyRound className="w-5 h-5" />
                  <CardTitle className="text-base sm:text-lg font-bold">
                    Handover Club Leadership
                  </CardTitle>
                </div>
                <CardDescription className="text-xs text-muted-foreground mt-1">
                  Transfer supreme club presidency to another registered student. This requires security OTP verification.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-4 space-y-4">
                <div className="p-3.5 rounded-xl bg-background/80 border border-amber-500/30 text-xs text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-foreground">Important Note: </span>
                  Upon successfully verifying the transfer code, your administrative privileges will immediately expire and transfer to the designated student.
                </div>

                {handoverStep === 1 ? (
                  <div className="space-y-3 max-w-md">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-foreground">Successor University Email *</Label>
                      <Input
                        type="email"
                        value={handoverEmail}
                        onChange={(e) => setHandoverEmail(e.target.value)}
                        placeholder="newadmin@university.edu"
                        className="text-xs sm:text-sm h-9"
                      />
                    </div>
                    <Button
                      type="button"
                      disabled={submittingHandover}
                      onClick={handleSendHandoverOtp}
                      className="h-9 text-xs font-semibold shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5 mr-1.5" />
                      {submittingHandover ? "Dispatching OTP..." : "Send Verification OTP"}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3 max-w-md">
                    <p className="text-xs text-muted-foreground">
                      Enter the 6-digit OTP dispatched to <span className="font-semibold text-foreground">{handoverEmail}</span>.
                    </p>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-foreground">6-Digit Verification Code *</Label>
                      <Input
                        value={handoverOtp}
                        onChange={(e) => setHandoverOtp(e.target.value)}
                        placeholder="e.g. 849201"
                        maxLength={6}
                        className="text-xs sm:text-sm h-9 tracking-widest font-mono"
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setHandoverStep(1);
                          setHandoverOtp("");
                        }}
                        className="h-9 text-xs"
                      >
                        Back
                      </Button>
                      <Button
                        type="button"
                        disabled={submittingHandover}
                        onClick={handleConfirmHandover}
                        className="h-9 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
                        {submittingHandover ? "Authorizing Transfer..." : "Confirm & Transfer Leadership"}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
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
                {editingDraftId ? "Edit Announcement Draft" : "Create Announcement"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {editingDraftId
                  ? "Update your saved draft announcement."
                  : `Publish a club announcement across the campus for ${clubName}.`}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Announcement Title *</Label>
                <Input
                  value={annForm.title}
                  onChange={(e) => setAnnForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Annual General Body Meeting"
                  className="text-xs sm:text-sm h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Content / Body *</Label>
                <MarkdownEditor
                  value={annForm.content}
                  onChange={(val) => setAnnForm((prev) => ({ ...prev, content: val }))}
                  placeholder="Provide complete announcements, agenda, and instructions in Markdown..."
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
                  {submittingAnn ? "Submitting..." : (editingDraftId ? "Publish Draft" : "Publish Announcement")}
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

        {/* 2. Dialog: Create Event */}
        <Dialog open={createEventOpen} onOpenChange={setCreateEventOpen}>
          <DialogContent className="w-[95vw] sm:max-w-2xl rounded-2xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg font-bold">
                Create Event
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Set up an active campus or global event for {clubName}.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Event Title *</Label>
                <Input
                  value={eventForm.title}
                  onChange={(e) => setEventForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Annual Tech Symposium 2026"
                  className="text-xs sm:text-sm h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Description</Label>
                <Textarea
                  value={eventForm.description}
                  onChange={(e) => setEventForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Overview, schedule, agenda, and guidelines..."
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
                      <SelectItem value="PAID">Paid (Razorpay)</SelectItem>
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
                      <span>Global (All Colleges)</span>
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
                      placeholder="e.g. Main Auditorium / Seminar Hall"
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

              {/* Extra Details: Prize Money, Batch Year, Eligibility */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Prize Pool (₹)</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 50000"
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
                    placeholder="e.g. All CS/IT Students"
                    value={eventForm.eligibility}
                    onChange={(e) => setEventForm((prev) => ({ ...prev, eligibility: e.target.value }))}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Judging Criteria / Rules</Label>
                <Input
                  placeholder="e.g. Innovation, Technical Depth, UI/UX, Presentation"
                  value={eventForm.criteria}
                  onChange={(e) => setEventForm((prev) => ({ ...prev, criteria: e.target.value }))}
                  className="h-9 text-xs"
                />
              </div>

              {/* Paid Event: Registration Plans */}
              {eventForm.registrationPayment === "PAID" && (
                <div className="p-3.5 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-foreground">Ticket / Registration Plans</p>
                    <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary">
                      {eventForm.registrationPlans?.length || 0} Plans Configured
                    </Badge>
                  </div>

                  {eventForm.registrationPlans && eventForm.registrationPlans.length > 0 && (
                    <div className="space-y-2">
                      {eventForm.registrationPlans.map((plan, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-background border border-border/60 text-xs"
                        >
                          <div>
                            <span className="font-bold text-foreground">{plan.planName}</span>
                            <span className="text-muted-foreground ml-2">₹{plan.amount}</span>
                            {plan.maxSeats && (
                              <span className="text-muted-foreground text-[10px] ml-2">
                                ({plan.maxSeats} seats)
                              </span>
                            )}
                            {plan.planDescription && (
                              <p className="text-[11px] text-muted-foreground">{plan.planDescription}</p>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemovePlan(idx)}
                            className="h-6 w-6 p-0 text-destructive"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1">
                    <Input
                      placeholder="Plan Name (e.g. Early Bird)"
                      value={newPlan.planName}
                      onChange={(e) => setNewPlan((prev) => ({ ...prev, planName: e.target.value }))}
                      className="h-8 text-xs"
                    />
                    <Input
                      placeholder="Price in ₹ (e.g. 199)"
                      type="number"
                      value={newPlan.amount}
                      onChange={(e) => setNewPlan((prev) => ({ ...prev, amount: e.target.value }))}
                      className="h-8 text-xs"
                    />
                    <Input
                      placeholder="Max Seats (optional)"
                      type="number"
                      value={newPlan.maxSeats}
                      onChange={(e) => setNewPlan((prev) => ({ ...prev, maxSeats: e.target.value }))}
                      className="h-8 text-xs"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddPlan}
                      className="h-8 text-xs"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Add Plan
                    </Button>
                  </div>
                </div>
              )}

              {/* Event Banner Image */}
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
                  <Calendar className="w-3.5 h-3.5 mr-1" />
                  {submittingEvent ? "Processing..." : "Create & Publish Event"}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

        {/* 3. Dialog: Add Club Member */}
        <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
          <DialogContent className="w-[95vw] sm:max-w-md rounded-2xl p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg font-bold">
                Add Club Member
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Enroll a university student into {clubName}.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Student Email *</Label>
                <Input
                  type="email"
                  value={memberForm.email}
                  onChange={(e) => setMemberForm((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="student@university.edu"
                  className="text-xs sm:text-sm h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Assigned Role</Label>
                <Select
                  value={memberForm.role}
                  onValueChange={(val) => setMemberForm((prev) => ({ ...prev, role: val }))}
                >
                  <SelectTrigger className="h-9 text-xs sm:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MEMBER">General Member</SelectItem>
                    <SelectItem value="LEAD">Team Lead</SelectItem>
                    <SelectItem value="ADMIN">Co-Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-3 border-t border-border/60">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAddMemberOpen(false)}
                  className="text-xs h-9"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={submittingMember}
                  onClick={handleAddMember}
                  className="text-xs h-9 font-semibold shadow-xs"
                >
                  <UserPlus className="w-3.5 h-3.5 mr-1" />
                  {submittingMember ? "Enrolling..." : "Enroll Member"}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

        {/* 4. Dialog: Create Team */}
        <Dialog open={createTeamOpen} onOpenChange={setCreateTeamOpen}>
          <DialogContent className="w-[95vw] sm:max-w-md rounded-2xl p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg font-bold">
                Create Team
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Create a new operational team inside your club.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Team Name *</Label>
                <Input
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="e.g. Technical Team, Design Team"
                  className="text-xs sm:text-sm h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Description</Label>
                <Textarea
                  value={newTeamDesc}
                  onChange={(e) => setNewTeamDesc(e.target.value)}
                  placeholder="Responsibilities, scope, objectives..."
                  rows={3}
                  className="text-xs sm:text-sm"
                />
              </div>

              <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-3 border-t border-border/60">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCreateTeamOpen(false)}
                  className="text-xs h-9"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={submittingTeam}
                  onClick={handleCreateTeamSubmit}
                  className="text-xs h-9 font-semibold shadow-xs"
                >
                  <UsersRound className="w-3.5 h-3.5 mr-1.5" />
                  {submittingTeam ? "Creating..." : "Create Team"}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

        {/* 5. Global Action Confirmation Dialog */}
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

        {/* 7. Sub-Dashboard Return to Student Dialog */}
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
