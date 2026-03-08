import { useState, useCallback, useRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/svg+xml"];
const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

interface DesignUploadProps {
  file: File | null;
  preview: string | null;
  onFileChange: (file: File | null, preview: string | null) => void;
}

export function DesignUpload({ file, preview, onFileChange }: DesignUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndSet = useCallback(
    (f: File) => {
      if (!ACCEPTED_TYPES.includes(f.type)) {
        toast.error("Invalid file type. Please upload PNG, JPG, or SVG.");
        return;
      }
      if (f.size > MAX_SIZE_BYTES) {
        toast.error(`File too large. Maximum size is ${MAX_SIZE_MB}MB.`);
        return;
      }
      const url = URL.createObjectURL(f);
      onFileChange(f, url);
    },
    [onFileChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const f = e.dataTransfer.files[0];
      if (f) validateAndSet(f);
    },
    [validateAndSet]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) validateAndSet(f);
  };

  const handleRemove = () => {
    if (preview) URL.revokeObjectURL(preview);
    onFileChange(null, null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">Design Image</label>

      {preview ? (
        <div className="relative rounded-lg border bg-muted/30 p-4 flex items-center gap-4">
          <img
            src={preview}
            alt="Preview"
            className="h-24 w-24 rounded-md object-contain border bg-background"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{file?.name}</p>
            <p className="text-xs text-muted-foreground">
              {file ? (file.size / 1024 / 1024).toFixed(2) + " MB" : ""}
            </p>
          </div>
          <button
            onClick={handleRemove}
            className="h-8 w-8 rounded-full bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive/20 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "rounded-lg border-2 border-dashed p-10 flex flex-col items-center gap-3 cursor-pointer transition-colors",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-muted/30"
          )}
        >
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">
              Drag & drop your design, or <span className="text-primary">browse</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              PNG, JPG, or SVG · Max {MAX_SIZE_MB}MB
            </p>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.svg"
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  );
}
