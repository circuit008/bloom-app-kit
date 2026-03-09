import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Loader2, Mail } from "lucide-react";
import { AuthLayout } from "@/components/shared/AuthLayout";
import { GoogleAuthButton } from "@/components/shared/GoogleAuthButton";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result?.error) {
      toast.error(result.error.message || "Google login failed");
      setGoogleLoading(false);
    } else if (!result?.redirected) {
      toast.success("Logged in successfully!");
      navigate("/");
    }
  };

  // SIGNIN FUNCTION - Uses supabase.auth.signInWithPassword()
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Signin attempt:', email);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      console.log('Signin result:', data, error);
      
      if (error) throw error;
      
      // Clear form state
      setEmail("");
      setPassword("");
      
      console.log('Signin: Success, redirecting to dashboard');
      toast.success("Logged in successfully!");
      navigate("/");
    } catch (error: any) {
      console.error('Signin error:', error);
      if (error.message?.includes("Invalid login credentials")) {
        toast.error("Invalid email or password. Please check and try again.");
      } else if (error.message?.includes("Email not confirmed")) {
        toast.error("Please verify your email before signing in.");
      } else {
        toast.error(error.message || "Sign in failed");
      }
    } finally {
      setLoading(false);
    }
  };

  // Send password reset email with link
  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryLoading(true);
    console.log("Sending password reset email to:", recoveryEmail);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(recoveryEmail, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (error) throw error;
      
      console.log("Password reset email sent successfully");
      toast.success("Password reset link sent! Check your email.");
      setShowRecovery(false);
      setRecoveryEmail("");
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast.error(error.message || "Failed to send reset email");
    } finally {
      setRecoveryLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div className="space-y-1.5">
          <h2 className="font-display text-2xl">Welcome back</h2>
          <p className="text-muted-foreground text-sm">Sign in to your PixelPOD account</p>
        </div>

        <GoogleAuthButton loading={googleLoading} onClick={handleGoogleLogin} />

        <div className="relative">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-xs text-muted-foreground">or</span>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-11" />
          </div>
          <Button type="submit" className="w-full h-11" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign In
          </Button>
        </form>

        <div className="flex items-center justify-between text-sm">
          <button type="button" onClick={() => setShowRecovery(true)} className="text-primary hover:underline">Forgot password?</button>
          <Link to="/signup" className="text-primary hover:underline">Create account</Link>
        </div>
      </div>

      <Dialog open={showRecovery} onOpenChange={setShowRecovery}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Reset Password</DialogTitle>
            <DialogDescription>
              {recoveryStep === "email" && "Enter your email to receive a 6-digit recovery code"}
              {recoveryStep === "otp" && "Enter the 6-digit code sent to your email"}
              {recoveryStep === "password" && "Enter your new password"}
            </DialogDescription>
          </DialogHeader>

          {recoveryStep === "email" && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recovery-email">Email</Label>
                <Input id="recovery-email" type="email" placeholder="you@example.com" value={recoveryEmail} onChange={(e) => setRecoveryEmail(e.target.value)} required className="h-11" />
              </div>
              <Button type="submit" className="w-full h-11" disabled={recoveryLoading}>
                {recoveryLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Code
              </Button>
            </form>
          )}

          {recoveryStep === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2">
                <Label>Enter 6-digit code</Label>
                <div className="flex justify-center">
                  <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>
              <Button type="submit" className="w-full h-11" disabled={recoveryLoading}>
                {recoveryLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify Code
              </Button>
            </form>
          )}

          {recoveryStep === "password" && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} className="h-11" />
              </div>
              <Button type="submit" className="w-full h-11" disabled={recoveryLoading}>
                {recoveryLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Reset Password
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </AuthLayout>
  );
};

export default Login;
