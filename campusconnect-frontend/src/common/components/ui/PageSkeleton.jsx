import React from "react";

/**
 * Unified Page-Level Skeleton Loader.
 * Replaces fragmented component-wise spinners with a clean, cohesive loading screen.
 *
 * @param {Object} props
 * @param {"cards" | "list" | "detail" | "dashboard"} [props.variant="cards"]
 * @param {number} [props.count=6] - Number of card/list items to show
 * @param {string} [props.title] - Optional title placeholder
 */
const PageSkeleton = ({ variant = "cards", count = 6, title = true }) => {
  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-5 sm:space-y-6 animate-pulse">
      {/* Page Header Skeleton */}
      {title && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 w-full">
          <div className="space-y-2 w-full sm:w-auto">
            <div className="h-7 sm:h-8 w-44 sm:w-64 bg-muted rounded-lg" />
            <div className="h-3.5 sm:h-4 w-28 sm:w-44 bg-muted/60 rounded-md" />
          </div>
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <div className="h-8 sm:h-9 w-24 sm:w-28 bg-muted rounded-lg flex-1 sm:flex-none" />
            <div className="h-8 sm:h-9 w-32 sm:w-44 bg-muted rounded-lg flex-1 sm:flex-none" />
          </div>
        </div>
      )}

      {/* Tabs / Filter Row Skeleton - flex wrap with zero horizontal overflow */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full">
        <div className="h-8 sm:h-9 w-20 sm:w-24 bg-muted rounded-lg" />
        <div className="h-8 sm:h-9 w-24 sm:w-28 bg-muted/70 rounded-lg" />
        <div className="h-8 sm:h-9 w-24 sm:w-28 bg-muted/50 rounded-lg" />
      </div>

      {/* Content Skeleton based on variant */}
      {variant === "cards" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5 w-full">
          {Array.from({ length: count }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-xs space-y-3 w-full"
            >
              {/* Media image box */}
              <div className="w-full h-36 sm:h-44 bg-muted" />

              <div className="p-3.5 sm:p-4 pt-1 space-y-3">
                {/* Badges / metadata */}
                <div className="flex items-center justify-between">
                  <div className="h-3.5 sm:h-4 w-20 bg-muted rounded-md" />
                  <div className="h-3.5 sm:h-4 w-16 bg-muted/60 rounded-md" />
                </div>

                {/* Title */}
                <div className="h-4 sm:h-5 w-4/5 bg-muted rounded-md" />

                {/* Description lines */}
                <div className="space-y-1.5">
                  <div className="h-3 w-full bg-muted/70 rounded-sm" />
                  <div className="h-3 w-2/3 bg-muted/50 rounded-sm" />
                </div>

                {/* Footer buttons / actions */}
                <div className="pt-2 flex items-center justify-between border-t border-border/40">
                  <div className="h-7 sm:h-8 w-16 sm:w-20 bg-muted/60 rounded-lg" />
                  <div className="h-7 sm:h-8 w-20 sm:w-24 bg-muted rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {variant === "list" && (
        <div className="space-y-3 sm:space-y-4 w-full">
          {Array.from({ length: count }).map((_, index) => (
            <div
              key={index}
              className="p-3.5 sm:p-5 rounded-2xl border border-border/50 bg-card shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 w-full"
            >
              <div className="space-y-2 flex-1 min-w-0 w-full">
                <div className="flex items-center gap-2">
                  <div className="h-3.5 sm:h-4 w-20 sm:w-24 bg-muted rounded-md" />
                  <div className="h-3.5 sm:h-4 w-14 sm:w-16 bg-muted/50 rounded-md" />
                </div>
                <div className="h-4 sm:h-5 w-3/4 bg-muted rounded-md" />
                <div className="h-3 sm:h-3.5 w-full max-w-xl bg-muted/60 rounded-sm" />
              </div>
              <div className="h-8 sm:h-9 w-24 sm:w-28 bg-muted rounded-lg shrink-0 self-start sm:self-center" />
            </div>
          ))}
        </div>
      )}

      {variant === "detail" && (
        <div className="space-y-5 sm:space-y-6 max-w-4xl mx-auto w-full">
          <div className="w-full h-48 sm:h-64 bg-muted rounded-2xl" />
          <div className="space-y-3">
            <div className="h-7 sm:h-8 w-3/4 bg-muted rounded-md" />
            <div className="flex flex-wrap gap-2 sm:gap-4">
              <div className="h-4 w-28 bg-muted/70 rounded-md" />
              <div className="h-4 w-36 bg-muted/50 rounded-md" />
            </div>
          </div>
          <div className="space-y-2 pt-2 sm:pt-4">
            <div className="h-3.5 sm:h-4 w-full bg-muted/70 rounded-sm" />
            <div className="h-3.5 sm:h-4 w-full bg-muted/70 rounded-sm" />
            <div className="h-3.5 sm:h-4 w-4/5 bg-muted/60 rounded-sm" />
            <div className="h-3.5 sm:h-4 w-3/5 bg-muted/50 rounded-sm" />
          </div>
        </div>
      )}

      {variant === "dashboard" && (
        <div className="space-y-5 sm:space-y-6 w-full">
          {/* Stat Cards - 2x2 on mobile, 4 on desktop */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 w-full">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="p-3 sm:p-4.5 rounded-xl sm:rounded-2xl border border-border/50 bg-card/80 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-muted" />
                  <div className="w-3.5 h-3.5 rounded bg-muted/60" />
                </div>
                <div className="space-y-1.5 pt-1">
                  <div className="h-6 sm:h-7 w-16 bg-muted rounded-md" />
                  <div className="h-3.5 w-24 bg-muted/70 rounded" />
                </div>
              </div>
            ))}
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 w-full">
            <div className="space-y-3.5">
              <div className="h-5 w-36 bg-muted rounded-md" />
              <div className="h-44 bg-card border border-border/50 rounded-2xl" />
            </div>
            <div className="space-y-3.5">
              <div className="h-5 w-32 bg-muted rounded-md" />
              <div className="h-44 bg-card border border-border/50 rounded-2xl" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PageSkeleton;
