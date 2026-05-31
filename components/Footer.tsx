import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-[color:var(--navy)] pb-8 pt-14 text-white">
      <div className="section-shell">
        <div className="grid gap-10 border-b border-white/10 pb-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <Image
              src="/assets/brand/logo-white.svg"
              alt="Bubbleit logo"
              width={160}
              height={48}
              className="h-11 w-auto"
            />
            <p className="mt-5 max-w-md text-base leading-7 text-white/74">
              Bubbleit makes mobile car wash booking simple, fast, and
              convenient.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-white/72">
                Contact
              </h2>
              <p className="mt-4 text-base text-white">+974 XX XXX XXX</p>
              <a
                href="#"
                className="mt-3 inline-flex text-base font-medium text-[color:var(--cyan)] transition hover:text-white"
              >
                WhatsApp
              </a>
            </div>

            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-white/72">
                Legal
              </h2>
              <div className="mt-4 flex flex-col gap-3 text-base">
                <a
                  href="#"
                  className="text-white/82 transition hover:text-[color:var(--cyan)]"
                >
                  Privacy Policy
                </a>
                <a
                  href="#"
                  className="text-white/82 transition hover:text-[color:var(--cyan)]"
                >
                  Terms &amp; Conditions
                </a>
              </div>
            </div>
          </div>
        </div>

        <p className="pt-6 text-sm text-white/58">
          © 2026 Bubbleit. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
