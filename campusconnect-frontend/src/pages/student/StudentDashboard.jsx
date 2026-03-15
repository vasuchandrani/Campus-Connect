import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "../../components/ui/Dialog";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { Label } from "../../components/ui/Label";
import {
  Users,
  Calendar,
  ChevronRight,
  Clock,
  MapPin,
  Plus,
  Crown,
  User,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "../../hooks/use-toast";
import { studentNavItems } from "../../config/Navigation";


const navItems = studentNavItems;

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // State variables
  const [clubRequestOpen, setClubRequestOpen] = useState(false);
  const [clubName, setClubName] = useState("");
  const [clubDescription, setClubDescription] = useState("");
  const [newsArticles, setNewsArticles] = useState([]);
  const [events, setEvents] = useState([]);
  const [userClubs, setUserClubs] = useState([]);
  const [stats, setStats] = useState({
    clubs: 0,
    events: 0,
  });
  const [userName, setUserName] = useState("");

  // Base URL for API calls related to student dashboard
  const baseUrl = `${import.meta.env.VITE_BACKEND_URL}/campus-connect/student`;

    const { routeProtection } = useAuth();
    useEffect(() => {
      if (!routeProtection("STUDENT")) {
        navigate("/auth");
      }
    },[]);

  // Fetch user name for welcome message
  const fetchUserName = () => {
    fetch(`${baseUrl}/name`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    })
      .then((res) => res.text())
      .then((name) => setUserName(name))
      .catch((err) =>
        toast({
          title: "Error",
          description: "Failed to fetch user name",
          variant: "destructive",
        }),
      );
  };

  // Fetch dashboard stats
  const getStats = () => {
    const respose = fetch(`${baseUrl}/stats`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    });
    respose
      .then((res) => res.json())
      .then((data) => {
        setStats({ clubs: data.joinedClubs, events: data.upcomingEvents });
      })
      .catch((err) =>
        toast({
          title: "Error",
          description: "Failed to fetch stats",
          variant: "destructive",
        }),
      );
  };

  // Fetch user clubs with roles
  const fetchUserClubs = () => {
    fetch(`${baseUrl}/joined-clubs`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const mappedClubs = data.map((club) => ({
          club: club,
          role: club.role,
        }));

        setUserClubs(mappedClubs);
      })
      .catch((err) =>
        toast({
          title: "Error",
          description: "Failed to fetch user clubs",
          variant: "destructive",
        }),
      );
  };

  // Fetch events
  const fetchEvents = () => {
    fetch(`${baseUrl}/top-events`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setEvents(data);
      })
      .catch((err) =>
        toast({
          title: "Error",
          description: "Failed to fetch events",
          variant: "destructive",
        }),
      );
  };

  // Fetch news articles for campus news section
  const fetchNews = () => {
    fetch(`${baseUrl}/top-news`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setNewsArticles(data))
      .catch((err) =>
        toast({
          title: "Error",
          description: "Failed to fetch news articles",
          variant: "destructive",
        }),
      );
  };

  //load data on component mount
  useEffect(() => {
    fetchUserName();
    fetchUserClubs();
    fetchEvents();
    fetchNews();
    getStats();
  }, []);

  //Handle new Club Request submission
  const handleClubRequest = () => {
    if (!clubName.trim() || !clubDescription.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    // send to backend for create new club
    const data = {
      clubName: clubName.trim(),
      clubDescription: clubDescription.trim(),
    };

    fetch(`${baseUrl}/request-club`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
      body: JSON.stringify(data),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to submit club request");
        return await res.json();
      })
      .then((res) => {
        if(res.message === "Club Request sent successfully") {
        toast({
          title: "Success",
          description:
            res.message,
        });
        setClubRequestOpen(false);
        setClubName("");
        setClubDescription("");
      }
      else{
        toast({
          title: "Error",
          description: res.message || "Failed to submit club request",
          variant: "destructive",
        });
      }
      })
      .catch((err) => {
        toast({
          title: "Error",
          description: "Failed to submit club request",
          variant: "destructive",
        });
      });
  };

  // Navigate to club dashboard based on role
  const gotoclub = (clubID, isAdmin) => {
    if (isAdmin) {
      navigate(`/campus-connect/club-admin/${clubID}/dashboard`);
    } else {
      navigate(`/campus-connect/club-member/${clubID}/dashboard`);
    }
  };

  return (
    <DashboardLayout navItems={navItems} title="Student Dashboard" bell={true}>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/5 rounded-2xl p-6 border border-primary/20">
          <h2 className="text-2xl font-bold mb-2">
            Welcome back, {userName || "Student"}! 👋
          </h2>
          <p className="text-muted-foreground">
            Stay updated with the latest from your campus at {user?.college}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-border/50">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <p className="text-2xl font-bold">{stats.clubs}</p>
              <p className="text-sm text-muted-foreground">Clubs Joined</p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-2">
                <Calendar className="w-6 h-6 text-accent" />
              </div>
              <p className="text-2xl font-bold">{stats.events}</p>
              <p className="text-sm text-muted-foreground">Active Events</p>
            </CardContent>
          </Card>
        </div>

        {/* Your Clubs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Your Clubs</h3>

            <Dialog open={clubRequestOpen} onOpenChange={setClubRequestOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Request New Club
                </Button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Request Club Registration</DialogTitle>
                  <DialogDescription>
                    Submit a request to create a new club. Your request will be
                    reviewed by the college admin.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="clubName">Club Name</Label>
                    <Input
                      id="clubName"
                      value={clubName}
                      onChange={(e) => setClubName(e.target.value)}
                      placeholder="Enter club name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clubDesc">Description</Label>
                    <Textarea
                      id="clubDesc"
                      rows={4}
                      value={clubDescription}
                      onChange={(e) => setClubDescription(e.target.value)}
                      placeholder="Describe your club's purpose and activities"
                    />
                  </div>

                  <Button className="w-full" onClick={handleClubRequest}>
                    Submit Request
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {userClubs.length === 0 ? (
            <Card className="border-border/50 border-dashed">
              <CardContent className="p-8 text-center">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="font-medium mb-2">No Club Memberships</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  You're not a member of any club yet.
                </p>

                <div className="flex gap-3 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => navigate("/campus-connect/student/clubs")}
                  >
                    Browse Clubs
                  </Button>
                  <Button onClick={() => setClubRequestOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Request New Club
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userClubs.map(({ club, role }) => {
                const isAdmin = role === "ADMIN";

                return (
                  <Card
                    key={club.id}
                    className="border-border/50 hover:shadow-soft transition-all cursor-pointer"
                    onClick={() => gotoclub(club.id, isAdmin)}
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <img
                          src={club.logoUrl}
                          alt={club.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{club.name}</h4>
                            {isAdmin ? (
                              <Badge className="bg-primary/10 text-primary border-0">
                                <Crown className="w-3 h-3 mr-1" />
                                Admin
                              </Badge>
                            ) : (
                              <Badge variant="secondary">
                                <User className="w-3 h-3 mr-1" />
                                Member
                              </Badge>
                            )}
                          </div>

                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {club.description}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t">
                        <Button size="sm" className="w-full">
                          {isAdmin ? "Manage Club" : "View Club"}
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Upcoming Events Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Upcoming Events</h3>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary"
                onClick={() => navigate("/campus-connect/student/events")}
              >
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="space-y-3">
              {events.map((event) => (
                <Card
                  key={event.id}
                  className="relative border-border/50 hover:shadow-soft transition-shadow cursor-pointer"
                >
                  <CardContent className="p-4">
                    <Badge variant="outline" className="mb-2">
                      {event.clubName}
                    </Badge>
                    {/* Status Badge Top Right */}
                    <Badge
                      className="absolute top-4 right-4"
                      variant={
                        event.status === "UPCOMING"
                          ? "default"
                          : event.status === "LIVE"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {event.status}
                    </Badge>

                    <h4 className="font-medium mb-2">{event.title}</h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>
                          {event.createAt.split("T")[0]} at{" "}
                          {event.createAt.split("T")[1]}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Campus Announcements / News Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Campus News</h3>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary"
                onClick={() =>
                  navigate("/campus-connect/student/newspaper")
                }
              >
                Read More <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="space-y-3">
              {newsArticles.map((article) => (
                <Card
                  key={article.id}
                  className="border-border/50 hover:shadow-soft transition-shadow cursor-pointer"
                >
                  <CardContent className="p-4 pt-4">
                    <div className="flex gap-4 items-center">
                      <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">

                        <h4 className="font-medium line-clamp-2 mb-1">
                          {article.title}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {article.createdAt.split("T")[0]} by {article.journalistName}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
