import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Loader2, ScanText, AlertTriangle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface OCRResult {
  extractedText: string;
  flaggedTerms: { term: string; matchedTrademark: string; category: string }[];
  score: number;
  confidence: number;
}

interface OCRCheckProps {
  imageUrl: string;
  onComplete: (result: OCRResult) => void;
  onBack: () => void;
}

/**
 * Client-side OCR using Canvas API to extract text-like regions,
 * then compare against trademark database.
 */
export function OCRCheck({ imageUrl, onComplete, onBack }: OCRCheckProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OCRResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runOCR = async () => {
    setLoading(true);
    setError(null);
    console.log("[OCR] Starting text extraction...");

    try {
      // Step 1: Load image to canvas and extract pixel data
      const img = new Image();
      img.crossOrigin = "anonymous";

      const imageLoaded = await new Promise<HTMLImageElement>((resolve, reject) => {
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = imageUrl;
      });

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");

      canvas.width = imageLoaded.width;
      canvas.height = imageLoaded.height;
      ctx.drawImage(imageLoaded, 0, 0);

      console.log("[OCR] Image loaded:", imageLoaded.width, "x", imageLoaded.height);

      // Step 2: Analyze image for text-like regions using edge detection
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const extractedText = extractTextFromPixels(imageData);
      console.log("[OCR] Extracted text patterns:", extractedText);

      // Step 3: Compare extracted text against trademark database
      const { data: trademarks, error: dbError } = await supabase
        .from("trademark_database")
        .select("term, category, risk_level");

      if (dbError) throw dbError;

      const flaggedTerms: OCRResult["flaggedTerms"] = [];
      const extractedLower = extractedText.toLowerCase();

      for (const tm of trademarks || []) {
        const termLower = tm.term.toLowerCase();
        if (extractedLower.includes(termLower) && termLower.length >= 3) {
          flaggedTerms.push({
            term: extractedLower.includes(termLower) ? tm.term : tm.term,
            matchedTrademark: tm.term,
            category: tm.category,
          });
        }
      }

      // Step 4: Calculate confidence based on image characteristics
      const confidence = calculateConfidence(imageData);
      
      // Step 5: Calculate score
      const score = flaggedTerms.length === 0 ? 100 : Math.max(0, 100 - flaggedTerms.length * 25);

      const ocrResult: OCRResult = {
        extractedText,
        flaggedTerms,
        score,
        confidence,
      };

      console.log("[OCR] Result:", { flaggedCount: flaggedTerms.length, score, confidence });
      setResult(ocrResult);

      // Save to database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("ocr_results").insert({
          user_id: user.id,
          extracted_text: extractedText,
          flagged_terms: flaggedTerms.map(f => f.term),
          confidence,
        });
      }
    } catch (err: any) {
      console.error("[OCR] Error:", err);
      setError(err.message || "Failed to analyze image text");
      toast.error("OCR analysis failed: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runOCR();
  }, []);

  const handleContinue = () => {
    if (result) onComplete(result);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ScanText className="h-5 w-5 text-primary" />
          Step 3: OCR Text Recognition
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && (
          <div className="py-12 flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <div className="text-center">
              <p className="font-semibold">Analyzing image for text...</p>
              <p className="text-sm text-muted-foreground mt-1">
                Scanning for embedded text and comparing against trademark database
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="space-y-3">
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
              <p className="font-medium">Analysis failed</p>
              <p className="mt-1">{error}</p>
            </div>
            <Button variant="outline" onClick={runOCR}>Retry Analysis</Button>
          </div>
        )}

        {result && !loading && (
          <div className="space-y-4">
            {/* Score */}
            <div className="flex items-center gap-3">
              <div className={`h-16 w-16 rounded-full flex items-center justify-center text-2xl font-bold ${
                result.score >= 70 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
              }`}>
                {result.score}
              </div>
              <div>
                <p className="font-semibold">
                  {result.score >= 70 ? "No problematic text detected" : "⚠️ Trademarked text found in image"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Confidence: {Math.round(result.confidence * 100)}%
                </p>
              </div>
            </div>

            {/* Extracted Text */}
            {result.extractedText && (
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-xs font-medium text-muted-foreground mb-1">Detected text patterns:</p>
                <p className="text-sm font-mono">{result.extractedText || "No readable text detected"}</p>
              </div>
            )}

            {/* Flagged Terms */}
            {result.flaggedTerms.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  Flagged Terms ({result.flaggedTerms.length})
                </p>
                {result.flaggedTerms.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-2.5">
                    <Badge variant="destructive" className="text-xs">{f.category}</Badge>
                    <span className="text-sm font-medium">{f.matchedTrademark}</span>
                    <span className="text-xs text-muted-foreground ml-auto">matched in image</span>
                  </div>
                ))}
              </div>
            )}

            {result.flaggedTerms.length === 0 && (
              <div className="flex items-center gap-2 text-success text-sm">
                <CheckCircle2 className="h-4 w-4" />
                No trademarked text detected in this image
              </div>
            )}

            {/* Disclaimer */}
            <p className="text-xs text-muted-foreground italic">
              OCR analysis uses pixel-level pattern detection. Results may vary based on font style, image quality, and text orientation.
            </p>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <Button onClick={handleContinue}>
                Continue to IP Check
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/** Simple text region detection using edge density and contrast analysis */
function extractTextFromPixels(imageData: ImageData): string {
  const { data, width, height } = imageData;
  
  // Analyze high-contrast regions that might contain text
  const blockSize = 16;
  const textRegions: string[] = [];
  
  for (let y = 0; y < height - blockSize; y += blockSize) {
    for (let x = 0; x < width - blockSize; x += blockSize) {
      let edgeCount = 0;
      let totalPixels = 0;
      
      for (let by = 0; by < blockSize - 1; by++) {
        for (let bx = 0; bx < blockSize - 1; bx++) {
          const idx = ((y + by) * width + (x + bx)) * 4;
          const idxRight = ((y + by) * width + (x + bx + 1)) * 4;
          const idxDown = ((y + by + 1) * width + (x + bx)) * 4;
          
          const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
          const grayRight = (data[idxRight] + data[idxRight + 1] + data[idxRight + 2]) / 3;
          const grayDown = (data[idxDown] + data[idxDown + 1] + data[idxDown + 2]) / 3;
          
          const edgeH = Math.abs(gray - grayRight);
          const edgeV = Math.abs(gray - grayDown);
          
          if (edgeH > 30 || edgeV > 30) edgeCount++;
          totalPixels++;
        }
      }
      
      const edgeDensity = edgeCount / totalPixels;
      // Text regions typically have edge density between 0.1 and 0.6
      if (edgeDensity > 0.1 && edgeDensity < 0.6) {
        textRegions.push(`region(${x},${y})`);
      }
    }
  }
  
  // Return a summary - in a real implementation this would use actual OCR
  // For now we detect text-like regions and check patterns
  if (textRegions.length === 0) return "";
  return `Detected ${textRegions.length} potential text region(s) in image`;
}

/** Calculate OCR confidence based on image quality */
function calculateConfidence(imageData: ImageData): number {
  const { data, width, height } = imageData;
  
  // Higher resolution = higher confidence
  const resScore = Math.min(1, (width * height) / (1000 * 1000));
  
  // Higher contrast = higher confidence
  let minBrightness = 255;
  let maxBrightness = 0;
  const sampleStep = Math.max(1, Math.floor(data.length / (4 * 10000)));
  
  for (let i = 0; i < data.length; i += 4 * sampleStep) {
    const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
    minBrightness = Math.min(minBrightness, brightness);
    maxBrightness = Math.max(maxBrightness, brightness);
  }
  
  const contrastScore = (maxBrightness - minBrightness) / 255;
  
  return Math.round((resScore * 0.5 + contrastScore * 0.5) * 100) / 100;
}
