import type { Paginated } from "./types";

export type WalletSummary = {
  currency: "QAR";
  balance_minor: number;
  reserved_minor: number;
  available_minor: number;
  as_of: string;
  capabilities: { can_spend: boolean };
};
export type WalletMovement = {
  id: number;
  type: "refund_credit" | "purchase_payment" | "correction_reversal";
  direction: "credit" | "debit";
  amount_minor: number;
  currency: "QAR";
  occurred_at: string;
};
export type WalletReservation = { id: number; amount_minor: number; currency: "QAR"; expires_at: string };
export type CustomerRefund = {
  id: number; reference: string; status: string; currency: "QAR"; amount_minor: number;
  settled_amount_minor: number; pending_amount_minor: number; reason: string;
  booking_id: number | null; subject_type: string | null; subject_reference: string | null;
  settlement_destination: "original_payment" | "customer_wallet";
  can_choose_destination: boolean; wallet_credit_available: boolean;
  wallet_consent_at: string | null; created_at: string; processed_at: string | null;
};
export type WalletPage<T> = Paginated<T>;

export function validateWalletSummary(value: WalletSummary): WalletSummary {
  if (!value || typeof value.capabilities?.can_spend !== "boolean" || value.currency !== "QAR" || ![value.balance_minor, value.reserved_minor, value.available_minor].every((amount) => Number.isSafeInteger(amount) && amount >= 0)
      || value.balance_minor !== value.reserved_minor + value.available_minor || !Number.isFinite(Date.parse(value.as_of))) {
    throw new Error("Invalid wallet summary");
  }
  return value;
}

const minor = (value: unknown): value is number => Number.isSafeInteger(value) && (value as number) >= 0;
const instant = (value: unknown): value is string => typeof value === "string" && Number.isFinite(Date.parse(value));
export function validateWalletMovement(value: WalletMovement): WalletMovement {
  if (!value || value.currency !== "QAR" || !minor(value.amount_minor) || value.amount_minor === 0
      || !["refund_credit", "purchase_payment", "correction_reversal"].includes(value.type)
      || !["credit", "debit"].includes(value.direction) || !instant(value.occurred_at)) throw new Error("Invalid wallet movement");
  return value;
}
export function validateWalletReservation(value: WalletReservation): WalletReservation {
  if (!value || value.currency !== "QAR" || !minor(value.amount_minor) || value.amount_minor === 0 || !instant(value.expires_at)) throw new Error("Invalid wallet reservation");
  return value;
}
export function validateCustomerRefund(value: CustomerRefund): CustomerRefund {
  if (!value || value.currency !== "QAR" || ![value.amount_minor, value.settled_amount_minor, value.pending_amount_minor].every(minor)
      || value.settled_amount_minor + value.pending_amount_minor > value.amount_minor
      || !["original_payment", "customer_wallet"].includes(value.settlement_destination)
      || typeof value.can_choose_destination !== "boolean" || typeof value.wallet_credit_available !== "boolean") throw new Error("Invalid customer refund");
  return value;
}
export function validateWalletPage<T>(value: WalletPage<T>, validate: (item: T) => T): WalletPage<T> {
  if (!value || !Array.isArray(value.data) || !value.meta || ![value.meta.current_page, value.meta.last_page, value.meta.total, value.meta.per_page].every(minor)
      || value.meta.current_page < 1 || value.meta.last_page < 1 || value.meta.per_page < 1) throw new Error("Invalid wallet page");
  value.data.forEach(validate);
  return value;
}
