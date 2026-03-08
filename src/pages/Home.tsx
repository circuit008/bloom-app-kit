import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Sparkles, Zap, TrendingUp, Package, Palette, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import { FeatureCard } from "@/components/shared/FeatureCard";
import pixelpodLogo from "@/assets/pixelpod-logo.png";

const features = [
  { icon: Sparkles, title: "AI Design Generation", description: "Generate unique t-shirt designs using cutting-edge AI models" },
  { icon: Palette, title: "Design Studio", description: "Professional canvas editor for customizing and refining your designs" },
  { icon: Upload, title: "Instant Upload", description: "One-click upload to Shopify with optimized product listings" },
  { icon: TrendingUp, title: "Trend Analytics", description: "Stay ahead with real-time market trends and insights" },
  { icon: Package, title: "POD Integration", description: "Seamless Printful/Printify integration for automated fulfillment" },
  { icon: Zap, title: "SEO Optimization", description: "AI-powered product descriptions and SEO-ready content" },
];

const steps = [
  { step: "01", title: "Ideate & Generate", desc: "Use AI to create unique designs" },
  { step: "02", title: "Edit & Refine", desc: "Perfect your design in our studio" },
  { step: "03", title: "Optimize & Upload", desc: "AI-powered SEO and instant sync" },
  { step: "04", title: "Market & Sell", desc: "Launch with proven templates" },
  { step: "05", title: "Fulfill Orders", desc: "Automatic POD printing & shipping" },
  { step: "06", title: "Analyze & Scale", desc: "Track trends and grow your business" },
];

export default function Home() {
  return (
    <div className="space-y-20 pb-12">
      {/* Hero */}
      <section className="relative pt-12 lg:pt-20 text-center max-w-4xl mx-auto">
        <div className="mb-6 animate-float">
          <img src={pixelpodLogo} alt="PixelPOD" className="h-20 w-20 mx-auto rounded-2xl shadow-glow" />
        </div>
        <h1 className="font-display text-5xl lg:text-7xl mb-5 text-gradient leading-tight">
          PixelPOD
        </h1>
        <p className="text-xl lg:text-2xl text-muted-foreground mb-4 max-w-2xl mx-auto">
          Transform Ideas into Profit with AI-Powered Print-on-Demand
        </p>
        <p className="text-base text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
          Design, optimize, and sell custom t-shirts with our intelligent platform. 
          From AI generation to Shopify integration — your complete creative workflow.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg" className="text-base px-8 shadow-glow">
            <Link to="/design-studio">
              Start Designing <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="text-base px-8">
            <Link to="/ai-tools">Explore AI Tools</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section>
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl lg:text-4xl mb-3">Everything You Need</h2>
          <p className="text-muted-foreground text-lg">A complete toolkit for modern POD entrepreneurs</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <FeatureCard key={i} {...f} />
          ))}
        </div>
      </section>

      {/* Workflow */}
      <section>
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl lg:text-4xl mb-3">Your Complete Workflow</h2>
          <p className="text-muted-foreground text-lg">From concept to customer in 6 steps</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {steps.map((item, i) => (
            <div key={i} className="text-center animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="w-14 h-14 rounded-2xl bg-gradient-primary text-primary-foreground flex items-center justify-center text-xl font-display font-bold mx-auto mb-4 shadow-glow">
                {item.step}
              </div>
              <h3 className="font-display text-base font-semibold mb-1">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section>
        <Card className="p-10 lg:p-14 text-center bg-gradient-primary border-0 shadow-glow overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-foreground/5 to-transparent" />
          <div className="relative z-10">
            <h2 className="font-display text-3xl lg:text-4xl text-primary-foreground mb-3">
              Ready to Launch Your POD Empire?
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-8 max-w-lg mx-auto">
              Join thousands of creators making profits with PixelPOD
            </p>
            <Button asChild size="lg" variant="secondary" className="text-base px-8 font-semibold">
              <Link to="/design-studio">
                Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </Card>
      </section>
    </div>
  );
}
