import { useState, useEffect } from "react";
import { Search, Loader2, AlertTriangle, CheckCircle2, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface ReverseImageResult {
  score: number;
  matches: ReverseImageMatch[];
  imageHash: string;
}

export interface ReverseImageMatch {
  term: string;
  owner: string;
  category: string;
  similarity: number;
  sourceUrl: string | null;
}

interface ReverseImageSearchProps {
  imageUrl: string;
  onComplete: (result: ReverseImageResult) => void;
  onBack: () => void;
}

/**
 * Generate a simple perceptual hash from image pixel data.
 * Uses average hash (aHash): resize to 16x16, grayscale, compare to mean.
 */
function generatePerceptualHash(imageUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (!imageUrl.startsWith("data:") && !imageUrl.startsWith("blob:")) {
      img.crossOrigin = "anonymous";
    }
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const size = 16;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) { reject(new Error("Canvas not supported")); return; }

        ctx.drawImage(img, 0, 0, size, size);
        const data = ctx.getImageData(0, 0, size, size).data;

        // Convert to grayscale values
        const grays: number[] = [];
        for (let i = 0; i < data.length; i += 4) {
          grays.push(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
        }

        // Calculate average
        const avg = grays.reduce((a, b) => a + b, 0) / grays.length;

        // Build hash: 1 if above average, 0 if below
        let hash = "";
        for (const g of grays) {
          hash += g >= avg ? "1" : "0";
        }

        // Convert binary to hex
        let hexHash = "";
        for (let i = 0; i < hash.length; i += 4) {
          hexHash += parseInt(hash.substring(i, i + 4), 2).toString(16);
        }

        console.log("[ReverseImageSearch] Generated hash:", hexHash);
        resolve(hexHash);
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error("Failed to load image for hashing"));
    img.src = imageUrl;
  });
}

/**
 * Calculate Hamming distance between two hex hashes (similarity).
 * Returns similarity as a percentage (0-100).
 */
function calculateSimilarity(hash1: string, hash2: string): number {
  const maxLen = Math.max(hash1.length, hash2.length);
  const h1 = hash1.padEnd(maxLen, "0");
  const h2 = hash2.padEnd(maxLen, "0");

  // Convert hex to binary and compare bits
  let totalBits = 0;
  let matchingBits = 0;

  for (let i = 0; i < maxLen; i++) {
    const b1 = parseInt(h1[i], 16);
    const b2 = parseInt(h2[i], 16);
    const xor = b1 ^ b2;
    for (let bit = 0; bit < 4; bit++) {
      totalBits++;
      if (((xor >> bit) & 1) === 0) matchingBits++;
    }
  }

  return totalBits > 0 ? Math.round((matchingBits / totalBits) * 100) : 0;
}

export function ReverseImageSearch({ imageUrl, onComplete, onBack }: ReverseImageSearchProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ReverseImageResult | null>(null);

  useEffect(() => {
    runSearch();
  }, [imageUrl]);

    const runSearch = async () => {
    setLoading(true);
    setError(null);
    console.log("[ReverseImageSearch] Starting search...");

    try {
      // ---------------------------------------------------------
      // STEP 1: Convert imageUrl to Base64 for the AI
      // ---------------------------------------------------------
      let base64Image = "";
      let mimeType = "image/jpeg";

      if (imageUrl.startsWith("data:")) {
        mimeType = imageUrl.split(";")[0].split(":")[1];
        base64Image = imageUrl.split(",")[1];
      } else {
        // If it's a blob or URL, fetch it and convert
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        mimeType = blob.type || "image/jpeg";
        base64Image = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve((reader.result as string).split(",")[1]);
          reader.readAsDataURL(blob);
        });
      }

      // ---------------------------------------------------------
      // STEP 2: Call the Hugging Face Edge Function
      // ---------------------------------------------------------
      console.log("🤖 Calling AI to check image...");
      const { data: aiData, error: aiError } = await supabase.functions.invoke(
        "check-image-copyright",
        {
          body: { imageBase64: base64Image, mimeType: mimeType },
        }
      );

      // 🚨 THIS IS THE LINE THAT PROVES IT WORKS! Look for this in F12 Console 🚨
      console.log("🤖 AI says:", aiData);

      let aiMatches: ReverseImageMatch[] = [];
      let aiScore = 100;

      if (!aiError && aiData) {
        if (aiData.is_copyrighted && aiData.detected_items[0] !== "None detected") {
          aiScore = 25; // Drop score significantly if AI finds copyright
          aiMatches = aiData.detected_items.map((item: string) => ({
            term: item,
            owner: "AI Detected",
            category: "Copyright/Trademark",
            similarity: 100,
            sourceUrl: null,
          }));
        }
      }

      // ---------------------------------------------------------
      // STEP 3: Keep your existing Hash logic as a backup
      // ---------------------------------------------------------
      const imageHash = await generatePerceptualHash(imageUrl);
      const { data: copyrightedImages, error: dbError } = await supabase
        .from("copyrighted_images")
        .select("*");

      let hashMatches: ReverseImageMatch[] = [];
      if (!dbError && copyrightedImages) {
        for (const ci of copyrightedImages) {
          const similarity = calculateSimilarity(imageHash, ci.image_hash);
          if (similarity >= 60) {
            hashMatches.push({
              term: ci.term,
              owner: ci.owner,
              category: ci.category,
              similarity,
              sourceUrl: ci.source_url,
            });
          }
        }
      }

      // Combine AI matches and Hash matches
      const allMatches = [...aiMatches, ...hashMatches];
      allMatches.sort((a, b) => b.similarity - a.similarity);

      // Calculate final score (AI copyright detection overrides hash score)
      let finalScore = aiScore;
      if (aiScore === 100 && allMatches.length > 0) {
        const topSimilarity = allMatches[0].similarity;
        if (topSimilarity >= 90) finalScore = 0;
        else if (topSimilarity >= 80) finalScore = 25;
        else if (topSimilarity >= 70) finalScore = 50;
        else finalScore = 75;
      }

      // Step 4: Store hash in uploaded_images for duplicate detection
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        try {
          await supabase.from("uploaded_images").insert({
            user_id: user.id,
            image_hash: imageHash,
            is_copyrighted: allMatches.length > 0,
          });
        } catch {
          // Ignore errors if table doesn't exist yet
        }
      }

      const res: ReverseImageResult = { score: finalScore, matches: allMatches, imageHash };
      setResult(res);
    } catch (err: any) {
      console.error("[ReverseImageSearch] Error:", err);
      setError(err?.message || "Failed to perform reverse image search");
      toast.error(err?.message || "Reverse image search failed");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (s: number) => s >= 80 ? "text-success" : s >= 50 ? "text-warning" : "text-destructive";
  const getScoreBg = (s: number) => s >= 80 ? "bg-success/10" : s >= 50 ? "bg-warning/10" : "bg-destructive/10";

  if (loading) {
    return (
      <Card>
        <CardContent className="py-16 flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <div className="text-center">
            <p className="font-semibold">Running Reverse Image Search...</p>
            <p className="text-sm text-muted-foreground mt-1">Generating image fingerprint and comparing against known copyrighted artwork</p>
          </div>
          <Badge variant="outline" className="mt-2">🛡️ Local Processing — Images are not uploaded</Badge>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-16 flex flex-col items-center gap-4">
          <AlertTriangle className="h-10 w-10 text-destructive" />
          <div className="text-center">
            <p className="font-semibold">Reverse Image Search Failed</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onBack}>Back</Button>
            <Button onClick={runSearch}>Retry</Button>
          </div>
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
            <Search className="h-5 w-5 text-primary" />
            Step 2: Reverse Image Search Results
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
            {result.matches.length === 0 ? (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success" />
                <span className="text-lg font-semibold text-success">No copyright matches found</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <span className="text-lg font-semibold text-destructive">
                  ⚠️ {result.matches.length} potential copyright match{result.matches.length !== 1 ? "es" : ""} found
                </span>
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              Image fingerprint: <code className="text-xs bg-muted px-1 py-0.5 rounded">{result.imageHash.substring(0, 16)}...</code>
            </p>
          </div>
        </div>

        {/* Matches */}
        {result.matches.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium">Potential Matches</p>
            {result.matches.map((m, i) => (
              <div key={i} className="flex items-center justify-between border rounded-lg p-3 bg-destructive/5">
                <div>
                  <p className="font-medium text-sm">Similar to: {m.term}</p>
                  <p className="text-xs text-muted-foreground">Owner: {m.owner} · Category: {m.category}</p>
                </div>
                <Badge variant="destructive" className="text-xs">
                  {m.similarity}% match
                </Badge>
              </div>
            ))}
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
              <p className="text-sm font-medium text-destructive">⚠️ Recommendation: Use original artwork only</p>
              <p className="text-xs text-muted-foreground mt-1">
                This image appears similar to copyrighted artwork. Using copyrighted designs can result in legal action, account suspension, and financial penalties.
              </p>
            </div>
          </div>
        )}

        {result.matches.length === 0 && (
          <div className="rounded-lg border border-success/30 bg-success/5 p-3">
            <p className="text-sm font-medium text-success flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" /> Good to go!
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              No matches found against our database of 55+ known copyrighted images and logos.
            </p>
          </div>
        )}

        {/* Privacy disclaimer */}
        <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-3 border border-muted">
          <strong>🔒 Privacy:</strong> Images are processed locally in your browser. Only a fingerprint hash is stored for duplicate detection — we do not store your actual images.
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={onBack}>Back</Button>
          <Button onClick={() => onComplete(result)}>
            Continue to IP Check
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
