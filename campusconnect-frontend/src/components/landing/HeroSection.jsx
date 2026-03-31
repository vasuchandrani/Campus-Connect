import React from "react";
import { Button } from "../ui/Button";
import { ArrowRight, Newspaper, BookOpen, Users, Bell } from "lucide-react"

const HeroSection = () => {
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
              <a href="/auth">Watch Demo</a>
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
    </section>
  );
};



export default HeroSection;
