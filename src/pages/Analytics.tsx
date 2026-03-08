import { TrendingUp, DollarSign, ShoppingCart, Users } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { EmptyState } from "@/components/shared/EmptyState";

const stats = [
  { label: "Total Revenue", value: "$0", icon: DollarSign, trend: "+0%" },
  { label: "Products Sold", value: "0", icon: ShoppingCart, trend: "+0%" },
  { label: "Active Products", value: "0", icon: TrendingUp, trend: "0" },
  { label: "Customers", value: "0", icon: Users, trend: "+0%" },
];

export default function Analytics() {
  return (
    <div className="space-y-6">
      <PageHeader icon={TrendingUp} title="Analytics" description="Track your store performance and growth" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>
      <EmptyState
        icon={TrendingUp}
        title="Start Selling to See Analytics"
        description="Your sales data and insights will appear here once you start making sales"
      />
    </div>
  );
}
