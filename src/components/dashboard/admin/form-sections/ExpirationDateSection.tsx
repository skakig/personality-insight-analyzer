
import { Dispatch, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

interface ExpirationDateSectionProps {
  expiresAt: Date | undefined;
  setExpiresAt: Dispatch<SetStateAction<Date | undefined>>;
}

export const ExpirationDateSection = ({
  expiresAt,
  setExpiresAt,
}: ExpirationDateSectionProps) => {
  return (
    <div className="space-y-2">
      <label htmlFor="expires-at" className="text-sm font-medium">Expiration Date</label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {expiresAt ? format(expiresAt, "PPP") : "Select date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={expiresAt}
            onSelect={setExpiresAt}
            initialFocus
            disabled={(date) => date < new Date()}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
