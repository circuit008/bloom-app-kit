import { Package, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";

export default function Products() {
  return (
    <div className="space-y-6">
      <PageHeader
        icon={Package}
        title="Products"
        description="Manage your Shopify products and inventory"
        actions={
          <Button size="sm">
            <Plus className="mr-1.5 h-4 w-4" />
            Add Product
          </Button>
        }
      />
      <EmptyState
        icon={Package}
        title="No Products Yet"
        description="Start by creating your first design in the Design Studio, then upload it here"
        actionLabel="Go to Design Studio"
        actionHref="/design-studio"
      />
    </div>
  );
}
