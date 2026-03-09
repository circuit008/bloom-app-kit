import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";

interface ProtectedImageProps {
  src: string;
  alt: string;
  className?: string;
  watermarkText?: string;
  lowRes?: boolean;
  containerClassName?: string;
}

/**
 * ProtectedImage — renders an image with copyright protections:
 * - Watermark overlay text
 * - Right-click disabled
 * - Drag disabled
 * - Transparent overlay div prevents easy saving
 * - Optional low-res blur (lowRes prop)
 */
export function ProtectedImage({
  src,
  alt,
  className,
  watermarkText = "© POD Guard",
  lowRes = false,
  containerClassName,
}: ProtectedImageProps) {
  const [loaded, setLoaded] = useState(false);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  const handleDragStart = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  return (
    <div
      className={cn("relative select-none overflow-hidden group", containerClassName)}
      onContextMenu={handleContextMenu}
    >
      {/* The actual image */}
      <img
        src={src}
        alt={alt}
        draggable={false}
        onDragStart={handleDragStart}
        onContextMenu={handleContextMenu}
        onLoad={() => setLoaded(true)}
        className={cn(
          "pointer-events-none w-full h-full object-cover transition-all",
          lowRes && "blur-[2px] scale-105",
          className
        )}
      />

      {/* Invisible overlay to block interactions */}
      <div
        className="absolute inset-0 z-10"
        onContextMenu={handleContextMenu}
        onDragStart={handleDragStart}
        aria-hidden="true"
      />

      {/* Watermark overlay */}
      {loaded && (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
          aria-hidden="true"
        >
          <div className="rotate-[-30deg] flex flex-col items-center gap-4">
            {Array.from({ length: 3 }).map((_, row) => (
              <div key={row} className="flex gap-12">
                {Array.from({ length: 3 }).map((_, col) => (
                  <span
                    key={col}
                    className="text-foreground/[0.07] text-sm font-bold whitespace-nowrap tracking-widest uppercase"
                  >
                    {watermarkText}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Low-res badge */}
      {lowRes && (
        <div className="absolute bottom-2 right-2 z-30 bg-background/80 backdrop-blur-sm text-[10px] text-muted-foreground px-2 py-0.5 rounded-full">
          Preview only
        </div>
      )}
    </div>
  );
}
