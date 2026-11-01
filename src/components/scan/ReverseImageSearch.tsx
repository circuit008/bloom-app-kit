
import { useState, useEffect } from "react";
import {
  Search,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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

// Generate a perceptual image fingerprint.
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

        if (!ctx) {
          reject(new Error("Canvas not supported"));
          return;
        }

        ctx.drawImage(img, 0, 0, size, size);

        const data = ctx.getImageData(0, 0, size, size).data;
        const grays: number[] = [];

        for (let i = 0; i < data.length; i += 4) {
          grays.push(
            0.299 * data[i] +
            0.587 * data[i + 1] +
            0.114 * data[i + 2]
          );
        }

        const avg =
          grays.reduce((a, b) => a + b, 0) / grays.length;

        let hash = "";

        for (const g of grays) {
          hash += g >= avg ? "1" : "0";
        }

        let hexHash = "";

        for (let i = 0; i < hash.length; i += 4) {
          hexHash += parseInt(
            hash.substring(i, i + 4),
            2
          ).toString(16);
        }

        console.log("[ReverseImageSearch] Generated hash:", hexHash);

        resolve(hexHash);
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => {
      reject(new Error("Failed to load image for hashing"));
    };

    img.src = imageUrl;
  });
}

export function ReverseImageSearch({
  imageUrl,
  onComplete,
  onBack,
}: ReverseImageSearchProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ReverseImageResult | null>(null);

  const runSearch = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    console.log("[ReverseImageSearch] Starting Gemini AI analysis...");

    try {
      // STEP 1: Convert the image to Base64.

      let base64Image = "";
      let mimeType = "image/jpeg";

      if (imageUrl.startsWith("data:")) {
        mimeType = imageUrl.split(";")[0].split(":")[1];
        base64Image = imageUrl.split(",")[1];
      } else {
        const response = await fetch(imageUrl);

        if (!response.ok) {
          throw new Error("Could not load the selected image.");
        }

        const blob = await response.blob();

        mimeType = blob.type || "image/jpeg";

        base64Image = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();

          reader.onloadend = () => {
            const dataUrl = reader.result as string;
            resolve(dataUrl.split(",")[1]);
          };

          reader.onerror = () => {
            reject(new Error("Could not convert image to Base64."));
          };

          reader.readAsDataURL(blob);
        });
      }

      if (!base64Image) {
        throw new Error("Image data is empty.");
      }

      // STEP 2: Send the image to the Gemini Edge Function.

      console.log("🤖 Sending image to Gemini AI...");

      const { data: aiData, error: aiError } =
        await supabase.functions.invoke("rapid-function", {
          body: {
            imageBase64: base64Image,
            mimeType: mimeType,
          },
        });

      console.log("🤖 Gemini response:", aiData);
      console.log("🤖 Gemini error:", aiError);

      // Do not show a safe result if the AI request failed.

      if (aiError) {
        throw new Error(aiError.message || "Gemini AI request failed.");
      }

      if (!aiData || !aiData.success) {
        throw new Error(
          aiData?.error || "Gemini did not return a valid analysis."
        );
      }

      // STEP 3: Process Gemini's result ONLY.
      // No copyrighted_images database search is performed here.

      const detectedItems: string[] = Array.isArray(aiData.detected_items)
        ? aiData.detected_items.filter(
            (item: unknown): item is string =>
              typeof item === "string" &&
              item.trim().length > 0 &&
              item.toLowerCase() !== "none detected"
          )
        : [];

      const potentialRisk = Boolean(
        aiData.potential_ip_risk || aiData.is_copyrighted
      );

      const rawConfidence = Number(aiData.confidence);

      const confidencePercent = Number.isFinite(rawConfidence)
        ? Math.max(
            0,
            Math.min(
              100,
              Math.round(
                rawConfidence <= 1
                  ? rawConfidence * 100
                  : rawConfidence
              )
            )
          )
        : 0;

      let aiMatches: ReverseImageMatch[] = [];

      if (potentialRisk) {
        // If Gemini reports risk but does not provide an item name,
        // use its explanation as a fallback.

        if (detectedItems.length === 0) {
          const fallback =
            typeof aiData.risk_reason === "string" &&
            aiData.risk_reason.trim()
              ? aiData.risk_reason
              : "Potential intellectual-property risk detected";

          detectedItems.push(fallback);
        }

        aiMatches = detectedItems.map((item) => ({
          term: item,
          owner: "Gemini AI",
          category: "Potential IP Risk",
          similarity: confidencePercent,
          sourceUrl: null,
        }));
      }

      console.log("GEMINI DETECTED ITEMS:", detectedItems);
      console.log("GEMINI IP RISK:", potentialRisk);
      console.log("GEMINI RESULTS:", aiMatches);

      // STEP 4: Generate the image fingerprint.
      // This is kept for duplicate tracking, not for copyright matching.

      let imageHash = "";

      try {
        imageHash = await generatePerceptualHash(imageUrl);
      } catch (hashError) {
        console.warn(
          "[ReverseImageSearch] Could not generate image hash:",
          hashError
        );
      }

      // STEP 5: Store the fingerprint for signed-in users.
      // The copyrighted_images table is NOT queried.

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user && imageHash) {
        try {
          const { error: insertError } = await supabase
            .from("uploaded_images")
            .insert({
              user_id: user.id,
              image_hash: imageHash,
              is_copyrighted: potentialRisk,
            });

          if (insertError) {
            console.warn(
              "[ReverseImageSearch] Could not store image fingerprint:",
              insertError
            );
          }
        } catch (storageError) {
          console.warn(
            "[ReverseImageSearch] Fingerprint storage failed:",
            storageError
          );
        }
      }

      // STEP 6: Prepare the final result.

      const finalScore = potentialRisk ? 25 : 100;

      const finalResult: ReverseImageResult = {
        score: finalScore,
        matches: aiMatches,
        imageHash,
      };

      console.log("FINAL GEMINI RESULTS:", finalResult);

      setResult(finalResult);
    } catch (err: any) {
      console.error("[ReverseImageSearch] Error:", err);

      const message =
        err?.message || "Failed to perform AI image analysis.";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSearch();
  }, [imageUrl]);

  const getScoreColor = (s: number) =>
    s >= 80
      ? "text-success"
      : s >= 50
        ? "text-warning"
        : "text-destructive";

  const getScoreBg = (s: number) =>
    s >= 80
      ? "bg-success/10"
      : s >= 50
        ? "bg-warning/10"
        : "bg-destructive/10";

  // LOADING SCREEN

  if (loading) {
    return (
      <Card>
        <CardContent className="py-16 flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />

          <div className="text-center">
            <p className="font-semibold">
              Analyzing Image with Gemini AI...
            </p>

            <p className="text-sm text-muted-foreground mt-1">
              Checking the image for recognizable brands, logos,
              characters, and potential intellectual-property risks.
            </p>
          </div>

          <Badge variant="outline" className="mt-2">
            Gemini AI Analysis
          </Badge>
        </CardContent>
      </Card>
    );
  }

  // ERROR SCREEN

  if (error) {
    return (
      <Card>
        <CardContent className="py-16 flex flex-col items-center gap-4">
          <AlertTriangle className="h-10 w-10 text-destructive" />

          <div className="text-center">
            <p className="font-semibold">
              AI Image Analysis Failed
            </p>

            <p className="text-sm text-muted-foreground mt-1">
              {error}
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>

            <Button onClick={runSearch}>
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!result) return null;

  // RESULTS SCREEN

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Search className="h-5 w-5 text-primary" />
            Step 2: AI Image Analysis Results
          </CardTitle>

          <Badge variant="outline" className="text-xs">
            Gemini AI
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* AI RISK SCORE */}

        <div className="flex items-center gap-6">
          <div
            className={cn(
              "h-24 w-24 rounded-full flex items-center justify-center",
              getScoreBg(result.score)
            )}
          >
            <span
              className={cn(
                "text-3xl font-extrabold",
                getScoreColor(result.score)
              )}
            >
              {result.score}
            </span>
          </div>

          <div className="space-y-2">
            {result.matches.length === 0 ? (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success" />

                <span className="text-lg font-semibold text-success">
                  No Potential IP Risk Detected
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />

                <span className="text-lg font-semibold text-destructive">
                  Potential IP Risk Detected
                </span>
              </div>
            )}

            {result.imageHash && (
              <p className="text-sm text-muted-foreground">
                Image fingerprint:{" "}
                <code className="text-xs bg-muted px-1 py-0.5 rounded">
                  {result.imageHash.substring(0, 16)}...
                </code>
              </p>
            )}
          </div>
        </div>

        {/* GEMINI FINDINGS */}

        {result.matches.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium">
              Items Identified by Gemini
            </p>

            {result.matches.map((m, i) => (
              <div
                key={i}
                className="flex items-center justify-between border rounded-lg p-3 bg-destructive/5"
              >
                <div>
                  <p className="font-medium text-sm">
                    AI detected: {m.term}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    Source: {m.owner} · Category: {m.category}
                  </p>
                </div>

                {m.similarity > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {m.similarity}% AI confidence
                  </Badge>
                )}
              </div>
            ))}

            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
              <p className="text-sm font-medium text-destructive">
                Potential Intellectual-Property Concern
              </p>

              <p className="text-xs text-muted-foreground mt-1">
                Gemini identified content that may involve
                intellectual-property rights. Review the image and
                verify the relevant rights before using it.
              </p>
            </div>
          </div>
        )}

        {/* NO RISK IDENTIFIED */}

        {result.matches.length === 0 && (
          <div className="rounded-lg border border-success/30 bg-success/5 p-3">
            <p className="text-sm font-medium text-success flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              No Potential Risk Identified
            </p>

            <p className="text-xs text-muted-foreground mt-1">
              Gemini did not identify a potential intellectual-property
              risk in this image. This automated analysis is not a
              guarantee that the image is copyright-free.
            </p>
          </div>
        )}

        {/* PRIVACY INFORMATION */}

        <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-3 border border-muted">
          <strong>Privacy:</strong> The selected image is sent to our
          Supabase Edge Function and Google's Gemini API for AI analysis.
          For signed-in users, the app stores an image fingerprint and
          the AI risk result in the uploaded_images table.
        </div>

        {/* ACTIONS */}

        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>

          <Button onClick={() => onComplete(result)}>
            Continue to IP Check
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
