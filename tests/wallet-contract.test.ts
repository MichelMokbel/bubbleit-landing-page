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

test('source settlements require exact totals and never infer pending money as returned', () => {
  const value = { id: 1, reference: 'REF-000001', status: 'processing', currency: 'QAR' as const, amount_minor: 10000, settled_amount_minor: 3000, pending_amount_minor: 7000, reason: '', booking_id: null, subject_type: 'booking', subject_reference: null, settlement_destination: 'original_payment' as const, can_choose_destination: false, wallet_credit_available: false, wallet_consent_at: null, created_at: summary.as_of, processed_at: null, settlements: [
    { sequence: 1, source: 'customer_wallet' as const, destination: 'customer_wallet' as const, currency: 'QAR' as const, amount_minor: 3000, status: 'succeeded' as const },
    { sequence: 2, source: 'original_payment' as const, destination: 'original_payment' as const, currency: 'QAR' as const, amount_minor: 7000, status: 'processing' as const },
  ] };
  assert.equal(validateCustomerRefund(value).settled_amount_minor, 3000);
  assert.throws(() => validateCustomerRefund({ ...value, settled_amount_minor: 10000, pending_amount_minor: 0 }));
  assert.throws(() => validateCustomerRefund({ ...value, settlements: [{ ...value.settlements[0], amount_minor: 3000.1 }, value.settlements[1]] }));
  assert.throws(() => validateCustomerRefund({ ...value, settlements: [value.settlements[0], { ...value.settlements[1], sequence: 1 }] }));
});

test('staff-recorded external return remains visible during local projection recovery', () => {
  const refund = { id: 1, reference: 'REF-000001', status: 'processing', currency: 'QAR' as const, amount_minor: 10000, settled_amount_minor: 0, pending_amount_minor: 10000, reason: '', booking_id: null, subject_type: 'booking', subject_reference: null, settlement_destination: 'original_payment' as const, can_choose_destination: false, wallet_credit_available: false, wallet_consent_at: null, created_at: summary.as_of, processed_at: null, recorded_return: {amount_minor:7000,currency:'QAR' as const,method:'bank_transfer' as const,confirmed_at:summary.as_of} };
  assert.equal(validateCustomerRefund(refund).recorded_return?.amount_minor,7000);
  assert.throws(()=>validateCustomerRefund({...refund,recorded_return:{...refund.recorded_return,amount_minor:10001}}));
  assert.throws(()=>validateCustomerRefund({...refund,recorded_return:{...refund.recorded_return,confirmed_at:'invalid'}}));
});
