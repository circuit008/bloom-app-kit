import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, ShoppingCart, Users } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const metricsData = [
  { name: "Products Enhanced", value: "247", change: "+12%", icon: ShoppingCart, color: "text-primary" },
  { name: "Revenue Impact", value: "$12,458", change: "+23%", icon: DollarSign, color: "text-accent" },
  { name: "Conversion Rate", value: "3.8%", change: "+0.4%", icon: TrendingUp, color: "text-primary" },
  { name: "Active Campaigns", value: "8", change: "+2", icon: Users, color: "text-accent" },
];

const chartData = [
  { name: "Mon", value: 400 },
  { name: "Tue", value: 300 },
  { name: "Wed", value: 600 },
  { name: "Thu", value: 800 },
  { name: "Fri", value: 700 },
  { name: "Sat", value: 900 },
  { name: "Sun", value: 1000 },
];

const Dashboard = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Welcome back! Here's your store performance overview.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metricsData.map((metric) => (
          <Card key={metric.name} className="border-border hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{metric.name}</CardTitle>
              <div className="p-2 rounded-lg bg-primary/10">
                <metric.icon className={`h-4 w-4 ${metric.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{metric.value}</div>
              <p className="text-xs text-accent font-medium mt-1">{metric.change} from last week</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">AI Content Generated</CardTitle>
            <CardDescription className="text-muted-foreground">Last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Campaign Performance</CardTitle>
            <CardDescription className="text-muted-foreground">Recovery rate by day</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Bar dataKey="value" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Recent Activity</CardTitle>
          <CardDescription className="text-muted-foreground">Your latest AI-powered enhancements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { action: "Generated product description", product: "Wireless Headphones Pro", time: "2 hours ago" },
              { action: "Sent recovery campaign", product: "5 abandoned carts", time: "4 hours ago" },
              { action: "Optimized product title", product: "Smart Watch Series X", time: "6 hours ago" },
              { action: "Created email template", product: "Flash Sale Campaign", time: "1 day ago" },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0">
                <div>
                  <p className="font-medium text-foreground">{activity.action}</p>
                  <p className="text-sm text-muted-foreground">{activity.product}</p>
                </div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
