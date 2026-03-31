import React from "react";
import Navbar from "../../components/landing/Navbar";
import Footer from "../../components/landing/Footer";
import { GraduationCap, Target, Heart, Lightbulb } from "lucide-react";

const values = [
  { icon: Target, title: "Our Mission", desc: "To unify campus communication and empower every student, club, and institution to thrive through seamless digital collaboration." },
  { icon: Lightbulb, title: "Innovation", desc: "We continuously evolve our platform with cutting-edge technology to meet the changing needs of modern campuses." },
  { icon: Heart, title: "Community First", desc: "Every feature we build is designed to strengthen the bonds within and across college communities." },
];

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">About CampusConnect</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              CampusConnect is a comprehensive platform built to transform how colleges communicate, collaborate, and grow. We bridge the gap between students, clubs, journalists, and administrators.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {values.map((v) => {
              const Icon = v.icon;
              return (
                <div key={v.title} className="text-center">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{v.title}</h3>
                  <p className="text-muted-foreground text-sm">{v.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="bg-muted/50 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-3">Our Story</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Founded by a team passionate about education technology, CampusConnect started as a simple idea — what if every college had a single platform for all campus activities? Today, we serve institutions across the country, helping them streamline club management, event coordination, campus journalism, and academic research collaboration.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;