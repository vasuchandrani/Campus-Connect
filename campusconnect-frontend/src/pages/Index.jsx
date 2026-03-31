import React from "react";
import Navbar from "../components/landing/Navbar";
import HeroSection from "../components/landing/HeroSection";
import FeaturesSection from "../components/landing/FeaturesSection";
import UserRolesSection from "../components/landing/UserRolesSection";
import HowItWorksSection from "../components/landing/HowItWorksSection";
import CTASection from "../components/landing/CTASection";
import Footer from "../components/landing/Footer";
import PricingSection from "../components/landing/PricingSection";


const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <UserRolesSection />
        <HowItWorksSection />
        <PricingSection />
        <CTASection />
        
      </main>
      <Footer />
    </div>
  );
};

export default Index;
