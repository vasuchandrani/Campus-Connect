import "./EventDetailPage.css";
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
  Speaker,
  Award,
  Trophy,
} from "lucide-react";
import { studentNavItems } from "../../../config/Navigation";
import { marked } from "marked";
import { useEffect, useMemo, useState } from "react";
import { toast } from "../../../hooks/use-toast";
import { useAuth } from "../../../contexts/AuthContext";
import PageSkeleton from "../../../components/ui/PageSkeleton";
import { eventApi } from "../../../services/api";

const EventDetailPage = () => {
  // Get event ID from URL params
  const { id } = useParams();
  const navigate = useNavigate();

  const { routeProtection } = useAuth();
  useEffect(() => {
    if (!routeProtection("STUDENT")) {
      navigate("/auth");
    }
  }, [navigate, routeProtection]);

  // State variable to hold event details
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to fetch event details
  const fetchEventDetails = async () => {
    setLoading(true);
    try {
      const data = await eventApi.getFinishedEventDetails(id);
      setEvent(data);
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "Failed to fetch event details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to format date and time
  const formatDate = (dateTime) => {
    if (!dateTime) return { date: "", time: "" };
    const [date, time] = dateTime.split("T");
    return { date, time: time ? time.substring(0, 5) : "" };
  };

  // Load event details on component mount
  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const navItems = studentNavItems;

  // Memoized rendered overview to avoid unnecessary re-renders
  const renderedOverview = useMemo(() => {
    if (!event?.overview) return "";
    return marked.parse(event.overview?.trim() || "");
  }, [event?.overview]);

  if (loading) {
    return (
      <DashboardLayout navItems={navItems} title="Event Details" bell={true}>
        <PageSkeleton variant="detail" />
      </DashboardLayout>
    );
  }

  if (!event) {
    return (
      <DashboardLayout navItems={navItems} title="Event Details" bell={true}>
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">
            This Event does not exist.
          </p>
          <Button onClick={() => navigate("/campus-connect/student/clubs")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const formattedLocation = event.locationDetails
    ? [
        event.locationDetails.address,
        event.locationDetails.city,
        event.locationDetails.state,
        event.locationDetails.country,
      ]
        .filter(Boolean)
        .join(", ")
    : event.location || "Campus Venue";

  return (
    <DashboardLayout navItems={navItems} title={event.title} bell={true}>
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>

        {/* Hero */}
        <div className="relative w-full h-48 sm:h-64 md:h-80 rounded-2xl sm:rounded-3xl overflow-hidden border border-border/50 shadow-sm group">
          <div className="absolute inset-0 bg-muted transition-transform duration-700 group-hover:scale-105">
            {event.image || event.posterUrl || event.coverImage ? (
              <img
                src={event.image || event.posterUrl || event.coverImage}
                alt={event.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.parentElement.innerHTML =
                    '<div class="w-full h-full bg-gradient-to-r from-primary/10 via-primary/5 to-muted flex items-center justify-center"><svg class="w-12 h-12 text-primary/30" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg></div>';
                }}
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
                {event.status === "FINISHED" && (
                  <Badge variant="outline" className="text-[10px] text-white/90 border-white/30 bg-white/10">
                    Completed Event
                  </Badge>
                )}
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
                  {formatDate(event.startTime).date}
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
                  {formatDate(event.startTime).time}
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
                  {formattedLocation}
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

        {/* Prize Money Banner if available */}
        {event.prizeMoney > 0 && (
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trophy className="w-6 h-6 text-amber-500" />
                <div>
                  <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                    Total Prize Pool
                  </p>
                  <p className="text-xl font-extrabold text-foreground">
                    ₹{event.prizeMoney.toLocaleString()}
                  </p>
                </div>
              </div>
              {event.eligibility && (
                <div className="text-right text-xs">
                  <span className="text-muted-foreground block">Eligibility</span>
                  <span className="font-medium text-foreground">{event.eligibility}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

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
              {event.criteria && (
                <div className="mt-4 pt-4 border-t border-border/60 text-xs">
                  <span className="font-semibold text-foreground">Criteria: </span>
                  <span className="text-muted-foreground">{event.criteria}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Overview (Markdown) */}
        {event.overview && (
          <Card className="border-border/50">
            <CardContent className="p-6 pt-4">
              <h3 className="text-lg font-semibold mb-4">Event Overview</h3>
              <div
                className="prose max-w-none text-foreground"
                dangerouslySetInnerHTML={{
                  __html: renderedOverview,
                }}
              />
            </CardContent>
          </Card>
        )}

        {/* Sponsors */}
        {event.sponsors && event.sponsors.length > 0 && (
          <Card className="border-border/50">
            <CardContent className="p-6 pt-4">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Event Sponsors</h3>
              </div>

              <div className="space-y-4">
                {event.sponsors.map((sponsor, index) => (
                  <div key={index} className="p-1 rounded-lg">
                    <h4 className="text-md font-medium">{sponsor.name}</h4>
                    {(sponsor.description || sponsor.tagline) && (
                      <p className="text-sm text-muted-foreground">
                        {sponsor.description || sponsor.tagline}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Speakers */}
        {event.speakers && event.speakers.length > 0 && (
          <Card className="border-border/50">
            <CardContent className="p-6 pt-4">
              <div className="flex items-center gap-2 mb-4">
                <Speaker className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Event Speakers</h3>
              </div>

              <div className="space-y-4">
                {event.speakers.map((speaker, index) => (
                  <div key={index} className="p-1 rounded-lg">
                    <h4 className="text-md font-medium">{speaker.name}</h4>
                    {(speaker.description || speaker.tagline || speaker.position) && (
                      <p className="text-sm text-muted-foreground">
                        {speaker.description || speaker.tagline || speaker.position}
                      </p>
                    )}
                    {speaker.email && (
                      <p className="text-sm text-muted-foreground">
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
          <Card className="border-border/50">
            <CardContent className="p-6 pt-4">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Event Winners</h3>
              </div>

              <div className="space-y-4">
                {event.winners.map((winner, index) => (
                  <div key={index} className="p-1 rounded-lg">
                    <h4 className="text-md font-medium">{winner.name}</h4>
                    {winner.prize && (
                      <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                        Prize: {winner.prize}
                      </p>
                    )}
                    {winner.email && (
                      <p className="text-sm text-muted-foreground">
                        {winner.email}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Photos */}
        {event.images && event.images.length > 0 && (
          <Card className="border-border/50">
            <CardContent className="p-6 pt-4">
              <div className="flex items-center gap-2 mb-4">
                <ImageIcon className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Event Photos</h3>
                <Badge variant="secondary">{event.images.length} photos</Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {event.images.map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    loading="lazy"
                    alt={`Event photo ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default EventDetailPage;
