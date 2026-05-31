"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { AppButton } from "@/components/ui";

const navItems = [
  { label: "Services", href: "#services" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Benefits", href: "#benefits" },
  { label: "Download", href: "#download" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const closeMenu = () => setIsOpen(false);
    window.addEventListener("resize", closeMenu);
    return () => window.removeEventListener("resize", closeMenu);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-[color:var(--border)] bg-white/88 backdrop-blur-xl">
      <div className="section-shell">
        <div className="flex min-h-18 items-center justify-between gap-4">
          <a
            href="#top"
            className="flex shrink-0 items-center"
            aria-label="Bubbleit home"
          >
            <Image
              src="/assets/brand/logo-secondary.svg"
              alt="Bubbleit logo"
              width={184}
              height={44}
              priority
              className="h-10 w-auto"
            />
          </a>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-[color:var(--muted-foreground)] transition hover:text-[color:var(--navy)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--blue)]"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden lg:flex">
            <AppButton href="#" className="px-5">
              Open App
            </AppButton>
          </div>

          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-[color:var(--border)] text-[color:var(--navy)] transition hover:border-[color:var(--blue)] hover:text-[color:var(--blue)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--blue)] lg:hidden"
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setIsOpen((current) => !current)}
          >
            <span className="sr-only">Menu</span>
            <div className="flex flex-col gap-1.5">
              <span
                className={clsx(
                  "block h-0.5 w-5 rounded-full bg-current transition",
                  isOpen && "translate-y-2 rotate-45",
                )}
              />
              <span
                className={clsx(
                  "block h-0.5 w-5 rounded-full bg-current transition",
                  isOpen && "opacity-0",
                )}
              />
              <span
                className={clsx(
                  "block h-0.5 w-5 rounded-full bg-current transition",
                  isOpen && "-translate-y-2 -rotate-45",
                )}
              />
            </div>
          </button>
        </div>

        <div
          id="mobile-menu"
          className={clsx(
            "overflow-hidden transition-[grid-template-rows,opacity] duration-200 ease-out lg:hidden",
            isOpen ? "grid grid-rows-[1fr] pb-4 opacity-100" : "grid grid-rows-[0fr] opacity-0",
          )}
        >
          <div className="overflow-hidden">
            <nav
              className="glass-panel flex flex-col gap-2 rounded-[28px] p-3"
              aria-label="Mobile"
            >
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="rounded-2xl px-4 py-3 text-sm font-medium text-[color:var(--foreground)] transition hover:bg-[color:var(--background)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--blue)]"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <AppButton href="#" className="mt-2 w-full" variant="primary">
                Open App
              </AppButton>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
