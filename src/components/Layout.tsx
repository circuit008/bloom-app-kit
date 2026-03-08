import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut, Menu, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import pixelpodLogo from "@/assets/pixelpod-logo.png";
import { navRoutes, routes } from "@/config/routes";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-border/60 glass-strong">
        <div className="container flex h-14 items-center justify-between px-4 lg:px-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <img src={pixelpodLogo} alt="PixelPOD" className="h-8 w-8" />
            <span className="font-display text-lg font-bold text-gradient hidden sm:block">PixelPOD</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {navRoutes.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <item.icon className="h-3.5 w-3.5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:flex text-muted-foreground hover:text-foreground"
              onClick={handleLogout}
            >
              <LogOut className="mr-1.5 h-3.5 w-3.5" />
              Logout
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-8 w-8"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-border/60 bg-card animate-slide-up">
            <nav className="container px-4 py-3 space-y-0.5">
              {routes.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
              <button
                onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground w-full mt-1"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 lg:px-6 py-6 lg:py-8 max-w-7xl">
        {children}
      </main>
    </div>
  );
};
