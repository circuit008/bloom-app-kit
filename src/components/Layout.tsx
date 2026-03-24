import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Moon, Sun, LogOut, User, ChevronDown, Shield, Globe } from "lucide-react";
import { Footer } from "./Footer";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { navRoutes } from "@/config/routes";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/hooks/useLanguage";
import { AuthModal } from "./AuthModal";
import type { TranslationKey } from "@/i18n/translations";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    toast.success(lang === "fr" ? "Déconnexion réussie" : "Logged out successfully");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-lg">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <Shield className="h-7 w-7 text-primary" />
            <span className="text-xl font-extrabold tracking-tight">
              POD <span className="text-primary">Guard</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navRoutes.map((item) => {
              const isActive = location.pathname === item.href;
              const label = item.nameKey ? t(item.nameKey as TranslationKey) : item.name;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {/* Language toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLang(lang === "en" ? "fr" : "en")}
              className="h-9 px-2 text-xs font-medium"
              aria-label="Toggle language"
            >
              <Globe className="h-4 w-4 mr-1" />
              {lang === "en" ? "🇬🇧 EN" : "🇫🇷 FR"}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9"
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 text-sm font-medium">
                    <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <span className="hidden sm:inline max-w-[120px] truncate">
                      {user.email?.split("@")[0]}
                    </span>
                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5">
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                    {t("dashboard")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/scan-history")}>
                    {t("scanHistory")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/design-history")}>
                    {t("designHistory")}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    {t("signOut")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setAuthModalOpen(true)}>
                  {t("signIn")}
                </Button>
                <Button size="sm" onClick={() => setAuthModalOpen(true)}>
                  {t("getStarted")}
                </Button>
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-11 w-11"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden border-t bg-background animate-slide-up">
            <nav className="container py-4 space-y-1">
              {navRoutes.map((item) => {
                const isActive = location.pathname === item.href;
                const label = item.nameKey ? t(item.nameKey as TranslationKey) : item.name;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {label}
                  </Link>
                );
              })}
              {user ? (
                <button
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-destructive hover:bg-accent w-full"
                >
                  <LogOut className="h-4 w-4" />
                  {t("signOut")}
                </button>
              ) : (
                <button
                  onClick={() => { setAuthModalOpen(true); setMobileMenuOpen(false); }}
                  className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-primary hover:bg-accent w-full"
                >
                  {t("signIn")} / {t("getStarted")}
                </button>
              )}
            </nav>
          </div>
        )}
      </header>

      <main id="main-content">{children}</main>
      <Footer />
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </div>
  );
};
