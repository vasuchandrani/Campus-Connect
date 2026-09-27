import "./ProfessorEventsPage.css";
import React, { useState, useEffect } from "react";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import { Card, CardContent } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Input } from "../../../components/ui/Input";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../../components/ui/Tabs";
import {
  Calendar,
  Globe,
  CheckCircle,
  Search,
  MapPin,
  Clock,
  Eye,
  Building2,
  Users,
  ExternalLink,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../../components/ui/Dialog";
import { professorNavItems } from "../../../config/Navigation";
import { useAuth } from "../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import EmptyState from "../../../components/ui/EmptyState";
import PageSkeleton from "../../../components/ui/PageSkeleton";
import { professorApi } from "../../../services/api";

const navItems = professorNavItems;

export default function ProfessorEventsPage() {
  const navigate = useNavigate();
  const { routeProtection } = useAuth();

  const [activeTab, setActiveTab] = useState("campus");
  const [campusEvents, setCampusEvents] = useState([]);
  const [globalEvents, setGlobalEvents] = useState([]);
  const [finishedEvents, setFinishedEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Selected event for modal
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    if (!routeProtection("PROFESSOR")) {
      navigate("/auth");
      return;
    }
    loadEventsData();
  }, [navigate, routeProtection]);

  const loadEventsData = async () => {
    setLoading(true);
    try {
      const [campusRes, globalRes, finishedRes] = await Promise.allSettled([
        professorApi.getCampusEvents(),
        professorApi.getGlobalEvents(),
        professorApi.getFinishedEvents(),
      ]);

      if (campusRes.status === "fulfilled" && Array.isArray(campusRes.value)) {
        setCampusEvents(campusRes.value);
      }
      if (globalRes.status === "fulfilled" && Array.isArray(globalRes.value)) {
        setGlobalEvents(globalRes.value);
      }
      if (finishedRes.status === "fulfilled" && Array.isArray(finishedRes.value)) {
        setFinishedEvents(finishedRes.value);
      }
    } catch (err) {
      console.error("Error loading events:", err);
    } finally {
      setLoading(false);
    }
  };

  const getActiveList = () => {
    switch (activeTab) {
      case "campus":
        return campusEvents;
      case "global":
        return globalEvents;
      case "finished":
        return finishedEvents;
      default:
        return campusEvents;
    }
  };

  const filteredEvents = getActiveList().filter((e) => {
    const term = searchTerm.toLowerCase();
    return (
      (e.title && e.title.toLowerCase().includes(term)) ||
      (e.clubName && e.clubName.toLowerCase().includes(term)) ||
      (e.venue && e.venue.toLowerCase().includes(term)) ||
      (e.description && e.description.toLowerCase().includes(term))
    );
  });

  if (loading) {
    return (
      <DashboardLayout navItems={navItems} title="Events">
        <PageSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={navItems} title="Events">
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
              Explore active university events, cross-institutional global summits, and past records
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
              value="campus"
              className="text-xs sm:text-sm font-semibold rounded-lg px-2.5 sm:px-3.5 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs flex items-center justify-center"
            >
              <span>Campus</span>
            </TabsTrigger>
            <TabsTrigger
              value="global"
              className="text-xs sm:text-sm font-semibold rounded-lg px-2.5 sm:px-3.5 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs flex items-center justify-center"
            >
              <span>Global</span>
            </TabsTrigger>
            <TabsTrigger
              value="finished"
              className="text-xs sm:text-sm font-semibold rounded-lg px-2.5 sm:px-3.5 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs flex items-center justify-center"
            >
              <span>Finished</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4 pt-1">
            {filteredEvents.length === 0 ? (
              <Card className="border-dashed border-border/80">
                <CardContent className="py-12">
                  <EmptyState
                    icon={Calendar}
                    title={searchTerm ? "No Matching Events" : `No ${activeTab} Events Found`}
                    description={
                      searchTerm
                        ? `No events matching "${searchTerm}". Try a different keyword.`
                        : `There are currently no events listed under the ${activeTab} category.`
                    }
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {filteredEvents.map((event) => (
                  <Card
                    key={event.id}
                    className="flex flex-col justify-between border-border/80 hover:border-primary/40 hover:shadow-md transition-all duration-200 overflow-hidden"
                  >
                    <div>
                      {/* Event Cover Banner */}
                      <div className="h-40 w-full bg-gradient-to-br from-primary/10 via-accent/20 to-muted relative overflow-hidden border-b border-border/60">
                        {event.posterUrl || event.imageUrl ? (
                          <img
                            src={event.posterUrl || event.imageUrl}
                            alt={event.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/60 p-4 text-center">
                            <Calendar className="w-10 h-10 text-primary/40 mb-1" />
                            <span className="text-xs font-medium">Campus Connect Event</span>
                          </div>
                        )}

                        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                          <Badge
                            className={`text-[10px] font-bold shadow-xs ${
                              activeTab === "global"
                                ? "bg-purple-600 text-white"
                                : activeTab === "finished"
                                ? "bg-muted text-muted-foreground"
                                : "bg-primary text-primary-foreground"
                            }`}
                          >
                            {activeTab === "finished"
                              ? "Concluded"
                              : activeTab === "global"
                              ? "Global Event"
                              : "Active"}
                          </Badge>
                        </div>
                      </div>

                      <CardContent className="p-4 sm:p-5 space-y-3">
                        <div className="space-y-1">
                          {event.clubName && (
                            <Badge
                              variant="outline"
                              className="text-[10px] font-semibold bg-primary/5 text-primary border-primary/20"
                            >
                              {event.clubName}
                            </Badge>
                          )}
                          <h3 className="text-base font-bold text-foreground line-clamp-1">
                            {event.title}
                          </h3>
                        </div>

                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {event.description || "Exciting event hosted for students and faculty."}
                        </p>

                        <div className="pt-2 border-t border-border/60 space-y-1.5 text-xs text-muted-foreground">
                          {event.eventDate && (
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                              <span>
                                {new Date(event.eventDate).toLocaleDateString(undefined, {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                          )}
                          {event.venue && (
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                              <span className="truncate">{event.venue}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </div>

                    <div className="p-3 sm:p-4 pt-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedEvent(event)}
                        className="w-full text-xs font-semibold h-9"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1.5" />
                        View Event Details
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Event Detail Dialog */}
        <Dialog
          open={!!selectedEvent}
          onOpenChange={(open) => !open && setSelectedEvent(null)}
        >
          <DialogContent className="w-[95vw] sm:max-w-xl max-h-[85vh] overflow-y-auto rounded-2xl p-4 sm:p-6">
            <DialogHeader>
              <div className="space-y-1">
                <Badge
                  variant="outline"
                  className="text-xs font-semibold bg-primary/5 text-primary border-primary/20 mb-1"
                >
                  {selectedEvent?.clubName || "Campus Event"}
                </Badge>
                <DialogTitle className="text-lg sm:text-xl font-bold text-foreground">
                  {selectedEvent?.title}
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
                  Organized under {selectedEvent?.clubName || "College Community"}
                </DialogDescription>
              </div>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              {/* Event Poster if available */}
              {(selectedEvent?.posterUrl || selectedEvent?.imageUrl) && (
                <div className="rounded-xl overflow-hidden max-h-56 w-full border border-border/60">
                  <img
                    src={selectedEvent.posterUrl || selectedEvent.imageUrl}
                    alt={selectedEvent.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Event Description & Agenda
                </h4>
                <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                  {selectedEvent?.description || "No full description provided."}
                </p>
              </div>

              {/* Timing & Venue details */}
              <div className="p-3.5 rounded-xl bg-accent/30 border border-border/60 space-y-2 text-xs">
                {selectedEvent?.eventDate && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary shrink-0" />
                    <span className="font-semibold text-foreground">
                      Date & Schedule:
                    </span>
                    <span className="text-muted-foreground">
                      {new Date(selectedEvent.eventDate).toLocaleString()}
                    </span>
                  </div>
                )}
                {selectedEvent?.venue && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary shrink-0" />
                    <span className="font-semibold text-foreground">Venue:</span>
                    <span className="text-muted-foreground">
                      {selectedEvent.venue}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary shrink-0" />
                  <span className="font-semibold text-foreground">Category:</span>
                  <span className="text-muted-foreground">
                    {selectedEvent?.isGlobal ? "Global Inter-College Event" : "Campus College Event"}
                  </span>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
