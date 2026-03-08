import { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, icon: Icon, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
          )}
          <h1 className="font-display text-3xl lg:text-4xl">{title}</h1>
        </div>
        {description && (
          <p className="text-muted-foreground text-base pl-0 sm:pl-[52px]">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 mt-4 sm:mt-0">{actions}</div>}
    </div>
  );
}
