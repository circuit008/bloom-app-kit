import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trash2, Upload, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Design {
  id: string;
  prompt: string;
  style: string;
  color_scheme: string;
  image_url: string;
  created_at: string;
  uploaded_to_shopify: boolean;
  shopify_product_id: string | null;
  event_tag: string | null;
}

const DesignLibrary = () => {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingIds, setUploadingIds] = useState<Set<string>>(new Set());
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadDesigns();
  }, []);

  const loadDesigns = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('designs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDesigns(data || []);
    } catch (error) {
      console.error('Error loading designs:', error);
      toast.error("Failed to load designs");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (designId: string) => {
    setDeletingIds(prev => new Set(prev).add(designId));
    try {
      const { error } = await supabase
        .from('designs')
        .delete()
        .eq('id', designId);

      if (error) throw error;

      setDesigns(prev => prev.filter(d => d.id !== designId));
      toast.success("Design deleted");
    } catch (error) {
      console.error('Error deleting design:', error);
      toast.error("Failed to delete design");
    } finally {
      setDeletingIds(prev => {
        const next = new Set(prev);
        next.delete(designId);
        return next;
      });
    }
  };

  const handleUpload = async (design: Design) => {
    setUploadingIds(prev => new Set(prev).add(design.id));
    try {
      const { data, error } = await supabase.functions.invoke('upload-design-to-shopify', {
        body: {
          designId: design.id,
          title: `${design.style} T-Shirt - ${design.prompt.slice(0, 30)}`,
          description: design.prompt,
          price: "24.99"
        }
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      toast.success("Uploaded to Shopify!");
      loadDesigns(); // Reload to update status
    } catch (error) {
      console.error('Error uploading:', error);
      toast.error("Failed to upload");
    } finally {
      setUploadingIds(prev => {
        const next = new Set(prev);
        next.delete(design.id);
        return next;
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Design Library</h1>
        <p className="text-muted-foreground mt-1">Manage your AI-generated t-shirt designs</p>
      </div>

      {designs.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground mb-2">No designs yet</p>
            <p className="text-sm text-muted-foreground">
              Create your first design in the Design Studio
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {designs.map((design) => {
            const isUploading = uploadingIds.has(design.id);
            const isDeleting = deletingIds.has(design.id);

            return (
              <Card key={design.id} className="overflow-hidden">
                <div className="aspect-square bg-secondary/20 relative">
                  <ProtectedImage
                    src={design.image_url}
                    alt={design.prompt}
                    className="w-full h-full object-contain p-4"
                    lowRes
                  />
                  {design.uploaded_to_shopify && (
                    <Badge className="absolute top-2 right-2 bg-green-500">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      On Shopify
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4 space-y-3">
                  <div>
                    <p className="text-sm font-medium line-clamp-2 mb-2">
                      {design.prompt}
                    </p>
                    <div className="flex gap-1 flex-wrap">
                      <Badge variant="secondary" className="text-xs">
                        {design.style}
                      </Badge>
                      {design.color_scheme && (
                        <Badge variant="outline" className="text-xs">
                          {design.color_scheme}
                        </Badge>
                      )}
                      {design.event_tag && (
                        <Badge variant="outline" className="text-xs">
                          {design.event_tag}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {!design.uploaded_to_shopify && (
                      <Button
                        size="sm"
                        onClick={() => handleUpload(design)}
                        disabled={isUploading}
                        className="flex-1"
                      >
                        {isUploading ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <>
                            <Upload className="w-3 h-3 mr-1" />
                            Upload
                          </>
                        )}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(design.id)}
                      disabled={isDeleting}
                      className={design.uploaded_to_shopify ? "flex-1" : ""}
                    >
                      {isDeleting ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Trash2 className="w-3 h-3" />
                      )}
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    {new Date(design.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DesignLibrary;
