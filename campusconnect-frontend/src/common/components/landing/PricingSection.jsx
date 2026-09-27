import React from "react";
import { Button } from "../ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/Card";
import { Check, Zap, Star, Crown } from "lucide-react";

const PricingSection = () => {
  const rawPlans = import.meta.env.VITE_SUBSCRIPTION_PLANS || "[]";

  const getSubscriptionPlans = () => {
    try {
      return JSON.parse(rawPlans);
    } catch (err) {
      console.error("Failed to parse VITE_SUBSCRIPTION_PLANS:", err);
      return [];
    }
  };

  const subscriptionPlans = getSubscriptionPlans();

  const iconMap = {
    basic: Zap,
    premium: Star,
    enterprise: Crown,
  };

  // Map icons safely
  subscriptionPlans.forEach((plan) => {
    plan.icon = iconMap[plan.id] || Zap;
    plan.popular = plan.isPopular;
  });

  return (
    <section
      id="pricing"
      className="py-24 bg-gradient-hero relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div
            className="inline-flex items-center px-4 py-1.5 rounded-full text-primary text-sm font-medium mb-4"
            style={{
              backgroundColor: "hsl(var(--primary) / 0.15)",
            }}
          >
            Pricing
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Simple, Transparent{" "}
            <span className="text-gradient-primary">Pricing</span>
          </h2>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your institution. All plans include a
            14-day free trial.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {subscriptionPlans.map((plan) => {
            const Icon = plan.icon;

            return (
              <Card
                key={plan.id}
                className={`relative overflow-visible transition-all duration-300 hover:shadow-lg ${
                  plan.popular
                    ? "border-primary shadow-md ring-2 ring-primary/20 md:-mt-4 md:mb-4"
                    : "hover:border-primary/40"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-bold tracking-wide">
                    Most Popular
                  </div>
                )}

                <CardHeader className="text-center pb-2">
                  <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>

                  <CardTitle className="text-xl">{plan.name}</CardTitle>

                  <CardDescription>
                    {plan.isLimited
                      ? "Perfect for small colleges"
                      : "For growing institutions"}
                  </CardDescription>

                  <div className="mt-4">
                    <span className="text-4xl font-extrabold text-foreground">
                      {plan.price}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="pt-4">
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2.5 text-sm text-foreground"
                      >
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 text-primary" />
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    asChild
                  >
                    <a href="/auth">Get Started</a>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
