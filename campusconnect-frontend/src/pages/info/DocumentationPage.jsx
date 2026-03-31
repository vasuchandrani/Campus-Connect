import { useState } from "react";
import Navbar from "../../components/landing/Navbar";
import Footer from "../../components/landing/Footer";
import { Book, Code, FileText, Zap, Users, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";

const docs = [
  {
    icon: Zap,
    title: "Getting Started",
    lastUpdated: "Mar 28, 2026",
    content: `
CampusConnect is easy to set up. Simply register your college, verify your institution, and invite clubs and student journalists.
- Step 1: Create an institution account.
- Step 2: Verify your college email domain.
- Step 3: Add clubs and designate club admins.
- Step 4: Approve student journalists and researchers.
Once done, your platform is ready for all campus communication and academic activities.
    `
  },
  {
    icon: Users,
    title: "User Management",
    lastUpdated: "Mar 27, 2026",
    content: `
Manage users effectively:
- **College Admin:** Oversees the institution, approves clubs, journalists, and researchers.
- **Club Admin:** Manages the club profile, members, announcements, and events.
- **Students:** Subscribe to clubs, follow relevant sections, register for events, submit research papers, and read the digital newspaper.
- **Journalists:** Collect and publish campus news and maintain newspaper quality.
Role-based access ensures that everyone sees only what’s relevant.
    `
  },
  {
    icon: Code,
    title: "API Reference",
    lastUpdated: "Mar 25, 2026",
    content: `
CampusConnect provides a REST API for integration with your existing campus systems:
- **Authentication:** Token-based authentication for secure access.
- **Users Endpoint:** Create, update, or fetch user information.
- **Clubs Endpoint:** Manage clubs, members, announcements, and events.
- **Research Endpoint:** Submit and review research papers programmatically.
- **Notifications Endpoint:** Send real-time updates to subscribed users.
Refer to the API docs for request/response formats.
    `
  },
  {
    icon: Book,
    title: "Club Management",
    lastUpdated: "Mar 26, 2026",
    content: `
Clubs can manage their members, announcements, and events easily:
- Create a club with verified admin credentials.
- Add and remove members, assign roles.
- Post announcements targeted to specific students or groups.
- Organize events with pre-filled registration details.
- Track member engagement and event participation.
    `
  },
  {
    icon: FileText,
    title: "Research Portal",
    lastUpdated: "Mar 24, 2026",
    content: `
The research portal enables students to submit academic papers monthly:
- Submit research papers for review by verified reviewers.
- Track approval and feedback status.
- Approved papers are published in the monthly university research collection.
- Provides a centralized hub for student research visibility and academic recognition.
    `
  },
  {
    icon: Shield,
    title: "Security & Privacy",
    lastUpdated: "Mar 23, 2026",
    content: `
CampusConnect ensures data security and privacy:
- Role-based access for all users.
- Verified institution-based accounts prevent unauthorized access.
- Secure storage and encrypted communication for sensitive information.
- Regular audits and compliance with best practices in academic data handling.
    `
  },
];

const DocumentationPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredDocs = docs.filter((doc) =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">CampusConnect Documentation</h1>
          <p className="text-muted-foreground text-lg">
            Everything you need to get started, manage users, clubs, and maximize your CampusConnect experience.
          </p>
          <div className="mt-4">
            <Input
              placeholder="Search Documentation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md mx-auto"
            />
          </div>
        </div>

        {/* Table of Contents */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Table of Contents</h2>
          <ul className="list-disc list-inside space-y-2 text-primary cursor-pointer">
            {filteredDocs.map((doc) => (
              <li key={doc.title}>
                <a href={`#${doc.title.replace(/\s+/g, "-")}`}>{doc.title}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Documentation Sections */}
        <div className="space-y-8">
          {filteredDocs.map((doc) => (
            <Card key={doc.title} id={doc.title.replace(/\s+/g, "-")} className="shadow-soft">
              <CardHeader className="flex items-center gap-3 pb-2">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <doc.icon className="w-5 h-5 text-primary" />
                </div>
                <CardTitle className="text-lg">{doc.title}</CardTitle>
                <span className="ml-auto text-xs text-muted-foreground">Last Updated: {doc.lastUpdated}</span>
              </CardHeader>
              <CardContent className="text-muted-foreground whitespace-pre-line">{doc.content}</CardContent>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DocumentationPage;