
import { supabase } from "@/integrations/supabase/client";
import { useModalState } from "./hooks/useModalState";
import { useDirectPurchase } from "./hooks/useDirectPurchase";
import { useGiftPurchase } from "./hooks/useGiftPurchase";
import { useEmailPurchase } from "./hooks/useEmailPurchase";
import { useSaveReport } from "./hooks/useSaveReport";
import { useEffect } from "react";

export const usePurchaseHandler = (resultId: string) => {
  const {
    purchaseLoading,
    setPurchaseLoading,
    giftEmail,
    setGiftEmail,
    email,
    setEmail,
    isGiftDialogOpen,
    setIsGiftDialogOpen,
    isEmailDialogOpen,
    setIsEmailDialogOpen,
  } = useModalState();

  const handlePurchase = useDirectPurchase(resultId, setPurchaseLoading);
  const handleGiftPurchase = useGiftPurchase(resultId, giftEmail, setPurchaseLoading, setIsGiftDialogOpen);
  const handleEmailPurchase = useEmailPurchase(resultId, email, setPurchaseLoading, setIsEmailDialogOpen);
  const handleSaveReport = useSaveReport(resultId, setPurchaseLoading);

  // Verify authentication when component mounts
  useEffect(() => {
    const checkAuthState = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Purchase handler authentication check:', {
          isAuthenticated: !!session?.user,
          userId: session?.user?.id || 'guest',
          resultId
        });
      } catch (error) {
        console.error('Error checking auth state:', error);
      }
    };
    
    checkAuthState();
    
    // Try to retrieve email from localStorage if available
    const storedEmail = localStorage.getItem('guestEmail');
    if (storedEmail && email === '') {
      setEmail(storedEmail);
    }
  }, [resultId]);

  return {
    purchaseLoading,
    giftEmail,
    setGiftEmail,
    email,
    setEmail,
    isGiftDialogOpen,
    setIsGiftDialogOpen,
    isEmailDialogOpen,
    setIsEmailDialogOpen,
    handlePurchase,
    handleGiftPurchase,
    handleEmailPurchase,
    handleSaveReport
  };
};
