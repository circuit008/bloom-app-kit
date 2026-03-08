import { useEffect, useState } from "react";
import { Shield, Upload, BarChart3, Clock, ArrowRight, ShieldCheck, Trophy, TrendingUp, Star, Settings, KeyRound, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdBanner } from "@/components/shared/AdBanner";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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

export default function Dashboard() {
  const { user } = useAuth();
  const { profile, isPro } = useProfile();
  const navigate = useNavigate();
  const [scans, setScans] = useState<ScanRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("scan_results")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);
      if (data) setScans(data as ScanRow[]);
      setLoading(false);
    })();
  }, [user]);

  const totalScans = scans.length;
  const passedScans = scans.filter((s) => s.passed).length;
  const passRate = totalScans > 0 ? Math.round((passedScans / totalScans) * 100) : 0;
  const avgScore = totalScans > 0 ? Math.round(scans.reduce((a, s) => a + s.overall_score, 0) / totalScans) : 0;
  const lastScan = scans[0] ? new Date(scans[0].created_at).toLocaleDateString() : "Never";

  const stats = [
    { label: "Total Scans", value: String(totalScans), icon: BarChart3, color: "text-primary" },
    { label: "Pass Rate", value: `${passRate}%`, icon: Trophy, color: "text-success" },
    { label: "Avg Score", value: String(avgScore), icon: TrendingUp, color: "text-warning" },
    { label: "Last Scan", value: lastScan, icon: Clock, color: "text-muted-foreground" },
  ];

  const isAdmin = user?.email?.includes("admin");

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">
              Welcome back, <span className="text-primary">{user?.email?.split("@")[0]}</span>
            </h1>
            {isPro && (
              <Badge className="bg-primary text-primary-foreground">
                <Star className="h-3 w-3 mr-1" /> PRO
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-1">Here's an overview of your design compliance.</p>
        </div>
        {!isPro && (
          <Button variant="outline" onClick={() => navigate("/pricing")} className="hidden sm:flex">
            <Star className="h-4 w-4 mr-1" /> Upgrade to Pro
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                <s.icon className={cn("h-5 w-5", s.color)} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-bold">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Affiliate Earnings */}
      {profile && profile.affiliate_clicks > 0 && (
        <Card className="border-success/30 bg-success/5">
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Estimated Affiliate Savings</p>
              <p className="text-2xl font-bold text-success">${Number(profile.affiliate_earnings).toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-1">{profile.affiliate_clicks} partner click{profile.affiliate_clicks !== 1 ? "s" : ""}</p>
            </div>
            <Badge variant="outline" className="text-xs">💡 We may earn a commission from partner links</Badge>
          </CardContent>
        </Card>
      )}

      {/* Dashboard Ad */}
      <div className="flex justify-center">
        <AdBanner placement="dashboard" page="dashboard" />
      </div>

      {/* Admin Link */}
      {isAdmin && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <div>
                <p className="font-semibold">Admin Dashboard</p>
                <p className="text-sm text-muted-foreground">Manage trademarks, reports & analytics</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => navigate("/admin/reports")}>
              View Admin <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* New Scan CTA */}
      <Card className="border-dashed">
        <CardContent className="py-12 flex flex-col items-center text-center gap-4">
          <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
            <Upload className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Start a New Scan</h3>
            <p className="text-sm text-muted-foreground mt-1">Upload a design image to check for compliance issues</p>
          </div>
          <Button className="mt-2" onClick={() => navigate("/scan")}>
            Upload Design <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      {/* Scan History */}
      {scans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" /> Recent Scans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scans.map((scan) => (
                <div key={scan.id} className="flex items-center justify-between border rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold",
                      scan.passed ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                    )}>
                      {scan.overall_score}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {scan.keywords?.slice(0, 3).join(", ") || "Design Scan"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(scan.created_at).toLocaleDateString()} · IP:{scan.ip_score} Q:{scan.quality_score} A:{scan.accessibility_score} T:{scan.transparency_score}
                      </p>
                    </div>
                  </div>
                  <Badge variant={scan.passed ? "default" : "destructive"} className={scan.passed ? "bg-success text-success-foreground" : ""}>
                    {scan.passed ? "PASS" : "FAIL"}
                  </Badge>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-3" onClick={() => navigate("/scan-history")}>
              View All History <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="h-5 w-5" /> Profile Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Change Password</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                if (!user?.email) return;
                await supabase.auth.resetPasswordForEmail(user.email);
                toast.success("Password reset email sent!");
              }}
            >
              Send Reset Email
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-destructive" />
              <span className="text-sm text-destructive">Delete Account</span>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => toast.info("Account deletion requires contacting support.")}
            >
              Request Deletion
            </Button>
          </div>
          <p className="text-xs text-muted-foreground pt-2">
            <a href="#" className="underline">Privacy Policy</a> · Your data is processed locally where possible.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
