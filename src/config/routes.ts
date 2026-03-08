import { Home, LayoutDashboard, History, CreditCard, Info, ScanSearch, LucideIcon } from "lucide-react";

export interface RouteConfig {
  name: string;
  href: string;
  icon: LucideIcon;
  showInNav?: boolean;
  requiresAuth?: boolean;
}

export const routes: RouteConfig[] = [
  { name: "Home", href: "/", icon: Home, showInNav: true, requiresAuth: false },
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, showInNav: true, requiresAuth: true },
  { name: "Scan History", href: "/scan-history", icon: History, showInNav: true, requiresAuth: true },
  { name: "Pricing", href: "/pricing", icon: CreditCard, showInNav: true, requiresAuth: false },
  { name: "About", href: "/about", icon: Info, showInNav: true, requiresAuth: false },
];

export const navRoutes = routes.filter((r) => r.showInNav);
