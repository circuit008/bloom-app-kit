import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <Card className="group p-6 hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 border-border/50">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/15 transition-colors mb-4">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h3 className="font-display text-lg mb-1.5">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </Card>
  );
}
