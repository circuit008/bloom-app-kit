import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Loader2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DesignUpload } from "@/components/scan/DesignUpload";
import { KeywordInput } from "@/components/scan/KeywordInput";
import { ScanProgress } from "@/components/scan/ScanProgress";
import { IPResultsCard, type IPCheckResult, type IPMatch } from "@/components/scan/IPResultsCard";

type Phase = "upload" | "checking" | "results";

export default function Scan() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [phase, setPhase] = useState<Phase>("upload");
  const [result, setResult] = useState<IPCheckResult | null>(null);
  const keywordInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((f: File | null, p: string | null) => {
    setFile(f);
    setPreview(p);
  }, []);

  const runIPCheck = async () => {
    // Flush any text still in the keyword input
    if (keywordInputRef.current) {
      const val = keywordInputRef.current.value.trim().replace(/,$/, "");
      if (val && !keywords.includes(val)) {
        const updated = [...keywords, val];
        setKeywords(updated);
        keywordInputRef.current.value = "";
        // Use updated list for the check
        return runIPCheckWithKeywords(updated);
      }
    }
    return runIPCheckWithKeywords(keywords);
  };

  const runIPCheckWithKeywords = async (kws: string[]) => {
    if (kws.length === 0) {
      toast.error("Please add at least one keyword to check.");
      return;
    }

    setPhase("checking");

    try {
      // Fetch trademark database
      const { data: trademarks, error } = await supabase
        .from("trademark_database")
        .select("*");

      if (error) throw error;

      if (!trademarks || trademarks.length === 0) {
        toast.error("Could not load trademark database. Please try again.");
        setPhase("upload");
        return;
      }

      // Compare keywords against trademarks (case-insensitive)
      const matches: IPMatch[] = [];

      for (const kw of kws) {
        const kwLower = kw.toLowerCase();
        for (const tm of trademarks) {
          const termLower = tm.term.toLowerCase();
          if (
            kwLower.includes(termLower) ||
            termLower.includes(kwLower)
          ) {
            // Avoid duplicate matches for same term
            if (!matches.find((m) => m.term === tm.term && m.matchedKeyword === kw)) {
              matches.push({
                term: tm.term,
                matchedKeyword: kw,
                category: tm.category,
                riskLevel: tm.risk_level,
                description: tm.description,
              });
            }
          }
        }
      }

      // Calculate score: 100 - (matched_terms × 20), min 0
      const score = Math.max(0, 100 - matches.length * 20);

      let riskLabel: string;
      let riskEmoji: string;
      if (score >= 80) {
        riskLabel = "Safe";
        riskEmoji = "🟢";
      } else if (score >= 50) {
        riskLabel = "Caution";
        riskEmoji = "🟡";
      } else {
        riskLabel = "High Risk";
        riskEmoji = "🔴";
      }

      setResult({ score, matches, riskLabel, riskEmoji });
      setPhase("results");
    } catch (err: any) {
      console.error("IP Check error:", err);
      toast.error("Failed to run IP check. " + (err.message || ""));
      setPhase("upload");
    }
  };

  const handleBack = () => {
    setPhase("upload");
    setResult(null);
  };

  return (
    <div className="container max-w-3xl py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">New Design Scan</h1>
          <p className="text-sm text-muted-foreground">Upload your design and check for compliance issues</p>
        </div>
      </div>

      {/* Progress */}
      <ScanProgress
        currentStep={1}
        totalSteps={4}
        stepLabel="IP Check"
      />

      {/* Upload phase */}
      {phase === "upload" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5 text-primary" />
              Step 1: IP Copyright Check
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <DesignUpload file={file} preview={preview} onFileChange={handleFileChange} />
            <KeywordInput keywords={keywords} onKeywordsChange={setKeywords} inputRef={keywordInputRef} />

            <div className="pt-2">
              <Button
                onClick={runIPCheck}
                className="w-full sm:w-auto"
              >
                Run IP Check
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Checking phase */}
      {phase === "checking" && (
        <Card>
          <CardContent className="py-16 flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <div className="text-center">
              <p className="font-semibold">Running IP Copyright Check...</p>
              <p className="text-sm text-muted-foreground mt-1">
                Comparing {keywords.length} keyword{keywords.length !== 1 ? "s" : ""} against trademark database
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results phase */}
      {phase === "results" && result && (
        <IPResultsCard result={result} onBack={handleBack} />
      )}
    </div>
  );
}
