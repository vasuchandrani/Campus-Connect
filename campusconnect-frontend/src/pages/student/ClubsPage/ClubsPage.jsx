import "./ClubsPage.css";
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import { Card, CardContent } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { studentNavItems } from "../../../config/Navigation";
import { Search, Eye, Users, GraduationCap, UserCheck, ArrowUpRight } from "lucide-react";
import { Input } from "../../../components/ui/Input";
import { toast } from "../../../hooks/use-toast";
import { useAuth } from "../../../contexts/AuthContext";
import PageSkeleton from "../../../components/ui/PageSkeleton";
import EmptyState from "../../../components/ui/EmptyState";
import { clubApi } from "../../../services/api";

const ClubsPage = () => {
  // State variables
  const [clubs, setClubs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { routeProtection } = useAuth();

  useEffect(() => {
    if (!routeProtection("STUDENT")) {
      navigate("/auth");
    }
  }, [navigate, routeProtection]);

  // Fetch clubs from API
  const fetchClubs = async () => {
    setLoading(true);
    try {
      const data = await clubApi.getAllClubs();
      setClubs(Array.isArray(data) ? data : []);
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "Failed to fetch clubs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubs();
  }, []);

  // Search filter
  const filteredClubs = useMemo(() => {
    const term = searchQuery.toLowerCase();
    return clubs.filter(
      (club) =>
        (club.name && club.name.toLowerCase().includes(term)) ||
        (club.tagline1 && club.tagline1.toLowerCase().includes(term)) ||
        (club.tagline2 && club.tagline2.toLowerCase().includes(term)) ||
        (club.mentorName && club.mentorName.toLowerCase().includes(term)) ||
        (club.adminName && club.adminName.toLowerCase().includes(term)) ||
        (club.description && club.description.toLowerCase().includes(term))
    );
  }, [clubs, searchQuery]);

  return (
    <DashboardLayout navItems={studentNavItems} title="Clubs" bell={true}>
      {loading ? (
        <PageSkeleton variant="cards" count={6} />
      ) : (
        <div className="space-y-5 sm:space-y-6 w-full min-w-0">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-6 h-6 text-primary" />
                <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                  Campus Clubs Directory
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Explore and connect with all officially active student clubs and organizations in your college
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search clubs, mentors..."
                className="pl-9 h-9 text-xs sm:text-sm"
              />
            </div>
          </div>

          {/* Clubs Grid */}
          {filteredClubs.length === 0 ? (
            <Card className="border-dashed border-border/80">
              <CardContent className="py-12">
                <EmptyState
                  icon={Users}
                  title={searchQuery ? "No Matching Clubs" : "No Active Clubs Found"}
                  description={
                    searchQuery
                      ? `No active clubs matching "${searchQuery}". Try a different keyword.`
                      : "No active clubs are currently registered in the college."
                  }
                />
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
              {filteredClubs.map((club) => (
                <Card
                  key={club.id}
                  className="border-border/70 bg-card/80 backdrop-blur-xs overflow-hidden hover:border-primary/40 hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col justify-between group rounded-2xl relative min-w-0"
                  onClick={() =>
                    navigate(`/campus-connect/student/clubs/${club.id}`)
                  }
                >
                  <div>
                    {/* Full Top Image Banner */}
                    <div className="relative h-40 sm:h-44 bg-muted overflow-hidden">
                      <img
                        src={
                          club.logoUrl ||
                          "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=600&auto=format&fit=crop&q=80"
                        }
                        alt={club.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />

                      {/* Top Badges */}
                      <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
                        {(club.tagline1 || club.tagline2 || club.category) && (
                          <Badge className="bg-background/85 text-foreground border-border/60 text-[10px] sm:text-[11px] font-semibold shadow-xs backdrop-blur-xs px-2 py-0.5 max-w-[150px] truncate">
                            {club.tagline1 || club.tagline2 || club.category}
                          </Badge>
                        )}
                      </div>

                      {/* Member Count Pill on bottom-right of image */}
                      <div className="absolute bottom-2.5 right-2.5 z-10">
                        <Badge
                          variant="secondary"
                          className="text-[11px] font-semibold flex items-center gap-1 py-0.5 px-2.5 bg-background/85 text-foreground backdrop-blur-xs border border-border/50 shadow-xs"
                        >
                          <Users className="w-3.5 h-3.5 text-primary" />
                          <span>{club.members ?? club.memberCount ?? 0}</span>
                        </Badge>
                      </div>
                    </div>

                    {/* Card Content */}
                    <CardContent className="p-4 sm:p-5 space-y-2">
                      <div className="min-w-0">
                        <h3 className="font-bold text-base sm:text-lg text-foreground truncate group-hover:text-primary transition-colors leading-snug">
                          {club.name}
                        </h3>
                        {(club.tagline2 || club.category) && club.tagline1 && (
                          <p className="text-[11px] font-medium text-primary/80 truncate">
                            {club.tagline2 || club.category}
                          </p>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed min-h-[2.25rem]">
                        {club.description || "Active student organization enriching campus life."}
                      </p>

                      {/* Leadership Metadata */}
                      <div className="pt-2.5 border-t border-border/60 space-y-1 text-xs text-muted-foreground">
                        {club.mentorName && (
                          <div className="flex items-center justify-between gap-1 text-[11px]">
                            <span className="flex items-center gap-1 text-muted-foreground shrink-0">
                              <GraduationCap className="w-3 h-3 text-primary" />
                              Faculty Mentor:
                            </span>
                            <span className="font-medium text-foreground truncate max-w-[140px]">
                              {club.mentorName}
                            </span>
                          </div>
                        )}
                        {club.adminName && (
                          <div className="flex items-center justify-between gap-1 text-[11px]">
                            <span className="flex items-center gap-1 text-muted-foreground shrink-0">
                              <UserCheck className="w-3 h-3 text-primary" />
                              Student Lead:
                            </span>
                            <span className="font-medium text-foreground truncate max-w-[140px]">
                              {club.adminName}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </div>

                  {/* Card Action Footer */}
                  <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs h-8 sm:h-9 border-border/80 hover:bg-primary hover:text-primary-foreground transition-colors justify-center gap-1.5 shadow-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/campus-connect/student/clubs/${club.id}`);
                      }}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Explore Club Details</span>
                      <ArrowUpRight className="w-3 h-3 ml-auto opacity-70" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default ClubsPage;
