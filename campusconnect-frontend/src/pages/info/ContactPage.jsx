import React from "react";
import Navbar from "../../components/landing/Navbar";
import Footer from "../../components/landing/Footer";
import { MapPin, Mail, Phone } from "lucide-react";

const ContactPage = () => {
  const contactDetails = [
    { icon: MapPin, title: "Address", detail: "123 Innovation Hub, Tech Park, Bangalore, India 560001" },
    { icon: Mail, title: "Email", detail: "hello@campusconnect.com" },
    { icon: Phone, title: "Phone", detail: "+91 1800-123-4567" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-4">Contact Us</h1>
          <p className="text-muted-foreground text-lg mb-10">Have questions? We'd love to hear from you.</p>
          <div className="space-y-6">
            {contactDetails.map((c) => {
              const Icon = c.icon;
              return (
                <div key={c.title} className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{c.title}</h3>
                    <p className="text-muted-foreground text-sm">{c.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ContactPage;