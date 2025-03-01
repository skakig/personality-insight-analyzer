
import { useState } from "react";

export const useVerificationState = () => {
  const [verifying, setVerifying] = useState(false);
  const [verificationAttempts, setVerificationAttempts] = useState(0);

  const startVerification = () => {
    setVerifying(true);
  };

  const stopVerification = () => {
    setVerifying(false);
  };

  const incrementAttempts = () => {
    setVerificationAttempts(prev => prev + 1);
  };

  return {
    verifying,
    verificationAttempts,
    startVerification,
    stopVerification,
    incrementAttempts
  };
};
