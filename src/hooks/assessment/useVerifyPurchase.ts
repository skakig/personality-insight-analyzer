
import { useCallback, useState } from "react";
import { executeVerification } from "@/utils/purchase/verificationCore";
import { toast } from "@/hooks/use-toast";
import { isPurchased } from "@/utils/purchaseStatus";
import { useResultFetchingStrategies } from "./verification/useResultFetchingStrategies";

export const useVerifyPurchase = () => {
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const resultFetchers = useResultFetchingStrategies();
  
  const verifyPurchase = useCallback(async (resultId: string, maxRetries = 5) => {
    if (!resultId) {
      console.error('Cannot verify purchase: missing resultId');
      setError('Missing result ID');
      return null;
    }
    
    try {
      setLoading(true);
      setError(null);
      console.log('Starting purchase verification for result:', resultId);

      // First try to fetch the result directly to see if it's already marked as purchased
      const { data: directResult } = await resultFetchers.fetchUserResult(resultId);
      
      if (directResult && isPurchased(directResult)) {
        console.log('Result already marked as purchased');
        setVerified(true);
        return directResult;
      }
      
      // If not already verified, start the verification process
      const verifiedResult = await executeVerification(resultId, maxRetries);
      
      if (verifiedResult && isPurchased(verifiedResult)) {
        console.log('Verification successful:', verifiedResult);
        setVerified(true);
        return verifiedResult;
      } else {
        console.error('Failed to verify purchase after maximum retries');
        setError('Failed to verify purchase');
        setVerified(false);
        
        toast({
          title: "Verification Failed",
          description: "We couldn't verify your purchase. Please try again or contact support.",
          variant: "destructive",
        });
        
        return null;
      }
    } catch (error: any) {
      console.error('Error during purchase verification:', error);
      setError(error.message || 'Verification error');
      setVerified(false);
      
      toast({
        title: "Verification Error",
        description: "An error occurred during verification. Please try again.",
        variant: "destructive",
      });
      
      return null;
    } finally {
      setLoading(false);
    }
  }, [resultFetchers]);

  return {
    verifyPurchase,
    loading,
    verified,
    error
  };
};
