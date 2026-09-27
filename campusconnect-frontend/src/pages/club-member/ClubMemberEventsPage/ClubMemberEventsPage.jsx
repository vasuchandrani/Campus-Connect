import "./ClubMemberEventsPage.css";
import { useEffect, useState, useMemo, useCallback } from "react";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import { Card, CardContent } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Textarea } from "../../../components/ui/Textarea";
import { Label } from "../../../components/ui/Label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "../../../components/ui/Dialog";
import { Plus, Clock, MapPin, Edit, Trash2, Eye, Calendar } from "lucide-react";
import { clubMemberNavItems } from "../../../config/Navigation";
import { useParams } from "react-router-dom";
import { toast } from "../../../hooks/use-toast";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/Tabs";
import { useNavigate } from "react-router-dom";
import { FileText } from "lucide-react";
import { marked } from "marked";
import { Badge } from "../../../components/ui/Badge";
import PageSkeleton from "../../../components/ui/PageSkeleton";
import EmptyState from "../../../components/ui/EmptyState";
import { Download } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import { clubMemberApi } from "../../../services/api";

const ClubMemberEventsPage = () => {
  let { clubId } = useParams();
  const { isClubMember } = useAuth();
  const navigate = useNavigate();

  const updatenavItems = useCallback(() => {
    return clubMemberNavItems.map((item) => ({
      ...item,
      href: item.href.replace(":clubId", clubId),
    }));
  }, [clubId]);

  // ─── State ──────────────────────────────────────────────────────
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [dialogType, setDialogType] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [overviewEvent, setOverviewEvent] = useState(null);
  const [overviewTab, setOverviewTab] = useState("write");
  const [overviewMarkdown, setOverviewMarkdown] = useState("");
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isOverviewOpen, setIsOverviewOpen] = useState(false);
  const [speakers, setSpeakers] = useState([]);
  const [newSpeaker, setNewSpeaker] = useState({ name: "", email: "", tagline: "" });
  const [sponsors, setSponsors] = useState([]);
  const [newSponsor, setNewSponsor] = useState({ name: "", tagline: "" });
  const [requesting, setRequesting] = useState(false);
  const [winners, setWinners] = useState([]);
  const [newWinner, setNewWinner] = useState({ name: "", email: "" });
  const [newEvent, setNewEvent] = useState({
    title: "", date: "", time: "", endDate: "", endTime: "",
    registrationStartDate: "", registrationEnd: "",
    eventType: "OFFLINE", isPublic: false, registrationPayment: "FREE",
    location: { address: "", city: "", state: "", country: "" },
    description: "", image: null, speakers: [], sponsors: [],
    departmentId: null, batchYear: null, criteria: "", eligibility: "",
    prizeMoney: null, registrationPlans: [],
  });
  const [newPlan, setNewPlan] = useState({ planName: "", planDescription: "", amount: "", maxSeats: "" });
  const [now, setNow] = useState(new Date());
  const [loading, setLoading] = useState({ upcoming: true, past: true });

  // ─── Helpers ────────────────────────────────────────────────────
  const resetCreateEventForm = () => {
    setNewEvent({
      title: "", image: null, date: "", time: "",
      registrationStartDate: "", registrationEnd: "",
      eventType: "OFFLINE", isPublic: false, registrationPayment: "FREE",
      location: { address: "", city: "", state: "", country: "" },
      description: "", endDate: "", endTime: "",
      departmentId: null, batchYear: null, criteria: "", eligibility: "",
      prizeMoney: null, registrationPlans: [],
    });
    setSpeakers([]); setSponsors([]);
    setNewSpeaker({ name: "", email: "", tagline: "" });
    setNewSponsor({ name: "", tagline: "" });
    setNewPlan({ planName: "", planDescription: "", amount: "", maxSeats: "" });
  };

  const handleAddPlan = () => {
    if (!newPlan.planName.trim()) {
      toast({ title: "Validation Error", description: "Plan name is required", variant: "destructive" });
      return;
    }
    const plan = {
      planName: newPlan.planName.trim(),
      planDescription: newPlan.planDescription.trim(),
      amount: parseFloat(newPlan.amount) || 0,
      maxSeats: newPlan.maxSeats ? parseInt(newPlan.maxSeats, 10) : null,
    };
    setNewEvent((prev) => ({
      ...prev,
      registrationPlans: [...prev.registrationPlans, plan],
    }));
    setNewPlan({ planName: "", planDescription: "", amount: "", maxSeats: "" });
  };

  const handleRemovePlan = (index) => {
    setNewEvent((prev) => ({
      ...prev,
      registrationPlans: prev.registrationPlans.filter((_, i) => i !== index),
    }));
  };

  const fetchEventOverviewDetails = async (eventId) => {
    try {
      const data = await clubMemberApi.getEventDetails(clubId, eventId);
      setOverviewEvent(data);
      if (data.overview) setOverviewMarkdown(data.overview);
      if (data.winners) setWinners(data.winners);
      if (data.images) setExistingImages(data.images);
      setNewImages([]); setIsOverviewOpen(true);
    } catch (err) {
      toast({ title: "Error", description: err.message || "Failed to fetch event overview", variant: "destructive" });
    }
  };

  useEffect(() => {
    const interval = setInterval(() => { setNow(new Date()); }, 1000);
    return () => clearInterval(interval);
  }, []);

  const renderedPreview = marked.parse(overviewMarkdown || "");
  const today = new Date().toISOString().split("T")[0];
  const currentTime = now.toTimeString().slice(0, 5);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (existingImages.length + newImages.length + files.length > 10) {
      toast({ title: "Limit exceeded", description: "Maximum 10 images allowed", variant: "destructive" });
      return;
    }
    setNewImages((prev) => [...prev, ...files]);
    e.target.value = null;
  };

  const allImages = [...existingImages, ...newImages];

  const formatDate = (dateTime) => {
    if (!dateTime) return { date: "", time: "" };
    const [date, time] = dateTime.split("T");
    return { date, time: time.substring(0, 5) };
  };

  const getEventStatus = (event) => {
    const start = new Date(event.startTime);
    const end = new Date(event.endTime);
    if (now >= start && now <= end) return "LIVE";
    if (now < start) return "UPCOMING";
    return "FINISHED";
  };

  // ─── Data Fetching ──────────────────────────────────────────────
  const fetchPastEvents = async () => {
    try {
      setLoading((prev) => ({ ...prev, past: true }));
      const data = await clubMemberApi.getFinishedEvents(clubId);
      setPastEvents(data || []);
    } catch (err) {
      toast({ title: "Error", description: "Failed to fetch events", variant: "destructive" });
    } finally { setLoading((prev) => ({ ...prev, past: false })); }
  };

  const fetchUpcomingEvents = async () => {
    try {
      setLoading((prev) => ({ ...prev, upcoming: true }));
      const data = await clubMemberApi.getActiveEvents(clubId);
      setUpcomingEvents(data || []);
    } catch (err) {
      toast({ title: "Error", description: "Failed to fetch upcoming events", variant: "destructive" });
    } finally { setLoading((prev) => ({ ...prev, upcoming: false })); }
  };

  const fetchClubEvents = async () => {
    await Promise.all([fetchPastEvents(), fetchUpcomingEvents()]);
  };

  const removeImage = (index) => {
    if (index < existingImages.length) {
      setExistingImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      const newIndex = index - existingImages.length;
      setNewImages((prev) => prev.filter((_, i) => i !== newIndex));
    }
  };

  // ─── Validation ─────────────────────────────────────────────────
  const checkEventDetails = (event) => {
    const start = new Date(`${event.date}T${event.time}`);
    const end = new Date(`${event.endDate}T${event.endTime}`);
    const registrationEnd = new Date(`${event.registrationEnd}T23:59:59`);
    const todayDate = new Date(); todayDate.setHours(0, 0, 0, 0);
    if (new Date(event.date) < todayDate) {
      toast({ title: "Invalid date", description: "Event start date cannot be in the past.", variant: "destructive" }); return true;
    }
    if (new Date(event.registrationEnd) < todayDate) {
      toast({ title: "Invalid date", description: "Registration end cannot be in the past.", variant: "destructive" }); return true;
    }
    if (registrationEnd >= start) {
      toast({ title: "Invalid registration date", description: "Registration must close before the event starts.", variant: "destructive" }); return true;
    }
    if (end <= start) {
      toast({ title: "Invalid event time", description: "Event end must be after event start.", variant: "destructive" }); return true;
    }
    if (start < new Date()) {
      toast({ title: "Invalid Time", description: "Event start time cannot be in the past", variant: "destructive" }); return true;
    }
    return false;
  };

  // ─── CRUD Handlers ──────────────────────────────────────────────
  const handleCreateEvent = async () => {
    if (checkEventDetails(newEvent)) return;
    const payload = {
      title: newEvent.title, description: newEvent.description,
      eventType: newEvent.eventType || "OFFLINE", isPublic: newEvent.isPublic || false,
      registrationPayment: newEvent.registrationPayment || "FREE",
      startTime: `${newEvent.date}T${newEvent.time}:00`,
      endTime: `${newEvent.endDate}T${newEvent.endTime}:00`,
      registrationStart: newEvent.registrationStartDate ? `${newEvent.registrationStartDate}T00:00:00` : new Date().toISOString(),
      registrationEnd: `${newEvent.registrationEnd}T23:59:59`,
      location: newEvent.eventType === "ONLINE" ? null : newEvent.location,
      sponsors, speakers,
      departmentId: newEvent.departmentId || null, batchYear: newEvent.batchYear || null,
      criteria: newEvent.criteria || null, eligibility: newEvent.eligibility || null,
      prizeMoney: newEvent.prizeMoney || null,
      registrationPlans: newEvent.registrationPayment !== "FREE" ? newEvent.registrationPlans : [],
    };
    try {
      const formData = new FormData();
      formData.append("event", new Blob([JSON.stringify(payload)], { type: "application/json" }));
      if (newEvent.image) formData.append("image", newEvent.image);
      setRequesting(true);
      const data = await clubMemberApi.createEvent(clubId, formData);
      toast({ title: "Success", description: data?.message || "Event created successfully", variant: "success" });
      fetchClubEvents(); setCreateOpen(false); resetCreateEventForm();
    } catch (error) {
      toast({ title: "Error", description: error.message || "Failed to create event", variant: "destructive" });
    } finally { setRequesting(false); }
  };

  const handleSaveEdit = async () => {
    const startTime = `${selectedEvent.date}T${selectedEvent.time}:00`;
    const registrationEnd = `${selectedEvent.registrationEndDate}T23:59:59`;
    const endTime = `${selectedEvent.endDate}T${selectedEvent.endTime}:00`;
    const payload = {
      title: selectedEvent.title, description: selectedEvent.description,
      location: selectedEvent.location, startTime, registrationEnd, endTime,
      speakers, sponsors,
    };
    const formData = new FormData();
    formData.append("event", new Blob([JSON.stringify(payload)], { type: "application/json" }));
    if (selectedEvent.image instanceof File) formData.append("image", selectedEvent.image);
    try {
      setRequesting(true);
      const data = await clubMemberApi.updateEvent(clubId, selectedEvent.id, formData);
      fetchClubEvents(); resetCreateEventForm(); setCreateOpen(false);
      toast({ title: "Success", description: data?.message || "Event updated successfully", variant: "success" });
    } catch (err) {
      toast({ title: "Error", description: err.message || "Failed to update event", variant: "destructive" });
    } finally { setDialogType(null); setSelectedEvent(null); setRequesting(false); }
  };

  const handleDelete = async (id) => {
    setRequesting(true);
    try {
      const data = await clubMemberApi.deleteEvent(clubId, id);
      fetchClubEvents();
      toast({ title: "Success", description: data?.message || "Event deleted successfully", variant: "success" });
    } catch (err) {
      toast({ title: "Error", description: err.message || "Failed to delete event", variant: "destructive" });
    } finally { setRequesting(false); }
  };

  // ─── Init ───────────────────────────────────────────────────────
  useEffect(() => {
    const checkMemberAndFetchData = async () => {
      try {
        const admin = await isClubMember(clubId);
        if (!admin) {
          toast({ title: "Unauthorized", description: "You are not a member of this club", variant: "destructive" });
          navigate(-1); return;
        }
        fetchClubEvents();
      } catch (error) {
        toast({ title: "Unauthorized", description: "You are not a member of this club", variant: "destructive" });
        navigate(-1);
      }
    };
    checkMemberAndFetchData();
  }, [clubId]);

  const sortedEvents = useMemo(() => {
    const statusPriority = { LIVE: 1, UPCOMING: 2 };
    return [...upcomingEvents].sort((a, b) => {
      const statusDiff = (statusPriority[a.status] || 99) - (statusPriority[b.status] || 99);
      if (statusDiff !== 0) return statusDiff;
      if (a.status === "UPCOMING") {
        if (a.register && !b.register) return -1;
        if (!a.register && b.register) return 1;
        return new Date(a.eventDate) - new Date(b.eventDate);
      }
      return 0;
    });
  }, [upcomingEvents]);

  // Generate overview using AI
  const handleGenerateOverview = async () => {
    setIsGenerating(true);
    setRequesting(true);
    try {
      const data = await clubMemberApi.generateOverview(clubId, overviewEvent.id);
      setOverviewMarkdown(data);
      toast({ title: "Success", description: "Overview generated successfully", variant: "success" });
    } catch (err) {
      toast({ title: "Error", description: err.message || "Failed to generate overview", variant: "destructive" });
    } finally { setIsGenerating(false); setRequesting(false); }
  };

  const handleSaveOverview = async () => {
    setIsSaving(true);
    const formData = new FormData();
    const overviewDto = { overview: overviewMarkdown, winners: winners, oldImages: existingImages };
    formData.append("overview", new Blob([JSON.stringify(overviewDto)], { type: "application/json" }));
    newImages.forEach((img) => { formData.append("images", img); });
    try {
      const data = await clubMemberApi.saveOverview(clubId, overviewEvent.id, formData);
      if (data?.message === "Event Overview saved successfully") {
        toast({ title: "Success", description: data.message });
        setOverviewMarkdown(""); setExistingImages([]); setNewImages([]); setWinners([]);
        setIsOverviewOpen(false); fetchClubEvents();
      }
    } catch (err) {
      toast({ title: "Error", description: err.message || "Failed to save overview", variant: "destructive" });
    } finally { setIsSaving(false); }
  };

  const handleAddSpeaker = () => {
    if (!newSpeaker.name.trim() || !newSpeaker.email.trim()) return;
    setSpeakers([...speakers, newSpeaker]);
    setNewSpeaker({ name: "", email: "", tagline: "" });
  };

  const handleRemoveSpeaker = (index) => {
    setSpeakers(speakers.filter((_, i) => i !== index));
  };

  const handleAddSponsor = () => {
    if (!newSponsor.name.trim() || !newSponsor.tagline.trim()) return;
    setSponsors([...sponsors, newSponsor]);
    setNewSponsor({ name: "", tagline: "" });
  };

  const handleRemoveSponsor = (index) => {
    setSponsors(sponsors.filter((_, i) => i !== index));
  };

  const handleAddWinner = () => {
    if (!newWinner.name.trim() || !newWinner.email.trim()) return;
    setWinners([...winners, newWinner]);
    setNewWinner({ name: "", email: "" });
  };

  const handleRemoveWinner = (index) => {
    setWinners(winners.filter((_, i) => i !== index));
  };

  function getDuration(startDate, endDate) {
    if (!startDate || !endDate) return "";
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffMs = end - start;
    if (diffMs < 0) return "Invalid dates";
    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  }

  const downloadExcel = async function (eventId) {
    setRequesting(true);
    try {
      const blob = await clubMemberApi.downloadRegistrations(clubId, eventId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "event_registrations.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed", err);
      toast({ variant: "destructive", title: "Download failed", description: err.message || "Unable to download registrations" });
    } finally { setRequesting(false); }
  };

  //---------------------------UI---------------------------//
  const pageLoading = loading.upcoming && loading.past;
  if (pageLoading) {
    return (
      <DashboardLayout navItems={updatenavItems()} title="Events">
        <PageSkeleton variant="cards" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={updatenavItems()} title="Events">
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex justify-between">
          <div>
            <h1 className="text-3xl font-bold">Events</h1>
            <p className="text-muted-foreground">Manage your club events</p>
          </div>

          {/* CREATE */}
          <Dialog
            open={createOpen}
            onOpenChange={(open) => {
              setCreateOpen(open);
              if (!open) {
                resetCreateEventForm();
              }
            }}
          >
            <DialogTrigger asChild>
              <Button disabled={requesting}>
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </DialogTrigger>

            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Event</DialogTitle>
              </DialogHeader>
              <DialogDescription></DialogDescription>

              <div className="space-y-4 pt-4">
                <Label>Title</Label>
                <Input
                  placeholder="Event Title"
                  value={newEvent.title}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, title: e.target.value })
                  }
                />

                <Label>Upload Image</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setNewEvent({ ...newEvent, image: file });
                    }
                  }}
                />

                {newEvent.image && (
                  <img
                    src={URL.createObjectURL(newEvent.image)}
                    className="w-full h-40 object-cover rounded-lg"
                  />
                )}

                {/* EVENT FORMAT & VISIBILITY */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 rounded-xl bg-accent/20 border border-border/60">
                  <div>
                    <Label className="text-xs font-semibold">Event Format</Label>
                    <select
                      value={newEvent.eventType || "OFFLINE"}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, eventType: e.target.value })
                      }
                      className="w-full h-9 px-3 mt-1.5 rounded-md border border-input bg-background text-xs sm:text-sm"
                    >
                      <option value="OFFLINE">Offline (In-Person)</option>
                      <option value="ONLINE">Online (Virtual)</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Visibility & Access</Label>
                    <div className="flex items-center gap-2 pt-3">
                      <input
                        type="checkbox"
                        id="memberCreateIsPublic"
                        checked={newEvent.isPublic || false}
                        onChange={(e) =>
                          setNewEvent({ ...newEvent, isPublic: e.target.checked })
                        }
                        className="rounded border-input text-primary h-4 w-4"
                      />
                      <label htmlFor="memberCreateIsPublic" className="text-xs text-foreground cursor-pointer">
                        Public (Open to All Colleges)
                      </label>
                    </div>
                  </div>
                </div>

                {/* REGISTRATION PAYMENT TYPE */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Registration Payment Type</Label>
                  <select
                    value={newEvent.registrationPayment || "FREE"}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, registrationPayment: e.target.value })
                    }
                    className="w-full h-9 px-3 rounded-md border border-input bg-background text-xs sm:text-sm"
                  >
                    <option value="FREE">Free Registration</option>
                    <option value="PAID">Paid Registration</option>
                    <option value="PAID_FOR_GUEST">Paid For Guest Only (Free for College Students)</option>
                  </select>
                </div>

                {/* REGISTRATION PLANS BUILDER */}
                {newEvent.registrationPayment !== "FREE" && (
                  <div className="p-3.5 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
                    <Label className="text-xs font-bold text-foreground">
                      Registration Plans ({newEvent.registrationPlans.length})
                    </Label>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <Input
                        placeholder="Plan Name (e.g. Standard)"
                        value={newPlan.planName}
                        onChange={(e) => setNewPlan({ ...newPlan, planName: e.target.value })}
                        className="text-xs h-8"
                      />
                      <Input
                        type="number"
                        placeholder="Amount (₹)"
                        value={newPlan.amount}
                        onChange={(e) => setNewPlan({ ...newPlan, amount: e.target.value })}
                        className="text-xs h-8"
                      />
                      <Input
                        type="number"
                        placeholder="Max Seats"
                        value={newPlan.maxSeats}
                        onChange={(e) => setNewPlan({ ...newPlan, maxSeats: e.target.value })}
                        className="text-xs h-8"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddPlan}
                        className="text-xs h-8"
                      >
                        + Add Plan
                      </Button>
                    </div>

                    {newEvent.registrationPlans.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        {newEvent.registrationPlans.map((plan, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-background border border-border/60 text-xs">
                            <div>
                              <span className="font-semibold">{plan.planName}</span>
                              <span className="text-muted-foreground ml-2">₹{plan.amount}</span>
                              {plan.maxSeats && <span className="text-muted-foreground ml-2">({plan.maxSeats} seats)</span>}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemovePlan(idx)}
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Event Date</Label>
                    <Input
                      type="date"
                      value={newEvent.date}
                      min={today}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, date: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>Event Time</Label>
                    <Input
                      type="time"
                      value={newEvent.time}
                      min={newEvent.date === today ? currentTime : undefined}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, time: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Event End Date</Label>
                    <Input
                      type="date"
                      value={newEvent.endDate}
                      min={newEvent.date || today}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, endDate: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>Event End Time</Label>
                    <Input
                      type="time"
                      value={newEvent.endTime}
                      min={newEvent.date === newEvent.endDate ? newEvent.time : undefined}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, endTime: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Registration Start Date</Label>
                    <Input
                      type="date"
                      value={newEvent.registrationStartDate || ""}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, registrationStartDate: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>Registration End Date</Label>
                    <Input
                      type="date"
                      value={newEvent.registrationEnd}
                      max={newEvent.date || ""}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, registrationEnd: e.target.value })
                      }
                    />
                  </div>
                </div>

                {newEvent.eventType !== "ONLINE" && (
                  <div className="p-3.5 rounded-xl bg-accent/20 border border-border/60 space-y-3">
                    <Label className="text-xs font-bold text-foreground">Location Details</Label>
                    <div className="space-y-2">
                      <Input
                        placeholder="Venue Address / Building / Room"
                        value={typeof newEvent.location === "object" ? newEvent.location.address : newEvent.location}
                        onChange={(e) =>
                          setNewEvent({ ...newEvent, location: { ...newEvent.location, address: e.target.value } })
                        }
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <Input
                          placeholder="City"
                          value={typeof newEvent.location === "object" ? newEvent.location.city || "" : ""}
                          onChange={(e) =>
                            setNewEvent({ ...newEvent, location: { ...newEvent.location, city: e.target.value } })
                          }
                          className="text-xs h-8"
                        />
                        <Input
                          placeholder="State"
                          value={typeof newEvent.location === "object" ? newEvent.location.state || "" : ""}
                          onChange={(e) =>
                            setNewEvent({ ...newEvent, location: { ...newEvent.location, state: e.target.value } })
                          }
                          className="text-xs h-8"
                        />
                        <Input
                          placeholder="Country"
                          value={typeof newEvent.location === "object" ? newEvent.location.country || "" : ""}
                          onChange={(e) =>
                            setNewEvent({ ...newEvent, location: { ...newEvent.location, country: e.target.value } })
                          }
                          className="text-xs h-8"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Target Batch Year</Label>
                    <Input
                      type="number"
                      placeholder="e.g. 2026"
                      value={newEvent.batchYear || ""}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, batchYear: e.target.value ? parseInt(e.target.value, 10) : null })
                      }
                    />
                  </div>
                  <div>
                    <Label>Prize Money (₹)</Label>
                    <Input
                      type="number"
                      placeholder="e.g. 25000"
                      value={newEvent.prizeMoney || ""}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, prizeMoney: e.target.value ? parseInt(e.target.value, 10) : null })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Eligibility Criteria</Label>
                    <Input
                      placeholder="e.g. All engineering students"
                      value={newEvent.eligibility || ""}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, eligibility: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>Selection Criteria</Label>
                    <Input
                      placeholder="e.g. Portfolio review"
                      value={newEvent.criteria || ""}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, criteria: e.target.value })
                      }
                    />
                  </div>
                </div>

                <Label>Description</Label>
                <Textarea
                  placeholder="Description"
                  value={newEvent.description}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, description: e.target.value })
                  }
                />

                {/* SPEAKERS SECTION */}
                <div className="space-y-4 mt-6">
                  <Label>Speakers ({speakers.length})</Label>

                  {/* Add Speaker Form */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <Input placeholder="Name" value={newSpeaker.name} onChange={(e) => setNewSpeaker({ ...newSpeaker, name: e.target.value })} />
                    <Input placeholder="Email" type="email" value={newSpeaker.email} onChange={(e) => setNewSpeaker({ ...newSpeaker, email: e.target.value })} />
                    <Input placeholder="Tagline (e.g. AI Expert)" value={newSpeaker.tagline} onChange={(e) => setNewSpeaker({ ...newSpeaker, tagline: e.target.value })} />
                  </div>

                  <Button variant="outline" size="sm" onClick={handleAddSpeaker} disabled={!newSpeaker.name || !newSpeaker.email || requesting}>
                    + Add Speaker
                  </Button>

                  {/* Speaker List */}
                  {speakers.length > 0 && (
                    <div className="space-y-2">
                      {speakers.map((speaker, index) => (
                        <div key={index} className="border rounded-md p-3 flex justify-between items-start">
                          <div>
                            <p className="font-semibold">{speaker.name}</p>
                            <p className="text-sm text-muted-foreground">{speaker.email}</p>
                            {speaker.tagline && <p className="text-xs italic mt-1">{speaker.tagline}</p>}
                          </div>
                          <button onClick={() => handleRemoveSpeaker(index)} className="text-destructive text-sm">Remove</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* SPONSORS SECTION */}
                <div className="space-y-4 mt-8">
                  <Label>Sponsors ({sponsors.length})</Label>
                  <div className="flex gap-2">
                    <Input placeholder="Sponsor Name" value={newSponsor.name} onChange={(e) => setNewSponsor({ ...newSponsor, name: e.target.value })} />
                    <Input placeholder="Tagline (e.g. Gold Sponsor)" value={newSponsor.tagline} onChange={(e) => setNewSponsor({ ...newSponsor, tagline: e.target.value })} />
                    <Button variant="outline" size="sm" onClick={handleAddSponsor} disabled={!newSponsor.name || !newSponsor.tagline || requesting}>+ Add</Button>
                  </div>

                  {sponsors.length > 0 && (
                    <div className="space-y-2">
                      {sponsors.map((sponsor, index) => (
                        <div key={index} className="border rounded-md p-3 flex justify-between">
                          <div>
                            <p className="font-semibold">{sponsor.name}</p>
                            <p className="text-sm text-muted-foreground">{sponsor.tagline}</p>
                          </div>
                          <button onClick={() => handleRemoveSponsor(index)} className="text-destructive text-sm">Remove</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button className="w-full" onClick={handleCreateEvent} disabled={requesting}>
                  Create Event
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* VIEW + EDIT DIALOG */}
        <Dialog
          open={dialogType !== null}
          onOpenChange={(open) => {
            if (!open) {
              setDialogType(null);
              setSelectedEvent(null);
              setSpeakers([]);
              setSponsors([]);
              setNewSpeaker({ name: "", email: "", tagline: "" });
              setNewSponsor({ name: "", tagline: "" });
            }
          }}
        >
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {dialogType === "view" ? "Event Details" : "Edit Event"}
              </DialogTitle>
            </DialogHeader>
            <DialogDescription></DialogDescription>

            {selectedEvent && (
              <div className="space-y-4 pt-4">
                {dialogType === "view" ? (
                  <>
                    {selectedEvent.image && (
                      <img src={selectedEvent.image} className="w-full h-48 object-cover rounded-lg" />
                    )}
                    <p><strong>Title:</strong> {selectedEvent.title}</p>
                    <p><strong>Description:</strong> {selectedEvent.description}</p>
                    <p><strong>Location:</strong> {selectedEvent.location}</p>
                    <p><strong>start Date:</strong> {formatDate(selectedEvent.startTime).date}</p>
                    <p><strong>Start Time:</strong> {formatDate(selectedEvent.startTime).time}</p>
                    <p>{selectedEvent.endTime && (<span><strong>End Date:</strong> {selectedEvent.endTime.split("T")[0]}</span>)}</p>
                    <p>{selectedEvent.endTime && (<span><strong>End Time:</strong> {selectedEvent.endTime.split("T")[1].substring(0, 5)}</span>)}</p>
                    <p><strong>Registration End:</strong> {formatDate(selectedEvent.registrationEnd).date}</p>
                    <p><strong>Registration Count:</strong> {selectedEvent.registrationsCount}</p>
                    <div>
                      {selectedEvent.speakers && selectedEvent.speakers.length > 0 && (
                        <>
                          <strong>Speakers:</strong>
                          <ul className="list-disc pl-5">
                            {selectedEvent.speakers.map((speaker, index) => (<li key={index}>{speaker.name}</li>))}
                          </ul>
                        </>
                      )}
                    </div>
                    <div>
                      {selectedEvent.sponsors && selectedEvent.sponsors.length > 0 && (
                        <>
                          <strong>Sponsors:</strong>
                          <ul className="list-disc pl-5">
                            {selectedEvent.sponsors.map((sponsor, index) => (<li key={index}>{sponsor.name}</li>))}
                          </ul>
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <Label>Upload Image</Label>
                    <Input type="file" accept="image/*" onChange={(e) => { const file = e.target.files[0]; if (file) { setSelectedEvent({ ...selectedEvent, image: file }); } }} />
                    {selectedEvent.image && (
                      <img src={typeof selectedEvent.image === "string" ? selectedEvent.image : URL.createObjectURL(selectedEvent.image)} className="w-full h-40 object-cover rounded-lg" />
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Event Date</Label>
                        <Input type="date" value={selectedEvent.date || ""} onChange={(e) => setSelectedEvent({ ...selectedEvent, date: e.target.value })} />
                      </div>
                      <div>
                        <Label>Event Time</Label>
                        <Input type="time" value={selectedEvent.time || ""} onChange={(e) => setSelectedEvent({ ...selectedEvent, time: e.target.value })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Event End Date</Label>
                        <Input type="date" value={selectedEvent.endDate || ""} onChange={(e) => setSelectedEvent({ ...selectedEvent, endDate: e.target.value })} />
                      </div>
                      <div>
                        <Label>Event End Time</Label>
                        <Input type="time" value={selectedEvent.endTime || ""} onChange={(e) => setSelectedEvent({ ...selectedEvent, endTime: e.target.value })} />
                      </div>
                    </div>
                    <Label>Registration End Date</Label>
                    <Input type="date" value={selectedEvent.registrationEnd?.split("T")[0] || ""} onChange={(e) => setSelectedEvent({ ...selectedEvent, registrationEnd: e.target.value })} />
                    <Label>Location</Label>
                    <Input value={selectedEvent.location} onChange={(e) => setSelectedEvent({ ...selectedEvent, location: e.target.value })} />
                    <Label>Description</Label>
                    <Textarea value={selectedEvent.description} onChange={(e) => setSelectedEvent({ ...selectedEvent, description: e.target.value })} />

                    {/* SPEAKERS SECTION */}
                    <div className="space-y-4 mt-6">
                      <Label>Speakers ({speakers.length})</Label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <Input placeholder="Name" value={newSpeaker.name} onChange={(e) => setNewSpeaker({ ...newSpeaker, name: e.target.value })} />
                        <Input placeholder="Email" value={newSpeaker.email} onChange={(e) => setNewSpeaker({ ...newSpeaker, email: e.target.value })} />
                        <Input placeholder="Tagline" value={newSpeaker.tagline} onChange={(e) => setNewSpeaker({ ...newSpeaker, tagline: e.target.value })} />
                      </div>
                      <Button variant="outline" size="sm" onClick={handleAddSpeaker} disabled={!newSpeaker.name || !newSpeaker.email || requesting}>+ Add Speaker</Button>
                      {speakers.map((speaker, index) => (
                        <div key={index} className="border rounded-md p-3 flex justify-between">
                          <div>
                            <p className="font-semibold">{speaker.name}</p>
                            <p className="text-sm text-muted-foreground">{speaker.email}</p>
                            <p className="text-xs italic">{speaker.tagline}</p>
                          </div>
                          <button onClick={() => handleRemoveSpeaker(index)} className="text-destructive text-sm">Remove</button>
                        </div>
                      ))}
                    </div>

                    {/* SPONSORS SECTION */}
                    <div className="space-y-4 mt-8">
                      <Label>Sponsors ({sponsors.length})</Label>
                      <div className="flex gap-2">
                        <Input placeholder="Name" value={newSponsor.name} onChange={(e) => setNewSponsor({ ...newSponsor, name: e.target.value })} />
                        <Input placeholder="Tagline" value={newSponsor.tagline} onChange={(e) => setNewSponsor({ ...newSponsor, tagline: e.target.value })} />
                        <Button variant="outline" size="sm" onClick={handleAddSponsor} disabled={requesting}>+ Add</Button>
                      </div>
                      {sponsors.map((sponsor, index) => (
                        <div key={index} className="border rounded-md p-3 flex justify-between">
                          <div>
                            <p className="font-semibold">{sponsor.name}</p>
                            <p className="text-sm text-muted-foreground">{sponsor.tagline}</p>
                          </div>
                          <button onClick={() => handleRemoveSponsor(index)} className="text-destructive text-sm">Remove</button>
                        </div>
                      ))}
                    </div>

                    <Button onClick={handleSaveEdit} className="w-full" disabled={requesting}>Save Changes</Button>
                  </>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Add Overview Dialog */}
        <Dialog open={isOverviewOpen} onOpenChange={(open) => { setIsOverviewOpen(open); if (!open) { setOverviewEvent(null); setOverviewMarkdown(""); setExistingImages([]); setNewImages([]); setOverviewTab("write"); setWinners([]); setNewWinner({ name: "", email: "" }); } }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Event Overview — {overviewEvent?.title}</DialogTitle>
              <DialogDescription>Write in Markdown and add event photos. Switch to Preview to see the rendered result.</DialogDescription>
            </DialogHeader>

            <Tabs value={overviewTab} onValueChange={setOverviewTab} className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="write" className="flex-1">Write</TabsTrigger>
                <TabsTrigger value="preview" className="flex-1">Preview</TabsTrigger>
              </TabsList>

              <TabsContent value="write" className="space-y-4">
                <Textarea placeholder={"## Event Overview\n\nWrite your markdown here..."} className="min-h-[200px] font-mono text-sm" value={overviewMarkdown} onChange={(e) => setOverviewMarkdown(e.target.value)} />
                <div className="space-y-3">
                  <Label>Event Photos ({existingImages.length + newImages.length}/10)</Label>
                  <Label>Upload Overview photos</Label>
                  <Input type="file" accept="image/*" multiple onChange={handleImageUpload} />
                  <div className="grid grid-cols-3 gap-2">
                    {allImages.map((img, index) => (
                      <div key={index} className="relative">
                        <img src={typeof img === "string" ? img : URL.createObjectURL(img)} className="w-full h-24 object-cover rounded-lg" />
                        <button className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded" onClick={() => removeImage(index)}>X</button>
                      </div>
                    ))}
                  </div>

                  {/* WINNERS SECTION */}
                  <div className="space-y-4 mt-8">
                    <Label>Winners ({winners.length})</Label>
                    <div className="flex gap-2">
                      <Input placeholder="Winner Name" value={newWinner.name} onChange={(e) => setNewWinner({ ...newWinner, name: e.target.value })} />
                      <Input placeholder="Email" type="email" value={newWinner.email} onChange={(e) => setNewWinner({ ...newWinner, email: e.target.value })} />
                      <Button variant="outline" size="sm" onClick={handleAddWinner} disabled={!newWinner.name || !newWinner.email || requesting}>+ Add</Button>
                    </div>
                    {winners.length > 0 && (
                      <div className="space-y-2">
                        {winners.map((winner, index) => (
                          <div key={index} className="border rounded-md p-3 flex justify-between">
                            <div>
                              <p className="font-semibold">{winner.name}</p>
                              <p className="text-sm text-muted-foreground">{winner.email}</p>
                            </div>
                            <button onClick={() => handleRemoveWinner(index)} className="text-destructive text-sm">Remove</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="preview">
                <Card className="border-border/50">
                  <CardContent className="p-4 min-h-[200px]">
                    {overviewMarkdown ? (
                      <div className="prose prose-sm text-black" dangerouslySetInnerHTML={{ __html: renderedPreview }} />
                    ) : (
                      <p className="text-muted-foreground text-center py-8">Nothing to preview yet. Write some markdown first.</p>
                    )}
                  </CardContent>
                </Card>
                {allImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    {allImages.map((img, index) => (
                      <img key={index} src={typeof img === "string" ? img : URL.createObjectURL(img)} className="w-full h-24 object-cover rounded-lg" />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={handleGenerateOverview} disabled={isGenerating}>
                {isGenerating ? "Generating..." : "Generate Overview"}
              </Button>
              <Button className="flex-1" onClick={handleSaveOverview} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Overview"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* EVENTS LIST WITH TABS */}
        <Tabs defaultValue="upcoming" className="mt-4">
          <TabsList className="w-full grid grid-cols-2 sm:inline-flex sm:w-auto p-1 bg-muted/60 border border-border/60 rounded-xl gap-1">
            <TabsTrigger value="upcoming">Active & Live</TabsTrigger>
            <TabsTrigger value="finished">Finished</TabsTrigger>
          </TabsList>

          {/* UPCOMING TAB */}
          <TabsContent value="upcoming" className="mt-6">
            <div className="grid md:grid-cols-3 gap-4">
              {sortedEvents.length === 0 ? (
                <div className="col-span-full">
                  <EmptyState icon={<Calendar className="w-12 h-12" />} title="No Active Events" description="You don't have any active events. Click the button above to create your first event!" />
                </div>
              ) : (
                sortedEvents.map((event) => {
                  const formatted = formatDate(event.startTime);
                  const status = getEventStatus(event);
                  return (
                    <Card key={event.id} className="border-border/50">
                      {event.image && (<img src={event.image} alt={event.title} className="w-full h-48 object-cover rounded-t-lg" />)}
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant={status === "LIVE" ? "destructive" : status === "UPCOMING" ? "secondary" : "default"}>{status}</Badge>
                          <div>
                            <Button variant="ghost" size="icon" disabled={requesting} onClick={() => { setSelectedEvent(event); setDialogType("view"); }}><Eye className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" disabled={requesting} onClick={() => {
                              const { date, time } = formatDate(event.startTime);
                              const { date: endDate, time: endTime } = formatDate(event.endTime);
                              const regEnd = formatDate(event.registrationEnd).date;
                              setSelectedEvent({ ...event, date, time, endDate, endTime, registrationEndDate: regEnd });
                              setSpeakers(event.speakers || []);
                              setSponsors(event.sponsors || []);
                              setDialogType("edit");
                            }}><Edit className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(event.id)} disabled={requesting}><Trash2 className="w-4 h-4" /></Button>
                          </div>
                        </div>
                        <h3 className="text-xl font-semibold mb-3">{event.title}</h3>
                        <p className="text-muted-foreground text-sm mb-4">{event.description.substring(0, 100)}{event.description.length > 100 && "..."}</p>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2"><Clock className="w-4 h-4" /><span>{formatted.date} at {formatted.time}</span></div>
                          <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /><span>{event.location}</span></div>
                          <div>{event.startTime && event.endTime && (<span className="text-sm">Duration: {getDuration(event.startTime, event.endTime)}</span>)}</div>
                        </div>
                        <div className="mt-4 ">
                          <Button variant="outline" className="w-full" disabled={requesting} onClick={() =>downloadExcel(event.id)}>
                            <Download className="w-4 h-4 mr-2" />Download Registrations
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          {/* FINISHED TAB */}
          <TabsContent value="finished" className="mt-6">
            <div className="grid md:grid-cols-3 gap-4">
              {pastEvents.length === 0 ? (
                <div className="col-span-full">
                  <EmptyState icon={<Calendar className="w-12 h-12" />} title="No Finished Events" description="You don't have any finished events yet." />
                </div>
              ) : (
                pastEvents.map((event) => {
                  const formatted = formatDate(event.startTime);
                  return (
                    <Card key={event.id} className="border-border/50 overflow-hidden">
                      {event.image && (<img src={event.image} alt={event.title} className="w-full h-48 object-cover rounded-t-lg" />)}
                      <CardContent className="p-6">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="text-xl font-semibold">{event.title}</h3>
                          <span className="text-xs bg-secondary px-2 py-1 rounded">Finished</span>
                        </div>
                        <p className="text-muted-foreground text-sm mb-4">{event.description.substring(0, 40) + (event.description.length > 40 ? "..." : "")}</p>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2"><Clock className="w-4 h-4" /><span>{formatted.date} at {formatted.time}</span></div>
                          <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /><span>{event.location}</span></div>
                        </div>
                        <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-center">
                          <Button variant="outline" className="w-auto" disabled={requesting} onClick={() => navigate(`/campus-connect/club-member/${clubId}/events/${event.id}`)}>
                            <Eye className="w-4 h-4 mr-2" />View Details
                          </Button>
                          <Button variant="secondary" className="w-auto" disabled={requesting} onClick={() => fetchEventOverviewDetails(event.id)}>
                            <FileText className="w-4 h-4 mr-2" />Add Overview
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ClubMemberEventsPage;
