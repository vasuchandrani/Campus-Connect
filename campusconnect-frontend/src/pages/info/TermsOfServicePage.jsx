import Navbar from "../../components/landing/Navbar";
import Footer from "../../components/landing/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";

const sections = [
  {
    title: "Acceptance of Terms",
    content: [
      "By accessing or using CampusConnect, you agree to be bound by these Terms of Service.",
      "These terms apply to all users including students, club administrators, journalists, reviewers, and college administrators.",
      "If you do not agree with any part of these terms, please do not use our platform."
    ],
  },
  {
    title: "User Accounts",
    content: [
      "You are responsible for maintaining the confidentiality of your account credentials.",
      "Provide accurate and complete information during registration.",
      "Each user may only maintain one account.",
      "College administrators are responsible for managing their institution's account and subscription."
    ],
  },
  {
    title: "Acceptable Use",
    content: [
      "You agree not to use the platform for any unlawful purpose.",
      "Do not post offensive, misleading, or inappropriate content.",
      "Do not impersonate others or attempt to gain unauthorized access to other accounts.",
      "Content posted must be relevant to campus activities and communications."
    ],
  },
  {
    title: "Content Ownership",
    content: [
      "You retain ownership of all content you create, including articles, research papers, and event descriptions.",
      "By posting content, you grant CampusConnect a non-exclusive license to display and distribute it within the platform as necessary for service operation."
    ],
  },
  {
    title: "Subscription & Payments",
    content: [
      "College administrators must maintain an active subscription to access platform features.",
      "Subscription fees are billed according to the selected plan.",
      "We reserve the right to modify pricing with 30 days' advance notice.",
      "Refunds are handled on a case-by-case basis."
    ],
  },
  {
    title: "Termination",
    content: [
      "We may suspend or terminate accounts that violate these terms.",
      "College administrators may cancel their subscription at any time; access continues until the end of the current billing period.",
      "Upon termination, your data will be retained for 30 days before deletion."
    ],
  },
  {
    title: "Limitation of Liability",
    content: [
      "CampusConnect is provided 'as is' without warranties of any kind.",
      "We are not liable for indirect, incidental, or consequential damages arising from platform use.",
      "Our total liability shall not exceed the amount paid by you in the 12 months preceding the claim."
    ],
  },
  {
    title: "Changes to Terms",
    content: [
      "We reserve the right to modify these terms at any time.",
      "Material changes will be communicated via email and/or platform notification at least 14 days before taking effect.",
      "Continued use after changes constitutes acceptance of the updated terms."
    ],
  },
];

const TermsOfServicePage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-2">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">Last updated: March 28, 2026</p>

          {/* Single Card */}
          <Card className="shadow-medium bg-card">
            <CardHeader>
              <CardTitle className="text-2xl">CampusConnect Terms of Service</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {sections.map((section, i) => (
                <div key={i}>
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    {i + 1}. {section.title}
                  </h2>
                  {section.content.map((item, idx) => (
                    <p key={idx} className="text-muted-foreground leading-relaxed mb-1">
                      • {item}
                    </p>
                  ))}
                </div>
              ))}

              <p className="text-sm text-muted-foreground mt-6">
                By using CampusConnect, you acknowledge that you have read and understood these Terms of Service. 
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

export default TermsOfServicePage;