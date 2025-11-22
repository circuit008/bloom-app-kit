import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Plus } from "lucide-react";

export default function Products() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Products</h1>
          <p className="text-muted-foreground">
            Manage your Shopify products and inventory
          </p>
        </div>
        <Button size="lg">
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <Card className="p-12 text-center">
        <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-semibold mb-2">No Products Yet</h2>
        <p className="text-muted-foreground mb-6">
          Start by creating your first design in the Design Studio, then upload it here
        </p>
        <Button variant="outline">
          Go to Design Studio
        </Button>
      </Card>
    </div>
  );
}