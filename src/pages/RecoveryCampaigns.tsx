import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, TrendingUp, Clock, DollarSign, Play, Pause } from "lucide-react";

const campaigns = [
  {
    id: 1,
    name: "24-Hour Cart Recovery",
    status: "active",
    sent: 127,
    recovered: 34,
    revenue: "$2,847",
    rate: "26.8%",
  },
  {
    id: 2,
    name: "3-Day Follow-up",
    status: "active",
    sent: 89,
    recovered: 21,
    revenue: "$1,923",
    rate: "23.6%",
  },
  {
    id: 3,
    name: "Last Chance Offer",
    status: "paused",
    sent: 54,
    recovered: 12,
    revenue: "$987",
    rate: "22.2%",
  },
];

const recentCarts = [
  { customer: "Sarah Johnson", cart: "$129.99", time: "2 hours ago", items: 3 },
  { customer: "Mike Davis", cart: "$84.50", time: "4 hours ago", items: 2 },
  { customer: "Emma Wilson", cart: "$215.00", time: "6 hours ago", items: 5 },
  { customer: "John Smith", cart: "$67.99", time: "8 hours ago", items: 1 },
];

const RecoveryCampaigns = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Recovery Campaigns</h1>
          <p className="mt-2 text-muted-foreground">Win back customers with AI-powered campaigns</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Mail className="mr-2 h-4 w-4" />
          Create Campaign
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border-border bg-gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Sent</CardTitle>
            <Mail className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">270</div>
            <p className="text-xs text-primary mt-1">+15% this week</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Recovered</CardTitle>
            <TrendingUp className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">67</div>
            <p className="text-xs text-accent mt-1">24.8% recovery rate</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Revenue</CardTitle>
            <DollarSign className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">$5,757</div>
            <p className="text-xs text-primary mt-1">+28% vs last week</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Time</CardTitle>
            <Clock className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">2.4h</div>
            <p className="text-xs text-muted-foreground mt-1">Response time</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Campaigns */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Active Campaigns</CardTitle>
          <CardDescription className="text-muted-foreground">Manage your recovery email sequences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="flex items-center justify-between rounded-lg border border-border bg-gradient-card p-4 transition-all hover:shadow-glow"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{campaign.name}</h3>
                      <Badge
                        variant={campaign.status === "active" ? "default" : "secondary"}
                        className={campaign.status === "active" ? "bg-primary text-primary-foreground" : ""}
                      >
                        {campaign.status}
                      </Badge>
                    </div>
                    <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{campaign.sent} sent</span>
                      <span>•</span>
                      <span>{campaign.recovered} recovered</span>
                      <span>•</span>
                      <span className="text-primary">{campaign.rate} rate</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-foreground">{campaign.revenue}</p>
                    <p className="text-xs text-muted-foreground">Revenue generated</p>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-border bg-card text-foreground hover:bg-secondary"
                  >
                    {campaign.status === "active" ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Abandoned Carts */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Recent Abandoned Carts</CardTitle>
          <CardDescription className="text-muted-foreground">Latest recovery opportunities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentCarts.map((cart, index) => (
              <div
                key={index}
                className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0"
              >
                <div>
                  <p className="font-medium text-foreground">{cart.customer}</p>
                  <p className="text-sm text-muted-foreground">
                    {cart.items} items • {cart.time}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-lg font-bold text-foreground">{cart.cart}</span>
                  <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Send Recovery
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecoveryCampaigns;
