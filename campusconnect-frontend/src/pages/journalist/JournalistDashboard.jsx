import { useState } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { Card, CardContent } from "../../components/ui/Card";
import { CheckCircle, FileText } from "lucide-react";
import { journalistNavItems } from "../../config/Navigation";

/* ---------------- NAV ITEMS ---------------- */
const navItems = journalistNavItems;

/* ---------------- TEMP USER ---------------- */
const tempUser = {
  name: "Ronak",
  college: "DDU University",
};

/* ---------------- TEMP ARTICLES ---------------- */
const initialArticles = [
  {
    id: "1",
    title: "Annual Tech Fest Highlights",
    status: "published",
    content:
      "The annual tech fest was filled with innovation, coding competitions, robotics events, and exciting guest lectures from industry experts.",
  },
  {
    id: "2",
    title: "Sports Championship Results",
    status: "published",
    content:
      "The inter-college sports championship concluded with thrilling finals and outstanding performances from all participating teams.",
  },
  {
    id: "3",
    title: "Interview with New Dean",
    status: "published",
    content:
      "An exclusive interview with the newly appointed dean discussing future academic reforms and student engagement strategies.",
  },
  {
    id: "4",
    title: "Upcoming Science Fair Preview",
    status: "draft",
    content:
      "The science fair will showcase creative and innovative projects from students across various departments.",
  },
];

const JournalistDashboard = () => {
  const [articles] = useState(initialArticles);

  /* ---------------- STATS ---------------- */
  const published = articles.filter((a) => a.status === "published");
  const drafts = articles.filter((a) => a.status === "draft");

  /* ---------------- TOP 3 PUBLISHED ---------------- */
  const topThree = published.slice(0, 3);

  return (
    <DashboardLayout navItems={navItems} title="Journalist Dashboard">
      <div className="space-y-8">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-6 border">
          <h2 className="text-2xl font-bold">
            Welcome, {tempUser.name}!
          </h2>
          <p className="text-muted-foreground">
            Dashboard overview for {tempUser.college}
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
          <StatCard
            icon={<CheckCircle className="text-green-600 w-5 h-5" />}
            label="Published"
            value={published.length}
          />

          <StatCard
            icon={<FileText className="text-blue-600 w-5 h-5" />}
            label="Drafts"
            value={drafts.length}
          />
        </div>

        {/* ---------------- TOP 3 ARTICLES ---------------- */}
        <div>
          <h3 className="text-xl font-semibold mb-4">
            Top 3 Newspapers
          </h3>

          <div className="grid gap-4">
            {topThree.map((article) => (
              <Card key={article.id}>
                <CardContent className="p-4">
                  <h4 className="font-semibold text-lg">
                    {article.title}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-2">
                    {article.content.substring(0,60)}...
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