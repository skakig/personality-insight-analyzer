
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BenefitsList } from "./purchase/BenefitsList";
import { PurchaseButton } from "./purchase/PurchaseButton";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Gift } from "lucide-react";

interface PurchaseSectionProps {
  resultId: string;
  loading: boolean;
}

export const PurchaseSection = ({ resultId, loading }: PurchaseSectionProps) => {
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [giftEmail, setGiftEmail] = useState("");
  const [email, setEmail] = useState("");
  const [isGiftDialogOpen, setIsGiftDialogOpen] = useState(false);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const navigate = useNavigate();

  const handlePurchase = async (giftRecipientEmail?: string, purchaseEmail?: string) => {
    try {
      setPurchaseLoading(true);
      console.log('Initiating checkout for result:', resultId, giftRecipientEmail ? 'as gift' : '');
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        // For guest purchase, we need an email
        if (!purchaseEmail) {
          setIsEmailDialogOpen(true);
          return;
        }
      }

      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { 
          resultId,
          userId: session?.user?.id,
          mode: 'payment',
          giftRecipientEmail,
          email: purchaseEmail
        }
      });

      if (error) throw error;
      
      if (!data?.url) {
        throw new Error('No checkout URL received');
      }

      window.location.href = data.url;
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to initiate checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPurchaseLoading(false);
      setIsGiftDialogOpen(false);
      setIsEmailDialogOpen(false);
    }
  };

  const handleGiftPurchase = () => {
    if (!giftEmail) {
      toast({
        title: "Email Required",
        description: "Please enter the recipient's email address.",
        variant: "destructive",
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(giftEmail)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    handlePurchase(giftEmail);
  };

  const handleEmailPurchase = () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address to receive the report.",
        variant: "destructive",
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    handlePurchase(undefined, email);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-primary/5 to-secondary/5 p-6 rounded-xl border border-primary/10">
        <div className="flex items-center gap-2 mb-4">
          <h4 className="font-medium text-lg">Unlock Your Full Potential</h4>
        </div>
        
        <div className="space-y-4">
          <BenefitsList />
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
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
                    onClick={handleEmailPurchase}
                    className="w-full"
                    disabled={purchaseLoading}
                  >
                    {purchaseLoading ? "Processing..." : "Continue to Purchase"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            
            <PurchaseButton 
              onClick={() => handlePurchase()} 
              loading={loading || purchaseLoading}
            />
            
            <Dialog open={isGiftDialogOpen} onOpenChange={setIsGiftDialogOpen}>
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
                    onClick={handleGiftPurchase}
                    className="w-full"
                    disabled={purchaseLoading}
                  >
                    {purchaseLoading ? "Processing..." : "Send Gift"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <p className="text-xs text-center text-gray-500 mt-4">
            Join thousands of others who have transformed their approach to ethical decision-making
          </p>
        </div>
      </div>
    </div>
  );
};
