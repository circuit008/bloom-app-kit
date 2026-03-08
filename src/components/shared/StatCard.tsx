import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
}

export function StatCard({ label, value, icon: Icon, trend, trendUp }: StatCardProps) {
  return (
    <Card className="p-5 hover:shadow-medium transition-shadow duration-300">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        {trend && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            trendUp ? "bg-accent/10 text-accent" : "text-muted-foreground bg-muted"
          }`}>
            {trend}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="font-display text-2xl">{value}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
      </div>
    </Card>
  );
}
