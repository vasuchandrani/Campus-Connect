import { useState ,useMemo,useEffect} from "react";
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
import { collegeAdminNavItems } from "../../config/Navigation";
import { toast } from "../../hooks/use-toast";
import { marked } from "marked";
import { set } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const AdminNewspaperPage = () => {
  // State variables
  const [publishedArticles, setPublishedArticles] =useState([]);
  const [viewArticle, setViewArticle] = useState(null);
  const [query, setQuery] = useState("");
  const [requesting, setRequesting] = useState(false); 
  const navigate = useNavigate();

  // Base URL for API calls related to college admin
  const baseUrl = "http://localhost:8080/campus-connect/college-admin";

    const { routeProtection } = useAuth();
  
    useEffect(() => {
      if (!routeProtection("COLLEGE_ADMIN")) {
        navigate("/auth");
      }
    },[]);

  // Fetch published articles
  const fetchPublishedArticles = async () => {
    await fetch(baseUrl+"/news-papers", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setPublishedArticles(data);
      })
      .catch((err) => {
        console.error("Error fetching published articles:", err);
      });
  };

  //load published articles on component mount
  useEffect(() => {
    fetchPublishedArticles();
  }, []); 

  // Handle Unpublish Article
  const handleUnpublish = async (articleId) => {
    setRequesting(true);
    await fetch(`${baseUrl}/news-papers/${articleId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
      },
    })
      .then(async (res) => {
        const data=await res.json();
        if (data.message==="News Paper Unpublished!") {
          toast({
            title: "Success",
            description: data.message,
            veriant: "success",
          });
          // Refresh the list of published articles
          fetchPublishedArticles();
        } else {
          throw new Error(data.message || "Failed to unpublish article");
        }
      })
      .catch((err) => {
        toast({
          title: "Error",
          description: err.message || "Failed to unpublish article",
          variant: "destructive",
        });
      }).finally(() => setRequesting(false));
  };

  //  Compile Markdown When Article Changes
  const renderedContent = useMemo(() => {
    if (!viewArticle?.content) return "";
    return marked.parse(viewArticle.content.trim());
  }, [viewArticle?.content]);

  //for search functionality
  const filteredArticles = publishedArticles.filter((a) =>
    a.title.toLowerCase().includes(query.toLowerCase())
  );


  //-------------UI------------------//
  return (
    <DashboardLayout
      navItems={collegeAdminNavItems}
      title="Manage Newspaper"
    >
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">
              Newspaper Management
            </h1>
            <p className="text-muted-foreground">
              Review published articles and unpublish if needed
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
          {publishedArticles.length} published articles
        </p>

        {/* Articles Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredArticles.map((article) => (
            <Card
              key={article.id}
              className="border-border/50 overflow-hidden"
            >
              <img
                src={article.imageUrl}
                alt={article.title}
                className="w-full h-40 object-cover"
              />

              <CardContent className="p-4">
                <h4 className="font-semibold line-clamp-2 mb-2">
                  {article.title}
                </h4>

                <p className="text-sm text-muted-foreground mb-3">
                  By {article.journalistName} • {article.createdAt.split("T")[0]}
                </p>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    disabled={requesting}
                    onClick={() => setViewArticle(article)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive"
                    disabled={requesting}
                    onClick={() =>
                      handleUnpublish(article.id)
                    }
                  >
                    Unpublish
                  </Button>
                </div>
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

              {/*  Markdown Compiled Here */}
              <div
                className="prose max-w-none"
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

export default AdminNewspaperPage;