import { Shield, Eye, Ruler, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import type { IPCheckResult } from "./IPResultsCard";
import type { AccessibilityResult } from "./AccessibilityCheck";
import type { QualityResult } from "./QualityCheck";

interface CombinedResultsProps {
  ipResult: IPCheckResult;
  accessibilityResult: AccessibilityResult;
  qualityResult: QualityResult;
  onRestart: () => void;
}

function ScoreCircle({ score, label, icon: Icon }: { score: number; label: string; icon: any }) {
  const color = score >= 80 ? "text-success" : score >= 50 ? "text-warning" : "text-destructive";
  const bg = score >= 80 ? "bg-success/10" : score >= 50 ? "bg-warning/10" : "bg-destructive/10";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={cn("h-20 w-20 rounded-full flex items-center justify-center", bg)}>
        <span className={cn("text-2xl font-extrabold", color)}>{score}</span>
      </div>
      <div className="flex items-center gap-1 text-sm font-medium">
        <Icon className="h-4 w-4" />
        {label}
      </div>
    </div>
  );
}

function DetailSection({ title, items, icon: Icon }: { title: string; items: string[]; icon: any }) {
  const [open, setOpen] = useState(false);
  if (!items.length) return null;

  return (
    <div>
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
        <Icon className="h-4 w-4" />
        {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        {title}
      </button>
      {open && (
        <ul className="mt-2 space-y-1 pl-6 list-disc text-sm text-muted-foreground">
          {items.map((s, i) => <li key={i}>{s}</li>)}
        </ul>
      )}
    </div>
  );
}

export function CombinedResults({ ipResult, accessibilityResult, qualityResult, onRestart }: CombinedResultsProps) {
  const overallScore = Math.round((ipResult.score + accessibilityResult.score + qualityResult.score) / 3);
  const overallColor = overallScore >= 80 ? "text-success" : overallScore >= 50 ? "text-warning" : "text-destructive";
  const overallBg = overallScore >= 80 ? "bg-success/10" : overallScore >= 50 ? "bg-warning/10" : "bg-destructive/10";
  const overallLabel = overallScore >= 80 ? "Ready to Sell" : overallScore >= 50 ? "Needs Attention" : "Not Ready";

  const ipSuggestions = ipResult.matches.map((m) => `Remove or replace "${m.matchedKeyword}" — matches trademark "${m.term}"`);
  
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Combined Compliance Results</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall score */}
        <div className="flex items-center gap-6">
          <div className={cn("h-28 w-28 rounded-full flex items-center justify-center", overallBg)}>
            <span className={cn("text-4xl font-extrabold", overallColor)}>{overallScore}</span>
          </div>
          <div>
            <p className={cn("text-xl font-bold", overallColor)}>{overallLabel}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Average of IP, Accessibility, and Quality scores
            </p>
            <Badge variant="outline" className="mt-2">🛡️ All checks processed locally</Badge>
          </div>
        </div>

        {/* Individual scores */}
        <div className="grid grid-cols-3 gap-4 py-4 border-y">
          <ScoreCircle score={ipResult.score} label="IP Check" icon={Shield} />
          <ScoreCircle score={accessibilityResult.score} label="Accessibility" icon={Eye} />
          <ScoreCircle score={qualityResult.score} label="Quality" icon={Ruler} />
        </div>

        {/* Pass/fail summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className={cn("p-3 rounded-lg text-center text-sm", ipResult.score >= 80 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive")}>
            {ipResult.score >= 80 ? "✅" : "❌"} IP: {ipResult.riskLabel}
          </div>
          <div className={cn("p-3 rounded-lg text-center text-sm", accessibilityResult.wcagAA ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive")}>
            {accessibilityResult.wcagAA ? "✅" : "❌"} WCAG {accessibilityResult.wcagAAA ? "AAA" : accessibilityResult.wcagAA ? "AA" : "Fail"}
          </div>
          <div className={cn("p-3 rounded-lg text-center text-sm", qualityResult.meetsRequirements ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive")}>
            {qualityResult.meetsRequirements ? "✅" : "❌"} {qualityResult.productType}
          </div>
        </div>

        {/* Expandable suggestions */}
        <div className="space-y-3">
          <DetailSection title={`IP Suggestions (${ipSuggestions.length})`} items={ipSuggestions} icon={Shield} />
          <DetailSection title={`Accessibility Suggestions (${accessibilityResult.suggestions.length})`} items={accessibilityResult.suggestions} icon={Eye} />
          <DetailSection title={`Quality Suggestions (${qualityResult.suggestions.length})`} items={qualityResult.suggestions} icon={Ruler} />
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={onRestart}>Scan Another Design</Button>
        </div>
      </CardContent>
    </Card>
  );
}
