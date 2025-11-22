import { Card } from "@/components/ui/card";
import { TrendingUp, DollarSign, ShoppingCart, Users } from "lucide-react";

export default function Analytics() {
  const stats = [
    { label: "Total Revenue", value: "$0", icon: DollarSign, trend: "+0%" },
    { label: "Products Sold", value: "0", icon: ShoppingCart, trend: "+0%" },
    { label: "Active Products", value: "0", icon: TrendingUp, trend: "0" },
    { label: "Customers", value: "0", icon: Users, trend: "+0%" }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Analytics</h1>
        <p className="text-muted-foreground">
          Track your store performance and growth
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <stat.icon className="h-8 w-8 text-primary" />
              <span className="text-sm font-medium text-accent">{stat.trend}</span>
            </div>
            <div className="text-3xl font-bold mb-1">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </Card>
        ))}
      </div>

      <Card className="p-12 text-center">
        <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Start Selling to See Analytics</h2>
        <p className="text-muted-foreground">
          Your sales data and insights will appear here once you start making sales
        </p>
      </Card>
    </div>
  );
}