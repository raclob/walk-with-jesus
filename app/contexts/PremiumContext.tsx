import Constants, { ExecutionEnvironment } from "expo-constants";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AppState, Platform } from "react-native";
import type Purchases from "react-native-purchases";
import type { CustomerInfo, PurchasesPackage } from "react-native-purchases";
import { findLifetimePackage, hasVerifiedPremium, purchaseWasCancelled } from "@/services/billingPolicy";

type SDK = typeof Purchases;
interface PremiumValue {
  premium: boolean;
  configured: boolean;
  loading: boolean;
  busy: boolean;
  price: string | null;
  message: string | null;
  refresh: () => Promise<void>;
  purchase: () => Promise<void>;
  restore: () => Promise<void>;
}

const noAction = async () => {};
const defaultValue: PremiumValue = { premium: false, configured: false, loading: false, busy: false,
  price: null, message: null, refresh: noAction, purchase: noAction, restore: noAction };
const PremiumContext = createContext<PremiumValue>(defaultValue);

export function PremiumProvider({ children }: { children: React.ReactNode }) {
  // Public Android SDK key only. No secret key, mock store, or Expo Go billing.
  const key = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY?.trim() ?? "";
  const configured = Platform.OS === "android" && key.startsWith("goog_")
    && Constants.executionEnvironment !== ExecutionEnvironment.StoreClient;
  const sdk = useRef<SDK | null>(null);
  const offer = useRef<PurchasesPackage | null>(null);
  const locked = useRef(false);
  const [premium, setPremium] = useState(false);
  const [loading, setLoading] = useState(configured);
  const [busy, setBusy] = useState(false);
  const [price, setPrice] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const applyCustomer = useCallback((customer: CustomerInfo) => {
    setPremium(hasVerifiedPremium(customer));
  }, []);

  const refresh = useCallback(async () => {
    if (!sdk.current || locked.current) return;
    locked.current = true;
    setLoading(true);
    setMessage(null);
    try {
      // Preserve a verified cached entitlement if a later network request fails.
      applyCustomer(await sdk.current.getCustomerInfo());
      const offerings = await sdk.current.getOfferings();
      offer.current = findLifetimePackage(offerings.current?.availablePackages ?? []);
      setPrice(offer.current?.product.priceString ?? null);
      if (!offer.current) setMessage("Premium is not available in the store yet. Please try again later.");
    } catch {
      offer.current = null;
      setPrice(null);
      setMessage("The store could not be reached. Check your connection and try again.");
    } finally {
      locked.current = false;
      setLoading(false);
    }
  }, [applyCustomer]);

  useEffect(() => {
    if (!configured) return;
    let active = true;
    let listener: ((customer: CustomerInfo) => void) | null = null;
    (async () => {
      try {
        const native = (await import("react-native-purchases")).default;
        if (!active) return;
        native.configure({ apiKey: key, entitlementVerificationMode: native.ENTITLEMENT_VERIFICATION_MODE.INFORMATIONAL });
        sdk.current = native;
        listener = customer => { if (active) applyCustomer(customer); };
        native.addCustomerInfoUpdateListener(listener);
        await refresh();
      } catch {
        if (active) {
          setLoading(false);
          setMessage("Purchases are unavailable right now. All free features are still ready to use.");
        }
      }
    })();
    const subscription = AppState.addEventListener("change", state => {
      if (state === "active") void refresh();
    });
    return () => {
      active = false;
      subscription.remove();
      if (listener) sdk.current?.removeCustomerInfoUpdateListener(listener);
    };
  }, [configured, key, applyCustomer, refresh]);

  const transact = useCallback(async (restore: boolean) => {
    const native = sdk.current;
    if (!native || locked.current || (!restore && !offer.current)) return;
    locked.current = true;
    setBusy(true);
    setMessage(null);
    try {
      const customer = restore ? await native.restorePurchases()
        : (await native.purchasePackage(offer.current!)).customerInfo;
      applyCustomer(customer);
      setMessage(hasVerifiedPremium(customer) ? "Premium is unlocked. Thank you for supporting Walk with Jesus."
        : restore ? "No Premium purchase was found for this store account."
          : "Premium has not been confirmed yet. If your payment is pending, wait for store confirmation and try Restore purchases.");
    } catch (error) {
      if (!purchaseWasCancelled(error)) setMessage(restore
        ? "Purchases could not be restored. Check your store account and connection, then try again."
        : "The purchase could not be completed. Please try again. You can restore a completed purchase without paying again.");
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }, [applyCustomer]);

  const purchase = useCallback(() => transact(false), [transact]);
  const restore = useCallback(() => transact(true), [transact]);
  return <PremiumContext.Provider value={{ premium, configured, loading, busy, price, message, refresh, purchase, restore }}>
    {children}
  </PremiumContext.Provider>;
}

export function usePremium() { return useContext(PremiumContext); }
