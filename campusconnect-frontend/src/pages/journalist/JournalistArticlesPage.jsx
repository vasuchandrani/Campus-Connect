import { useState, useMemo, useEffect } from "react";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/Tabs";
import { journalistNavItems } from "../../config/Navigation";
import { useNavigate } from "react-router-dom";
import { marked } from "marked";
import { toast } from "../../hooks/use-toast";
import { useAuth } from "../../contexts/AuthContext";
import EmptyState from "../../components/ui/EmptyState";
import Loading from "../../components/ui/Loading";
import { FileText, MegaphoneOff } from "lucide-react";

// ------------------------------Navigation Items------------------------------//
const navItems = journalistNavItems;

const JournalistArticlesPage = () => {
  const navigate = useNavigate();
  // Base URL for API calls related to journalist
  const baseUrl = `${import.meta.env.VITE_BACKEND_URL}/campus-connect/journalist`;

  //stat variables
  const [viewArticle, setViewArticle] = useState(null);

  const [published, setPublished] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [requesting, setRequesting] = useState(false);
  const [loading, setLoading] = useState({
    published: true,
    drafts: true,
  });

  const { routeProtection } = useAuth();

  useEffect(() => {
    if (!routeProtection("JOURNALIST")) {
      navigate("/auth");
    }
  }, [navigate, routeProtection]);
  //fetch published
  const fetchPublishedArticles = async () => {
    setLoading((prev) => ({ ...prev, published: true }));

    try {
      const res = await fetch(`${baseUrl}/newspapers/published`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch published articles");

      const data = await res.json();
      setPublished(data);
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "Failed to fetch published articles",
        variant: "destructive",
      });
    }
    finally {
      setLoading((prev) => ({ ...prev, published: false }));
    }
  };

  //fetch drafts
  const fetchDraftArticles = async () => {
    setLoading((prev) => ({ ...prev, drafts: true }));
    try {
      const res = await fetch(`${baseUrl}/newspapers/drafts`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch draft articles");

      const data = await res.json();
      setDrafts(data);
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "Failed to fetch draft articles",
        variant: "destructive",
      });
    }
    finally {
      setLoading((prev) => ({ ...prev, drafts: false }));
    }
  };

  //load published and draft articles on component mount
  useEffect(() => {
    const fetchAllArticles = async () => {
      try {
        await Promise.all([fetchPublishedArticles(), fetchDraftArticles()]);
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to fetch articles",
          variant: "destructive",
        });
      }
    };

    fetchAllArticles();
  }, []);
  //  edit draft article
  const handleEdit = (article) => {
    navigate("/campus-connect/journalist/write", {
      state: { article },
    });
  };

  //  delete published article
  const handleUnpublish = async (id) => {
    setRequesting(true);
    await fetch(`${baseUrl}/newspapers/published/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    })
      .then(async (res) => {
        const data = await res.json();
        if (data.message === "News Paper Unpublished!") {
          fetchPublishedArticles();
          toast({
            title: "Success",
            description: data.message,
            variant: "success",
          });
        } else {
          throw new Error(data.message || "Failed to unpublish article");
        }
      })
      .catch((err) => {
        console.error("Error unpublishing draft article:", err);
        toast({
          title: "Error",
          description: err.message || "Failed to unpublish article",
          variant: "destructive",
        });
      })
      .finally(() => {
        setRequesting(false);
      });
  };

  //delete draft article
  const handleDelete = (id) => {
    setRequesting(true);
    fetch(`${baseUrl}/newspapers/drafts/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    })
      .then(async (res) => {
        const data = await res.json();
        if (data.message === "Draft Deleted Successfully") {
          fetchDraftArticles();
          toast({
            title: "Success",
            description: data.message,
            variant: "success",
          });
        } else {
          throw new Error(data.message);
        }
      })
      .catch((err) => {
        toast({
          title: "Error",
          description: err.message || "Failed to delete article",
          variant: "destructive",
        });
      })
      .finally(() => {
        setRequesting(false);
      });
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
            <TabsTrigger value="drafts">Drafts ({drafts.length})</TabsTrigger>
          </TabsList>

          {/* Published */}
          <TabsContent value="published" className="mt-6">
            {loading.published ? (
              <div className="text-center py-12">
                <Loading />
              </div>
            ) : published.length === 0 ? (
              <div className="text-center py-12">
                <EmptyState
                  icon={<MegaphoneOff className="w-8 h-8 text-muted-foreground" />}
                  title="No published articles"
                  desc="You haven't published any articles yet."
                />
              </div>
            ) : (
            published.map((article) => (
              <Card key={article.id} className="mb-4">
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold">{article.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {article.content.substring(0, 100)}...
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {article.createdAt.split("T")[0]}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={requesting}
                      onClick={() => setViewArticle(article)}
                    >
                      View
                    </Button>

                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={requesting}
                      onClick={() => handleUnpublish(article.id)}
                    >
                      Unpublish
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )))}
          </TabsContent>

          {/* Drafts */}
          <TabsContent value="drafts" className="mt-6">
            {loading.drafts ? (
              <div className="text-center py-12">
                <Loading />
              </div>
            ) : drafts.length === 0 ? (
              <div className="text-center py-12">
                <EmptyState
                  icon={<FileText className="w-8 h-8 text-muted-foreground" />}
                  title="No drafts"
                  desc="You don't have any draft articles."
                />
              </div>
            ) : (
              drafts.map((article) => (
                <Card key={article.id} className="mb-4">
                  <CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold">{article.title}</h4>
                      <p className="text-sm text-muted-foreground">
                      Last edited: {article.createdAt.split("T")[0]}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={requesting}
                      onClick={() => handleEdit(article)}
                    >
                      Continue Editing
                    </Button>

                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={requesting}
                      onClick={() => handleDelete(article.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )))}
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
              {viewArticle?.createdAt.substring(0, 10)}
            </DialogDescription>
          </DialogHeader>

          {viewArticle && (
            <div className="space-y-4">
              {/* Show Image If Exists */}
              {viewArticle.imageUrl && (
                <img
                  src={viewArticle.imageUrl}
                  alt={viewArticle.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
              )}

              {/* Markdown Content */}
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

export default JournalistArticlesPage;
