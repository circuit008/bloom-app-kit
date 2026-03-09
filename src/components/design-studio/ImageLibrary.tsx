import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SavedImage {
  id: string;
  title: string;
  image_url: string;
  image_type: string;
  created_at: string;
}

interface ImageLibraryProps {
  onSelectImage: (imageUrl: string) => void;
}

export const ImageLibrary = ({ onSelectImage }: ImageLibraryProps) => {
  const [images, setImages] = useState<SavedImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('saved_images')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error('Error loading images:', error);
      toast.error("Failed to load image library");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from('saved_images')
        .delete()
        .eq('id', deleteId);

      if (error) throw error;

      setImages(images.filter(img => img.id !== deleteId));
      toast.success("Image deleted from library");
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error("Failed to delete image");
    } finally {
      setDeleteId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
        <p>No saved images yet</p>
        <p className="text-sm">Process images in AI Tools to save them here</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {images.map((image) => (
          <Card key={image.id} className="overflow-hidden group">
            <CardContent className="p-0 relative">
              <ProtectedImage
                src={image.image_url}
                alt={image.title}
                className="w-full h-32 object-cover"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                <Button
                  size="sm"
                  onClick={() => onSelectImage(image.image_url)}
                  className="w-24"
                >
                  Use Image
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setDeleteId(image.id)}
                  className="w-24"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
              <div className="p-2">
                <p className="text-xs font-medium truncate">{image.title}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {image.image_type.replace('_', ' ')}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Image</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this image from your library? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
