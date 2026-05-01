import React, { useState } from "react";
import { Button } from "../ui/Button";
import { ArrowRight, Sparkles } from "lucide-react";

const CTASection = () => {
  const [showVideo, setShowVideo] = useState(false);
  return (
    <section className="py-24 bg-gradient-hero relative overflow-hidden">

      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">

          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Ready to Transform Your <br />
            <span className="text-gradient-primary">
              Campus Communication?
            </span>
          </h2>

          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
            Join hundreds of colleges already using CampusConnect to build
            stronger communities and amplify student voices.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="hero" size="xl" asChild>
              <a href="/auth">
                Start
                <ArrowRight className="w-5 h-5" />
              </a>
            </Button>

            <Button
              variant="hero-outline"
              size="xl"
              onClick={() => setShowVideo(true)}
            >
              Watch Demo
            </Button>
          </div>

        </div>
      </div>

      {showVideo && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="relative w-[90%] md:w-[800px] bg-black rounded-xl overflow-hidden shadow-xl">

            <button
              className="absolute top-2 right-3 text-white text-2xl z-10"
              onClick={() => setShowVideo(false)}
            >
              ✕
            </button>

            <iframe
  className="w-full h-[500px]"
  src="https://drive.google.com/file/d/1tBYrTQ13bBBB32nB8N_UMBczI57JWAij/preview"
  allow="autoplay"
  allowFullScreen
></iframe>

          </div>
        </div>
      )}
    </section>
  );
};





export default CTASection;
