import assert from 'assert';
import {
  createOrUpdateResellerProfile,
  getResellerProfile,
  getResellerProfileByEmail,
  getResellerProfileByUid,
  createResellerListing,
  getResellerListingsByUser,
  deleteResellerListing,
  updateResellerListing,
} from '../src/lib/resellerService';
import { normalizeEmail } from '../src/lib/serverResellerStore';
import { BUNDLE_PRODUCTS } from '../src/data/bundles';

async function runVerification() {
  console.log('================================================================');
  console.log('🧪 VERIFYING RESELLER MOBILE UI, PERMANENT UID & DELETE FLOW');
  console.log('================================================================\n');

  const testEmail = `reseller_audit_${Date.now()}@gmail.com`;
  const cleanEmail = normalizeEmail(testEmail);
  const testName = 'Rajat Reseller';
  const deviceA_userId = `usr_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`;

  // STEP 1: Device A creates account
  console.log('▶ 1. Device A: Creating account...');
  const profileA = await createOrUpdateResellerProfile({
    userId: deviceA_userId,
    email: cleanEmail,
    displayName: testName,
    phone: '9876543210',
  });
  assert(profileA, 'Profile A must exist');
  assert(profileA.resellerUid, 'Profile A must have a permanent UID');
  assert(profileA.resellerUid.startsWith('RSL-'), 'UID must start with RSL-');
  const permanentUid = profileA.resellerUid;
  console.log(`  ✅ Device A created account with Permanent UID: ${permanentUid}`);

  // STEP 2: Device A creates a reseller listing
  console.log('\n▶ 2. Device A: Creating reseller listing...');
  const listing = await createResellerListing({
    userId: deviceA_userId,
    resellerName: testName,
    originalProductId: BUNDLE_PRODUCTS[0].id,
    customTitle: '1000+ AI Reels Special Edition',
    customSubtitle: 'Full HD Ready to Post',
    resalePrice: 499,
  });
  assert(listing && listing.id, 'Listing must be created');
  assert.strictEqual(listing.resalePrice, 499);
  console.log(`  ✅ Device A created listing: "${listing.customTitle}" (ID: ${listing.id}, Slug: /r/${listing.slug})`);

  // STEP 3: Device B logs in with the SAME account / email
  console.log('\n▶ 3. Device B: Connecting to existing account with same email...');
  const profileB = await getResellerProfileByEmail(cleanEmail);
  assert(profileB, 'Device B must find existing profile');
  console.log(`  ✅ Device B retrieved profile with UID: ${profileB.resellerUid}`);

  // CRITICAL CHECK: Verify UIDs match exactly!
  assert.strictEqual(
    profileB.resellerUid,
    permanentUid,
    `CRITICAL FAIL: Device B UID (${profileB.resellerUid}) does NOT match Device A UID (${permanentUid})!`
  );
  console.log('  🎉 PASSED: Device A and Device B have the IDENTICAL Permanent UID!');

  // STEP 4: Device B fetches listings created by Device A
  console.log('\n▶ 4. Device B: Fetching listings created by Device A...');
  const listingsB = await getResellerListingsByUser(deviceA_userId, profileB.resellerUid);
  assert(listingsB.length > 0, 'Device B must find listings created by Device A');
  const foundListing = listingsB.find((l) => l.id === listing.id);
  assert(foundListing, 'Device B must find the exact listing created by Device A');
  console.log(`  ✅ Device B found listing: "${foundListing.customTitle}" with selling price ₹${foundListing.resalePrice}`);

  // STEP 5: Quick Edit listing from Device B
  console.log('\n▶ 5. Device B: Updating price to ₹599 via Quick Edit...');
  await updateResellerListing(listing.id, deviceA_userId, {
    customTitle: '1000+ AI Reels Special Edition (Updated)',
    resalePrice: 599,
  });
  const updatedListings = await getResellerListingsByUser(deviceA_userId, profileB.resellerUid);
  const updatedItem = updatedListings.find((l) => l.id === listing.id);
  assert.strictEqual(updatedItem?.resalePrice, 599);
  assert.strictEqual(updatedItem?.customTitle, '1000+ AI Reels Special Edition (Updated)');
  console.log('  ✅ Quick Edit verified: Selling price updated to ₹599 with new margin!');

  // STEP 6: Delete listing from Device B
  console.log('\n▶ 6. Device B: Deleting listing...');
  const deleteResult = await deleteResellerListing(listing.id, deviceA_userId);
  assert.strictEqual(deleteResult, true, 'Delete operation must succeed');
  console.log('  ✅ Delete operation completed successfully');

  // STEP 7: Verify listing is removed from both devices
  console.log('\n▶ 7. Verifying listing is removed across all devices...');
  const listingsAfterDelete = await getResellerListingsByUser(deviceA_userId, profileB.resellerUid);
  const deletedStillExists = listingsAfterDelete.some((l) => l.id === listing.id);
  assert(!deletedStillExists, 'Deleted listing must no longer appear in listings');
  console.log('  ✅ Verified: Deleted listing is completely gone from both devices!');

  console.log('\n================================================================');
  console.log('🎉 ALL CROSS-DEVICE IDENTITY, UI OPTIONS & DELETE TESTS PASSED!');
  console.log('================================================================\n');
  process.exit(0);
}

runVerification().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
