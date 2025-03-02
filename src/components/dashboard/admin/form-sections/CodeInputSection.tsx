
import { Dispatch, SetStateAction } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface CodeInputSectionProps {
  code: string;
  setCode: Dispatch<SetStateAction<string>>;
  generateCode: () => void;
  isGenerating: boolean;
}

export const CodeInputSection = ({
  code,
  setCode,
  generateCode,
  isGenerating,
}: CodeInputSectionProps) => {
  return (
    <div className="space-y-2">
      <label htmlFor="code" className="text-sm font-medium">Coupon Code</label>
      <div className="flex gap-2">
        <Input
          id="code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className="flex-1"
          placeholder="e.g. SUMMER25"
        />
        <Button
          type="button"
          variant="outline"
          onClick={generateCode}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Generate"
          )}
        </Button>
      </div>
    </div>
  );
};
