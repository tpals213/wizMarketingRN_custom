import type { ProductCommon } from '../types';
/**
 * For Amazon products, we add the currency code from the user's information
 * since it isn't included in the product information.
 */
export declare const fillProductsWithAdditionalData: <T extends ProductCommon>(items: T[]) => Promise<T[]>;
//# sourceMappingURL=fillProductsWithAdditionalData.d.ts.map