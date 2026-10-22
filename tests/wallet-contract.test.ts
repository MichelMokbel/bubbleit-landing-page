import assert from 'node:assert/strict';
import test from 'node:test';
import { validateWalletSummary, validateWalletMovement, validateWalletReservation, validateCustomerRefund, validateWalletPage } from '../lib/api/wallet-types.ts';
import type { WalletSummary } from '../lib/api/wallet-types.ts';

const summary: WalletSummary = { currency: 'QAR', balance_minor: 15000, reserved_minor: 2500, available_minor: 12500, as_of: '2026-10-22T10:00:00Z', capabilities: { can_spend: false } };
test('wallet preserves exact backend amounts and rejects unavailable or inconsistent facts', () => {
  assert.equal(validateWalletSummary(summary).available_minor, 12500);
  for (const patch of [{ available_minor: -1 }, { available_minor: null }, { available_minor: 12.5 }, { available_minor: 100 }, { balance_minor: Number.MAX_SAFE_INTEGER + 1 }, { currency: 'USD' }, { as_of: 'bad' }, { capabilities: {} }]) {
    assert.throws(() => validateWalletSummary({ ...summary, ...patch } as WalletSummary));
  }
});
test('financial activity rejects malformed source facts and page metadata', () => {
  const movement = { id: 1, type: 'refund_credit' as const, direction: 'credit' as const, amount_minor: 10000, currency: 'QAR' as const, occurred_at: summary.as_of };
  assert.equal(validateWalletMovement(movement).amount_minor, 10000);
  assert.throws(() => validateWalletMovement({ ...movement, amount_minor: 0 }));
  assert.throws(() => validateWalletMovement({ ...movement, occurred_at: '' }));
  assert.throws(() => validateWalletReservation({ id: 1, amount_minor: -1, currency: 'QAR', expires_at: summary.as_of }));
  assert.throws(() => validateWalletPage({ data: [movement], meta: { current_page: 0, last_page: 1, total: 1, per_page: 20 } }, validateWalletMovement));
});
test('customer refund totals cannot invent settled money', () => {
  assert.throws(() => validateCustomerRefund({ id: 1, reference: 'REF-000001', status: 'approved', currency: 'QAR', amount_minor: 10000, settled_amount_minor: 10001, pending_amount_minor: 0, reason: '', booking_id: null, subject_type: 'booking', subject_reference: null, settlement_destination: 'customer_wallet', can_choose_destination: false, wallet_credit_available: false, wallet_consent_at: summary.as_of, created_at: summary.as_of, processed_at: null }));
});
