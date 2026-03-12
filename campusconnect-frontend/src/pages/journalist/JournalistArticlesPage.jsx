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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/Tabs";
import { journalistNavItems } from "../../config/Navigation";
import { useNavigate } from "react-router-dom";
import { marked } from "marked";
import { toast } from "sonner";

// ------------------------------Navigation Items------------------------------//
const navItems = journalistNavItems;

const JournalistArticlesPage = () => {

  const navigate = useNavigate();
  // Base URL for API calls related to journalist
  const baseUrl = "http://localhost:8080/campus-connect/journalist";

  //stat variables
  const [viewArticle, setViewArticle] = useState(null);

  const[published,setPublished] = useState([]);
  const[drafts,setDrafts] = useState([]);

  //fetch published
  const fetchPublishedArticles = async() => {
    await fetch(`${baseUrl}/newspapers/published`,{
      method:"GET",
      headers:{
        "Content-Type":"application/json",
        "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
      },
    })
    .then(res => res.json())
    .then(data => {
      setPublished(data);
    })
    .catch(err => {
      console.error("Error fetching published articles:", err);
    });
  };

  //fetch drafts
  const fetchDraftArticles = async() => {
    await fetch(`${baseUrl}/newspapers/drafts`,{
      method:"GET",
      headers:{
        "Content-Type":"application/json",
        "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
      },
    })
    .then(res => res.json())
    .then(data => {
      setDrafts(data);
    })
    .catch(err => {
      console.error("Error fetching draft articles:", err);
    });
  };


  //load published and draft articles on component mount
  useEffect(() => {
    fetchPublishedArticles();
    fetchDraftArticles();
  }, []);
  //  edit draft article
  const handleEdit = (article) => {
    navigate("/campus-connect/journalist/write", {
      state: { article },
    });
  };

  //  delete published article 
  const handleUnpublish = (id) => {
    fetch(`${baseUrl}/newspapers/published/${id}`,{
      method:"DELETE",
      headers:{
        "Content-Type":"application/json",
        "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
      },
    })
    .then(async (res) => {
      const data = await res.json();
      if (res.ok) {
        fetchPublishedArticles();
        toast({
          title: "Success",
          description: data.message,
          status: "success",
        });
      }
    })
    .catch(err => {
      console.error("Error unpublishing draft article:", err);
    });
  };

  //delete draft article
  const handleDelete = (id) => {
    fetch(`${baseUrl}/newspapers/drafts/${id}`,{
      method:"DELETE",
      headers:{
        "Content-Type":"application/json",
        "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
      },
    })
    .then(async (res) => {
      const data = await res.json();
      if (res.ok) {
        fetchDraftArticles();
        toast({
          title: "Success",
          description: data.message,
          status: "success",
        });
      }
    })
    .catch(err => {
      console.error("Error deleting published article:", err);
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
                    <p className="text-sm text-muted-foreground" >
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
                      Last edited: {article.createdAt.split("T")[0]} 
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