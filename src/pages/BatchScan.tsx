import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Loader2, Download, RotateCcw, FileImage, AlertTriangle, CheckCircle2, XCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface BatchFile {
  file: File;
  preview: string;
  status: "pending" | "scanning" | "done" | "error";
  score?: number;
  passed?: boolean;
  issues?: string[];
  scores?: { ip: number; accessibility: number; quality: number; transparency: number };
}

const MAX_FILES = 10;
const ACCEPTED = ["image/png", "image/jpeg", "image/svg+xml"];

export default function BatchScan() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [files, setFiles] = useState<BatchFile[]>([]);
  const [scanning, setScanning] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [totalTime, setTotalTime] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const arr = Array.from(newFiles).filter(f => ACCEPTED.includes(f.type));
    if (files.length + arr.length > MAX_FILES) {
      toast.error(t("maxImagesWarning"));
      return;
    }
    const batch: BatchFile[] = arr.map(f => ({
      file: f,
      preview: URL.createObjectURL(f),
      status: "pending",
    }));
    setFiles(prev => [...prev, ...batch]);
  }, [files.length, t]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const removeFile = (index: number) => {
    setFiles(prev => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const runSingleScan = async (bf: BatchFile): Promise<BatchFile> => {
    // Simulate scan checks using image analysis
    const img = new Image();
    img.crossOrigin = "anonymous";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Failed to load"));
      img.src = bf.preview;
    });

    // Quality check
    const qualityScore = img.width >= 3000 && img.height >= 3000 ? 100 : img.width >= 2000 ? 80 : 50;

    // IP check (compare keywords from filename)
    const { data: trademarks } = await supabase.from("trademark_database").select("term, risk_level");
    const filename = bf.file.name.toLowerCase().replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");
    const ipMatches = (trademarks || []).filter(tm => filename.includes(tm.term.toLowerCase()));
    const ipScore = Math.max(0, 100 - ipMatches.reduce((sum, m) => sum + (m.risk_level === "high" ? 50 : 20), 0));

    // Accessibility (basic contrast estimation)
    const canvas = document.createElement("canvas");
    canvas.width = Math.min(img.width, 100);
    canvas.height = Math.min(img.height, 100);
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let minL = 255, maxL = 0;
    for (let i = 0; i < imageData.length; i += 16) {
      const lum = 0.299 * imageData[i] + 0.587 * imageData[i + 1] + 0.114 * imageData[i + 2];
      if (lum < minL) minL = lum;
      if (lum > maxL) maxL = lum;
    }
    const contrast = (maxL + 0.05) / (minL + 0.05);
    const accessibilityScore = contrast >= 4.5 ? 100 : contrast >= 3 ? 70 : 40;

    // Transparency score (random certified printers check)
    const transparencyScore = 75;

    const overall = Math.round(
      ipScore * 0.30 + qualityScore * 0.25 + accessibilityScore * 0.25 + transparencyScore * 0.20
    );
    const passed = overall >= 70;

    const issues: string[] = [];
    if (ipScore < 70) issues.push(`IP: ${ipMatches.length} trademark match(es)`);
    if (qualityScore < 70) issues.push(`Quality: ${img.width}×${img.height}px too low`);
    if (accessibilityScore < 70) issues.push(`Accessibility: contrast ${contrast.toFixed(1)}:1`);

    // Save to DB
    if (user) {
      await supabase.from("scan_results").insert({
        user_id: user.id,
        ip_score: ipScore,
        accessibility_score: accessibilityScore,
        quality_score: qualityScore,
        transparency_score: transparencyScore,
        overall_score: overall,
        passed,
        keywords: [bf.file.name],
      });
    }

    return {
      ...bf,
      status: "done",
      score: overall,
      passed,
      issues,
      scores: { ip: ipScore, accessibility: accessibilityScore, quality: qualityScore, transparency: transparencyScore },
    };
  };

  const startBatchScan = async () => {
    if (files.length === 0) return;
    setScanning(true);
    setStartTime(Date.now());
    const updated = [...files];

    for (let i = 0; i < updated.length; i++) {
      if (updated[i].status === "done") continue;
      setCurrentIndex(i);
      updated[i] = { ...updated[i], status: "scanning" };
      setFiles([...updated]);

      try {
        updated[i] = await runSingleScan(updated[i]);
      } catch {
        updated[i] = { ...updated[i], status: "error", score: 0, passed: false, issues: ["Scan failed"] };
      }
      setFiles([...updated]);
    }

    setTotalTime(Math.round((Date.now() - (startTime || Date.now())) / 1000));
    setScanning(false);
  };

  const retryFailed = async () => {
    const updated = files.map(f => f.status === "error" ? { ...f, status: "pending" as const } : f);
    setFiles(updated);
    setScanning(true);
    setStartTime(Date.now());

    for (let i = 0; i < updated.length; i++) {
      if (updated[i].status !== "pending") continue;
      setCurrentIndex(i);
      updated[i] = { ...updated[i], status: "scanning" };
      setFiles([...updated]);
      try {
        updated[i] = await runSingleScan(updated[i]);
      } catch {
        updated[i] = { ...updated[i], status: "error", score: 0, passed: false, issues: ["Scan failed"] };
      }
      setFiles([...updated]);
    }
    setTotalTime(Math.round((Date.now() - (startTime || Date.now())) / 1000));
    setScanning(false);
  };

  const exportCSV = () => {
    const doneFiles = files.filter(f => f.status === "done");
    if (doneFiles.length === 0) return;
    const rows = [
      ["Image Name", "Score", "Status", "IP", "Quality", "Accessibility", "Transparency", "Issues"],
      ...doneFiles.map(f => [
        f.file.name,
        String(f.score || 0),
        f.passed ? "PASS" : "FAIL",
        String(f.scores?.ip || 0),
        String(f.scores?.quality || 0),
        String(f.scores?.accessibility || 0),
        String(f.scores?.transparency || 0),
        (f.issues || []).join("; "),
      ])
    ];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `batch-scan-results-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported!");
  };

  const doneFiles = files.filter(f => f.status === "done");
  const passedCount = doneFiles.filter(f => f.passed).length;
  const failedCount = doneFiles.filter(f => !f.passed).length;
  const errorCount = files.filter(f => f.status === "error").length;
  const avgScore = doneFiles.length > 0 ? Math.round(doneFiles.reduce((s, f) => s + (f.score || 0), 0) / doneFiles.length) : 0;

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{t("batchScanTitle")}</h1>
          <p className="text-sm text-muted-foreground">{t("batchScanDesc")}</p>
        </div>
      </div>

      {/* Upload area */}
      {!scanning && doneFiles.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="font-medium">Drop images here or click to browse</p>
              <p className="text-sm text-muted-foreground mt-1">PNG, JPG, SVG • Max {MAX_FILES} images</p>
              <input
                ref={inputRef}
                type="file"
                multiple
                accept=".png,.jpg,.jpeg,.svg"
                className="hidden"
                onChange={(e) => e.target.files && addFiles(e.target.files)}
              />
            </div>

            {files.length > 0 && (
              <div className="mt-4 space-y-3">
                <p className="text-sm font-medium">{files.length} {t("imagesSelected")}</p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {files.map((f, i) => (
                    <div key={i} className="relative group">
                      <img src={f.preview} alt={f.file.name} className="h-20 w-full object-cover rounded-lg border" />
                      <button
                        onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                        className="absolute top-1 right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                      <p className="text-xs truncate mt-1">{f.file.name}</p>
                    </div>
                  ))}
                </div>
                {files.length > MAX_FILES && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4" /> {t("maxImagesWarning")}
                  </p>
                )}
                <Button onClick={startBatchScan} disabled={files.length === 0 || files.length > MAX_FILES}>
                  {t("startScan")} ({files.length} images)
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Scanning progress */}
      {scanning && (
        <Card>
          <CardContent className="py-8 space-y-4">
            <div className="flex items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="font-semibold">
                {t("scanningOf")} {currentIndex + 1} {t("of")} {files.length}...
              </p>
            </div>
            <Progress value={((currentIndex + 1) / files.length) * 100} />
            <p className="text-sm text-muted-foreground">{files[currentIndex]?.file.name}</p>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      {!scanning && doneFiles.length > 0 && (
        <>
          <div className="grid sm:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold">{doneFiles.length}</p>
                <p className="text-sm text-muted-foreground">{t("totalScans")}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-success">{passedCount}</p>
                <p className="text-sm text-muted-foreground">{t("pass")}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-destructive">{failedCount}</p>
                <p className="text-sm text-muted-foreground">{t("fail")}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold">{avgScore}</p>
                <p className="text-sm text-muted-foreground">{t("avgScore")}</p>
                {totalTime !== null && <p className="text-xs text-muted-foreground mt-1">{totalTime}s total</p>}
              </CardContent>
            </Card>
          </div>

          {/* Results table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("results")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("imageName")}</TableHead>
                    <TableHead>{t("score")}</TableHead>
                    <TableHead>{t("status")}</TableHead>
                    <TableHead>{t("issues")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...files]
                    .sort((a, b) => (a.score || 0) - (b.score || 0))
                    .map((f, i) => (
                      <TableRow key={i}>
                        <TableCell className="flex items-center gap-2">
                          <FileImage className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate max-w-[200px]">{f.file.name}</span>
                        </TableCell>
                        <TableCell>
                          <span className={cn("font-bold", f.passed ? "text-success" : "text-destructive")}>
                            {f.score ?? "—"}
                          </span>
                        </TableCell>
                        <TableCell>
                          {f.status === "done" ? (
                            <Badge variant={f.passed ? "default" : "destructive"} className={f.passed ? "bg-success text-success-foreground" : ""}>
                              {f.passed ? <><CheckCircle2 className="h-3 w-3 mr-1" />{t("pass")}</> : <><XCircle className="h-3 w-3 mr-1" />{t("fail")}</>}
                            </Badge>
                          ) : f.status === "error" ? (
                            <Badge variant="destructive">Error</Badge>
                          ) : (
                            <Badge variant="outline">Pending</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {f.issues?.join(", ") || "None"}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Bulk actions */}
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={exportCSV}>
              <Download className="h-4 w-4 mr-2" /> {t("exportCSV")}
            </Button>
            {errorCount > 0 && (
              <Button variant="outline" onClick={retryFailed}>
                <RotateCcw className="h-4 w-4 mr-2" /> {t("retryFailed")}
              </Button>
            )}
            <Button variant="outline" onClick={() => { setFiles([]); setTotalTime(null); }}>
              Scan More
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
