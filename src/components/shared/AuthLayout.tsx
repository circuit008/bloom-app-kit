import pixelpodLogo from "@/assets/pixelpod-logo.png";
import { Link } from "react-router-dom";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-primary relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-primary-foreground/20 blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-primary-foreground/10 blur-3xl" />
        </div>
        <div className="relative z-10 text-center px-12">
          <img src={pixelpodLogo} alt="PixelPOD" className="h-20 w-20 mx-auto mb-6 animate-float" />
          <h1 className="font-display text-4xl text-primary-foreground mb-3">PixelPOD</h1>
          <p className="text-primary-foreground/80 text-lg max-w-md">
            AI-powered print-on-demand studio. Design, optimize, and sell — all in one place.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <img src={pixelpodLogo} alt="PixelPOD" className="h-8 w-8" />
            <span className="font-display text-xl text-gradient">PixelPOD</span>
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
