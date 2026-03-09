import { Link } from "react-router-dom";
import { Shield, Github, Linkedin, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function Footer() {
  return (
    <footer className="border-t bg-card print:hidden" role="contentinfo">
      <div className="container py-10 space-y-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-3">
            <Link to="/" className="flex items-center gap-2" aria-label="POD Guard Home">
              <Shield className="h-6 w-6 text-primary" aria-hidden="true" />
              <span className="text-lg font-extrabold tracking-tight">
                POD <span className="text-primary">Guard</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              4-step compliance scanning for print-on-demand sellers. Protect your designs before you sell.
            </p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" aria-hidden="true" />
              Built in Montréal 🇨🇦
            </div>
          </div>

          {/* Product */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Product</h3>
            <nav className="flex flex-col gap-2 text-sm text-muted-foreground" aria-label="Product links">
              <Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
              <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
              <Link to="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
              <Link to="/scan" className="hover:text-foreground transition-colors">New Scan</Link>
            </nav>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Legal</h3>
            <nav className="flex flex-col gap-2 text-sm text-muted-foreground" aria-label="Legal links">
              <Link to="/terms" className="hover:text-foreground transition-colors">Terms & Conditions</Link>
              <Link to="/dmca" className="hover:text-foreground transition-colors">DMCA Takedown Policy</Link>
              <Link to="/about#privacy-heading" className="hover:text-foreground transition-colors">Privacy Policy</Link>
              <Link to="/about#compliance-heading" className="hover:text-foreground transition-colors">Compliance Standards</Link>
            </nav>
          </div>

          {/* Connect */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Connect</h3>
            <div className="flex gap-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center hover:bg-accent transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center hover:bg-accent transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-2">
              <Badge variant="outline" className="text-xs">React</Badge>
              <Badge variant="outline" className="text-xs">TypeScript</Badge>
              <Badge variant="outline" className="text-xs">Lovable Cloud</Badge>
              <Badge variant="outline" className="text-xs">Tailwind CSS</Badge>
            </div>
          </div>
        </div>

        <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} POD Guard. All rights reserved.</p>
          <p>A college capstone project — built with ❤️ in Montréal</p>
        </div>
      </div>
    </footer>
  );
}
