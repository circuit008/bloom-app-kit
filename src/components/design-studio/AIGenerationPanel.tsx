import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles } from "lucide-react";
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

      onGenerate(data.imageUrl);
      toast.success("AI design generated! Added to canvas.");
    } catch (error) {
      console.error('Error generating design:', error);
      toast.error("Failed to generate design");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4 p-4 bg-secondary/20 rounded-lg">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">AI Design Generator</h3>
      </div>

      <div>
        <Label htmlFor="prompt">Design Prompt</Label>
        <Input
          id="prompt"
          placeholder="e.g., funny cow wearing Santa hat"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="mt-2"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="style">Style</Label>
          <Select value={style} onValueChange={setStyle}>
            <SelectTrigger id="style" className="mt-2">
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
          <Label htmlFor="color">Color Scheme</Label>
          <Select value={colorScheme} onValueChange={setColorScheme}>
            <SelectTrigger id="color" className="mt-2">
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
        size="lg"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-2" />
            Generate & Add to Canvas
          </>
        )}
      </Button>
    </div>
  );
};
