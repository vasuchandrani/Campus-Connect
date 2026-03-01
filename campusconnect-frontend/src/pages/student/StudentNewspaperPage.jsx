import { useState, useMemo } from "react";
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
  // 🔹 Temporary Data
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

  const [articles] = useState(tempArticles);
  const [viewArticle, setViewArticle] = useState(null);

  // 🔥 Compile Markdown
  const renderedContent = useMemo(() => {
    if (!viewArticle?.content) return "";
    return marked.parse(viewArticle.content.trim());
  }, [viewArticle?.content]);

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