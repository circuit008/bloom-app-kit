import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Password recovery states
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState<"email" | "otp" | "password">("email");
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });

    if (result?.error) {
      toast.error(result.error.message || "Google login failed");
      setGoogleLoading(false);
    } else if (!result?.redirected) {
      toast.success("Logged in successfully!");
      navigate("/");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Logged in successfully!");
      navigate("/");
    }
    setLoading(false);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(recoveryEmail, {
      redirectTo: `${window.location.origin}/login`,
    });

    if (error) {
      toast.error(error.message);
      setRecoveryLoading(false);
      return;
    }

    // Now send OTP for verification
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: recoveryEmail,
      options: {
        shouldCreateUser: false,
      }
    });

    if (otpError) {
      toast.error(otpError.message);
    } else {
      toast.success("6-digit code sent to your email!");
      setRecoveryStep("otp");
    }
    setRecoveryLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }
    setRecoveryLoading(true);

    const { error } = await supabase.auth.verifyOtp({
      email: recoveryEmail,
      token: otp,
      type: 'email'
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Code verified! Set your new password.");
      setRecoveryStep("password");
    }
    setRecoveryLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setRecoveryLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated successfully!");
      setShowRecovery(false);
      setRecoveryStep("email");
      setRecoveryEmail("");
      setOtp("");
      setNewPassword("");
      navigate("/");
    }
    setRecoveryLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-md border-border bg-card">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center text-foreground">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Sign in to ShopBoost AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-secondary border-border text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-secondary border-border text-foreground"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
          </form>

          <div className="relative my-4">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
              or continue with
            </span>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            Continue with Google
          </Button>

          <div className="mt-2 text-center">
            <button
              type="button"
              onClick={() => setShowRecovery(true)}
              className="text-sm text-primary hover:underline"
            >
              Forgot password?
            </button>
          </div>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>

      <Dialog open={showRecovery} onOpenChange={setShowRecovery}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Reset Password</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {recoveryStep === "email" && "Enter your email to receive a 6-digit recovery code"}
              {recoveryStep === "otp" && "Enter the 6-digit code sent to your email"}
              {recoveryStep === "password" && "Enter your new password"}
            </DialogDescription>
          </DialogHeader>

          {recoveryStep === "email" && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recovery-email" className="text-foreground">Email</Label>
                <Input
                  id="recovery-email"
                  type="email"
                  placeholder="you@example.com"
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  required
                  className="bg-secondary border-border text-foreground"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={recoveryLoading}
              >
                {recoveryLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Code
              </Button>
            </form>
          )}

          {recoveryStep === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-foreground">Enter 6-digit code</Label>
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
              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={recoveryLoading}
              >
                {recoveryLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify Code
              </Button>
            </form>
          )}

          {recoveryStep === "password" && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-foreground">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="bg-secondary border-border text-foreground"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={recoveryLoading}
              >
                {recoveryLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Reset Password
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;
