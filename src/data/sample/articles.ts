import type { Article } from "@/types/content";

export const sampleArticles: Article[] = [
  {
    slug: "best-time-to-visit-zanzibar",
    title: "When is the best time to visit Zanzibar?",
    excerpt:
      "A simple guide to Zanzibar's seasons and what they mean for beach days, boat trips and safaris.",
    publishedOn: "2026-10-01",
    readingMinutes: 4,
    tags: ["Planning", "Seasons"],
    coverImage: {
      src: "/images/photos/palm-beach.jpg",
      alt: "Palm trees framing a sunny beach with loungers and turquoise water",
      theme: "sunset",
    },
    sections: [
      {
        heading: "Zanzibar's seasons at a glance",
        paragraphs: [
          "Zanzibar has a warm tropical climate all year. Broadly, there are two drier periods — roughly June to October and December to February — and two rainier periods, with the heavier rains usually around March to May and shorter rains around November.",
          "Weather varies from year to year, so treat these as general patterns rather than guarantees.",
        ],
      },
      {
        heading: "Planning a safari as well?",
        paragraphs: [
          "If you plan to combine the island with a mainland safari, the drier months are often preferred for game viewing. Our team can help you match your dates to the experiences you want.",
        ],
      },
      {
        heading: "Travelling in the rainy season",
        paragraphs: [
          "Rain often comes in short, heavy showers rather than all day. Some boat trips may be rescheduled for weather, and some accommodation may close for part of the long rains — so it is worth planning flexibly.",
        ],
      },
    ],
    status: "published",
    seo: {
      title: "Best Time to Visit Zanzibar",
      description: "Zanzibar's seasons explained for beach, boat and safari trips.",
    },
    isSample: true,
  },
  {
    slug: "respecting-local-culture-stone-town",
    title: "Respecting local culture in Stone Town",
    excerpt: "Simple ways to be a welcome guest in Zanzibar's historic old town.",
    publishedOn: "2026-09-15",
    readingMinutes: 3,
    tags: ["Culture", "Stone Town"],
    coverImage: {
      src: "/images/tours/stone-town-market-street.jpg",
      alt: "A busy market street in Stone Town",
      theme: "spice",
    },
    sections: [
      {
        heading: "Dress with care",
        paragraphs: [
          "Zanzibar is a predominantly Muslim society. In towns and villages, covering shoulders and knees is appreciated. Swimwear is best kept to the beach and your accommodation.",
        ],
      },
      {
        heading: "Ask before you photograph",
        paragraphs: [
          "Many people are happy to be photographed, but always ask first — especially in markets and residential lanes.",
        ],
      },
      {
        heading: "During Ramadan",
        paragraphs: [
          "During the holy month of Ramadan, avoid eating, drinking or smoking in public during daylight hours in towns and villages. Many restaurants for visitors stay open.",
        ],
      },
    ],
    status: "published",
    seo: {
      title: "Respecting Local Culture in Stone Town",
      description: "Etiquette tips for visiting Stone Town, Zanzibar.",
    },
    isSample: true,
  },
  {
    slug: "what-to-pack-for-zanzibar-day-trips",
    title: "What to pack for a Zanzibar day trip",
    excerpt: "A short checklist for boat trips, forest walks and town tours.",
    publishedOn: "2026-08-20",
    readingMinutes: 3,
    tags: ["Planning", "Packing"],
    coverImage: {
      src: "/images/photos/beach-benches.jpg",
      alt: "Palm-shaded beach with loungers and bougainvillea on the Zanzibar coast",
      theme: "sunset",
    },
    sections: [
      {
        heading: "For boat and sandbank trips",
        paragraphs: [
          "Bring swimwear, a towel, a hat and plenty of sun protection — sandbanks have little shade. A waterproof bag keeps your phone and cash dry. Choose reef-safe sunscreen to help protect coral.",
        ],
      },
      {
        heading: "For town and forest visits",
        paragraphs: [
          "Comfortable walking shoes, light clothing that covers shoulders and knees, insect repellent and a refillable water bottle will cover most days.",
        ],
      },
      {
        heading: "Always useful",
        paragraphs: [
          "Some cash in small notes for snacks, tips and small purchases, and a copy of your booking details.",
        ],
      },
    ],
    status: "published",
    seo: {
      title: "What to Pack for Zanzibar Day Trips",
      description: "Packing checklist for Zanzibar boat trips, tours and forest walks.",
    },
    isSample: true,
  },
];
