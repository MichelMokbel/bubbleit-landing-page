"use client";

import { useCallback, useEffect, useState } from "react";
import clsx from "clsx";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import {
  ApiError,
  cancelBooking,
  getToken,
  listBookings,
  logout,
  me,
  payBooking,
  requestOtp,
  verifyOtp,
} from "@/lib/api/client";
import type { Booking, BookingStatus, Customer } from "@/lib/api/types";

const STATUS_STYLES: Record<BookingStatus, string> = {
  pending_payment: "bg-amber-100 text-amber-700",
  paid: "bg-emerald-100 text-emerald-700",
  assigned: "bg-sky-100 text-sky-700",
  in_progress: "bg-sky-100 text-sky-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled_by_customer: "bg-red-100 text-red-600",
  cancelled_by_admin: "bg-red-100 text-red-600",
  no_show: "bg-gray-200 text-gray-600",
};

const CANCELLABLE: BookingStatus[] = ["pending_payment", "paid", "assigned"];

export default function AccountPage() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [checked, setChecked] = useState(false);
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    listBookings().then(setBookings).catch(() => setBookings([]));
  }, []);

  useEffect(() => {
    const check = getToken() ? me() : Promise.reject();
    check
      .then((c) => {
        setCustomer(c);
        refresh();
      })
      .catch(() => setCustomer(null))
      .finally(() => setChecked(true));
  }, [refresh]);

  async function handleCancel(id: number) {
    if (!window.confirm("Cancel this booking?")) return;
    setError(null);
    try {
      await cancelBooking(id);
      refresh();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not cancel the booking.");
    }
  }

  async function handlePay(id: number) {
    try {
      const { checkout_url } = await payBooking(id);
      window.location.assign(checkout_url);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not start the payment.");
    }
  }

  async function handleLogout() {
    await logout();
    setCustomer(null);
    setBookings(null);
  }

  return (
    <>
      <Navbar />
      <main className="section-shell min-h-[60dvh] py-10 sm:py-14">
        {!checked ? null : !customer ? (
          <LoginPanel
            onAuthed={(c) => {
              setCustomer(c);
              refresh();
            }}
          />
        ) : (
          <>
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="section-kicker">My Account</span>
                <h1 className="section-title mt-4">
                  {customer.name ? `Hi, ${customer.name.split(" ")[0]}` : "My bookings"}
                </h1>
                <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">{customer.phone}</p>
              </div>
              <div className="flex gap-2">
                <Link href="/book" className="primary-button">
                  Book a wash
                </Link>
                <button type="button" className="secondary-button" onClick={handleLogout}>
                  Log out
                </button>
              </div>
            </div>

            {error && (
              <p role="alert" className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </p>
            )}

            {bookings === null ? (
              <p className="py-16 text-center text-sm text-[color:var(--muted-foreground)]">Loading your bookings…</p>
            ) : bookings.length === 0 ? (
              <div className="glass-panel rounded-[var(--radius-card)] p-12 text-center">
                <h2 className="text-xl font-bold">No bookings yet</h2>
                <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">
                  Your first sparkling-clean car is a few taps away.
                </p>
                <Link href="/book" className="primary-button mt-6">
                  Book your first wash
                </Link>
              </div>
            ) : (
              <div className="card-grid md:grid-cols-2">
                {bookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onCancel={() => handleCancel(booking.id)}
                    onPay={() => handlePay(booking.id)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </>
  );
}

function BookingCard({
  booking,
  onCancel,
  onPay,
}: {
  booking: Booking;
  onCancel: () => void;
  onPay: () => void;
}) {
  const when = new Date(booking.scheduled_at).toLocaleString("en", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const awaitingOnlinePayment =
    booking.status === "pending_payment" && booking.payment_method === "online";

  return (
    <article className="glass-panel flex flex-col gap-4 rounded-[var(--radius-card)] p-6">
      <div className="flex items-center justify-between gap-3">
        <span className="font-bold text-[color:var(--navy)]">{booking.reference}</span>
        <span
          className={clsx(
            "rounded-full px-3 py-1 text-xs font-semibold",
            STATUS_STYLES[booking.status] ?? "bg-gray-100 text-gray-600",
          )}
        >
          {booking.status_label}
        </span>
      </div>

      <div className="flex flex-col gap-1 text-sm text-[color:var(--muted-foreground)]">
        <span>🗓 {when}</span>
        <span>📍 {booking.address_area || "—"}</span>
        <span>
          🚗{" "}
          {booking.cars
            .map((c) => `${c.service.name} — ${c.vehicle.make} ${c.vehicle.model}`)
            .join(" · ")}
        </span>
      </div>

      <div className="flex items-center justify-between border-t border-[color:var(--border)] pt-4">
        <span className="font-bold">QR {booking.total}</span>
        <div className="flex gap-2">
          {awaitingOnlinePayment && (
            <button type="button" className="primary-button min-h-9 px-4 py-2 text-xs" onClick={onPay}>
              Pay now
            </button>
          )}
          {CANCELLABLE.includes(booking.status) && (
            <button
              type="button"
              className="secondary-button min-h-9 px-4 py-2 text-xs text-red-600 hover:border-red-400 hover:text-red-600"
              onClick={onCancel}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function LoginPanel({ onAuthed }: { onAuthed: (customer: Customer) => void }) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send() {
    setBusy(true);
    setError(null);
    try {
      await requestOtp(phone.trim());
      setSent(true);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not send the code.");
    } finally {
      setBusy(false);
    }
  }

  async function verify() {
    setBusy(true);
    setError(null);
    try {
      const result = await verifyOtp(phone.trim(), otp.trim());
      onAuthed(result.customer);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Verification failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="glass-panel mx-auto max-w-md rounded-[var(--radius-card)] p-8 sm:p-10">
      <span className="section-kicker">My Account</span>
      <h1 className="mt-4 text-2xl font-bold">Sign in with your phone</h1>
      <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">
        We&apos;ll text you a 6-digit code — no passwords needed.
      </p>

      <div className="mt-6 flex flex-col gap-4">
        <input
          className="wizard-input"
          placeholder="+974 5555 5555"
          inputMode="tel"
          value={phone}
          disabled={sent}
          onChange={(e) => setPhone(e.target.value.replace(/[^\d+\s]/g, ""))}
        />
        {sent && (
          <>
            <input
              className="wizard-input tracking-[0.4em]"
              placeholder="••••••"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            />
            <span className="flex items-center gap-4">
              <button
                type="button"
                className="cursor-pointer border-none bg-transparent p-0 text-xs font-semibold text-[color:var(--blue)] hover:underline"
                onClick={send}
              >
                Resend code
              </button>
              <button
                type="button"
                className="cursor-pointer border-none bg-transparent p-0 text-xs font-semibold text-[color:var(--muted-foreground)] hover:text-[color:var(--navy)] hover:underline"
                onClick={() => {
                  setSent(false);
                  setOtp("");
                  setError(null);
                }}
              >
                Change phone number
              </button>
            </span>
          </>
        )}
        {error && (
          <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </p>
        )}
        {!sent ? (
          <button
            type="button"
            className="primary-button disabled:opacity-40"
            disabled={busy || phone.replace(/\D/g, "").length < 7}
            onClick={send}
          >
            {busy ? "Sending…" : "Send code"}
          </button>
        ) : (
          <button
            type="button"
            className="primary-button disabled:opacity-40"
            disabled={busy || otp.length !== 6}
            onClick={verify}
          >
            {busy ? "Verifying…" : "Sign in"}
          </button>
        )}
      </div>
    </div>
  );
}
