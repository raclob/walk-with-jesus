// React's act helper is available in test/development mode, including when
// the surrounding native-build workflow uses NODE_ENV=production.
process.env.NODE_ENV = 'test';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { create, act } = require('react-test-renderer');
global.IS_REACT_ACT_ENVIRONMENT = true;

const appRoot = path.resolve(__dirname, '..');
const cache = new Map();
const stored = new Map();
let purchaseMode = 'verified';
let listener;
let currentCustomer;
let configureCalls = 0;
const productId = 'walk_with_jesus_premium_lifetime';
const customer = (verification = 'VERIFIED', active = true) => ({ entitlements: { active: active ? {
  premium: { isActive: true, productIdentifier: productId, expirationDate: null, verification },
} : {} } });
currentCustomer = customer('VERIFIED', false);
const lifetime = { packageType: 'LIFETIME', product: { identifier: productId, productCategory: 'NON_SUBSCRIPTION', subscriptionPeriod: null, priceString: '£4.99' } };
const sdk = {
  ENTITLEMENT_VERIFICATION_MODE: { INFORMATIONAL: 'INFORMATIONAL' },
  configure: configuration => {
    configureCalls++;
    assert.equal(configuration.entitlementVerificationMode, 'INFORMATIONAL');
    assert.match(configuration.apiKey, /^goog_/);
  },
  addCustomerInfoUpdateListener: callback => { listener = callback; },
  removeCustomerInfoUpdateListener: callback => { if (listener === callback) listener = null; },
  getCustomerInfo: async () => currentCustomer,
  getOfferings: async () => ({ current: { availablePackages: [lifetime] } }),
  purchasePackage: async item => {
    assert.equal(item.product.identifier, productId);
    if (purchaseMode === 'cancel') throw { userCancelled: true };
    if (purchaseMode === 'failure') throw Error('store unavailable');
    return { customerInfo: customer('VERIFIED', purchaseMode !== 'pending') };
  },
  restorePurchases: async () => currentCustomer,
};
const mocks = {
  'react-native': { Platform: { OS: 'android' }, AppState: { addEventListener: () => ({ remove() {} }) } },
  'expo-constants': { __esModule: true, default: { executionEnvironment: 'standalone' }, ExecutionEnvironment: { StoreClient: 'storeClient' } },
  'react-native-purchases': { __esModule: true, default: sdk },
  '@react-native-async-storage/async-storage': { __esModule: true, default: {
    getItem: async key => stored.get(key) ?? null,
    setItem: async (key, value) => { stored.set(key, value); },
  } },
};
function load(file) {
  const absolute = path.resolve(appRoot, file);
  if (cache.has(absolute)) return cache.get(absolute).exports;
  const module = { exports: {} };
  cache.set(absolute, module);
  const source = ts.transpileModule(fs.readFileSync(absolute, 'utf8'), { compilerOptions: {
    target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
  } }).outputText;
  const resolve = name => {
    if (mocks[name]) return mocks[name];
    if (name.startsWith('@/') || name.startsWith('.')) {
      const base = name.startsWith('@/') ? path.join(appRoot, name.slice(2)) : path.resolve(path.dirname(absolute), name);
      const target = ['.ts', '.tsx'].map(ext => base + ext).find(fs.existsSync);
      if (!target) throw Error(`Missing module: ${name}`);
      return load(path.relative(appRoot, target));
    }
    return require(name);
  };
  vm.runInNewContext('(function(require,module,exports){' + source + '\n})', { process, console, setTimeout, clearTimeout }, { filename: absolute })(resolve, module, module.exports);
  return module.exports;
}

async function run() {
  const policy = load('services/billingPolicy.ts');
  assert.equal(policy.hasVerifiedPremium(customer()), true);
  assert.equal(policy.hasVerifiedPremium(customer('VERIFIED_ON_DEVICE')), true);
  for (const verification of ['FAILED', 'NOT_REQUESTED', 'mock']) assert.equal(policy.hasVerifiedPremium(customer(verification)), false);
  const wrongProduct = customer();
  wrongProduct.entitlements.active.premium.productIdentifier = 'some_subscription';
  assert.equal(policy.hasVerifiedPremium(wrongProduct), false);
  const subscription = customer();
  subscription.entitlements.active.premium.expirationDate = '2030-01-01';
  assert.equal(policy.hasVerifiedPremium(subscription), false);
  assert.equal(policy.findLifetimePackage([lifetime]), lifetime);
  assert.equal(policy.findLifetimePackage([{ ...lifetime, product: { ...lifetime.product, productCategory: 'SUBSCRIPTION' } }]), null);
  assert.equal(policy.findLifetimePackage([{ ...lifetime, packageType: 'MONTHLY' }]), null);

  const { PremiumProvider, usePremium } = load('contexts/PremiumContext.tsx');
  const { ThemeProvider, useTheme } = load('contexts/ThemeContext.tsx');
  let billing;
  let theme;
  function Probe() { billing = usePremium(); theme = useTheme(); return null; }
  const tree = () => React.createElement(PremiumProvider, null, React.createElement(ThemeProvider, null, React.createElement(Probe)));
  let root;
  const settle = async action => { await act(async () => { if (action) await action(); await new Promise(resolve => setImmediate(resolve)); }); };

  delete process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY;
  stored.set('@walkwithjesus/appearance.v1', 'forest');
  await settle(() => { root = create(tree()); });
  assert.equal(configureCalls, 0, 'Unconfigured free app must never initialize billing');
  assert.equal(billing.premium, false);
  assert.equal(theme.theme.id, 'midnight', 'Saved Premium preference is not an entitlement');
  await settle(() => billing.purchase());
  assert.equal(billing.premium, false);
  await settle(() => theme.selectTheme('daylight'));
  assert.equal(theme.theme.id, 'daylight', 'Free theme works without billing');
  await settle(() => root.unmount());

  process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY = 'test_mock_store';
  await settle(() => { root = create(tree()); });
  assert.equal(configureCalls, 0, 'A RevenueCat test-store key must not activate live billing');
  await settle(() => root.unmount());
  process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY = 'goog_unit_test_public_key';
  mocks['expo-constants'].default.executionEnvironment = 'storeClient';
  await settle(() => { root = create(tree()); });
  assert.equal(configureCalls, 0, 'Expo Go must not activate mock purchases');
  await settle(() => root.unmount());
  mocks['expo-constants'].default.executionEnvironment = 'standalone';

  process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY = 'goog_unit_test_public_key';
  stored.set('@walkwithjesus/appearance.v1', 'forest');
  await settle(() => { root = create(tree()); });
  assert.equal(configureCalls, 1);
  assert.equal(billing.price, '£4.99', 'Price must come from the store, including currency');
  for (const mode of ['cancel', 'failure', 'pending']) {
    purchaseMode = mode;
    await settle(() => billing.purchase());
    assert.equal(billing.premium, false, `${mode} must not unlock Premium`);
    assert.equal(billing.busy, false);
    if (mode === 'cancel') assert.equal(billing.message, null);
  }
  purchaseMode = 'verified';
  await settle(() => billing.purchase());
  assert.equal(billing.premium, true);
  assert.equal(theme.theme.id, 'forest');
  await settle(() => listener(customer('VERIFIED', false)));
  assert.equal(billing.premium, false, 'Revoked entitlement must remove Premium access');
  assert.equal(theme.theme.id, 'midnight');
  currentCustomer = customer('FAILED');
  await settle(() => billing.restore());
  assert.equal(billing.premium, false, 'Restore must reject an invalid signature');
  currentCustomer = customer('VERIFIED_ON_DEVICE');
  await settle(() => billing.restore());
  assert.equal(billing.premium, true, 'Verified cached purchase can be restored');
  assert.equal(theme.theme.id, 'forest');
  sdk.getOfferings = async () => { throw Error('offline'); };
  await settle(() => billing.refresh());
  assert.equal(billing.premium, true, 'Store catalog failure must not erase a verified entitlement');
  await settle(() => root.unmount());
  assert.equal(listener, null, 'Customer listener must be removed on unmount');
  delete process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY;

  const { localDayKey, recordReadingDay, readingInsights } = load('services/readingInsights.ts');
  const now = new Date(2026, 0, 2, 12);
  assert.equal(localDayKey(now), '2026-01-02');
  const original = { '2026-01-02': 1 };
  const days = recordReadingDay(original, '2026-01-02');
  assert.equal(original['2026-01-02'], 1, 'Recording must not mutate persisted state');
  assert.equal(days['2026-01-02'], 2);
  const data = readingInsights({ ...days, '2025-12-31': 3, '2025-11-01': 100, '2026-01-03': 99 }, { 'john:1': 4, 'genesis:1': 2, 'john:99': 200 }, now);
  assert.equal(data.week.length, 7);
  assert.equal(data.week[0].key, '2025-12-27');
  assert.equal(data.total, 5, 'Only the last 30 calendar days belong in the period');
  assert.equal(data.activeDays, 2);
  assert.equal(data.average, 2.5);
  assert.equal(data.nt, 4);
  assert.equal(data.ot, 2);
  assert.equal(data.books[0].name, 'John');
  const empty = readingInsights({}, {}, now);
  assert.equal(empty.total, 0, 'Old undated reads must not become invented daily history');
  assert.equal(empty.average, 0);

  const { ProgressProvider, useProgress } = load('contexts/ProgressContext.tsx');
  let progress;
  function ProgressProbe() { progress = useProgress(); return null; }
  stored.set('@bibleexplorer/state.v2', JSON.stringify({ heatMap: { 'john:1': 9 }, prestigeLevel: 2, hasOnboarded: true }));
  await settle(() => { root = create(React.createElement(ProgressProvider, null, React.createElement(ProgressProbe))); });
  assert.equal(progress.heatMap['john:1'], 9, 'Upgrade must preserve old chapter counts');
  assert.equal(progress.prestigeLevel, 2);
  assert.equal(Object.keys(progress.readingDays).length, 0, 'Upgrade must not invent reading dates');
  await settle(() => { progress.markChapterRead('john', 1); });
  const today = localDayKey(new Date());
  assert.equal(progress.heatMap['john:1'], 10);
  assert.equal(progress.readingDays[today], 1);
  assert.equal(progress.readingHistoryStartedOn, today);
  await settle(() => progress.prestige());
  assert.equal(progress.readingDays[today], 1, 'Prestige must retain reading history');
  await settle(() => progress.resetAll());
  assert.equal(Object.keys(progress.readingDays).length, 0, 'Reset must clear reading history');
  await settle(() => root.unmount());

  const { THEMES } = load('data/themes.ts');
  function luminance(hex) {
    const channels = hex.slice(1).match(/../g).map(channel => parseInt(channel, 16) / 255).map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  }
  function contrast(a, b) { const values = [luminance(a), luminance(b)].sort((x, y) => y - x); return (values[0] + 0.05) / (values[1] + 0.05); }
  for (const item of THEMES) {
    const p = item.palette;
    for (const [foreground, background] of [[p.foreground, p.background], [p.cardForeground, p.card], [p.mutedForeground, p.card], [p.primaryForeground, p.primary]]) {
      assert.ok(contrast(foreground, background) >= 4.5, `${item.name}: readable text contrast`);
    }
  }
  console.log('Premium checks passed: verified purchases/restore, cancellation/pending/failure, refund gating, free and paid themes, offline entitlement retention, progress migration/reset, local date statistics, and palette contrast.');
}
run().catch(error => { console.error(error); process.exitCode = 1; });
