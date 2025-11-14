import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, FileText, Mail, Settings, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Product Descriptions", href: "/product-descriptions", icon: FileText },
  { name: "Recovery Campaigns", href: "/recovery-campaigns", icon: Mail },
  { name: "Settings", href: "/settings", icon: Settings },
];

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-card">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-2 border-b border-border px-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-foreground">ShopBoost AI</span>
              <span className="text-xs text-muted-foreground">Growth Assistant</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-glow"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-border p-4">
            <div className="rounded-lg bg-gradient-card p-3">
              <p className="text-xs font-medium text-foreground">AI Credits</p>
              <p className="text-2xl font-bold text-primary">1,247</p>
              <p className="text-xs text-muted-foreground">Remaining this month</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="pl-64">
        <div className="container mx-auto p-8">{children}</div>
      </main>
    </div>
  );
};
