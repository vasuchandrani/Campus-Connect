import React from "react";
import {
  Building2,
  Users,
  GraduationCap,
  Newspaper,
  UserCog,
  FileSearch,
} from "lucide-react";

const roles = [
  {
    icon: Building2,
    title: "College Administration",
    description:
      "Register institution, verify clubs and journalists, oversee research publishing, ensure platform authenticity.",
    capabilities: [
      "Institution Registration",
      "Club Verification",
      "Journalist Approval",
      "Research Oversight",
    ],
    gradient: "var(--gradient-primary)",
  },
  {
    icon: UserCog,
    title: "Club Administrators",
    description:
      "Manage club profiles, publish announcements, organize events, and engage with subscribed students.",
    capabilities: [
      "Profile Management",
      "Announcements",
      "Event Creation",
      "Member Management",
    ],
    gradient: "var(--gradient-accent)",
  },
  {
    icon: Users,
    title: "Club Members",
    description:
      "Access club features based on assigned permissions, support content posting and event management.",
    capabilities: [
      "Content Collaboration",
      "Event Support",
      "Profile Updates",
      "Team Activities",
    ],
    gradient: "var(--gradient-primary)",
  },
  {
    icon: GraduationCap,
    title: "Students",
    description:
      "Join with verified credentials, subscribe to clubs, register for events, and submit research papers.",
    capabilities: [
      "Club Subscriptions",
      "Event Registration",
      "Research Submission",
      "Personalized Feed",
    ],
    gradient: "var(--gradient-accent)",
  },
  {
    icon: Newspaper,
    title: "Student Journalists",
    description:
      "College-approved journalists who collect and publish campus news, maintaining quality standards.",
    capabilities: [
      "News Publishing",
      "Story Collection",
      "Editorial Rights",
      "Campus Coverage",
    ],
    gradient:
      "linear-gradient(135deg, hsl(var(--primary) / 0.9), hsl(var(--accent) / 0.6))",
  },
  {
    icon: FileSearch,
    title: "Research Reviewers",
    description:
      "College-assigned reviewers who evaluate research paper submissions and provide academic feedback.",
    capabilities: [
      "Paper Review",
      "Quality Assessment",
      "Feedback Provision",
      "Academic Standards",
    ],
    gradient:
      "linear-gradient(135deg, hsl(var(--accent) / 0.9), hsl(var(--primary) / 0.6))",
  },
];

const UserRolesSection = () => {
  return (
    <section className="py-24 bg-muted/30 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          {/* Pill Badge */}
          <div
            className="inline-flex items-center px-4 py-1.5 rounded-full text-primary text-sm font-medium mb-4"
            style={{
              backgroundColor: "hsl(var(--primary) / 0.15)",
            }}
          >
            User Roles
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Built for Every Campus Role
          </h2>

          <p className="text-muted-foreground text-lg">
            Role-based access ensures everyone has the tools they need, from
            administration to students.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <div
                key={role.title}
                className="group relative bg-card rounded-2xl border border-border overflow-hidden transition-all duration-300 hover:shadow-medium"
              >
                {/* Top gradient bar */}
                <div
                  style={{ background: role.gradient }}
                  className="h-2 w-full"
                />

                <div className="p-6">
                  {/* Icon + Title */}
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      style={{ background: role.gradient }}
                      className="w-12 h-12 rounded-xl flex items-center justify-center shadow-soft transition-transform duration-300 group-hover:scale-110"
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {role.title}
                      </h3>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                    {role.description}
                  </p>

                  {/* Capabilities */}
                  <div className="flex flex-wrap gap-2">
                    {role.capabilities.map((cap) => (
                      <span
                        key={cap}
                        className="px-2.5 py-1 text-xs font-medium rounded-md bg-secondary text-secondary-foreground"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default UserRolesSection;
