import { useState, useEffect } from "react";
import { Ruler, Loader2, CheckCircle, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface QualityResult {
  score: number;
  width: number;
  height: number;
  estimatedDPI: number;
  meetsRequirements: boolean;
  productType: string;
  requiredWidth: number;
  requiredHeight: number;
  suggestions: string[];
}

interface PrintRequirement {
  id: string;
  product_type: string;
  min_width_px: number;
  min_height_px: number;
  recommended_dpi: number;
  description: string | null;
}

interface QualityCheckProps {
  imageUrl: string;
  onComplete: (result: QualityResult) => void;
  onBack: () => void;
}

export function QualityCheck({ imageUrl, onComplete, onBack }: QualityCheckProps) {
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [requirements, setRequirements] = useState<PrintRequirement[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [result, setResult] = useState<QualityResult | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadData();
  }, [imageUrl]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch print requirements
      const { data, error } = await supabase.from("print_requirements").select("*");
      if (error) throw error;
      setRequirements((data as PrintRequirement[]) || []);

      // Get image dimensions
      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
          resolve();
        };
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = imageUrl;
      });
    } catch (err: any) {
      console.error("Quality check load error:", err);
      toast.error("Failed to load quality requirements");
    } finally {
      setLoading(false);
    }
  };

  const runQualityCheck = () => {
    if (!selectedProduct || !imageDimensions) return;

    setAnalyzing(true);

    const req = requirements.find((r) => r.id === selectedProduct);
    if (!req) return;

    // Calculate estimated DPI: image pixels / (print area in inches)
    // Assume screen PPI = 96, print DPI target = 300
    // Simplified: DPI = (image_px / required_px) * recommended_dpi
    const widthRatio = imageDimensions.width / req.min_width_px;
    const heightRatio = imageDimensions.height / req.min_height_px;
    const avgRatio = (widthRatio + heightRatio) / 2;
    const estimatedDPI = Math.round(avgRatio * req.recommended_dpi);

    const meetsWidth = imageDimensions.width >= req.min_width_px;
    const meetsHeight = imageDimensions.height >= req.min_height_px;
    const meetsRequirements = meetsWidth && meetsHeight;

    // Score calculation
    let score: number;
    if (meetsRequirements && estimatedDPI >= req.recommended_dpi) {
      score = 100;
    } else if (meetsRequirements) {
      score = 80;
    } else {
      const sizeRatio = Math.min(widthRatio, heightRatio);
      score = Math.max(0, Math.round(sizeRatio * 80));
    }

    const suggestions: string[] = [];
    if (!meetsWidth) {
      suggestions.push(`Image width (${imageDimensions.width}px) is below minimum (${req.min_width_px}px). Scale up or use a higher-res source.`);
    }
    if (!meetsHeight) {
      suggestions.push(`Image height (${imageDimensions.height}px) is below minimum (${req.min_height_px}px). Scale up or use a higher-res source.`);
    }
    if (estimatedDPI < req.recommended_dpi) {
      suggestions.push(`Estimated print DPI (${estimatedDPI}) is below recommended (${req.recommended_dpi}). Use a larger image for crisp prints.`);
    }
    if (suggestions.length === 0) {
      suggestions.push("Your image meets all quality requirements for this product type!");
    }

    const res: QualityResult = {
      score,
      width: imageDimensions.width,
      height: imageDimensions.height,
      estimatedDPI,
      meetsRequirements,
      productType: req.product_type,
      requiredWidth: req.min_width_px,
      requiredHeight: req.min_height_px,
      suggestions,
    };

    setTimeout(() => {
      setResult(res);
      setAnalyzing(false);
    }, 800); // brief delay for UX
  };

  const getScoreColor = (s: number) => s >= 80 ? "text-success" : s >= 50 ? "text-warning" : "text-destructive";
  const getScoreBg = (s: number) => s >= 80 ? "bg-success/10" : s >= 50 ? "bg-warning/10" : "bg-destructive/10";

  if (loading) {
    return (
      <Card>
        <CardContent className="py-16 flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <div className="text-center">
            <p className="font-semibold">Loading Quality Requirements...</p>
            <p className="text-sm text-muted-foreground mt-1">Fetching print specifications</p>
          </div>
          <Badge variant="outline" className="mt-2">🛡️ Local Processing — No image upload</Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Ruler className="h-5 w-5 text-primary" />
            Step 3: Print Quality Check
          </CardTitle>
          <Badge variant="outline" className="text-xs">🛡️ Local Processing</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Image info */}
        {imageDimensions && (
          <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
            <img src={imageUrl} alt="Design" className="w-16 h-16 object-contain rounded" />
            <div>
              <p className="text-sm font-medium">Your Image</p>
              <p className="text-sm text-muted-foreground">
                {imageDimensions.width} × {imageDimensions.height}px
              </p>
            </div>
          </div>
        )}

        {/* Product selection */}
        {!result && (
          <>
            <div>
              <p className="text-sm font-medium mb-2">Select Product Type</p>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a product type..." />
                </SelectTrigger>
                <SelectContent>
                  {requirements.map((req) => (
                    <SelectItem key={req.id} value={req.id}>
                      {req.product_type} — {req.min_width_px}×{req.min_height_px}px
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={onBack}>Back</Button>
              <Button onClick={runQualityCheck} disabled={!selectedProduct || analyzing}>
                {analyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Check Quality"
                )}
              </Button>
            </div>
          </>
        )}

        {/* Results */}
        {result && (
          <>
            <div className="flex items-center gap-6">
              <div className={cn("h-24 w-24 rounded-full flex items-center justify-center", getScoreBg(result.score))}>
                <span className={cn("text-3xl font-extrabold", getScoreColor(result.score))}>{result.score}</span>
              </div>
              <div className="space-y-2">
                <p className="text-lg font-semibold">{result.productType}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={result.meetsRequirements ? "default" : "destructive"} className="gap-1">
                    {result.meetsRequirements ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                    Resolution {result.meetsRequirements ? "OK" : "Too Low"}
                  </Badge>
                  <Badge variant={result.estimatedDPI >= 300 ? "default" : "secondary"} className="gap-1">
                    ~{result.estimatedDPI} DPI
                  </Badge>
                </div>
              </div>
            </div>

            {/* Dimension comparison */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-muted-foreground">Your Image</p>
                <p className="font-semibold">{result.width} × {result.height}px</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-muted-foreground">Required Minimum</p>
                <p className="font-semibold">{result.requiredWidth} × {result.requiredHeight}px</p>
              </div>
            </div>

            {/* Suggestions */}
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

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setResult(null)}>Change Product</Button>
              <Button onClick={() => onComplete(result)}>View Combined Results</Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
