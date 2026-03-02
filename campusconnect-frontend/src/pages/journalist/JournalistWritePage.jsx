import { useState } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { Label } from "../../components/ui/Label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/Tabs";
import {
  Save,
  Send,

} from "lucide-react";
import { journalistNavItems } from "../../config/Navigation";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

// ------------------------------Navigation Items------------------------------//
const navItems = journalistNavItems;


const JournalistWritePage = () => {
  // Check if we're editing an existing draft (passed via location state)
  const location = useLocation();
  const editArticle = location.state?.article;

  // Base URL for API calls related to journalist
  const baseUrl = "http://localhost:8080/campus-connect/journalist";

  // Form state variables
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

  // Handlers for saving draft  article
  const clearForm = () => {
    setTitle("");
    setImageUrl("");
    setContent("");
  };
  const handleSaveDraft = async () => {
    const article = {
      title,
      imageUrl,
      content,
    };
    if(editArticle){
      fetch(`${baseUrl}/newspaper/draft/${editArticle.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(article),
      })
      .then(res=>{
        if(res.ok){
          alert("Draft updated successfully!");
          clearForm();
        }
        else{
          throw new Error("Failed to update draft.");
        }
      })
      .catch(err => {
        console.error("Error updating draft:", err);
        alert("Failed to update draft.");
      }); 
    }
    else{
      fetch(`${baseUrl}/newspaper/draft`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(article),
      })
      .then(res=>{
        if(res.ok){
          alert("Draft saved successfully!");
          clearForm();
        }
        else{
          throw new Error("Failed to save draft.");
        }
      })
      .catch(err => {
        console.error("Error saving draft:", err);
        alert("Failed to save draft.");
      });
    }

  };

  //save article and publish
  const handleSubmit = async () => {
    const article = {
      title,
      imageUrl,
      content,
    };
    if(editArticle){
      fetch(`${baseUrl}/newspaper/publish/draft/${editArticle.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(article),
      })
      .then(res=>{
        if(res.ok){
          alert("Article updated and published successfully!");
          clearForm();
        }
        else{
          throw new Error("Failed to update and publish article.");
        }
      })
      .catch(err => {
        console.error("Error updating and publishing article:", err);
        alert("Failed to update and publish article.");
      }); 
    }
    else{
    fetch(`${baseUrl}/newspaper/publish`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
      },
      body: JSON.stringify(article),
    })
    .then(res=>{
      if(res.ok){
        alert("Article published successfully!");
        clearForm();
      }
      else{
        throw new Error("Failed to publish article.");
      }
    })
    .catch(err => {
      console.error("Error publishing article:", err);
      alert("Failed to publish article.");
    });
  }
}
  // Word count for content
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