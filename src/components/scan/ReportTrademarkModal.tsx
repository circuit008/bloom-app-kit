import { useState } from "react";
import { Flag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const CATEGORIES = [
  { value: "fashion", label: "Fashion" },
  { value: "entertainment", label: "Entertainment" },
  { value: "technology", label: "Technology" },
  { value: "sports", label: "Sports" },
  { value: "food", label: "Food" },
  { value: "other", label: "Other" },
];

export function ReportTrademarkModal() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [term, setTerm] = useState("");
  const [category, setCategory] = useState("other");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!term.trim()) {
      toast.error("Trademark term is required.");
      return;
    }
    if (!user) {
      toast.error("You must be logged in.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("trademark_reports").insert({
        user_id: user.id,
        reported_term: term.trim(),
        category,
        evidence_url: evidenceUrl.trim() || null,
        notes: notes.trim() || null,
        status: "pending",
      });

      if (error) throw error;

      toast.success("Trademark reported successfully! It will be reviewed shortly.");
      setTerm("");
      setCategory("other");
      setEvidenceUrl("");
      setNotes("");
      setOpen(false);
    } catch (err: any) {
      console.error("Report error:", err);
      toast.error("Failed to submit report. " + (err.message || ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Flag className="h-4 w-4" />
          Don't see a trademark? Report it to help others
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report a Trademark</DialogTitle>
          <DialogDescription>
            Help the community by reporting trademarks not yet in our database.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="term">Trademark Term *</Label>
            <Input
              id="term"
              placeholder="e.g., Disney, Nike…"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="evidence">Evidence URL (optional)</Label>
            <Input
              id="evidence"
              placeholder="e.g., USPTO link"
              value={evidenceUrl}
              onChange={(e) => setEvidenceUrl(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="e.g., I got banned from Etsy for this"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Report
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
