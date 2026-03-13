import { useState, useMemo, useEffect } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../components/ui/Dialog";
import { Search, Eye } from "lucide-react";
import { studentNavItems } from "../../config/Navigation";
import { marked } from "marked";
import { PenTool } from "lucide-react";
import { Textarea } from "../../components/ui/Textarea";
import { Label } from "../../components/ui/Label";
import { toast } from "../../hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const StudentNewspaperPage = () => {
  // State variables
  const [newspaper, setNewspaper] = useState([]);
  const [viewArticle, setViewArticle] = useState(null);
  const [query, setQuery] = useState("");
  const [requestOpen, setRequestOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [experience, setExperience] = useState("");
  const [portfolioLink, setPortfolioLink] = useState("");

  // Base URL for API calls related to student
  const baseUrl = "http://localhost:8080/campus-connect/student";

      const navigate = useNavigate();
      const { routeProtection } = useAuth();
      useEffect(() => {
        if (!routeProtection("STUDENT")) {
          navigate("/auth");
        }
      },[]);

  //  Compile Markdown
  const renderedContent = useMemo(() => {
    if (!viewArticle?.content) return "";
    return marked.parse(viewArticle.content.trim());
  }, [viewArticle?.content]);

  // Fetch newspaper articles
  const fetchArticles = async () => {
    await fetch(baseUrl + "/news-papers", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setNewspaper(data);
      })
      .catch((err) => {
        toast({
          title: "Error",
          description: err.message || "Failed to fetch newspaper articles",
          variant: "destructive",
        });
      });
  };

  // Filter articles based on search query
  const articles = newspaper.filter((a) =>
    a.title.toLowerCase().includes(query.toLowerCase()),
  );
// become journalist request
  const handleSubmitRequest = async() => {
    if (!reason.trim() || !experience.trim()) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

      await fetch(`${baseUrl}/news-papers/become`,{
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({
          why:reason,
          experience,
          portfolioLink
        })
      })
      .then(async (res) => {
        const data = await res.json();
        if(data.message==="Your journalist has been sent successfully"){
          toast({
            title: "Request Submitted",
            description: data.message || "Your request to become a journalist has been submitted successfully!",
            variant: "success",
          });
        }
        else{
          toast({
            title: "Request Failed",
            description: data.message,
            variant: "destructive",
          });
        }
        setReason("");
        setExperience("");
        setPortfolioLink("");
        setRequestOpen(false);
      })
      .catch((err) => {
        toast({
          title: "Error",
          description: "Failed to submit journalist request",
          variant: "destructive",
        });
      });
  };

  //load articles on component mount
  useEffect(() => {
    fetchArticles();
  }, []);

  //-----------------------UI--------------------------//
  return (
    <DashboardLayout navItems={studentNavItems} title="Newspaper" bell={true}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">College Newspaper</h1>
            <p className="text-muted-foreground">
              Read latest published articles
            </p>
          </div>

          <div className="flex gap-2">
            {/* Become Journalist Button */}
            <Dialog open={requestOpen} onOpenChange={setRequestOpen}>
              <Button variant="outline" onClick={() => setRequestOpen(true)}>
                <PenTool className="w-4 h-4 mr-2" />
                Become Journalist
              </Button>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Become a Journalist</DialogTitle>
                  <DialogDescription>
                    Submit your credentials to request journalist access
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 pt-2">
                  {/* Reason */}
                  <div className="space-y-1">
                    <Label>Why do you want to become a journalist? *</Label>
                    <Textarea
                      placeholder="Describe your motivation..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    />
                  </div>

                  {/* Experience */}
                  <div className="space-y-1">
                    <Label>Writing Experience *</Label>
                    <Textarea
                      placeholder="Describe your writing experience..."
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                    />
                  </div>

                  {/* Portfolio */}
                  <div className="space-y-1">
                    <Label>Portfolio Link (optional)</Label>
                    <Input
                      placeholder="https://your-portfolio.com"
                      value={portfolioLink}
                      onChange={(e) => setPortfolioLink(e.target.value)}
                    />
                  </div>

                  <Button className="w-full" onClick={handleSubmitRequest}>
                    Submit Request
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Search */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                className="pl-10"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          {articles.length} articles available
        </p>

        {/* Articles Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((article) => (
            <Card key={article.id} className="border-border/50 overflow-hidden">
              <img
                src={article.imageUrl}
                alt={article.title}
                className="w-full h-40 object-cover"
              />

              <CardContent className="p-4 pt-4">
                <h4 className="font-semibold line-clamp-2 mb-2">
                  {article.title}
                </h4>

                <p className="text-sm text-muted-foreground mb-3">
                  By {article.journalistName} •{" "}
                  {article.createdAt.split("T")[0]}
                </p>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setViewArticle(article)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Read Article
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* View Article Dialog */}
      <Dialog
        open={!!viewArticle}
        onOpenChange={(open) => !open && setViewArticle(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewArticle?.title}</DialogTitle>
            <DialogDescription>
              By {viewArticle?.journalistName} •{" "}
              {viewArticle?.createdAt.split("T")[0]}
            </DialogDescription>
          </DialogHeader>

          {viewArticle && (
            <div className="space-y-4">
              <img
                src={viewArticle.imageUrl}
                alt={viewArticle.title}
                className="w-full h-56 object-cover rounded-lg"
              />

              <div
                className="prose dark:prose max-w-none"
                dangerouslySetInnerHTML={{
                  __html: renderedContent,
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default StudentNewspaperPage;
