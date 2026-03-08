import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, ShieldCheck, XCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

function statusBadge(status: string) {
  if (status === "verified") return <Badge className="bg-success/20 text-success border-success/30">Verified</Badge>;
  if (status === "rejected") return <Badge variant="destructive">Rejected</Badge>;
  return <Badge variant="secondary">Pending</Badge>;
}

export default function AdminReports() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const isAdmin = user?.email?.includes("admin");

  useEffect(() => {
    if (!isAdmin) return;
    fetchReports();
  }, [isAdmin]);

  const fetchReports = async () => {
    const { data, error } = await supabase
      .from("trademark_reports")
      .select("id, reported_term, category, status, evidence_url, notes, created_at")
      .order("created_at", { ascending: false });

    if (!error && data) setReports(data);
    setLoading(false);
  };

  const updateStatus = async (report: Report, newStatus: "verified" | "rejected") => {
    setUpdating(report.id);
    try {
      const { error } = await supabase
        .from("trademark_reports")
        .update({ status: newStatus })
        .eq("id", report.id);

      if (error) throw error;

      // If verified, add to trademark_database
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

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Admin: Trademark Reports</h1>
          <p className="text-sm text-muted-foreground">Review and verify community-reported trademarks</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            All Reports ({reports.length})
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
