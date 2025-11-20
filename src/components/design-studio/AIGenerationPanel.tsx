import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles, RefreshCw, Wand2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AIGenerationPanelProps {
  onGenerate: (imageUrl: string) => void;
  initialPrompt?: string;
}

export const AIGenerationPanel = ({ onGenerate, initialPrompt = "" }: AIGenerationPanelProps) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [style, setStyle] = useState("cartoon");
  const [colorScheme, setColorScheme] = useState("vibrant");
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGeneratedImage, setLastGeneratedImage] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState("");

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a design prompt");
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-tshirt-design', {
        body: { prompt, style, colorScheme }
      });

      if (error) throw error;
      if (data.error) {
        toast.error(data.error);
        return;
      }

      setLastGeneratedImage(data.imageUrl);
      onGenerate(data.imageUrl);
      toast.success("AI design generated! Added to canvas.");
    } catch (error) {
      console.error('Error generating design:', error);
      toast.error("Failed to generate design");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEditImage = async () => {
    if (!lastGeneratedImage || !editPrompt.trim()) {
      toast.error("Please enter editing instructions");
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('edit-tshirt-design', {
        body: { 
          imageUrl: lastGeneratedImage,
          editPrompt,
          style, 
          colorScheme 
        }
      });

      if (error) throw error;
      if (data.error) {
        toast.error(data.error);
        return;
      }

      setLastGeneratedImage(data.imageUrl);
      onGenerate(data.imageUrl);
      setEditPrompt("");
      toast.success("Design edited successfully!");
    } catch (error) {
      console.error('Error editing design:', error);
      toast.error("Failed to edit design");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-sm">AI Design Generator</h3>
      </div>

      <div>
        <Label htmlFor="prompt" className="text-xs">Design Prompt</Label>
        <Input
          id="prompt"
          placeholder="e.g., funny cow wearing Santa hat"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="mt-1.5 text-sm"
          onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="style" className="text-xs">Style</Label>
          <Select value={style} onValueChange={setStyle}>
            <SelectTrigger id="style" className="mt-1.5 h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cartoon">Cartoon</SelectItem>
              <SelectItem value="realistic">Realistic</SelectItem>
              <SelectItem value="minimalist">Minimalist</SelectItem>
              <SelectItem value="vintage">Vintage</SelectItem>
              <SelectItem value="retro">Retro</SelectItem>
              <SelectItem value="watercolor">Watercolor</SelectItem>
              <SelectItem value="line-art">Line Art</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="color" className="text-xs">Color Scheme</Label>
          <Select value={colorScheme} onValueChange={setColorScheme}>
            <SelectTrigger id="color" className="mt-1.5 h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vibrant">Vibrant</SelectItem>
              <SelectItem value="pastel">Pastel</SelectItem>
              <SelectItem value="monochrome">Monochrome</SelectItem>
              <SelectItem value="warm">Warm Tones</SelectItem>
              <SelectItem value="cool">Cool Tones</SelectItem>
              <SelectItem value="neon">Neon</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button 
        onClick={handleGenerate} 
        disabled={isGenerating || !prompt.trim()}
        className="w-full"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Design
          </>
        )}
      </Button>

      {lastGeneratedImage && (
        <div className="pt-4 mt-4 border-t border-border">
          <div className="flex items-center gap-2 mb-3">
            <Wand2 className="w-4 h-4 text-primary" />
            <h4 className="font-semibold text-sm">Edit Design with AI</h4>
          </div>
          
          <div className="space-y-3">
            <div>
              <Label htmlFor="edit-prompt" className="text-xs">Edit Command</Label>
              <Input
                id="edit-prompt"
                placeholder="e.g., make it more colorful, add stars"
                value={editPrompt}
                onChange={(e) => setEditPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && editPrompt.trim() && handleEditImage()}
                className="mt-1.5 text-sm"
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleEditImage}
                disabled={isGenerating || !editPrompt.trim()}
                className="flex-1"
                size="sm"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Wand2 className="w-4 h-4 mr-2" />
                )}
                Apply
              </Button>

              <Button 
                onClick={handleGenerate}
                disabled={isGenerating}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
