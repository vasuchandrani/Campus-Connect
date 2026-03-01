import { useState, useMemo } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../components/ui/Dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/Tabs";
import { journalistNavItems } from "../../config/Navigation";
import { useNavigate } from "react-router-dom";
import { marked } from "marked";

const navItems = journalistNavItems;

const initialArticles = [
  {
    id: "1",
    title: "Annual Tech Fest Highlights",
    date: "2024-01-20",
    status: "published",
    views: 1234,
    image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678",
    content: `
# Annual Tech Fest 2024 🚀

## Highlights
- Hackathon
- Robotics Competition
- Guest Lecture

**Winner:** IT Department

> A grand technical celebration.
    `,
  },
  {
    id: "2",
    title: "Sports Week Championship Results",
    date: "2024-01-18",
    status: "published",
    views: 890,
    image: "https://images.unsplash.com/photo-1517649763962-0c623066013b",
    content: `
## 🏆 Sports Week Championship

Final Score: **3 - 2**

Amazing teamwork and dedication from all players.
    `,
  },
  {
    id: "3",
    title: "Upcoming Science Fair Preview",
    date: "2024-01-16",
    status: "draft",
    content: `
# Science Fair 2024

Stay tuned for innovative student projects.
    `,
  },
];

const JournalistArticlesPage = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState(initialArticles);
  const [viewArticle, setViewArticle] = useState(null);

  const published = articles.filter((a) => a.status === "published");
  const drafts = articles.filter((a) => a.status === "draft");

  const handleEdit = (article) => {
    navigate("/campus-connect/journalist-write", {
      state: { article },
    });
  };

  // 🔥 Unpublish = Direct Delete
  const handleUnpublish = (id) => {
    setArticles(articles.filter((a) => a.id !== id));
  };

  const handleDelete = (id) => {
    setArticles(articles.filter((a) => a.id !== id));
  };

  // Compile markdown
  const renderedContent = useMemo(() => {
    if (!viewArticle?.content) return "";
    return marked.parse(viewArticle.content.trim());
  }, [viewArticle?.content]);

  return (
    <DashboardLayout navItems={navItems} title="My Articles">
      <div className="space-y-6">

        <h1 className="text-3xl font-bold">My Articles</h1>

        <Tabs defaultValue="published">
          <TabsList>
            <TabsTrigger value="published">
              Published ({published.length})
            </TabsTrigger>
            <TabsTrigger value="drafts">
              Drafts ({drafts.length})
            </TabsTrigger>
          </TabsList>

          {/* Published */}
          <TabsContent value="published" className="mt-6">
            {published.map((article) => (
              <Card key={article.id} className="mb-4">
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold">{article.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {article.date} · {article.views} views
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewArticle(article)}
                    >
                      View
                    </Button>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleUnpublish(article.id)}
                    >
                      Unpublish
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Drafts */}
          <TabsContent value="drafts" className="mt-6">
            {drafts.map((article) => (
              <Card key={article.id} className="mb-4">
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold">{article.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      Last edited: {article.date}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(article)}
                    >
                      Continue Editing
                    </Button>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(article.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>

      {/* View Dialog */}
      <Dialog
        open={!!viewArticle}
        onOpenChange={(open) => !open && setViewArticle(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewArticle?.title}</DialogTitle>
            <DialogDescription>
              {viewArticle?.date} · {viewArticle?.views || 0} views
            </DialogDescription>
          </DialogHeader>

          {viewArticle && (
            <div className="space-y-4">
              
              {/* Show Image If Exists */}
              {viewArticle.image && (
                <img
                  src={viewArticle.image}
                  alt={viewArticle.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
              )}

              {/* Markdown Content */}
              <div
                className="prose dark:prose-invert max-w-none"
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

export default JournalistArticlesPage;