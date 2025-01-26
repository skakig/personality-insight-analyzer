export const getSubscriptionTitle = (tier: string): string => {
  switch (tier.toLowerCase()) {
    case 'individual':
      return 'Individual Dashboard';
    case 'pro':
      return 'Professional Dashboard';
    case 'enterprise':
      return 'Enterprise Dashboard';
    default:
      return 'Dashboard';
  }
};