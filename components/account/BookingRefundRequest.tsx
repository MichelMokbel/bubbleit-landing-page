"use client";

import { useRef, useState } from "react";
import { requestBookingRefund } from "@/lib/api/client";
import type { Booking } from "@/lib/api/types";
import { AppToast } from "@/components/AppToast";
import { useI18n } from "@/lib/i18n";

export function BookingRefundRequest({ booking, busy, onRequested }: { booking: Booking; busy: boolean; onRequested: () => void }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);
  const lock = useRef(false);
  const payment = booking.payment?.status;
  if (!["paid", "completed", "cancelled_by_customer", "cancelled_by_admin"].includes(booking.status)
      || !["paid", "partially_refunded"].includes(payment ?? "")
      || (booking.refund && !["processed", "rejected"].includes(booking.refund.status))) return null;
  async function submit() {
    if (lock.current || busy || !reason.trim()) return;
    lock.current = true; setSaving(true); setError(false);
    try { await requestBookingRefund(booking.id, reason.trim()); onRequested(); }
    catch { setError(true); }
    finally { lock.current = false; setSaving(false); }
  }
  return <div className="border-t border-slate-200 pt-3">
    {error && <AppToast message={t("Could not submit the refund request. Refresh your bookings before trying again.")} dismissLabel={t("Dismiss message")} onDismiss={() => setError(false)} />}
    {!open ? <button type="button" className="secondary-button min-h-11 px-4" disabled={busy} onClick={() => setOpen(true)}>{t("Request refund")}</button> : <form className="space-y-3" onSubmit={(event) => { event.preventDefault(); void submit(); }}>
      <label className="block text-sm font-semibold">{t("Reason for refund")}<textarea className="wizard-input mt-2 min-h-24" required maxLength={1000} value={reason} disabled={saving || busy} onChange={(event) => setReason(event.target.value)} /></label>
      <p className="text-sm text-[color:var(--muted-foreground)]">{t("We calculate the remaining refundable amount from your payment history. A request does not guarantee approval.")}</p>
      <div className="flex flex-wrap gap-3"><button type="submit" className="primary-button min-h-11 px-4" disabled={saving || busy || !reason.trim()}>{t(saving ? "Submitting refund…" : "Submit refund request")}</button><button type="button" className="secondary-button min-h-11 px-4" disabled={saving} onClick={() => setOpen(false)}>{t("Cancel")}</button></div>
    </form>}
  </div>;
}
