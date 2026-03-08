import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, actionHref, onAction }: EmptyStateProps) {
  return (
    <Card className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-5">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h2 className="font-display text-xl mb-2">{title}</h2>
      <p className="text-muted-foreground max-w-sm mb-6">{description}</p>
      {actionLabel && (
        actionHref ? (
          <Button asChild variant="outline">
            <Link to={actionHref}>{actionLabel}</Link>
          </Button>
        ) : (
          <Button variant="outline" onClick={onAction}>{actionLabel}</Button>
        )
      )}
    </Card>
  );
}
