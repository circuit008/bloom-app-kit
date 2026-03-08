import { Shield, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
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
}

export interface IPCheckResult {
  score: number;
  matches: IPMatch[];
  riskLabel: string;
  riskEmoji: string;
}

interface IPResultsCardProps {
  result: IPCheckResult;
  onBack: () => void;
}

function getScoreColor(score: number) {
  if (score >= 80) return "text-success";
  if (score >= 50) return "text-warning";
  return "text-destructive";
}

function getScoreBg(score: number) {
  if (score >= 80) return "bg-success/10";
  if (score >= 50) return "bg-warning/10";
  return "bg-destructive/10";
}

function getRiskBadgeVariant(risk: string): "default" | "secondary" | "destructive" | "outline" {
  if (risk === "high") return "destructive";
  if (risk === "medium") return "secondary";
  return "outline";
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
              {result.score >= 80
                ? "Your design appears safe for listing."
                : result.score >= 50
                ? "Some potential issues detected. Review flagged terms."
                : "High risk detected. Strongly consider removing flagged terms."}
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
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">"{m.matchedKeyword}"</span>
                      <span className="text-xs text-muted-foreground">matches</span>
                      <Badge variant={getRiskBadgeVariant(m.riskLevel)} className="text-xs">
                        {m.term}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {m.category}
                      </Badge>
                    </div>
                    {m.description && (
                      <p className="text-xs text-muted-foreground mt-1">{m.description}</p>
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
