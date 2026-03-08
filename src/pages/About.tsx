import { Shield, Eye, Ruler, Leaf, Globe, Lock, FileText, Scale, Target, Users, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const checks = [
  {
    icon: Shield,
    title: "1. IP Copyright Check",
    description: "Scans your design keywords against a multi-source trademark database (USPTO, EUIPO, CIPO, and community reports). Weighted confidence scoring ensures official sources carry more weight.",
    details: ["5,000+ trademarks from 4 international sources", "Weighted risk scoring by source confidence", "Real-time database with community reporting"],
  },
  {
    icon: Eye,
    title: "2. Accessibility Audit",
    description: "Analyzes your design for WCAG 2.1 compliance including contrast ratios, colorblind simulation, and dominant color extraction — all processed locally in your browser.",
    details: ["WCAG AA & AAA contrast checking", "Deuteranopia, Protanopia, Tritanopia simulation", "Dominant color palette extraction"],
  },
  {
    icon: Ruler,
    title: "3. Print Quality Validation",
    description: "Validates image dimensions and estimated DPI against product-specific requirements (t-shirts, mugs, posters, etc.) to ensure print-ready output.",
    details: ["Product-specific dimension requirements", "DPI estimation and validation", "Multiple product type support"],
  },
  {
    icon: Leaf,
    title: "4. Supply Chain Transparency",
    description: "Matches your region with certified eco-friendly printers holding GOTS, Fair Trade, OEKO-TEX, and other sustainability certifications.",
    details: ["Region-based printer matching", "Multi-certification verification", "Affiliate partnerships with ethical printers"],
  },
];

const compliance = [
  { region: "🇺🇸 United States", law: "ADA (Americans with Disabilities Act)", description: "Requires digital content to be accessible. WCAG 2.1 AA is the accepted standard for web accessibility compliance." },
  { region: "🇪🇺 European Union", law: "EN 301 549", description: "European accessibility standard aligned with WCAG 2.1. Required for public sector and increasingly for private sector digital products." },
  { region: "🇨🇦 Canada", law: "Bill 96 & AODA", description: "Quebec's Bill 96 requires French-language compliance. Ontario's AODA mandates WCAG 2.0 AA for large organizations." },
  { region: "🌍 Global", law: "WCAG 2.1", description: "The Web Content Accessibility Guidelines are the international benchmark for digital accessibility across all jurisdictions." },
];

const values = [
  { icon: Shield, title: "Trust & Safety", description: "We help POD sellers protect their businesses from costly IP disputes and takedowns." },
  { icon: Target, title: "Accuracy", description: "Our scanning engine is continuously improved to reduce false positives and catch real issues." },
  { icon: Users, title: "Community", description: "Built by POD sellers, for POD sellers. We understand the challenges of this industry." },
  { icon: Zap, title: "Speed", description: "Get compliance results in seconds, not hours. Launch your products with confidence." },
];

export default function About() {
  return (
    <div className="container py-16 space-y-16">
      {/* Hero */}
      <div className="max-w-2xl mx-auto text-center space-y-4">
        <h1 className="text-4xl font-bold">About POD Guard</h1>
        <p className="text-lg text-muted-foreground">
          We're on a mission to help print-on-demand sellers launch compliant,
          high-quality products — without the legal headaches.
        </p>
      </div>

      {/* Values */}
      <section aria-labelledby="values-heading">
        <h2 id="values-heading" className="text-2xl font-bold text-center mb-8">Our Values</h2>
        <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {values.map((v) => (
            <Card key={v.title}>
              <CardContent className="pt-6 space-y-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center" aria-hidden="true">
                  <v.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator />

      {/* 4 Compliance Checks */}
      <section aria-labelledby="checks-heading">
        <h2 id="checks-heading" className="text-2xl font-bold text-center mb-2">The 4-Step Compliance Check</h2>
        <p className="text-center text-muted-foreground mb-8 max-w-xl mx-auto">
          Every design goes through four rigorous checks before receiving a compliance score.
        </p>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {checks.map((c) => (
            <Card key={c.title}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <c.icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  {c.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{c.description}</p>
                <ul className="space-y-1">
                  {c.details.map((d) => (
                    <li key={d} className="text-xs text-muted-foreground flex items-start gap-2">
                      <span className="text-success mt-0.5">✓</span> {d}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator />

      {/* International Compliance */}
      <section aria-labelledby="compliance-heading">
        <h2 id="compliance-heading" className="text-2xl font-bold text-center mb-2">International Compliance Standards</h2>
        <p className="text-center text-muted-foreground mb-8 max-w-xl mx-auto">
          POD Guard helps you meet accessibility and IP requirements across major markets.
        </p>
        <div className="grid sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {compliance.map((c) => (
            <Card key={c.region}>
              <CardContent className="pt-6 space-y-2">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" aria-hidden="true" />
                  <span className="font-semibold text-sm">{c.region}</span>
                </div>
                <Badge variant="outline" className="text-xs">{c.law}</Badge>
                <p className="text-xs text-muted-foreground">{c.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator />

      {/* Privacy Policy */}
      <section aria-labelledby="privacy-heading" className="max-w-3xl mx-auto">
        <h2 id="privacy-heading" className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Lock className="h-5 w-5 text-primary" aria-hidden="true" /> Privacy Policy
        </h2>
        <div className="prose prose-sm text-muted-foreground space-y-4">
          <p><strong>Last updated:</strong> March 2026</p>
          <h3 className="text-foreground text-base font-semibold">Local-First Processing</h3>
          <p>POD Guard processes your designs <strong>locally in your browser</strong> whenever possible. Image analysis for accessibility, quality checks, and color extraction happens entirely on your device — your design files are never uploaded to our servers for these checks.</p>
          <h3 className="text-foreground text-base font-semibold">What We Store</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Account information (email, hashed password)</li>
            <li>Scan results (scores, keywords — not your images)</li>
            <li>Aggregate analytics (ad impressions, page views)</li>
          </ul>
          <h3 className="text-foreground text-base font-semibold">What We Don't Store</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Your design files or images</li>
            <li>Payment information (handled by Stripe)</li>
            <li>Personal data beyond what you provide</li>
          </ul>
          <h3 className="text-foreground text-base font-semibold">Third-Party Services</h3>
          <p>We use Lovable Cloud for secure data storage and authentication. Affiliate links to eco-printers include UTM tracking parameters. We clearly disclose affiliate relationships.</p>
          <h3 className="text-foreground text-base font-semibold">Your Rights</h3>
          <p>You can request data export or account deletion at any time via your dashboard settings or by contacting support.</p>
        </div>
      </section>

      <Separator />

      {/* Terms of Service */}
      <section aria-labelledby="terms-heading" className="max-w-3xl mx-auto">
        <h2 id="terms-heading" className="text-2xl font-bold mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" aria-hidden="true" /> Terms of Service
        </h2>
        <div className="prose prose-sm text-muted-foreground space-y-4">
          <p><strong>Last updated:</strong> March 2026</p>
          <h3 className="text-foreground text-base font-semibold">Service Description</h3>
          <p>POD Guard provides automated compliance scanning for print-on-demand designs. Our checks are advisory in nature and do not constitute legal advice. Always consult a qualified attorney for trademark or IP concerns.</p>
          <h3 className="text-foreground text-base font-semibold">Disclaimer</h3>
          <p>While we strive for accuracy, POD Guard cannot guarantee that all trademark conflicts or compliance issues will be detected. Our database is comprehensive but not exhaustive. Use our results as a starting point, not a definitive legal opinion.</p>
          <h3 className="text-foreground text-base font-semibold">Usage Limits</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Free plan:</strong> 5 scans per month</li>
            <li><strong>Pro plan ($9.99/mo):</strong> Unlimited scans, PDF reports, priority support</li>
            <li><strong>Business plan:</strong> Team features and API access</li>
          </ul>
          <h3 className="text-foreground text-base font-semibold">Intellectual Property</h3>
          <p>You retain all rights to your designs. We do not claim ownership of any content you scan. Trademark data is sourced from public government databases (USPTO, EUIPO, CIPO) and community reports.</p>
          <h3 className="text-foreground text-base font-semibold">Affiliate Disclosure</h3>
          <p>POD Guard participates in affiliate programs with eco-friendly print partners. We may earn a commission when you visit partner sites through our links, at no additional cost to you. All affiliate relationships are clearly disclosed.</p>
        </div>
      </section>
    </div>
  );
}
