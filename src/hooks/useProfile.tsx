import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  subscription_status: string;
  total_scans: number;
  affiliate_clicks: number;
  affiliate_earnings: number;
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrCreate = useCallback(async () => {
    if (!user) { setLoading(false); return; }

    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      setProfile(data as UserProfile);
    } else if (!error || error.code === "PGRST116") {
      // Create profile
      const { data: newP } = await supabase
        .from("user_profiles")
        .insert({ user_id: user.id, display_name: user.email?.split("@")[0] || null })
        .select()
        .single();
      if (newP) setProfile(newP as UserProfile);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchOrCreate(); }, [fetchOrCreate]);

  const isPro = profile?.subscription_status === "pro";

  const upgrade = async () => {
    if (!user) return;
    await supabase
      .from("user_profiles")
      .update({ subscription_status: "pro" })
      .eq("user_id", user.id);
    await fetchOrCreate();
  };

  const trackAffiliateClick = async () => {
    if (!user || !profile) return;
    await supabase
      .from("user_profiles")
      .update({
        affiliate_clicks: (profile.affiliate_clicks || 0) + 1,
        affiliate_earnings: Number(profile.affiliate_earnings || 0) + 0.15,
      })
      .eq("user_id", user.id);
    await fetchOrCreate();
  };

  return { profile, loading, isPro, upgrade, trackAffiliateClick, refetch: fetchOrCreate };
}
