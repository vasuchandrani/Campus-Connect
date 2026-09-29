import "./CollegeAdminDashboard.css";
import { useEffect, useState } from "react";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import {
  Building2,
  Users,
  BookOpen,
  Newspaper,
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  ArrowUpRight,
  User,
} from "lucide-react";
import { collegeAdminNavItems } from "../../../config/Navigation";
import { useAuth } from "../../../contexts/AuthContext";
import EmptyState from "../../../components/ui/EmptyState";
import { collegeAdminApi } from "../../../services/api";

export default function CollegeAdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [latestNews, setLatestNews] = useState(null);
  const [latestEvents, setLatestEvents] = useState([]);
  const [collegeName, setCollegeName] = useState("");
  const [pageLoading, setPageLoading] = useState(true);

  const { routeProtection } = useAuth();

  useEffect(() => {
    if (!routeProtection("COLLEGE_ADMIN")) {
      navigate("/auth");
    }
  }, [navigate, routeProtection]);

  const fetchStats = async () => {
    try {
      const statsData = await collegeAdminApi.getStats();
      setStats(statsData || {});
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const fetchLatestNews = async () => {
    try {
      const data = await collegeAdminApi.getLatestNews();
      if (data && data.id) {
        setLatestNews(data);
      }
    } catch (err) {
      console.error("Failed to fetch latest news:", err);
    }
  };

  const fetchLatestEvents = async () => {
    try {
      const data = await collegeAdminApi.getActiveEvents();
      if (Array.isArray(data)) {
        setLatestEvents(data.slice(0, 3));
      }
    } catch (err) {
      console.error("Failed to fetch active events:", err);
    }
  };

  const fetchCollegeName = async () => {
    try {
      const text = await collegeAdminApi.getCollegeName();
      setCollegeName(typeof text === "string" ? text : text?.name || "Campus");
    } catch (err) {
      console.error("Error fetching college name:", err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setPageLoading(true);
      try {
        await Promise.all([
          fetchStats(),
          fetchLatestNews(),
          fetchLatestEvents(),
          fetchCollegeName(),
        ]);
      } catch (err) {
        console.error("Error loading college admin dashboard:", err);
      } finally {
        setPageLoading(false);
      }
    };

    fetchData();
  }, []);

  // Custom Tailored Skeleton for Dashboard
  if (pageLoading) {
    return (
      <DashboardLayout navItems={collegeAdminNavItems} title="Dashboard">
        <div className="space-y-6 animate-pulse">
          {/* Top Banner Skeleton */}
          <div className="rounded-2xl border border-border/60 bg-card/60 p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-2 w-full sm:w-1/2">
              <div className="h-3.5 w-24 bg-muted rounded-md" />
              <div className="h-6 sm:h-7 w-48 bg-muted rounded-lg" />
              <div className="h-3.5 w-64 bg-muted/70 rounded-md" />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="h-9 w-24 bg-muted rounded-lg flex-1 sm:flex-none" />
              <div className="h-9 w-28 bg-muted rounded-lg flex-1 sm:flex-none" />
            </div>
          </div>

          {/* 4 Stat Cards Skeleton */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="p-3 sm:p-4.5 rounded-xl border border-border/60 bg-card/60 flex flex-col items-center justify-center text-center space-y-2 relative"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-muted mx-auto" />
                <div className="space-y-1 pt-1 flex flex-col items-center w-full">
                  <div className="h-6 sm:h-7 w-16 bg-muted rounded-md mx-auto" />
                  <div className="h-3.5 w-24 bg-muted/70 rounded mx-auto" />
                </div>
              </div>
            ))}
          </div>

          {/* Main Grid Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-4">
              <div className="h-5 w-36 bg-muted rounded" />
              <div className="h-64 rounded-2xl border border-border/60 bg-card/60 p-5 space-y-4">
                <div className="h-36 bg-muted rounded-xl" />
                <div className="space-y-2">
                  <div className="h-5 w-3/4 bg-muted rounded" />
                  <div className="h-3.5 w-full bg-muted/60 rounded" />
                </div>
              </div>
            </div>
            <div className="lg:col-span-5 space-y-4">
              <div className="h-5 w-32 bg-muted rounded" />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl border border-border/60 bg-card/60 space-y-2"
                  >
                    <div className="flex justify-between">
                      <div className="h-4 w-28 bg-muted rounded" />
                      <div className="h-4 w-16 bg-muted rounded" />
                    </div>
                    <div className="h-3 w-40 bg-muted/60 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const statItems = [
    {
      label: "Active Clubs",
      value: stats.clubs ?? 0,
      icon: Building2,
      subtitle: "Affiliated student bodies",
      route: "/campus-connect/college-admin/clubs",
      color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    },
    {
      label: "Research Papers",
      value: stats.publishedPapers ?? 0,
      icon: BookOpen,
      subtitle: "Verified faculty & student papers",
      route: "/campus-connect/college-admin/research",
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      label: "Journalists",
      value: stats.journalist ?? 0,
      icon: Newspaper,
      subtitle: "Active campus reporters",
      route: "/campus-connect/college-admin/users",
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    },
    {
      label: "Enrolled Students",
      value: stats.students ?? 0,
      icon: Users,
      subtitle: "Verified student profiles",
      route: "/campus-connect/college-admin/users",
      color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
    },
  ];

  return (
    <DashboardLayout navItems={collegeAdminNavItems} title="Dashboard">
      <div className="space-y-5 sm:space-y-6">
        {/* Welcome / Overview Header Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-card via-card/90 to-primary/5 p-4 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="text-[10px] sm:text-[11px] font-semibold border-primary/20 bg-primary/10 text-primary uppercase tracking-wider"
                >
                  Institution Command Center
                </Badge>
                <span className="text-[11px] sm:text-xs text-muted-foreground">
                  • System Active
                </span>
              </div>
              <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-foreground">
                {collegeName || "Campus Connect"}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed line-clamp-2 sm:line-clamp-none">
                Review live campus activities, publication queues, academic
                papers, and student organizations.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-0.5 sm:pt-0 shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8 sm:h-9 px-3 flex-1 sm:flex-none border-border/80 hover:bg-muted/60"
                onClick={() => navigate("/campus-connect/college-admin/settings")}
              >
                Settings
              </Button>
              <Button
                size="sm"
                className="text-xs h-8 sm:h-9 px-3.5 flex-1 sm:flex-none font-medium shadow-xs"
                onClick={() => navigate("/campus-connect/college-admin/clubs")}
              >
                <span>Clubs Hub</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* 4 Core Stat Cards - Ultra Responsive */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 w-full">
          {statItems.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card
                key={idx}
                className="border-border/70 bg-card/80 backdrop-blur-xs hover:border-primary/40 hover:shadow-xs active:scale-[0.98] transition-all cursor-pointer group rounded-xl sm:rounded-2xl w-full min-w-0 overflow-hidden relative"
                onClick={() => navigate(stat.route)}
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

        {/* 2-Column Responsive Section: Latest Newspaper + Upcoming Events */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Latest Newspaper (Col 7) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-semibold tracking-tight text-foreground">
                  Latest Newspaper
                </h2>
                <p className="text-xs text-muted-foreground">
                  Most recently published edition
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-8 px-2.5 text-muted-foreground hover:text-foreground"
                onClick={() => navigate("/campus-connect/college-admin/newspaper")}
              >
                View Feed
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>

            {!latestNews ? (
              <Card className="border-border/70 bg-card/60">
                <CardContent className="p-6 sm:p-8">
                  <EmptyState
                    icon={<Newspaper className="w-7 h-7 text-muted-foreground" />}
                    title="No Published Editions"
                    desc="Appointed campus journalists haven't released an edition yet."
                  />
                </CardContent>
              </Card>
            ) : (
              <Card
                className="border-border/70 bg-card/70 backdrop-blur-xs overflow-hidden hover:border-border hover:shadow-xs transition-all cursor-pointer group"
                onClick={() => navigate("/campus-connect/college-admin/newspaper")}
              >
                <div className="flex flex-col sm:flex-row">
                  {latestNews.imageUrl ? (
                    <div className="sm:w-56 h-40 sm:h-auto overflow-hidden bg-muted shrink-0">
                      <img
                        src={latestNews.imageUrl}
                        alt={latestNews.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="sm:w-44 h-28 sm:h-auto bg-muted/60 flex items-center justify-center shrink-0">
                      <Newspaper className="w-8 h-8 text-muted-foreground/50" />
                    </div>
                  )}

                  <CardContent className="p-4 sm:p-5 flex flex-col justify-between flex-1">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant="outline"
                          className="text-[11px] font-medium border-primary/20 bg-primary/5 text-primary"
                        >
                          {latestNews.isGlobal
                            ? "Globally Published"
                            : "Campus Published"}
                        </Badge>
                        {latestNews.createdAt && (
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(latestNews.createdAt).toLocaleDateString(
                              undefined,
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-foreground line-clamp-2 leading-snug">
                        {latestNews.title}
                      </h3>

                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {latestNews.content
                          ?.replace(/[#*`_]/g, "")
                          .slice(0, 160)}
                        ...
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-border/50 text-xs">
                      <div className="flex items-center gap-1.5 text-muted-foreground truncate">
                        <User className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate font-medium text-foreground">
                          {latestNews.journalistName || "Student Journalist"}
                        </span>
                      </div>
                      <span className="text-primary font-medium text-xs flex items-center gap-1 shrink-0 group-hover:translate-x-0.5 transition-transform">
                        Read Story <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </CardContent>
                </div>
              </Card>
            )}
          </div>

          {/* Latest Events - 3 (Col 5) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-semibold tracking-tight text-foreground">
                  Upcoming Events
                </h2>
                <p className="text-xs text-muted-foreground">
                  Next 3 scheduled campus activities
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-8 px-2.5 text-muted-foreground hover:text-foreground"
                onClick={() => navigate("/campus-connect/college-admin/clubs")}
              >
                All Events
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>

            {latestEvents.length === 0 ? (
              <Card className="border-border/70 bg-card/60">
                <CardContent className="p-6 sm:p-8">
                  <EmptyState
                    icon={<Calendar className="w-7 h-7 text-muted-foreground" />}
                    title="No Live Events"
                    desc="No upcoming campus or club events scheduled right now."
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {latestEvents.map((event) => {
                  const eventDate = event.startTime
                    ? new Date(event.startTime).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })
                    : "Upcoming";
                  const eventTime = event.startTime
                    ? new Date(event.startTime).toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "";

                  return (
                    <Card
                      key={event.id}
                      className="border-border/70 bg-card/70 backdrop-blur-xs hover:border-border hover:shadow-xs transition-all cursor-pointer group"
                      onClick={() =>
                        navigate(
                          `/campus-connect/college-admin/events/${event.id}`
                        )
                      }
                    >
                      <CardContent className="p-3.5 sm:p-4 flex items-center gap-3">
                        {/* Mini Date Badge Box */}
                        <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex flex-col items-center justify-center shrink-0 text-center">
                          <span className="text-[10px] font-bold text-primary uppercase">
                            {eventDate.split(" ")[0]}
                          </span>
                          <span className="text-sm font-extrabold text-foreground leading-none">
                            {eventDate.split(" ")[1] || ""}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <Badge
                              variant="outline"
                              className="text-[10px] py-0 px-1.5 bg-muted/60 text-muted-foreground border-border/80 truncate max-w-[120px]"
                            >
                              {event.clubName || "Campus Event"}
                            </Badge>
                            {eventTime && (
                              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                <Clock className="w-3 h-3" />
                                {eventTime}
                              </span>
                            )}
                          </div>
                          <h4 className="text-xs sm:text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                            {event.title}
                          </h4>
                          {event.venue && (
                            <p className="text-[11px] text-muted-foreground flex items-center gap-1 truncate">
                              <MapPin className="w-3 h-3 shrink-0 text-muted-foreground/70" />
                              <span className="truncate">{event.venue}</span>
                            </p>
                          )}
                        </div>

                        <ArrowRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
