import { Shield, AlertTriangle, CheckCircle, XCircle, Globe, Clock, Flag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ReportTrademarkModal } from "./ReportTrademarkModal";

export interface IPMatch {
  term: string;
  matchedKeyword: string;
  category: string;
  riskLevel: string;
  description: string | null;
  source: string | null;
  region: string | null;
  ownerName: string | null;
  registrationNumber: string | null;
  lastVerified: string | null;
  confidence: "high" | "medium" | "low";
}

export interface IPCheckResult {
  score: number;
  matches: IPMatch[];
  riskLabel: string;
  riskEmoji: string;
  dbStats: {
    total: number;
    sources: number;
    lastUpdated: string | null;
  };
}

interface IPResultsCardProps {
  result: IPCheckResult;
  onBack: () => void;
}

function getScoreColor(score: number) {
  if (score >= 90) return "text-success";
  if (score >= 70) return "text-warning";
  if (score >= 50) return "text-orange-500";
  return "text-destructive";
}

function getScoreBg(score: number) {
  if (score >= 90) return "bg-success/10";
  if (score >= 70) return "bg-warning/10";
  if (score >= 50) return "bg-orange-500/10";
  return "bg-destructive/10";
}

function getRiskBadgeVariant(risk: string): "default" | "secondary" | "destructive" | "outline" {
  if (risk === "high") return "destructive";
  if (risk === "medium") return "secondary";
  return "outline";
}

const regionFlags: Record<string, string> = {
  EU: "🇪🇺",
  US: "🇺🇸",
  CA: "🇨🇦",
  global: "🌐",
};

const confidenceConfig: Record<string, { emoji: string; label: string; color: string }> = {
  high: { emoji: "🟢", label: "High Confidence", color: "text-success" },
  medium: { emoji: "🟡", label: "Medium Confidence", color: "text-warning" },
  low: { emoji: "🟠", label: "Low Confidence", color: "text-orange-400" },
};

function SourceBadge({ source, region }: { source: string | null; region: string | null }) {
  const flag = regionFlags[region || "global"] || "🌐";
  const label = source || "Manual";
  return (
    <Badge variant="outline" className="text-xs gap-1">
      <span>{flag}</span>
      {label}
    </Badge>
  );
}

function ConfidenceBadge({ confidence }: { confidence: "high" | "medium" | "low" }) {
  const cfg = confidenceConfig[confidence];
  return (
    <span className={cn("text-xs flex items-center gap-1", cfg.color)}>
      {cfg.emoji} {cfg.label}
    </span>
  );
}

function formatTimeAgo(dateStr: string | null) {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "Less than 1 hour ago";
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? "s" : ""} ago`;
}

export function IPResultsCard({ result, onBack }: IPResultsCardProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          IP Copyright Check Results
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* DB Stats banner */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border bg-muted/50 px-4 py-2.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5" />
            Protected by <strong className="text-foreground">{result.dbStats.total.toLocaleString()}+</strong> trademarks from <strong className="text-foreground">{result.dbStats.sources}</strong> sources
          </span>
          {result.dbStats.lastUpdated && (
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              Last updated: {formatTimeAgo(result.dbStats.lastUpdated)}
            </span>
          )}
        </div>

        {/* Score display */}
        <div className="flex items-center gap-6">
          <div
            className={cn(
              "h-24 w-24 rounded-full flex items-center justify-center",
              getScoreBg(result.score)
            )}
          >
            <span className={cn("text-3xl font-extrabold", getScoreColor(result.score))}>
              {result.score}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{result.riskEmoji}</span>
              <span className="text-lg font-semibold">{result.riskLabel}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {result.score >= 90
                ? "Your design appears safe for listing."
                : result.score >= 70
                ? "Some potential issues detected. Review flagged terms before listing."
                : result.score >= 50
                ? "High risk detected. These terms are not recommended for use."
                : "Critical IP violations found. Do NOT use these terms."}
            </p>
          </div>
        </div>

        {/* Flagged terms */}
        {result.matches.length > 0 ? (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              Flagged Terms ({result.matches.length})
            </h4>
            <div className="space-y-2">
              {result.matches.map((m, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-lg border bg-card p-3"
                >
                  <XCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">"{m.matchedKeyword}"</span>
                      <span className="text-xs text-muted-foreground">matches</span>
                      <Badge variant={getRiskBadgeVariant(m.riskLevel)} className="text-xs">
                        {m.term}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {m.category}
                      </Badge>
                      <SourceBadge source={m.source} region={m.region} />
                    </div>

                    {/* Owner & registration */}
                    {(m.ownerName || m.registrationNumber) && (
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {m.ownerName && <span>Owner: <strong className="text-foreground">{m.ownerName}</strong></span>}
                        {m.registrationNumber && <span>Reg#: {m.registrationNumber}</span>}
                      </div>
                    )}

                    {/* Confidence + verified */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <ConfidenceBadge confidence={m.confidence} />
                      {m.lastVerified && (
                        <span className="text-xs text-muted-foreground">
                          Verified: {formatTimeAgo(m.lastVerified)}
                        </span>
                      )}
                    </div>

                    {m.description && (
                      <p className="text-xs text-muted-foreground">{m.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-lg border border-success/30 bg-success/5 p-4">
            <CheckCircle className="h-5 w-5 text-success" />
            <div>
              <p className="text-sm font-medium">No trademark matches found</p>
              <p className="text-xs text-muted-foreground">Your keywords don't match any known trademarks in our database.</p>
            </div>
          </div>
        )}

        {/* Report */}
        <div className="pt-2">
          <ReportTrademarkModal />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={onBack}>
            Edit Keywords
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
