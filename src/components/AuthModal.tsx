import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Mail, Lock, ArrowRight } from "lucide-react";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AuthModal = ({ open, onOpenChange }: AuthModalProps) => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryLoading, setRecoveryLoading] = useState(false);

  // SIGNUP FUNCTION - Uses supabase.auth.signUp()
  const handleSignup = async () => {
    console.log('Signup attempt:', email);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      
      console.log('Signup result:', data, error);
      
      if (error) throw error;
      
      // Clear form state
      setEmail("");
      setPassword("");
      
      // Check if email confirmation is disabled (user is auto-confirmed)
      if (data.user?.email_confirmed_at) {
        console.log('Signup: User auto-confirmed, redirecting...');
        toast.success("Account created and logged in!");
        onOpenChange(false);
      } else {
        console.log('Signup: Email confirmation required');
        toast.success("Account created! Please check your email to verify.");
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      if (error.message?.includes("already registered")) {
        toast.error("Email already registered. Please try signing in instead.");
      } else {
        toast.error(error.message || "Signup failed");
      }
    } finally {
      setLoading(false);
    }
  };

  // SIGNIN FUNCTION - Uses supabase.auth.signInWithPassword()
  const handleSignin = async () => {
    console.log('Signin attempt:', email);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      console.log('Signin result:', data, error);
      
      if (error) throw error;
      
      // Clear form state
      setEmail("");
      setPassword("");
      
      console.log('Signin: Success, closing modal');
      toast.success("Welcome back!");
      onOpenChange(false);
    } catch (error: any) {
      console.error('Signin error:', error);
      if (error.message?.includes("Invalid login credentials")) {
        toast.error("Invalid email or password. Please try again.");
      } else if (error.message?.includes("Email not confirmed")) {
        toast.error("Please check your email and confirm your account first.");
      } else {
        toast.error(error.message || "Sign in failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === "signup") {
      await handleSignup();
    } else {
      await handleSignin();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground text-center">
            {mode === "login"
              ? "Sign in to access your dashboard"
              : "Start validating your designs today"}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                minLength={6}
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                {mode === "login" ? "Sign In" : "Create Account"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground mt-2">
          {mode === "login" ? (
            <>
              Don't have an account?{" "}
              <button
                onClick={() => setMode("signup")}
                className="text-primary font-medium hover:underline"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                onClick={() => setMode("login")}
                className="text-primary font-medium hover:underline"
              >
                Sign in
              </button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
