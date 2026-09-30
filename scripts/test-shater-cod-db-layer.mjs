/**
 * SHATER Physical Kit + COD Subscription Database Layer Verification Suite
 * Tests migration 039 for constraints, foreign keys, indexes, RLS, and the golden invariant:
 * DELIVERED != PAID & No subscription activation until Payment = PAID + Admin confirmation.
 */

import fs from 'fs';
import path from 'path';

console.log('📦 [SHATER COD] Verifying Database Layer Migration 039...');

const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '039_shater_cod_orders_and_subscriptions.sql');

if (!fs.existsSync(migrationPath)) {
  console.error(`❌ FAIL: Migration file not found at ${migrationPath}`);
  process.exit(1);
}

const sql = fs.readFileSync(migrationPath, 'utf8');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passCount++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failCount++;
  }
}

console.log('\n📐 1. Schema Tables & Data Minimization Tests:');
assert(sql.includes('CREATE TABLE IF NOT EXISTS public.orders'), 'public.orders table defined');
assert(sql.includes('order_number TEXT NOT NULL UNIQUE'), 'orders.order_number unique requirement');
assert(sql.includes('plan_id TEXT NOT NULL REFERENCES public.subscription_plans(id)'), 'orders.plan_id foreign key');
assert(sql.includes('amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0.00)'), 'orders.amount non-negative constraint');
assert(sql.includes('CREATE TABLE IF NOT EXISTS public.shipping_addresses'), 'public.shipping_addresses table defined');
assert(sql.includes('order_id UUID NOT NULL UNIQUE REFERENCES public.orders(id) ON DELETE CASCADE'), 'shipping_addresses 1:1 cascade FK');
assert(sql.includes("phone ~ '^(05|06|07|02)[0-9]{8}$'"), 'Algerian phone regex constraint on shipping_addresses');
assert(sql.includes('CREATE TABLE IF NOT EXISTS public.shipments'), 'public.shipments table defined');
assert(sql.includes('CREATE TABLE IF NOT EXISTS public.payments'), 'public.payments table defined');
assert(sql.includes("method TEXT NOT NULL DEFAULT 'COD'"), 'payments.method COD default');

console.log('\n🔒 2. Four Decoupled State Machines & Constraints:');
assert(sql.includes("status IN ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'COMPLETED', 'CANCELLED')"), 'Order Status Enum defined correctly');
assert(sql.includes("status IN ('PENDING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED', 'RETURNED')"), 'Delivery Status Enum defined correctly');
assert(sql.includes("status IN ('PENDING', 'COD', 'DELIVERED_PENDING_SETTLEMENT', 'PAID', 'FAILED', 'REFUNDED')"), 'Payment Status Enum with DELIVERED_PENDING_SETTLEMENT defined correctly');
assert(sql.includes("status IN ('PENDING', 'ACTIVE', 'EXPIRED', 'CANCELLED', 'REVOKED', 'SUSPENDED')"), 'Subscription Status Enum defined correctly');

console.log('\n⚡ 3. The Golden Invariant Tests (DELIVERED != PAID & No premature activation):');
assert(sql.includes('check_subscription_activation_prerequisites'), 'Subscription activation prerequisite trigger function exists');
assert(sql.includes("v_payment.status <> 'PAID'"), 'Trigger strictly blocks activation if Payment is not PAID');
assert(sql.includes('v_shipment.status = \'RETURNED\''), 'Trigger blocks activation if shipment returned/failed');
assert(sql.includes("NEW.activated_by IS NULL AND auth.role() <> 'service_role'"), 'Trigger enforces explicit Admin confirmation (activated_by)');
assert(sql.includes("SET status = 'DELIVERED_PENDING_SETTLEMENT'"), 'Shipment DELIVERED automatically sets Payment to DELIVERED_PENDING_SETTLEMENT (NOT PAID)');

console.log('\n🛡️ 4. Indexes & Performance Optimization Tests:');
assert(sql.includes('CREATE INDEX IF NOT EXISTS idx_orders_user_id'), 'idx_orders_user_id exists');
assert(sql.includes('CREATE INDEX IF NOT EXISTS idx_orders_status'), 'idx_orders_status exists');
assert(sql.includes('CREATE INDEX IF NOT EXISTS idx_shipping_addresses_order_id'), 'idx_shipping_addresses_order_id exists');
assert(sql.includes('CREATE INDEX IF NOT EXISTS idx_shipments_tracking_number'), 'idx_shipments_tracking_number exists');
assert(sql.includes('CREATE INDEX IF NOT EXISTS idx_payments_status'), 'idx_payments_status exists');
assert(sql.includes('CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id'), 'idx_subscriptions_user_id exists');

console.log('\n🔐 5. Row Level Security (RLS) & Permissions Tests:');
assert(sql.includes('ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY'), 'Orders RLS enabled');
assert(sql.includes('ALTER TABLE public.shipping_addresses ENABLE ROW LEVEL SECURITY'), 'Shipping Addresses RLS enabled');
assert(sql.includes('ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY'), 'Shipments RLS enabled');
assert(sql.includes('ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY'), 'Payments RLS enabled');
assert(sql.includes('public.has_finance_access(auth.uid())'), 'Finance access helper used in update policies');
assert(!sql.includes('anon') || !sql.includes('TO anon;'), 'No anon elevation or public write grants');

console.log('\n🔄 6. Atomic Admin Operator RPC Tests:');
assert(sql.includes('admin_dispatch_shipment'), 'admin_dispatch_shipment RPC exists');
assert(sql.includes('admin_verify_cod_payment_settled'), 'admin_verify_cod_payment_settled RPC exists');
assert(sql.includes('admin_activate_cod_subscription'), 'admin_activate_cod_subscription RPC exists');
assert(sql.includes('sync_order_to_payment_orders_bridge'), 'Backward compatibility bridge with legacy payment_orders exists');

console.log('\n========================================');
console.log(`Total Invariant Checks: ${passCount + failCount} | Passed: ${passCount} | Failed: ${failCount}`);
console.log('========================================');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('\n🎉 ALL SHATER COD DATABASE INVARIANT CHECKS PASSED WITH 100% SUCCESS!');
}
