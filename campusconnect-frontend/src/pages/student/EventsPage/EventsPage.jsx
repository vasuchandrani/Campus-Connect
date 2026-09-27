import "./EventsPage.css";
import { useEffect, useState, useMemo } from "react";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import { studentNavItems } from "../../../config/Navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../../components/ui/Dialog";
import { toast } from "../../../hooks/use-toast";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/Tabs";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import PageSkeleton from "../../../components/ui/PageSkeleton";
import EmptyState from "../../../components/ui/EmptyState";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Card, CardContent } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import {
  Calendar,
  Clock,
  MapPin,
  Globe,
  Eye,
  CheckCircle2,
  UserPlus,
  Search,
  Building2,
  CreditCard,
  Trophy,
  Award,
  Users,
  Mic,
  Briefcase,
  Sparkles,
  Check,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { eventApi, eventPaymentApi } from "../../../services/api";
import { useRazorpay } from "../../../hooks/useRazorpay";

const EventsPage = () => {
  const navigate = useNavigate();
  const { openCheckout } = useRazorpay();

  // State variables
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [globalEvents, setGlobalEvents] = useState([]);
  const [finishedEvents, setFinishedEvents] = useState([]);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [searchTerm, setSearchTerm] = useState("");
  const [now, setNow] = useState(new Date());
  const [requesting, setRequesting] = useState(false);
  const [loading, setLoading] = useState(true);

  const { routeProtection } = useAuth();

  useEffect(() => {
    if (!routeProtection("STUDENT")) {
      navigate("/auth");
    }
  }, [navigate, routeProtection]);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Compute event status (LIVE, UPCOMING, FINISHED)
  const getEventStatus = (event) => {
    const startTime = event.startTime || event.eventDate;
    if (!startTime) return "UPCOMING";
    const start = new Date(startTime);
    const end = event.endTime ? new Date(event.endTime) : start;

    if (now >= start && now <= end) return "LIVE";
    if (now < start) return "UPCOMING";
    return "FINISHED";
  };

  const isRegistrationOpen = (event) => {
    if (!event.registrationEnd) return true;
    return new Date() < new Date(event.registrationEnd);
  };

  // Load all events (active, global, finished)
  const loadAllEvents = async () => {
    setLoading(true);
    try {
      const [activeData, globalData, finishedData] = await Promise.all([
        eventApi.getActiveEvents().catch(() => []),
        eventApi.getGlobalEvents().catch(() => []),
        eventApi.getFinishedEvents().catch(() => []),
      ]);
      setUpcomingEvents(Array.isArray(activeData) ? activeData : []);
      setGlobalEvents(Array.isArray(globalData) ? globalData : []);
      setFinishedEvents(Array.isArray(finishedData) ? finishedData : []);
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "Failed to load events",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllEvents();
  }, []);

  // Set default plan selection whenever selectedEvent changes
  useEffect(() => {
    if (selectedEvent?.registrationPlans?.length > 0) {
      setSelectedPlanId(selectedEvent.registrationPlans[0].id);
    } else {
      setSelectedPlanId(null);
    }
  }, [selectedEvent]);

  // Handle Event Registration (Free or Paid)
  const handleEventRegistration = async (event, chosenPlanId = null) => {
    if (!event) return;
    const isPaid = event.registrationPayment === "PAID" || 
      (event.registrationPayment === "PAID_FOR_GUEST" && event.registrationPlans?.length > 0);

    // If paid and no plan selected, open details modal to select plan
    if (isPaid && !chosenPlanId && (!event.registrationPlans || event.registrationPlans.length === 0)) {
      // Fallback to direct free registration if paid event has no configured plans
    } else if (isPaid && !chosenPlanId) {
      setSelectedEvent(event);
      if (event.registrationPlans?.length > 0) {
        setSelectedPlanId(event.registrationPlans[0].id);
      }
      return;
    }

    setRequesting(true);
    try {
      if (isPaid && chosenPlanId) {
        // Step 1: Create Razorpay Order on Backend
        const orderData = await eventPaymentApi.createOrder(event.id, chosenPlanId);

        // Step 2: Open Razorpay Checkout Modal
        await openCheckout({
          orderId: orderData.orderId,
          amount: orderData.amount,
          currency: orderData.currency || "INR",
          key: orderData.key,
          name: "CampusConnect",
          description: `Registration for ${event.title} (${orderData.planName || "Event Ticket"})`,
          onSuccess: async (paymentResult) => {
            try {
              // Step 3: Verify Payment on Backend
              const verifyRes = await eventPaymentApi.verifyPayment(event.id, {
                eventId: event.id,
                planId: chosenPlanId,
                razorpayOrderId: paymentResult.razorpayOrderId,
                razorpayPaymentId: paymentResult.razorpayPaymentId,
                razorpaySignature: paymentResult.razorpaySignature,
              });

              toast({
                title: "Registration Successful! 🎉",
                description: verifyRes.message || "Payment verified and registration confirmed.",
              });

              // Refresh list and update modal state
              await loadAllEvents();
              setSelectedEvent((prev) => (prev && prev.id === event.id ? { ...prev, register: true } : prev));
            } catch (vErr) {
              toast({
                title: "Verification Failed",
                description: vErr.message || "Payment completed but verification failed. Please contact support.",
                variant: "destructive",
              });
            }
          },
          onFailure: (err) => {
            toast({
              title: "Payment Cancelled or Failed",
              description: err?.description || err?.message || "Payment was not completed.",
              variant: "destructive",
            });
          },
        });
      } else {
        // FREE Event Registration
        const res = await eventPaymentApi.registerFree(event.id);
        toast({
          title: "Registration Confirmed! 🎉",
          description: res.message || "Successfully registered for the event.",
        });

        await loadAllEvents();
        setSelectedEvent((prev) => (prev && prev.id === event.id ? { ...prev, register: true } : prev));
      }
    } catch (err) {
      toast({
        title: "Registration Failed",
        description: err.message || "Could not complete registration.",
        variant: "destructive",
      });
    } finally {
      setRequesting(false);
    }
  };

  // Change campus event registration (unregistration)
  const handleUnregister = async (eventId) => {
    setRequesting(true);
    try {
      const data = await eventApi.unregisterEvent(eventId);
      toast({ title: "Unregistered", description: data.message || "Successfully unregistered" });
      await loadAllEvents();
      if (selectedEvent && selectedEvent.id === eventId) {
        setSelectedEvent((prev) => ({ ...prev, register: false }));
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "Failed to unregister",
        variant: "destructive",
      });
    } finally {
      setRequesting(false);
    }
  };

  // Change global event registration
  const toggleGlobalRegistration = async (eventId) => {
    const eventObj = globalEvents.find((e) => e.id === eventId);
    if (!eventObj) return;

    setRequesting(true);
    try {
      if (eventObj.register) {
        const data = await eventApi.unregisterGlobalEvent(eventId);
        toast({ title: "Unregistered", description: data.message || "Unregistered from global event" });
      } else {
        const data = await eventApi.registerGlobalEvent(eventId);
        toast({ title: "Registered", description: data.message || "Registered for global event" });
      }
      const globalData = await eventApi.getGlobalEvents();
      setGlobalEvents(Array.isArray(globalData) ? globalData : []);
      if (selectedEvent && selectedEvent.id === eventId) {
        setSelectedEvent((prev) => ({ ...prev, register: !prev.register }));
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "Failed to update global event registration",
        variant: "destructive",
      });
    } finally {
      setRequesting(false);
    }
  };

  // Filter helper
  const filterEvents = (list) => {
    const term = searchTerm.toLowerCase();
    return list.filter((e) => {
      const locText = e.locationDetails
        ? `${e.locationDetails.address || ""} ${e.locationDetails.city || ""}`
        : e.location || "";
      return (
        (e.title && e.title.toLowerCase().includes(term)) ||
        (e.clubName && e.clubName.toLowerCase().includes(term)) ||
        (e.venue && e.venue.toLowerCase().includes(term)) ||
        locText.toLowerCase().includes(term) ||
        (e.description && e.description.toLowerCase().includes(term))
      );
    });
  };

  const filteredUpcoming = useMemo(() => {
    const statusPriority = { LIVE: 1, UPCOMING: 2, FINISHED: 3 };
    const filtered = filterEvents(upcomingEvents);
    return filtered.sort((a, b) => {
      const statusA = getEventStatus(a);
      const statusB = getEventStatus(b);
      const diff = (statusPriority[statusA] || 99) - (statusPriority[statusB] || 99);
      if (diff !== 0) return diff;

      if (statusA === "UPCOMING") {
        if (a.register && !b.register) return -1;
        if (!a.register && b.register) return 1;
        const timeA = new Date(a.startTime || a.eventDate || 0);
        const timeB = new Date(b.startTime || b.eventDate || 0);
        return timeA - timeB;
      }
      return 0;
    });
  }, [upcomingEvents, searchTerm, now]);

  const filteredGlobal = useMemo(() => filterEvents(globalEvents), [globalEvents, searchTerm]);
  const filteredFinished = useMemo(() => filterEvents(finishedEvents), [finishedEvents, searchTerm]);

  // Format Location
  const formatLocation = (event) => {
    if (event.locationDetails) {
      const parts = [
        event.locationDetails.address,
        event.locationDetails.city,
        event.locationDetails.state,
        event.locationDetails.country,
      ].filter(Boolean);
      if (parts.length > 0) return parts.join(", ");
    }
    return event.location || event.venue || (event.eventType === "ONLINE" ? "Online Event" : "Campus Venue");
  };

  // Format Price Badge
  const getPriceBadge = (event) => {
    if (event.registrationPayment === "FREE" || (!event.registrationPayment && !event.registrationPlans?.length)) {
      return (
        <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
          Free
        </Badge>
      );
    }
    if (event.registrationPayment === "PAID_FOR_GUEST") {
      return (
        <Badge className="bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 text-[10px] font-bold">
          Free for Students / Paid for Guests
        </Badge>
      );
    }
    if (event.registrationPlans && event.registrationPlans.length > 0) {
      const minAmount = Math.min(...event.registrationPlans.map((p) => p.amount || 0));
      return (
        <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-bold">
          From ₹{minAmount}
        </Badge>
      );
    }
    return (
      <Badge className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-[10px] font-bold">
        Paid Event
      </Badge>
    );
  };

  const renderEventCard = (event, category) => {
    const isGlobal = category === "global" || event.isGlobal;
    const isFinished = category === "finished";
    const status = getEventStatus(event);
    const isRegistered = !!event.register;
    const canRegister = isRegistrationOpen(event);
    const poster = event.posterUrl || event.imageUrl || event.image || event.coverImage;
    const eventTime = event.eventDate || event.startTime;
    const venueText = formatLocation(event);
    const isPaid = event.registrationPayment === "PAID" || 
      (event.registrationPayment === "PAID_FOR_GUEST" && event.registrationPlans?.length > 0);

    return (
      <Card
        key={event.id}
        className="flex flex-col justify-between border-border/80 hover:border-primary/40 hover:shadow-md transition-all duration-200 overflow-hidden group"
      >
        <div>
          {/* Event Cover Banner */}
          <div className="h-44 w-full bg-gradient-to-br from-primary/10 via-accent/20 to-muted relative overflow-hidden border-b border-border/60">
            {poster ? (
              <img
                src={poster}
                alt={event.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/60 p-4 text-center">
                <Calendar className="w-10 h-10 text-primary/40 mb-1" />
                <span className="text-xs font-medium">Campus Connect Event</span>
              </div>
            )}

            {/* Badges on Top */}
            <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 max-w-[70%]">
              {getPriceBadge(event)}
              {event.prizeMoney > 0 && (
                <Badge className="bg-amber-500 text-white text-[10px] font-bold shadow-xs gap-1">
                  <Trophy className="w-3 h-3" /> ₹{event.prizeMoney.toLocaleString()}
                </Badge>
              )}
            </div>

            <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
              {status === "LIVE" && !isFinished && (
                <Badge className="bg-red-500 text-white text-[10px] font-bold animate-pulse shadow-xs">
                  LIVE NOW
                </Badge>
              )}
              <Badge
                className={`text-[10px] font-bold shadow-xs ${
                  isGlobal
                    ? "bg-purple-600 text-white"
                    : isFinished
                    ? "bg-muted text-muted-foreground"
                    : "bg-primary text-primary-foreground"
                }`}
              >
                {isFinished ? "Concluded" : isGlobal ? "Global" : "Campus"}
              </Badge>
            </div>
          </div>

          <CardContent className="p-4 sm:p-5 space-y-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                {event.clubName && (
                  <Badge
                    variant="outline"
                    className="text-[10px] font-semibold bg-primary/5 text-primary border-primary/20 truncate"
                  >
                    {event.clubName}
                  </Badge>
                )}
                {event.eventType && (
                  <span className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                    {event.eventType === "ONLINE" ? (
                      <>
                        <Globe className="w-3 h-3 text-sky-500" /> Online
                      </>
                    ) : (
                      <>
                        <MapPin className="w-3 h-3 text-emerald-500" /> Offline
                      </>
                    )}
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                {event.title}
              </h3>
            </div>

            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {event.description || event.overview || "Exciting event hosted for campus students."}
            </p>

            <div className="pt-2 border-t border-border/60 space-y-1.5 text-xs text-muted-foreground">
              {eventTime && (
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>
                    {new Date(eventTime).toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}
              {venueText && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="truncate">{venueText}</span>
                </div>
              )}
            </div>
          </CardContent>
        </div>

        {/* Action Buttons Footer */}
        <div className="p-3 sm:p-4 pt-0 border-t border-border/40 mt-auto pt-3 flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedEvent(event)}
            className="flex-1 text-xs font-semibold h-9"
          >
            <Eye className="w-3.5 h-3.5 mr-1.5" />
            Details
          </Button>

          {!isFinished && (
            canRegister ? (
              isRegistered ? (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={requesting}
                  onClick={() =>
                    isGlobal
                      ? toggleGlobalRegistration(event.id)
                      : handleUnregister(event.id)
                  }
                  className="flex-1 text-xs font-semibold h-9 gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  Registered
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="default"
                  disabled={requesting}
                  onClick={() =>
                    isGlobal
                      ? toggleGlobalRegistration(event.id)
                      : isPaid
                      ? setSelectedEvent(event)
                      : handleEventRegistration(event)
                  }
                  className="flex-1 text-xs font-semibold h-9 gap-1.5"
                >
                  {isPaid ? (
                    <>
                      <CreditCard className="w-3.5 h-3.5 shrink-0" />
                      Get Tickets
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5 shrink-0" />
                      Register Free
                    </>
                  )}
                </Button>
              )
            ) : (
              <Button size="sm" variant="secondary" disabled className="flex-1 text-xs font-semibold h-9">
                Closed
              </Button>
            )
          )}
        </div>
      </Card>
    );
  };

  const selectedEventLocation = selectedEvent ? formatLocation(selectedEvent) : "";
  const selectedEventIsPaid = selectedEvent?.registrationPayment === "PAID" ||
    (selectedEvent?.registrationPayment === "PAID_FOR_GUEST" && selectedEvent?.registrationPlans?.length > 0);

  const selectedPlanObj = selectedEvent?.registrationPlans?.find((p) => p.id === selectedPlanId);

  return (
    <DashboardLayout navItems={studentNavItems} title="Events">
      {loading ? (
        <PageSkeleton />
      ) : (
        <div className="space-y-5 sm:space-y-6 w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Calendar className="w-6 h-6 text-primary" />
                <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                  Campus & Global Events
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Explore campus workshops, hackathons, guest lectures, and cross-college global events
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search events, venues..."
                className="pl-9 h-9 text-xs sm:text-sm"
              />
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="w-full grid grid-cols-3 sm:inline-flex sm:w-auto p-1 bg-muted/60 border border-border/60 rounded-xl gap-1">
              <TabsTrigger
                value="upcoming"
                className="text-xs sm:text-sm font-semibold rounded-lg px-2.5 sm:px-3.5 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs flex items-center justify-center"
              >
                <span>Active</span>
              </TabsTrigger>
              <TabsTrigger
                value="global"
                className="text-xs sm:text-sm font-semibold rounded-lg px-2.5 sm:px-3.5 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs flex items-center justify-center gap-1.5"
              >
                <Globe className="w-3.5 h-3.5 shrink-0" />
                <span>Global</span>
              </TabsTrigger>
              <TabsTrigger
                value="finished"
                className="text-xs sm:text-sm font-semibold rounded-lg px-2.5 sm:px-3.5 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs flex items-center justify-center"
              >
                <span>Finished</span>
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: ACTIVE EVENTS */}
            <TabsContent value="upcoming" className="space-y-4 pt-1">
              {filteredUpcoming.length === 0 ? (
                <Card className="border-dashed border-border/80">
                  <CardContent className="py-12">
                    <EmptyState
                      icon={Calendar}
                      title={searchTerm ? "No Matching Events" : "No Active Events Scheduled"}
                      description={
                        searchTerm
                          ? `No events matching "${searchTerm}". Try a different keyword.`
                          : "There are currently no active college events scheduled at the moment."
                      }
                    />
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {filteredUpcoming.map((event) => renderEventCard(event, "upcoming"))}
                </div>
              )}
            </TabsContent>

            {/* TAB 2: GLOBAL EVENTS */}
            <TabsContent value="global" className="space-y-4 pt-1">
              {filteredGlobal.length === 0 ? (
                <Card className="border-dashed border-border/80">
                  <CardContent className="py-12">
                    <EmptyState
                      icon={Globe}
                      title={searchTerm ? "No Matching Global Events" : "No Global Events Scheduled"}
                      description={
                        searchTerm
                          ? `No events matching "${searchTerm}". Try a different keyword.`
                          : "There are currently no cross-institutional global events scheduled."
                      }
                    />
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {filteredGlobal.map((event) => renderEventCard(event, "global"))}
                </div>
              )}
            </TabsContent>

            {/* TAB 3: FINISHED EVENTS */}
            <TabsContent value="finished" className="space-y-4 pt-1">
              {filteredFinished.length === 0 ? (
                <Card className="border-dashed border-border/80">
                  <CardContent className="py-12">
                    <EmptyState
                      icon={Calendar}
                      title={searchTerm ? "No Matching Past Events" : "No Finished Events Found"}
                      description={
                        searchTerm
                          ? `No past events matching "${searchTerm}".`
                          : "There are no archived event records available."
                      }
                    />
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {filteredFinished.map((event) => renderEventCard(event, "finished"))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Comprehensive Event Detail & Registration Dialog */}
          <Dialog
            open={!!selectedEvent}
            onOpenChange={(open) => !open && setSelectedEvent(null)}
          >
            <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-4 sm:p-6 space-y-4">
              <DialogHeader>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <Badge
                      variant="outline"
                      className="text-xs font-semibold bg-primary/5 text-primary border-primary/20"
                    >
                      {selectedEvent?.clubName || "Campus Event"}
                    </Badge>
                    {selectedEvent && getPriceBadge(selectedEvent)}
                    {selectedEvent?.eventType && (
                      <Badge variant="secondary" className="text-[10px]">
                        {selectedEvent.eventType}
                      </Badge>
                    )}
                  </div>
                  <DialogTitle className="text-xl sm:text-2xl font-bold text-foreground">
                    {selectedEvent?.title}
                  </DialogTitle>
                  <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
                    Organized under {selectedEvent?.clubName || "College Community"}
                  </DialogDescription>
                </div>
              </DialogHeader>

              <div className="space-y-4">
                {/* Event Poster if available */}
                {(selectedEvent?.posterUrl ||
                  selectedEvent?.imageUrl ||
                  selectedEvent?.image ||
                  selectedEvent?.coverImage) && (
                  <div className="rounded-xl overflow-hidden max-h-60 w-full border border-border/60">
                    <img
                      src={
                        selectedEvent.posterUrl ||
                        selectedEvent.imageUrl ||
                        selectedEvent.image ||
                        selectedEvent.coverImage
                      }
                      alt={selectedEvent.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Event Highlights Strip */}
                {selectedEvent?.prizeMoney > 0 && (
                  <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-amber-500" />
                      <div>
                        <p className="text-xs font-bold text-amber-600 dark:text-amber-400">Total Prize Pool</p>
                        <p className="text-base font-extrabold text-foreground">₹{selectedEvent.prizeMoney.toLocaleString()}</p>
                      </div>
                    </div>
                    {selectedEvent.eligibility && (
                      <div className="text-right">
                        <p className="text-[10px] text-muted-foreground">Eligibility</p>
                        <p className="text-xs font-medium text-foreground">{selectedEvent.eligibility}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Description */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Event Description & Agenda
                  </h4>
                  <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                    {selectedEvent?.description || selectedEvent?.overview || "No full description provided."}
                  </p>
                </div>

                {/* Timing & Venue details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3.5 rounded-xl bg-accent/30 border border-border/60 text-xs">
                  {(selectedEvent?.eventDate || selectedEvent?.startTime) && (
                    <div className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-foreground block">Event Schedule</span>
                        <span className="text-muted-foreground">
                          {new Date(selectedEvent.eventDate || selectedEvent.startTime).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}

                  {selectedEventLocation && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-foreground block">Location / Venue</span>
                        <span className="text-muted-foreground">{selectedEventLocation}</span>
                      </div>
                    </div>
                  )}

                  {selectedEvent?.registrationEnd && (
                    <div className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-foreground block">Registration Closes</span>
                        <span className="text-muted-foreground">
                          {new Date(selectedEvent.registrationEnd).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}

                  {selectedEvent?.departmentName && (
                    <div className="flex items-start gap-2">
                      <Building2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-foreground block">Department</span>
                        <span className="text-muted-foreground">{selectedEvent.departmentName}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Criteria / Eligibility Details */}
                {(selectedEvent?.criteria || selectedEvent?.eligibility) && (
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/50 text-xs space-y-1.5">
                    {selectedEvent.criteria && (
                      <div>
                        <span className="font-semibold text-foreground">Selection / Participation Criteria: </span>
                        <span className="text-muted-foreground">{selectedEvent.criteria}</span>
                      </div>
                    )}
                    {selectedEvent.eligibility && (
                      <div>
                        <span className="font-semibold text-foreground">Who Can Attend: </span>
                        <span className="text-muted-foreground">{selectedEvent.eligibility}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Speakers Section */}
                {selectedEvent?.speakers && selectedEvent.speakers.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                      <Mic className="w-3.5 h-3.5 text-primary" /> Keynote Speakers ({selectedEvent.speakers.length})
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedEvent.speakers.map((sp, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg border border-border/60 bg-card/60 text-xs">
                          <p className="font-semibold text-foreground">{sp.name}</p>
                          <p className="text-muted-foreground text-[11px]">{sp.description || sp.tagline || sp.email || "Speaker"}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sponsors Section */}
                {selectedEvent?.sponsors && selectedEvent.sponsors.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-primary" /> Event Sponsors ({selectedEvent.sponsors.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedEvent.sponsors.map((sp, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs py-1 px-2.5 bg-muted/30">
                          <span className="font-semibold">{sp.name}</span>
                          {(sp.description || sp.tagline) && (
                            <span className="text-muted-foreground ml-1.5 text-[10px]">({sp.description || sp.tagline})</span>
                          )}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Registration Plans Selection (for PAID / PAID_FOR_GUEST events) */}
                {selectedEventIsPaid && selectedEvent?.registrationPlans?.length > 0 && !selectedEvent.register && (
                  <div className="space-y-2 pt-2 border-t border-border/60">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-primary" /> Select Registration Plan
                      </h4>
                      <span className="text-[11px] text-muted-foreground">Secure Razorpay Checkout</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {selectedEvent.registrationPlans.map((plan) => {
                        const isSelected = selectedPlanId === plan.id;
                        const isSoldOut = plan.maxSeats != null && plan.currentRegistrations >= plan.maxSeats;

                        return (
                          <div
                            key={plan.id}
                            onClick={() => !isSoldOut && setSelectedPlanId(plan.id)}
                            className={`p-3 rounded-xl border transition-all cursor-pointer relative ${
                              isSelected
                                ? "border-primary bg-primary/5 ring-1 ring-primary shadow-xs"
                                : isSoldOut
                                ? "border-border/40 opacity-50 cursor-not-allowed bg-muted/20"
                                : "border-border/70 hover:border-primary/50 bg-card"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="space-y-0.5">
                                <p className="text-xs font-bold text-foreground">{plan.planName}</p>
                                {plan.planDescription && (
                                  <p className="text-[11px] text-muted-foreground line-clamp-1">{plan.planDescription}</p>
                                )}
                              </div>
                              <span className="text-sm font-extrabold text-primary shrink-0">
                                ₹{plan.amount}
                              </span>
                            </div>

                            <div className="mt-2 pt-2 border-t border-border/40 flex items-center justify-between text-[10px] text-muted-foreground">
                              <span>
                                {plan.maxSeats != null
                                  ? `${Math.max(0, plan.maxSeats - (plan.currentRegistrations || 0))} seats left`
                                  : "Unlimited seats"}
                              </span>
                              {isSelected && (
                                <span className="text-primary font-bold flex items-center gap-0.5">
                                  <Check className="w-3 h-3" /> Selected
                                </span>
                              )}
                              {isSoldOut && (
                                <span className="text-destructive font-bold">Sold Out</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Registration Action inside Modal */}
                {selectedEvent && activeTab !== "finished" && (
                  <div className="pt-3 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="text-xs text-muted-foreground text-center sm:text-left">
                      {selectedEvent.register ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> You are currently registered for this event.
                        </span>
                      ) : (
                        <span>
                          Status: <strong className="text-foreground">{isRegistrationOpen(selectedEvent) ? "Open for Registration" : "Registration Closed"}</strong>
                        </span>
                      )}
                    </div>

                    {isRegistrationOpen(selectedEvent) ? (
                      selectedEvent.register ? (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={requesting}
                          onClick={() =>
                            selectedEvent.isGlobal
                              ? toggleGlobalRegistration(selectedEvent.id)
                              : handleUnregister(selectedEvent.id)
                          }
                          className="w-full sm:w-auto border-destructive/30 text-destructive hover:bg-destructive/10"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                          Cancel Registration
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="default"
                          disabled={requesting || (selectedEventIsPaid && !selectedPlanId)}
                          onClick={() =>
                            selectedEvent.isGlobal
                              ? toggleGlobalRegistration(selectedEvent.id)
                              : handleEventRegistration(selectedEvent, selectedPlanId)
                          }
                          className="w-full sm:w-auto font-semibold gap-1.5"
                        >
                          {selectedEventIsPaid ? (
                            <>
                              <CreditCard className="w-4 h-4" />
                              Pay ₹{selectedPlanObj ? selectedPlanObj.amount : "..."} & Register
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-4 h-4" />
                              Register for Free
                            </>
                          )}
                        </Button>
                      )
                    ) : (
                      <Button size="sm" variant="secondary" disabled className="w-full sm:w-auto">
                        Registration Closed
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </DashboardLayout>
  );
};

export default EventsPage;
