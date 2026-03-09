import { useState } from "react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Shield, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TermsConsentModalProps {
  open: boolean;
  onAccepted: () => void;
}

export function TermsConsentModal({ open, onAccepted }: TermsConsentModalProps) {
  const [termsChecked, setTermsChecked] = useState(false);
  const [privacyChecked, setPrivacyChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  const canAccept = termsChecked && privacyChecked;

  const handleAccept = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const now = new Date().toISOString();
      const { error } = await supabase
        .from("user_profiles")
        .update({ terms_accepted_at: now, privacy_accepted_at: now })
        .eq("user_id", user.id);

      if (error) throw error;
      toast.success("Terms accepted. Welcome to POD Guard!");
      onAccepted();
    } catch (err: any) {
      toast.error(err.message || "Failed to save consent");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Terms & Privacy Consent
          </DialogTitle>
          <DialogDescription>
            Before using POD Guard, please review and accept our legal agreements.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id="terms-consent"
              checked={termsChecked}
              onCheckedChange={(v) => setTermsChecked(v === true)}
            />
            <Label htmlFor="terms-consent" className="text-sm leading-relaxed cursor-pointer">
              I have read and agree to the{" "}
              <Link to="/terms" className="text-primary underline" target="_blank">Terms & Conditions</Link>.
            </Label>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="privacy-consent"
              checked={privacyChecked}
              onCheckedChange={(v) => setPrivacyChecked(v === true)}
            />
            <Label htmlFor="privacy-consent" className="text-sm leading-relaxed cursor-pointer">
              I have read and agree to the{" "}
              <Link to="/privacy" className="text-primary underline" target="_blank">Privacy Policy</Link>.
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleAccept} disabled={!canAccept || loading} className="w-full">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Accept & Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
