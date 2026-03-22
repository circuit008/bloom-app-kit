import { useState, useEffect, useRef } from "react";
import { Trophy, AlertTriangle, Download, Share2, Printer, ExternalLink, CheckCircle2, XCircle, Shield, Eye, Ruler, Leaf, RotateCcw, Search, ScanText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AdBanner } from "@/components/shared/AdBanner";
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

function AnimatedScore({ target }: { target: number }) {
  const [current, setCurrent] = useState(0);
  const ref = useRef<number>();

  useEffect(() => {
    const duration = 1500;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
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

export function FinalResults({ reverseImageResult, ocrResult, ipResult, accessibilityResult, qualityResult, transparencyResult, keywords, onRestart }: FinalResultsProps) {
  const [saved, setSaved] = useState(false);

  const overall = Math.round(
    reverseImageResult.score * 0.15 +
    ocrResult.score * 0.15 +
    ipResult.score * 0.20 +
    accessibilityResult.score * 0.20 +
    qualityResult.score * 0.20 +
    transparencyResult.score * 0.10
  );
  const passed = overall >= 70;
  const overallColor = overall >= 80 ? "text-success" : overall >= 50 ? "text-warning" : "text-destructive";
  const overallBg = overall >= 80 ? "bg-success/10" : overall >= 50 ? "bg-warning/10" : "bg-destructive/10";
  const overallRing = overall >= 80 ? "ring-success/30" : overall >= 50 ? "ring-warning/30" : "ring-destructive/30";

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
      });
      if (!error) setSaved(true);
    }
    save();
  }, []);

  const handleShare = () => {
    const text = `Design Compliance Score: ${overall}/100 (${passed ? "PASS ✅" : "FAIL ❌"}) — Image Search: ${reverseImageResult.score}, OCR: ${ocrResult.score}, IP: ${ipResult.score}, Accessibility: ${accessibilityResult.score}, Quality: ${qualityResult.score}, Transparency: ${transparencyResult.score}`;
    navigator.clipboard.writeText(text);
    toast.success("Results copied to clipboard!");
  };

  const handleExportPDF = () => {
    toast.info("PDF export coming soon! Results have been saved to your account.");
  };

  // Build issue checklist for failures
  const issues: { label: string; fixed: boolean }[] = [];
  if (reverseImageResult.score < 70) issues.push({ label: `Copyright concern: ${reverseImageResult.matches.length} similar image(s) found in database`, fixed: false });
  if (ocrResult.score < 70) issues.push({ label: `OCR detected ${ocrResult.flaggedTerms.length} trademarked text(s) in image`, fixed: false });
  if (ipResult.score < 70) issues.push({ label: `Fix IP issues: ${ipResult.matches.length} trademark conflict(s) found`, fixed: false });
  if (accessibilityResult.score < 70) issues.push({ label: `Improve accessibility: contrast ratio ${accessibilityResult.contrastRatio.toFixed(1)}:1`, fixed: false });
  if (qualityResult.score < 70) issues.push({ label: `Increase image quality: ${qualityResult.width}×${qualityResult.height}px (min ${qualityResult.requiredWidth}×${qualityResult.requiredHeight}px)`, fixed: false });
  if (transparencyResult.score < 70) issues.push({ label: `Explore certified printers in your region (${transparencyResult.printersAvailable} available)`, fixed: false });

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Main Score Card */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            {passed ? <Trophy className="h-5 w-5 text-success" /> : <AlertTriangle className="h-5 w-5 text-destructive" />}
            Final Compliance Results
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
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Weighted score: Image Search (15%) + OCR (15%) + IP (20%) + Quality (20%) + Accessibility (20%) + Transparency (10%)
              </p>
              {saved && <p className="text-xs text-muted-foreground mt-1">✓ Results saved to your account</p>}
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="space-y-3 py-4 border-y">
            <ScoreBar label="Image Search" score={reverseImageResult.score} icon={Search} weight="20%" />
            <ScoreBar label="IP Check" score={ipResult.score} icon={Shield} weight="25%" />
            <ScoreBar label="Quality" score={qualityResult.score} icon={Ruler} weight="25%" />
            <ScoreBar label="Accessibility" score={accessibilityResult.score} icon={Eye} weight="20%" />
            <ScoreBar label="Transparency" score={transparencyResult.score} icon={Leaf} weight="10%" />
          </div>

          {/* Pass/Fail Summary Row */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {[
              { label: "Img Search", score: reverseImageResult.score },
              { label: "IP", score: ipResult.score },
              { label: "Quality", score: qualityResult.score },
              { label: "Access.", score: accessibilityResult.score },
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

      {/* Conditional: PASS actions */}
      {passed && (
        <>
          {/* Recommended Print Partners */}
          {transparencyResult.certifiedPrinters.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Leaf className="h-4 w-4 text-success" /> Recommended Print Partners
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground italic">💡 We may earn a commission from partner links at no cost to you.</p>
                {transparencyResult.certifiedPrinters.slice(0, 3).map((p) => {
                  const affiliateUrl = p.affiliate_url
                    ? `${p.affiliate_url}${p.affiliate_url.includes("?") ? "&" : "?"}source=podguard`
                    : null;

                  const handleClick = async () => {
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

                  return (
                    <div key={p.id} className="flex items-center justify-between border rounded-lg p-3">
                      <div>
                        <p className="font-medium text-sm">{p.name}</p>
                        <div className="flex gap-1 mt-1">
                          {p.certifications.slice(0, 3).map((c) => (
                            <Badge key={c} variant="outline" className="text-xs">{c}</Badge>
                          ))}
                        </div>
                      </div>
                      {affiliateUrl && (
                        <a href={affiliateUrl} target="_blank" rel="noopener noreferrer" onClick={handleClick}>
                          <Button size="sm" variant="outline">
                            Visit <ExternalLink className="h-3 w-3 ml-1" />
                          </Button>
                        </a>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Ad Placement */}
          <div className="flex justify-center">
            <AdBanner placement="results" page="final-results" />
          </div>
        </>
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
