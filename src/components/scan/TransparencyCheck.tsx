import { useState, useEffect } from "react";
import { Leaf, Globe, Award, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export interface TransparencyResult {
  score: number;
  region: string;
  printersAvailable: number;
  certifiedPrinters: EcoPrinter[];
  suggestions: string[];
}

interface EcoPrinter {
  id: string;
  name: string;
  region: string;
  certifications: string[];
  website_url: string | null;
  affiliate_url: string | null;
  description: string | null;
  rating: number;
  min_order: number;
}

interface TransparencyCheckProps {
  onComplete: (result: TransparencyResult) => void;
  onBack: () => void;
}

const REGIONS = [
  { value: "US", label: "🇺🇸 United States" },
  { value: "CA", label: "🇨🇦 Canada" },
  { value: "EU", label: "🇪🇺 European Union" },
  { value: "UK", label: "🇬🇧 United Kingdom" },
  { value: "AU", label: "🇦🇺 Australia" },
];

const CERT_COLORS: Record<string, string> = {
  GOTS: "bg-success/10 text-success border-success/20",
  "Fair Trade": "bg-warning/10 text-warning border-warning/20",
  "OEKO-TEX": "bg-primary/10 text-primary border-primary/20",
  "B Corp": "bg-accent-foreground/10 text-accent-foreground border-accent-foreground/20",
  "EU Ecolabel": "bg-success/10 text-success border-success/20",
  Bluesign: "bg-primary/10 text-primary border-primary/20",
  WRAP: "bg-warning/10 text-warning border-warning/20",
};

function getScoreColor(s: number) {
  return s >= 80 ? "text-success" : s >= 50 ? "text-warning" : "text-destructive";
}
function getScoreBg(s: number) {
  return s >= 80 ? "bg-success/10" : s >= 50 ? "bg-warning/10" : "bg-destructive/10";
}

export function TransparencyCheck({ onComplete, onBack }: TransparencyCheckProps) {
  const [region, setRegion] = useState<string>("");
  const [printers, setPrinters] = useState<EcoPrinter[]>([]);
  const [filtered, setFiltered] = useState<EcoPrinter[]>([]);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<TransparencyResult | null>(null);
  const [expandedPrinter, setExpandedPrinter] = useState<string | null>(null);

  // Detect region from browser
  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz.startsWith("America/Toronto") || tz.startsWith("America/Vancouver")) setRegion("CA");
      else if (tz.startsWith("America/")) setRegion("US");
      else if (tz.startsWith("Europe/London")) setRegion("UK");
      else if (tz.startsWith("Europe/")) setRegion("EU");
      else if (tz.startsWith("Australia/")) setRegion("AU");
      else setRegion("US");
    } catch {
      setRegion("US");
    }
  }, []);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("eco_printers")
        .select("*");
      if (!error && data) {
        setPrinters(data.map((d: any) => ({
          ...d,
          certifications: d.certifications || [],
          rating: Number(d.rating) || 4.0,
          min_order: d.min_order || 1,
        })));
      }
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    if (region && printers.length) {
      setFiltered(printers.filter((p) => p.region === region));
    }
  }, [region, printers]);

  const runCheck = () => {
    const regionPrinters = filtered;
    const allCerts = regionPrinters.flatMap((p) => p.certifications);
    const uniqueCerts = new Set(allCerts);
    const suggestions: string[] = [];

    // Score: base 40 + up to 30 for printers + up to 30 for cert diversity
    let score = 40;
    score += Math.min(30, regionPrinters.length * 10);
    score += Math.min(30, uniqueCerts.size * 6);
    score = Math.min(100, score);

    if (regionPrinters.length === 0) {
      score = 20;
      suggestions.push("No certified printers found in your region. Consider expanding your search.");
    }
    if (!allCerts.includes("GOTS")) suggestions.push("Look for GOTS-certified printers for organic textile assurance.");
    if (!allCerts.includes("Fair Trade")) suggestions.push("Consider Fair Trade certified printers for ethical labor practices.");
    if (regionPrinters.length < 3) suggestions.push("Limited printer options — consider nearby regions for more choices.");

    const res: TransparencyResult = {
      score,
      region,
      printersAvailable: regionPrinters.length,
      certifiedPrinters: regionPrinters,
      suggestions,
    };
    setResult(res);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-16 flex flex-col items-center gap-4">
          <Leaf className="h-10 w-10 animate-pulse text-success" />
          <p className="font-semibold">Loading eco-printer database...</p>
          <Badge variant="outline">🌱 Supply Chain Check</Badge>
        </CardContent>
      </Card>
    );
  }

  if (result) {
    return (
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Leaf className="h-5 w-5 text-success" />
            Step 4: Supply Chain Transparency
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <div className={cn("h-24 w-24 rounded-full flex items-center justify-center", getScoreBg(result.score))}>
              <span className={cn("text-3xl font-extrabold", getScoreColor(result.score))}>{result.score}</span>
            </div>
            <div>
              <p className={cn("text-lg font-bold", getScoreColor(result.score))}>
                {result.score >= 80 ? "Excellent Transparency" : result.score >= 50 ? "Moderate Transparency" : "Low Transparency"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {result.printersAvailable} certified printer{result.printersAvailable !== 1 ? "s" : ""} in {REGIONS.find((r) => r.value === result.region)?.label || result.region}
              </p>
            </div>
          </div>

          {result.certifiedPrinters.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Award className="h-4 w-4" /> Certified Print Partners
              </h4>
              {result.certifiedPrinters.map((printer) => (
                <div key={printer.id} className="border rounded-lg p-3 space-y-2">
                  <button
                    onClick={() => setExpandedPrinter(expandedPrinter === printer.id ? null : printer.id)}
                    className="flex items-center justify-between w-full text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{printer.name}</span>
                      <span className="text-xs text-muted-foreground">⭐ {printer.rating}</span>
                    </div>
                    {expandedPrinter === printer.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  <div className="flex flex-wrap gap-1">
                    {printer.certifications.map((c) => (
                      <Badge key={c} variant="outline" className={cn("text-xs", CERT_COLORS[c] || "")}>
                        {c}
                      </Badge>
                    ))}
                  </div>
                  {expandedPrinter === printer.id && (
                    <div className="text-sm text-muted-foreground space-y-2 pt-1">
                      {printer.description && <p>{printer.description}</p>}
                      <p>Min. order: {printer.min_order} units</p>
                      {printer.affiliate_url && (
                        <a href={printer.affiliate_url} target="_blank" rel="noopener noreferrer" className="text-primary inline-flex items-center gap-1 hover:underline">
                          Visit website <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {result.suggestions.length > 0 && (
            <div className="space-y-1">
              <h4 className="text-sm font-semibold">Suggestions</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                {result.suggestions.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setResult(null)}>Change Region</Button>
            <Button onClick={() => onComplete(result)}>View Final Results</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Leaf className="h-5 w-5 text-success" />
          Step 4: Supply Chain Transparency
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Check for certified eco-friendly printers in your region to ensure ethical and sustainable production.
        </p>

        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Globe className="h-4 w-4" /> Your Region
          </label>
          <Select value={region} onValueChange={setRegion}>
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="Select region" />
            </SelectTrigger>
            <SelectContent>
              {REGIONS.map((r) => (
                <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {region && (
          <p className="text-sm text-muted-foreground">
            {filtered.length} certified printer{filtered.length !== 1 ? "s" : ""} found in {REGIONS.find((r) => r.value === region)?.label}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={onBack}>Back</Button>
          <Button onClick={runCheck} disabled={!region}>
            Check Transparency
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
