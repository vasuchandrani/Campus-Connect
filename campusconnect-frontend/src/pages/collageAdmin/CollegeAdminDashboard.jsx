import { useEffect, useState } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import {
  Building2,
  Users,
  BookOpen,
  Newspaper,
  Clock,
  User,
} from "lucide-react";
import { collegeAdminNavItems } from "../../config/Navigation";
import { toast } from "../../hooks/use-toast";

export default function CollegeAdminDashboard() {
  const navigate = useNavigate();
  // State variables
  const [stats, setStats] = useState({});
  const [latestNews, setLatestNews] = useState(null);
  const [collegeName, setCollegeName] = useState("");

  // Base URL for API calls related to college admin
  const baseUrl = "http://localhost:8080/campus-connect/college-admin";

  // Fetch dashboard stats
  const fetchStats = () => {
    fetch(`${baseUrl}/stats`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
      })
      .catch((err) => {
        console.error("Error fetching stats:", err);
        toast({
          title: "Error",
          description: "Failed to fetch dashboard stats",
          variant: "destructive",
        });
      });
  };

  // Fetch latest news for newspaper section
  const getLatestNews = () => {
    fetch(`${baseUrl}/latest-news`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.id) {
          setLatestNews(data);
        }
      })
      .catch((err) => {
        toast({
          title: "Error",
          description: "Failed to fetch latest news",
          variant: "destructive",
        });
      });
  };

  // Fetch college name
  const fetchCollegeName = () => {
    fetch(`${baseUrl}/college-name`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    })
      .then((res) => res.text().then((text) => setCollegeName(text)))
      .catch((err) => {
        console.error("Error fetching college name:", err);
        toast({
          title: "Error",
          description: "Failed to fetch college name",
          variant: "destructive",
        });
      });
  };

  //load data on component mount
  useEffect(() => {
    fetchCollegeName();
    fetchStats();
    getLatestNews();
  }, []);

  //-----------------------------UI----------------------------//
  return (
    <DashboardLayout navItems={collegeAdminNavItems} title="College Admin">
      <div className="space-y-6">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/5 rounded-2xl p-6 border">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">{collegeName} Dashboard</h2>
              <p className="text-muted-foreground">Monitor campus activities</p>
              <Badge className="mt-2"> Patinium Plan</Badge>
            </div>
          </div>
        </div>
        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {/* Students */}
          <Card className="border-border/50 hover:shadow-soft transition-all duration-300">
            <CardContent className="p-6 min-h-[110px] flex items-center">
              <div className="flex items-center gap-6 w-full">
                {/* Icon */}
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6 text-primary" />
                </div>

                {/* Text */}
                <div>
                  <p className="text-3xl font-bold leading-none">
                    {stats.students}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">Students</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Clubs */}
          <Card className="border-border/50 hover:shadow-soft transition-all duration-300">
            <CardContent className="p-6 min-h-[110px] flex items-center">
              <div className="flex items-center gap-6 w-full">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>

                <div>
                  <p className="text-3xl font-bold leading-none">
                    {stats.clubs}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">Clubs</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Journalists */}
          <Card className="border-border/50 hover:shadow-soft transition-all duration-300">
            <CardContent className="p-6 min-h-[110px] flex items-center">
              <div className="flex items-center gap-6 w-full">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Newspaper className="w-6 h-6 text-primary" />
                </div>

                <div>
                  <p className="text-3xl font-bold leading-none">
                    {stats.journalist}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Journalists
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Published Papers */}
          <Card className="border-border/50 hover:shadow-soft transition-all duration-300">
            <CardContent className="p-6 min-h-[110px] flex items-center">
              <div className="flex items-center gap-6 w-full">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>

                <div>
                  <p className="text-3xl font-bold leading-none">
                    {stats.publishedPapers}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Published Papers
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* NEWSPAPER */}
        <Section
          title="Newspaper"
          onShowMore={() => navigate("/campus-connect/college-admin/newspaper")}
        />

        <div className="p-4 border rounded-lg">
          {latestNews && (
            <div className="space-y-4">
              <Card
                className="w-full mx-auto border-border/50 overflow-hidden hover:shadow-md transition-shadow cursor-pointer h-32">
                <div className="flex h-full">
                  {/* Image */}
                  <div className="w-1/3 h-full overflow-hidden">
                    <img
                      src={latestNews.imageUrl}
                      alt={latestNews.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Content */}
                  <CardContent className="p-3  flex flex-col justify-evenly w-2/3">
                    <h2 className="text-lg font-bold line-clamp-1">
                      {latestNews.title}
                    </h2>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{latestNews.journalistName}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{latestNews?.createdAt?.split("T")[0]}</span>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            </div>
          )}

        </div>
      </div>
    </DashboardLayout>
  );
}

/* ---------------- HELPERS ---------------- */
const Section = ({ title, onShowMore }) => (
  <div className="flex items-center justify-between">
    <h3 className="text-lg font-semibold">{title}</h3>
    <Button variant="ghost" size="sm" onClick={onShowMore}>
      Show more
    </Button>
  </div>
);
