import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ArrowLeft,
  ImageIcon,
  Speaker,
  Award,
} from "lucide-react";
import { studentNavItems } from "../../config/Navigation";
import { marked } from "marked";
import { useEffect, useMemo,useState } from "react";
import { set } from "date-fns";


const EventDetailPage = () => {
  // Get event ID from URL params
  const { id } = useParams();
  const navigate = useNavigate();

  // Base URL for API calls related to student events
  const baseUrl = `http://localhost:8080/campus-connect/student/events/finished/${id}`;



  // State variable to hold event details
  const [event,setEvent] = useState({});


  // Function to fetch event details
  const fetchEventDetails = async (eventId) => {

    fetch(`${baseUrl}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setEvent(data);
      })
      .catch((err) => {
        console.error("Error fetching event details:", err);
        alert("Failed to load event details");
      });
  };

  // Function to format date and time
  const formatDate = (dateTime) => {
    if (!dateTime) return { date: "", time: "" };
    const [date, time] = dateTime.split("T");
    return { date, time: time.substring(0, 5) };
  };

  //load event details on component mount
  useEffect(()=>{
     fetchEventDetails(id);
  },[]);

  const navItems = studentNavItems;

  // Memoized rendered overview to avoid unnecessary re-renders
  const renderedOverview = useMemo(() => {
    if (!event?.overview) return "";
    return marked.parse(event.overview.trim());
  }, [event?.overview]);

  // If event data is not yet loaded, show a loading state
  if (!event) {
    return (
      <DashboardLayout navItems={navItems} title="Event Not Found">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Event not found</h2>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={navItems} title={event.title}>
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>

        {/* Hero */}
        <div className="relative rounded-2xl overflow-hidden">
          <img
            src={event.image}
            alt={event.title}
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

        {/* Event Info */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-3 pt-4">
              <Calendar className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium">{formatDate(event.eventDate).date}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-3 pt-4">
              <Clock className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Time</p>
                <p className="font-medium">{formatDate(event.eventDate).time}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-3 pt-4">
              <MapPin className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium">{event.location}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-3 pt-4">
              <Users className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Attendees</p>
                <p className="font-medium">
                  {event.registrationsCount}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Description */}
        <Card className="border-border/50">
          <CardContent className="p-6 pt-4">
            <h3 className="text-lg font-semibold mb-3">About the Event</h3>
            <div className="prose max-w-none text-black">
              {event.description}
            </div>
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
        {
          event.sponsors && event.sponsors.length > 0 && (
            <Card className="border-border/50">
              <CardContent className="p-6 pt-4">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold">Event Sponsors</h3>
                </div>

                <div className="space-y-4">
                  {event.sponsors.map((sponsor, index) => (
                    <div key={index} className="p-1  rounded-lg">
                      <h4 className="text-md font-medium">{sponsor.name}</h4>
                      <p className="text-sm text-muted-foreground">{sponsor.tagline}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        }

        {/* Speakers */}
        {
          event.speakers && event.speakers.length > 0 && (
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
                      {speaker.tagline && <p className="text-sm text-muted-foreground">{speaker.tagline}</p>}
                      {speaker.email && <p className="text-sm text-muted-foreground">{speaker.email}</p>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        }

         {/* Winners */}
        {
          event.winners && event.winners.length > 0 && (
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
                      {winner.email && <p className="text-sm text-muted-foreground">{winner.email}</p>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        }
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
