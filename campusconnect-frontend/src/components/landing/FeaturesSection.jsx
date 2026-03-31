import React from "react";
import { 
  Newspaper, 
  BookOpen, 
  Megaphone, 
  Calendar, 
  Bell, 
  Shield,
  Users,
  Building2
} from "lucide-react";

const features = [
  {
    icon: Newspaper,
    title: "University Digital Newspaper",
    description: "Student journalists deliver daily campus updates, stories, and highlights through a professionally managed digital publication.",
    color: "primary",
  },
  {
    icon: BookOpen,
    title: "Research Paper Publishing",
    description: "Monthly submission and publication system for student research, fostering academic excellence and recognition.",
    color: "accent",
  },
  {
    icon: Megaphone,
    title: "Club Announcements",
    description: "Clubs publish targeted announcements to their subscribers, ensuring relevant information reaches the right audience.",
    color: "primary",
  },
  {
    icon: Calendar,
    title: "Event Registration",
    description: "One-click event registration with pre-filled details. Never miss a campus activity again.",
    color: "accent",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "Real-time updates from clubs and sections you follow. Stay informed without the noise.",
    color: "primary",
  },
  {
    icon: Shield,
    title: "Verified Access",
    description: "Institution-based verification ensures authentic community with colleges, clubs, and students.",
    color: "accent",
  },
  {
    icon: Users,
    title: "Interest-Based Following",
    description: "Subscribe only to clubs and sections that matter to you. Personalized campus experience.",
    color: "primary",
  },
  {
    icon: Building2,
    title: "Multi-College Support",
    description: "Scalable platform supporting multiple institutions with independent administration.",
    color: "accent",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-background relative">
      
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-accent font-medium text-sm mb-4"
            style={{
              backgroundColor: "hsl(var(--accent) / 0.15)",
            }}
          >
            Features
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything Your Campus Needs
          </h2>
          <p className="text-muted-foreground text-lg">
            A comprehensive suite of tools designed to unify communication, celebrate achievements, and build community.
          </p>
        </div>

        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group relative p-6 bg-card rounded-2xl border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-medium"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 ${
                  feature.color === "primary" 
                    ? "bg-primary/10 text-primary" 
                    : "bg-accent/10 text-accent"
                }`}>
                  <Icon className="w-6 h-6" />
                </div>

                
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>

                
                <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ${
                  feature.color === "primary"
                    ? "bg-gradient-to-br from-primary/5 to-transparent"
                    : "bg-gradient-to-br from-accent/5 to-transparent"
                }`} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};







export default FeaturesSection;
