import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="container py-32 flex flex-col items-center text-center gap-4">
      <h1 className="text-7xl font-extrabold text-primary">404</h1>
      <p className="text-xl text-muted-foreground">Page not found</p>
      <Button variant="outline" onClick={() => navigate("/")} className="mt-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Button>
    </div>
  );
}
