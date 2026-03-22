import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Flag, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface FalsePositiveReportProps {
  flaggedTerm: string;
  scanId?: string;
}

export function FalsePositiveReport({ flaggedTerm, scanId }: FalsePositiveReportProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      toast.error("You must be logged in to report false positives.");
      return;
    }
    if (!reason.trim()) {
      toast.error("Please provide a reason for your report.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("false_positive_reports").insert({
        user_id: user.id,
        scan_id: scanId || null,
        flagged_term: flaggedTerm,
        reason: reason.trim(),
        status: "pending",
      });

      if (error) throw error;

      setSubmitted(true);
      toast.success("Report submitted! Our team will review it.");
    } catch (err: any) {
      console.error("False positive report error:", err);
      toast.error("Failed to submit report: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-7 px-2">
          <Flag className="h-3 w-3 mr-1" /> Report false positive
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-primary" />
            Report False Positive
          </DialogTitle>
        </DialogHeader>

        {submitted ? (
          <div className="py-6 text-center space-y-3">
            <CheckCircle2 className="h-12 w-12 text-success mx-auto" />
            <p className="font-medium">Report Submitted</p>
            <p className="text-sm text-muted-foreground">
              We'll review your report and update our database if confirmed.
              This helps improve accuracy for all users.
            </p>
            <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Flagged term:</p>
              <Badge variant="outline" className="text-sm">{flaggedTerm}</Badge>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Why is this a false positive?
              </label>
              <Textarea
                placeholder="e.g., This is a common word, not a trademark in this context..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
            </div>

            <p className="text-xs text-muted-foreground">
              Your report helps train our system. Confirmed false positives will be excluded from future scans.
            </p>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={loading || !reason.trim()}>
                {loading && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                Submit Report
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
