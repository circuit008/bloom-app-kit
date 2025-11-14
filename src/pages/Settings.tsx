import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Save, Key, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";

const Settings = () => {
  const handleSave = () => {
    toast.success("Settings saved successfully!");
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
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <LinkIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-foreground">Shopify Store</CardTitle>
                <CardDescription className="text-muted-foreground">Connect your Shopify store</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="shop-url" className="text-foreground">Store URL</Label>
              <Input
                id="shop-url"
                placeholder="your-store.myshopify.com"
                className="bg-secondary border-border text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="api-key" className="text-foreground">API Key</Label>
              <Input
                id="api-key"
                type="password"
                placeholder="Enter your Shopify API key"
                className="bg-secondary border-border text-foreground"
              />
            </div>
            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              <LinkIcon className="mr-2 h-4 w-4" />
              Connect Store
            </Button>
          </CardContent>
        </Card>

        {/* API Keys */}
        <Card className="border-border bg-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                <Key className="h-5 w-5 text-accent" />
              </div>
              <div>
                <CardTitle className="text-foreground">AI Configuration</CardTitle>
                <CardDescription className="text-muted-foreground">Configure AI model settings</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="openai-key" className="text-foreground">OpenAI API Key</Label>
              <Input
                id="openai-key"
                type="password"
                placeholder="sk-..."
                className="bg-secondary border-border text-foreground"
              />
              <p className="text-xs text-muted-foreground">
                Required for advanced AI features
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="model" className="text-foreground">AI Model</Label>
              <Input
                id="model"
                value="gpt-4"
                disabled
                className="bg-secondary border-border text-foreground"
              />
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
        <Button onClick={handleSave} size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Save className="mr-2 h-4 w-4" />
          Save All Changes
        </Button>
      </div>
    </div>
  );
};

export default Settings;
