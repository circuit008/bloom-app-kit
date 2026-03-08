import { Shield, Upload, BarChart3, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const stats = [
  { label: "Total Scans", value: "0", icon: BarChart3, color: "text-primary" },
  { label: "Issues Found", value: "0", icon: Shield, color: "text-destructive" },
  { label: "Designs Passed", value: "0", icon: Shield, color: "text-success" },
  { label: "Last Scan", value: "Never", icon: Clock, color: "text-warning" },
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back, <span className="text-primary">{user?.email?.split("@")[0]}</span>
        </h1>
        <p className="text-muted-foreground mt-1">Here's an overview of your design compliance.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-bold">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-dashed">
        <CardContent className="py-12 flex flex-col items-center text-center gap-4">
          <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
            <Upload className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Start a New Scan</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Upload a design image to check for compliance issues
            </p>
          </div>
          <Button className="mt-2">
            Upload Design
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
