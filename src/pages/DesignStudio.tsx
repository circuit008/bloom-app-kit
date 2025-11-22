import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Save, Upload, ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CanvasEditor } from "@/components/design-studio/CanvasEditor";
import { TShirtColorPicker } from "@/components/design-studio/TShirtColorPicker";
import { AIGenerationPanel } from "@/components/design-studio/AIGenerationPanel";
import { ImageLibrary } from "@/components/design-studio/ImageLibrary";

const DesignStudio = () => {
  const location = useLocation();
  const [tshirtColor, setTshirtColor] = useState("#FFFFFF");
  const [exportedDesign, setExportedDesign] = useState<string | null>(null);
  const [aiGeneratedImage, setAiGeneratedImage] = useState<string | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [savedDesignId, setSavedDesignId] = useState<string | null>(null);
  const [imageLoadTrigger, setImageLoadTrigger] = useState(0);

  const handleSave = async () => {
    if (!exportedDesign) {
      toast.error("Please export your design first");
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('designs')
        .insert({
          user_id: user.id,
          prompt: "Custom canvas design",
          style: "custom",
          color_scheme: tshirtColor,
          image_url: exportedDesign,
        })
        .select()
        .single();

      if (error) throw error;

      setSavedDesignId(data.id);
      toast.success("Design saved to library!");
    } catch (error) {
      console.error('Error saving design:', error);
      toast.error("Failed to save design");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadToShopify = async () => {
    if (!savedDesignId) {
      toast.error("Please save the design first");
      return;
    }

    setIsUploading(true);
    try {
      const { data, error } = await supabase.functions.invoke('upload-design-to-shopify', {
        body: {
          designId: savedDesignId,
          title: `Custom T-Shirt Design`,
          description: "Custom designed t-shirt",
          price: "24.99"
        }
      });

      if (error) throw error;
      if (data.error) {
        toast.error(data.error);
        return;
      }

      toast.success("Product created on Shopify!", {
        description: `View at: ${data.productUrl || 'Shopify Admin'}`
      });
    } catch (error) {
      console.error('Error uploading to Shopify:', error);
      toast.error("Failed to upload to Shopify");
    } finally {
      setIsUploading(false);
    }
  };

  const handleLibraryImageSelect = (imageUrl: string) => {
    setAiGeneratedImage(imageUrl);
    setImageLoadTrigger(prev => prev + 1);
    toast.success("Image loaded from library!");
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b bg-card flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Design Studio</h1>
          <p className="text-muted-foreground mt-1">Create stunning t-shirt designs with AI</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={handleSave} 
            disabled={isSaving || !exportedDesign || !!savedDesignId}
            size="lg"
            variant="outline"
            className="gap-2"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                {savedDesignId ? "Saved" : "Save Design"}
              </>
            )}
          </Button>
          <Button 
            onClick={handleUploadToShopify} 
            disabled={isUploading || !savedDesignId}
            size="lg"
            className="gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload to Shopify
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Content - Canvas Left, Controls Right */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Side - Canvas */}
        <div className="flex-1 overflow-hidden bg-muted/20">
          <CanvasEditor
            tshirtColor={tshirtColor}
            aiGeneratedImage={aiGeneratedImage}
            imageLoadTrigger={imageLoadTrigger}
            onExport={setExportedDesign}
          />
        </div>

        {/* Right Side - Controls */}
        <div className="w-80 border-l bg-card overflow-y-auto flex-shrink-0">
          <Tabs defaultValue="customize">
            <TabsList className="w-full grid grid-cols-2 sticky top-0 z-10 bg-card">
              <TabsTrigger value="customize">Customize</TabsTrigger>
              <TabsTrigger value="library">
                <ImageIcon className="w-4 h-4 mr-1" />
                Library
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="customize" className="p-6 space-y-6">
              {/* Color Picker */}
              <div>
                <h3 className="font-semibold mb-3">T-Shirt Color</h3>
                <TShirtColorPicker 
                  selectedColor={tshirtColor}
                  onColorChange={setTshirtColor}
                />
              </div>
              
              {/* AI Generation */}
              <div className="pt-6 border-t">
                <AIGenerationPanel 
                  onGenerate={setAiGeneratedImage}
                  initialPrompt={location.state?.prompt || ""}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="library" className="p-6">
              <ImageLibrary onSelectImage={handleLibraryImageSelect} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default DesignStudio;
