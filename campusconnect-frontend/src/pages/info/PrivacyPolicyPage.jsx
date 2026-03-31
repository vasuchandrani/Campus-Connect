import Navbar from "../../components/landing/Navbar";
import Footer from "../../components/landing/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";

const sections = [
  {
    title: "Information We Collect",
    content: [
      "We collect information you provide directly, including your name, email address, college affiliation, and department.",
      "Content created on the platform such as event registrations, club memberships, articles, and research submissions.",
      "Automatically collected data, such as login timestamps, device information, and activity logs to ensure platform security and improve your experience.",
    ],
  },
  {
    title: "How We Use Your Information",
    content: [
      "To provide and improve CampusConnect services and ensure smooth campus communication.",
      "To manage club memberships, announcements, and event registrations efficiently.",
      "To facilitate research collaboration and publication workflows.",
      "To send personalized notifications about events, updates, and club activities relevant to you.",
    ],
  },
  {
    title: "Data Sharing",
    content: [
      "Your data is shared only with authorized college administrators as needed to operate the platform.",
      "Club administrators can access member information relevant to their club management.",
      "We do NOT sell or share personal information with third-party marketers.",
    ],
  },
  {
    title: "Data Security",
    content: [
      "All data is encrypted both in transit (using HTTPS) and at rest.",
      "Passwords are hashed using industry-standard algorithms and never stored in plain text.",
      "Regular security audits are conducted to detect and prevent vulnerabilities.",
      "Access to sensitive data is limited based on roles: Students, Club Admins, College Admins, Journalists, and Researchers.",
    ],
  },
  {
    title: "Your Rights",
    content: [
      "Access: View all personal data stored on CampusConnect through your account.",
      "Correction: Update your personal information to keep it accurate and current.",
      "Deletion: Request removal of your account and all associated data.",
      "Export: Request a complete export of your data in a portable format.",
    ],
  },
  {
    title: "Cookies and Tracking",
    content: [
      "Essential cookies maintain your session and platform preferences.",
      "Analytics cookies help us understand platform usage and improve the user experience.",
      "You may manage or disable cookies through your browser settings, though some platform features may be limited.",
    ],
  },
  {
    title: "Changes to This Policy",
    content: [
      "CampusConnect may update this Privacy Policy periodically to reflect changes in platform features or legal requirements.",
      "Significant changes will be communicated via email and/or prominent notice on the platform.",
      "Continued use of CampusConnect after updates indicates acceptance of the revised policy.",
    ],
  },
];

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: March 28, 2026</p>

          {/* Single Card */}
          <Card className="shadow-medium bg-card">
            <CardHeader>
              <CardTitle className="text-2xl">CampusConnect Privacy Policy</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {sections.map((section, i) => (
                <div key={i}>
                  <h2 className="text-xl font-semibold text-foreground mb-2">{section.title}</h2>
                  {section.content.map((item, idx) => (
                    <p key={idx} className="text-muted-foreground leading-relaxed mb-1">
                      {item.startsWith("•") ? item : `• ${item}`}
                    </p>
                  ))}
                </div>
              ))}

              <p className="text-sm text-muted-foreground mt-6">
                By using CampusConnect, you acknowledge that you have read and understood this Privacy Policy. 
                For any questions, please contact our support team via the <a href="/contact" className="text-primary underline">Contact Page</a>.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicyPage;