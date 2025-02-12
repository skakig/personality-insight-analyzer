
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Gift } from "lucide-react";

interface GiftPurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  giftEmail: string;
  setGiftEmail: (email: string) => void;
  onPurchase: () => void;
  loading: boolean;
}

export const GiftPurchaseDialog = ({
  open,
  onOpenChange,
  giftEmail,
  setGiftEmail,
  onPurchase,
  loading
}: GiftPurchaseDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full sm:w-auto">
          <Gift className="mr-2 h-4 w-4" />
          Gift This Test
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gift This Assessment</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <label htmlFor="giftEmail" className="text-sm font-medium text-gray-700">
              Recipient's Email
            </label>
            <Input
              id="giftEmail"
              type="email"
              placeholder="friend@example.com"
              value={giftEmail}
              onChange={(e) => setGiftEmail(e.target.value)}
            />
          </div>
          <Button 
            onClick={onPurchase}
            className="w-full"
            disabled={loading}
          >
            {loading ? "Processing..." : "Send Gift"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
