
import { useState } from "react";

export const useModalState = () => {
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [giftEmail, setGiftEmail] = useState("");
  const [email, setEmail] = useState("");
  const [isGiftDialogOpen, setIsGiftDialogOpen] = useState(false);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);

  return {
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
  };
};
