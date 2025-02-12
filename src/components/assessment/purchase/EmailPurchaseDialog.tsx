
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface EmailPurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  setEmail: (email: string) => void;
  onPurchase: () => void;
  loading: boolean;
}

export const EmailPurchaseDialog = ({
  open,
  onOpenChange,
  email,
  setEmail,
  onPurchase,
  loading
}: EmailPurchaseDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter Your Email</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              Your Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button 
            onClick={onPurchase}
            className="w-full"
            disabled={loading}
          >
            {loading ? "Processing..." : "Continue to Purchase"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
