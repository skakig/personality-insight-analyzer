
/**
 * Re-export verification strategies and utilities
 */

// Export from verificationUtils.ts
export * from './verificationUtils';

// Export from baseStrategies.ts
export * from './baseStrategies';

// Export from coreStrategies.ts
export * from './coreStrategies';

// Re-export from strategies
export * from './strategies/fallbackVerification';
export * from './strategies/guestVerification';
export * from './strategies/userVerification';
export * from './strategies/stripeVerification';

// Create compatibility export for executeVerification
export { executeVerification } from '../verificationCore';
