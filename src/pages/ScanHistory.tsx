import { History, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function ScanHistory() {
  return (
    <div className="container py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Scan History</h1>
          <p className="text-muted-foreground mt-1">Review your past design compliance scans.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search scans..." className="pl-10" />
        </div>
      </div>

      <Card className="border-dashed">
        <CardContent className="py-16 flex flex-col items-center text-center gap-3">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <History className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No scans yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Once you run your first design scan, it will appear here with a full compliance report.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
