import { useState } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { Label } from "../../components/ui/Label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/Tabs";
import {
  LayoutDashboard,
  PenSquare,
  FileText,
  BarChart3,
  Settings,
  Save,
  Send,
  Image,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { journalistNavItems } from "../../config/Navigation";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const navItems = journalistNavItems;

const tempArticles = [];

const JournalistWritePage = () => {
  const location = useLocation();
  const editArticle = location.state?.article;

  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [content, setContent] = useState("");
  const [activeTab, setActiveTab] = useState("write");

  /* Load Draft Data */
  useEffect(() => {
    if (editArticle) {
      setTitle(editArticle.title || "");
      setImageUrl(editArticle.imageUrl || "");
      setContent(editArticle.content || "");
    }
  }, [editArticle]);

  const handleSaveDraft = () => {
    const draft = {
      id: editArticle?.id || Date.now(),
      title,
      imageUrl,
      content,
      status: "draft",
    };

    tempArticles.push(draft);
    alert("Draft saved!");
  };

  const handleSubmit = () => {
    const article = {
      id: editArticle?.id || Date.now(),
      title,
      imageUrl,
      content,
      status: "submitted",
    };

    tempArticles.push(article);
    alert("Article submitted!");
  };

  const wordCount = content.split(" ").filter(Boolean).length;

  return (
    <DashboardLayout navItems={navItems} title="Write Article">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">
            {editArticle ? "Edit Draft" : "Write Article"}
          </h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSaveDraft}>
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
            <Button onClick={handleSubmit}>
              <Send className="w-4 h-4 mr-2" />
              Submit
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-6 space-y-6">
            
            {/* Title */}
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter article title..."
              />
            </div>

            {/* Image URL */}
            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {/* Markdown Editor */}
            <div>
              <Label>Content (.md)</Label>

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="write">Write</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>

                <TabsContent value="write"className="h-[55vh]">
                  <Textarea
                    className="w-full h-full font-mono"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                </TabsContent>

                <TabsContent value="preview" className="h-[55vh] overflow-y-auto">
                  <div className="h-full w-full p-4 border rounded-md bg-muted/30">
                    {imageUrl && (
                      <img
                        src={imageUrl}
                        alt="Preview"
                        className="mb-4 rounded-lg"
                      />
                    )}
                    <div 
                      dangerouslySetInnerHTML={{
                        __html: content
                          .replace(/^### (.*$)/gim, "<h3>$1</h3>")
                          .replace(/^## (.*$)/gim, "<h2>$1</h2>")
                          .replace(/^# (.*$)/gim, "<h1>$1</h1>")
                          .replace(/\*\*(.*)\*\*/gim, "<strong>$1</strong>")
                          .replace(/\*(.*)\*/gim, "<em>$1</em>")
                          .replace(/\n/gim, "<br />"),
                      }}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div className="text-sm text-muted-foreground">
              {wordCount} words
            </div>

          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default JournalistWritePage;