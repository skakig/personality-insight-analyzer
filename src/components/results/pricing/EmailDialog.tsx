
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface EmailDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  loading: boolean;
}

export const EmailDialog = ({ 
  isOpen, 
  onOpenChange, 
  email, 
  onEmailChange, 
  onSubmit, 
  loading 
}: EmailDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter your email to continue</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={onEmailChange}
          />
          <Button 
            onClick={onSubmit}
            className="w-full"
            disabled={loading}
          >
            {loading ? "Processing..." : "Continue to Checkout"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
