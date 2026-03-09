import { useState, useEffect, useRef } from "react";
import { Eye, Loader2, ShieldCheck, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface AccessibilityResult {
  score: number;
  contrastRatio: number;
  wcagAA: boolean;
  wcagAAA: boolean;
  dominantColors: string[];
  suggestions: string[];
}

interface AccessibilityCheckProps {
  imageUrl: string;
  onComplete: (result: AccessibilityResult) => void;
  onBack: () => void;
}

type ColorblindMode = "none" | "protanopia" | "deuteranopia" | "tritanopia";

function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function applyColorblindFilter(r: number, g: number, b: number, mode: ColorblindMode): [number, number, number] {
  if (mode === "none") return [r, g, b];
  const matrices: Record<string, number[][]> = {
    protanopia: [[0.567, 0.433, 0], [0.558, 0.442, 0], [0, 0.242, 0.758]],
    deuteranopia: [[0.625, 0.375, 0], [0.7, 0.3, 0], [0, 0.3, 0.7]],
    tritanopia: [[0.95, 0.05, 0], [0, 0.433, 0.567], [0, 0.475, 0.525]],
  };
  const m = matrices[mode];
  return [
    Math.min(255, Math.round(m[0][0] * r + m[0][1] * g + m[0][2] * b)),
    Math.min(255, Math.round(m[1][0] * r + m[1][1] * g + m[1][2] * b)),
    Math.min(255, Math.round(m[2][0] * r + m[2][1] * g + m[2][2] * b)),
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("");
}

export function AccessibilityCheck({ imageUrl, onComplete, onBack }: AccessibilityCheckProps) {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<AccessibilityResult | null>(null);
  const [colorblindMode, setColorblindMode] = useState<ColorblindMode>("none");
  const [showDetails, setShowDetails] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const simCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    analyzeImage();
  }, [imageUrl]);

  useEffect(() => {
    if (result && colorblindMode !== "none") {
      renderColorblindSimulation();
    }
  }, [colorblindMode, result]);

  const analyzeImage = async () => {
    setLoading(true);
    try {
      // Fetch accessibility rules from DB
      const { data: rules, error } = await supabase
        .from("accessibility_rules")
        .select("*");
      if (error) throw error;

      const aaRule = rules?.find((r) => r.rule_name === "Normal Text AA");
      const aaaRule = rules?.find((r) => r.rule_name === "Normal Text AAA");
      const aaThreshold = aaRule ? Number(aaRule.min_contrast_ratio) : 4.5;
      const aaaThreshold = aaaRule ? Number(aaaRule.min_contrast_ratio) : 7.0;

      // Load image onto canvas
      const img = new Image();
      if (!imageUrl.startsWith("data:")) {
        img.crossOrigin = "anonymous";
      }

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = imageUrl;
      });

      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;
      const maxDim = 300;
      const scale = Math.min(maxDim / img.width, maxDim / img.height, 1);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;

      // Collect color samples and luminances
      const luminances: number[] = [];
      const colorCounts: Map<string, number> = new Map();
      const step = 4; // sample every 4th pixel for speed

      for (let i = 0; i < pixels.length; i += 4 * step) {
        const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];
        luminances.push(getLuminance(r, g, b));
        const hex = rgbToHex(
          Math.round(r / 32) * 32,
          Math.round(g / 32) * 32,
          Math.round(b / 32) * 32
        );
        colorCounts.set(hex, (colorCounts.get(hex) || 0) + 1);
      }

      // Sort luminances and get contrast between lightest and darkest quartiles
      luminances.sort((a, b) => a - b);
      const q1 = luminances[Math.floor(luminances.length * 0.1)];
      const q4 = luminances[Math.floor(luminances.length * 0.9)];
      const contrastRatio = getContrastRatio(q4, q1);

      // Dominant colors
      const sortedColors = [...colorCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([hex]) => hex);

      const wcagAA = contrastRatio >= aaThreshold;
      const wcagAAA = contrastRatio >= aaaThreshold;

      // Score calculation
      let score: number;
      if (contrastRatio >= aaaThreshold) {
        score = 100;
      } else if (contrastRatio >= aaThreshold) {
        score = 70 + ((contrastRatio - aaThreshold) / (aaaThreshold - aaThreshold)) * 20;
      } else {
        score = Math.max(0, (contrastRatio / aaThreshold) * 70);
      }
      score = Math.round(score);

      const suggestions: string[] = [];
      if (!wcagAA) {
        suggestions.push("Increase contrast between foreground and background colors");
        suggestions.push("Consider using darker text on lighter backgrounds");
      }
      if (!wcagAAA) {
        suggestions.push("For AAA compliance, aim for a contrast ratio of 7:1 or higher");
      }
      if (sortedColors.length <= 2) {
        suggestions.push("Limited color palette detected — ensure sufficient contrast for text overlays");
      }

      const res: AccessibilityResult = {
        score,
        contrastRatio: Math.round(contrastRatio * 100) / 100,
        wcagAA,
        wcagAAA,
        dominantColors: sortedColors,
        suggestions,
      };

      setResult(res);
    } catch (err: any) {
      console.error("Accessibility analysis error:", err);
      toast.error("Failed to analyze image accessibility");
    } finally {
      setLoading(false);
    }
  };

  const renderColorblindSimulation = () => {
    const srcCanvas = canvasRef.current;
    const simCanvas = simCanvasRef.current;
    if (!srcCanvas || !simCanvas) return;

    const srcCtx = srcCanvas.getContext("2d")!;
    simCanvas.width = srcCanvas.width;
    simCanvas.height = srcCanvas.height;
    const simCtx = simCanvas.getContext("2d")!;

    const imageData = srcCtx.getImageData(0, 0, srcCanvas.width, srcCanvas.height);
    const data = new Uint8ClampedArray(imageData.data);

    for (let i = 0; i < data.length; i += 4) {
      const [r, g, b] = applyColorblindFilter(data[i], data[i + 1], data[i + 2], colorblindMode);
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
    }

    simCtx.putImageData(new ImageData(data, simCanvas.width, simCanvas.height), 0, 0);
  };

  const getScoreColor = (s: number) => s >= 80 ? "text-success" : s >= 50 ? "text-warning" : "text-destructive";
  const getScoreBg = (s: number) => s >= 80 ? "bg-success/10" : s >= 50 ? "bg-warning/10" : "bg-destructive/10";

  if (loading) {
    return (
      <Card>
        <CardContent className="py-16 flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <div className="text-center">
            <p className="font-semibold">Analyzing Accessibility...</p>
            <p className="text-sm text-muted-foreground mt-1">Checking color contrast and WCAG compliance</p>
          </div>
          <Badge variant="outline" className="mt-2">🛡️ Local Processing — No image upload</Badge>
        </CardContent>
      </Card>
    );
  }

  if (!result) return null;

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Eye className="h-5 w-5 text-primary" />
            Step 2: Accessibility Check Results
          </CardTitle>
          <Badge variant="outline" className="text-xs">🛡️ Local Processing</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Score */}
        <div className="flex items-center gap-6">
          <div className={cn("h-24 w-24 rounded-full flex items-center justify-center", getScoreBg(result.score))}>
            <span className={cn("text-3xl font-extrabold", getScoreColor(result.score))}>{result.score}</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">Contrast Ratio: {result.contrastRatio}:1</span>
            </div>
            <div className="flex gap-2">
              <Badge variant={result.wcagAA ? "default" : "destructive"} className="gap-1">
                {result.wcagAA ? <ShieldCheck className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                WCAG AA {result.wcagAA ? "Pass" : "Fail"}
              </Badge>
              <Badge variant={result.wcagAAA ? "default" : "secondary"} className="gap-1">
                {result.wcagAAA ? <ShieldCheck className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                WCAG AAA {result.wcagAAA ? "Pass" : "Fail"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Dominant Colors */}
        <div>
          <p className="text-sm font-medium mb-2">Dominant Colors</p>
          <div className="flex gap-2">
            {result.dominantColors.map((c, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-lg border" style={{ backgroundColor: c }} />
                <span className="text-[10px] text-muted-foreground">{c}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Colorblind simulation */}
        <div className="space-y-3 border-t pt-4">
          <p className="text-sm font-medium">Colorblind Simulation</p>
          <Select value={colorblindMode} onValueChange={(v) => setColorblindMode(v as ColorblindMode)}>
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="Select simulation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Normal Vision</SelectItem>
              <SelectItem value="protanopia">Protanopia (Red-blind)</SelectItem>
              <SelectItem value="deuteranopia">Deuteranopia (Green-blind)</SelectItem>
              <SelectItem value="tritanopia">Tritanopia (Blue-blind)</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-4 items-start">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Original</p>
              <canvas ref={canvasRef} className="rounded-lg border max-w-[200px]" />
            </div>
            {colorblindMode !== "none" && (
              <div>
                <p className="text-xs text-muted-foreground mb-1 capitalize">{colorblindMode}</p>
                <canvas ref={simCanvasRef} className="rounded-lg border max-w-[200px]" />
              </div>
            )}
          </div>
        </div>

        {/* Suggestions */}
        {result.suggestions.length > 0 && (
          <div className="space-y-2">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
            >
              {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              Fix Suggestions ({result.suggestions.length})
            </button>
            {showDetails && (
              <ul className="space-y-1 pl-6 list-disc text-sm text-muted-foreground">
                {result.suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={onBack}>Back</Button>
          <Button onClick={() => onComplete(result)}>
            Continue to Quality Check
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
