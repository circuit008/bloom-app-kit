import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Save, Key, Link as LinkIcon, Loader2, CheckCircle2, Lock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";

const Settings = () => {
  const [shopUrl, setShopUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    loadCredentials();
  }, []);

  const loadCredentials = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("shopify_credentials")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Error loading credentials:", error);
    } else if (data) {
      setShopUrl(data.shop_url);
      setApiKey(data.api_key);
      setIsConnected(true);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!shopUrl || !apiKey) {
      toast.error("Please fill in all Shopify credentials");
      return;
    }

    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("You must be logged in to save settings");
      setSaving(false);
      return;
    }

    const { data: existing } = await supabase
      .from("shopify_credentials")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    let error;
    if (existing) {
      ({ error } = await supabase
        .from("shopify_credentials")
        .update({ shop_url: shopUrl, api_key: apiKey })
        .eq("user_id", user.id));
    } else {
      ({ error } = await supabase
        .from("shopify_credentials")
        .insert({ user_id: user.id, shop_url: shopUrl, api_key: apiKey }));
    }

    if (error) {
      toast.error("Failed to save settings: " + error.message);
    } else {
      toast.success("Shopify store connected successfully!");
      setIsConnected(true);
    }
    setSaving(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground">Settings</h1>
        <p className="mt-2 text-muted-foreground">Manage your integrations and preferences</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Shopify Integration */}
        <Card className="border-border bg-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <LinkIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-foreground">Shopify Store</CardTitle>
                  <CardDescription className="text-muted-foreground">Connect your Shopify store</CardDescription>
                </div>
              </div>
              {isConnected && (
                <Badge variant="secondary" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Connected
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="shop-url" className="text-foreground">Store URL</Label>
              <Input
                id="shop-url"
                placeholder="your-store.myshopify.com"
                className="bg-secondary border-border text-foreground"
                value={shopUrl}
                onChange={(e) => setShopUrl(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="api-key" className="text-foreground">API Key</Label>
              <Input
                id="api-key"
                type="password"
                placeholder="Enter your Shopify API key"
                className="bg-secondary border-border text-foreground"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                disabled={loading}
              />
            </div>
            {!isConnected && (
              <p className="text-sm text-muted-foreground">
                Click "Save All Changes" below to connect your store
              </p>
            )}
          </CardContent>
        </Card>

        {/* API Keys */}
        <Card className="border-border bg-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                  <Key className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <CardTitle className="text-foreground">AI Configuration</CardTitle>
                  <CardDescription className="text-muted-foreground">AI capabilities are ready to use</CardDescription>
                </div>
              </div>
              <Badge variant="secondary" className="gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-accent/5 p-4 border border-accent/20">
              <p className="text-sm text-foreground mb-2 font-medium">
                ✨ Lovable AI Enabled
              </p>
              <p className="text-xs text-muted-foreground">
                Your app has access to advanced AI models including Google Gemini and OpenAI GPT-5. No API key configuration required.
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Available Models</Label>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• google/gemini-2.5-flash (Default)</p>
                <p>• google/gemini-2.5-pro</p>
                <p>• openai/gpt-5</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preferences */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Preferences</CardTitle>
          <CardDescription className="text-muted-foreground">Customize your experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-foreground">Auto-generate descriptions</Label>
              <p className="text-sm text-muted-foreground">
                Automatically create descriptions for new products
              </p>
            </div>
            <Switch />
          </div>

          <Separator className="bg-border" />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-foreground">Email notifications</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when campaigns are sent
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <Separator className="bg-border" />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-foreground">Auto-send recovery emails</Label>
              <p className="text-sm text-muted-foreground">
                Automatically send recovery emails to abandoned carts
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <Separator className="bg-border" />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-foreground">Weekly reports</Label>
              <p className="text-sm text-muted-foreground">
                Receive performance summaries via email
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          size="lg" 
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          disabled={saving || loading}
        >
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save All Changes
        </Button>
      </div>
    </div>
  );
};

export default Settings;
