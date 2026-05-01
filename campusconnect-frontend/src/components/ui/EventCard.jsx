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

<div className="flex flex-col sm:flex-row gap-2 mt-4">
  {/* PRIMARY BUTTON */}
  {isRegistrationOpen(event) ? (
    <Button
      className="w-full sm:w-auto flex-1 sm:flex-none"
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
    <Button
      disabled
      className="w-full sm:w-auto flex-1 sm:flex-none"
    >
      {isRegistered ? "Registered" : "Registration Closed"}
    </Button>
  )}

  {/* SECONDARY BUTTON */}
  <Button
    variant="outline"
    className="w-full sm:w-auto flex-1 sm:flex-none flex items-center justify-center"
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