export declare enum ErrorCode {
    E_UNKNOWN = "E_UNKNOWN",
    E_USER_CANCELLED = "E_USER_CANCELLED",
    E_USER_ERROR = "E_USER_ERROR",
    E_ITEM_UNAVAILABLE = "E_ITEM_UNAVAILABLE",
    E_REMOTE_ERROR = "E_REMOTE_ERROR",
    E_NETWORK_ERROR = "E_NETWORK_ERROR",
    E_SERVICE_ERROR = "E_SERVICE_ERROR",
    E_RECEIPT_FAILED = "E_RECEIPT_FAILED",
    E_RECEIPT_FINISHED_FAILED = "E_RECEIPT_FINISHED_FAILED",
    E_NOT_PREPARED = "E_NOT_PREPARED",
    E_NOT_ENDED = "E_NOT_ENDED",
    E_ALREADY_OWNED = "E_ALREADY_OWNED",
    E_DEVELOPER_ERROR = "E_DEVELOPER_ERROR",
    E_BILLING_RESPONSE_JSON_PARSE_ERROR = "E_BILLING_RESPONSE_JSON_PARSE_ERROR",
    E_DEFERRED_PAYMENT = "E_DEFERRED_PAYMENT",
    E_INTERRUPTED = "E_INTERRUPTED",
    E_IAP_NOT_AVAILABLE = "E_IAP_NOT_AVAILABLE",
    E_PURCHASE_ERROR = "E_PURCHASE_ERROR",
    E_SYNC_ERROR = "E_SYNC_ERROR",
    E_TRANSACTION_VALIDATION_FAILED = "E_TRANSACTION_VALIDATION_FAILED",
    E_ACTIVITY_UNAVAILABLE = "E_ACTIVITY_UNAVAILABLE",
    E_ALREADY_PREPARED = "E_ALREADY_PREPARED",
    E_PENDING = "E_PENDING",
    E_CONNECTION_CLOSED = "E_CONNECTION_CLOSED"
}
/**
 * Platform-specific error code mappings
 * Maps ErrorCode enum values to platform-specific integer codes
 */
export declare const ErrorCodeMapping: {
    readonly ios: {
        readonly E_UNKNOWN: 0;
        readonly E_SERVICE_ERROR: 1;
        readonly E_USER_CANCELLED: 2;
        readonly E_USER_ERROR: 3;
        readonly E_ITEM_UNAVAILABLE: 4;
        readonly E_REMOTE_ERROR: 5;
        readonly E_NETWORK_ERROR: 6;
        readonly E_RECEIPT_FAILED: 7;
        readonly E_RECEIPT_FINISHED_FAILED: 8;
        readonly E_DEVELOPER_ERROR: 9;
        readonly E_PURCHASE_ERROR: 10;
        readonly E_SYNC_ERROR: 11;
        readonly E_DEFERRED_PAYMENT: 12;
        readonly E_TRANSACTION_VALIDATION_FAILED: 13;
        readonly E_NOT_PREPARED: 14;
        readonly E_NOT_ENDED: 15;
        readonly E_ALREADY_OWNED: 16;
        readonly E_BILLING_RESPONSE_JSON_PARSE_ERROR: 17;
        readonly E_INTERRUPTED: 18;
        readonly E_IAP_NOT_AVAILABLE: 19;
        readonly E_ACTIVITY_UNAVAILABLE: 20;
        readonly E_ALREADY_PREPARED: 21;
        readonly E_PENDING: 22;
        readonly E_CONNECTION_CLOSED: 23;
    };
    readonly android: {
        readonly E_UNKNOWN: "E_UNKNOWN";
        readonly E_USER_CANCELLED: "E_USER_CANCELLED";
        readonly E_USER_ERROR: "E_USER_ERROR";
        readonly E_ITEM_UNAVAILABLE: "E_ITEM_UNAVAILABLE";
        readonly E_REMOTE_ERROR: "E_REMOTE_ERROR";
        readonly E_NETWORK_ERROR: "E_NETWORK_ERROR";
        readonly E_SERVICE_ERROR: "E_SERVICE_ERROR";
        readonly E_RECEIPT_FAILED: "E_RECEIPT_FAILED";
        readonly E_RECEIPT_FINISHED_FAILED: "E_RECEIPT_FINISHED_FAILED";
        readonly E_NOT_PREPARED: "E_NOT_PREPARED";
        readonly E_NOT_ENDED: "E_NOT_ENDED";
        readonly E_ALREADY_OWNED: "E_ALREADY_OWNED";
        readonly E_DEVELOPER_ERROR: "E_DEVELOPER_ERROR";
        readonly E_BILLING_RESPONSE_JSON_PARSE_ERROR: "E_BILLING_RESPONSE_JSON_PARSE_ERROR";
        readonly E_DEFERRED_PAYMENT: "E_DEFERRED_PAYMENT";
        readonly E_INTERRUPTED: "E_INTERRUPTED";
        readonly E_IAP_NOT_AVAILABLE: "E_IAP_NOT_AVAILABLE";
        readonly E_PURCHASE_ERROR: "E_PURCHASE_ERROR";
        readonly E_SYNC_ERROR: "E_SYNC_ERROR";
        readonly E_TRANSACTION_VALIDATION_FAILED: "E_TRANSACTION_VALIDATION_FAILED";
        readonly E_ACTIVITY_UNAVAILABLE: "E_ACTIVITY_UNAVAILABLE";
        readonly E_ALREADY_PREPARED: "E_ALREADY_PREPARED";
        readonly E_PENDING: "E_PENDING";
        readonly E_CONNECTION_CLOSED: "E_CONNECTION_CLOSED";
    };
};
export declare class PurchaseError implements Error {
    name: string;
    message: string;
    responseCode?: number | undefined;
    debugMessage?: string | undefined;
    code?: ErrorCode | undefined;
    productId?: string | undefined;
    platform?: "ios" | "android" | undefined;
    constructor(name: string, message: string, responseCode?: number | undefined, debugMessage?: string | undefined, code?: ErrorCode | undefined, productId?: string | undefined, platform?: "ios" | "android" | undefined);
    /**
     * Creates a PurchaseError from platform-specific error data
     * @param errorData Raw error data from native modules
     * @param platform Platform where the error occurred
     * @returns Properly typed PurchaseError instance
     */
    static fromPlatformError(errorData: any, platform: 'ios' | 'android'): PurchaseError;
    /**
     * Gets the platform-specific error code for this error
     * @returns Platform-specific error code
     */
    getPlatformCode(): string | number | undefined;
}
/**
 * Utility functions for error code mapping and validation
 */
export declare const ErrorCodeUtils: {
    /**
     * Maps a platform-specific error code back to the standardized ErrorCode enum
     * @param platformCode Platform-specific error code (string for Android, number for iOS)
     * @param platform Target platform
     * @returns Corresponding ErrorCode enum value or E_UNKNOWN if not found
     */
    fromPlatformCode: (platformCode: string | number, platform: 'ios' | 'android') => ErrorCode;
    /**
     * Maps an ErrorCode enum to platform-specific code
     * @param errorCode ErrorCode enum value
     * @param platform Target platform
     * @returns Platform-specific error code
     */
    toPlatformCode: (errorCode: ErrorCode, platform: 'ios' | 'android') => string | number;
    /**
     * Checks if an error code is valid for the specified platform
     * @param errorCode ErrorCode enum value
     * @param platform Target platform
     * @returns True if the error code is supported on the platform
     */
    isValidForPlatform: (errorCode: ErrorCode, platform: 'ios' | 'android') => boolean;
};
//# sourceMappingURL=purchaseError.d.ts.map