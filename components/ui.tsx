import type { ReactNode } from "react";
import clsx from "clsx";

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  titleId,
}: {
  eyebrow: string;
  title: string;
  description: string;
  align?: "left" | "center";
  titleId?: string;
}) {
  return (
    <div
      className={clsx(
        "flex flex-col items-start gap-4",
        align === "center" && "mx-auto items-center text-center",
      )}
    >
      <span className="section-kicker">{eyebrow}</span>
      <h2 id={titleId} className="section-title">
        {title}
      </h2>
      <p className="section-copy">{description}</p>
    </div>
  );
}

export function AppButton({
  href,
  children,
  variant = "primary",
  className,
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
}) {
  return (
    <a
      href={href}
      className={clsx(
        variant === "primary" ? "primary-button" : "secondary-button",
        className,
      )}
    >
      {children}
    </a>
  );
}
