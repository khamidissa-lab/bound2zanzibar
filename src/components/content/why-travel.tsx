import { HeartHandshake, Leaf, MapPin, Wallet } from "lucide-react";

// Brand commitments (not credentials or claims of experience). Owner to review.
const reasons = [
  {
    icon: MapPin,
    title: "Local knowledge",
    body: "Based in Zanzibar, planning trips around the island and mainland Tanzania.",
  },
  {
    icon: Wallet,
    title: "For residents and visitors",
    body: "Clear prices for Tanzanian residents and international travellers, with options for different budgets.",
  },
  {
    icon: HeartHandshake,
    title: "Clear, honest booking",
    body: "We confirm availability and final prices with you before anything is booked.",
  },
  {
    icon: Leaf,
    title: "Respect for people and places",
    body: "We encourage responsible wildlife viewing and respect for local culture.",
  },
];

export function WhyTravel({ headingId = "why-heading" }: { headingId?: string }) {
  return (
    <section aria-labelledby={headingId} className="py-20">
      <div className="container-page">
        <div className="max-w-2xl">
          <p className="mb-2 text-sm font-semibold text-turquoise-deep">
            Why travel with us
          </p>
          <h2 id={headingId} className="text-3xl font-medium sm:text-4xl">
            Planned locally, with care
          </h2>
        </div>
        <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map(({ icon: Icon, title, body }) => (
            <li key={title}>
              <span className="flex size-11 items-center justify-center rounded-full bg-turquoise-soft text-turquoise-deep">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 font-display text-xl">{title}</h3>
              <p className="mt-2 text-muted-foreground">{body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
