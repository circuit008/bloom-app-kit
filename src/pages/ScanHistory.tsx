import { useEffect, useState } from "react";
import { History, Search, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";

interface ScanRow {
  id: string;
  ip_score: number;
  accessibility_score: number;
  quality_score: number;
  transparency_score: number;
  overall_score: number;
  passed: boolean;
  keywords: string[];
  created_at: string;
}

export default function ScanHistory() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [scans, setScans] = useState<ScanRow[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("scan_results").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      if (data) setScans(data as ScanRow[]);
      setLoading(false);
    })();
  }, [user]);

  const filtered = scans.filter((s) =>
    !search || s.keywords?.some((k) => k.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="container py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t("scanHistoryTitle")}</h1>
          <p className="text-muted-foreground mt-1">{t("scanHistoryDesc")}</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t("searchByKeyword")} className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 flex flex-col items-center text-center gap-3">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <History className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">{scans.length === 0 ? t("noScansYet") : t("noMatchingScans")}</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              {scans.length === 0 ? t("firstScanDesc") : t("tryDifferentSearch")}
            </p>
            {scans.length === 0 && (
              <Button onClick={() => navigate("/scan")} className="mt-2">
                {t("startFirstScan")} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((scan) => (
            <Card key={scan.id}>
              <CardContent className="py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "h-12 w-12 rounded-full flex items-center justify-center text-lg font-bold",
                    scan.passed ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                  )}>
                    {scan.overall_score}
                  </div>
                  <div>
                    <p className="font-medium">{scan.keywords?.slice(0, 4).join(", ") || t("designScan")}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(scan.created_at).toLocaleDateString()} · IP:{scan.ip_score} Q:{scan.quality_score} A:{scan.accessibility_score} T:{scan.transparency_score}
                    </p>
                  </div>
                </div>
                <Badge variant={scan.passed ? "default" : "destructive"} className={scan.passed ? "bg-success text-success-foreground" : ""}>
                  {scan.passed ? t("pass") : t("fail")}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
