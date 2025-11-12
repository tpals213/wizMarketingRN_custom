interface OverwrittenRequestInit extends Omit<RequestInit, 'body'> {
    body: Record<string, any>;
}
export declare const enhancedFetch: <T = any>(url: string, init?: OverwrittenRequestInit) => Promise<T>;
export {};
//# sourceMappingURL=enhancedFetch.d.ts.map