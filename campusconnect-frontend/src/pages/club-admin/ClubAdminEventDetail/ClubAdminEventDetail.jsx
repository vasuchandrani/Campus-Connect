import "./ClubAdminEventDetail.css";
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
  Edit3,
  UploadCloud,
  Loader2,
  Sparkles,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../../components/ui/Dialog";
import { Label } from "../../../components/ui/Label";
import { Textarea } from "../../../components/ui/Textarea";
import { Input } from "../../../components/ui/Input";
import { clubMemberNavItems } from "../../../config/Navigation";
import { marked } from "marked";
import { useMemo, useEffect, useState, useCallback } from "react";
import { toast } from "../../../hooks/use-toast";
import PageSkeleton from "../../../components/ui/PageSkeleton";
import { useAuth } from "../../../contexts/AuthContext";
import { clubAdminApi } from "../../../services/api";

const ClubAdminEventDetailPage = () => {
  const { clubId, id } = useParams();
  const navigate = useNavigate();
  const { isClubAdmin } = useAuth();

  //--------------Nav---------------//
  const navItems = useCallback(() => {
    return clubMemberNavItems.map((item) => ({
      ...item,
      href: item.href.replace(":clubId", clubId),
    }));
  }, [clubId]);

  //state variables
  const [event, setEvent] = useState({});
  const [loading, setLoading] = useState(true);

  // Function to format date and time
  const formatDate = (dateTime) => {
    if (!dateTime) return { date: "", time: "" };
    const [date, time] = dateTime.split("T");
    return { date, time: time.substring(0, 5) };
  };

  const [overviewOpen, setOverviewOpen] = useState(false);
  const [overviewForm, setOverviewForm] = useState({ overview: "" });
  const [overviewImages, setOverviewImages] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [savingOverview, setSavingOverview] = useState(false);

  const handleOpenOverview = () => {
    setOverviewForm({ overview: event.overview || "" });
    setOverviewImages([]);
    setOverviewOpen(true);
  };

  const handleGenerateOverview = async () => {
    setGenerating(true);
    try {
      // Backend returns a simple string for this endpoint
      const data = await clubAdminApi.generateOverview(clubId, id);
      setOverviewForm(prev => ({ ...prev, overview: data }));
      toast({ title: "Generated", description: "AI Overview generated successfully." });
    } catch (err) {
      toast({ title: "Generation failed", description: err.message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveOverview = async () => {
    setSavingOverview(true);
    try {
      const formData = new FormData();
      const overviewDto = {
        overview: overviewForm.overview,
        winners: [], // Assuming winners are managed elsewhere or not changed here
        oldImages: event.images || []
      };
      formData.append("overview", new Blob([JSON.stringify(overviewDto)], { type: "application/json" }));
      overviewImages.forEach(img => formData.append("images", img));

      await clubAdminApi.saveOverview(clubId, id, formData);
      toast({ title: "Success", description: "Post-event details saved." });
      setOverviewOpen(false);
      fetchEventDetails();
    } catch (err) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    } finally {
      setSavingOverview(false);
    }
  };

  const removeOverviewImage = (idx) => {
    setOverviewImages(prev => prev.filter((_, i) => i !== idx));
  };

  //fetching event details
  const fetchEventDetails = async () => {
    setLoading(true);
    try {
      const data = await clubAdminApi.getEventDetails(clubId, id);
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

  // Fetch event details on component mount
  useEffect(() => {
    const checkAdminAndFetchData = async () => { 
      try {
        const admin = await isClubAdmin(clubId);
        if (!admin) {
          toast({
            title: "Unauthorized",
            description: "You are not an admin of this club",
            variant: "destructive",
          });
          navigate(-1);
          return;
        }
        await fetchEventDetails();
      } catch (error) {
        toast({
          title: "Unauthorized",
          description: "You are not an admin of this club",
          variant: "destructive",
        });
        navigate(-1);
        return;
      }
    };
    checkAdminAndFetchData();
  }, [clubId, id]);

  // Memoized rendered overview to avoid unnecessary re-renders
  const renderedOverview = useMemo(() => {
    if (!event?.overview) return "";
    return marked.parse(event.overview.trim());
  }, [event?.overview]);

  if (loading) {
    return (
      <DashboardLayout navItems={navItems()} title="Event Details">
        <PageSkeleton variant="detail" />
      </DashboardLayout>
    );
  }

  // If event data is can't be fetched or is null, show a not found message
  if (!loading && !event) {
    return (
      <DashboardLayout navItems={navItems()} title="Event Not Found">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Event not found</h2>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={navItems()} title={event.title}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          {event.status === "FINISHED" && (
            <Button onClick={handleOpenOverview} className="gap-2">
              <Edit3 className="w-4 h-4" /> Edit Post-Event Details
            </Button>
          )}
        </div>

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

        {/* Sponsors, Speakers, Winners, Photos - only show if data exists */}
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
                      {(speaker.tagline || speaker.description || speaker.position) && (
                        <p className="text-sm text-muted-foreground">{speaker.tagline || speaker.description || speaker.position}</p>
                      )}
                      {speaker.email && <p className="text-sm text-muted-foreground">{speaker.email}</p>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        }

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

      <Dialog open={overviewOpen} onOpenChange={setOverviewOpen}>
        <DialogContent className="sm:max-w-3xl rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Post-Event Details</DialogTitle>
            <DialogDescription>
              Write an overview and upload photos from the event.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 pt-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-semibold">Event Overview (Markdown supported)</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={handleGenerateOverview} 
                  disabled={generating}
                  className="h-8 gap-1.5"
                >
                  {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  AI Generate
                </Button>
              </div>
              <Textarea 
                value={overviewForm.overview} 
                onChange={(e) => setOverviewForm(prev => ({ ...prev, overview: e.target.value }))}
                placeholder="Write the event overview, highlights, and outcomes..."
                rows={10}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Event Photos</Label>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                {event.images && event.images.length > 0 && event.images.map((img, i) => (
                  <div key={`old-${i}`} className="relative h-24 rounded-lg overflow-hidden border">
                    <img src={img} alt="old" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <span className="text-xs text-white">Existing</span>
                    </div>
                  </div>
                ))}

                {overviewImages.map((img, i) => (
                  <div key={`new-${i}`} className="relative h-24 rounded-lg overflow-hidden border group">
                    <img src={URL.createObjectURL(img)} alt="new" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => removeOverviewImage(i)}
                      className="absolute top-1 right-1 bg-black/60 p-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                
                <Label className="h-24 rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
                  <UploadCloud className="w-6 h-6 text-muted-foreground mb-1" />
                  <span className="text-[10px] text-muted-foreground font-medium">Add Photos</span>
                  <Input
                    type="file"
                    className="hidden"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files) {
                        setOverviewImages(prev => [...prev, ...Array.from(e.target.files)]);
                      }
                    }}
                  />
                </Label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setOverviewOpen(false)}>Cancel</Button>
              <Button type="button" onClick={handleSaveOverview} disabled={savingOverview}>
                {savingOverview ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Save Post-Event Details
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ClubAdminEventDetailPage;
