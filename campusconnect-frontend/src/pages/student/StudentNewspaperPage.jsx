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

const StudentNewspaperPage = () => {

  // State variables
  const [newspaper, setNewspaper] = useState([]);
  const [viewArticle, setViewArticle] = useState(null);
  const [query, setQuery] = useState("");
  
  // Base URL for API calls related to student
  const baseUrl = "http://localhost:8080/campus-connect/student";

  //  Compile Markdown
  const renderedContent = useMemo(() => {
    if (!viewArticle?.content) return "";
    return marked.parse(viewArticle.content.trim());
  }, [viewArticle?.content]);

  // Fetch newspaper articles
  const fetchArticles = async () => {
    await fetch(baseUrl+"/news-papers", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setNewspaper(data);
      })
      .catch((err) => {
        console.error("Error fetching newspaper:", err);
      });
  }
  
  // Filter articles based on search query
  const articles=newspaper.filter((a)=>a.title.toLowerCase().includes(query.toLowerCase()) );

  //load articles on component mount
  useEffect(() => {
    fetchArticles();
  }, []);

  //-----------------------UI--------------------------//
  return (
    <DashboardLayout
      navItems={studentNavItems}
      title="Newspaper"
    >
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">
              College Newspaper
            </h1>
            <p className="text-muted-foreground">
              Read latest published articles
            </p>
          </div>

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

        <p className="text-sm text-muted-foreground">
          {articles.length} articles available
        </p>

        {/* Articles Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((article) => (
            <Card
              key={article.id}
              className="border-border/50 overflow-hidden"
            >
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
                  By {article.journalistName} • {article.createdAt.split("T")[0]}
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
        onOpenChange={(open) =>
          !open && setViewArticle(null)
        }
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {viewArticle?.title}
            </DialogTitle>
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