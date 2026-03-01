import { useState ,useMemo} from "react";
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

const AdminNewspaperPage = () => {
  // Temporary Data
  const tempArticles = [
    {
      id: "1",
      title: "Tech Fest 2026 Highlights",
      content: `
# Tech Fest 2026 🚀

## Highlights
- Coding Competition
- Robotics Workshop
- AI Seminar

**Winner:** CSE Department

> It was one of the biggest technical events of the year.
      `,
      image:
        "https://images.unsplash.com/photo-1505373877841-8d25f7d46678",
      publisher: "Ronak Gondaliya",
      date: "01 March 2026",
    },
    {
      id: "2",
      title: "Football Team Wins Championship",
      content: `
## 🏆 Championship Victory

Our college football team secured victory after an intense final match.

### Final Score
**3 - 2**

Amazing performance by all players!
      `,
      image:
        "https://images.unsplash.com/photo-1517649763962-0c623066013b",
      publisher: "Sports Committee",
      date: "28 February 2026",
    },
  ];

  const [publishedArticles, setPublishedArticles] =
    useState(tempArticles);
  const [viewArticle, setViewArticle] = useState(null);

  const handleUnpublish = (articleId) => {
    setPublishedArticles(
      publishedArticles.filter((a) => a.id !== articleId)
    );
    toast({
      title: "Article Unpublished",
      description: "The article has been removed from the newspaper.",
    });
  };

  //  Compile Markdown When Article Changes
  const renderedContent = useMemo(() => {
    if (!viewArticle?.content) return "";
    return marked.parse(viewArticle.content.trim());
  }, [viewArticle?.content]);

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
            />
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          {publishedArticles.length} published articles
        </p>

        {/* Articles Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {publishedArticles.map((article) => (
            <Card
              key={article.id}
              className="border-border/50 overflow-hidden"
            >
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-40 object-cover"
              />

              <CardContent className="p-4">
                <h4 className="font-semibold line-clamp-2 mb-2">
                  {article.title}
                </h4>

                <p className="text-sm text-muted-foreground mb-3">
                  By {article.publisher} • {article.date}
                </p>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setViewArticle(article)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive"
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
              By {viewArticle?.publisher} •{" "}
              {viewArticle?.date}
            </DialogDescription>
          </DialogHeader>

          {viewArticle && (
            <div className="space-y-4">
              <img
                src={viewArticle.image}
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