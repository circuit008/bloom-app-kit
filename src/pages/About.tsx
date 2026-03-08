import { Shield, Target, Users, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const values = [
  {
    icon: Shield,
    title: "Trust & Safety",
    description: "We help POD sellers protect their businesses from costly IP disputes and takedowns.",
  },
  {
    icon: Target,
    title: "Accuracy",
    description: "Our scanning engine is continuously improved to reduce false positives and catch real issues.",
  },
  {
    icon: Users,
    title: "Community",
    description: "Built by POD sellers, for POD sellers. We understand the challenges of this industry.",
  },
  {
    icon: Zap,
    title: "Speed",
    description: "Get compliance results in seconds, not hours. Launch your products with confidence.",
  },
];

export default function About() {
  return (
    <div className="container py-16 space-y-16">
      <div className="max-w-2xl mx-auto text-center space-y-4">
        <h1 className="text-4xl font-bold">About POD Guard</h1>
        <p className="text-lg text-muted-foreground">
          We're on a mission to help print-on-demand sellers launch compliant,
          high-quality products — without the legal headaches.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {values.map((v) => (
          <Card key={v.title}>
            <CardContent className="pt-6 space-y-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <v.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">{v.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{v.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
