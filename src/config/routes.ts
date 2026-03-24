import { Home, LayoutDashboard, History, CreditCard, Info, ScanSearch, Layers, TrendingUp, LucideIcon } from "lucide-react";

export interface RouteConfig {
  name: string;
  nameKey?: string;
  href: string;
  icon: LucideIcon;
  showInNav?: boolean;
  requiresAuth?: boolean;
}

export const routes: RouteConfig[] = [
  { name: "Home", nameKey: "home", href: "/", icon: Home, showInNav: true, requiresAuth: false },
  { name: "Dashboard", nameKey: "dashboard", href: "/dashboard", icon: LayoutDashboard, showInNav: true, requiresAuth: true },
  { name: "New Scan", nameKey: "newScan", href: "/scan", icon: ScanSearch, showInNav: true, requiresAuth: true },
  { name: "Batch Scan", nameKey: "batchScan", href: "/batch-scan", icon: Layers, showInNav: true, requiresAuth: true },
  { name: "Scan History", nameKey: "scanHistory", href: "/scan-history", icon: History, showInNav: true, requiresAuth: true },
  { name: "Design History", nameKey: "designHistory", href: "/design-history", icon: TrendingUp, showInNav: true, requiresAuth: true },
  { name: "Pricing", nameKey: "pricing", href: "/pricing", icon: CreditCard, showInNav: true, requiresAuth: false },
  { name: "About", nameKey: "about", href: "/about", icon: Info, showInNav: true, requiresAuth: false },
];

export const navRoutes = routes.filter((r) => r.showInNav);
