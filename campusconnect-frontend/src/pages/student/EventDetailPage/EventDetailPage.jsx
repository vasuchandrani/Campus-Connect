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
        <div className="relative rounded-2xl overflow-hidden">
          <img
            src={event.image || event.posterUrl || event.coverImage}
            alt={event.title}
            loading="lazy"
            className="w-full h-64 md:h-80 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <Badge variant="secondary" className="mb-2">
              Finished Event
            </Badge>
            <h1 className="text-3xl font-bold">{event.title}</h1>
            <p className="text-white">{event.clubName}</p>
          </div>
        </div>

        {/* Event Info Grid */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-3 pt-4">
              <Calendar className="w-5 h-5 text-primary shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium">
                  {formatDate(event.startTime).date}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-3 pt-4">
              <Clock className="w-5 h-5 text-primary shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">Time</p>
                <p className="font-medium">
                  {formatDate(event.startTime).time}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-3 pt-4">
              <MapPin className="w-5 h-5 text-primary shrink-0" />
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium truncate">{formattedLocation}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-3 pt-4">
              <Users className="w-5 h-5 text-primary shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">Attendees</p>
                <p className="font-medium">{event.registrationsCount || 0}</p>
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

        {/* Description */}
        <Card className="border-border/50">
          <CardContent className="p-6 pt-4">
            <h3 className="text-lg font-semibold mb-3">About the Event</h3>
            <div className="prose max-w-none text-foreground/90 whitespace-pre-wrap">
              {event.description}
            </div>
            {event.criteria && (
              <div className="mt-4 pt-4 border-t border-border/60 text-xs">
                <span className="font-semibold text-foreground">Criteria: </span>
                <span className="text-muted-foreground">{event.criteria}</span>
              </div>
            )}
          </CardContent>
        </Card>

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
                    {(speaker.description || speaker.tagline) && (
                      <p className="text-sm text-muted-foreground">
                        {speaker.description || speaker.tagline}
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
