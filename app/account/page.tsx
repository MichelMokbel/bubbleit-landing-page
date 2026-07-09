"use client";

import { useCallback, useEffect, useState } from "react";
import clsx from "clsx";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { AuthPanel } from "@/components/booking/AuthPanel";
import { useI18n } from "@/lib/i18n";
import {
  ApiError,
  cancelBooking,
  deleteVehicle,
  getToken,
  listBookings,
  listVehicles,
  logout,
  me,
} from "@/lib/api/client";
import type {
  Booking,
  BookingStatus,
  Customer,
  Vehicle,
  VehicleType,
} from "@/lib/api/types";
import { formatQatarDateTime } from "@/lib/datetime";

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

const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
  sedan: "Salon / Sedan",
  suv: "SUV / 4-Wheel",
  caravan: "Caravan",
  jet_ski: "Jet Ski",
  jet_boat: "Jet Boat",
};

export default function AccountPage() {
  const { t } = useI18n();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [checked, setChecked] = useState(false);
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[] | null>(null);
  const [tab, setTab] = useState<"bookings" | "cars">("bookings");
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    listBookings().then(setBookings).catch(() => setBookings([]));
    listVehicles().then(setVehicles).catch(() => setVehicles([]));
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
    if (!window.confirm(t("Cancel this booking?"))) return;
    setError(null);
    try {
      await cancelBooking(id);
      refresh();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not cancel the booking.");
    }
  }

  async function handleRemoveVehicle(id: number) {
    if (!window.confirm(t("Remove this car?"))) return;
    setError(null);
    try {
      await deleteVehicle(id);
      refresh();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not remove the car.");
    }
  }

  async function handleLogout() {
    await logout();
    setCustomer(null);
    setBookings(null);
    setVehicles(null);
  }

  return (
    <>
      <Navbar />
      <main className="section-shell min-h-[60dvh] py-10 sm:py-14">
        {!checked ? null : !customer ? (
          <div className="mx-auto max-w-md">
            <AuthPanel
              onAuthed={(c) => {
                setCustomer(c);
                refresh();
              }}
            />
          </div>
        ) : (
          <>
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="section-kicker">{t("My Account")}</span>
                <h1 className="section-title mt-4">
                  {customer.name ? `${t("Hi,")} ${customer.name.split(" ")[0]}` : t("My Bookings")}
                </h1>
                <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">{customer.phone}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href="/book" className="primary-button">
                  {t("Book a Wash")}
                </Link>
                <Link href="/memberships" className="secondary-button">
                  {t("My Memberships")}
                </Link>
                <button type="button" className="secondary-button" onClick={handleLogout}>
                  {t("Log out")}
                </button>
              </div>
            </div>

            {error && (
              <p role="alert" className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </p>
            )}

            <div className="mb-6 flex gap-2">
              {(
                [
                  ["bookings", t("Bookings")],
                  ["cars", t("My Cars")],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTab(value)}
                  className={
                    tab === value
                      ? "rounded-full bg-[color:var(--navy)] px-5 py-2 text-sm font-semibold text-white"
                      : "rounded-full border border-[color:var(--border)] bg-white px-5 py-2 text-sm font-semibold text-[color:var(--foreground)] hover:border-[color:var(--blue)]"
                  }
                >
                  {label}
                </button>
              ))}
            </div>

            {tab === "cars" ? (
              vehicles === null ? (
                <p className="py-16 text-center text-sm text-[color:var(--muted-foreground)]">{t("Loading your cars…")}</p>
              ) : vehicles.length === 0 ? (
                <div className="glass-panel rounded-[var(--radius-card)] p-12 text-center">
                  <h2 className="text-xl font-bold">{t("No cars saved yet")}</h2>
                  <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">
                    {t("Cars you add during a booking are saved here by plate number.")}
                  </p>
                  <Link href="/book" className="primary-button mt-6">
                    {t("Book a Wash")}
                  </Link>
                </div>
              ) : (
                <div className="card-grid md:grid-cols-2 lg:grid-cols-3">
                  {vehicles.map((v) => (
                    <article key={v.id} className="glass-panel flex flex-col gap-3 rounded-[var(--radius-card)] p-6">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-2xl font-extrabold tracking-wider text-[color:var(--navy)]">
                          {v.plate_number}
                        </span>
                        <span className="rounded-full bg-[color:var(--background)] px-3 py-1 text-xs font-semibold">
                          {t(VEHICLE_TYPE_LABELS[v.type])}
                        </span>
                      </div>
                      {(v.make || v.model || v.color) && (
                        <p className="text-sm text-[color:var(--muted-foreground)]">
                          {[v.make, v.model, v.color].filter(Boolean).join(" · ")}
                        </p>
                      )}
                      <button
                        type="button"
                        className="self-start text-sm font-semibold text-red-600 hover:underline"
                        onClick={() => handleRemoveVehicle(v.id)}
                      >
                        {t("Remove")}
                      </button>
                    </article>
                  ))}
                </div>
              )
            ) : bookings === null ? (
              <p className="py-16 text-center text-sm text-[color:var(--muted-foreground)]">{t("Loading your bookings…")}</p>
            ) : bookings.length === 0 ? (
              <div className="glass-panel rounded-[var(--radius-card)] p-12 text-center">
                <h2 className="text-xl font-bold">{t("No bookings yet")}</h2>
                <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">
                  {t("Your first sparkling-clean car is a few taps away.")}
                </p>
                <Link href="/book" className="primary-button mt-6">
                  {t("Book your first wash")}
                </Link>
              </div>
            ) : (
              <div className="card-grid md:grid-cols-2">
                {bookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onCancel={() => handleCancel(booking.id)}
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
}: {
  booking: Booking;
  onCancel: () => void;
}) {
  const when = formatQatarDateTime(booking.scheduled_at, "en", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const { t } = useI18n();

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
          {CANCELLABLE.includes(booking.status) && (
            <button
              type="button"
              className="secondary-button min-h-9 px-4 py-2 text-xs text-red-600 hover:border-red-400 hover:text-red-600"
              onClick={onCancel}
            >
              {t("Cancel")}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
