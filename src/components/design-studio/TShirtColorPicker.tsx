import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface TShirtColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
}

const TSHIRT_COLORS = [
  { name: "White", value: "#FFFFFF" },
  { name: "Black", value: "#000000" },
  { name: "Navy", value: "#1e3a8a" },
  { name: "Red", value: "#dc2626" },
  { name: "Green", value: "#16a34a" },
  { name: "Yellow", value: "#facc15" },
  { name: "Pink", value: "#ec4899" },
  { name: "Purple", value: "#9333ea" },
  { name: "Gray", value: "#6b7280" },
  { name: "Light Blue", value: "#38bdf8" },
  { name: "Orange", value: "#f97316" },
  { name: "Teal", value: "#14b8a6" },
];

export const TShirtColorPicker = ({ selectedColor, onColorChange }: TShirtColorPickerProps) => {
  return (
    <div className="grid grid-cols-6 gap-1.5">
      {TSHIRT_COLORS.map((color) => (
        <button
          key={color.value}
          onClick={() => onColorChange(color.value)}
          className={cn(
            "w-8 h-8 rounded-md border-2 transition-all hover:scale-105",
            selectedColor === color.value ? "border-primary ring-2 ring-primary ring-offset-1" : "border-border"
          )}
          style={{ backgroundColor: color.value }}
          title={color.name}
        />
      ))}
    </div>
  );
};
