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
} from "lucide-react";
import { collegeAdminNavItems } from "../../config/Navigation";
import { marked } from "marked";
import { useMemo } from "react";

const AdminEventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Local events array (instead of mockData file)
  const events = [
    {
      id: "7",
      title: "Tech Innovation Summit",
      description:
        "Join us for an exciting tech summit featuring industry experts.",
      date: "2026-02-10",
      time: "10:00 AM",
      location: "Main Auditorium",
      clubName: "Coding Club",
      attendees: 120,
      maxAttendees: 200,
      image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678",
      overview: `
## What to Expect

- Keynote speeches
- Networking sessions
- Startup showcase

### Topics Covered

- AI & Machine Learning
- Web3
- Cloud Computing

Don't miss this opportunity!
      `,
      photos: [
        "https://images.unsplash.com/photo-1492724441997-5dc865305da7",
        "https://images.unsplash.com/photo-1515169067868-5387ec356754",
        "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b",
      ],
      sponser: [{
        name:"Company XYZ",
        tagline:"Innovating the Future",
      },
      {
        name:"Company ABC",
        tagline:"Empowering Technology",
      },
      
      ],

      speakers: [
        {
          name: "Speaker 1",
          description: "Expert in AI and Machine Learning",
        },
        {
          name: "Speaker 2",
          description: "Renowned Web3 Developer",
        },
      ],
    },
  ];

  const event = events.find((e) => e.id === id);

  const navItems = collegeAdminNavItems;

  const renderedOverview = useMemo(() => {
    if (!event?.overview) return "";
    return marked.parse(event.overview.trim());
  }, [event?.overview]);

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
                <p className="font-medium">{event.date}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-3 pt-4">
              <Clock className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Time</p>
                <p className="font-medium">{event.time}</p>
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
                  {event.attendees}/{event.maxAttendees}
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


        {
          event.sponser && event.sponser.length > 0 && (
            <Card className="border-border/50">
              <CardContent className="p-6 pt-4">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold">Event Sponsors</h3>
                </div>

                <div className="space-y-4">
                  {event.sponser.map((sponsor, index) => (
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
                      <p className="text-sm text-muted-foreground">{speaker.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        }

        {/* Photos */}
        {event.photos && event.photos.length > 0 && (
          <Card className="border-border/50">
            <CardContent className="p-6 pt-4">
              <div className="flex items-center gap-2 mb-4">
                <ImageIcon className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Event Photos</h3>
                <Badge variant="secondary">{event.photos.length} photos</Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {event.photos.map((photo, index) => (
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

export default AdminEventDetailPage;
