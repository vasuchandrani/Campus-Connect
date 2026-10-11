import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./Dialog";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { Clock, MapPin, Calendar, Building2, Trophy, Mic } from "lucide-react";

const EventPreviewModal = ({
  event,
  open,
  onClose,
  clubName = "",
  actionButton = null,
}) => {
  if (!event) return null;

  const displayClub = event.clubName || clubName || "Campus Event";
  const poster = event.posterUrl || event.imageUrl || event.image || event.coverImage;

  // Format dates cleanly
  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return String(dateStr);
      return date.toLocaleString(undefined, {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
    } catch {
      return String(dateStr);
    }
  };

  // Format location
  const getLocationText = () => {
    const loc = event.locationDetails || event.location;
    if (!loc) return "Campus Venue";
    if (typeof loc === "object") {
      const parts = [
        loc.address,
        loc.city,
        loc.state,
        loc.country
      ].filter(Boolean);
      return parts.length > 0 ? parts.join(", ") : "Campus Venue";
    }
    return String(loc);
  };

  // Status text determination
  const getStatusText = () => {
    if (event.status === "DRAFT" || event.isDraft) return "Draft Event";
    if (event.status === "CREATED" || event.status === "APPROVED_BY_CLUB_ADMIN")
      return "Pending Approval";
    if (event.status === "FINISHED") return "Event Completed";
    if (event.status === "PUBLISHED" || event.status === "APPROVED_BY_MENTOR")
      return "Open for Registration";
    return event.status || "Active";
  };

  const getPriceText = () => {
    if (!event.registrationPayment || event.registrationPayment === "FREE")
      return "Free";
    if (event.registrationPayment === "PAID") {
      return "Paid";
    }
    return event.registrationPayment;
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="w-[95vw] sm:max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl p-5 sm:p-6 space-y-5 bg-white text-slate-900 border-slate-200 shadow-xl">
        <DialogHeader className="space-y-1 text-left">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <Badge
              variant="outline"
              className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 border-emerald-200 px-2.5 py-0.5 rounded-full"
            >
              {displayClub}
            </Badge>
            <Badge
              variant="secondary"
              className="text-[11px] font-semibold bg-emerald-500 text-white px-2.5 py-0.5 rounded-full border-none"
            >
              {getPriceText()}
            </Badge>
            <Badge
              variant="outline"
              className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 border-slate-200 px-2 py-0.5 rounded-full"
            >
              {event.eventType || "OFFLINE"}
            </Badge>
          </div>

          <DialogTitle className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {event.title}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-slate-500">
            Organized under {displayClub}
          </DialogDescription>
        </DialogHeader>

        {/* Banner image if present */}
        {poster && (
          <div className="rounded-2xl overflow-hidden shrink-0 min-h-[160px] sm:min-h-[200px] max-h-56 w-full border border-slate-200 shadow-xs">
            <img
              src={poster}
              alt={event.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>
        )}

        {/* Prize Pool */}
        {event.prizeMoney != null && Number(event.prizeMoney) > 0 && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Trophy className="w-5 h-5 text-amber-500" />
              <div>
                <p className="text-xs font-bold text-amber-700">
                  Total Prize Pool
                </p>
                <p className="text-base font-extrabold text-slate-900">
                  ₹{Number(event.prizeMoney).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* EVENT DESCRIPTION & AGENDA */}
        <div className="space-y-1.5">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            EVENT DESCRIPTION & AGENDA
          </h4>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
            {event.description || event.overview || "No description provided."}
          </p>
        </div>

        {/* Timing & Venue details box */}
        <div className="p-4 rounded-2xl bg-[#F4F9F6] border border-[#E0EFE8] grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
          <div className="flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-800 block">
                Event Schedule
              </span>
              <span className="text-slate-500 block">
                Start: {event.startTime || event.eventDate ? formatDate(event.startTime || event.eventDate) : "Not specified"}
              </span>
              <span className="text-slate-500 block">
                End: {event.endTime ? formatDate(event.endTime) : "Not specified"}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-800 block">
                Location / Venue
              </span>
              <span className="text-slate-500">
                {getLocationText()}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Calendar className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-800 block">
                Registration Window
              </span>
              <span className="text-slate-500 block">
                Starts: {event.registrationStart ? formatDate(event.registrationStart) : "Not specified"}
              </span>
              <span className="text-slate-500 block">
                Closes: {event.registrationEnd ? formatDate(event.registrationEnd) : "Not specified"}
              </span>
            </div>
          </div>

          {event.departmentName && (
            <div className="flex items-start gap-2.5">
              <Building2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-800 block">
                  Department
                </span>
                <span className="text-slate-500">
                  {event.departmentName}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Criteria & Eligibility */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
          <div>
            <span className="font-semibold text-slate-800">
              Target Batch Year:{" "}
            </span>
            <span className="text-slate-600">{event.batchYear != null ? event.batchYear : "Any"}</span>
          </div>
          <div>
            <span className="font-semibold text-slate-800">
              Criteria:{" "}
            </span>
            <span className="text-slate-600">{event.criteria || "None specified"}</span>
          </div>
          <div>
            <span className="font-semibold text-slate-800">
              Eligibility:{" "}
            </span>
            <span className="text-slate-600">
              {event.eligibility || "Open to all eligible members"}
            </span>
          </div>
        </div>

        {/* Speakers Section */}
        {event.speakers && event.speakers.length > 0 && (
          <div className="space-y-2 pt-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5 text-emerald-600" /> Keynote Speakers ({event.speakers.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {event.speakers.map((sp, idx) => (
                <div key={idx} className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-0.5">
                  <p className="font-semibold text-slate-900">{sp.name}</p>
                  {(sp.tagline || sp.description || sp.position) && (
                    <p className="text-slate-500 text-[11px]">{sp.tagline || sp.description || sp.position}</p>
                  )}
                  {sp.email && (
                    <p className="text-[10px] text-emerald-600 truncate">{sp.email}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer / Status */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
          <div className="text-xs sm:text-sm font-medium text-slate-500 flex items-center gap-1.5">
            <span>Status:</span>
            <span className="font-bold text-slate-800">{getStatusText()}</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {actionButton || (
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="rounded-xl px-5 text-xs font-semibold border-emerald-500/40 text-emerald-600 hover:bg-emerald-50"
              >
                Close
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventPreviewModal;
