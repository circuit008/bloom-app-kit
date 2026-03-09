import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { TermsConsentModal } from "@/components/shared/TermsConsentModal";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const [checkingTerms, setCheckingTerms] = useState(true);
  const [needsConsent, setNeedsConsent] = useState(false);

  useEffect(() => {
    if (!user) { setCheckingTerms(false); return; }

    (async () => {
      const { data } = await supabase
        .from("user_profiles")
        .select("terms_accepted_at")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!data?.terms_accepted_at) setNeedsConsent(true);
      setCheckingTerms(false);
    })();
  }, [user]);

  if (loading || checkingTerms) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;

  if (needsConsent) {
    return (
      <>
        {children}
        <TermsConsentModal open={true} onAccepted={() => setNeedsConsent(false)} />
      </>
    );
  }

  return <>{children}</>;
};
