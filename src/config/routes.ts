import { Home, Palette, Wand2, Package, TrendingUp, Settings, Info, Mail, LucideIcon } from "lucide-react";

export interface RouteConfig {
  name: string;
  href: string;
  icon: LucideIcon;
  showInNav?: boolean;
}

export const routes: RouteConfig[] = [
  { name: "Home", href: "/", icon: Home, showInNav: true },
  { name: "Design Studio", href: "/design-studio", icon: Palette, showInNav: true },
  { name: "AI Tools", href: "/ai-tools", icon: Wand2, showInNav: true },
  { name: "Products", href: "/products", icon: Package, showInNav: true },
  { name: "Analytics", href: "/analytics", icon: TrendingUp, showInNav: true },
  { name: "About", href: "/about", icon: Info, showInNav: false },
  { name: "Contact", href: "/contact", icon: Mail, showInNav: false },
  { name: "Settings", href: "/settings", icon: Settings, showInNav: true },
];

export const navRoutes = routes.filter((r) => r.showInNav);
