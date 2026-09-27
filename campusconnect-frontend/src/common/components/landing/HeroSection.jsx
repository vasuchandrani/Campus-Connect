import React from "react";
import { Button } from "../ui/Button";
import { useState } from "react";
import { ArrowRight, Download, Newspaper, BookOpen, Users, Bell } from "lucide-react"

const HeroSection = () => {
  const [showVideo, setShowVideo] = useState(false);
  const featurePills = [
    { icon: Newspaper, label: "Digital Newspaper" },
    { icon: BookOpen, label: "Research Publishing" },
    { icon: Users, label: "Club Management" },
    { icon: Bell, label: "Smart Notifications" },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden bg-gradient-hero">

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/3 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center">

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8 animate-fade-in">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            Unifying Campus Communication
          </div>


          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Your Campus, <br />
            <span className="text-gradient-primary">One Connected Platform</span>
          </h1>


          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Streamline communication, enhance student engagement, and expand academic opportunities with CampusConnect – the unified hub for clubs, news, research, and events.
          </p>


          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <Button variant="hero" size="xl" asChild>
              <a href="/auth">
                Get Start
                <ArrowRight className="w-5 h-5" />
              </a>
            </Button>
            <Button variant="hero-outline" size="xl" asChild>
              <a href="https://github.com/vasuchandrani/Campus-Connect/releases/latest" target="_blank" rel="noreferrer">
                Download App
                <Download className="w-5 h-5" />
              </a>
            </Button>
            <Button
              variant="hero-outline"
              size="xl"
              onClick={() => setShowVideo(true)}
            >
              Watch Demo
            </Button>
          </div>


          <div className="flex flex-wrap items-center justify-center gap-3 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            {featurePills.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.label}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-card shadow-soft border border-border/50 text-sm font-medium text-foreground"
                >
                  <Icon className="w-4 h-4 text-primary" />
                  {feature.label}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-16 max-w-5xl mx-auto animate-scale-in" style={{ animationDelay: "0.5s" }}>
          <div className="relative">

            <div className="absolute -inset-4 bg-primary/10 rounded-3xl blur-2xl" />

            <div className="relative glass rounded-2xl p-4 shadow-medium">
              <div className="bg-card rounded-xl overflow-hidden border border-border">

                <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/50">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-destructive/60" />
                    <div className="w-3 h-3 rounded-full bg-accent/60" />
                    <div className="w-3 h-3 rounded-full bg-primary/60" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="px-4 py-1 rounded-md bg-background text-xs text-muted-foreground">
                      campusconnect.edu
                    </div>
                  </div>
                </div>


                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-4">
                    <div className="h-8 w-48 bg-muted rounded-md" />
                    <div className="h-32 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl flex items-center justify-center">
                      <Newspaper className="w-12 h-12 text-primary/30" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-20 bg-muted/50 rounded-lg" />
                      <div className="h-20 bg-muted/50 rounded-lg" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-6 w-24 bg-muted rounded-md" />
                    <div className="space-y-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-12 bg-muted/50 rounded-lg" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showVideo && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="relative w-[90%] md:w-[800px] bg-black rounded-xl overflow-hidden shadow-xl">

            <button
              className="absolute top-2 right-3 text-white text-2xl z-10"
              onClick={() => setShowVideo(false)}
            >
              ✕
            </button>

            <iframe
              className="w-full h-[500px]"
              src="https://drive.google.com/file/d/1tBYrTQ13bBBB32nB8N_UMBczI57JWAij/preview"
              allow="autoplay"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </section>
  );
};



export default HeroSection;
{/* ===== STUDENT VIEW ===== */ }
{
  activeRole === "student" && (
    <div className="space-y-3 sm:space-y-3.5 animate-fade-in">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs sm:text-base font-bold text-foreground truncate">Welcome back, Alex Morgan</p>
          <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Computer Science • 3rd Year</p>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          <div className="w-6 sm:w-7 h-6 sm:h-7 rounded-full bg-primary/10 flex items-center justify-center relative">
            <Bell className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-primary" />
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-accent" />
          </div>
          <div className="w-6 sm:w-7 h-6 sm:h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] sm:text-xs font-bold">
            A
          </div>
        </div>
      </div>

      {/* Stats: 1 box per line on mobile, 3 columns on tablet/desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
        <div className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-card border border-border/60 flex items-center justify-between sm:flex-col sm:items-start min-w-0">
          <div className="min-w-0 flex items-center sm:items-start gap-2 sm:gap-0 sm:flex-col">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 sm:hidden">
              <Users className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-medium truncate">My Clubs</p>
              <p className="text-[11px] text-primary flex items-center gap-0.5 mt-0.5 truncate">
                <Users className="w-2.5 h-2.5 hidden sm:inline-block flex-shrink-0" />
                <span className="truncate">Active Memberships</span>
              </p>
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-foreground leading-tight flex-shrink-0 ml-2 sm:ml-0 sm:mt-1">
            4
          </p>
        </div>

        <div className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-card border border-border/60 flex items-center justify-between sm:flex-col sm:items-start min-w-0">
          <div className="min-w-0 flex items-center sm:items-start gap-2 sm:gap-0 sm:flex-col">
            <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 sm:hidden">
              <Calendar className="w-3.5 h-3.5 text-accent" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-medium truncate">Upcoming Events</p>
              <p className="text-[11px] text-accent flex items-center gap-0.5 mt-0.5 truncate">
                <Calendar className="w-2.5 h-2.5 hidden sm:inline-block flex-shrink-0" />
                <span className="truncate">2 this week</span>
              </p>
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-foreground leading-tight flex-shrink-0 ml-2 sm:ml-0 sm:mt-1">
            12
          </p>
        </div>

        <div className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-card border border-border/60 flex items-center justify-between sm:flex-col sm:items-start min-w-0">
          <div className="min-w-0 flex items-center sm:items-start gap-2 sm:gap-0 sm:flex-col">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 sm:hidden">
              <BookOpen className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-medium truncate">My Research</p>
              <p className="text-[11px] text-primary flex items-center gap-0.5 mt-0.5 truncate">
                <BookOpen className="w-2.5 h-2.5 hidden sm:inline-block flex-shrink-0" />
                <span className="truncate">1 Approved</span>
              </p>
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-foreground leading-tight flex-shrink-0 ml-2 sm:ml-0 sm:mt-1">
            2
          </p>
        </div>
      </div>

      {/* Gazette Headline + Next Event with RSVP */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 sm:gap-3">
        <div className="sm:col-span-3 p-3 sm:p-3.5 rounded-lg sm:rounded-xl bg-card border border-border/60 min-w-0">
          <div className="flex items-center gap-1.5 mb-1 sm:mb-1.5">
            <Newspaper className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-primary flex-shrink-0" />
            <span className="text-[9px] sm:text-[10px] font-semibold text-primary uppercase">Campus Gazette</span>
          </div>
          <p className="text-xs sm:text-sm font-bold text-foreground leading-snug mb-1">
            University Secures National AI Research Grant
          </p>
          <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed line-clamp-2">
            New laboratory will offer undergraduate fellowships across engineering departments.
          </p>
        </div>
        <div className="sm:col-span-2 p-3 sm:p-3.5 rounded-lg sm:rounded-xl bg-card border border-border/60 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-center gap-1.5 mb-1 sm:mb-1.5">
              <Calendar className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-accent flex-shrink-0" />
              <span className="text-[9px] sm:text-[10px] font-semibold text-accent uppercase">Next Event</span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-foreground leading-snug truncate">
              Campus Hackathon '26
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 truncate">Robotics Society</p>
          </div>
          <button
            onClick={() => toggleRsvp("ev1")}
            className={`w-full mt-2.5 py-1.5 sm:py-2 rounded-lg text-xs font-semibold text-center cursor-pointer transition-all duration-200 flex items-center justify-center gap-1.5 ${rsvp["ev1"]
                ? "bg-primary/15 text-primary border border-primary/30"
                : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
              }`}
          >
            {rsvp["ev1"] ? (
              <>
                <Check className="w-3.5 h-3.5" /> Registered (Pass #842)
              </>
            ) : (
              "1-Click RSVP"
            )}
          </button>
        </div>
      </div>

      {/* Research Paper Submission */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-muted/40 border border-border/50 min-w-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 sm:w-8 h-7 sm:h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <FileText className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] sm:text-xs font-semibold text-foreground truncate">
              Paper: "Autonomous Pathfinding in Quadrotors"
            </p>
            <p className="text-[10px] sm:text-[11px] text-muted-foreground truncate">Under faculty review • Dr. Sharma</p>
          </div>
        </div>
        <button
          onClick={() => toggleApprove("sp1")}
          className={`text-[10px] sm:text-xs font-medium px-2.5 py-1 rounded-md self-start sm:self-center flex-shrink-0 cursor-pointer transition-all ${approved["sp1"]
              ? "text-primary bg-primary/15 border border-primary/30"
              : "text-accent bg-accent/10 border border-accent/20"
            }`}
        >
          {approved["sp1"] ? "Approved ✓ Indexed" : "Pending Review"}
        </button>
      </div>
    </div>
  )
}

{/* ===== PROFESSOR VIEW ===== */ }
{
  activeRole === "professor" && (
    <div className="space-y-3 sm:space-y-3.5 animate-fade-in">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs sm:text-base font-bold text-foreground truncate">Dr. Rajesh Sharma</p>
          <p className="text-[10px] sm:text-xs text-muted-foreground truncate">AI Research Lab • CSE Department</p>
        </div>
        <span className="text-[10px] sm:text-xs font-semibold bg-primary/10 text-primary px-2 sm:px-2.5 py-0.5 rounded-full flex-shrink-0">
          Faculty Mentor
        </span>
      </div>

      {/* Stats: 1 box per line on mobile, 3 columns on tablet/desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
        <div className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-card border border-border/60 flex items-center justify-between sm:flex-col sm:items-start min-w-0">
          <div className="min-w-0 flex items-center sm:items-start gap-2 sm:gap-0 sm:flex-col">
            <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 sm:hidden">
              <Clock className="w-3.5 h-3.5 text-accent" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-medium truncate">Papers to Review</p>
              <p className="text-[11px] text-accent flex items-center gap-0.5 mt-0.5 truncate">
                <Clock className="w-2.5 h-2.5 hidden sm:inline-block flex-shrink-0" />
                <span className="truncate">2 Urgent Reviews</span>
              </p>
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-foreground leading-tight flex-shrink-0 ml-2 sm:ml-0 sm:mt-1">
            5
          </p>
        </div>

        <div className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-card border border-border/60 flex items-center justify-between sm:flex-col sm:items-start min-w-0">
          <div className="min-w-0 flex items-center sm:items-start gap-2 sm:gap-0 sm:flex-col">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 sm:hidden">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-medium truncate">Mentored Clubs</p>
              <p className="text-[11px] text-primary flex items-center gap-0.5 mt-0.5 truncate">
                <ShieldCheck className="w-2.5 h-2.5 hidden sm:inline-block flex-shrink-0" />
                <span className="truncate">Active Mentorship</span>
              </p>
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-foreground leading-tight flex-shrink-0 ml-2 sm:ml-0 sm:mt-1">
            2
          </p>
        </div>

        <div className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-card border border-border/60 flex items-center justify-between sm:flex-col sm:items-start min-w-0">
          <div className="min-w-0 flex items-center sm:items-start gap-2 sm:gap-0 sm:flex-col">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 sm:hidden">
              <Award className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-medium truncate">Published Papers</p>
              <p className="text-[11px] text-primary flex items-center gap-0.5 mt-0.5 truncate">
                <Award className="w-2.5 h-2.5 hidden sm:inline-block flex-shrink-0" />
                <span className="truncate">University Indexed</span>
              </p>
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-foreground leading-tight flex-shrink-0 ml-2 sm:ml-0 sm:mt-1">
            18
          </p>
        </div>
      </div>

      <div className="p-3 sm:p-3.5 rounded-lg sm:rounded-xl bg-card border border-border/60 space-y-2 sm:space-y-2.5">
        <p className="text-xs font-bold text-foreground">Research Review Queue</p>
        <div className="p-2.5 sm:p-3 rounded-lg bg-muted/30 border border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">
              "Zero-Knowledge Verification on Campus Networks"
            </p>
            <p className="text-[10px] sm:text-[11px] text-muted-foreground">Rohan Sen • CSE Department</p>
          </div>
          <button
            onClick={() => toggleApprove("p1")}
            className={`w-full sm:w-auto px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-1 flex-shrink-0 ${approved["p1"]
                ? "bg-primary/15 text-primary border border-primary/30"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
          >
            {approved["p1"] ? (
              <>
                <Check className="w-3 h-3 inline mr-1" /> Approved
              </>
            ) : (
              "Approve"
            )}
          </button>
        </div>
        <div className="p-2.5 sm:p-3 rounded-lg bg-muted/30 border border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">
              "Thermoelectric Energy Harvesting Sensors"
            </p>
            <p className="text-[10px] sm:text-[11px] text-muted-foreground">Neha Varma • EE Department</p>
          </div>
          <button
            onClick={() => toggleApprove("p2")}
            className={`w-full sm:w-auto px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-1 flex-shrink-0 ${approved["p2"]
                ? "bg-primary/15 text-primary border border-primary/30"
                : "bg-secondary text-secondary-foreground hover:bg-muted"
              }`}
          >
            {approved["p2"] ? (
              <>
                <Check className="w-3 h-3 inline mr-1" /> Reviewed
              </>
            ) : (
              "Review"
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

{/* ===== ADMIN VIEW ===== */ }
{
  activeRole === "admin" && (
    <div className="space-y-3 sm:space-y-3.5 animate-fade-in">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs sm:text-base font-bold text-foreground truncate">Institute Administration</p>
          <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Campus Governance Panel</p>
        </div>
        <span className="text-[10px] sm:text-xs font-semibold bg-accent/10 text-accent px-2 sm:px-2.5 py-0.5 rounded-full flex-shrink-0">
          2 Pending
        </span>
      </div>

      {/* Stats: 1 box per line on mobile, 3 columns on tablet/desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
        <div className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-card border border-border/60 flex items-center justify-between sm:flex-col sm:items-start min-w-0">
          <div className="min-w-0 flex items-center sm:items-start gap-2 sm:gap-0 sm:flex-col">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 sm:hidden">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-medium truncate">Students</p>
              <p className="text-[11px] text-primary flex items-center gap-0.5 mt-0.5 truncate">
                <ShieldCheck className="w-2.5 h-2.5 hidden sm:inline-block flex-shrink-0" />
                <span className="truncate">Verified Institutional</span>
              </p>
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-foreground leading-tight flex-shrink-0 ml-2 sm:ml-0 sm:mt-1">
            5,420
          </p>
        </div>

        <div className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-card border border-border/60 flex items-center justify-between sm:flex-col sm:items-start min-w-0">
          <div className="min-w-0 flex items-center sm:items-start gap-2 sm:gap-0 sm:flex-col">
            <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 sm:hidden">
              <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-medium truncate">Departments</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                18 Configured
              </p>
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-foreground leading-tight flex-shrink-0 ml-2 sm:ml-0 sm:mt-1">
            18
          </p>
        </div>

        <div className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-card border border-border/60 flex items-center justify-between sm:flex-col sm:items-start min-w-0">
          <div className="min-w-0 flex items-center sm:items-start gap-2 sm:gap-0 sm:flex-col">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 sm:hidden">
              <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-medium truncate">Campus Clubs</p>
              <p className="text-[11px] text-primary flex items-center gap-0.5 mt-0.5 truncate">
                <CheckCircle2 className="w-2.5 h-2.5 hidden sm:inline-block flex-shrink-0" />
                <span className="truncate">Supervised</span>
              </p>
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-foreground leading-tight flex-shrink-0 ml-2 sm:ml-0 sm:mt-1">
            36
          </p>
        </div>
      </div>

      <div className="p-3 sm:p-3.5 rounded-lg sm:rounded-xl bg-card border border-border/60 space-y-2 sm:space-y-2.5">
        <p className="text-xs font-bold text-foreground">Pending Approvals</p>
        <div className="p-2.5 sm:p-3 rounded-lg bg-muted/30 border border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-semibold bg-accent/15 text-accent px-1.5 py-0.5 rounded">
                New Club
              </span>
              <p className="text-xs font-semibold text-foreground truncate">AeroVenture Drone Club</p>
            </div>
            <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5">Mentor: Prof. Sundaram</p>
          </div>
          <button
            onClick={() => toggleApprove("c1")}
            className={`w-full sm:w-auto px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-1 flex-shrink-0 ${approved["c1"]
                ? "bg-primary/15 text-primary border border-primary/30"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
          >
            {approved["c1"] ? (
              <>
                <Check className="w-3 h-3 inline mr-1" /> Verified
              </>
            ) : (
              "Verify"
            )}
          </button>
        </div>
        <div className="p-2.5 sm:p-3 rounded-lg bg-muted/30 border border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-semibold bg-primary/15 text-primary px-1.5 py-0.5 rounded">
                Journalist
              </span>
              <p className="text-xs font-semibold text-foreground truncate">Aanya Sen — Press Access</p>
            </div>
            <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5">Portfolio verified</p>
          </div>
          <button
            onClick={() => toggleApprove("j1")}
            className={`w-full sm:w-auto px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-1 flex-shrink-0 ${approved["j1"]
                ? "bg-primary/15 text-primary border border-primary/30"
                : "bg-secondary text-secondary-foreground hover:bg-muted"
              }`}
          >
            {approved["j1"] ? (
              <>
                <Check className="w-3 h-3 inline mr-1" /> Granted
              </>
            ) : (
              "Grant Access"
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

{/* ===== CLUB LEADER VIEW ===== */ }
{
  activeRole === "club" && (
    <div className="space-y-3 sm:space-y-3.5 animate-fade-in">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs sm:text-base font-bold text-foreground truncate">Robotics Society</p>
          <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Club Workspace • Mentor: Prof. Kulkarni</p>
        </div>
        <span className="text-[10px] sm:text-xs font-semibold bg-primary/10 text-primary px-2 sm:px-2.5 py-0.5 rounded-full flex-shrink-0">
          Club Leader
        </span>
      </div>

      {/* Stats: 1 box per line on mobile, 3 columns on tablet/desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
        <div className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-card border border-border/60 flex items-center justify-between sm:flex-col sm:items-start min-w-0">
          <div className="min-w-0 flex items-center sm:items-start gap-2 sm:gap-0 sm:flex-col">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 sm:hidden">
              <Users className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-medium truncate">Members</p>
              <p className="text-[11px] text-primary flex items-center gap-0.5 mt-0.5 truncate">
                <TrendingUp className="w-2.5 h-2.5 hidden sm:inline-block flex-shrink-0" />
                <span className="truncate">+24 new this month</span>
              </p>
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-foreground leading-tight flex-shrink-0 ml-2 sm:ml-0 sm:mt-1">
            248
          </p>
        </div>

        <div className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-card border border-border/60 flex items-center justify-between sm:flex-col sm:items-start min-w-0">
          <div className="min-w-0 flex items-center sm:items-start gap-2 sm:gap-0 sm:flex-col">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 sm:hidden">
              <Megaphone className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-medium truncate">Announcements</p>
              <p className="text-[11px] text-primary flex items-center gap-0.5 mt-0.5 truncate">
                <CheckCircle2 className="w-2.5 h-2.5 hidden sm:inline-block flex-shrink-0" />
                <span className="truncate">100% Reach</span>
              </p>
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-foreground leading-tight flex-shrink-0 ml-2 sm:ml-0 sm:mt-1">
            16
          </p>
        </div>

        <div className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-card border border-border/60 flex items-center justify-between sm:flex-col sm:items-start min-w-0">
          <div className="min-w-0 flex items-center sm:items-start gap-2 sm:gap-0 sm:flex-col">
            <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 sm:hidden">
              <Calendar className="w-3.5 h-3.5 text-accent" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-medium truncate">Live Events</p>
              <p className="text-[11px] text-accent flex items-center gap-0.5 mt-0.5 truncate">
                <Calendar className="w-2.5 h-2.5 hidden sm:inline-block flex-shrink-0" />
                <span className="truncate">1 Tomorrow</span>
              </p>
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-foreground leading-tight flex-shrink-0 ml-2 sm:ml-0 sm:mt-1">
            3
          </p>
        </div>
      </div>

      <div className="p-3 sm:p-3.5 rounded-lg sm:rounded-xl bg-card border border-border/60 space-y-1.5 sm:space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-foreground">Latest Announcement</p>
          <span className="text-[10px] sm:text-[11px] text-muted-foreground">Yesterday</span>
        </div>
        <p className="text-xs sm:text-sm font-semibold text-foreground">
          RoboWars 2026: Team Registrations Open
        </p>
        <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
          Kits will be distributed in the Robotics Lab from 4 PM. Please finalize teams.
        </p>
        <div className="flex items-center justify-between pt-1 text-[10px] sm:text-[11px] text-muted-foreground border-t border-border/50">
          <span>Delivered to 248 members</span>
          <span className="text-primary font-medium">192 Opens (77%)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
        <button className="py-2 sm:py-2.5 px-3 rounded-lg text-xs font-semibold bg-primary text-primary-foreground flex items-center justify-center gap-1.5 cursor-pointer hover:bg-primary/90 transition-colors">
          <Calendar className="w-3.5 h-3.5" /> Create Event
        </button>
        <button className="py-2 sm:py-2.5 px-3 rounded-lg text-xs font-semibold bg-secondary text-secondary-foreground flex items-center justify-center gap-1.5 cursor-pointer hover:bg-muted transition-colors">
          <Megaphone className="w-3.5 h-3.5" /> Broadcast Announcement
        </button>
      </div>
    </div>
  )
}

{/* ===== JOURNALIST VIEW ===== */ }
{
  activeRole === "journalist" && (
    <div className="space-y-3 sm:space-y-3.5 animate-fade-in">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs sm:text-base font-bold text-foreground truncate">Campus Herald Editorial</p>
          <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Student Journalist Desk</p>
        </div>
        <span className="text-[10px] sm:text-xs font-semibold bg-primary/10 text-primary px-2 sm:px-2.5 py-0.5 rounded-full flex-shrink-0">
          Press Pass
        </span>
      </div>

      {/* Stats: 1 box per line on mobile, 3 columns on tablet/desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
        <div className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-card border border-border/60 flex items-center justify-between sm:flex-col sm:items-start min-w-0">
          <div className="min-w-0 flex items-center sm:items-start gap-2 sm:gap-0 sm:flex-col">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 sm:hidden">
              <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-medium truncate">Published Articles</p>
              <p className="text-[11px] text-primary flex items-center gap-0.5 mt-0.5 truncate">
                <CheckCircle2 className="w-2.5 h-2.5 hidden sm:inline-block flex-shrink-0" />
                <span className="truncate">Editorial Approved</span>
              </p>
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-foreground leading-tight flex-shrink-0 ml-2 sm:ml-0 sm:mt-1">
            28
          </p>
        </div>

        <div className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-card border border-border/60 flex items-center justify-between sm:flex-col sm:items-start min-w-0">
          <div className="min-w-0 flex items-center sm:items-start gap-2 sm:gap-0 sm:flex-col">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 sm:hidden">
              <TrendingUp className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-medium truncate">Campus Readers</p>
              <p className="text-[11px] text-primary flex items-center gap-0.5 mt-0.5 truncate">
                <TrendingUp className="w-2.5 h-2.5 hidden sm:inline-block flex-shrink-0" />
                <span className="truncate">+18% this month</span>
              </p>
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-foreground leading-tight flex-shrink-0 ml-2 sm:ml-0 sm:mt-1">
            14.8k
          </p>
        </div>

        <div className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-card border border-border/60 flex items-center justify-between sm:flex-col sm:items-start min-w-0">
          <div className="min-w-0 flex items-center sm:items-start gap-2 sm:gap-0 sm:flex-col">
            <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 sm:hidden">
              <Clock className="w-3.5 h-3.5 text-accent" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-medium truncate">Drafts</p>
              <p className="text-[11px] text-accent flex items-center gap-0.5 mt-0.5 truncate">
                <Clock className="w-2.5 h-2.5 hidden sm:inline-block flex-shrink-0" />
                <span className="truncate">In Review</span>
              </p>
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-foreground leading-tight flex-shrink-0 ml-2 sm:ml-0 sm:mt-1">
            3
          </p>
        </div>
      </div>

      <div className="p-3 sm:p-3.5 rounded-lg sm:rounded-xl bg-card border border-border/60 space-y-2 sm:space-y-2.5">
        <p className="text-xs font-bold text-foreground">Editorial Pipeline</p>
        <div className="p-2.5 sm:p-3 rounded-lg bg-muted/30 border border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-semibold bg-accent/15 text-accent px-1.5 py-0.5 rounded">
                Draft
              </span>
              <p className="text-xs font-semibold text-foreground truncate">
                "Cultural Fest Dates with Celebrity Performers"
              </p>
            </div>
            <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5">620 words • Fact-checked</p>
          </div>
          <button
            onClick={() => toggleApprove("art1")}
            className={`w-full sm:w-auto px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-1 flex-shrink-0 ${approved["art1"]
                ? "bg-primary/15 text-primary border border-primary/30"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
          >
            {approved["art1"] ? (
              <>
                <Check className="w-3 h-3 inline mr-1" /> Published
              </>
            ) : (
              "Publish"
            )}
          </button>
        </div>
        <div className="p-2.5 sm:p-3 rounded-lg bg-muted/30 border border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-semibold bg-primary/15 text-primary px-1.5 py-0.5 rounded">
                Review
              </span>
              <p className="text-xs font-semibold text-foreground truncate">
                "Library 24/7 Silent Pods and AI Workstations"
              </p>
            </div>
            <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5">Needs editor signature</p>
          </div>
          <button
            onClick={() => toggleApprove("art2")}
            className={`w-full sm:w-auto px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-1 flex-shrink-0 ${approved["art2"]
                ? "bg-primary/15 text-primary border border-primary/30"
                : "bg-secondary text-secondary-foreground hover:bg-muted"
              }`}
          >
            {approved["art2"] ? (
              <>
                <Check className="w-3 h-3 inline mr-1" /> Approved
              </>
            ) : (
              "Review"
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
              </div >
            </div >
          </div >
        </div >
      </div >

  {/* Video Modal */ }
{
  showVideo && (
    <div
      className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4"
      onClick={() => setShowVideo(false)}
    >
      <div
        className="relative w-full max-w-4xl bg-black rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 bg-neutral-900 border-b border-neutral-800">
          <div className="flex items-center gap-2 text-white">
            <GraduationCap className="w-4 sm:w-5 h-4 sm:h-5 text-primary" />
            <span className="text-xs sm:text-sm font-semibold">CampusConnect Tour</span>
          </div>
          <button
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-white transition-colors"
            onClick={() => setShowVideo(false)}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="aspect-video w-full">
          <iframe
            className="w-full h-full"
            src="https://drive.google.com/file/d/1tBYrTQ13bBBB32nB8N_UMBczI57JWAij/preview"
            title="CampusConnect Platform Tour"
            allow="autoplay"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  )
}
    </section >
  );
};

export default HeroSection;
