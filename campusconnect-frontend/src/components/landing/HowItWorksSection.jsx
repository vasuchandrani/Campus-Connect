import { Building2, Users, CheckCircle2, Rocket } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: Building2,
    title: "College Registration",
    description: "Your institution registers on CampusConnect and sets up the organizational structure.",
  },
  {
    step: "02",
    icon: Users,
    title: "Club & Role Setup",
    description: "Clubs register under the college, and admins assign roles to team members and journalists.",
  },
  {
    step: "03",
    icon: CheckCircle2,
    title: "Student Verification",
    description: "Students join using verified institutional credentials and customize their interests.",
  },
  {
    step: "04",
    icon: Rocket,
    title: "Go Live",
    description: "Start publishing news, announcements, research, and events. The campus is now connected!",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24 bg-background relative">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            How It Works
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Get Started in 4 Simple Steps
          </h2>
          <p className="text-muted-foreground text-lg">
            From registration to a fully connected campus – it's that simple.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-accent to-primary/50 hidden md:block" />

            {steps.map((step, index) => (
              <div
                key={step.step}
                className={`relative flex items-start gap-6 mb-12 last:mb-0 ${
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                <div
                  className={`flex-shrink-0 relative z-10 ${
                    index % 2 === 0 ? "md:pr-8" : "md:pl-8"
                  }`}
                >
                  <div className="w-16 h-16 rounded-2xl bg-card border-2 border-primary/20 flex items-center justify-center shadow-soft group-hover:shadow-medium transition-shadow">
                    <step.icon className="w-7 h-7 text-primary" />
                  </div>
                </div>

                <div
                  className={`flex-1 pt-2 ${
                    index % 2 === 0
                      ? "md:text-right md:pr-16"
                      : "md:text-left md:pl-16"
                  }`}
                >
                  <div
                    className={`inline-flex items-center gap-2 mb-2 ${
                      index % 2 === 0 ? "md:flex-row-reverse" : ""
                    }`}
                  >
                    <span className="text-4xl font-bold text-primary/20">
                      {step.step}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>

                <div className="absolute left-8 md:left-1/2 top-6 w-4 h-4 -ml-2 rounded-full bg-primary border-4 border-background shadow-glow hidden md:block" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};





export default HowItWorksSection;
