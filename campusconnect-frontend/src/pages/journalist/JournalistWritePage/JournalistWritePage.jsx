import "./JournalistWritePage.css";
import { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import { Card, CardContent } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Textarea } from "../../../components/ui/Textarea";
import { Label } from "../../../components/ui/Label";
import { Badge } from "../../../components/ui/Badge";
import { journalistNavItems } from "../../../config/Navigation";
import { useAuth } from "../../../contexts/AuthContext";
import { journalistApi } from "../../../services/api";
import { toast } from "../../../hooks/use-toast";
import { marked } from "marked";
import {
  PenSquare,
  Eye,
  Save,
  Send,
  RotateCcw,
  UploadCloud,
  FileUp,
  Image as ImageIcon,
  X,
  FileDown,
  Sparkles,
  HelpCircle,
  Loader2,
  ArrowLeft,
  Check,
} from "lucide-react";

export default function JournalistWritePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { routeProtection } = useAuth();

  // Route protection
  useEffect(() => {
    if (!routeProtection("JOURNALIST")) {
      navigate("/auth");
    }
  }, [navigate, routeProtection]);

  // Editor State
  const [editingDraftId, setEditingDraftId] = useState(null);
  const [writeTitle, setWriteTitle] = useState("");
  const [writeAbstract, setWriteAbstract] = useState("");
  const [writeContent, setWriteContent] = useState("");
  const [writeImages, setWriteImages] = useState([]); // [{ file, previewUrl }]
  const [writePdf, setWritePdf] = useState(null); // File
  const [pdfError, setPdfError] = useState("");
  const [studioTab, setStudioTab] = useState("edit"); // "edit" | "preview"
  const [submittingArticle, setSubmittingArticle] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);

  // Preload draft if passed in location.state
  useEffect(() => {
    if (location.state?.editDraft) {
      const draft = location.state.editDraft;
      setEditingDraftId(draft.id);
      setWriteTitle(draft.title || "");
      setWriteAbstract(draft.abstractText || "");
      setWriteContent(draft.content || "");
      setWriteImages([]);
      setWritePdf(null);
      setPdfError("");
      setStudioTab("edit");
    }
  }, [location.state]);

  const clearStudio = () => {
    setEditingDraftId(null);
    setWriteTitle("");
    setWriteAbstract("");
    setWriteContent("");
    setWriteImages([]);
    setWritePdf(null);
    setPdfError("");
    setStudioTab("edit");
  };

  // Multi-image selection (up to 5 images)
  const handleImageFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remainingSlots = 5 - writeImages.length;
    if (remainingSlots <= 0) {
      toast({
        title: "Image Limit Reached",
        description: "You can attach up to 5 images per article.",
        variant: "destructive",
      });
      return;
    }

    const selectedFiles = files.slice(0, remainingSlots);
    const newItems = selectedFiles.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setWriteImages((prev) => [...prev, ...newItems]);
    e.target.value = "";
  };

  const removeImage = (index) => {
    setWriteImages((prev) => {
      const removed = prev[index];
      if (removed && removed.previewUrl) {
        URL.revokeObjectURL(removed.previewUrl);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  // PDF file upload validation (max 10MB)
  const handlePdfChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setPdfError("Only PDF documents are supported.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setPdfError("PDF file size must not exceed 10MB.");
      return;
    }

    setPdfError("");
    setWritePdf(file);
  };

  const removePdf = () => {
    setWritePdf(null);
    setPdfError("");
  };

  // Build FormData for publish or draft
  const buildArticleFormData = () => {
    const formData = new FormData();
    const newspaperDto = {
      title: writeTitle.trim(),
      abstractText: writeAbstract.trim(),
      content: writeContent.trim(),
    };

    formData.append(
      "newspaper",
      new Blob([JSON.stringify(newspaperDto)], { type: "application/json" })
    );

    if (writeImages.length > 0) {
      formData.append("image", writeImages[0].file);
      writeImages.forEach((item) => {
        formData.append("images", item.file);
      });
    }

    if (writePdf) {
      formData.append("pdf", writePdf);
    }

    return formData;
  };

  // Save Draft Handler
  const handleSaveDraft = async () => {
    if (!writeTitle.trim()) {
      toast({
        title: "Title Required",
        description: "Please provide at least a working headline for your draft.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSavingDraft(true);
      const formData = buildArticleFormData();

      if (editingDraftId) {
        await journalistApi.updateDraft(editingDraftId, formData);
        toast({
          title: "Draft Updated",
          description: "Your changes have been saved to the draft.",
          variant: "success",
        });
      } else {
        await journalistApi.saveDraft(formData);
        toast({
          title: "Draft Saved",
          description: "Your story has been saved to drafts.",
          variant: "success",
        });
      }

      navigate("/campus-connect/journalist/articles");
    } catch (err) {
      toast({
        title: "Draft Save Failed",
        description: err.message || "Failed to save draft",
        variant: "destructive",
      });
    } finally {
      setSavingDraft(false);
    }
  };

  // Publish Article Handler
  const handlePublishArticle = async () => {
    if (!writeTitle.trim()) {
      toast({
        title: "Title Required",
        description: "Please give your news article a headline.",
        variant: "destructive",
      });
      return;
    }
    if (!writeContent.trim()) {
      toast({
        title: "Content Required",
        description: "Please enter the article body text or markdown.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmittingArticle(true);
      const formData = buildArticleFormData();

      if (editingDraftId) {
        await journalistApi.updateDraft(editingDraftId, formData);
        await journalistApi.publishDraft(editingDraftId);
      } else {
        await journalistApi.publishNewsPaper(formData);
      }

      toast({
        title: "Article Published!",
        description: "Your story is now live in the campus newspaper!",
        variant: "success",
      });

      clearStudio();
      navigate("/campus-connect/journalist/articles");
    } catch (err) {
      toast({
        title: "Publication Failed",
        description: err.message || "Failed to publish article",
        variant: "destructive",
      });
    } finally {
      setSubmittingArticle(false);
    }
  };

  // Render markdown preview
  const renderedStudioPreview = useMemo(() => {
    if (!writeContent) {
      return "<p class='text-muted-foreground italic'>Nothing to preview yet. Switch to the editor and start writing your article!</p>";
    }
    try {
      return marked.parse(writeContent);
    } catch {
      return writeContent;
    }
  }, [writeContent]);

  return (
    <DashboardLayout navItems={journalistNavItems} title="Write Article">
      <div className="space-y-5 sm:space-y-6 w-full max-w-5xl mx-auto pb-12">
        
        {/* ========================================================= */}
        {/* HEADER BANNER                                             */}
        {/* ========================================================= */}
        <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-card via-card/90 to-primary/5 p-4 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant="outline"
                  className="text-[10px] sm:text-[11px] font-semibold border-primary/20 bg-primary/10 text-primary uppercase tracking-wider"
                >
                  Newsroom Studio
                </Badge>
                {editingDraftId && (
                  <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-semibold">
                    Editing Saved Draft #{editingDraftId}
                  </Badge>
                )}
              </div>
              <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-foreground">
                {editingDraftId ? "Continue Story Draft" : "Write & Publish Campus Story"}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed">
                Compose articles using Markdown, attach photojournalism visuals, and distribute verified news to campus readers.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-9 px-3 gap-1.5 border-border/80"
                onClick={() => navigate("/campus-connect/journalist/articles")}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>My Articles</span>
              </Button>
              {editingDraftId && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-9 px-2.5 text-muted-foreground hover:text-foreground gap-1"
                  onClick={clearStudio}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>New Story</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* MAIN COMPOSITION WORKBENCH                                */}
        {/* ========================================================= */}
        <div className="space-y-5">
          {/* Headline & Abstract Card */}
          <Card className="border-border/70 bg-card/80 backdrop-blur-xs rounded-xl sm:rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="article-title" className="text-xs font-bold text-foreground">
                Headline Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="article-title"
                type="text"
                placeholder="e.g. Annual University Hackathon Unveils New Innovation Grants"
                value={writeTitle}
                onChange={(e) => setWriteTitle(e.target.value)}
                className="text-sm sm:text-base font-semibold h-11 bg-background/80 border-border/70 rounded-xl"
                maxLength={200}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="article-abstract" className="text-xs font-bold text-foreground">
                Lead Abstract / Summary
              </Label>
              <Textarea
                id="article-abstract"
                placeholder="Provide a concise 1-2 sentence overview of the news story..."
                value={writeAbstract}
                onChange={(e) => setWriteAbstract(e.target.value)}
                rows={2}
                className="text-xs sm:text-sm bg-background/80 border-border/70 rounded-xl resize-y"
                maxLength={500}
              />
            </div>
          </Card>

          {/* Body Content Editor & Preview Tabs */}
          <Card className="border-border/70 bg-card/80 backdrop-blur-xs rounded-xl sm:rounded-2xl overflow-hidden">
            {/* Editor Top Bar */}
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-border/60 bg-muted/30 flex-wrap gap-2">
              <div className="inline-flex p-1 bg-muted/60 rounded-xl border border-border/60">
                <button
                  type="button"
                  onClick={() => setStudioTab("edit")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    studioTab === "edit"
                      ? "bg-card text-foreground shadow-xs border border-border/60"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <PenSquare className="w-3.5 h-3.5" />
                  <span>Editor</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStudioTab("preview")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    studioTab === "preview"
                      ? "bg-card text-foreground shadow-xs border border-border/60"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Live Preview</span>
                </button>
              </div>

              {/* Formatting Quick Pills */}
              <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="bg-muted px-2 py-0.5 rounded font-mono">**bold**</span>
                <span className="bg-muted px-2 py-0.5 rounded font-mono">*italic*</span>
                <span className="bg-muted px-2 py-0.5 rounded font-mono">## Heading</span>
                <span className="bg-muted px-2 py-0.5 rounded font-mono">&gt; Quote</span>
                <span className="bg-muted px-2 py-0.5 rounded font-mono">[Link](url)</span>
              </div>
            </div>

            {/* Editor Body or Preview */}
            <CardContent className="p-4 sm:p-5">
              {studioTab === "edit" ? (
                <div className="space-y-2">
                  <Textarea
                    placeholder="Write your news article in Markdown format here...&#10;&#10;## Key Highlights&#10;- Detail event facts&#10;- Cite campus interviews&#10;- Discuss future outlook"
                    value={writeContent}
                    onChange={(e) => setWriteContent(e.target.value)}
                    rows={14}
                    className="font-mono text-xs sm:text-sm bg-background/80 border-border/70 rounded-xl leading-relaxed resize-y w-full p-3.5"
                    required
                  />
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                    <span>Supports Markdown formatting</span>
                    <span>{writeContent.length} characters</span>
                  </div>
                </div>
              ) : (
                <div className="min-h-[320px] p-4 rounded-xl border border-border/60 bg-background/60">
                  <div
                    className="prose dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: renderedStudioPreview }}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Media Attachments Section */}
          <Card className="border-border/70 bg-card/80 backdrop-blur-xs rounded-xl sm:rounded-2xl p-4 sm:p-5 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-primary" />
                <span>Media & Attachments</span>
              </h3>
              <p className="text-xs text-muted-foreground">
                Attach up to 5 photos (first image acts as primary cover) and an optional print edition PDF.
              </p>
            </div>

            {/* Images Grid & Uploader */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                {writeImages.map((imgItem, idx) => (
                  <div
                    key={idx}
                    className="relative w-24 h-20 sm:w-28 sm:h-24 rounded-xl overflow-hidden border border-border/80 bg-muted shrink-0 group"
                  >
                    <img
                      src={imgItem.previewUrl}
                      alt={`Upload ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {idx === 0 && (
                      <span className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                        Cover
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-background/80 text-foreground flex items-center justify-center shadow-xs hover:bg-destructive hover:text-destructive-foreground transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {writeImages.length < 5 && (
                  <label className="w-24 h-20 sm:w-28 sm:h-24 rounded-xl border-2 border-dashed border-border/80 hover:border-primary/50 hover:bg-primary/5 flex flex-col items-center justify-center cursor-pointer transition-colors shrink-0">
                    <FileUp className="w-5 h-5 text-muted-foreground mb-1" />
                    <span className="text-[10px] font-semibold text-muted-foreground">
                      Add Photo
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageFilesChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">
                {writeImages.length} of 5 images attached.
              </p>
            </div>

            {/* PDF Attachment Upload */}
            <div className="pt-3 border-t border-border/50">
              <Label className="text-xs font-bold text-foreground block mb-1.5">
                Print Edition PDF (Optional)
              </Label>

              {writePdf ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/80 shadow-xs max-w-md">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileDown className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-xs font-semibold text-foreground truncate">
                      {writePdf.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      ({(writePdf.size / (1024 * 1024)).toFixed(1)} MB)
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                    onClick={removePdf}
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ) : (
                <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-dashed border-border/80 hover:border-primary/50 hover:bg-primary/5 cursor-pointer text-xs text-muted-foreground font-medium transition-colors">
                  <FileUp className="w-4 h-4 text-primary" />
                  <span>Upload Gazette PDF (Max 10MB)</span>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handlePdfChange}
                    className="hidden"
                  />
                </label>
              )}

              {pdfError && (
                <p className="text-xs text-destructive font-medium mt-1.5">{pdfError}</p>
              )}
            </div>
          </Card>

          {/* Sticky Action Footer Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl sm:rounded-2xl bg-card/90 backdrop-blur-md border border-border/80 shadow-md">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearStudio}
              disabled={submittingArticle || savingDraft}
              className="text-xs h-9 px-3 gap-1.5 border-border/80 w-full sm:w-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Form</span>
            </Button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSaveDraft}
                disabled={savingDraft || submittingArticle}
                className="text-xs h-9 px-3.5 font-semibold gap-1.5 border-border/80 flex-1 sm:flex-none"
              >
                {savingDraft ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5 text-primary" />
                    <span>{editingDraftId ? "Update Draft" : "Save as Draft"}</span>
                  </>
                )}
              </Button>

              <Button
                type="button"
                size="sm"
                onClick={handlePublishArticle}
                disabled={submittingArticle || savingDraft}
                className="text-xs h-9 px-4 font-bold gap-1.5 shadow-xs flex-1 sm:flex-none"
              >
                {submittingArticle ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Publish to Campus</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
