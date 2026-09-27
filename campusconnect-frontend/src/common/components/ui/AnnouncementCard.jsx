import React from "react";
import { Card, CardContent } from "./Card";
import { Button } from "./Button";
import { Badge } from "./Badge";
import { Eye } from "lucide-react";


const AnnouncementCard = ({ announcement, onView }) => (
  <Card className="mb-3 pt-4">
    <CardContent className="p-4 flex justify-between items-start gap-4">
      {/* Left side: Text */}
      <div>
        <div className="flex gap-2 mb-1">
          <Badge variant="outline">{announcement.clubName}</Badge>
        </div>
        <h4 className="font-medium">{announcement.title}</h4>

        <p className="text-sm text-muted-foreground line-clamp-2">
          {announcement.content.substring(0, 35) +
            (announcement.content.length > 35 ? "..." : "")}
        </p>
      </div>

      {/* Right side: Eye button and date */}
      <div className="flex flex-col items-end gap-2">
        <Button variant="ghost" size="icon" onClick={onView}>
          <Eye className="w-4 h-4" />
        </Button>
        <span className="text-xs text-muted-foreground">
          {announcement.createdAt.split("T")[0]} at{" "}
          {announcement.createdAt.split("T")[1].split(".")[0]}
        </span>
      </div>
    </CardContent>
  </Card>
);

export default AnnouncementCard;