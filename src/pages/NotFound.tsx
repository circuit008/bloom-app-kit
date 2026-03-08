import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="font-display text-8xl text-gradient mb-4">404</h1>
      <h2 className="font-display text-2xl mb-2">Page Not Found</h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Button asChild>
        <Link to="/"><Home className="mr-2 h-4 w-4" /> Back to Home</Link>
      </Button>
    </div>
  );
};

export default NotFound;
