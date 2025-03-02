import { supabase } from "@/integrations/supabase/client";
import { isPurchased } from "./purchaseStatus";
import { QuizResult } from "@/types/quiz";
import { executeVerification } from "./purchase/verificationCore";

// Define a new function that doesn't rely on the missing import
export const verifyPurchaseWithRetry = async (
  resultId: string,
  maxRetries: number = 5,
  delayMs: number = 2000
): Promise<QuizResult | null> => {
  return await executeVerification(resultId, maxRetries, delayMs);
};
