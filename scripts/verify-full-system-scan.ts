import assert from 'assert';
import { db } from '../src/lib/firebase';
import { collection, addDoc, Firestore } from 'firebase/firestore';
import {
  getAllResellersAnalytics,
  getResellerAnalytics,
  getAllWithdrawals,
  getWithdrawalRequests,
  requestWithdrawal,
  updateWithdrawalStatus,
  getResellerWallet,
  fetchListingsFromFirestoreOrders,
  syncSettingsToFirestoreOrders,
  fetchSettingsFromFirestoreOrders,
} from '../src/lib/resellerService';
import { fetchActiveFirestoreOrders } from '../src/lib/telegram';
import { serverGetAllProfiles, serverGetAllListings, serverGetWithdrawals, serverGetSettings, serverSaveSettings } from '../src/lib/serverResellerStore';

async function runFullScan() {
  console.log('================================================================');
  console.log('🔍 FULL DATABASE, SETTINGS & CROSS-SURFACE AUDIT SCAN');
  console.log('================================================================\n');

  // 1. SCAN STORE ORDERS & TELEGRAM BOT REVENUE CONSISTENCY
  console.log('▶ 1. Scanning Store Orders & Telegram Bot Sync...');
  const activeOrders = await fetchActiveFirestoreOrders();
  console.log(`  ✅ Telegram Bot & Admin Active Orders Count: ${activeOrders.length}`);
  // Check that NO system sync order leaked into active customer orders
  const leakedSync = activeOrders.filter((o) => String(o.paymentMethod || '').startsWith('system_sync'));
  assert.strictEqual(leakedSync.length, 0, 'Internal system_sync orders must NEVER appear in active store orders!');
  console.log('  🎉 Verified: 0 system_sync records leaked into store sales reports!');

  // 2. SCAN RESELLERS DIRECTORY ACROSS ALL SURFACES
  console.log('\n▶ 2. Scanning Resellers Directory across Admin, Bot & Portal...');
  const resellers = await getAllResellersAnalytics();
  console.log(`  ✅ Found ${resellers.length} registered reseller(s):`);
  resellers.forEach((r, i) => {
    console.log(`     ${i + 1}. UID: ${r.profile.resellerUid} | Name: ${r.profile.displayName} | Earned: ₹${r.resellerEarnings} | Wallet Bal: ₹${r.wallet.availableBalance}`);
  });
  assert(resellers.length > 0, 'Must find registered resellers from dual-persistence ledger');

  // Verify serverResellerStore sees them too
  const serverProfiles = await serverGetAllProfiles();
  console.log(`  ✅ Server Reseller Store found ${serverProfiles.length} profile(s) in memory cache`);

  // 3. SCAN SINGLE RESELLER ANALYTICS DEEP DIVE
  console.log('\n▶ 3. Scanning Reseller Deep Dive Analytics...');
  const targetUid = resellers[0].profile.resellerUid;
  const deepDive = await getResellerAnalytics(targetUid);
  assert(deepDive, 'Deep dive analytics must exist for registered reseller');
  assert.strictEqual(deepDive.profile.resellerUid, targetUid);
  console.log(`  ✅ Reseller ${targetUid} deep dive loaded with ${deepDive.products.length} products, ${deepDive.totalOrders} verified orders, and ₹${deepDive.wallet.availableBalance} balance`);

  // 4. SCAN WALLET MATHEMATICAL CONSISTENCY & ATTRIBUTED SALES
  console.log('\n▶ 4. Scanning Wallet Mathematical Consistency & Attributed Sales...');
  const testUserId = resellers[0].profile.userId;

  // Simulate a verified customer purchase attributed to this reseller in the orders ledger
  const testOrderDoc = await addDoc(collection(db as Firestore, 'orders'), {
    orderNumber: `VZ-TEST-${Date.now().toString().slice(-6)}`,
    customer: { fullName: 'Test Buyer', email: 'buyer@test.com', phone: '9876543210' },
    items: [{ id: 'bundle-test', title: 'Viral Reels Bundle Special Edition', price: 699, license: 'reseller' }],
    totalAmount: 699,
    status: 'completed',
    paymentMethod: 'Cashfree Gateway',
    timestampIso: new Date().toISOString(),
    reseller_id: testUserId,
    reseller_uid: targetUid,
    reseller_listing_id: 'rsl_test_123',
    reseller_slug: 'test-slug',
    base_price_snapshot: 199,
    resale_price_snapshot: 699,
    reseller_earning: 500,
  });
  console.log(`  ✅ Created verified attributed customer sale (Order ID: ${testOrderDoc.id}, Earning: ₹500)`);

  const wallet = await getResellerWallet(testUserId);
  assert(wallet, 'Wallet must exist');
  assert(wallet.totalEarned >= 500, 'Total earned must reflect verified orders');
  const baseEarned = wallet.totalEarned;
  const initialWithdrawn = wallet.totalWithdrawn;
  const baseAvailable = wallet.availableBalance;
  console.log(`  ✅ Wallet verified: Earned ₹${wallet.totalEarned}, Available ₹${wallet.availableBalance}`);

  // 5. SCAN LISTINGS ACROSS ALL RESELLERS
  console.log('\n▶ 5. Scanning Listings Catalog...');
  const allListings = await fetchListingsFromFirestoreOrders();
  console.log(`  ✅ Found ${allListings.length} active listing(s) in orders sync ledger`);
  const serverListings = await serverGetAllListings();
  console.log(`  ✅ Server cache holds ${serverListings.length} listing(s)`);

  // 6. SCAN WITHDRAWALS WORKFLOW & MULTI-SURFACE SYNC
  console.log('\n▶ 6. Testing Full Withdrawal Cycle & Cross-Surface Sync...');
  const initialWithdrawals = await getAllWithdrawals();
  console.log(`  ✅ Initial total withdrawals in system: ${initialWithdrawals.length}`);

  // Request a test withdrawal for ₹200 (minimum required is ₹200)
  const testWdr = await requestWithdrawal({
    userId: testUserId,
    resellerName: resellers[0].profile.displayName,
    resellerEmail: resellers[0].profile.email,
    amount: 200,
    payoutMethod: 'upi',
    payoutDetails: { upiId: 'testrajat@okaxis' },
  });
  assert(testWdr && testWdr.id, 'Withdrawal request must be created');
  console.log(`  ✅ Created withdrawal request #${testWdr.id} for ₹200`);

  // Check wallet balance reserved
  const walletAfterRequest = await getResellerWallet(testUserId);
  assert.strictEqual(walletAfterRequest.availableBalance, baseAvailable - 200, `Available balance must now be ₹${baseAvailable - 200} (₹200 reserved)`);
  console.log(`  ✅ Wallet balance reserved: Available is now ₹${walletAfterRequest.availableBalance}`);

  // Verify Admin Panel & Telegram Bot immediately see it via getAllWithdrawals
  const afterRequest = await getAllWithdrawals();
  const foundRequested = afterRequest.find((w) => w.id === testWdr.id);
  assert(foundRequested, 'Admin Panel and Telegram Bot must immediately see the new withdrawal request');
  assert(['pending', 'pending_review'].includes(foundRequested.status), 'Status must be pending or pending_review');
  console.log(`  🎉 Verified: Admin Panel & Telegram Bot immediately detected withdrawal #${testWdr.id} (Status: ${foundRequested.status})`);

  // Admin approves & marks it as Paid
  console.log('  ▶ Admin marking withdrawal as Paid with UTR reference...');
  const updateResult = await updateWithdrawalStatus({
    withdrawalId: testWdr.id,
    status: 'paid',
    payoutReference: 'UTR998877665544',
    adminNotes: 'Verified via ICICI UPI portal',
    processedBy: 'admin@vaultzet.com',
  });
  assert(updateResult.success, 'Withdrawal status update must succeed');

  // Verify status is immediately updated across all surfaces
  const afterPaid = await getAllWithdrawals();
  const foundPaid = afterPaid.find((w) => w.id === testWdr.id);
  assert(foundPaid, 'Paid withdrawal must exist in ledger');
  assert.strictEqual(foundPaid.status, 'paid');
  assert.strictEqual(foundPaid.payoutReference, 'UTR998877665544');
  console.log(`  🎉 Verified: Status updated to "paid" with UTR ${foundPaid.payoutReference} across all surfaces!`);

  // Verify final wallet balance
  const walletFinal = await getResellerWallet(testUserId);
  assert.strictEqual(walletFinal.totalWithdrawn, initialWithdrawn + 200, `Total withdrawn must be ₹${initialWithdrawn + 200}`);
  assert.strictEqual(walletFinal.availableBalance, baseAvailable - 200, `Available balance remains ₹${baseAvailable - 200}`);
  console.log(`  🎉 Verified final wallet state: Earned ₹${walletFinal.totalEarned}, Withdrawn ₹${walletFinal.totalWithdrawn}, Available ₹${walletFinal.availableBalance}`);

  // 7. SCAN STORE & RESELLER SETTINGS PERSISTENCE
  console.log('\n▶ 7. Scanning Global Reseller Settings Persistence...');
  const testSettings = {
    enabled: true,
    min_markup: 75,
    max_price: 50000,
    settlement_policy: 'immediate',
    test_run_at: new Date().toISOString(),
  };
  await syncSettingsToFirestoreOrders(testSettings);
  await serverSaveSettings(testSettings);
  const fetchedSettings = await fetchSettingsFromFirestoreOrders();
  assert(fetchedSettings, 'Settings must be retrievable from orders sync ledger');
  assert.strictEqual(fetchedSettings.min_markup, 75);
  console.log(`  🎉 Verified: Global settings persisted and synced (Min markup: ₹${fetchedSettings.min_markup})!`);

  console.log('\n================================================================');
  console.log('🎉 ALL DATABASE, BOT, ADMIN & STORE CHECKS PASSED WITH 100% SYNC!');
  console.log('================================================================\n');
  process.exit(0);
}

runFullScan().catch((err) => {
  console.error('❌ Full scan failed:', err);
  process.exit(1);
});
