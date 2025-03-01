
/**
 * Utility functions for checking purchase status
 */

/**
 * Checks if an assessment is purchased based on its attributes
 */
export const isPurchased = (assessment: {
  is_purchased?: boolean;
  is_detailed?: boolean;
  access_method?: string | null;
}) => {
  return (
    assessment.is_purchased === true ||
    assessment.is_detailed === true ||
    assessment.access_method === 'purchase'
  );
};

/**
 * Checks if any assessment in a collection is purchased
 */
export const hasAnyPurchasedReport = (assessments: Array<{
  is_purchased?: boolean;
  is_detailed?: boolean;
  access_method?: string | null;
}>) => {
  return assessments.some(assessment => isPurchased(assessment));
};
