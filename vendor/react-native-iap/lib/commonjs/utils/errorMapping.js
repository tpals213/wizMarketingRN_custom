"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getUserFriendlyErrorMessage = getUserFriendlyErrorMessage;
exports.isNetworkError = isNetworkError;
exports.isRecoverableError = isRecoverableError;
exports.isUserCancelledError = isUserCancelledError;
var _purchaseError = require("../purchaseError");
/**
 * Error mapping utilities for react-native-iap
 * Provides helper functions for handling platform-specific errors
 */

/**
 * Checks if an error is a user cancellation
 * @param error Error object or error code
 * @returns True if the error represents user cancellation
 */
function isUserCancelledError(error) {
  if (typeof error === 'string') {
    return error === _purchaseError.ErrorCode.E_USER_CANCELLED;
  }
  if (error && error.code) {
    return error.code === _purchaseError.ErrorCode.E_USER_CANCELLED;
  }
  return false;
}

/**
 * Checks if an error is related to network connectivity
 * @param error Error object or error code
 * @returns True if the error is network-related
 */
function isNetworkError(error) {
  const networkErrors = [_purchaseError.ErrorCode.E_NETWORK_ERROR, _purchaseError.ErrorCode.E_REMOTE_ERROR, _purchaseError.ErrorCode.E_SERVICE_ERROR];
  const errorCode = typeof error === 'string' ? error : error === null || error === void 0 ? void 0 : error.code;
  return networkErrors.includes(errorCode);
}

/**
 * Checks if an error is recoverable (user can retry)
 * @param error Error object or error code
 * @returns True if the error is potentially recoverable
 */
function isRecoverableError(error) {
  const recoverableErrors = [_purchaseError.ErrorCode.E_NETWORK_ERROR, _purchaseError.ErrorCode.E_REMOTE_ERROR, _purchaseError.ErrorCode.E_SERVICE_ERROR, _purchaseError.ErrorCode.E_INTERRUPTED];
  const errorCode = typeof error === 'string' ? error : error === null || error === void 0 ? void 0 : error.code;
  return recoverableErrors.includes(errorCode);
}

/**
 * Gets a user-friendly error message for display
 * @param error Error object or error code
 * @returns User-friendly error message
 */
function getUserFriendlyErrorMessage(error) {
  const errorCode = typeof error === 'string' ? error : error === null || error === void 0 ? void 0 : error.code;
  switch (errorCode) {
    case _purchaseError.ErrorCode.E_USER_CANCELLED:
      return 'Purchase was cancelled by user';
    case _purchaseError.ErrorCode.E_NETWORK_ERROR:
      return 'Network connection error. Please check your internet connection and try again.';
    case _purchaseError.ErrorCode.E_ITEM_UNAVAILABLE:
      return 'This item is not available for purchase';
    case _purchaseError.ErrorCode.E_ALREADY_OWNED:
      return 'You already own this item';
    case _purchaseError.ErrorCode.E_DEFERRED_PAYMENT:
      return 'Payment is pending approval';
    case _purchaseError.ErrorCode.E_NOT_PREPARED:
      return 'In-app purchase is not ready. Please try again later.';
    case _purchaseError.ErrorCode.E_SERVICE_ERROR:
      return 'Store service error. Please try again later.';
    case _purchaseError.ErrorCode.E_TRANSACTION_VALIDATION_FAILED:
      return 'Transaction could not be verified';
    case _purchaseError.ErrorCode.E_RECEIPT_FAILED:
      return 'Receipt processing failed';
    default:
      return (error === null || error === void 0 ? void 0 : error.message) || 'An unexpected error occurred';
  }
}
//# sourceMappingURL=errorMapping.js.map