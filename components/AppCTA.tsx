import Image from "next/image";
import { AppButton } from "@/components/ui";

export function AppCTA() {
  return (
    <section id="download" className="section-spacing">
      <div className="section-shell">
        <div className="relative overflow-hidden rounded-[40px] bg-[color:var(--navy)] px-6 py-10 text-white shadow-[0_28px_80px_rgba(38,34,98,0.24)] sm:px-8 lg:px-10 lg:py-12">
          <Image
            src="/assets/brand/brand-pattern-secondary.svg"
            alt=""
            width={480}
            height={480}
            className="pointer-events-none absolute -right-24 -top-16 hidden w-[24rem] opacity-20 md:block"
          />
          <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="relative">
              <span className="inline-flex rounded-full border border-white/15 bg-white/8 px-4 py-2 text-sm font-medium text-white/88">
                Download Bubbleit
              </span>
              <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Ready to Book Your Next Car Wash?
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/78 sm:text-lg">
                Download the Bubbleit app or open the web app to schedule your
                next booking.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <AppButton
                  href="#"
                  className="bg-white text-[color:var(--navy)] hover:bg-[color:var(--cyan)]"
                >
                  Download on App Store
                </AppButton>
                <AppButton
                  href="#"
                  className="bg-[color:var(--cyan)] text-[color:var(--navy)] hover:bg-white"
                >
                  Get it on Google Play
                </AppButton>
                <AppButton
                  href="#"
                  variant="secondary"
                  className="border-white/20 bg-transparent text-white hover:border-white hover:bg-white/8 hover:text-white"
                >
                  Open Web App
                </AppButton>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-[1fr_auto] lg:grid-cols-1">
              <div className="rounded-[32px] border border-white/12 bg-white/8 p-6 backdrop-blur-sm">
                <Image
                  src="/assets/brand/logo-white.svg"
                  alt="Bubbleit logo"
                  width={144}
                  height={44}
                  className="h-10 w-auto"
                />
                <p className="mt-4 max-w-sm text-sm leading-7 text-white/72">
                  Scan the QR code to continue on your phone or share the app
                  with someone nearby.
                </p>
              </div>

              <div className="flex items-center justify-center rounded-[32px] border border-white/12 bg-white p-6 shadow-[var(--shadow-card)]">
                <div
                  aria-label="QR code placeholder"
                  className="grid grid-cols-5 gap-1 rounded-[24px] bg-[color:var(--background)] p-4"
                >
                  {Array.from({ length: 25 }).map((_, index) => (
                    <span
                      key={index}
                      className={`h-4 w-4 rounded-[4px] ${
                        [0, 1, 3, 5, 6, 10, 12, 14, 18, 19, 21, 22, 24].includes(
                          index,
                        )
                          ? "bg-[color:var(--navy)]"
                          : "bg-[color:var(--cyan)]/30"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
