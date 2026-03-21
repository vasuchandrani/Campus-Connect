import React from "react";
import { Card, CardContent } from "./Card";
import { Button } from "./Button";
import { Badge } from "./Badge";
import { Eye, CheckCircle } from "lucide-react";

const EventCard = ({
  event,
  status,
  isRegistered,
  requesting,
  toggleRegistration,
  setSelectedEvent,
  isRegistrationOpen,
}) => {
  return (
    <Card className="border-border/50 overflow-hidden">
      <img
        src={event.image}
        alt={event.title}
        className="w-full h-40 object-cover"
      />

      <CardContent className="p-5 pt-4">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline">{event.clubName}</Badge>

          <Badge
            variant={
              status === "LIVE"
                ? "destructive"
                : status === "UPCOMING"
                ? "secondary"
                : "default"
            }
          >
            {status}
          </Badge>
        </div>

        <h4 className="font-semibold mb-2">{event.title}</h4>

        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {event.description}
        </p>

        <div className="flex gap-2">
          {isRegistrationOpen(event) ? (
            <Button
              className="flex-1"
              variant={isRegistered ? "outline" : "default"}
              onClick={() => toggleRegistration(event.id)}
              disabled={requesting}
            >
              {isRegistered ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Registered
                </>
              ) : (
                "Register"
              )}
            </Button>
          ) : (
            <Button disabled className="flex-1">
              {isRegistered ? "Registered" : "Registration Closed"}
            </Button>
          )}

          <Button
            variant="outline"
            className="flex-1"
            disabled={requesting}
            onClick={() => setSelectedEvent(event)}
          >
            <Eye className="w-4 h-4 mr-2" />
            Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default React.memo(EventCard);