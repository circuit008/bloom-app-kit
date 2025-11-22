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
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2
} from "lucide-react";
import { toast } from "sonner";
import tshirtBase from "@/assets/tshirt-base.png";

interface CanvasEditorProps {
  tshirtColor: string;
  aiGeneratedImage?: string;
  onExport: (dataUrl: string) => void;
}

export const CanvasEditor = ({ tshirtColor, aiGeneratedImage, onExport }: CanvasEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeObject, setActiveObject] = useState<any>(null);
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 262,
      height: 322,
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

  // Mouse wheel zoom
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY * -0.001;
      const newZoom = Math.min(Math.max(0.5, zoom + delta), 3);
      setZoom(newZoom);
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [zoom]);

  // Pan functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.ctrlKey)) { // Middle click or Ctrl+Left click
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  };

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
    
    // First fill with the t-shirt color
    ctx.fillStyle = tshirtColor;
    ctx.fillRect(0, 0, 500, 600);
    
    // Load and apply the t-shirt mask
    const tshirtImg = new Image();
    tshirtImg.crossOrigin = "anonymous";
    tshirtImg.onload = () => {
      // Use the t-shirt image as a mask
      ctx.globalCompositeOperation = 'destination-in';
      ctx.drawImage(tshirtImg, 0, 0, 500, 600);
      ctx.globalCompositeOperation = 'source-over';
      
      // Draw the canvas design on top
      const designImg = new Image();
      designImg.onload = () => {
        ctx.drawImage(designImg, 57, 195, 262, 322);
        const dataUrl = tempCanvas.toDataURL('image/png', 1);
        onExport(dataUrl);
        toast.success("Design saved successfully!");
      };
      designImg.src = fabricCanvas.toDataURL({ format: "png", quality: 1, multiplier: 1 });
    };
    tshirtImg.src = tshirtBase;
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
      {/* Zoom Controls - Bottom Left Corner of Canvas */}
      <div className="absolute left-2 bottom-2 z-10 flex gap-1 bg-background/95 backdrop-blur-sm rounded-lg shadow-lg p-1 border">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleZoomOut}
          className="w-6 h-6 p-0"
          title="Zoom Out"
        >
          <ZoomOut className="w-3 h-3" />
        </Button>
        <div className="text-xs px-2 py-1 font-medium flex items-center">
          {Math.round(zoom * 100)}%
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleZoomIn}
          className="w-6 h-6 p-0"
          title="Zoom In"
        >
          <ZoomIn className="w-3 h-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleResetZoom}
          className="w-6 h-6 p-0"
          title="Reset Zoom"
        >
          <Maximize2 className="w-3 h-3" />
        </Button>
      </div>

      {/* Compact Toolbar */}
      <div className="absolute top-4 right-4 z-10 flex gap-2 bg-card/95 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-border">
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
        <div className="w-px bg-border" />
        <Button onClick={exportDesign} size="sm" variant="default" title="Export Design">
          <Download className="w-4 h-4" />
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

      {/* Canvas with T-Shirt Mockup */}
      <div 
        ref={containerRef}
        className="flex-1 flex items-center justify-center p-4 overflow-hidden cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div 
          className="relative" 
          style={{ 
            width: "337px",
            aspectRatio: "5/6",
            transform: `scale(${zoom}) translate(${panOffset.x / zoom}px, ${panOffset.y / zoom}px)`,
            transformOrigin: "center center",
            transition: isPanning ? 'none' : 'transform 0.1s ease-out'
          }}
        >
          {/* Isolated container for t-shirt and color overlay */}
          <div className="absolute inset-0" style={{ isolation: 'isolate' }}>
            {/* T-Shirt Base Image */}
            <img 
              src={tshirtBase} 
              alt="T-shirt base" 
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
              draggable={false}
            />
            
            {/* Color Overlay - only affects t-shirt pixels */}
            <div 
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{
                backgroundColor: tshirtColor,
                mixBlendMode: 'multiply',
                WebkitMaskImage: `url(${tshirtBase})`,
                WebkitMaskSize: 'contain',
                WebkitMaskPosition: 'center',
                WebkitMaskRepeat: 'no-repeat',
                maskImage: `url(${tshirtBase})`,
                maskSize: 'contain',
                maskPosition: 'center',
                maskRepeat: 'no-repeat',
              }}
            />
          </div>
          
          {/* Canvas Overlay - Design Area */}
          <div 
            className="absolute mix-blend-multiply" 
            style={{ 
              top: '30%', 
              left: '50%', 
              transform: 'translateX(-50%)',
              pointerEvents: isPanning ? 'none' : 'auto'
            }}
          >
            <canvas ref={canvasRef} />
          </div>
        </div>
      </div>
    </div>
  );
};
