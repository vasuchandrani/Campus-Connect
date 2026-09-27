import "./ProfessorAnnouncementsPage.css";
import React, { useState, useEffect } from "react";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import { Card, CardContent } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Input } from "../../../components/ui/Input";
import {
  Megaphone,
  Search,
  Calendar,
  Building2,
  Users,
} from "lucide-react";
import { professorNavItems } from "../../../config/Navigation";
import { useAuth } from "../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import EmptyState from "../../../components/ui/EmptyState";
import PageSkeleton from "../../../components/ui/PageSkeleton";
import { professorApi } from "../../../services/api";

const navItems = professorNavItems;

export default function ProfessorAnnouncementsPage() {
  const navigate = useNavigate();
  const { routeProtection } = useAuth();

  const [announcements, setAnnouncements] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!routeProtection("PROFESSOR")) {
      navigate("/auth");
      return;
    }
    fetchAnnouncements();
  }, [navigate, routeProtection]);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const data = await professorApi.getAnnouncements();
      if (Array.isArray(data)) {
        setAnnouncements(data);
      }
    } catch (err) {
      console.error("Error fetching announcements:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAnnouncements = announcements.filter((ann) => {
    const term = searchTerm.toLowerCase();
    return (
      (ann.title && ann.title.toLowerCase().includes(term)) ||
      (ann.clubName && ann.clubName.toLowerCase().includes(term)) ||
      (ann.message && ann.message.toLowerCase().includes(term)) ||
      (ann.description && ann.description.toLowerCase().includes(term))
    );
  });

  if (loading) {
    return (
      <DashboardLayout navItems={navItems} title="Announcements">
        <PageSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={navItems} title="Announcements">
      <div className="space-y-5 sm:space-y-6 max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Megaphone className="w-6 h-6 text-primary" />
              <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                Campus Club Announcements
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Official circulars, updates, and notices broadcasted by student clubs across the college
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search announcements, clubs..."
              className="pl-9 h-9 text-xs sm:text-sm"
            />
          </div>
        </div>

        {/* Announcements List */}
        {filteredAnnouncements.length === 0 ? (
          <Card className="border-dashed border-border/80">
            <CardContent className="py-12">
              <EmptyState
                icon={Megaphone}
                title={searchTerm ? "No Matching Announcements" : "No Announcements Found"}
                description={
                  searchTerm
                    ? `No announcements matching "${searchTerm}".`
                    : "No club announcements have been published in your college yet."
                }
              />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3.5">
            {filteredAnnouncements.map((ann, idx) => (
              <Card
                key={ann.id || idx}
                className="border-border/80 hover:border-primary/40 hover:shadow-xs transition-all duration-200"
              >
                <CardContent className="p-4 sm:p-5 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant="outline"
                        className="text-xs font-semibold bg-primary/5 text-primary border-primary/20 flex items-center gap-1"
                      >
                        <Users className="w-3 h-3" />
                        {ann.clubName || "Campus Club"}
                      </Badge>
                      <h3 className="text-base sm:text-lg font-bold text-foreground">
                        {ann.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                      <Calendar className="w-3.5 h-3.5 text-primary" />
                      <span>
                        {ann.createdAt
                          ? new Date(ann.createdAt).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "Recently"}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                    {ann.message || ann.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
