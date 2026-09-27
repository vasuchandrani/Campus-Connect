import "./AdminEventDetailPage.css";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import { Card, CardContent } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ArrowLeft,
  ImageIcon,
  Mic2,
  Award,
  Building2,
} from "lucide-react";
import { collegeAdminNavItems } from "../../../config/Navigation";
import { marked } from "marked";
import { useMemo, useEffect, useState, useCallback } from "react";
import { toast } from "../../../hooks/use-toast";
import { useAuth } from "../../../contexts/AuthContext";
import EmptyState from "../../../components/ui/EmptyState";
import { collegeAdminApi } from "../../../services/api";

export default function AdminEventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  const { routeProtection } = useAuth();

  useEffect(() => {
    if (!routeProtection("COLLEGE_ADMIN")) {
      navigate("/auth");
    }
  }, [navigate, routeProtection]);

  const formatDate = useCallback((dateTime) => {
    if (!dateTime) return { date: "Upcoming", time: "Scheduled" };
    try {
      const d = new Date(dateTime);
      return {
        date: d.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        time: d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
    } catch {
      const parts = dateTime.split("T");
      return { date: parts[0] || "", time: (parts[1] || "").substring(0, 5) };
    }
  }, []);

  const fetchEventDetails = async () => {
    setLoading(true);
    try {
      const data = await collegeAdminApi.getFinishedEventDetails(id);
      setEvent(data || null);
    } catch (err) {
      toast({
        title: "Error Loading Event",
        description: err.message || "Failed to fetch event details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const renderedOverview = useMemo(() => {
    if (!event?.overview) return "";
    try {
      return marked.parse(event.overview.trim());
    } catch {
      return event.overview;
    }
  }, [event?.overview]);

  if (loading) {
    return (
      <DashboardLayout navItems={collegeAdminNavItems} title="Event Details">
        <div className="space-y-6 animate-pulse">
          <div className="h-8 w-24 bg-muted rounded-lg" />
          <div className="h-48 sm:h-64 w-full bg-muted rounded-2xl" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 rounded-2xl border border-border/60 bg-card/60 p-4" />
            ))}
          </div>
          <div className="h-36 rounded-2xl border border-border/60 bg-card/60 p-4" />
        </div>
      </DashboardLayout>
    );
  }

  if (!event || !event.title) {
    return (
      <DashboardLayout navItems={collegeAdminNavItems} title="Event Not Found">
        <div className="text-center py-16 space-y-4">
          <EmptyState
            icon={<Calendar className="w-10 h-10 text-muted-foreground" />}
            title="Event Not Found"
            desc="The requested event does not exist or has been removed."
          />
          <Button
            size="sm"
            onClick={() => navigate("/campus-connect/college-admin/clubs")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Return to Clubs & Events
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const { date, time } = formatDate(event.startTime);

  return (
    <DashboardLayout navItems={collegeAdminNavItems} title={event.title}>
      <div className="space-y-6">
        {/* Back Link */}
        <Button
          variant="ghost"
          size="sm"
          className="text-xs h-8 text-muted-foreground hover:text-foreground -ml-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
          Back to Events
        </Button>

        {/* Hero Header Banner */}
        <div className="relative rounded-2xl overflow-hidden border border-border/70 bg-muted">
          <div className="relative h-48 sm:h-64 md:h-72 w-full overflow-hidden">
            {event.image ? (
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-primary/10 via-primary/5 to-muted flex items-center justify-center">
                <Calendar className="w-12 h-12 text-primary/30" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="text-[10px] bg-primary text-primary-foreground border-none">
                  {event.clubName || "Campus Event"}
                </Badge>
                <Badge
                  variant="outline"
                  className="text-[10px] text-white/90 border-white/30 bg-white/10"
                >
                  Completed Event
                </Badge>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight leading-snug">
                {event.title}
              </h1>
            </div>
          </div>
        </div>

        {/* 4 Metadata Chips */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <Card className="border-border/70 bg-card/70 backdrop-blur-xs">
            <CardContent className="p-3.5 sm:p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Date
                </p>
                <p className="text-xs sm:text-sm font-bold text-foreground truncate">
                  {date}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/70 backdrop-blur-xs">
            <CardContent className="p-3.5 sm:p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Time
                </p>
                <p className="text-xs sm:text-sm font-bold text-foreground truncate">
                  {time}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/70 backdrop-blur-xs">
            <CardContent className="p-3.5 sm:p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Location
                </p>
                <p className="text-xs sm:text-sm font-bold text-foreground truncate">
                  {event.location || "Campus Venue"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/70 backdrop-blur-xs">
            <CardContent className="p-3.5 sm:p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Attendees
                </p>
                <p className="text-xs sm:text-sm font-bold text-foreground truncate">
                  {event.registrationsCount ?? 0}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* About Event Description */}
        {event.description && (
          <Card className="border-border/70 bg-card/70 backdrop-blur-xs">
            <CardContent className="p-4 sm:p-6 space-y-2">
              <h3 className="text-sm sm:text-base font-bold text-foreground">
                About the Event
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Overview (Markdown) */}
        {event.overview && (
          <Card className="border-border/70 bg-card/70 backdrop-blur-xs">
            <CardContent className="p-4 sm:p-6 space-y-3">
              <h3 className="text-sm sm:text-base font-bold text-foreground">
                Event Overview & Agenda
              </h3>
              <div
                className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-foreground leading-relaxed"
                dangerouslySetInnerHTML={{ __html: renderedOverview }}
              />
            </CardContent>
          </Card>
        )}

        {/* Speakers */}
        {event.speakers && event.speakers.length > 0 && (
          <Card className="border-border/70 bg-card/70 backdrop-blur-xs">
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Mic2 className="w-4 h-4 text-primary" />
                <h3 className="text-sm sm:text-base font-bold text-foreground">
                  Keynote Speakers
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {event.speakers.map((speaker, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-xl bg-muted/50 border border-border/60 space-y-1"
                  >
                    <p className="text-xs sm:text-sm font-bold text-foreground">
                      {speaker.name}
                    </p>
                    {speaker.tagline && (
                      <p className="text-[11px] text-muted-foreground">
                        {speaker.tagline}
                      </p>
                    )}
                    {speaker.email && (
                      <p className="text-[11px] text-primary/80 truncate">
                        {speaker.email}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Winners */}
        {event.winners && event.winners.length > 0 && (
          <Card className="border-border/70 bg-card/70 backdrop-blur-xs">
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm sm:text-base font-bold text-foreground">
                  Award Winners
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {event.winners.map((winner, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-1"
                  >
                    <p className="text-xs sm:text-sm font-bold text-foreground">
                      {winner.name}
                    </p>
                    {winner.email && (
                      <p className="text-[11px] text-muted-foreground">
                        {winner.email}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Event Photos */}
        {event.images && event.images.length > 0 && (
          <Card className="border-border/70 bg-card/70 backdrop-blur-xs">
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-primary" />
                  <h3 className="text-sm sm:text-base font-bold text-foreground">
                    Event Gallery
                  </h3>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  {event.images.length} Photos
                </Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {event.images.map((photo, index) => (
                  <div
                    key={index}
                    className="h-32 sm:h-40 rounded-xl overflow-hidden bg-muted border border-border/60 group"
                  >
                    <img
                      src={photo}
                      alt={`Event photo ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
