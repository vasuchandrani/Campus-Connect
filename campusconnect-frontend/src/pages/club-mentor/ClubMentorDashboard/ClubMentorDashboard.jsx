import "./ClubMentorDashboard.css";
import React, { useState, useEffect, useCallback } from "react";
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
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../../components/ui/Tabs";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../../components/ui/Select";
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
  LayoutDashboard,
  Users,
  ShieldCheck,
  Calendar,
  Megaphone,
  Layers,
  ArrowLeft,
  ArrowUpRight,
  Search,
  Mail,
  UserCheck,
  Clock,
  Plus,
  Trash2,
  Send,
  CheckCircle2,
  XCircle,
  Settings as SettingsIcon,
  HelpCircle,
  MapPin,
  FileText,
  Sparkles,
  Info,
  ShieldAlert,
  GraduationCap,
  Eye,
  Edit2,
} from "lucide-react";
import { clubMentorNavItems } from "../../../config/Navigation";
import { useAuth } from "../../../contexts/AuthContext";
import EmptyState from "../../../components/ui/EmptyState";
import PageSkeleton from "../../../components/ui/PageSkeleton";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import SubDashboardLoginDialog from "../../../components/dashboard/SubDashboardLoginDialog";
import { professorApi } from "../../../services/api";
import { toast } from "../../../hooks/use-toast";

export default function ClubMentorDashboard() {
  const { clubId, subTab } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { routeProtection, returnToProfessor } = useAuth();

  // Return to professor password verification state
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [returnLoading, setReturnLoading] = useState(false);
  const [returnError, setReturnError] = useState("");

  const handleReturnToProfessor = async (password) => {
    setReturnLoading(true);
    setReturnError("");
    try {
      const redirectUrl = await returnToProfessor(password, clubId);
      toast({
        title: "Session Swapped",
        description: "Welcome back to your Professor Dashboard!",
      });
      setReturnDialogOpen(false);
      navigate(redirectUrl, { replace: true });
    } catch (err) {
      let msg = err.response?.data?.message || err.message || "Invalid professor password. Please try again.";
      if (typeof msg === "string") {
        msg = msg.replace(/^\d{3}\s+[A-Z_]+(?:\s+["']?|:\s*["']?)/i, "").replace(/^["']|["']$/g, "").trim();
      }
      setReturnError(msg || "Invalid professor password.");
    } finally {
      setReturnLoading(false);
    }
  };

  const getTabFromPath = () => {
    const path = location.pathname;
    if (path.includes("/announcements")) return "announcements";
    if (path.includes("/events")) return "events";
    if (path.includes("/members")) return "members";
    if (path.includes("/teams")) return "teams";
    if (path.includes("/settings")) return "settings";
    return subTab || "dashboard";
  };

  const [activeTab, setActiveTab] = useState(getTabFromPath);

  useEffect(() => {
    setActiveTab(getTabFromPath());
  }, [location.pathname, subTab]);

  const updateNavItems = useCallback(() => {
    return clubMentorNavItems.map((item) => ({
      ...item,
      href: item.href.replace(":clubId", clubId),
    }));
  }, [clubId]);

  // Primary State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);

  // Subtabs State
  const [announcementSubtab, setAnnouncementSubtab] = useState("published");
  const [eventSubtab, setEventSubtab] = useState("published");

  // Tab Data Lists
  const [publishedAnnouncements, setPublishedAnnouncements] = useState([]);
  const [draftAnnouncements, setDraftAnnouncements] = useState([]);
  const [pendingAnnouncements, setPendingAnnouncements] = useState([]);

  const [publishedEvents, setPublishedEvents] = useState([]);
  const [finishedEvents, setFinishedEvents] = useState([]);
  const [draftEvents, setDraftEvents] = useState([]);
  const [pendingEvents, setPendingEvents] = useState([]);

  const [membersList, setMembersList] = useState([]);
  const [teamsList, setTeamsList] = useState([]);

  // Search States
  const [memberSearch, setMemberSearch] = useState("");
  const [teamSearch, setTeamSearch] = useState("");

  // Governance Settings State
  const [settings, setSettings] = useState({
    announcementPermission: "ADMIN_ONLY",
    eventPermission: "ADMIN_ONLY",
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // Dialog States
  const [createAnnDraftOpen, setCreateAnnDraftOpen] = useState(false);
  const [annDraftForm, setAnnDraftForm] = useState({ title: "", content: "" });
  const [editingDraftId, setEditingDraftId] = useState(null);
  const [viewAnnouncement, setViewAnnouncement] = useState(null);
  const [savingAnnDraft, setSavingAnnDraft] = useState(false);

  const [createEventDraftOpen, setCreateEventDraftOpen] = useState(false);
  const [eventDraftForm, setEventDraftForm] = useState({
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
  });
  const [newDraftPlan, setNewDraftPlan] = useState({
    planName: "",
    planDescription: "",
    amount: "",
    maxSeats: "",
  });
  const [savingEventDraft, setSavingEventDraft] = useState(false);

  // Reusable Confirmation Dialog State
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    description: "",
    confirmText: "Confirm",
    variant: "destructive",
    loading: false,
    onConfirm: null,
  });

  useEffect(() => {
    if (!routeProtection(["CLUB_MENTOR", "MENTOR"])) {
      const currentRole = (localStorage.getItem("role") || "").toUpperCase();
      if (currentRole === "PROFESSOR") {
        navigate(`/campus-connect/professor/clubs/${clubId}`, { replace: true });
      } else {
        navigate("/auth", { replace: true });
      }
      return;
    }
    loadAllDashboardData();
  }, [clubId, navigate, routeProtection]);

  const loadAllDashboardData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [
        dash,
        pubAnn,
        drfAnn,
        pndAnn,
        pubEvt,
        finEvt,
        drfEvt,
        pndEvt,
        members,
        teams,
        sett,
      ] = await Promise.allSettled([
        professorApi.getMentorDashboardData(clubId),
        professorApi.getMentorPublishedAnnouncements(clubId),
        professorApi.getMentorDraftAnnouncements(clubId),
        professorApi.getMentorPendingAnnouncements(clubId),
        professorApi.getMentorPublishedEvents(clubId),
        professorApi.getMentorFinishedEvents(clubId),
        professorApi.getMentorDraftEvents(clubId),
        professorApi.getMentorPendingEvents(clubId),
        professorApi.getMentorClubMembers(clubId),
        professorApi.getMentorClubTeams(clubId),
        professorApi.getMentorClubSettings(clubId),
      ]);

      if (dash.status === "fulfilled") setDashboardData(dash.value);
      if (pubAnn.status === "fulfilled") setPublishedAnnouncements(pubAnn.value || []);
      if (drfAnn.status === "fulfilled") setDraftAnnouncements(drfAnn.value || []);
      if (pndAnn.status === "fulfilled") setPendingAnnouncements(pndAnn.value || []);

      if (pubEvt.status === "fulfilled") setPublishedEvents(pubEvt.value || []);
      if (finEvt.status === "fulfilled") setFinishedEvents(finEvt.value || []);
      if (drfEvt.status === "fulfilled") setDraftEvents(drfEvt.value || []);
      if (pndEvt.status === "fulfilled") setPendingEvents(pndEvt.value || []);

      if (members.status === "fulfilled") setMembersList(members.value || []);
      if (teams.status === "fulfilled") setTeamsList(teams.value || []);
      if (sett.status === "fulfilled") {
        setSettings({
          announcementPermission: sett.value?.announcementPermission || "ADMIN_ONLY",
          eventPermission: sett.value?.eventPermission || "ADMIN_ONLY",
        });
      }

      if (isManualRefresh) {
        toast({
          title: "Dashboard Refreshed",
          description: "All club mentor statistics and rosters updated.",
        });
      }
    } catch (err) {
      console.error("Error loading mentor portal data:", err);
      toast({
        title: "Error Loading Portal",
        description: "Failed to load club details or permissions.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // -------------------------------------------------------------
  // ANNOUNCEMENT ACTIONS
  // -------------------------------------------------------------
  const handleSaveAnnouncementDraft = async (e) => {
    e?.preventDefault();
    if (!annDraftForm.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Title is required.",
        variant: "destructive",
      });
      return;
    }
    setSavingAnnDraft(true);
    try {
      if (editingDraftId) {
        await professorApi.updateMentorAnnouncement(clubId, editingDraftId, annDraftForm);
        toast({
          title: "Draft Updated",
          description: "Announcement draft updated successfully.",
        });
      } else {
        await professorApi.saveMentorAnnouncementDraft(clubId, annDraftForm);
        toast({
          title: "Draft Saved",
          description: "Announcement draft saved successfully.",
        });
      }
      setEditingDraftId(null);
      setAnnDraftForm({ title: "", content: "" });
      setCreateAnnDraftOpen(false);
      const drafts = await professorApi.getMentorDraftAnnouncements(clubId);
      setDraftAnnouncements(drafts || []);
      setAnnouncementSubtab("drafts");
    } catch (err) {
      console.error("Error saving announcement draft:", err);
      toast({
        title: "Save Failed",
        description: err.message || "Failed to save draft.",
        variant: "destructive",
      });
    } finally {
      setSavingAnnDraft(false);
    }
  };

  const handlePublishAnnouncementDraft = (annId) => {
    setConfirmDialog({
      open: true,
      title: "Publish Announcement Draft?",
      description:
        "This announcement draft will be published publicly across the campus community.",
      confirmText: "Publish Now",
      variant: "success",
      loading: false,
      onConfirm: async () => {
        try {
          await professorApi.publishMentorAnnouncementDraft(clubId, annId);
          toast({
            title: "Announcement Published",
            description: "Draft published to campus community.",
          });
          const [pub, drf] = await Promise.all([
            professorApi.getMentorPublishedAnnouncements(clubId),
            professorApi.getMentorDraftAnnouncements(clubId),
          ]);
          setPublishedAnnouncements(pub || []);
          setDraftAnnouncements(drf || []);
        } catch (err) {
          toast({
            title: "Publish Failed",
            description: err.message,
            variant: "destructive",
          });
        } finally {
          setConfirmDialog((prev) => ({ ...prev, open: false }));
        }
      },
    });
  };

  const handleDeleteAnnouncementDraft = (annId) => {
    setConfirmDialog({
      open: true,
      title: "Delete Announcement Draft?",
      description:
        "Are you sure you want to delete this draft? This action cannot be undone.",
      confirmText: "Delete Draft",
      variant: "destructive",
      loading: false,
      onConfirm: async () => {
        try {
          await professorApi.deleteMentorAnnouncementDraft(clubId, annId);
          toast({
            title: "Draft Deleted",
            description: "Announcement draft was removed.",
          });
          const drf = await professorApi.getMentorDraftAnnouncements(clubId);
          setDraftAnnouncements(drf || []);
        } catch (err) {
          toast({
            title: "Delete Failed",
            description: err.message,
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
      title: "Approve & Publish Announcement?",
      description:
        "As faculty mentor, your approval will immediately publish this announcement publicly.",
      confirmText: "Approve & Publish",
      variant: "success",
      loading: false,
      onConfirm: async () => {
        try {
          await professorApi.approveMentorAnnouncement(clubId, annId);
          toast({
            title: "Announcement Approved",
            description: "The announcement is now published.",
          });
          const [pub, pnd] = await Promise.all([
            professorApi.getMentorPublishedAnnouncements(clubId),
            professorApi.getMentorPendingAnnouncements(clubId),
          ]);
          setPublishedAnnouncements(pub || []);
          setPendingAnnouncements(pnd || []);
        } catch (err) {
          toast({
            title: "Approval Failed",
            description: err.message,
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
      description:
        "Are you sure you want to reject this announcement? It will not be published.",
      confirmText: "Reject Announcement",
      variant: "destructive",
      loading: false,
      onConfirm: async () => {
        try {
          await professorApi.rejectMentorAnnouncement(clubId, annId);
          toast({
            title: "Announcement Rejected",
            description: "The announcement submission was rejected.",
          });
          const pnd = await professorApi.getMentorPendingAnnouncements(clubId);
          setPendingAnnouncements(pnd || []);
        } catch (err) {
          toast({
            title: "Rejection Failed",
            description: err.message,
            variant: "destructive",
          });
        } finally {
          setConfirmDialog((prev) => ({ ...prev, open: false }));
        }
      },
    });
  };

  // -------------------------------------------------------------
  // EVENT ACTIONS
  // -------------------------------------------------------------
  const handleAddDraftPlan = () => {
    if (!newDraftPlan.planName.trim()) {
      toast({ title: "Validation Error", description: "Plan name is required", variant: "destructive" });
      return;
    }
    const plan = {
      planName: newDraftPlan.planName.trim(),
      planDescription: newDraftPlan.planDescription.trim(),
      amount: parseFloat(newDraftPlan.amount) || 0,
      maxSeats: newDraftPlan.maxSeats ? parseInt(newDraftPlan.maxSeats, 10) : null,
    };
    setEventDraftForm((prev) => ({
      ...prev,
      registrationPlans: [...prev.registrationPlans, plan],
    }));
    setNewDraftPlan({ planName: "", planDescription: "", amount: "", maxSeats: "" });
  };

  const handleRemoveDraftPlan = (index) => {
    setEventDraftForm((prev) => ({
      ...prev,
      registrationPlans: prev.registrationPlans.filter((_, i) => i !== index),
    }));
  };

  const handleSaveEventDraft = async (e) => {
    e?.preventDefault();
    if (!eventDraftForm.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Title is required.",
        variant: "destructive",
      });
      return;
    }
    setSavingEventDraft(true);
    try {
      const payload = {
        title: eventDraftForm.title.trim(),
        description: eventDraftForm.description.trim(),
        eventType: eventDraftForm.eventType || "OFFLINE",
        isPublic: !!eventDraftForm.isPublic,
        registrationPayment: eventDraftForm.registrationPayment || "FREE",
        startTime: eventDraftForm.startTime ? `${eventDraftForm.startTime}:00` : null,
        endTime: eventDraftForm.endTime ? `${eventDraftForm.endTime}:00` : null,
        registrationStart: eventDraftForm.registrationStart ? `${eventDraftForm.registrationStart}:00` : null,
        registrationEnd: eventDraftForm.registrationEnd ? `${eventDraftForm.registrationEnd}:00` : null,
        location: eventDraftForm.eventType === "ONLINE" ? null : eventDraftForm.location,
        batchYear: eventDraftForm.batchYear ? parseInt(eventDraftForm.batchYear, 10) : null,
        criteria: eventDraftForm.criteria || null,
        eligibility: eventDraftForm.eligibility || null,
        prizeMoney: eventDraftForm.prizeMoney ? parseInt(eventDraftForm.prizeMoney, 10) : null,
        registrationPlans: eventDraftForm.registrationPayment !== "FREE" ? eventDraftForm.registrationPlans : [],
      };
      await professorApi.saveMentorEventDraft(clubId, payload);
      toast({
        title: "Draft Saved",
        description: "Event draft saved successfully.",
      });
      setEventDraftForm({
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
      });
      setCreateEventDraftOpen(false);
      const drafts = await professorApi.getMentorDraftEvents(clubId);
      setDraftEvents(drafts || []);
      setEventSubtab("drafts");
    } catch (err) {
      console.error("Error saving event draft:", err);
      toast({
        title: "Save Failed",
        description: err.message || "Failed to save event draft.",
        variant: "destructive",
      });
    } finally {
      setSavingEventDraft(false);
    }
  };

  const handlePublishEventDraft = (eventId) => {
    setConfirmDialog({
      open: true,
      title: "Publish Event Draft?",
      description:
        "This event will be published publicly for student registration and participation.",
      confirmText: "Publish Event",
      variant: "success",
      loading: false,
      onConfirm: async () => {
        try {
          await professorApi.publishMentorEventDraft(clubId, eventId);
          toast({
            title: "Event Published",
            description: "Event is now live and published.",
          });
          const [pub, drf] = await Promise.all([
            professorApi.getMentorPublishedEvents(clubId),
            professorApi.getMentorDraftEvents(clubId),
          ]);
          setPublishedEvents(pub || []);
          setDraftEvents(drf || []);
        } catch (err) {
          toast({
            title: "Publish Failed",
            description: err.message,
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
      description:
        "Are you sure you want to delete this draft event? This action cannot be undone.",
      confirmText: "Delete Draft",
      variant: "destructive",
      loading: false,
      onConfirm: async () => {
        try {
          await professorApi.deleteMentorEventDraft(clubId, eventId);
          toast({
            title: "Draft Deleted",
            description: "Event draft was removed.",
          });
          const drf = await professorApi.getMentorDraftEvents(clubId);
          setDraftEvents(drf || []);
        } catch (err) {
          toast({
            title: "Delete Failed",
            description: err.message,
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
      title: "Approve & Publish Event?",
      description:
        "As faculty mentor, your approval will immediately publish this event for the college campus.",
      confirmText: "Approve & Publish",
      variant: "success",
      loading: false,
      onConfirm: async () => {
        try {
          await professorApi.approveMentorEvent(clubId, eventId);
          toast({
            title: "Event Approved",
            description: "The event is now officially published.",
          });
          const [pub, pnd] = await Promise.all([
            professorApi.getMentorPublishedEvents(clubId),
            professorApi.getMentorPendingEvents(clubId),
          ]);
          setPublishedEvents(pub || []);
          setPendingEvents(pnd || []);
        } catch (err) {
          toast({
            title: "Approval Failed",
            description: err.message,
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
      description:
        "Are you sure you want to reject this event submission? It will be removed.",
      confirmText: "Reject Event",
      variant: "destructive",
      loading: false,
      onConfirm: async () => {
        try {
          await professorApi.rejectMentorEvent(clubId, eventId);
          toast({
            title: "Event Rejected",
            description: "The event submission was rejected.",
          });
          const pnd = await professorApi.getMentorPendingEvents(clubId);
          setPendingEvents(pnd || []);
        } catch (err) {
          toast({
            title: "Rejection Failed",
            description: err.message,
            variant: "destructive",
          });
        } finally {
          setConfirmDialog((prev) => ({ ...prev, open: false }));
        }
      },
    });
  };

  // -------------------------------------------------------------
  // SETTINGS ACTIONS
  // -------------------------------------------------------------
  const handleSaveSettings = () => {
    setConfirmDialog({
      open: true,
      title: "Save Governance Policies?",
      description:
        "Update publishing workflows for Announcements and Events. New submissions will follow these approval rules immediately.",
      confirmText: "Save Policies",
      variant: "default",
      loading: false,
      onConfirm: async () => {
        setSavingSettings(true);
        try {
          await professorApi.updateMentorClubSettings(clubId, settings);
          toast({
            title: "Policies Saved",
            description: "Club publishing policies updated successfully.",
          });
          const [pndAnn, pndEvt, dash] = await Promise.all([
            professorApi.getMentorPendingAnnouncements(clubId),
            professorApi.getMentorPendingEvents(clubId),
            professorApi.getMentorDashboardData(clubId),
          ]);
          setPendingAnnouncements(pndAnn || []);
          setPendingEvents(pndEvt || []);
          if (dash) setDashboardData(dash);
        } catch (err) {
          toast({
            title: "Save Failed",
            description: err.message || "Failed to update settings.",
            variant: "destructive",
          });
        } finally {
          setSavingSettings(false);
          setConfirmDialog((prev) => ({ ...prev, open: false }));
        }
      },
    });
  };

  const handleDeleteClub = () => {
    setConfirmDialog({
      open: true,
      title: "Dissolve / Delete Club",
      description: `Are you sure you want to permanently dissolve and delete ${dashboardData?.clubName || "this club"}? All club data, events, announcements, teams, and member associations will be permanently removed. This action cannot be undone.`,
      confirmText: "Delete Club Forever",
      variant: "destructive",
      loading: false,
      onConfirm: async () => {
        try {
          setConfirmDialog((prev) => ({ ...prev, loading: true }));
          await professorApi.deleteClubByMentor(clubId);
          toast({
            title: "Club Dissolved",
            description: "The club has been dissolved and removed from the college.",
          });
          setConfirmDialog((prev) => ({ ...prev, open: false, loading: false }));
          navigate("/campus-connect/professor/clubs");
        } catch (err) {
          toast({
            title: "Dissolution Failed",
            description: err?.message || "Failed to dissolve club",
            variant: "destructive",
          });
          setConfirmDialog((prev) => ({ ...prev, loading: false }));
        }
      },
    });
  };

  if (loading) {
    return (
      <DashboardLayout navItems={updateNavItems()} title="Club Mentor Portal">
        <PageSkeleton variant="dashboard" />
      </DashboardLayout>
    );
  }

  if (!dashboardData) {
    return (
      <DashboardLayout navItems={updateNavItems()} title="Club Mentor Portal">
        <div className="max-w-4xl mx-auto py-12 px-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/campus-connect/professor/dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Dashboard
          </Button>
          <Card className="border-border/80">
            <CardContent className="py-12 text-center">
              <EmptyState
                icon={Users}
                title="Club Details Not Found"
                description="Unable to load the mentor dashboard. It may have been removed or you may not have mentor authorization."
              />
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Filtered Members
  const filteredMembers = membersList.filter((m) => {
    const q = memberSearch.toLowerCase();
    return (
      (m.fullName && m.fullName.toLowerCase().includes(q)) ||
      (m.rollNumber && m.rollNumber.toLowerCase().includes(q)) ||
      (m.email && m.email.toLowerCase().includes(q)) ||
      (m.department && m.department.toLowerCase().includes(q)) ||
      (m.role && m.role.toLowerCase().includes(q))
    );
  });

  // Filtered Teams
  const filteredTeams = teamsList.filter((t) => {
    const q = teamSearch.toLowerCase();
    return (
      (t.name && t.name.toLowerCase().includes(q)) ||
      (t.description && t.description.toLowerCase().includes(q))
    );
  });

  // 4 Core Stat Cards Configuration (Unified with Student & Professor Dashboards)
  const statItems = [
    {
      label: "Active Community Followers",
      value: dashboardData.followerCount || 0,
      icon: Users,
      subtitle: "Campus students following updates",
      route: `/campus-connect/professor/clubs/${clubId}/mentor-dashboard`,
      color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    },
    {
      label: "Enrolled Club Members",
      value: dashboardData.memberCount || 0,
      icon: UserCheck,
      subtitle: "Active registered roster strength",
      route: `/campus-connect/professor/clubs/${clubId}/mentor-dashboard/members`,
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      label: "Operational Wings / Teams",
      value: dashboardData.teamCount || 0,
      icon: Layers,
      subtitle: "Specialized functional wings",
      route: `/campus-connect/professor/clubs/${clubId}/mentor-dashboard/teams`,
      color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    },
    {
      label: "Active & Ongoing Events",
      value: dashboardData.activeEventCount || 0,
      icon: Calendar,
      subtitle: "Live, upcoming & registered",
      route: `/campus-connect/professor/clubs/${clubId}/mentor-dashboard/events`,
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    },
  ];

  return (
    <DashboardLayout navItems={updateNavItems()} title={`${dashboardData.clubName} Mentor Portal`}>
      <div className="space-y-5 sm:space-y-6 w-full min-w-0">
        {/* Content Controller (Sidebar Driven) */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5 sm:space-y-6 w-full">

          {/* ========================================================= */}
          {/* TAB 1: DASHBOARD                                          */}
          {/* ========================================================= */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Hero Header Banner - Ultra-Responsive (Only displayed on Dashboard tab) */}
            <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-card via-card/90 to-primary/5 p-4 sm:p-6 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5 sm:gap-4 min-w-0">
                  <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-2xl bg-background/90 border border-border/80 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                    {dashboardData.logoUrl ? (
                      <img
                        src={dashboardData.logoUrl}
                        alt={dashboardData.clubName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Users className="w-7 h-7 sm:w-9 sm:h-9 text-primary" />
                    )}
                  </div>

                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-lg sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground truncate">
                        {dashboardData.clubName}
                      </h1>
                      <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[11px] font-semibold py-0.5">
                        <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                        Faculty Mentorship Active
                      </Badge>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {dashboardData.description || "Active campus student organization."}
                    </p>
                    {dashboardData.adminName && (
                      <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5 text-primary" />
                          Student Lead: {dashboardData.adminName}
                        </span>
                        {dashboardData.adminDepartment && (
                          <span className="text-muted-foreground">
                            ({dashboardData.adminDepartment})
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 shrink-0 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-8 sm:h-9 px-3 border border-border/80 hover:border-primary/40 hover:bg-muted/60 text-foreground gap-1.5 shadow-xs w-full sm:w-auto justify-center"
                    onClick={() => {
                      setReturnError("");
                      setReturnDialogOpen(true);
                    }}
                    title="Return to Professor Dashboard"
                  >
                    <GraduationCap className="w-3.5 h-3.5 text-primary" />
                    <span>Return to Professor</span>
                  </Button>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-xl border border-border/60">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Publish Governance:</span>
                    <Badge variant="outline" className="text-[10px] font-bold">
                      {settings.announcementPermission === "ADMIN_ONLY" && settings.eventPermission === "ADMIN_ONLY"
                        ? "Mentor Guided"
                        : settings.announcementPermission === "ADMIN_ONLY"
                        ? "Admin Only"
                        : "Direct Publish"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            {/* 4 Ultra-Responsive Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 w-full">
              {statItems.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <Card
                    key={idx}
                    className="border-border/70 bg-card/80 backdrop-blur-xs hover:border-primary/40 hover:shadow-xs active:scale-[0.98] transition-all cursor-pointer group rounded-xl sm:rounded-2xl w-full min-w-0 overflow-hidden relative"
                    onClick={() => stat.route && navigate(stat.route)}
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

            {/* Feeds: Recent Events (5) & Recent Announcements (5) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
              {/* Recent Events (5) */}
              <Card className="border-border/80 shadow-xs">
                <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border/60 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      Recent Club Events (Latest 5)
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Live and scheduled club activities
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/campus-connect/professor/clubs/${clubId}/mentor-dashboard/events`)}
                    className="text-xs text-primary h-8 px-2 hover:text-primary"
                  >
                    View All
                  </Button>
                </CardHeader>
                <CardContent className="p-4 sm:p-5 space-y-3">
                  {!dashboardData.recentEvents || dashboardData.recentEvents.length === 0 ? (
                    <EmptyState
                      icon={Calendar}
                      title="No Active Events"
                      description="There are currently no active or upcoming events scheduled for this club."
                    />
                  ) : (
                    dashboardData.recentEvents.map((evt, idx) => (
                      <div
                        key={evt.id || idx}
                        className="p-3 sm:p-3.5 rounded-xl bg-accent/20 border border-border/50 flex items-start justify-between gap-3 hover:bg-accent/40 transition-colors"
                      >
                        <div className="space-y-1 min-w-0 flex-1">
                          <h4 className="text-xs sm:text-sm font-bold text-foreground truncate">
                            {evt.title}
                          </h4>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {evt.description || "Club activity."}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 pt-0.5 text-[11px] text-muted-foreground">
                            {evt.startTime && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-primary" />
                                {new Date(evt.startTime).toLocaleDateString()}
                              </span>
                            )}
                            {evt.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-primary" />
                                {evt.location}
                              </span>
                            )}
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-[10px] shrink-0 font-medium">
                          Active
                        </Badge>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Recent Announcements (5) */}
              <Card className="border-border/80 shadow-xs">
                <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border/60 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                      <Megaphone className="w-4 h-4 text-primary" />
                      Recent Announcements (Latest 5)
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Official published bulletins and updates
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/campus-connect/professor/clubs/${clubId}/mentor-dashboard/announcements`)}
                    className="text-xs text-primary h-8 px-2 hover:text-primary"
                  >
                    View All
                  </Button>
                </CardHeader>
                <CardContent className="p-4 sm:p-5 space-y-3">
                  {!dashboardData.recentAnnouncements ||
                  dashboardData.recentAnnouncements.length === 0 ? (
                    <EmptyState
                      icon={Megaphone}
                      title="No Announcements"
                      description="No announcements have been published by this club yet."
                    />
                  ) : (
                    dashboardData.recentAnnouncements.map((ann, idx) => (
                      <div
                        key={ann.id || idx}
                        className="p-3 sm:p-3.5 rounded-xl bg-accent/20 border border-border/50 space-y-1 hover:bg-accent/40 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-foreground truncate">
                            {ann.title}
                          </h4>
                          <span className="text-[11px] text-muted-foreground shrink-0">
                            {ann.createdAt ? new Date(ann.createdAt).toLocaleDateString() : "Recent"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {ann.content}
                        </p>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ========================================================= */}
          {/* TAB 2: ANNOUNCEMENTS                                      */}
          {/* ========================================================= */}
          <TabsContent value="announcements" className="space-y-4 sm:space-y-5">
            {/* Page Title Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
              <div className="flex items-start justify-between gap-3 min-w-0">
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-foreground">
                    Announcements & Bulletins
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
                    Oversee club announcements, review pending submissions, and publish official mentor notices.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingDraftId(null);
                    setAnnDraftForm({ title: "", content: "" });
                    setCreateAnnDraftOpen(true);
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
                    setAnnDraftForm({ title: "", content: "" });
                    setCreateAnnDraftOpen(true);
                  }}
                  className="h-9 text-xs font-semibold shadow-xs gap-1.5 px-3.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Announcement Draft</span>
                </Button>
              </div>
            </div>

            {/* Subtab Switcher */}
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
                onClick={() => setAnnouncementSubtab("drafts")}
                className={`w-full sm:w-auto px-3 py-2 sm:py-1.5 text-xs sm:text-sm rounded-lg font-semibold transition-all text-center justify-center flex items-center ${
                  announcementSubtab === "drafts"
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

            {/* Subtab Content: Published */}
            {announcementSubtab === "published" && (
              <div className="space-y-3">
                {publishedAnnouncements.length === 0 ? (
                  <Card className="border-dashed border-border/80">
                    <CardContent className="py-12">
                      <EmptyState
                        icon={Megaphone}
                        title="No Published Announcements"
                        description="This club has not published any announcements to the campus community."
                      />
                    </CardContent>
                  </Card>
                ) : (
                  publishedAnnouncements.map((ann) => (
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
                                {ann.clubName || dashboardData?.clubName}
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
                            className="h-7 text-xs gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View Full Details
                          </Button>
                          <span>{ann.createdAt ? new Date(ann.createdAt).toLocaleString() : ""}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}

            {/* Subtab Content: My drafts */}
            {announcementSubtab === "drafts" && (
              <div className="space-y-3">
                {draftAnnouncements.length === 0 ? (
                  <Card className="border-dashed border-border/80">
                    <CardContent className="py-12">
                      <EmptyState
                        icon={FileText}
                        title="No Draft Announcements"
                        description="You do not have any saved announcement drafts for this club."
                      />
                    </CardContent>
                  </Card>
                ) : (
                  draftAnnouncements.map((ann) => (
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
                            Mentor Draft
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
                              onClick={() => handleDeleteAnnouncementDraft(ann.id)}
                              className="text-xs h-7 font-medium"
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-1" />
                              Delete
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingDraftId(ann.id);
                                setAnnDraftForm({ title: ann.title || "", content: ann.content || "" });
                                setCreateAnnDraftOpen(true);
                              }}
                              className="text-xs h-7 gap-1"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              Edit
                            </Button>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setViewAnnouncement(ann)}
                              className="text-xs h-7 gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              View
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handlePublishAnnouncementDraft(ann.id)}
                              className="text-xs h-7 font-medium shadow-xs"
                            >
                              <Send className="w-3.5 h-3.5 mr-1" />
                              Publish Draft
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}

            {/* Subtab Content: Pending approval */}
            {announcementSubtab === "pending" && (
              <div className="space-y-4">
                {settings.announcementPermission !== "MENTOR_REQUIRED" ? (
                  <Card className="border-border/80 bg-accent/15">
                    <CardContent className="p-6 text-center space-y-2.5">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto">
                        <Info className="w-5 h-5" />
                      </div>
                      <h4 className="text-sm font-bold text-foreground">
                        Mentor Approval Not Required Under Current Policy
                      </h4>
                      <p className="text-xs text-muted-foreground max-w-lg mx-auto leading-relaxed">
                        The current announcement governance policy is set to{" "}
                        <span className="font-semibold text-foreground">
                          {settings.announcementPermission === "ADMIN_ONLY"
                            ? "Only Club Admin Permission Required"
                            : "Direct Member Publishing"}
                        </span>
                        . Submissions are approved and published without requiring faculty mentor approval.
                        You can adjust this anytime in the <span className="font-semibold text-foreground">Settings</span> tab.
                      </p>
                    </CardContent>
                  </Card>
                ) : pendingAnnouncements.length === 0 ? (
                  <Card className="border-dashed border-border/80">
                    <CardContent className="py-12">
                      <EmptyState
                        icon={CheckCircle2}
                        title="No Pending Announcements"
                        description="There are no announcements currently awaiting faculty mentor approval."
                      />
                    </CardContent>
                  </Card>
                ) : (
                  pendingAnnouncements.map((ann) => (
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
                            className="h-7 text-xs gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View Full Details
                          </Button>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRejectAnnouncement(ann.id)}
                              className="text-xs h-7 font-medium"
                            >
                              <XCircle className="w-3.5 h-3.5 mr-1" />
                              Reject
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleApproveAnnouncement(ann.id)}
                              className="text-xs h-7 font-medium shadow-xs"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                              Approve & Publish
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </TabsContent>

          {/* ========================================================= */}
          {/* TAB 3: EVENTS                                             */}
          {/* ========================================================= */}
          <TabsContent value="events" className="space-y-4 sm:space-y-5">
            {/* Page Title Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
              <div className="flex items-start justify-between gap-3 min-w-0">
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-foreground">
                    Events & Activities
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
                    Monitor club schedule, review proposals from student leadership, and propose mentor-directed activities.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => setCreateEventDraftOpen(true)}
                  className="sm:hidden h-8 text-xs font-semibold shadow-xs gap-1 px-2.5 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Draft</span>
                </Button>
              </div>

              <div className="hidden sm:flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  onClick={() => setCreateEventDraftOpen(true)}
                  className="h-9 text-xs font-semibold shadow-xs gap-1.5 px-3.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Event Draft</span>
                </Button>
              </div>
            </div>

            {/* Subtab Switcher */}
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
                Active
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
                onClick={() => setEventSubtab("drafts")}
                className={`w-full sm:w-auto px-3 py-2 sm:py-1.5 text-xs sm:text-sm rounded-lg font-semibold transition-all text-center justify-center flex items-center ${
                  eventSubtab === "drafts"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                }`}
              >
                Drafts
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
                Pending
              </button>
            </div>

            {/* Subtab Content: Published */}
            {eventSubtab === "published" && (
              <div className="space-y-3">
                {publishedEvents.length === 0 ? (
                  <Card className="border-dashed border-border/80">
                    <CardContent className="py-12">
                      <EmptyState
                        icon={Calendar}
                        title="No Active Events"
                        description="There are currently no active or upcoming published events."
                      />
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {publishedEvents.map((evt) => (
                      <Card key={evt.id} className="border-border/80 shadow-xs hover:border-primary/30 transition-colors">
                        <CardContent className="p-4 sm:p-5 space-y-2.5">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm sm:text-base font-bold text-foreground break-words leading-snug">
                              {evt.title}
                            </h4>
                            <Badge variant="outline" className="text-[10px] font-semibold shrink-0">
                              Active
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {evt.description || "Club event."}
                          </p>
                          <div className="space-y-1.5 pt-2 border-t border-border/50 text-[11px] text-muted-foreground">
                            {evt.startTime && (
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                                <span className="truncate">Start: {new Date(evt.startTime).toLocaleString()}</span>
                              </div>
                            )}
                            {evt.location && (
                              <div className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                                <span className="truncate">{evt.location}</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Subtab Content: Finished */}
            {eventSubtab === "finished" && (
              <div className="space-y-3">
                {finishedEvents.length === 0 ? (
                  <Card className="border-dashed border-border/80">
                    <CardContent className="py-12">
                      <EmptyState
                        icon={Calendar}
                        title="No Finished Events"
                        description="No past events found for this club."
                      />
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {finishedEvents.map((evt) => (
                      <Card key={evt.id} className="border-border/80 shadow-xs opacity-90">
                        <CardContent className="p-4 sm:p-5 space-y-2.5">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm sm:text-base font-bold text-foreground break-words leading-snug">
                              {evt.title}
                            </h4>
                            <Badge variant="secondary" className="text-[10px] font-semibold shrink-0">
                              Finished
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {evt.description || "Concluded club event."}
                          </p>
                          <div className="pt-2 border-t border-border/50 text-[11px] text-muted-foreground flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <span className="truncate">Ended: {evt.endTime ? new Date(evt.endTime).toLocaleString() : "Past"}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Subtab Content: Drafts */}
            {eventSubtab === "drafts" && (
              <div className="space-y-3">
                {draftEvents.length === 0 ? (
                  <Card className="border-dashed border-border/80">
                    <CardContent className="py-12">
                      <EmptyState
                        icon={FileText}
                        title="No Draft Events"
                        description="You do not have any saved event drafts."
                      />
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {draftEvents.map((evt) => (
                      <Card key={evt.id} className="border-border/80 shadow-xs hover:border-primary/30 transition-colors">
                        <CardContent className="p-4 sm:p-5 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm sm:text-base font-bold text-foreground break-words leading-snug">
                              {evt.title}
                            </h4>
                            <Badge variant="secondary" className="text-[10px] font-semibold shrink-0">
                              Mentor Draft
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {evt.description || "Draft event description."}
                          </p>
                          {evt.startTime && (
                            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                              <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                              <span className="truncate">Proposed: {new Date(evt.startTime).toLocaleString()}</span>
                            </div>
                          )}
                          <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-2 pt-3 border-t border-border/50">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteEventDraft(evt.id)}
                              className="text-xs h-8 font-medium w-full sm:w-auto"
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-1" />
                              Delete
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handlePublishEventDraft(evt.id)}
                              className="text-xs h-8 font-medium shadow-xs w-full sm:w-auto"
                            >
                              <Send className="w-3.5 h-3.5 mr-1" />
                              Publish Event
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Subtab Content: Pending Approval */}
            {eventSubtab === "pending" && (
              <div className="space-y-4">
                {settings.eventPermission !== "MENTOR_REQUIRED" ? (
                  <Card className="border-border/80 bg-accent/15">
                    <CardContent className="p-6 text-center space-y-2.5">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto">
                        <Info className="w-5 h-5" />
                      </div>
                      <h4 className="text-sm font-bold text-foreground">
                        Mentor Approval Not Required Under Current Policy
                      </h4>
                      <p className="text-xs text-muted-foreground max-w-lg mx-auto leading-relaxed">
                        The current event governance policy is set to{" "}
                        <span className="font-semibold text-foreground">
                          {settings.eventPermission === "ADMIN_ONLY"
                            ? "Only Club Admin Permission Required"
                            : "Direct Member Publishing"}
                        </span>
                        . Event submissions are approved and published without requiring faculty mentor approval.
                        You can adjust this anytime in the <span className="font-semibold text-foreground">Settings</span> tab.
                      </p>
                    </CardContent>
                  </Card>
                ) : pendingEvents.length === 0 ? (
                  <Card className="border-dashed border-border/80">
                    <CardContent className="py-12">
                      <EmptyState
                        icon={CheckCircle2}
                        title="No Pending Events"
                        description="There are no event proposals currently awaiting mentor approval."
                      />
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {pendingEvents.map((evt) => (
                      <Card key={evt.id} className="border-border/80 shadow-xs hover:border-primary/30 transition-colors">
                        <CardContent className="p-4 sm:p-5 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm sm:text-base font-bold text-foreground break-words leading-snug">
                              {evt.title}
                            </h4>
                            <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px] font-semibold shrink-0">
                              Awaiting Approval
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {evt.description || "Submitted event proposal."}
                          </p>
                          <div className="space-y-1 text-[11px] text-muted-foreground">
                            {evt.startTime && (
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                                <span className="truncate">Proposed: {new Date(evt.startTime).toLocaleString()}</span>
                              </div>
                            )}
                            {evt.location && (
                              <div className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                                <span className="truncate">{evt.location}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-2 pt-3 border-t border-border/50">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRejectEvent(evt.id)}
                              className="text-xs h-8 font-medium w-full sm:w-auto"
                            >
                              <XCircle className="w-3.5 h-3.5 mr-1" />
                              Reject
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleApproveEvent(evt.id)}
                              className="text-xs h-8 font-medium shadow-xs w-full sm:w-auto"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                              Approve & Publish
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* ========================================================= */}
          {/* TAB 4: MEMBERS (READ-ONLY)                                */}
          {/* ========================================================= */}
          <TabsContent value="members" className="space-y-5">
            {/* Page Title Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4 pb-1">
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                    Club Members Directory
                  </h1>
                  <Badge variant="outline" className="text-xs px-2.5 py-0.5 font-semibold bg-muted/50">
                    {membersList.length} Members
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Enrolled student roster and leadership directory for {dashboardData.clubName}.
                </p>
              </div>

              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  placeholder="Search by name, roll no, department..."
                  className="pl-9 h-9 text-xs sm:text-sm bg-card/80 border-border/70 w-full"
                />
              </div>
            </div>

            {filteredMembers.length === 0 ? (
              <Card className="border-dashed border-border/80">
                <CardContent className="py-12">
                  <EmptyState
                    icon={Users}
                    title={memberSearch ? "No Matching Members" : "No Members Enrolled"}
                    description={
                      memberSearch
                        ? `No members matching "${memberSearch}". Try a different keyword.`
                        : "No students are currently enrolled as members in this club."
                    }
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {filteredMembers.map((member, idx) => (
                  <Card
                    key={member.id || idx}
                    className="border-border/80 shadow-xs hover:border-primary/30 transition-colors"
                  >
                    <CardContent className="p-3.5 sm:p-4 space-y-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-sm shrink-0 overflow-hidden shadow-xs">
                          {member.avatarUrl ? (
                            <img
                              src={member.avatarUrl}
                              alt={member.fullName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span>{member.fullName ? member.fullName.charAt(0).toUpperCase() : "M"}</span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className="flex items-center justify-between gap-1">
                            <h5 className="text-xs sm:text-sm font-bold text-foreground truncate">
                              {member.fullName || "Club Member"}
                            </h5>
                            <Badge
                              variant={member.role === "ADMIN" ? "default" : "secondary"}
                              className="text-[10px] py-0 px-1.5 font-semibold shrink-0"
                            >
                              {member.role || "MEMBER"}
                            </Badge>
                          </div>
                          {member.rollNumber && (
                            <p className="text-xs font-semibold text-primary truncate">
                              ID: {member.rollNumber}
                            </p>
                          )}
                          {member.email && (
                            <p className="text-[11px] text-muted-foreground truncate flex items-center gap-1">
                              <Mail className="w-3 h-3 shrink-0" />
                              <span className="truncate">{member.email}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-border/50 grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                        <div className="min-w-0">
                          <span className="block font-medium text-foreground truncate">
                            {member.department || "General"}
                          </span>
                          <span className="truncate block">Batch: {member.batchYear || "N/A"}</span>
                        </div>
                        <div className="text-right min-w-0">
                          <span className="block text-foreground font-medium">Joined</span>
                          <span className="truncate block">
                            {member.joinedAt
                              ? new Date(member.joinedAt).toLocaleDateString()
                              : "Active"}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ========================================================= */}
          {/* TAB 5: TEAMS (READ-ONLY)                                  */}
          {/* ========================================================= */}
          <TabsContent value="teams" className="space-y-5">
            {/* Page Title Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4 pb-1">
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                    Operational Teams & Wings
                  </h1>
                  <Badge variant="outline" className="text-xs px-2.5 py-0.5 font-semibold bg-muted/50">
                    {teamsList.length} Teams
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Functional divisions and specialized working teams established in {dashboardData.clubName}.
                </p>
              </div>

              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  value={teamSearch}
                  onChange={(e) => setTeamSearch(e.target.value)}
                  placeholder="Search operational teams..."
                  className="pl-9 h-9 text-xs sm:text-sm bg-card/80 border-border/70 w-full"
                />
              </div>
            </div>

            {filteredTeams.length === 0 ? (
              <Card className="border-dashed border-border/80">
                <CardContent className="py-12">
                  <EmptyState
                    icon={Layers}
                    title="No Sub-Teams Found"
                    description={
                      teamSearch
                        ? `No operational teams matching "${teamSearch}".`
                        : "This club has not established any operational sub-teams."
                    }
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredTeams.map((team) => (
                  <Card key={team.id} className="border-border/80 shadow-xs hover:border-primary/30 transition-colors">
                    <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border/60">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-sm sm:text-base font-bold text-foreground">
                              {team.name}
                            </CardTitle>
                            <Badge variant="outline" className="text-xs font-semibold">
                              Operational Division
                            </Badge>
                          </div>
                          <CardDescription className="text-xs mt-1">
                            {team.description || "Operational division of the club."}
                          </CardDescription>
                        </div>
                        {team.createdAt && (
                          <span className="text-[11px] text-muted-foreground">
                            Formed on {new Date(team.createdAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-5">
                      {!team.members || team.members.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic py-2">
                          No students currently assigned to this team.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
                          {team.members.map((tm, idx) => (
                            <div
                              key={tm.memberId || idx}
                              className="p-3 rounded-xl bg-accent/25 border border-border/50 flex items-center gap-3 hover:bg-accent/40 transition-colors"
                            >
                              <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-xs shrink-0 overflow-hidden shadow-xs">
                                {tm.avatarUrl ? (
                                  <img
                                    src={tm.avatarUrl}
                                    alt={tm.fullName}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span>{tm.fullName ? tm.fullName.charAt(0).toUpperCase() : "T"}</span>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-1">
                                  <h6 className="text-xs font-bold text-foreground truncate">
                                    {tm.fullName || "Team Member"}
                                  </h6>
                                  <Badge variant="secondary" className="text-[9px] px-1 py-0 font-medium shrink-0">
                                    {tm.teamRole || "MEMBER"}
                                  </Badge>
                                </div>
                                <p className="text-[11px] text-muted-foreground truncate">
                                  {tm.department} {tm.batchYear ? `• ${tm.batchYear}` : ""}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ========================================================= */}
          {/* TAB 6: SETTINGS (GOVERNANCE POLICIES)                      */}
          {/* ========================================================= */}
          <TabsContent value="settings" className="space-y-6">
            {/* Page Title Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4 pb-1">
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                    Club Governance & Settings
                  </h1>
                  <Badge variant="outline" className="text-xs px-2.5 py-0.5 font-semibold bg-muted/50">
                    Mentor Control
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Define authorization levels, review workflows, and content moderation rules for {dashboardData.clubName}.
                </p>
              </div>
            </div>
            <Card className="border-border/80 shadow-xs">
              <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                    <SettingsIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-sm sm:text-base font-bold text-foreground">
                      Club Publishing Governance Policies
                    </CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      Configure review and approval workflows for club content. Changes take effect immediately upon saving.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-6 sm:space-y-8">
                {/* 1. Announcement Publish Permission */}
                <div className="space-y-3">
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-2">
                      <Megaphone className="w-4 h-4 text-primary" />
                      Announcement Publishing Permission
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Define the review hierarchy required before announcements are published publicly to the campus.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Option 1: MENTOR_REQUIRED */}
                    <div
                      onClick={() =>
                        setSettings((prev) => ({ ...prev, announcementPermission: "MENTOR_REQUIRED" }))
                      }
                      className={`cursor-pointer p-3.5 sm:p-4 rounded-xl border transition-all flex flex-col justify-between ${
                        settings.announcementPermission === "MENTOR_REQUIRED"
                          ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary"
                          : "border-border/70 hover:border-border bg-card/60"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Badge
                            variant={
                              settings.announcementPermission === "MENTOR_REQUIRED" ? "default" : "secondary"
                            }
                            className="text-[10px] font-semibold"
                          >
                            Multi-Tier Approval
                          </Badge>
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              settings.announcementPermission === "MENTOR_REQUIRED"
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-muted-foreground/40"
                            }`}
                          >
                            {settings.announcementPermission === "MENTOR_REQUIRED" && (
                              <div className="w-1.5 h-1.5 rounded-full bg-background" />
                            )}
                          </div>
                        </div>
                        <h5 className="text-xs sm:text-sm font-bold text-foreground">
                          Club Mentor Permission Required
                        </h5>
                        <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                          Member creates &rarr; Club Admin approves first &rarr; Moves to Mentor Pending Approval section &rarr; Mentor gives final approval &rarr; Goes Public.
                        </p>
                      </div>
                    </div>

                    {/* Option 2: ADMIN_ONLY */}
                    <div
                      onClick={() =>
                        setSettings((prev) => ({ ...prev, announcementPermission: "ADMIN_ONLY" }))
                      }
                      className={`cursor-pointer p-3.5 sm:p-4 rounded-xl border transition-all flex flex-col justify-between ${
                        settings.announcementPermission === "ADMIN_ONLY"
                          ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary"
                          : "border-border/70 hover:border-border bg-card/60"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Badge
                            variant={settings.announcementPermission === "ADMIN_ONLY" ? "default" : "secondary"}
                            className="text-[10px] font-semibold"
                          >
                            Admin Governed
                          </Badge>
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              settings.announcementPermission === "ADMIN_ONLY"
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-muted-foreground/40"
                            }`}
                          >
                            {settings.announcementPermission === "ADMIN_ONLY" && (
                              <div className="w-1.5 h-1.5 rounded-full bg-background" />
                            )}
                          </div>
                        </div>
                        <h5 className="text-xs sm:text-sm font-bold text-foreground">
                          Only Club Admin Permission Required
                        </h5>
                        <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                          Member creates &rarr; Club Admin reviews & approves &rarr; Directly Goes Public. (Mentor pending approval section remains empty).
                        </p>
                      </div>
                    </div>

                    {/* Option 3: DIRECT */}
                    <div
                      onClick={() =>
                        setSettings((prev) => ({ ...prev, announcementPermission: "DIRECT" }))
                      }
                      className={`cursor-pointer p-3.5 sm:p-4 rounded-xl border transition-all flex flex-col justify-between ${
                        settings.announcementPermission === "DIRECT"
                          ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary"
                          : "border-border/70 hover:border-border bg-card/60"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Badge
                            variant={settings.announcementPermission === "DIRECT" ? "default" : "secondary"}
                            className="text-[10px] font-semibold"
                          >
                            Open Publishing
                          </Badge>
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              settings.announcementPermission === "DIRECT"
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-muted-foreground/40"
                            }`}
                          >
                            {settings.announcementPermission === "DIRECT" && (
                              <div className="w-1.5 h-1.5 rounded-full bg-background" />
                            )}
                          </div>
                        </div>
                        <h5 className="text-xs sm:text-sm font-bold text-foreground">
                          Direct Member Publishing
                        </h5>
                        <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                          Any enrolled club member can directly publish announcements without waiting for admin or mentor approval.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Event Publish Permission */}
                <div className="space-y-3 pt-5 sm:pt-6 border-t border-border/60">
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      Event Publishing Permission
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Define the review hierarchy required before events are published publicly on the campus calendar.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Option 1: MENTOR_REQUIRED */}
                    <div
                      onClick={() =>
                        setSettings((prev) => ({ ...prev, eventPermission: "MENTOR_REQUIRED" }))
                      }
                      className={`cursor-pointer p-3.5 sm:p-4 rounded-xl border transition-all flex flex-col justify-between ${
                        settings.eventPermission === "MENTOR_REQUIRED"
                          ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary"
                          : "border-border/70 hover:border-border bg-card/60"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Badge
                            variant={
                              settings.eventPermission === "MENTOR_REQUIRED" ? "default" : "secondary"
                            }
                            className="text-[10px] font-semibold"
                          >
                            Multi-Tier Approval
                          </Badge>
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              settings.eventPermission === "MENTOR_REQUIRED"
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-muted-foreground/40"
                            }`}
                          >
                            {settings.eventPermission === "MENTOR_REQUIRED" && (
                              <div className="w-1.5 h-1.5 rounded-full bg-background" />
                            )}
                          </div>
                        </div>
                        <h5 className="text-xs sm:text-sm font-bold text-foreground">
                          Club Mentor Permission Required
                        </h5>
                        <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                          Member organizes &rarr; Club Admin approves first &rarr; Moves to Mentor Pending Approval section &rarr; Mentor gives final approval &rarr; Goes Public.
                        </p>
                      </div>
                    </div>

                    {/* Option 2: ADMIN_ONLY */}
                    <div
                      onClick={() =>
                        setSettings((prev) => ({ ...prev, eventPermission: "ADMIN_ONLY" }))
                      }
                      className={`cursor-pointer p-3.5 sm:p-4 rounded-xl border transition-all flex flex-col justify-between ${
                        settings.eventPermission === "ADMIN_ONLY"
                          ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary"
                          : "border-border/70 hover:border-border bg-card/60"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Badge
                            variant={settings.eventPermission === "ADMIN_ONLY" ? "default" : "secondary"}
                            className="text-[10px] font-semibold"
                          >
                            Admin Governed
                          </Badge>
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              settings.eventPermission === "ADMIN_ONLY"
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-muted-foreground/40"
                            }`}
                          >
                            {settings.eventPermission === "ADMIN_ONLY" && (
                              <div className="w-1.5 h-1.5 rounded-full bg-background" />
                            )}
                          </div>
                        </div>
                        <h5 className="text-xs sm:text-sm font-bold text-foreground">
                          Only Club Admin Permission Required
                        </h5>
                        <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                          Member organizes &rarr; Club Admin reviews & approves &rarr; Directly Goes Public. (Mentor pending approval section remains empty).
                        </p>
                      </div>
                    </div>

                    {/* Option 3: DIRECT */}
                    <div
                      onClick={() =>
                        setSettings((prev) => ({ ...prev, eventPermission: "DIRECT" }))
                      }
                      className={`cursor-pointer p-3.5 sm:p-4 rounded-xl border transition-all flex flex-col justify-between ${
                        settings.eventPermission === "DIRECT"
                          ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary"
                          : "border-border/70 hover:border-border bg-card/60"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Badge
                            variant={settings.eventPermission === "DIRECT" ? "default" : "secondary"}
                            className="text-[10px] font-semibold"
                          >
                            Open Publishing
                          </Badge>
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              settings.eventPermission === "DIRECT"
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-muted-foreground/40"
                            }`}
                          >
                            {settings.eventPermission === "DIRECT" && (
                              <div className="w-1.5 h-1.5 rounded-full bg-background" />
                            )}
                          </div>
                        </div>
                        <h5 className="text-xs sm:text-sm font-bold text-foreground">
                          Direct Member Publishing
                        </h5>
                        <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                          Any enrolled club member can directly publish events without waiting for admin or mentor approval.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save Settings Action */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-5 sm:pt-6 border-t border-border/60">
                  <Button
                    variant="default"
                    size="sm"
                    disabled={savingSettings}
                    onClick={handleSaveSettings}
                    className="text-xs font-semibold h-9 px-5 shadow-xs w-full sm:w-auto"
                  >
                    <ShieldCheck className="w-4 h-4 mr-1.5 text-emerald-400" />
                    {savingSettings ? "Saving Policies..." : "Save Governance Policies"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone: Dissolve / Delete Club */}
            <Card className="border-destructive/30 bg-destructive/5 rounded-2xl shadow-xs mt-6 overflow-hidden">
              <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3 border-b border-destructive/15">
                <div className="flex items-center gap-2 text-destructive">
                  <ShieldAlert className="w-5 h-5 shrink-0" />
                  <CardTitle className="text-base sm:text-lg font-bold">
                    Danger Zone: Club Deletion
                  </CardTitle>
                </div>
                <CardDescription className="text-xs text-muted-foreground mt-1">
                  As the designated faculty mentor, you hold the institutional authority to permanently dissolve or delete this club from the college.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                  <h5 className="text-xs sm:text-sm font-semibold text-foreground">
                    Dissolve {dashboardData?.clubName || "Club"}
                  </h5>
                  <p className="text-[11px] text-muted-foreground leading-relaxed max-w-xl">
                    Once deleted, all club records, announcements, past and ongoing events, registrations, teams, and member associations will be wiped immediately. This cannot be undone.
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteClub}
                  className="text-xs font-semibold h-9 px-4 shrink-0 shadow-xs w-full sm:w-auto"
                >
                  <Trash2 className="w-4 h-4 mr-1.5" />
                  Dissolve Club
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialog: Create/Edit Announcement Draft */}
        <Dialog open={createAnnDraftOpen} onOpenChange={(open) => {
          setCreateAnnDraftOpen(open);
          if (!open) setEditingDraftId(null);
        }}>
          <DialogContent className="w-[95vw] sm:max-w-lg rounded-2xl p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg font-bold">
                {editingDraftId ? "Edit Announcement Draft" : "Create Announcement Draft"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {editingDraftId
                  ? "Update your saved bulletin draft for " + (dashboardData?.clubName || "this club") + "."
                  : "Draft a new bulletin for " + (dashboardData?.clubName || "this club") + ". You can edit and publish it anytime."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSaveAnnouncementDraft} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Title *</label>
                <Input
                  value={annDraftForm.title}
                  onChange={(e) =>
                    setAnnDraftForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="e.g. Annual Hackathon Registrations Open"
                  className="text-xs sm:text-sm h-9"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Content / Body</label>
                <MarkdownEditor
                  value={annDraftForm.content}
                  onChange={(val) =>
                    setAnnDraftForm((prev) => ({ ...prev, content: val }))
                  }
                  placeholder="Provide complete announcement details, instructions, links, or meeting info in Markdown..."
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
                    setCreateAnnDraftOpen(false);
                  }}
                  className="text-xs h-9"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={savingAnnDraft}
                  className="text-xs h-9 font-medium shadow-xs"
                >
                  {savingAnnDraft ? "Saving..." : (editingDraftId ? "Update Draft" : "Save Draft")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog: View Full Announcement Details */}
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
                  {viewAnnouncement?.clubName || dashboardData?.clubName || "Campus Club Announcement"}
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

        {/* Dialog: Create Event Draft */}
        <Dialog open={createEventDraftOpen} onOpenChange={setCreateEventDraftOpen}>
          <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg font-bold">
                Create Event Draft
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Prepare a complete event proposal for {dashboardData?.clubName || "Club"}.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSaveEventDraft} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Event Title *</label>
                <Input
                  value={eventDraftForm.title}
                  onChange={(e) =>
                    setEventDraftForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="e.g. Tech Workshop & Code Sprint"
                  className="text-xs sm:text-sm h-9"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Description</label>
                <Textarea
                  value={eventDraftForm.description}
                  onChange={(e) =>
                    setEventDraftForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Detailed schedule, agenda, topics, instructions..."
                  rows={3}
                  className="text-xs sm:text-sm"
                />
              </div>

              {/* Event Type & Public Visibility */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-accent/20 border border-border/60">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Event Format</label>
                  <select
                    value={eventDraftForm.eventType}
                    onChange={(e) =>
                      setEventDraftForm((prev) => ({ ...prev, eventType: e.target.value }))
                    }
                    className="w-full h-9 px-3 rounded-md border border-input bg-background text-xs sm:text-sm"
                  >
                    <option value="OFFLINE">Offline (In-Person)</option>
                    <option value="ONLINE">Online (Virtual)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Visibility & Access</label>
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="mentorDraftIsPublic"
                      checked={eventDraftForm.isPublic}
                      onChange={(e) =>
                        setEventDraftForm((prev) => ({ ...prev, isPublic: e.target.checked }))
                      }
                      className="rounded border-input text-primary h-4 w-4"
                    />
                    <label htmlFor="mentorDraftIsPublic" className="text-xs text-foreground cursor-pointer">
                      Public (Open to All Colleges)
                    </label>
                  </div>
                </div>
              </div>

              {/* Payment Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Registration Type</label>
                <select
                  value={eventDraftForm.registrationPayment}
                  onChange={(e) =>
                    setEventDraftForm((prev) => ({ ...prev, registrationPayment: e.target.value }))
                  }
                  className="w-full h-9 px-3 rounded-md border border-input bg-background text-xs sm:text-sm"
                >
                  <option value="FREE">Free Registration</option>
                  <option value="PAID">Paid Registration</option>
                  <option value="PAID_FOR_GUEST">Paid For Guest Only (Free for College Students)</option>
                </select>
              </div>

              {/* Registration Plans if Paid */}
              {eventDraftForm.registrationPayment !== "FREE" && (
                <div className="p-3.5 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-foreground">
                      Registration Plans ({eventDraftForm.registrationPlans.length})
                    </label>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <Input
                      placeholder="Plan Name (e.g. Standard)"
                      value={newDraftPlan.planName}
                      onChange={(e) => setNewDraftPlan((prev) => ({ ...prev, planName: e.target.value }))}
                      className="text-xs h-8"
                    />
                    <Input
                      type="number"
                      placeholder="Amount (₹)"
                      value={newDraftPlan.amount}
                      onChange={(e) => setNewDraftPlan((prev) => ({ ...prev, amount: e.target.value }))}
                      className="text-xs h-8"
                    />
                    <Input
                      type="number"
                      placeholder="Max Seats"
                      value={newDraftPlan.maxSeats}
                      onChange={(e) => setNewDraftPlan((prev) => ({ ...prev, maxSeats: e.target.value }))}
                      className="text-xs h-8"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddDraftPlan}
                      className="text-xs h-8"
                    >
                      + Add Plan
                    </Button>
                  </div>

                  {eventDraftForm.registrationPlans.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      {eventDraftForm.registrationPlans.map((plan, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-background border border-border/60 text-xs">
                          <div>
                            <span className="font-semibold">{plan.planName}</span>
                            <span className="text-muted-foreground ml-2">₹{plan.amount}</span>
                            {plan.maxSeats && <span className="text-muted-foreground ml-2">({plan.maxSeats} seats)</span>}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveDraftPlan(idx)}
                            className="text-destructive hover:underline text-xs"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Event Timing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Event Start Time</label>
                  <Input
                    type="datetime-local"
                    value={eventDraftForm.startTime}
                    onChange={(e) =>
                      setEventDraftForm((prev) => ({ ...prev, startTime: e.target.value }))
                    }
                    className="text-xs h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Event End Time</label>
                  <Input
                    type="datetime-local"
                    value={eventDraftForm.endTime}
                    onChange={(e) =>
                      setEventDraftForm((prev) => ({ ...prev, endTime: e.target.value }))
                    }
                    className="text-xs h-9"
                  />
                </div>
              </div>

              {/* Registration Window */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Registration Start</label>
                  <Input
                    type="datetime-local"
                    value={eventDraftForm.registrationStart}
                    onChange={(e) =>
                      setEventDraftForm((prev) => ({ ...prev, registrationStart: e.target.value }))
                    }
                    className="text-xs h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Registration End</label>
                  <Input
                    type="datetime-local"
                    value={eventDraftForm.registrationEnd}
                    onChange={(e) =>
                      setEventDraftForm((prev) => ({ ...prev, registrationEnd: e.target.value }))
                    }
                    className="text-xs h-9"
                  />
                </div>
              </div>

              {/* Structured Location if Offline */}
              {eventDraftForm.eventType !== "ONLINE" && (
                <div className="p-3.5 rounded-xl bg-accent/20 border border-border/60 space-y-3">
                  <label className="text-xs font-bold text-foreground">Location Details</label>
                  <div className="space-y-2">
                    <Input
                      placeholder="Venue Address / Building / Room"
                      value={eventDraftForm.location?.address || ""}
                      onChange={(e) =>
                        setEventDraftForm((prev) => ({
                          ...prev,
                          location: { ...prev.location, address: e.target.value },
                        }))
                      }
                      className="text-xs sm:text-sm h-9"
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        placeholder="City"
                        value={eventDraftForm.location?.city || ""}
                        onChange={(e) =>
                          setEventDraftForm((prev) => ({
                            ...prev,
                            location: { ...prev.location, city: e.target.value },
                          }))
                        }
                        className="text-xs h-8"
                      />
                      <Input
                        placeholder="State"
                        value={eventDraftForm.location?.state || ""}
                        onChange={(e) =>
                          setEventDraftForm((prev) => ({
                            ...prev,
                            location: { ...prev.location, state: e.target.value },
                          }))
                        }
                        className="text-xs h-8"
                      />
                      <Input
                        placeholder="Country"
                        value={eventDraftForm.location?.country || ""}
                        onChange={(e) =>
                          setEventDraftForm((prev) => ({
                            ...prev,
                            location: { ...prev.location, country: e.target.value },
                          }))
                        }
                        className="text-xs h-8"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Eligibility & Prize Money */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Target Batch Year</label>
                  <Input
                    type="number"
                    placeholder="e.g. 2026"
                    value={eventDraftForm.batchYear}
                    onChange={(e) =>
                      setEventDraftForm((prev) => ({ ...prev, batchYear: e.target.value }))
                    }
                    className="text-xs h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Prize Money (₹)</label>
                  <Input
                    type="number"
                    placeholder="e.g. 25000"
                    value={eventDraftForm.prizeMoney}
                    onChange={(e) =>
                      setEventDraftForm((prev) => ({ ...prev, prizeMoney: e.target.value }))
                    }
                    className="text-xs h-9"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Eligibility Criteria</label>
                  <Input
                    placeholder="e.g. Open to CS & IT students"
                    value={eventDraftForm.eligibility}
                    onChange={(e) =>
                      setEventDraftForm((prev) => ({ ...prev, eligibility: e.target.value }))
                    }
                    className="text-xs h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Selection Criteria</label>
                  <Input
                    placeholder="e.g. First-come first-served"
                    value={eventDraftForm.criteria}
                    onChange={(e) =>
                      setEventDraftForm((prev) => ({ ...prev, criteria: e.target.value }))
                    }
                    className="text-xs h-9"
                  />
                </div>
              </div>

              <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-3 border-t border-border/60">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCreateEventDraftOpen(false)}
                  className="text-xs h-9"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={savingEventDraft}
                  className="text-xs h-9 font-medium shadow-xs"
                >
                  {savingEventDraft ? "Saving..." : "Save Event Draft"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Global Action Confirmation Dialog */}
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

        {/* Return to Professor Dashboard Dialog */}
        <SubDashboardLoginDialog
          open={returnDialogOpen}
          onOpenChange={(open) => {
            if (!open) setReturnError("");
            setReturnDialogOpen(open);
          }}
          title="Return to Professor Dashboard"
          description="Enter your registered professor account password to restore your professor session."
          icon={GraduationCap}
          onSubmit={handleReturnToProfessor}
          loading={returnLoading}
          error={returnError}
        />
      </div>
    </DashboardLayout>
  );
}
