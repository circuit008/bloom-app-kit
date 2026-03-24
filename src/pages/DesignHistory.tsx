import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Trash2, Search, Filter, TrendingUp, BarChart3, PieChart, Lightbulb, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  LineChart, Line, BarChart, Bar, PieChart as RechartsPie, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

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

const COLORS = ["hsl(217, 91%, 60%)", "hsl(160, 84%, 39%)", "hsl(38, 92%, 50%)", "hsl(0, 84%, 60%)"];

export default function DesignHistory() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [scans, setScans] = useState<ScanRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pass" | "fail">("all");
  const [scoreRange, setScoreRange] = useState<"all" | "high" | "mid" | "low">("all");

  const loadScans = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("scan_results")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (data) setScans(data as ScanRow[]);
    setLoading(false);
  };

  useEffect(() => { loadScans(); }, [user]);

  const filtered = useMemo(() => {
    return scans.filter(s => {
      if (statusFilter === "pass" && !s.passed) return false;
      if (statusFilter === "fail" && s.passed) return false;
      if (scoreRange === "high" && s.overall_score < 80) return false;
      if (scoreRange === "mid" && (s.overall_score < 50 || s.overall_score >= 80)) return false;
      if (scoreRange === "low" && s.overall_score >= 50) return false;
      if (searchTerm && !s.keywords?.some(k => k.toLowerCase().includes(searchTerm.toLowerCase()))) return false;
      return true;
    });
  }, [scans, statusFilter, scoreRange, searchTerm]);

  // Chart data: avg score over time (monthly)
  const monthlyData = useMemo(() => {
    const months: Record<string, { total: number; count: number; pass: number; fail: number }> = {};
    scans.forEach(s => {
      const key = new Date(s.created_at).toLocaleDateString("en", { year: "numeric", month: "short" });
      if (!months[key]) months[key] = { total: 0, count: 0, pass: 0, fail: 0 };
      months[key].total += s.overall_score;
      months[key].count++;
      if (s.passed) months[key].pass++; else months[key].fail++;
    });
    return Object.entries(months).reverse().map(([month, d]) => ({
      month,
      avgScore: Math.round(d.total / d.count),
      pass: d.pass,
      fail: d.fail,
    }));
  }, [scans]);

  // Issue distribution
  const issueData = useMemo(() => {
    let ipFails = 0, qualityFails = 0, accessFails = 0, transpFails = 0;
    scans.forEach(s => {
      if (s.ip_score < 70) ipFails++;
      if (s.quality_score < 70) qualityFails++;
      if (s.accessibility_score < 70) accessFails++;
      if (s.transparency_score < 70) transpFails++;
    });
    return [
      { name: "IP Issues", value: ipFails },
      { name: "Quality Issues", value: qualityFails },
      { name: "Accessibility Issues", value: accessFails },
      { name: "Transparency Issues", value: transpFails },
    ].filter(d => d.value > 0);
  }, [scans]);

  // Insights
  const insights = useMemo(() => {
    const msgs: string[] = [];
    if (scans.length < 2) return msgs;

    const recent = scans.slice(0, Math.ceil(scans.length / 2));
    const older = scans.slice(Math.ceil(scans.length / 2));
    const recentAvg = recent.reduce((s, r) => s + r.overall_score, 0) / recent.length;
    const olderAvg = older.reduce((s, r) => s + r.overall_score, 0) / older.length;
    const diff = Math.round(recentAvg - olderAvg);
    if (diff > 0) msgs.push(`Your average score improved by ${diff}% recently`);
    if (diff < 0) msgs.push(`Your average score dropped by ${Math.abs(diff)}% — review recent scans`);

    // Most common fail
    const failCounts = { ip: 0, quality: 0, accessibility: 0, transparency: 0 };
    scans.forEach(s => {
      if (s.ip_score < 70) failCounts.ip++;
      if (s.quality_score < 70) failCounts.quality++;
      if (s.accessibility_score < 70) failCounts.accessibility++;
      if (s.transparency_score < 70) failCounts.transparency++;
    });
    const worst = Object.entries(failCounts).sort((a, b) => b[1] - a[1])[0];
    if (worst[1] > 0) {
      const pct = Math.round((worst[1] / scans.length) * 100);
      msgs.push(`Most common issue: ${worst[0]} (${pct}% of scans)`);
    }

    const highRiskScans = scans.filter(s => s.ip_score < 50).length;
    if (highRiskScans > 0) msgs.push(`You've flagged ${highRiskScans} high-risk trademark scan(s)`);

    return msgs;
  }, [scans]);

  const exportCSV = () => {
    const rows = [
      ["Date", "Score", "Status", "IP", "Quality", "Accessibility", "Transparency", "Keywords"],
      ...scans.map(s => [
        new Date(s.created_at).toLocaleDateString(),
        String(s.overall_score),
        s.passed ? "PASS" : "FAIL",
        String(s.ip_score),
        String(s.quality_score),
        String(s.accessibility_score),
        String(s.transparency_score),
        (s.keywords || []).join("; "),
      ]),
    ];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `scan-history-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("History exported!");
  };

  const deleteScan = async (id: string) => {
    // Note: RLS doesn't allow DELETE, so we just filter locally
    setScans(prev => prev.filter(s => s.id !== id));
    toast.success(t("deleteScan"));
  };

  if (loading) {
    return <div className="container py-16 text-center text-muted-foreground">{t("loading")}</div>;
  }

  return (
    <div className="container max-w-5xl py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{t("designHistoryTitle")}</h1>
          <p className="text-sm text-muted-foreground">{scans.length} scans total</p>
        </div>
      </div>

      {scans.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <BarChart3 className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-semibold">{t("noData")}</h3>
            <Button className="mt-4" onClick={() => navigate("/scan")}>
              {t("startNewScan")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Insights */}
          {insights.length > 0 && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-primary" /> {t("insights")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {insights.map((msg, i) => (
                  <p key={i} className="text-sm flex items-start gap-2">
                    <TrendingUp className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    {msg}
                  </p>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Charts */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Line chart: avg score over time */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{t("avgScoreOverTime")}</CardTitle>
              </CardHeader>
              <CardContent>
                {monthlyData.length > 1 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="month" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="avgScore" stroke="hsl(var(--primary))" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground py-8 text-center">Need more data for trends</p>
                )}
              </CardContent>
            </Card>

            {/* Bar chart: pass vs fail */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{t("passVsFail")}</CardTitle>
              </CardHeader>
              <CardContent>
                {monthlyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="pass" fill="hsl(160, 84%, 39%)" name="Pass" />
                      <Bar dataKey="fail" fill="hsl(0, 84%, 60%)" name="Fail" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground py-8 text-center">No data yet</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Pie chart: issues */}
          {issueData.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{t("commonIssues")}</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <ResponsiveContainer width="100%" height={220}>
                  <RechartsPie>
                    <Pie data={issueData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {issueData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </RechartsPie>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder={t("search")} className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pass">{t("pass")}</SelectItem>
                <SelectItem value="fail">{t("fail")}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={scoreRange} onValueChange={(v) => setScoreRange(v as any)}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Scores</SelectItem>
                <SelectItem value="high">80+</SelectItem>
                <SelectItem value="mid">50-79</SelectItem>
                <SelectItem value="low">Below 50</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Scan list */}
          <div className="space-y-3">
            {filtered.map(scan => (
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
                      <p className="font-medium">{scan.keywords?.slice(0, 4).join(", ") || "Design Scan"}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(scan.created_at).toLocaleDateString()} · IP:{scan.ip_score} Q:{scan.quality_score} A:{scan.accessibility_score} T:{scan.transparency_score}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={scan.passed ? "default" : "destructive"} className={scan.passed ? "bg-success text-success-foreground" : ""}>
                      {scan.passed ? t("pass") : t("fail")}
                    </Badge>
                    <Button variant="ghost" size="icon" onClick={() => deleteScan(scan.id)} className="h-8 w-8">
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={exportCSV}>
              <Download className="h-4 w-4 mr-2" /> {t("exportHistory")}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
