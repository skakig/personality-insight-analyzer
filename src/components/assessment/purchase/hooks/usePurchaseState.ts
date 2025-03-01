
import { useState } from "react";

export const usePurchaseState = () => {
  const [internalLoading, setInternalLoading] = useState(false);
  
  return {
    internalLoading,
    setInternalLoading
  };
};
