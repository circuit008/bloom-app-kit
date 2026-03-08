import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

type AdPlacement = "sidebar" | "results" | "dashboard";

const SIZES: Record<AdPlacement, { w: number; h: number }> = {
  sidebar: { w: 300, h: 600 },
  results: { w: 300, h: 250 },
  dashboard: { w: 728, h: 90 },
};

interface AdBannerProps {
  placement: AdPlacement;
  page: string;
  className?: string;
}

export function AdBanner({ placement, page, className }: AdBannerProps) {
  const logged = useRef(false);
  const size = SIZES[placement];

  useEffect(() => {
    if (logged.current) return;
    logged.current = true;

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from("ad_impressions").insert({
        user_id: user?.id || null,
        placement,
        page,
      });
    })();
  }, [placement, page]);

  return (
    <div
      className={cn(
        "border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-muted-foreground print:hidden",
        className
      )}
      style={{ width: size.w, maxWidth: "100%", height: size.h }}
    >
      <p className="text-sm font-medium">Ad Space</p>
      <p className="text-xs">{size.w} × {size.h}</p>
      <a
        href="mailto:ads@pixelpod.example.com"
        className="text-xs text-primary hover:underline mt-2"
      >
        Advertise Here →
      </a>
    </div>
  );
}
