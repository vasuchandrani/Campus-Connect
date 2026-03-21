import React from "react";
import { Card, CardContent } from "./Card";
import { Button } from "./Button";
import { Badge } from "./Badge";
import { Eye } from "lucide-react";

const FinishedEventCard = ({ event, navigate }) => {
  return (
    <Card className="border-border/50 overflow-hidden">
      <img
        src={event.image}
        alt={event.title}
        className="w-full h-40 object-cover opacity-70"
      />

      <CardContent className="p-5 pt-4">
        <Badge variant="secondary" className="mb-2">
          Finished
        </Badge>

        <h4 className="font-semibold mb-2">{event.title}</h4>

        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {event.description}
        </p>

        <Button
          variant="outline"
          className="w-full"
          onClick={() =>
            navigate(`/campus-connect/student/events/${event.id}`)
          }
        >
          <Eye className="w-4 h-4 mr-2" />
          View Details
        </Button>
      </CardContent>
    </Card>
  );
};

export default React.memo(FinishedEventCard);