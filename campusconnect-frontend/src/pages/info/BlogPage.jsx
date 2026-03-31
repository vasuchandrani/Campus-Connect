import React from "react";
import Navbar from "../../components/landing/Navbar";
import Footer from "../../components/landing/Footer";


const BlogPage = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="container mx-auto px-4 pt-24 pb-16 max-w-3xl">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-foreground mb-4">CampusConnect: Revolutionizing Campus Life</h1>
        <p className="text-muted-foreground text-lg">
          How CampusConnect is helping colleges unify communication, boost engagement, and foster academic excellence.
        </p>
      </div>

      {/* Blog Post */}
      <article className="bg-card p-8 rounded-2xl shadow-soft text-foreground space-y-6">
        <p>
          Colleges today face a major challenge: communication and engagement are scattered across emails, notice boards, and social apps. Students often miss important announcements, clubs struggle to reach members, and academic contributions go unnoticed.
        </p>

        <p>
          CampusConnect addresses this by providing a single platform for all campus activities. From club announcements and event registrations to research paper submissions and a university-wide digital newspaper, everything is centralized and easily accessible.
        </p>

        <h2 className="text-2xl font-semibold mt-6">Key Features</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>📰 <strong>University Digital Newspaper:</strong> Managed by student journalists to deliver campus news daily.</li>
          <li>📚 <strong>Research Paper Submissions:</strong> Monthly publishing system for students to showcase academic work.</li>
          <li>🎯 <strong>Interest-Based Club Updates:</strong> Students follow only the clubs and sections relevant to them.</li>
          <li>🔔 <strong>Real-Time Notifications:</strong> Never miss announcements or events.</li>
          <li>📝 <strong>Dynamic Event Registration:</strong> Quick and easy sign-ups with pre-filled details.</li>
          <li>🔐 <strong>Verified Access:</strong> Role-based login for colleges, clubs, journalists, researchers, and students.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6">Why CampusConnect Matters</h2>
        <p>
          By centralizing communication, CampusConnect strengthens student engagement, encourages academic collaboration, and ensures that every announcement, event, and research work reaches the right audience. Colleges can focus on growth and innovation while students stay informed and connected.
        </p>

        <p className="italic">
          "Code. Create. Empower." – CampusConnect.
        </p>
      </article>
    </main>
    <Footer />
  </div>
);

export default BlogPage;
