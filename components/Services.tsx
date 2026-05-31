import { SectionHeader } from "@/components/ui";

const services = [
  {
    title: "Exterior Wash",
    description:
      "A quick and professional outside wash to keep your car looking fresh.",
    icon: "01",
  },
  {
    title: "Interior Cleaning",
    description:
      "Clean seats, dashboard, floor mats, and interior surfaces for a better driving experience.",
    icon: "02",
  },
  {
    title: "Full Car Wash",
    description:
      "A complete inside and outside cleaning service for customers who want the full package.",
    icon: "03",
  },
  {
    title: "Add-On Services",
    description:
      "Upgrade your booking with extra services and accessories when available.",
    icon: "04",
  },
];

export function Services() {
  return (
    <section id="services" className="section-spacing">
      <div className="section-shell">
        <SectionHeader
          eyebrow="Services"
          title="Car Wash Services at Your Doorstep"
          description="Choose the service you need and book directly from the app."
          titleId="services-title"
        />

        <div className="card-grid mt-12 md:grid-cols-2 xl:grid-cols-4">
          {services.map((service) => (
            <article
              key={service.title}
              className="glass-panel group rounded-[var(--radius-card)] p-6 transition duration-200 hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(20,137,222,0.18)]"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-[color:var(--cyan)]/25 to-[color:var(--blue)]/20 text-sm font-bold text-[color:var(--deep-blue)]">
                {service.icon}
              </div>
              <h3 className="mt-5 text-xl font-bold text-[color:var(--foreground)]">
                {service.title}
              </h3>
              <p className="mt-3 text-base leading-7 text-[color:var(--muted-foreground)]">
                {service.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
