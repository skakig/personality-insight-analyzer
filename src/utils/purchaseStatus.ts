
/**
 * Utility to determine if a result is purchased
 */
export const isPurchased = (result: any): boolean => {
  if (!result) return false;
  
  // Check various purchase status indicators
  return (
    result.is_purchased === true ||
    result.purchase_status === 'completed' ||
    result.access_method === 'purchase' ||
    result.is_detailed === true
  );
};

/**
 * Utility to determine if a result is in a pending purchase state
 */
export const isPending = (result: any): boolean => {
  if (!result) return false;
  
  return (
    result.purchase_status === 'pending' ||
    result.purchase_initiated_at != null
  );
};

/**
 * Utility to check if we should allow access to detailed results
 */
export const shouldAllowAccess = (result: any): boolean => {
  if (!result) return false;
  
  return (
    isPurchased(result) ||
    result.access_method === 'free' ||
    result.access_method === 'credit' ||
    result.access_method === 'subscription'
  );
};

/**
 * Utility to check if we should show purchase options
 */
export const shouldShowPurchaseOptions = (result: any): boolean => {
  if (!result) return false;
  
  return (
    !isPurchased(result) &&
    !isPending(result) &&
    result.access_method !== 'free' &&
    result.access_method !== 'credit' &&
    result.access_method !== 'subscription'
  );
};

/**
 * Utility to check if a user has any purchased reports in their assessment history
 */
export const hasAnyPurchasedReport = (assessments: any[]): boolean => {
  if (!assessments || !assessments.length) return false;
  
  return assessments.some(assessment => isPurchased(assessment));
};
