import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, ShieldCheck, XCircle, CheckCircle, RefreshCw, Globe, Clock, KeyRound, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Report {
  id: string;
  reported_term: string;
  category: string;
  status: string;
  evidence_url: string | null;
  notes: string | null;
  created_at: string;
}

interface SyncLog {
  id: string;
  source: string;
  trademarks_synced: number;
  status: string;
  error_message: string | null;
  sync_duration_ms: number | null;
  created_at: string;
}

function statusBadge(status: string) {
  if (status === "verified") return <Badge className="bg-success/20 text-success border-success/30">Verified</Badge>;
  if (status === "rejected") return <Badge variant="destructive">Rejected</Badge>;
  return <Badge variant="secondary">Pending</Badge>;
}

function syncStatusBadge(status: string) {
  if (status === "success") return <Badge className="bg-success/20 text-success border-success/30">Success</Badge>;
  if (status === "failed") return <Badge variant="destructive">Failed</Badge>;
  return <Badge variant="secondary">Pending</Badge>;
}

function sourceBadge(source: string) {
  const colors: Record<string, string> = {
    EUIPO: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    USPTO: "bg-red-500/20 text-red-400 border-red-500/30",
    CIPO: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  };
  return <Badge className={colors[source] || ""}>{source}</Badge>;
}

export default function AdminReports() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [syncingEuipo, setSyncingEuipo] = useState(false);
  const [syncingUspto, setSyncingUspto] = useState(false);
  const [syncingCipo, setSyncingCipo] = useState(false);
  const [usptoApiKey, setUsptoApiKey] = useState("");

  const isAdmin = user?.email?.includes("admin");

  useEffect(() => {
    if (!isAdmin) return;
    fetchReports();
    fetchSyncLogs();
  }, [isAdmin]);

  const fetchReports = async () => {
    const { data, error } = await supabase
      .from("trademark_reports")
      .select("id, reported_term, category, status, evidence_url, notes, created_at")
      .order("created_at", { ascending: false });

    if (!error && data) setReports(data);
    setLoading(false);
  };

  const fetchSyncLogs = async () => {
    const { data } = await supabase
      .from("api_sync_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (data) setSyncLogs(data as SyncLog[]);
  };

  const syncFromEUIPO = async () => {
    setSyncingEuipo(true);
    try {
      const { data, error } = await supabase.functions.invoke("sync-euipo", {
        body: { searchTerm: "clothing", maxResults: 100 },
      });
      if (error) throw error;
      if (data?.success) {
        toast.success(`Synced ${data.count} trademarks from EUIPO in ${data.duration_ms}ms`);
      } else {
        toast.error("Sync completed but returned no results.");
      }
      fetchSyncLogs();
    } catch (err: any) {
      console.error("EUIPO sync error:", err);
      toast.error("Failed to sync from EUIPO. " + (err.message || ""));
      fetchSyncLogs();
    } finally {
      setSyncingEuipo(false);
    }
  };

  const syncFromUSPTO = async () => {
    if (!usptoApiKey.trim()) {
      toast.error("Please enter your USPTO API key first.");
      return;
    }
    setSyncingUspto(true);
    try {
      const { data, error } = await supabase.functions.invoke("sync-uspto", {
        body: { searchTerm: "clothing", maxResults: 100, apiKey: usptoApiKey.trim() },
      });
      if (error) throw error;
      if (data?.success) {
        toast.success(`Synced ${data.count} trademarks from USPTO in ${data.duration_ms}ms`);
      } else {
        toast.error("Sync completed but returned no results.");
      }
      fetchSyncLogs();
    } catch (err: any) {
      console.error("USPTO sync error:", err);
      toast.error("Failed to sync from USPTO. " + (err.message || ""));
      fetchSyncLogs();
    } finally {
      setSyncingUspto(false);
    }
  };

  const syncFromCIPO = async () => {
    setSyncingCipo(true);
    try {
      const { data, error } = await supabase.functions.invoke("sync-cipo", {
        body: { searchTerm: "clothing", maxResults: 100 },
      });
      if (error) throw error;
      if (data?.success) {
        toast.success(`Synced ${data.count} trademarks from CIPO in ${data.duration_ms}ms`);
      } else {
        toast.error("Sync completed but returned no results.");
      }
      fetchSyncLogs();
    } catch (err: any) {
      console.error("CIPO sync error:", err);
      toast.error("Failed to sync from CIPO. " + (err.message || ""));
      fetchSyncLogs();
    } finally {
      setSyncingCipo(false);
    }
  };

  const updateStatus = async (report: Report, newStatus: "verified" | "rejected") => {
    setUpdating(report.id);
    try {
      const { error } = await supabase
        .from("trademark_reports")
        .update({ status: newStatus })
        .eq("id", report.id);

      if (error) throw error;

      if (newStatus === "verified") {
        const { error: insertError } = await supabase
          .from("trademark_database")
          .insert({
            term: report.reported_term,
            category: report.category,
            risk_level: "high",
            description: `Community reported. ${report.notes || ""}`.trim(),
          });

        if (insertError) {
          console.error("Failed to add to trademark DB:", insertError);
          toast.error("Status updated but failed to add to trademark database.");
        } else {
          toast.success(`"${report.reported_term}" verified and added to trademark database!`);
        }
      } else {
        toast.success(`Report rejected.`);
      }

      setReports((prev) =>
        prev.map((r) => (r.id === report.id ? { ...r, status: newStatus } : r))
      );
    } catch (err: any) {
      toast.error("Failed to update. " + (err.message || ""));
    } finally {
      setUpdating(null);
    }
  };

  if (!isAdmin) {
    return (
      <div className="container py-8 text-center">
        <p className="text-muted-foreground">Access denied.</p>
      </div>
    );
  }

  const anySyncing = syncingEuipo || syncingUspto || syncingCipo;

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Admin: Trademark Reports</h1>
          <p className="text-sm text-muted-foreground">Review reports and sync external trademark databases</p>
        </div>
      </div>

      {/* Trademark Sync Section */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* EUIPO */}
        <Card className="border-blue-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe className="h-4 w-4 text-blue-400" />
              EUIPO (EU)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">European trademarks via public API. No key required.</p>
            <Button onClick={syncFromEUIPO} disabled={anySyncing} className="w-full gap-2" size="sm">
              {syncingEuipo ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
              {syncingEuipo ? "Syncing..." : "Sync EUIPO"}
            </Button>
          </CardContent>
        </Card>

        {/* USPTO */}
        <Card className="border-red-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-4 w-4 text-red-400" />
              USPTO (US)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">US trademarks. Requires an API key from developer.uspto.gov.</p>
            <div className="flex items-center gap-1">
              <KeyRound className="h-3 w-3 text-muted-foreground shrink-0" />
              <Input
                type="password"
                placeholder="USPTO API Key"
                value={usptoApiKey}
                onChange={(e) => setUsptoApiKey(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <Button onClick={syncFromUSPTO} disabled={anySyncing || !usptoApiKey.trim()} className="w-full gap-2" size="sm">
              {syncingUspto ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
              {syncingUspto ? "Syncing..." : "Sync USPTO"}
            </Button>
          </CardContent>
        </Card>

        {/* CIPO */}
        <Card className="border-amber-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe className="h-4 w-4 text-amber-400" />
              CIPO (Canada)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">Canadian trademarks via open data API. No key required.</p>
            <Button onClick={syncFromCIPO} disabled={anySyncing} className="w-full gap-2" size="sm">
              {syncingCipo ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
              {syncingCipo ? "Syncing..." : "Sync CIPO"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Sync History */}
      {syncLogs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Recent Sync History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source</TableHead>
                  <TableHead>Synced</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {syncLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{sourceBadge(log.source)}</TableCell>
                    <TableCell>{log.trademarks_synced}</TableCell>
                    <TableCell>{syncStatusBadge(log.status)}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {log.sync_duration_ms ? `${log.sync_duration_ms}ms` : "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(log.created_at).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Community Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Community Reports ({reports.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : reports.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No reports yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Term</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Evidence</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.reported_term}</TableCell>
                    <TableCell className="capitalize">{r.category}</TableCell>
                    <TableCell>
                      {r.evidence_url ? (
                        <a
                          href={r.evidence_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary underline text-sm"
                        >
                          Link
                        </a>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm max-w-[200px] truncate">
                      {r.notes || "—"}
                    </TableCell>
                    <TableCell>{statusBadge(r.status)}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(r.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {r.status === "pending" ? (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 text-success"
                            disabled={updating === r.id}
                            onClick={() => updateStatus(r, "verified")}
                          >
                            {updating === r.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <CheckCircle className="h-3 w-3" />
                            )}
                            Verify
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 text-destructive"
                            disabled={updating === r.id}
                            onClick={() => updateStatus(r, "rejected")}
                          >
                            <XCircle className="h-3 w-3" />
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Done</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
