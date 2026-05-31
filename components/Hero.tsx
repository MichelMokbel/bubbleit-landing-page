import Image from "next/image";
import { AppButton } from "@/components/ui";

const highlights = [
  "Fast booking flow",
  "On-demand mobile service",
  "Simple location confirmation",
];

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden pt-8 sm:pt-10">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[32rem] bg-linear-to-b from-white via-white/70 to-transparent" />
      <div className="pointer-events-none absolute -left-16 top-28 h-48 w-48 rounded-full bg-[color:var(--cyan)]/16 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-8 h-56 w-56 rounded-full bg-[color:var(--blue)]/14 blur-3xl" />
      <Image
        src="/assets/brand/brand-pattern-primary.svg"
        alt=""
        width={520}
        height={520}
        className="pattern-fade pointer-events-none absolute -right-20 top-4 hidden w-[26rem] opacity-30 md:block"
      />

      <div className="section-shell section-spacing relative">
        <div className="grid items-center gap-12 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="max-w-2xl">
            <span className="section-kicker">Book. Confirm. Bubbleit arrives.</span>
            <h1 className="mt-6 text-5xl font-bold tracking-tight text-[color:var(--foreground)] sm:text-6xl lg:text-7xl">
              Mobile Car Wash,
              <span className="block text-[color:var(--blue)]">Booked in Minutes</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[color:var(--muted-foreground)]">
              Bubbleit lets you book a professional car wash from your phone.
              Choose your service, pick your time, confirm your location, and
              we&apos;ll come to you.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <AppButton href="#download">Download App</AppButton>
              <AppButton href="#" variant="secondary">
                Open App
              </AppButton>
            </div>

            <ul className="mt-8 grid gap-3 text-sm font-medium text-[color:var(--foreground)] sm:grid-cols-3">
              {highlights.map((item) => (
                <li
                  key={item}
                  className="glass-panel rounded-2xl px-4 py-3 text-center shadow-[var(--shadow-card)]"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="pointer-events-none absolute inset-x-6 top-10 h-24 rounded-full bg-[color:var(--cyan)]/25 blur-3xl" />
            <div className="glass-panel relative rounded-[36px] border-white/80 p-3 shadow-[0_28px_80px_rgba(38,34,98,0.16)]">
              <div className="rounded-[30px] bg-linear-to-b from-[color:var(--navy)] to-[color:var(--deep-blue)] p-2">
                <div className="overflow-hidden rounded-[28px] bg-[#eef7fd] p-5">
                  <div className="mb-5 flex items-center justify-between">
                    <Image
                      src="/assets/brand/logo-primary.svg"
                      alt="Bubbleit"
                      width={120}
                      height={38}
                      className="h-9 w-auto"
                    />
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[color:var(--blue)]">
                      Live Booking
                    </span>
                  </div>

                  <div className="rounded-[24px] bg-white p-4 shadow-[var(--shadow-card)]">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-[color:var(--muted-foreground)]">
                          Today, 3:30 PM
                        </p>
                        <p className="mt-1 text-xl font-bold text-[color:var(--foreground)]">
                          Full Car Wash
                        </p>
                      </div>
                      <div className="rounded-2xl bg-[color:var(--cyan)]/18 px-3 py-2 text-sm font-semibold text-[color:var(--deep-blue)]">
                        Confirmed
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3">
                      <div className="rounded-2xl bg-[color:var(--background)] px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--blue)]">
                          Location
                        </p>
                        <p className="mt-1 text-sm text-[color:var(--foreground)]">
                          Your address is pinned and ready for arrival.
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-2xl bg-[color:var(--background)] px-4 py-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--blue)]">
                            Service
                          </p>
                          <p className="mt-1 text-sm text-[color:var(--foreground)]">
                            Exterior + Interior
                          </p>
                        </div>
                        <div className="rounded-2xl bg-[color:var(--background)] px-4 py-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--blue)]">
                            Payment
                          </p>
                          <p className="mt-1 text-sm text-[color:var(--foreground)]">
                            Secure checkout
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-3">
                    {["Service", "Time", "Track"].map((item) => (
                      <div
                        key={item}
                        className="rounded-2xl bg-white px-3 py-4 text-center shadow-[var(--shadow-card)]"
                      >
                        <div className="mx-auto h-9 w-9 rounded-2xl bg-[color:var(--cyan)]/16" />
                        <p className="mt-2 text-xs font-semibold text-[color:var(--foreground)]">
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
