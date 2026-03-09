import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Lock } from "lucide-react";
import { AuthLayout } from "@/components/shared/AuthLayout";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      console.log("Reset password: auth event", event);
      if (event === "PASSWORD_RECOVERY") {
        setIsValidSession(true);
        setChecking(false);
      }
    });

    // Also check if already in a valid session (e.g. page refresh)
    const checkExisting = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsValidSession(true);
      }
      // Give onAuthStateChange a moment to fire before giving up
      setTimeout(() => {
        setChecking((prev) => {
          // Only redirect if still checking (no event fired)
          return prev;
        });
      }, 2000);
    };
    checkExisting();

    // Timeout fallback: if nothing happens in 3s, redirect
    const timeout = setTimeout(() => {
      setChecking((prev) => {
        if (prev) {
          toast.error("Invalid or expired reset link");
          navigate("/");
        }
        return false;
      });
    }, 3000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [navigate]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    console.log("Reset password: updating password");

    try {
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) throw error;
      
      console.log("Reset password: success");
      toast.success("Password updated successfully!");
      setPassword("");
      setConfirmPassword("");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Reset password error:", error);
      toast.error(error.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <AuthLayout>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AuthLayout>
    );
  }

  if (!isValidSession) {
    return null;
  }

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Lock className="h-6 w-6 text-primary" />
            <h2 className="font-display text-2xl">Set New Password</h2>
          </div>
          <p className="text-muted-foreground text-sm">
            Enter your new password below
          </p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="h-11"
            />
          </div>
          <Button type="submit" className="w-full h-11" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Password
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
};

export default ResetPassword;
