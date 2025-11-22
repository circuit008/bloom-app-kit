import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Sparkles, Zap, TrendingUp, Package, Palette, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import pixelpodLogo from "@/assets/pixelpod-logo.png";

export default function Home() {
  const features = [
    {
      icon: Sparkles,
      title: "AI Design Generation",
      description: "Generate unique t-shirt designs using cutting-edge AI technology"
    },
    {
      icon: Palette,
      title: "Design Studio",
      description: "Professional canvas editor for customizing and refining your designs"
    },
    {
      icon: Upload,
      title: "Instant Upload",
      description: "One-click upload to Shopify with optimized product listings"
    },
    {
      icon: TrendingUp,
      title: "Trend Analytics",
      description: "Stay ahead with real-time market trends and insights"
    },
    {
      icon: Package,
      title: "POD Integration",
      description: "Seamless Printful/Printify integration for automated fulfillment"
    },
    {
      icon: Zap,
      title: "SEO Optimization",
      description: "AI-powered product descriptions and SEO-ready content"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 lg:py-32">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <div className="mb-8 animate-float">
            <img src={pixelpodLogo} alt="PixelPOD" className="h-24 w-24 mx-auto" />
          </div>
          <h1 className="text-5xl lg:text-7xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            PixelPOD
          </h1>
          <p className="text-xl lg:text-2xl text-muted-foreground mb-8 max-w-2xl">
            Transform Ideas into Profit with AI-Powered Print-on-Demand
          </p>
          <p className="text-lg text-muted-foreground mb-12 max-w-3xl">
            Design, optimize, and sell custom t-shirts with our intelligent POD platform. 
            From AI generation to Shopify integration – your complete creative workflow.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg" className="text-lg px-8 shadow-glow">
              <Link to="/design-studio">
                Start Designing
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg px-8">
              <Link to="/ai-tools">
                Explore AI Tools
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Everything You Need to Succeed</h2>
          <p className="text-xl text-muted-foreground">
            A complete toolkit for modern print-on-demand entrepreneurs
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-card border-border/50"
            >
              <div className="flex flex-col items-start">
                <div className="p-3 rounded-lg bg-primary/10 mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Workflow Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Your Complete POD Workflow</h2>
          <p className="text-xl text-muted-foreground">
            From concept to customer in 6 simple steps
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            { step: "01", title: "Ideate & Generate", desc: "Use AI to create unique designs" },
            { step: "02", title: "Edit & Refine", desc: "Perfect your design in our studio" },
            { step: "03", title: "Optimize & Upload", desc: "AI-powered SEO and instant Shopify sync" },
            { step: "04", title: "Market & Sell", desc: "Launch with proven marketing templates" },
            { step: "05", title: "Fulfill Orders", desc: "Automatic POD printing & shipping" },
            { step: "06", title: "Analyze & Scale", desc: "Track trends and grow your business" }
          ].map((item, index) => (
            <div key={index} className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mb-4 shadow-glow">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
              {index < 5 && (
                <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-primary to-accent -z-10" 
                     style={{ width: 'calc(100% - 4rem)' }} />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="p-12 text-center bg-gradient-primary text-primary-foreground border-0 shadow-glow">
          <h2 className="text-4xl font-bold mb-4">Ready to Launch Your POD Empire?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of creators making profits with PixelPOD
          </p>
          <Button asChild size="lg" variant="secondary" className="text-lg px-8">
            <Link to="/design-studio">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </Card>
      </section>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}