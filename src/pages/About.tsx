import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette, Sparkles, Zap, Users } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { FeatureCard } from "@/components/shared/FeatureCard";
import { Info } from "lucide-react";

const features = [
  { icon: Palette, title: "Design Studio", description: "Create stunning t-shirt designs with our intuitive canvas editor and AI-powered design generation." },
  { icon: Sparkles, title: "AI Tools", description: "Remove backgrounds, enhance images, and generate SEO-optimized content with our AI-powered tools." },
  { icon: Zap, title: "Seamless Integration", description: "Upload your designs directly to Shopify with just one click. No manual work required." },
  { icon: Users, title: "Built for Creators", description: "We understand the challenges of running a print-on-demand business and built PixelPOD to solve them." },
];

const benefits = [
  { label: "Free AI Tools", desc: "Access powerful AI features without expensive subscriptions" },
  { label: "No Design Experience Needed", desc: "Create professional designs with intuitive tools" },
  { label: "Direct Shopify Integration", desc: "Streamline your workflow from design to sale" },
  { label: "Save & Organize", desc: "Build your design library and reuse your best work" },
];

export default function About() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <PageHeader icon={Info} title="About PixelPOD" description="Your AI-powered print-on-demand design studio" />

      <Card>
        <CardHeader>
          <CardTitle className="font-display">Our Mission</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-muted-foreground leading-relaxed">
          <p>PixelPOD is revolutionizing the print-on-demand industry by combining cutting-edge AI technology with intuitive design tools.</p>
          <p>Our platform eliminates the technical barriers of design, allowing you to focus on what matters most — your creativity and business growth.</p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {features.map((f, i) => (
          <FeatureCard key={i} {...f} />
        ))}
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="font-display">Why Choose PixelPOD?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {benefits.map((b, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">{b.label}:</strong> {b.desc}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
