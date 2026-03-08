import { Check, ArrowRight, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started",
    features: [
      "5 scans per month",
      "Basic IP check",
      "Quality validation",
      "Accessibility audit",
      "Email support",
    ],
    cta: "Get Started",
    highlighted: false,
    tier: "free",
  },
  {
    name: "Pro",
    price: "$9.99",
    period: "per month",
    description: "For serious POD sellers",
    features: [
      "Unlimited scans",
      "Full 4-step compliance",
      "PDF compliance reports",
      "Priority support",
      "Scan history & analytics",
      "Supply chain transparency",
      "Affiliate earnings tracking",
    ],
    cta: "Upgrade to Pro",
    highlighted: true,
    tier: "pro",
  },
  {
    name: "Business",
    price: "$49",
    period: "per month",
    description: "For teams and agencies",
    features: [
      "Everything in Pro",
      "Team collaboration",
      "Bulk scanning",
      "Custom trademark rules",
      "Dedicated account manager",
      "SSO & advanced security",
      "API access",
    ],
    cta: "Contact Sales",
    highlighted: false,
    tier: "business",
  },
];

export default function Pricing() {
  const { user } = useAuth();
  const { profile, isPro, upgrade } = useProfile();
  const navigate = useNavigate();

  const handleCta = async (tier: string) => {
    if (!user) {
      navigate("/");
      toast.info("Please sign in first to choose a plan.");
      return;
    }
    if (tier === "free") {
      navigate("/dashboard");
    } else if (tier === "pro") {
      if (isPro) {
        toast.info("You're already on the Pro plan!");
        return;
      }
      await upgrade();
      toast.success("🎉 Upgraded to Pro! Enjoy unlimited scans and premium features.");
      navigate("/dashboard");
    } else {
      toast.info("Business plans are coming soon. Contact us for early access.");
    }
  };

  return (
    <div className="container py-16 space-y-12">
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-bold">Simple, transparent pricing</h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Choose the plan that fits your needs. Upgrade or downgrade anytime.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map((plan) => {
          const isCurrent = profile?.subscription_status === plan.tier;
          return (
            <Card
              key={plan.name}
              className={cn(
                "relative flex flex-col",
                plan.highlighted && "border-primary shadow-lg ring-1 ring-primary/20"
              )}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                  <Zap className="h-3 w-3" /> Most Popular
                </div>
              )}
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  {plan.name}
                  {isCurrent && (
                    <Badge variant="outline" className="text-xs">Current Plan</Badge>
                  )}
                </CardTitle>
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
                  disabled={isCurrent}
                  onClick={() => handleCta(plan.tier)}
                >
                  {isCurrent ? "Current Plan" : plan.cta}
                  {!isCurrent && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center text-sm text-muted-foreground space-y-1">
        <p>All plans include a 14-day money-back guarantee.</p>
        <p>
          <a href="#" className="underline">Privacy Policy</a> · <a href="#" className="underline">Terms of Service</a>
        </p>
      </div>
    </div>
  );
}
