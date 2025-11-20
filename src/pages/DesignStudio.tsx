import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CanvasEditor } from "@/components/design-studio/CanvasEditor";
import { TShirtColorPicker } from "@/components/design-studio/TShirtColorPicker";
import { AIGenerationPanel } from "@/components/design-studio/AIGenerationPanel";

const DesignStudio = () => {
  const location = useLocation();
  const [tshirtColor, setTshirtColor] = useState("#FFFFFF");
  const [exportedDesign, setExportedDesign] = useState<string | null>(null);
  const [aiGeneratedImage, setAiGeneratedImage] = useState<string | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [savedDesignId, setSavedDesignId] = useState<string | null>(null);

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

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* Header */}
      <div className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Design Studio</h1>
          <p className="text-sm text-muted-foreground">Create professional t-shirt designs</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleSave} 
            disabled={isSaving || !exportedDesign || !!savedDesignId}
            variant="outline"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {savedDesignId ? "Saved" : "Save"}
          </Button>
          <Button 
            onClick={handleUploadToShopify}
            disabled={isUploading || !savedDesignId}
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Upload className="w-4 h-4 mr-2" />
            )}
            Upload to Shopify
          </Button>
        </div>
      </div>

      {/* Main Content - 3 Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - AI Tools & Color */}
        <div className="w-80 border-r border-border overflow-y-auto">
          <div className="p-4 space-y-4">
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">T-Shirt Color</h3>
              <TShirtColorPicker 
                selectedColor={tshirtColor}
                onColorChange={setTshirtColor}
              />
            </div>
            
            <div className="border-t border-border pt-4">
              <AIGenerationPanel 
                onGenerate={setAiGeneratedImage}
                initialPrompt={location.state?.prompt || ""}
              />
            </div>
          </div>
        </div>

        {/* Center - Canvas */}
        <div className="flex-1 flex items-center justify-center bg-muted/30 overflow-hidden">
          <CanvasEditor 
            tshirtColor={tshirtColor}
            aiGeneratedImage={aiGeneratedImage}
            onExport={setExportedDesign}
          />
        </div>
      </div>
    </div>
  );
};

export default DesignStudio;
