export const PREMIUM_ENTITLEMENT = "premium";
export const PREMIUM_PRODUCT = "walk_with_jesus_premium_lifetime";

interface Entitlement {
  isActive: boolean;
  productIdentifier: string;
  expirationDate: string | null;
  verification: string;
}
interface Customer {
  entitlements: { active: Record<string, Entitlement> };
}
interface LifetimePackage {
  packageType: string;
  product: { identifier: string; productCategory: string | null; subscriptionPeriod: string | null };
}

// RevenueCat validates the Play receipt. Trusted-entitlement signatures also
// have to pass; a local preference or a mock purchase never grants Premium.
export function hasVerifiedPremium(customer: Customer): boolean {
  const item = customer.entitlements.active[PREMIUM_ENTITLEMENT];
  return !!item && item.isActive && item.productIdentifier === PREMIUM_PRODUCT
    && item.expirationDate === null
    && ["VERIFIED", "VERIFIED_ON_DEVICE"].includes(item.verification);
}

export function findLifetimePackage<T extends LifetimePackage>(packages: readonly T[]): T | null {
  return packages.find(item => item.packageType === "LIFETIME"
    && item.product.identifier === PREMIUM_PRODUCT
    && item.product.productCategory === "NON_SUBSCRIPTION"
    && item.product.subscriptionPeriod === null) ?? null;
}

export function purchaseWasCancelled(error: unknown): boolean {
  return !!error && typeof error === "object" && "userCancelled" in error && error.userCancelled === true;
}
