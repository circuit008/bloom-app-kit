import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started",
    features: ["5 scans per month", "Basic IP check", "Quality validation", "Email support"],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "per month",
    description: "For serious POD sellers",
    features: ["Unlimited scans", "Advanced IP detection", "Accessibility audit", "Priority support", "Scan history & reports", "API access"],
    cta: "Start Pro Trial",
    highlighted: true,
  },
  {
    name: "Business",
    price: "$49",
    period: "per month",
    description: "For teams and agencies",
    features: ["Everything in Pro", "Team collaboration", "Bulk scanning", "Custom rules", "Dedicated account manager", "SSO & advanced security"],
    cta: "Contact Sales",
    highlighted: false,
  },
];

export default function Pricing() {
  return (
    <div className="container py-16 space-y-12">
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-bold">Simple, transparent pricing</h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Choose the plan that fits your needs. Upgrade or downgrade anytime.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={cn(
              "relative flex flex-col",
              plan.highlighted && "border-primary shadow-lg ring-1 ring-primary/20"
            )}
          >
            {plan.highlighted && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                Most Popular
              </div>
            )}
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{plan.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{plan.description}</p>
              <div className="mt-3">
                <span className="text-4xl font-extrabold">{plan.price}</span>
                <span className="text-muted-foreground ml-1 text-sm">/{plan.period}</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <ul className="space-y-2.5 flex-1 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                className="w-full"
                variant={plan.highlighted ? "default" : "outline"}
              >
                {plan.cta}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
