import { Building2, Users, GraduationCap, Newspaper, UserCog, FileSearch } from "lucide-react";

const roles = [
  {
    icon: Building2,
    title: "College Administration",
    description: "Register institution, verify clubs and journalists, oversee research publishing, ensure platform authenticity.",
    capabilities: ["Institution Registration", "Club Verification", "Journalist Approval", "Research Oversight"],
    gradient: "from-primary to-primary/70",
  },
  {
    icon: UserCog,
    title: "Club Administrators",
    description: "Manage club profiles, publish announcements, organize events, and engage with subscribed students.",
    capabilities: ["Profile Management", "Announcements", "Event Creation", "Member Management"],
    gradient: "from-accent to-accent/70",
  },
  {
    icon: Users,
    title: "Club Members",
    description: "Access club features based on assigned permissions, support content posting and event management.",
    capabilities: ["Content Collaboration", "Event Support", "Profile Updates", "Team Activities"],
    gradient: "from-primary/80 to-primary/50",
  },
  {
    icon: GraduationCap,
    title: "Students",
    description: "Join with verified credentials, subscribe to clubs, register for events, and submit research papers.",
    capabilities: ["Club Subscriptions", "Event Registration", "Research Submission", "Personalized Feed"],
    gradient: "from-accent/80 to-accent/50",
  },
  {
    icon: Newspaper,
    title: "Student Journalists",
    description: "College-approved journalists who collect and publish campus news, maintaining quality standards.",
    capabilities: ["News Publishing", "Story Collection", "Editorial Rights", "Campus Coverage"],
    gradient: "from-primary/90 to-accent/60",
  },
  {
    icon: FileSearch,
    title: "Research Reviewers",
    description: "College-assigned reviewers who evaluate research paper submissions and provide academic feedback.",
    capabilities: ["Paper Review", "Quality Assessment", "Feedback Provision", "Academic Standards"],
    gradient: "from-accent/90 to-primary/60",
  },
];

const UserRolesSection = () => {
  return (
    <section id="colleges" className="py-24 bg-muted/30 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            User Roles
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Built for Every Campus Role
          </h2>
          <p className="text-muted-foreground text-lg">
            Role-based access ensures everyone has the tools they need, from administration to students.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role, index) => (
            <div
              key={role.title}
              className={`group relative bg-card rounded-2xl border border-border overflow-hidden transition-all duration-300 hover:shadow-medium hover:border-primary/20 ${
                index === 4 ? "md:col-span-2 lg:col-span-1" : ""
              }`}
            >
              <div className={`h-2 bg-gradient-to-r ${role.gradient}`} />
              
              <div className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${role.gradient} flex items-center justify-center flex-shrink-0 shadow-soft`}>
                    <role.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {role.title}
                    </h3>
                  </div>
                </div>

                <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                  {role.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {role.capabilities.map((capability) => (
                    <span
                      key={capability}
                      className="px-2.5 py-1 text-xs font-medium rounded-md bg-secondary text-secondary-foreground"
                    >
                      {capability}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};





export default UserRolesSection;
