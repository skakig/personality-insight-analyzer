
import { useModalState } from "./hooks/useModalState";
import { useDirectPurchase } from "./hooks/useDirectPurchase";
import { useGiftPurchase } from "./hooks/useGiftPurchase";
import { useEmailPurchase } from "./hooks/useEmailPurchase";
import { useSaveReport } from "./hooks/useSaveReport";

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
