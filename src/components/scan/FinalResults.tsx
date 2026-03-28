import { useState, useEffect, useRef } from "react";
import { Trophy, AlertTriangle, Download, Share2, Printer, ExternalLink, CheckCircle2, XCircle, Shield, Eye, Ruler, Leaf, RotateCcw, Search, ScanText, Star, ArrowUpDown, DollarSign, Truck, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AdBanner } from "@/components/shared/AdBanner";
import { useLanguage } from "@/hooks/useLanguage";
import type { IPCheckResult } from "./IPResultsCard";
import type { ReverseImageResult } from "./ReverseImageSearch";
import type { OCRResult } from "./OCRCheck";
import type { AccessibilityResult } from "./AccessibilityCheck";
import type { QualityResult } from "./QualityCheck";
import type { TransparencyResult } from "./TransparencyCheck";

interface FinalResultsProps {
  reverseImageResult: ReverseImageResult;
  ocrResult: OCRResult;
  ipResult: IPCheckResult;
  accessibilityResult: AccessibilityResult;
  qualityResult: QualityResult;
  transparencyResult: TransparencyResult;
  keywords: string[];
  onRestart: () => void;
}

interface PrintProvider {
  name: string;
  logo: string;
  priceEstimate: string;
  shippingTime: string;
  certifications: string[];
  ecoScore: number;
  qualityRating: number;
  affiliateUrl: string;
}

const PRINT_PROVIDERS: PrintProvider[] = [
  {
    name: "Printful",
    logo: "🟣",
    priceEstimate: "$12.99/shirt",
    shippingTime: "3-5 business days",
    certifications: ["OEKO-TEX", "Fair Trade"],
    ecoScore: 85,
    qualityRating: 4.5,
    affiliateUrl: "https://www.printful.com?ref=podguard",
  },
  {
    name: "Printify",
    logo: "🟢",
    priceEstimate: "$9.99/shirt",
    shippingTime: "5-7 business days",
    certifications: ["GOTS"],
    ecoScore: 72,
    qualityRating: 4.2,
    affiliateUrl: "https://www.printify.com?ref=podguard",
  },
  {
    name: "Gooten",
    logo: "🔵",
    priceEstimate: "$11.49/shirt",
    shippingTime: "4-8 business days",
    certifications: ["OEKO-TEX"],
    ecoScore: 78,
    qualityRating: 4.0,
    affiliateUrl: "https://www.gooten.com?ref=podguard",
  },
  {
    name: "SPOD",
    logo: "🟠",
    priceEstimate: "$10.99/shirt",
    shippingTime: "2-5 business days",
    certifications: ["GOTS", "Fair Trade", "OEKO-TEX"],
    ecoScore: 92,
    qualityRating: 4.3,
    affiliateUrl: "https://www.spod.com?ref=podguard",
  },
  {
    name: "Gelato",
    logo: "🔴",
    priceEstimate: "$13.49/shirt",
    shippingTime: "3-6 business days",
    certifications: ["FSC", "Carbon Neutral"],
    ecoScore: 90,
    qualityRating: 4.4,
    affiliateUrl: "https://www.gelato.com?ref=podguard",
  },
];

function calculateCopyrightScore(ipScore: number, imageSearchScore: number, ocrScore: number) {
  const lowestCopyright = Math.min(ipScore, imageSearchScore, ocrScore);

  // If reverse image search found match (< 70), copyright automatically caps
  if (imageSearchScore < 70) {
    return Math.min(lowestCopyright, 50);
  }

  // Weighted average of all three
  return Math.round(ipScore * 0.50 + imageSearchScore * 0.30 + ocrScore * 0.20);
}

function calculateOverallScore(
  ip: number,
  accessibility: number,
  quality: number,
  transparency: number,
  reverseImage: number,
  ocr: number
) {
  const copyrightScore = calculateCopyrightScore(ip, reverseImage, ocr);

  // STEP 1: Copyright gatekeeper
  if (copyrightScore < 70) {
    return {
      score: Math.min(copyrightScore, 50),
      passed: false,
      reason: "⚠️ Copyright risk detected. Design may infringe existing artwork.",
      capped: true,
      copyrightScore,
    };
  }

  // STEP 2: Only if copyright passes, calculate rest
  const weighted = Math.round(
    copyrightScore * 0.50 +
    accessibility * 0.20 +
    quality * 0.15 +
    transparency * 0.15
  );

  return {
    score: Math.round(weighted),
    passed: weighted >= 70,
    reason: weighted >= 70 ? "All checks passed" : "Some checks need improvement",
    capped: false,
    copyrightScore,
  };
}

function AnimatedScore({ target }: { target: number }) {
  const [current, setCurrent] = useState(0);
  const ref = useRef<number>();

  useEffect(() => {
    const duration = 1500;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(eased * target));
      if (progress < 1) ref.current = requestAnimationFrame(animate);
    };
    ref.current = requestAnimationFrame(animate);
    return () => { if (ref.current) cancelAnimationFrame(ref.current); };
  }, [target]);

  return <span>{current}</span>;
}

function ScoreBar({ label, score, icon: Icon, weight }: { label: string; score: number; icon: any; weight: string }) {
  const color = score >= 80 ? "bg-success" : score >= 50 ? "bg-warning" : "bg-destructive";
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 font-medium"><Icon className="h-3.5 w-3.5" />{label}</span>
        <span className="text-muted-foreground">{score}/100 <span className="text-xs">({weight})</span></span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div className={cn("h-full rounded-full transition-all duration-1000", color)} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={cn(
            "h-3.5 w-3.5",
            s <= Math.floor(rating) ? "fill-warning text-warning" : s - 0.5 <= rating ? "fill-warning/50 text-warning" : "text-muted"
          )}
        />
      ))}
      <span className="text-xs text-muted-foreground ml-1">{rating}</span>
    </div>
  );
}

export function FinalResults({ reverseImageResult, ocrResult, ipResult, accessibilityResult, qualityResult, transparencyResult, keywords, onRestart }: FinalResultsProps) {
  const { t } = useLanguage();
  const [saved, setSaved] = useState(false);
  const [sortBy, setSortBy] = useState<"price" | "eco">("price");

  const { score: overall, passed, reason: failReason, capped, copyrightScore } = calculateOverallScore(
    ipResult.score,
    accessibilityResult.score,
    qualityResult.score,
    transparencyResult.score,
    reverseImageResult.score,
    ocrResult.score
  );

  const overallColor = overall >= 80 ? "text-success" : overall >= 50 ? "text-warning" : "text-destructive";
  const overallBg = overall >= 80 ? "bg-success/10" : overall >= 50 ? "bg-warning/10" : "bg-destructive/10";
  const overallRing = overall >= 80 ? "ring-success/30" : overall >= 50 ? "ring-warning/30" : "ring-destructive/30";

  const sortedProviders = [...PRINT_PROVIDERS].sort((a, b) =>
    sortBy === "eco" ? b.ecoScore - a.ecoScore : parseFloat(a.priceEstimate.replace(/[^0-9.]/g, "")) - parseFloat(b.priceEstimate.replace(/[^0-9.]/g, ""))
  );

  // Save to DB on mount
  useEffect(() => {
    async function save() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { error } = await supabase.from("scan_results").insert({
        user_id: user.id,
        ip_score: ipResult.score,
        accessibility_score: accessibilityResult.score,
        quality_score: qualityResult.score,
        transparency_score: transparencyResult.score,
        overall_score: overall,
        passed,
        keywords,
        fail_reason: passed ? null : failReason,
        ip_score_raw: ipResult.score,
        overall_score_capped: capped,
      } as any);
      if (!error) setSaved(true);
    }
    save();
  }, []);

  const handleShare = () => {
    const text = `Design Compliance Score: ${overall}/100 (${passed ? "PASS ✅" : "FAIL ❌"}) — IP: ${ipResult.score}, Image Search: ${reverseImageResult.score}, OCR: ${ocrResult.score}, Accessibility: ${accessibilityResult.score}, Quality: ${qualityResult.score}, Transparency: ${transparencyResult.score}`;
    navigator.clipboard.writeText(text);
    toast.success("Results copied to clipboard!");
  };

  const handleExportPDF = () => {
    toast.info("PDF export coming soon! Results have been saved to your account.");
  };

  const handleAffiliateClick = async (providerName: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: prof } = await supabase.from("user_profiles").select("affiliate_clicks, affiliate_earnings").eq("user_id", user.id).maybeSingle();
      if (prof) {
        await supabase.from("user_profiles").update({
          affiliate_clicks: (prof.affiliate_clicks || 0) + 1,
          affiliate_earnings: Number(prof.affiliate_earnings || 0) + 0.15,
        }).eq("user_id", user.id);
      }
    }
  };

  // Build issue checklist for failures
  const issues: { label: string; fixed: boolean }[] = [];
  if (copyrightScore < 70) issues.push({ label: `⛔ COPYRIGHT RISK: Combined copyright score ${copyrightScore}/100 — design may infringe existing artwork`, fixed: false });
  if (ipResult.score < 50) issues.push({ label: `IP: ${ipResult.matches.length} high-risk trademark(s) detected`, fixed: false });
  if (reverseImageResult.score < 70) issues.push({ label: `Image Search: ${reverseImageResult.matches.length} similar image(s) found`, fixed: false });
  if (ocrResult.score < 70) issues.push({ label: `OCR: ${ocrResult.flaggedTerms.length} trademarked text(s) in image`, fixed: false });
  if (accessibilityResult.score < 70) issues.push({ label: `Improve accessibility: contrast ratio ${accessibilityResult.contrastRatio.toFixed(1)}:1`, fixed: false });
  if (qualityResult.score < 70) issues.push({ label: `Increase image quality: ${qualityResult.width}×${qualityResult.height}px`, fixed: false });
  if (transparencyResult.score < 70) issues.push({ label: `Explore certified printers in your region`, fixed: false });

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Main Score Card */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            {passed ? <Trophy className="h-5 w-5 text-success" /> : <AlertTriangle className="h-5 w-5 text-destructive" />}
            {t("finalResults")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall Score */}
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className={cn("h-32 w-32 rounded-full flex items-center justify-center ring-4", overallBg, overallRing)}>
              <span className={cn("text-5xl font-extrabold", overallColor)}>
                <AnimatedScore target={overall} />
              </span>
            </div>
            <div className="text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                {passed
                  ? <Badge className="bg-success text-success-foreground text-base px-3 py-1">✅ PASS</Badge>
                  : <Badge variant="destructive" className="text-base px-3 py-1">❌ FAIL</Badge>
                }
                {capped && (
                  <Badge variant="outline" className="text-xs border-destructive text-destructive">{t("scoreCappedCopyright")}</Badge>
                )}
              </div>
              {!passed && (
                <p className="text-sm text-destructive font-medium mt-2">{failReason}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Copyright Check (50%) is the gatekeeper — any copyright risk caps the overall score
              </p>
              {saved && <p className="text-xs text-muted-foreground mt-1">✓ Results saved to your account</p>}
            </div>
          </div>

          {/* Combined Copyright Score */}
          <div className={cn(
            "rounded-lg border p-4 space-y-2",
            copyrightScore < 70 ? "border-destructive/50 bg-destructive/5" : "border-success/50 bg-success/5"
          )}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <Shield className="h-4 w-4" /> 🛡️ Copyright Check (Combined)
              </h3>
              <span className={cn(
                "text-2xl font-extrabold",
                copyrightScore >= 70 ? "text-success" : "text-destructive"
              )}>
                {copyrightScore}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              IP: {ipResult.score}% | Image Search: {reverseImageResult.score}% | OCR: {ocrResult.score}%
            </p>
            {copyrightScore < 70 && (
              <div className="flex items-center gap-2 text-sm text-destructive font-medium mt-1">
                <AlertTriangle className="h-4 w-4" />
                ⚠️ Copyright risk detected. This design may infringe existing artwork.
              </div>
            )}
          </div>

          {/* Score Breakdown */}
          <div className="space-y-3 py-4 border-y">
            <ScoreBar label="Copyright (Combined)" score={copyrightScore} icon={Shield} weight="50%" />
            <div className="pl-4 space-y-2 border-l-2 border-muted">
              <ScoreBar label="IP Check" score={ipResult.score} icon={Shield} weight="—" />
              <ScoreBar label="Image Search" score={reverseImageResult.score} icon={Search} weight="—" />
              <ScoreBar label="OCR Text" score={ocrResult.score} icon={ScanText} weight="—" />
            </div>
            <ScoreBar label="Accessibility" score={accessibilityResult.score} icon={Eye} weight="20%" />
            <ScoreBar label="Quality" score={qualityResult.score} icon={Ruler} weight="15%" />
            <ScoreBar label="Transparency" score={transparencyResult.score} icon={Leaf} weight="15%" />
          </div>

          {/* Pass/Fail Summary Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: "Copyright", score: copyrightScore },
              { label: "Access.", score: accessibilityResult.score },
              { label: "Quality", score: qualityResult.score },
              { label: "Transp.", score: transparencyResult.score },
            ].map((s) => (
              <div key={s.label} className={cn(
                "p-2 rounded-lg text-center text-sm font-medium",
                s.score >= 70 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
              )}>
                {s.score >= 70 ? <CheckCircle2 className="h-4 w-4 mx-auto mb-1" /> : <XCircle className="h-4 w-4 mx-auto mb-1" />}
                {s.label}: {s.score}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-2 print:hidden">
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-1" /> Share Results
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              <Download className="h-4 w-4 mr-1" /> Export PDF
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-1" /> Print
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Print Provider Integration — only if passed */}
      {passed && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Printer className="h-4 w-4 text-success" /> ✅ Your design passed! Ready to print?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Compare print-on-demand providers and start selling your validated design.
            </p>

            {/* Sort Toggle */}
            <div className="flex gap-2">
              <Button
                variant={sortBy === "price" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("price")}
              >
                <DollarSign className="h-3.5 w-3.5 mr-1" /> Sort by Price
              </Button>
              <Button
                variant={sortBy === "eco" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("eco")}
              >
                <Leaf className="h-3.5 w-3.5 mr-1" /> Sort by Eco-Score
              </Button>
            </div>

            {/* Provider Comparison Table */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Provider</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead className="hidden sm:table-cell">Quality</TableHead>
                    <TableHead className="hidden sm:table-cell">Shipping</TableHead>
                    <TableHead className="hidden md:table-cell">Eco-Score</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedProviders.map((provider) => (
                    <TableRow key={provider.name}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{provider.logo}</span>
                          <div>
                            <p className="font-medium text-sm">{provider.name}</p>
                            <div className="flex gap-1 mt-0.5">
                              {provider.certifications.slice(0, 2).map((c) => (
                                <Badge key={c} variant="outline" className="text-[10px] px-1 py-0">{c}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-medium">{provider.priceEstimate}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <StarRating rating={provider.qualityRating} />
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Truck className="h-3.5 w-3.5" />
                          {provider.shippingTime}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-1.5">
                          <div className="h-2 w-16 rounded-full bg-muted overflow-hidden">
                            <div
                              className={cn("h-full rounded-full", provider.ecoScore >= 85 ? "bg-success" : provider.ecoScore >= 70 ? "bg-warning" : "bg-destructive")}
                              style={{ width: `${provider.ecoScore}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">{provider.ecoScore}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <a
                          href={provider.affiliateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => handleAffiliateClick(provider.name)}
                        >
                          <Button size="sm" variant="outline">
                            Order <ExternalLink className="h-3 w-3 ml-1" />
                          </Button>
                        </a>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <p className="text-xs text-muted-foreground italic">
              💡 We may earn a commission from partner links at no cost to you. Prices and availability subject to change.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Conditional: FAIL actions */}
      {!passed && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" /> Fix These Issues
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {issues.map((issue, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Checkbox disabled />
                  <span className="text-sm">{issue.label}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2">
              <h4 className="text-sm font-semibold">📚 Educational Resources</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                <li>WCAG 2.1 Contrast Guidelines — ensure 4.5:1 minimum ratio</li>
                <li>USPTO Trademark Search — verify your designs before selling</li>
                <li>Print Resolution Guide — aim for 300 DPI at final print size</li>
                <li>GOTS Certification — find eco-friendly print partners</li>
              </ul>
            </div>

            <Button onClick={onRestart} className="print:hidden">
              <RotateCcw className="h-4 w-4 mr-2" /> Re-scan After Fixes
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Ad Placement for passed */}
      {passed && (
        <div className="flex justify-center">
          <AdBanner placement="results" page="final-results" />
        </div>
      )}

      {/* Legal Disclaimer */}
      <div className="rounded-lg border border-muted bg-muted/30 p-4 text-xs text-muted-foreground leading-relaxed">
        <strong>⚠️ Disclaimer:</strong> POD Guard provides compliance scanning on a best-effort basis. Results are for informational purposes only and do <strong>not</strong> constitute legal advice. We recommend consulting a qualified intellectual property attorney before making business decisions based on these results. See our{" "}
        <a href="/terms" target="_blank" className="text-primary underline">Terms & Conditions</a>{" "}and{" "}
        <a href="/dmca" target="_blank" className="text-primary underline">DMCA Policy</a>.
      </div>

      {/* Restart */}
      <div className="flex gap-3 print:hidden">
        <Button variant="outline" onClick={onRestart}>Scan Another Design</Button>
      </div>
    </div>
  );
}
