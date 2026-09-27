import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/Dialog";
import { Button } from "../../../components/ui/Button";
import { Calendar, User, FileDown, Heart, Globe } from "lucide-react";
import { marked } from "marked";

export default function ArticleReaderModal({
  open,
  onOpenChange,
  article,
  onToggleUpvote,
  collegeName = "",
}) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Parse markdown content safely
  const renderedContent = useMemo(() => {
    if (!article?.content) return "";
    try {
      return marked.parse(article.content);
    } catch {
      return article.content;
    }
  }, [article?.content]);

  // Aggregate images
  const images = useMemo(() => {
    if (!article) return [];
    if (Array.isArray(article.images) && article.images.length > 0) {
      return article.images;
    }
    if (article.imageUrl) {
      return [article.imageUrl];
    }
    return [];
  }, [article]);

  if (!article) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto w-full p-4 sm:p-6 rounded-2xl">
        <DialogHeader className="space-y-2 text-left">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
              Campus Gazette
            </span>
            {article.isGlobal && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-500 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                <Globe className="w-3 h-3" />
                Globalized
              </span>
            )}
            <span className="text-xs text-muted-foreground ml-auto flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {article.date
                ? new Date(article.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Recent"}
            </span>
          </div>

          <DialogTitle className="text-lg sm:text-2xl font-black text-foreground leading-tight tracking-tight">
            {article.title}
          </DialogTitle>

          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1 border-b border-border/50 pb-3">
            <div className="flex items-center gap-1 font-medium text-foreground">
              <User className="w-3.5 h-3.5 text-primary" />
              <span>{article.journalistName || "Staff Reporter"}</span>
            </div>
            {collegeName && <span>• {collegeName}</span>}
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Cover & Gallery Carousel */}
          {images.length > 0 && (
            <div className="space-y-2">
              <div className="relative aspect-video sm:aspect-21/9 w-full rounded-xl sm:rounded-2xl overflow-hidden bg-muted border border-border/60 shadow-xs">
                <img
                  src={images[activeImageIndex] || images[0]}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveImageIndex(i)}
                      className={`relative aspect-video w-16 sm:w-20 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                        activeImageIndex === i
                          ? "border-primary scale-95"
                          : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Abstract Highlight */}
          {article.abstractText && (
            <blockquote className="border-l-4 border-primary pl-4 py-2 text-xs sm:text-sm font-medium text-muted-foreground italic bg-primary/5 rounded-r-xl">
              {article.abstractText}
            </blockquote>
          )}

          {/* PDF Download Button if attached */}
          {article.pdfUrl && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/80 shadow-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <FileDown className="w-5 h-5 text-primary shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-foreground truncate">
                    PDF Print Edition Attached
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    Download the complete newspaper print release
                  </p>
                </div>
              </div>
              <Button size="sm" asChild className="rounded-xl text-xs h-8 px-3 gap-1.5 shrink-0 ml-2">
                <a href={article.pdfUrl} target="_blank" rel="noreferrer" download>
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>
              </Button>
            </div>
          )}

          {/* Article Body */}
          <div
            className="prose dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: renderedContent }}
          />

          {/* Upvote Footer inside Reader */}
          <div className="flex items-center justify-between pt-4 border-t border-border/60">
            <div className="text-xs text-muted-foreground">
              Published by <span className="font-semibold text-foreground">{article.journalistName || "Journalist"}</span>
            </div>

            {onToggleUpvote && (
              <button
                type="button"
                onClick={(e) => onToggleUpvote(e, article)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-bold text-xs transition-all ${
                  article.isUpvoted
                    ? "bg-rose-500/15 text-rose-500 border border-rose-500/30 shadow-xs"
                    : "bg-muted/70 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 border border-border/50"
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${article.isUpvoted ? "fill-rose-500" : ""}`} />
                <span>{article.upvotesCount || 0} Upvotes</span>
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
