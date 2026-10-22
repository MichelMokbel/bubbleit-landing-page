"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AppToast } from "@/components/AppToast";
import { chooseRefundDestination, getCustomerWallet, listCustomerRefunds, listWalletMovements, listWalletReservations } from "@/lib/api/client";
import type { CustomerRefund, WalletMovement, WalletPage, WalletReservation, WalletSummary } from "@/lib/api/wallet-types";
import { useI18n } from "@/lib/i18n";
import { formatQar } from "@/lib/money";
import { formatQatarDateTime } from "@/lib/datetime";

const REFUND_LABELS: Record<string, string> = {
  submitted: "Refund submitted", under_review: "Refund under review", approved: "Refund approved",
  processing: "Refund processing", retryable: "Refund needs another attempt", quarantined: "Refund requires review",
  rejected: "Refund declined", processed: "Refund completed",
};

const MOVEMENT_LABELS = { refund_credit: "Refund credit", purchase_payment: "Wallet payment", correction_reversal: "Balance correction" };
const DIRECTION_LABELS = { credit: "Credit", debit: "Debit" };
const DESTINATION_LABELS = { customer_wallet: "Customer wallet", original_payment: "Original payment method" };
function refundStatusLabel(refund: CustomerRefund) {
  return refund.status === "processed" && refund.settlement_destination === "customer_wallet" ? "Credited to wallet" : REFUND_LABELS[refund.status] ?? "Refund status unavailable";
}

export function CustomerWallet() {
  const { lang, t } = useI18n();
  const [summary, setSummary] = useState<WalletSummary | null>(null);
  const [activity, setActivity] = useState<WalletPage<WalletMovement> | null>(null);
  const [holds, setHolds] = useState<WalletPage<WalletReservation> | null>(null);
  const [refunds, setRefunds] = useState<WalletPage<CustomerRefund> | null>(null);
  const [pages, setPages] = useState({ activity: 1, holds: 1, refunds: 1 });
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  const [busy, setBusy] = useState<number | null>(null);
  const [actionError, setActionError] = useState(false);
  const [saved, setSaved] = useState(false);
  const requestSequence = useRef(0);
  const mutationLock = useRef(false);
  const refresh = useCallback(() => setRevision((value) => value + 1), []);
  useEffect(() => {
    let active = true;
    const sequence = ++requestSequence.current;
    queueMicrotask(() => { if (active) { setLoading(true); setError(false); } });
    Promise.all([getCustomerWallet(), listWalletMovements(pages.activity), listWalletReservations(pages.holds), listCustomerRefunds(pages.refunds)])
      .then(([wallet, movements, reservations, requests]) => {
        if (!active || sequence !== requestSequence.current) return;
        setSummary(wallet); setActivity(movements); setHolds(reservations); setRefunds(requests);
      }).catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [pages, revision]);
  useEffect(() => { window.addEventListener("focus", refresh); return () => window.removeEventListener("focus", refresh); }, [refresh]);

  const money = (amount: number) => formatQar(amount / 100, lang);
  const date = (value: string) => formatQatarDateTime(value, lang === "ar" ? "ar-QA" : "en-QA", { dateStyle: "medium", timeStyle: "short" });
  async function choose(id: number, destination: CustomerRefund["settlement_destination"]) {
    if (mutationLock.current) return;
    mutationLock.current = true; setBusy(id); setActionError(false); setSaved(false);
    try {
      await chooseRefundDestination(id, destination);
      setSaved(true); refresh();
    } catch {
      setActionError(true); refresh();
    } finally { mutationLock.current = false; setBusy(null); }
  }

  return <section aria-labelledby="wallet-title" className="space-y-6" aria-busy={loading}>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h2 id="wallet-title" className="text-2xl font-bold">{t("Wallet and refunds")}</h2><p className="mt-1 text-sm text-[color:var(--muted-foreground)]">{t("Your customer credit and refund history.")}</p></div>
      <button type="button" className="secondary-button min-h-11 px-4" onClick={refresh} disabled={loading}>{t("Refresh wallet")}</button>
    </div>
    {actionError && <AppToast message={t("Could not save your refund choice. Refresh and try again.")} dismissLabel={t("Dismiss")} onDismiss={() => setActionError(false)} />}
    {saved && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-emerald-900">{t("Refund destination saved. Approval does not add credit; credit appears after execution.")}</p>}
    {error ? <div role="alert" className="commerce-card p-5"><p>{t("Wallet information is unavailable. Please try again.")}</p><button type="button" className="secondary-button mt-3 min-h-11 px-4" onClick={refresh}>{t("Try again")}</button></div> : loading && !summary ? <div className="grid gap-3 sm:grid-cols-3" aria-label={t("Loading wallet")}>
      {[0, 1, 2].map((key) => <div key={key} className="commerce-card h-28 animate-pulse bg-slate-100 motion-reduce:animate-none" />)}
    </div> : summary && activity && holds && refunds && <>
      <dl className="grid gap-3 sm:grid-cols-3">
        {[[t("Available credit"), summary.available_minor], [t("Reserved credit"), summary.reserved_minor], [t("Total credit"), summary.balance_minor]].map(([label, value]) => <div key={label} className="commerce-card p-5"><dt className="text-sm text-[color:var(--muted-foreground)]">{label}</dt><dd className="mt-2 text-2xl font-bold text-[color:var(--navy)]">{money(value as number)}</dd></div>)}
      </dl>
      <p className="text-sm text-[color:var(--muted-foreground)]">{t("Balance updated")}: {date(summary.as_of)}</p>
      {!summary.capabilities.can_spend && <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-950">{t("Wallet payments are not currently available. Your credit remains recorded in your account.")}</p>}
      <section aria-labelledby="wallet-activity-title"><h3 id="wallet-activity-title" className="mb-3 text-xl font-bold">{t("Wallet activity")}</h3>
        {activity.data.length === 0 ? <p className="commerce-card p-5">{t("No wallet activity yet.")}</p> : <ul className="divide-y divide-slate-200 rounded-2xl border border-slate-200">{activity.data.map((movement) => <li key={movement.id} className="flex flex-wrap justify-between gap-3 p-4"><div><p className="font-semibold">{t(MOVEMENT_LABELS[movement.type])}</p><time dateTime={movement.occurred_at} className="text-sm text-[color:var(--muted-foreground)]">{date(movement.occurred_at)}</time></div><p className="font-bold"><span>{t(DIRECTION_LABELS[movement.direction])}</span> {money(movement.amount_minor)}</p></li>)}</ul>}
        <WalletPagination meta={activity.meta} busy={loading} onPage={(page) => setPages((old) => ({ ...old, activity: page }))} />
      </section>
      <section aria-labelledby="wallet-holds-title"><h3 id="wallet-holds-title" className="mb-3 text-xl font-bold">{t("Pending reservations")}</h3>
        {holds.data.length === 0 ? <p>{t("No credit is currently reserved.")}</p> : <ul className="space-y-2">{holds.data.map((hold) => <li key={hold.id} className="commerce-card flex flex-wrap justify-between gap-3 p-4"><strong>{money(hold.amount_minor)}</strong><span>{t("Reserved until")}: {date(hold.expires_at)}</span></li>)}</ul>}
        <WalletPagination meta={holds.meta} busy={loading} onPage={(page) => setPages((old) => ({ ...old, holds: page }))} />
      </section>
      <section aria-labelledby="wallet-refunds-title"><h3 id="wallet-refunds-title" className="mb-3 text-xl font-bold">{t("My refunds")}</h3>
        <p className="mb-3 text-sm text-[color:var(--muted-foreground)]">{t("Request a refund from your booking, or manage the destination of an existing request here.")}</p>
        {refunds.data.length === 0 ? <p className="commerce-card p-5">{t("No refund requests yet.")}</p> : <div className="space-y-4">{refunds.data.map((refund) => <article key={refund.id} className="commerce-card space-y-3 p-5">
          <div className="flex flex-wrap justify-between gap-2"><h4 className="font-bold">{refund.reference}{refund.subject_reference ? ` · ${refund.subject_reference}` : ""}</h4><strong>{money(refund.amount_minor)}</strong></div>
          <p className="font-semibold">{t(refundStatusLabel(refund))}</p>
          <p>{t(DESTINATION_LABELS[refund.settlement_destination])}</p>
          <p className="text-sm">{t("Settled")}: {money(refund.settled_amount_minor)} · {t("Pending")}: {money(refund.pending_amount_minor)}</p>
          <p className="break-words text-sm text-[color:var(--muted-foreground)]">{refund.reason}</p>
          <RefundDestinationForm key={`${refund.id}-${refund.settlement_destination}`} refund={refund} busy={busy !== null || loading} onSave={(destination) => choose(refund.id, destination)} />
        </article>)}</div>}
        <WalletPagination meta={refunds.meta} busy={loading} onPage={(page) => setPages((old) => ({ ...old, refunds: page }))} />
      </section>
    </>}
  </section>;
}

function RefundDestinationForm({ refund, busy, onSave }: { refund: CustomerRefund; busy: boolean; onSave: (destination: CustomerRefund["settlement_destination"]) => Promise<void> }) {
  const { t } = useI18n();
  const [destination, setDestination] = useState(refund.settlement_destination);
  const [consent, setConsent] = useState(false);
  if (!refund.can_choose_destination) return null;
  const wallet = destination === "customer_wallet";
  return <form onSubmit={(event) => { event.preventDefault(); if (!busy && (!wallet || consent)) void onSave(destination); }} className="space-y-3 border-t border-slate-200 pt-3">
    <label className="block text-sm font-semibold">{t("Refund destination")}<select className="wizard-input mt-2 min-h-11" disabled={busy} value={destination} onChange={(event) => { setDestination(event.target.value as CustomerRefund["settlement_destination"]); setConsent(false); }}>
      <option value="original_payment">{t("Original payment method")}</option><option value="customer_wallet" disabled={!refund.wallet_credit_available}>{t("Customer wallet")}</option>
    </select></label>
    {!refund.wallet_credit_available && <p className="text-sm text-[color:var(--muted-foreground)]">{t("Wallet credit is unavailable for this refund.")}</p>}
    {wallet && <label className="flex min-h-11 items-start gap-3 text-sm"><input type="checkbox" checked={consent} disabled={busy} onChange={(event) => setConsent(event.target.checked)} className="mt-1 h-5 w-5 shrink-0" /><span>{t("I choose account credit. Credit has no expiry and cannot be withdrawn as cash. Approval alone does not add credit.")}</span></label>}
    <button type="submit" className="primary-button min-h-11 px-4 disabled:opacity-50" disabled={busy || destination === refund.settlement_destination || (wallet && (!consent || !refund.wallet_credit_available))}>{t("Save refund destination")}</button>
  </form>;
}

function WalletPagination({ meta, busy, onPage }: { meta: WalletPage<unknown>["meta"]; busy: boolean; onPage: (page: number) => void }) {
  const { t, lang } = useI18n();
  if (meta.last_page <= 1) return null;
  return <nav aria-label={t("Wallet pagination")} className="mt-4 flex flex-wrap items-center justify-between gap-3"><button type="button" className="secondary-button min-h-11 px-3" disabled={busy || meta.current_page <= 1} onClick={() => onPage(meta.current_page - 1)}>{t("Previous")}</button><span>{t("Page")} {meta.current_page.toLocaleString(lang)} {t("of")} {meta.last_page.toLocaleString(lang)}</span><button type="button" className="secondary-button min-h-11 px-3" disabled={busy || meta.current_page >= meta.last_page} onClick={() => onPage(meta.current_page + 1)}>{t("Next")}</button></nav>;
}
