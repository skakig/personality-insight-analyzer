
import { useState } from "react";
import { useLoggedInCheckout } from "./useLoggedInCheckout";
import { useGuestCheckout } from "./useGuestCheckout";

export const useCheckoutFlow = (session: any, quizResultId: string | null) => {
  const [email, setEmail] = useState("");
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  
  const userId = session?.user?.id;
  
  const { loading: loggedInLoading, handleLoggedInCheckout } = useLoggedInCheckout(quizResultId, userId);
  const { loading: guestLoading, handleGuestCheckout } = useGuestCheckout(quizResultId);
  
  const loading = loggedInLoading || guestLoading;

  const handleGetDetailedResults = async () => {
    if (!quizResultId) {
      return;
    }

    if (session?.user) {
      await handleLoggedInCheckout();
    } else {
      setIsEmailDialogOpen(true);
    }
  };

  const handleGuestSubmit = async () => {
    const success = await handleGuestCheckout(email);
    if (success) {
      setIsEmailDialogOpen(false);
    }
  };

  return {
    email,
    setEmail,
    isEmailDialogOpen,
    setIsEmailDialogOpen,
    loading,
    handleGetDetailedResults,
    handleGuestSubmit
  };
};
