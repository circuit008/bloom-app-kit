import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Loader2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DesignUpload } from "@/components/scan/DesignUpload";
import { KeywordInput } from "@/components/scan/KeywordInput";
import { ScanProgress } from "@/components/scan/ScanProgress";
import { ReverseImageSearch, type ReverseImageResult } from "@/components/scan/ReverseImageSearch";
import { OCRCheck, type OCRResult } from "@/components/scan/OCRCheck";
import { IPResultsCard, type IPCheckResult, type IPMatch } from "@/components/scan/IPResultsCard";
import { AccessibilityCheck, type AccessibilityResult } from "@/components/scan/AccessibilityCheck";
import { QualityCheck, type QualityResult } from "@/components/scan/QualityCheck";
import { TransparencyCheck, type TransparencyResult } from "@/components/scan/TransparencyCheck";
import { FinalResults } from "@/components/scan/FinalResults";
import { useLanguage } from "@/hooks/useLanguage";

type Phase = "upload" | "reverse-image" | "ocr" | "checking" | "ip-results" | "accessibility" | "quality" | "transparency" | "final";

function getConfidence(source: string | null): "high" | "medium" | "low" {
  const official = ["USPTO", "EUIPO", "CIPO"];
  if (source && official.includes(source)) return "high";
  if (source === "manual" || !source) return "medium";
  return "low";
}

function getRiskDeduction(riskLevel: string): number {
  if (riskLevel === "high") return 50;
  if (riskLevel === "medium") return 30;
  return 10;
}

export default function Scan() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [phase, setPhase] = useState<Phase>("upload");
  const [reverseImageResult, setReverseImageResult] = useState<ReverseImageResult | null>(null);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [ipResult, setIpResult] = useState<IPCheckResult | null>(null);
  const [accessibilityResult, setAccessibilityResult] = useState<AccessibilityResult | null>(null);
  const [qualityResult, setQualityResult] = useState<QualityResult | null>(null);
  const [transparencyResult, setTransparencyResult] = useState<TransparencyResult | null>(null);
  const [scanConfirmed, setScanConfirmed] = useState(false);
  const keywordInputRef = useRef<HTMLInputElement>(null);

  const stepLabels: Record<Phase, { step: number; label: string }> = {
    upload: { step: 1, label: t("upload") },
    "reverse-image": { step: 2, label: t("imageSearch") },
    ocr: { step: 3, label: t("ocrCheck") },
    checking: { step: 4, label: t("ipCheck") },
    "ip-results": { step: 4, label: t("ipCheck") },
    accessibility: { step: 5, label: t("accessibility") },
    quality: { step: 6, label: t("quality") },
    transparency: { step: 6, label: t("transparency") },
    final: { step: 6, label: t("results") },
  };

  const handleFileChange = useCallback((f: File | null, p: string | null) => {
    setFile(f);
    setPreview(p);
  }, []);

  const handleStartScan = () => {
    if (!preview) {
      toast.error("Please upload an image first.");
      return;
    }
    setPhase("reverse-image");
  };

  const handleReverseImageComplete = (result: ReverseImageResult) => {
    setReverseImageResult(result);
    setPhase("ocr");
  };

  const handleOCRComplete = (result: OCRResult) => {
    setOcrResult(result);
    setPhase("checking");
    setTimeout(() => {
      if (keywordInputRef.current) {
        const val = keywordInputRef.current.value?.trim().replace(/,$/, "");
        if (val && !keywords.includes(val)) {
          const updated = [...keywords, val];
          setKeywords(updated);
          runIPCheckWithKeywords(updated);
          return;
        }
      }
      runIPCheckWithKeywords(keywords);
    }, 100);
  };

  const runIPCheck = async () => {
    if (keywordInputRef.current) {
      const val = keywordInputRef.current.value.trim().replace(/,$/, "");
      if (val && !keywords.includes(val)) {
        const updated = [...keywords, val];
        setKeywords(updated);
        keywordInputRef.current.value = "";
        return runIPCheckWithKeywords(updated);
      }
    }
    return runIPCheckWithKeywords(keywords);
  };

  const runIPCheckWithKeywords = async (kws: string[]) => {
    if (kws.length === 0) {
      toast.error("Please add at least one keyword to check.");
      setPhase("upload");
      return;
    }

    setPhase("checking");

    try {
      const { data: trademarks, error } = await supabase.from("trademark_database").select("*");
      if (error) throw error;
      if (!trademarks || trademarks.length === 0) {
        toast.error("Could not load trademark database. Please try again.");
        setPhase("upload");
        return;
      }

      const uniqueSources = new Set(trademarks.map((t) => t.source || "manual"));
      const lastUpdated = trademarks.reduce<string | null>((latest, t) => {
        const d = t.last_verified || t.created_at;
        if (!latest) return d;
        return d > latest ? d : latest;
      }, null);

      const matches: IPMatch[] = [];
      for (const kw of kws) {
        const kwLower = kw.toLowerCase();
        for (const tm of trademarks) {
          const termLower = tm.term.toLowerCase();
          if (kwLower.includes(termLower) || termLower.includes(kwLower)) {
            if (!matches.find((m) => m.term === tm.term && m.matchedKeyword === kw)) {
              matches.push({
                term: tm.term,
                matchedKeyword: kw,
                category: tm.category,
                riskLevel: tm.risk_level,
                description: tm.description,
                source: tm.source,
                region: tm.region,
                ownerName: tm.owner_name,
                registrationNumber: tm.registration_number,
                lastVerified: tm.last_verified,
                confidence: getConfidence(tm.source),
              });
            }
          }
        }
      }

      const hasHighRisk = matches.some((m) => m.riskLevel === "high");
      const totalDeduction = matches.reduce((sum, m) => sum + getRiskDeduction(m.riskLevel), 0);
      const score = Math.max(0, 100 - totalDeduction);

      let riskLabel: string;
      let riskEmoji: string;
      if (hasHighRisk || score < 50) {
        riskLabel = t("critical");
        riskEmoji = "🔴";
      } else if (score < 70) {
        riskLabel = t("highRisk");
        riskEmoji = "🟠";
      } else if (score < 90) {
        riskLabel = t("caution");
        riskEmoji = "🟡";
      } else {
        riskLabel = t("safe");
        riskEmoji = "🟢";
      }

      setIpResult({
        score, matches, riskLabel, riskEmoji,
        dbStats: { total: trademarks.length, sources: uniqueSources.size, lastUpdated },
      });
      setPhase("ip-results");
    } catch (err: any) {
      console.error("IP Check error:", err);
      toast.error("Failed to run IP check. " + (err.message || ""));
      setPhase("upload");
    }
  };

  const handleIPBack = () => { setPhase("upload"); setIpResult(null); };
  const handleIPContinue = () => {
    if (!preview) { toast.error("Please upload an image to continue."); setPhase("upload"); return; }
    setPhase("accessibility");
  };
  const handleAccessibilityComplete = (result: AccessibilityResult) => { setAccessibilityResult(result); setPhase("quality"); };
  const handleQualityComplete = (result: QualityResult) => { setQualityResult(result); setPhase("transparency"); };
  const handleTransparencyComplete = (result: TransparencyResult) => { setTransparencyResult(result); setPhase("final"); };

  const handleRestart = () => {
    setFile(null); setPreview(null); setKeywords([]); setReverseImageResult(null);
    setOcrResult(null); setIpResult(null); setAccessibilityResult(null);
    setQualityResult(null); setTransparencyResult(null); setPhase("upload"); setScanConfirmed(false);
  };

  const currentStepInfo = stepLabels[phase];

  return (
    <div className="container max-w-3xl py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{t("newDesignScan")}</h1>
          <p className="text-sm text-muted-foreground">{t("uploadDesignDesc")}</p>
        </div>
      </div>

      <ScanProgress currentStep={currentStepInfo.step} totalSteps={6} stepLabel={currentStepInfo.label} />

      {phase === "upload" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5 text-primary" />
              {t("step1Title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <DesignUpload file={file} preview={preview} onFileChange={handleFileChange} />
            <KeywordInput keywords={keywords} onKeywordsChange={setKeywords} inputRef={keywordInputRef} />
            <div className="rounded-lg border border-muted bg-muted/30 p-3 space-y-2">
              <div className="flex items-start gap-3">
                <Checkbox id="scan-confirm" checked={scanConfirmed} onCheckedChange={(v) => setScanConfirmed(v === true)} />
                <Label htmlFor="scan-confirm" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                  {t("scanConfirmLabel")}{" "}
                  <a href="/terms" target="_blank" className="text-primary underline">{t("seeTerms")}</a>.
                </Label>
              </div>
            </div>
            <div className="pt-2">
              <Button onClick={handleStartScan} className="w-full sm:w-auto" disabled={!scanConfirmed || !preview || keywords.length === 0}>
                {t("startScan")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {phase === "reverse-image" && preview && (
        <ReverseImageSearch imageUrl={preview} onComplete={handleReverseImageComplete} onBack={() => setPhase("upload")} />
      )}

      {phase === "ocr" && preview && (
        <OCRCheck imageUrl={preview} onComplete={handleOCRComplete} onBack={() => setPhase("reverse-image")} />
      )}

      {phase === "checking" && (
        <Card>
          <CardContent className="py-16 flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <div className="text-center">
              <p className="font-semibold">{t("runningIPCheck")}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {t("comparingKeywords")} ({keywords.length})
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {phase === "ip-results" && ipResult && (
        <div className="space-y-4">
          <IPResultsCard result={ipResult} onBack={handleIPBack} />
          <div className="flex justify-end">
            <Button onClick={handleIPContinue}>
              {t("continueAccessibility")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {phase === "accessibility" && preview && (
        <AccessibilityCheck imageUrl={preview} onComplete={handleAccessibilityComplete} onBack={() => setPhase("ip-results")} />
      )}

      {phase === "quality" && preview && (
        <QualityCheck imageUrl={preview} onComplete={handleQualityComplete} onBack={() => setPhase("accessibility")} />
      )}

      {phase === "transparency" && (
        <TransparencyCheck onComplete={handleTransparencyComplete} onBack={() => setPhase("quality")} />
      )}

      {phase === "final" && ipResult && reverseImageResult && ocrResult && accessibilityResult && qualityResult && transparencyResult && (
        <FinalResults
          reverseImageResult={reverseImageResult} ocrResult={ocrResult} ipResult={ipResult}
          accessibilityResult={accessibilityResult} qualityResult={qualityResult}
          transparencyResult={transparencyResult} keywords={keywords} onRestart={handleRestart}
        />
      )}
    </div>
  );
}
