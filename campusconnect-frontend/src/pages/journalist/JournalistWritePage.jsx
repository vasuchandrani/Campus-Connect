import { useState, useEffect } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { Label } from "../../components/ui/Label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/Tabs";
import { Save, Send } from "lucide-react";
import { journalistNavItems } from "../../config/Navigation";
import { useLocation } from "react-router-dom";
import { marked } from "marked";
import { toast } from "../../hooks/use-toast"; 
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

// ------------------------------Navigation Items------------------------------//
const navItems = journalistNavItems;

const JournalistWritePage = () => {
  const location = useLocation();
  const editArticle = location.state?.article;

  const navigate = useNavigate();

  const baseUrl = "https://campus-connect-nzc9.onrender.com/campus-connect/journalist";

  // Form states
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [activeTab, setActiveTab] = useState("write");
  const renderedPreview = marked.parse(content || "");
  const [requesting, setRequesting] = useState(false);

        const { routeProtection } = useAuth();
    
      useEffect(() => {
        if (!routeProtection("JOURNALIST")) {
          navigate("/auth");
        }
      },[]);

  /* Load Draft Data */
  useEffect(() => {
    if (editArticle) {
      setTitle(editArticle.title || "");
      setContent(editArticle.content || "");
      setPreview(editArticle.imageUrl || null);
    }
  }, [editArticle]);

  // Image select handler
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);

    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const clearForm = () => {
    setTitle("");
    setContent("");
    setImage(null);
    setPreview(null);
  };

  // ---------------- SAVE DRAFT ----------------
  const handleSaveDraft = async () => {
    const payload = {
      title,
      content,
    };

    const formData = new FormData();

    formData.append(
      "newspaper",
      new Blob([JSON.stringify(payload)], { type: "application/json" }),
    );

    if (image) {
      formData.append("image", image);
    } else {
      formData.append("image", null);
    }

    try {
      setRequesting(true);
      const response = await fetch(
        editArticle
          ? `${baseUrl}/write/drafts/${editArticle.id}`
          : `${baseUrl}/write/draft`,
        {
          method: editArticle ? "PATCH" : "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: formData,
        },
      );

      const data=await response.json();
      if ((editArticle && data.message==="Draft Modified Successfully")||(!editArticle && data.message==="Draft saved Successfully")) {
        toast({
          title: "Success",
          description: data.message,
          variant: "success",
        });
        clearForm();
      } else {
       throw new Error(data.message || "Failed to save draft");
      }
    } catch(err) {
      toast({
        title: "Error",
        description: err.message||"Failed to save draft. Please try again.",
        variant: "destructive",
      });
    }
    setRequesting(false);
  };
  // ---------------- SUBMIT ARTICLE ----------------
  const handleSubmit = async () => {
    const payload = {
      title,
      content,
    };

    const formData = new FormData();

    formData.append(
      "newspaper",
      new Blob([JSON.stringify(payload)], { type: "application/json" }),
    );

    if (image) {
      formData.append("image", image);
    } else {
      formData.append("image", null);
    }

    try {
      setRequesting(true);
      const response = await fetch(
        editArticle
          ? `${baseUrl}/write/drafts/${editArticle.id}`
          : `${baseUrl}/write/publish`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: formData,
        },
      );

      const data=await response.json();
      if ((editArticle && data.message==="Draft Published Successfully")||(!editArticle && data.message==="News-Paper Published!")) {
        toast({
          title: "Success",
          description: data.message,
          variant: "success",
        });
        clearForm();
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "Failed to submit article. Please try again.",
        variant: "destructive",
      });
    }
    setRequesting(false);
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
            <Button variant="outline" onClick={handleSaveDraft} disabled={requesting}>
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>

            <Button onClick={handleSubmit} disabled={requesting}>
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

            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Upload Image</Label>

              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />

              {preview && (
                <img
                  src={preview}
                  alt="Preview"
                  className="mt-4 rounded-lg max-h-60"
                />
              )}
            </div>

            {/* Markdown Editor */}
            <div>
              <Label>Content (.md)</Label>

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="write">Write</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>

                <TabsContent value="write" className="h-[55vh]">
                  <Textarea
                    className="w-full h-full font-mono"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                </TabsContent>

                <TabsContent
                  value="preview"
                  className="h-[55vh] overflow-y-auto"
                >
                  <div className="h-full w-full p-4 border rounded-md bg-muted/30">
                    {preview && (
                      <img
                        src={preview}
                        alt="Preview"
                        className="mb-4 rounded-lg"
                      />
                    )}

                    <div
  className="prose max-w-none"
  dangerouslySetInnerHTML={{ __html: renderedPreview }}
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
