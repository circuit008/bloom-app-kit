import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { AuthLayout } from "@/components/shared/AuthLayout";
import { GoogleAuthButton } from "@/components/shared/GoogleAuthButton";

const Signup = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result?.error) { toast.error(result.error.message || "Google signup failed"); setGoogleLoading(false); }
    else if (!result?.redirected) { toast.success("Signed up successfully!"); navigate("/"); }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/` } });
    if (error) { toast.error(error.message); } else { toast.success("Account created! Please check your email to verify."); navigate("/login"); }
    setLoading(false);
  };

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div className="space-y-1.5">
          <h2 className="font-display text-2xl">Create your account</h2>
          <p className="text-muted-foreground text-sm">Start building your POD business today</p>
        </div>

        <GoogleAuthButton loading={googleLoading} onClick={handleGoogleSignup} label="Sign up with Google" />

        <div className="relative">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-xs text-muted-foreground">or</span>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="h-11" />
          </div>
          <Button type="submit" className="w-full h-11" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Account
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Signup;
