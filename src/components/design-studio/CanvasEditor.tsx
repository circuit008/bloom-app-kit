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
  RotateCw
} from "lucide-react";
import { toast } from "sonner";
import tshirtMockup from "@/assets/tshirt-mockup.png";

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
      // Properly cleanup all event listeners before disposal
      canvas.off("selection:created");
      canvas.off("selection:updated");
      canvas.off("selection:cleared");
      // Clear active object before disposing
      setActiveObject(null);
      // Dispose canvas
      canvas.dispose();
    };
  }, []);

  const updateRotation = (rotation: number) => {
    if (!activeObject) return;
    activeObject.set({ angle: rotation });
    fabricCanvas?.renderAll();
  };

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
    
    // Create a temporary canvas to capture the entire t-shirt with design
    const tempCanvas = document.createElement('canvas');
    const ctx = tempCanvas.getContext('2d');
    if (!ctx) return;
    
    tempCanvas.width = 500;
    tempCanvas.height = 600;
    
    // Draw the t-shirt SVG
    const svgElement = document.querySelector('.tshirt-svg') as SVGSVGElement;
    if (svgElement) {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const img = new Image();
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      
      img.onload = () => {
        ctx.drawImage(img, 0, 0, 500, 600);
        
        // Draw the canvas design on top
        const designImg = new Image();
        designImg.onload = () => {
          ctx.drawImage(designImg, 50, 180, 400, 500);
          const dataUrl = tempCanvas.toDataURL('png');
          onExport(dataUrl);
          toast.success("Design exported with t-shirt!");
          URL.revokeObjectURL(url);
        };
        designImg.src = fabricCanvas.toDataURL({ format: "png", quality: 1, multiplier: 1 });
      };
      img.src = url;
    }
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
    <div className="flex flex-col h-full">
      {/* Compact Toolbar */}
      <div className="absolute top-4 left-4 z-10 flex gap-2 bg-card/95 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-border">
        <Button onClick={addText} size="sm" variant="ghost" title="Add Text">
          <Type className="w-4 h-4" />
        </Button>
        <Button onClick={addImage} size="sm" variant="ghost" title="Upload Image">
          <ImageIcon className="w-4 h-4" />
        </Button>
        <Button onClick={() => addShape("circle")} size="sm" variant="ghost" title="Add Circle">
          <CircleIcon className="w-4 h-4" />
        </Button>
        <Button onClick={() => addShape("rect")} size="sm" variant="ghost" title="Add Rectangle">
          <Square className="w-4 h-4" />
        </Button>
        {activeObject && (
          <>
            <div className="w-px bg-border" />
            <Button onClick={bringToFront} size="sm" variant="ghost" title="Bring to Front">
              <Layers className="w-4 h-4" />
            </Button>
            <Button onClick={sendToBack} size="sm" variant="ghost" title="Send to Back">
              <Layers className="w-4 h-4 rotate-180" />
            </Button>
            <Button onClick={deleteSelected} size="sm" variant="ghost" title="Delete">
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </>
        )}
      </div>

      {/* Properties Panel - Floating */}
      {activeObject && (
        <div className="absolute top-4 right-4 z-10 w-64 bg-card/95 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-border space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">Object Properties</h3>
            <Button onClick={deleteSelected} size="sm" variant="ghost">
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
          
          {activeObject.type === "i-text" && (
            <>
              <div>
                <Label className="text-xs">Text Color</Label>
                <Input
                  type="color"
                  value={activeObject.fill}
                  onChange={(e) => updateTextColor(e.target.value)}
                  className="h-8 mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Font Size: {activeObject.fontSize}px</Label>
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
            <Label className="text-xs">Scale: {(activeObject.scaleX || 1).toFixed(2)}x</Label>
            <Slider
              value={[activeObject.scaleX || 1]}
              onValueChange={(v) => updateScale(v[0])}
              min={0.1}
              max={3}
              step={0.1}
              className="mt-2"
            />
          </div>

          <div>
            <Label className="text-xs">Rotation: {Math.round(activeObject.angle || 0)}°</Label>
            <Slider
              value={[activeObject.angle || 0]}
              onValueChange={(v) => updateRotation(v[0])}
              min={0}
              max={360}
              step={1}
              className="mt-2"
            />
          </div>
        </div>
      )}

      {/* Export Button - Floating */}
      <div className="absolute bottom-4 right-4 z-10">
        <Button onClick={exportDesign} size="lg" className="shadow-lg">
          <Download className="w-4 h-4 mr-2" />
          Export Design
        </Button>
      </div>

      {/* Canvas with T-Shirt Mockup */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="relative" style={{ width: "500px", height: "600px" }}>
          {/* T-Shirt with realistic design */}
          <svg className="tshirt-svg absolute inset-0 w-full h-full" viewBox="0 0 500 600" style={{ filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.15))' }}>
            <defs>
              <linearGradient id="tshirtGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: tshirtColor, stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: tshirtColor, stopOpacity: 0.85 }} />
              </linearGradient>
              <filter id="fabricTexture">
                <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" result="noise" />
                <feDiffuseLighting in="noise" lightingColor="white" surfaceScale="0.5">
                  <feDistantLight azimuth="45" elevation="60" />
                </feDiffuseLighting>
                <feComposite operator="in" in2="SourceGraphic" />
                <feBlend mode="overlay" in2="SourceGraphic" />
              </filter>
            </defs>
            
            {/* Main t-shirt body with realistic curves */}
            <path 
              d="M 250,80 
                 C 235,78 220,78 205,82
                 L 180,95 L 165,105 
                 C 155,112 145,120 135,130
                 L 125,145 L 125,190
                 C 125,195 127,198 130,200
                 L 145,205 L 145,545
                 C 145,550 148,553 152,555
                 L 160,558 L 340,558 L 348,555
                 C 352,553 355,550 355,545
                 L 355,205 L 370,200
                 C 373,198 375,195 375,190
                 L 375,145 L 365,130
                 C 355,120 345,112 335,105
                 L 320,95 L 295,82
                 C 280,78 265,78 250,80 Z" 
              fill="url(#tshirtGradient)"
              stroke="rgba(0,0,0,0.1)"
              strokeWidth="1"
              filter="url(#fabricTexture)"
            />
            
            {/* Collar - V-neck */}
            <path 
              d="M 220,82 L 250,120 L 280,82" 
              fill="none"
              stroke="rgba(0,0,0,0.15)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            
            {/* Subtle shadows for depth */}
            <ellipse cx="250" cy="200" rx="80" ry="15" fill="rgba(0,0,0,0.05)" />
            <ellipse cx="145" cy="400" rx="10" ry="80" fill="rgba(0,0,0,0.03)" />
            <ellipse cx="355" cy="400" rx="10" ry="80" fill="rgba(0,0,0,0.03)" />
          </svg>
          
          {/* Canvas Overlay - Design Area */}
          <div className="absolute" style={{ top: '180px', left: '50%', transform: 'translateX(-50%)' }}>
            <canvas ref={canvasRef} />
          </div>
        </div>
      </div>
    </div>
  );
};
