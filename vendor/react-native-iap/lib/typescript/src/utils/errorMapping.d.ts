/**
 * Error mapping utilities for react-native-iap
 * Provides helper functions for handling platform-specific errors
 */
/**
 * Checks if an error is a user cancellation
 * @param error Error object or error code
 * @returns True if the error represents user cancellation
 */
export declare function isUserCancelledError(error: any): boolean;
/**
 * Checks if an error is related to network connectivity
 * @param error Error object or error code
 * @returns True if the error is network-related
 */
export declare function isNetworkError(error: any): boolean;
/**
 * Checks if an error is recoverable (user can retry)
 * @param error Error object or error code
 * @returns True if the error is potentially recoverable
 */
export declare function isRecoverableError(error: any): boolean;
/**
 * Gets a user-friendly error message for display
 * @param error Error object or error code
 * @returns User-friendly error message
 */
export declare function getUserFriendlyErrorMessage(error: any): string;
//# sourceMappingURL=errorMapping.d.ts.map