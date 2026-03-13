import { useEffect, useState } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { Card, CardContent } from "../../components/ui/Card";
import { CheckCircle, FileText } from "lucide-react";
import { journalistNavItems } from "../../config/Navigation";

/* ---------------- NAV ITEMS ---------------- */
const navItems = journalistNavItems;

const JournalistDashboard = () => {
  // State variables
  const [stats,setStats] = useState({
    published: 0,
    draft: 0,
  });
  const [details,setDetails] = useState({
    name: "",
    college: "",
  });
  const [topArticles,setTopArticles] = useState([]);

  // Base URL for API calls related to journalist
  const baseUrl="http://localhost:8080/campus-connect/journalist";


  // Fetch dashboard stats
  const fetchStats = async() => {
    await fetch(`${baseUrl}/stats`,{
      method:"GET",
      headers:{
        "Content-Type":"application/json",
        "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
      },
    })
    .then(res => res.json())
    .then(data => {
      setStats({
        published: data.published,
        draft: data.draft,
      });
    })
    .catch(err => {
      console.error("Error fetching stats:", err);
    });
  }

  // Fetch journalist details
  const fetchDetails = async() => {
    await fetch(`${baseUrl}/journalist-detail`,{
      method:"GET",
      headers:{
        "Content-Type":"application/json",
        "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
      },
    })
    .then(res => res.json())
    .then(data => {
      setDetails({
        name: data.name,
        college: data.collegeName,
      });
    })
    .catch(err => {
      console.error("Error fetching details:", err);
    });
  }

  // Fetch top 3 articles
  const fetchTopArticles = async() => {
    await fetch(`${baseUrl}/newspapers/latest`,{
      method:"GET",
      headers:{
        "Content-Type":"application/json",
        "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
      },
    })
    .then(res => res.json())
    .then(data => {
      setTopArticles(data);
    })
    .catch(err => {
      console.error("Error fetching top articles:", err);
    });
  } 

  //load data on component mount
  useEffect(() => {
    fetchStats();
    fetchDetails();
    fetchTopArticles();
  }, []);

  //-----------------------UI--------------------------//
  return (
    <DashboardLayout navItems={navItems} title="Journalist Dashboard">
      <div className="space-y-8">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-6 border">
          <h2 className="text-2xl font-bold">
            Welcome, {details.name}!
          </h2>
          <p className="text-muted-foreground">
            Dashboard overview for {details.college}
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
          <StatCard
            icon={<CheckCircle className="text-green-600 w-5 h-5" />}
            label="Published"
            value={stats.published}
          />

          <StatCard
            icon={<FileText className="text-blue-600 w-5 h-5" />}
            label="Drafts"
            value={stats.draft}
          />
        </div>

        {/* ---------------- TOP 3 ARTICLES ---------------- */}
        <div>
          <h3 className="text-xl font-semibold mb-4">
            Top 3 Newspapers
          </h3>

          <div className="grid gap-4">
            {topArticles.map((article) => (
              <Card key={article.id}>
                <CardContent className="p-4">
                  <h4 className="font-semibold text-lg">
                    {article.title}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-2">
                    {article.content.substring(0,100)}...
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {article.createdAt.split("T")[0]}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

/* ---------------- STAT CARD COMPONENT ---------------- */
const StatCard = ({ icon, label, value }) => (
  <Card>
    <CardContent className="p-4 flex items-center gap-3">
      <div className="w-10 h-10 bg-muted/40 rounded-xl flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </CardContent>
  </Card>
);

export default JournalistDashboard;