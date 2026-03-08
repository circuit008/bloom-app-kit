import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface KeywordInputProps {
  keywords: string[];
  onKeywordsChange: (keywords: string[]) => void;
  inputRef?: React.RefObject<HTMLInputElement>;
}

export function KeywordInput({ keywords, onKeywordsChange }: KeywordInputProps) {
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = (e.target as HTMLInputElement).value.trim().replace(/,$/,"");
      if (val && !keywords.includes(val)) {
        onKeywordsChange([...keywords, val]);
      }
      (e.target as HTMLInputElement).value = "";
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text");
    const newTerms = text
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t && !keywords.includes(t));
    if (newTerms.length) {
      onKeywordsChange([...keywords, ...newTerms]);
    }
  };

  const removeKeyword = (kw: string) => {
    onKeywordsChange(keywords.filter((k) => k !== kw));
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">Design Keywords / Text</label>
      <Input
        placeholder="Type keywords and press Enter or comma to add..."
        onKeyDown={handleInputKeyDown}
        onPaste={handlePaste}
      />
      <p className="text-xs text-muted-foreground">
        Enter text, brand names, or phrases used in your design (comma separated)
      </p>

      {keywords.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {keywords.map((kw) => (
            <Badge key={kw} variant="secondary" className="gap-1 pr-1">
              {kw}
              <button
                onClick={() => removeKeyword(kw)}
                className="ml-1 h-4 w-4 rounded-full hover:bg-muted-foreground/20 flex items-center justify-center"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
