import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, FabricImage, IText, Circle, Rect } from "fabric";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Type, 
  Image as ImageIcon, 
  Circle as CircleIcon, 
  Square, 
  Trash2, 
  Download,
  Layers,
  Move,
  ZoomIn,
  ZoomOut
} from "lucide-react";
import { toast } from "sonner";

interface CanvasEditorProps {
  tshirtColor: string;
  aiGeneratedImage?: string;
  onExport: (dataUrl: string) => void;
}

export const CanvasEditor = ({ tshirtColor, aiGeneratedImage, onExport }: CanvasEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeObject, setActiveObject] = useState<any>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 400,
      height: 500,
      backgroundColor: "transparent",
    });

    canvas.on("selection:created", (e) => setActiveObject(e.selected?.[0]));
    canvas.on("selection:updated", (e) => setActiveObject(e.selected?.[0]));
    canvas.on("selection:cleared", () => setActiveObject(null));

    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
    };
  }, []);

  useEffect(() => {
    if (fabricCanvas && aiGeneratedImage) {
      FabricImage.fromURL(aiGeneratedImage).then((img) => {
        img.scale(0.5);
        img.set({
          left: 100,
          top: 150,
        });
        fabricCanvas.add(img);
        fabricCanvas.renderAll();
        toast.success("AI design added to canvas!");
      });
    }
  }, [aiGeneratedImage, fabricCanvas]);

  const addText = () => {
    if (!fabricCanvas) return;
    const text = new IText("Your Text", {
      left: 150,
      top: 100,
      fontSize: 30,
      fill: "#000000",
      fontFamily: "Arial",
    });
    fabricCanvas.add(text);
    fabricCanvas.setActiveObject(text);
    fabricCanvas.renderAll();
  };

  const addImage = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file || !fabricCanvas) return;
      
      const reader = new FileReader();
      reader.onload = async (event) => {
        const img = await FabricImage.fromURL(event.target?.result as string);
        img.scale(0.3);
        img.set({ left: 100, top: 150 });
        fabricCanvas.add(img);
        fabricCanvas.renderAll();
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const addShape = (type: "circle" | "rect") => {
    if (!fabricCanvas) return;
    const shape = type === "circle" 
      ? new Circle({ radius: 50, fill: "#ff0000", left: 150, top: 150 })
      : new Rect({ width: 100, height: 100, fill: "#0000ff", left: 150, top: 150 });
    fabricCanvas.add(shape);
    fabricCanvas.setActiveObject(shape);
    fabricCanvas.renderAll();
  };

  const deleteSelected = () => {
    if (!fabricCanvas || !activeObject) return;
    fabricCanvas.remove(activeObject);
    setActiveObject(null);
    fabricCanvas.renderAll();
  };

  const updateTextColor = (color: string) => {
    if (!activeObject || activeObject.type !== "i-text") return;
    activeObject.set({ fill: color });
    fabricCanvas?.renderAll();
  };

  const updateFontSize = (size: number) => {
    if (!activeObject || activeObject.type !== "i-text") return;
    activeObject.set({ fontSize: size });
    fabricCanvas?.renderAll();
  };

  const updateScale = (scale: number) => {
    if (!activeObject) return;
    activeObject.scale(scale);
    fabricCanvas?.renderAll();
  };

  const exportDesign = () => {
    if (!fabricCanvas) return;
    const dataUrl = fabricCanvas.toDataURL({ format: "png", quality: 1, multiplier: 2 });
    onExport(dataUrl);
    toast.success("Design exported!");
  };

  const bringToFront = () => {
    if (!activeObject || !fabricCanvas) return;
    fabricCanvas.bringObjectToFront(activeObject);
    fabricCanvas.renderAll();
  };

  const sendToBack = () => {
    if (!activeObject || !fabricCanvas) return;
    fabricCanvas.sendObjectToBack(activeObject);
    fabricCanvas.renderAll();
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 p-4 bg-secondary/20 rounded-lg">
        <Button onClick={addText} size="sm" variant="outline">
          <Type className="w-4 h-4 mr-2" />
          Add Text
        </Button>
        <Button onClick={addImage} size="sm" variant="outline">
          <ImageIcon className="w-4 h-4 mr-2" />
          Upload Image
        </Button>
        <Button onClick={() => addShape("circle")} size="sm" variant="outline">
          <CircleIcon className="w-4 h-4 mr-2" />
          Circle
        </Button>
        <Button onClick={() => addShape("rect")} size="sm" variant="outline">
          <Square className="w-4 h-4 mr-2" />
          Rectangle
        </Button>
        {activeObject && (
          <>
            <Button onClick={deleteSelected} size="sm" variant="destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
            <Button onClick={bringToFront} size="sm" variant="outline">
              <Layers className="w-4 h-4 mr-2" />
              Front
            </Button>
            <Button onClick={sendToBack} size="sm" variant="outline">
              <Layers className="w-4 h-4 mr-2" />
              Back
            </Button>
          </>
        )}
        <Button onClick={exportDesign} size="sm" className="ml-auto">
          <Download className="w-4 h-4 mr-2" />
          Export Design
        </Button>
      </div>

      {/* Properties Panel */}
      {activeObject && (
        <div className="p-4 bg-secondary/20 rounded-lg space-y-4">
          <h3 className="font-semibold">Object Properties</h3>
          
          {activeObject.type === "i-text" && (
            <>
              <div>
                <Label>Text Color</Label>
                <Input
                  type="color"
                  value={activeObject.fill}
                  onChange={(e) => updateTextColor(e.target.value)}
                  className="h-10 mt-2"
                />
              </div>
              <div>
                <Label>Font Size: {activeObject.fontSize}px</Label>
                <Slider
                  value={[activeObject.fontSize]}
                  onValueChange={(v) => updateFontSize(v[0])}
                  min={10}
                  max={100}
                  step={1}
                  className="mt-2"
                />
              </div>
            </>
          )}

          <div>
            <Label>Scale: {(activeObject.scaleX || 1).toFixed(2)}x</Label>
            <Slider
              value={[activeObject.scaleX || 1]}
              onValueChange={(v) => updateScale(v[0])}
              min={0.1}
              max={3}
              step={0.1}
              className="mt-2"
            />
          </div>
        </div>
      )}

      {/* Canvas */}
      <div className="relative rounded-lg overflow-hidden" style={{ backgroundColor: tshirtColor }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <canvas ref={canvasRef} className="border border-border/50" />
        </div>
        <div className="h-[500px]" />
      </div>
    </div>
  );
};
