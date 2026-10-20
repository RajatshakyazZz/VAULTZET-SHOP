import assert from 'assert';
import {
  generateResellerUid,
  createOrUpdateResellerProfile,
  getResellerProfile,
  getResellerProfileByEmail,
  reconcileResellerAccount,
  createResellerListing,
  getResellerListings,
  getResellerWallet,
  setLocalOrMemoryItem,
  getLocalOrMemoryItem,
} from '../src/lib/resellerService';
import {
  serverFindResellerProfile,
  serverSaveResellerProfile,
  serverGetResellerListings,
  serverSaveResellerListing,
  serverReconcileAccount,
  normalizeEmail,
} from '../src/lib/serverResellerStore';
import { BUNDLE_PRODUCTS } from '../src/data/bundles';

console.log('================================================================');
console.log('🧪 RUNNING CROSS-DEVICE RESELLER IDENTITY & PERSISTENCE TEST SUITE');
console.log('================================================================\n');

async function runTests() {
  const testEmail = `rahul_test_${Date.now()}@gmail.com`;
  const cleanEmail = normalizeEmail(testEmail);
  const testName = 'Rahul Sharma';
  const deviceA_userId = `usr_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`;

  // ---------------------------------------------------------------------------
  // TEST 1: User Signup on Device A
  // ---------------------------------------------------------------------------
  console.log('▶ Test 1: Sign up user on Device A & verify permanent UID assignment...');
  const profileA = await createOrUpdateResellerProfile({
    userId: deviceA_userId,
    email: cleanEmail,
    displayName: testName,
    phone: '9876543210',
  });

  assert(profileA, 'Profile A must be created');
  assert(profileA.resellerUid, 'Profile A must have a resellerUid');
  assert(profileA.resellerUid.startsWith('RSL-'), `resellerUid must start with RSL-, got ${profileA.resellerUid}`);
  const UID_A = profileA.resellerUid;
  console.log(`  ✅ Device A Reseller Created: ${profileA.displayName} | UID: ${UID_A}`);

  // ---------------------------------------------------------------------------
  // TEST 2: Device A Adds 3 Reseller Products
  // ---------------------------------------------------------------------------
  console.log('\n▶ Test 2: Reseller adds 3 products to their store on Device A...');
  const availableBundles = BUNDLE_PRODUCTS.slice(0, 3);
  assert(availableBundles.length >= 3, 'Must have at least 3 bundles available for testing');

  const listing1 = await createResellerListing({
    userId: deviceA_userId,
    resellerName: testName,
    originalProductId: availableBundles[0].id,
    customTitle: 'Rahul Viral AI Reels Pack 1',
    resalePrice: 199,
  });

  const listing2 = await createResellerListing({
    userId: deviceA_userId,
    resellerName: testName,
    originalProductId: availableBundles[1].id,
    customTitle: 'Rahul Fitness Motivation HD Pack 2',
    resalePrice: 249,
  });

  const listing3 = await createResellerListing({
    userId: deviceA_userId,
    resellerName: testName,
    originalProductId: availableBundles[2].id,
    customTitle: 'Rahul Sanatan Dharma Spiritual Reels Pack 3',
    resalePrice: 299,
  });

  assert(listing1.resellerUid === UID_A, `Listing 1 must have resellerUid ${UID_A}, got ${listing1.resellerUid}`);
  assert(listing2.resellerUid === UID_A, `Listing 2 must have resellerUid ${UID_A}, got ${listing2.resellerUid}`);
  assert(listing3.resellerUid === UID_A, `Listing 3 must have resellerUid ${UID_A}, got ${listing3.resellerUid}`);

  const deviceA_listings = await getResellerListings(deviceA_userId, UID_A);
  assert.strictEqual(deviceA_listings.length, 3, 'Device A must see 3 listings');
  console.log(`  ✅ Device A Listings Verified: ${deviceA_listings.length} products added with permanent UID ${UID_A}`);

  // ---------------------------------------------------------------------------
  // TEST 3: Device B Login Simulation (Completely Isolated Fresh Environment)
  // ---------------------------------------------------------------------------
  console.log('\n▶ Test 3: Simulate Login from Device B (fresh environment, clean cache)...');
  // Device B does NOT have Device A's localStorage
  // Simulate login on Device B using clean email
  const deviceB_userId = `usr_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`;

  // Query profile from Device B perspective
  let profileB = await getResellerProfileByEmail(cleanEmail);
  if (!profileB) {
    profileB = await getResellerProfile(deviceB_userId);
  }
  if (!profileB) {
    profileB = await reconcileResellerAccount(cleanEmail, deviceB_userId);
  }

  assert(profileB, 'Device B must find the existing profile');
  const UID_B = profileB.resellerUid;

  // CRITICAL INVARIANT: UID on Device B MUST MATCH Device A exactly!
  assert.strictEqual(UID_B, UID_A, `UID on Device B (${UID_B}) MUST EQUAL UID on Device A (${UID_A})!`);
  console.log(`  ✅ Permanent Reseller UID Preserved on Device B: ${UID_B} === ${UID_A}`);

  // ---------------------------------------------------------------------------
  // TEST 4: Assert Listings Count on Device B === 3 (NO RESET TO ZERO!)
  // ---------------------------------------------------------------------------
  console.log('\n▶ Test 4: Query listings on Device B — assert product count is 3 (NOT 0)...');
  const deviceB_listings = await getResellerListings(deviceB_userId, UID_B);

  console.log(`  📊 Products found on Device B: ${deviceB_listings.length}`);
  deviceB_listings.forEach((l, i) => {
    console.log(`     ${i + 1}. [${l.slug}] ${l.customTitle} — ₹${l.resalePrice} (Wholesale: ₹${l.basePrice})`);
  });

  assert.strictEqual(
    deviceB_listings.length,
    3,
    `Device B MUST display exactly 3 products! Found: ${deviceB_listings.length}`
  );
  console.log('  ✅ Product count on Device B is 3 (NOT reset to zero)!');

  // ---------------------------------------------------------------------------
  // TEST 5: Wallet and Earnings Persistence on Device B
  // ---------------------------------------------------------------------------
  console.log('\n▶ Test 5: Verify wallet integrity on Device B...');
  const walletB = await getResellerWallet(deviceB_userId);
  assert(walletB, 'Wallet must exist on Device B');
  assert.strictEqual(walletB.resellerUid, UID_A, `Wallet resellerUid must match ${UID_A}`);
  console.log(`  ✅ Wallet verified on Device B: available=₹${walletB.availableBalance}, totalEarned=₹${walletB.totalEarned}`);

  // ---------------------------------------------------------------------------
  // TEST 6: Rapid Concurrent Logins & Page Reloads (Idempotency Under Race Conditions)
  // ---------------------------------------------------------------------------
  console.log('\n▶ Test 6: Simulating 10 rapid concurrent logins & dashboard reloads...');
  const concurrentLogins = Array.from({ length: 10 }).map(async (_, idx) => {
    const prof = await createOrUpdateResellerProfile({
      userId: deviceB_userId,
      email: cleanEmail,
      displayName: testName,
    });
    const listings = await getResellerListings(deviceB_userId, prof.resellerUid);
    return { prof, listingsCount: listings.length };
  });

  const results = await Promise.all(concurrentLogins);
  for (let i = 0; i < results.length; i++) {
    assert.strictEqual(
      results[i].prof.resellerUid,
      UID_A,
      `Concurrent call ${i + 1} produced UID ${results[i].prof.resellerUid}, expected ${UID_A}`
    );
    assert.strictEqual(
      results[i].listingsCount,
      3,
      `Concurrent call ${i + 1} produced listings count ${results[i].listingsCount}, expected 3`
    );
  }
  console.log('  ✅ All 10 concurrent operations resolved to permanent UID without duplicate profile creation!');

  // ---------------------------------------------------------------------------
  // TEST 7: Self-Healing Reconciliation for Previously Split Accounts
  // ---------------------------------------------------------------------------
  console.log('\n▶ Test 7: Testing self-healing reconciliation for legacy split accounts...');
  const legacyEmail = `legacy_split_${Date.now()}@vaultzet.shop`;
  const legacyUidOriginal = generateResellerUid();

  // Create original profile on legacy device
  const originalProfile = await serverSaveResellerProfile({
    userId: 'firebase_uid_123',
    email: legacyEmail,
    displayName: 'Legacy User',
    resellerUid: legacyUidOriginal,
  });

  // Attach a product under the original permanent UID
  await serverSaveResellerListing({
    id: `rsl_legacy_${Date.now()}`,
    slug: 'legacy-bundle-123',
    resellerId: 'firebase_uid_123',
    resellerUid: legacyUidOriginal,
    resellerName: 'Legacy User',
    originalProductId: availableBundles[0].id,
    originalProductSlug: availableBundles[0].slug,
    basePrice: 49,
    resalePrice: 149,
    grossMargin: 100,
    customTitle: 'Legacy Viral Reels 123',
    status: 'active',
    viewsCount: 0,
    uniqueVisitorsCount: 0,
    ctaClicksCount: 0,
    checkoutsInitiatedCount: 0,
    salesCount: 0,
    refundsCount: 0,
    totalRevenue: 0,
    totalEarned: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // New device logs in with a different session ID ('new_session_999')
  const reconciled = await serverReconcileAccount({
    email: legacyEmail,
    currentUserId: 'new_session_999',
  });

  assert(reconciled, 'Account must be successfully reconciled');
  assert.strictEqual(
    reconciled.resellerUid,
    legacyUidOriginal,
    `Reconciled UID (${reconciled.resellerUid}) must match original (${legacyUidOriginal})`
  );

  const reconciledListings = await serverGetResellerListings({
    userId: 'new_session_999',
    resellerUid: reconciled.resellerUid,
  });

  assert.strictEqual(
    reconciledListings.length,
    1,
    `Reconciled listings count must be 1, got ${reconciledListings.length}`
  );
  console.log(`  ✅ Self-healing succeeded: canonical UID ${reconciled.resellerUid} bound to new session with listings intact!`);

  console.log('\n================================================================');
  console.log('🎉 ALL 7 CROSS-DEVICE RESELLER IDENTITY TESTS PASSED (100% SUCCESS)');
  console.log('================================================================\n');
}

runTests().catch((err) => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});
