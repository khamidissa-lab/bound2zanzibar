import type { Destination } from "@/types/content";

import { existingParkDetails, newParks } from "./parks";

const baseDestinations: Omit<Destination, "wildlife" | "bestTime">[] = [
  {
    slug: "stone-town",
    name: "Stone Town",
    region: "zanzibar",
    summary:
      "The historic heart of Zanzibar City — winding lanes, carved doors and a lively waterfront.",
    description: [
      "Stone Town is the old quarter of Zanzibar City and a UNESCO World Heritage Site. Its narrow streets reflect centuries of Swahili, Arab, Indian and European influence.",
      "Most visitors spend at least a day here exploring markets, historic buildings and the seafront, and many island boat trips depart from nearby beaches.",
    ],
    highlights: [
      "Carved wooden doors and coral-stone architecture",
      "Darajani market and local street food",
      "Forodhani Gardens waterfront in the evening",
      "Departure point for Prison Island and sandbank trips",
    ],
    coverImage: {
      src: "/images/tours/stone-town-aerial.jpg",
      alt: "Aerial view of Stone Town's rooftops beside the turquoise sea",
      theme: "town",
    },
    featured: true,
    status: "published",
    seo: {
      title: "Stone Town, Zanzibar",
      description:
        "Explore Stone Town's history, markets and waterfront with local guides.",
    },
    isSample: true,
  },
  {
    slug: "nungwi-kendwa",
    name: "Nungwi & Kendwa",
    region: "zanzibar",
    summary: "Zanzibar's northern tip, known for swimmable beaches and long sunsets.",
    description: [
      "On the northern tip of Unguja, Nungwi and neighbouring Kendwa are popular for their beaches, which are generally less affected by tides than the east coast.",
      "Nungwi also has a long tradition of dhow building, and the area is a common base for boat trips towards Mnemba.",
    ],
    highlights: [
      "Beaches suited to swimming at most tides",
      "Traditional dhow-building yards",
      "Sunset views over the Indian Ocean",
    ],
    coverImage: {
      src: "/images/photos/aerial-beach.jpg",
      alt: "Aerial view of a white-sand beach and turquoise water in Zanzibar",
      theme: "ocean",
    },
    featured: true,
    status: "published",
    seo: {
      title: "Nungwi & Kendwa, Zanzibar",
      description: "Beach days, sunsets and dhow culture on Zanzibar's northern coast.",
    },
    isSample: true,
  },
  {
    slug: "mnemba",
    name: "Mnemba Atoll",
    region: "zanzibar",
    summary: "A protected reef off the north-east coast, popular for snorkelling.",
    description: [
      "Mnemba Atoll lies off Zanzibar's north-east coast and is part of a marine conservation area. The reef is popular for snorkelling and diving.",
      "The island itself is private, so trips focus on the waters around the atoll. Marine life sightings vary by day and season.",
    ],
    highlights: [
      "Clear water and coral reef",
      "Snorkelling from a boat",
      "Marine conservation area",
    ],
    coverImage: {
      src: "/images/photos/reef.jpg",
      alt: "Fish swimming over a colourful coral reef",
      theme: "ocean",
    },
    featured: true,
    status: "published",
    seo: {
      title: "Mnemba Atoll, Zanzibar",
      description: "Snorkelling trips to the protected reef around Mnemba Atoll.",
    },
    isSample: true,
  },
  {
    slug: "menai-bay-kizimkazi",
    name: "Menai Bay & Kizimkazi",
    region: "zanzibar",
    summary: "The south-west coast: sandbanks, lagoons and the village of Kizimkazi.",
    description: [
      "Menai Bay is a conservation area on Zanzibar's south-west coast, with sandbanks, mangrove lagoons and small islands.",
      "Kizimkazi, a fishing village at the southern tip, is known for dolphin-watching boat trips. Responsible operators keep a respectful distance from wildlife.",
    ],
    highlights: [
      "Sandbanks and lagoons",
      "Traditional dhow day trips",
      "Dolphin watching from Kizimkazi",
    ],
    coverImage: {
      src: "/images/photos/sandbank.jpg",
      alt: "Aerial view of a narrow white sandbank in turquoise water off Zanzibar",
      theme: "ocean",
    },
    featured: false,
    status: "published",
    seo: {
      title: "Menai Bay & Kizimkazi, Zanzibar",
      description: "Sandbanks, lagoons and dolphin watching on Zanzibar's south coast.",
    },
    isSample: true,
  },
  {
    slug: "jozani-forest",
    name: "Jozani Forest",
    region: "zanzibar",
    summary:
      "Zanzibar's main remaining natural forest and home of the red colobus monkey.",
    description: [
      "Jozani Forest is part of Jozani Chwaka Bay National Park, the only national park on Zanzibar.",
      "It is best known for the Zanzibar red colobus, a monkey found only on the island, and for a mangrove boardwalk.",
    ],
    highlights: [
      "Zanzibar red colobus monkeys",
      "Forest walking trails",
      "Mangrove boardwalk",
    ],
    coverImage: {
      src: "/images/photos/colobus.jpg",
      alt: "Zanzibar red colobus monkey climbing through the trees",
      theme: "forest",
    },
    featured: true,
    status: "published",
    seo: {
      title: "Jozani Forest, Zanzibar",
      description: "Visit Jozani Forest to see the endemic Zanzibar red colobus monkey.",
    },
    isSample: true,
  },
  {
    slug: "mikumi",
    name: "Mikumi National Park",
    region: "mainland",
    summary: "An accessible mainland park, often combined with a Zanzibar stay.",
    description: [
      "Mikumi National Park is in southern-central Tanzania. Its open plains make it a practical choice for a short safari.",
      "Travellers based in Zanzibar can reach it by a combination of flights and road transfers, depending on schedules.",
    ],
    highlights: [
      "Open plains suited to game drives",
      "Short safari option",
      "Combine with island time",
    ],
    coverImage: {
      src: "/images/photos/mikumi.jpg",
      alt: "Safari vehicles on the grassy plains of Mikumi National Park",
      theme: "savanna",
    },
    featured: false,
    status: "published",
    seo: {
      title: "Mikumi National Park, Tanzania",
      description: "Short safaris to Mikumi National Park, combined with Zanzibar.",
    },
    isSample: true,
  },
  {
    slug: "serengeti-ngorongoro",
    name: "Serengeti & Ngorongoro",
    region: "mainland",
    summary: "Tanzania's northern circuit: vast plains and the Ngorongoro Crater.",
    description: [
      "The northern circuit includes Serengeti National Park and the Ngorongoro Conservation Area, two of Tanzania's best-known wildlife areas.",
      "Trips usually start from Arusha or Kilimanjaro, which can be reached by flight from Zanzibar.",
    ],
    highlights: ["Serengeti plains", "Ngorongoro Crater", "Multi-day game drives"],
    coverImage: {
      src: "/images/photos/zebras.jpg",
      alt: "Zebras grazing in the Ngorongoro Crater under shafts of light",
      theme: "savanna",
    },
    featured: true,
    status: "published",
    seo: {
      title: "Serengeti & Ngorongoro, Tanzania",
      description: "Safaris to the Serengeti and Ngorongoro, combined with Zanzibar.",
    },
    isSample: true,
  },
  {
    slug: "south-east-coast",
    name: "Paje, Jambiani & Michamvi",
    region: "zanzibar",
    summary:
      "The south-east coast: long white beaches, village life, lagoons and kitesurfing.",
    description: [
      "Zanzibar’s south-east coast stretches from Michamvi through Paje to Jambiani. Wide beaches, a reef-protected lagoon and big tides shape life along the shore.",
      "It is home to fishing and seaweed-farming villages, the Michamvi peninsula, and places like Kuza Cave and the Blue Lagoon. Paje is also known for kitesurfing.",
    ],
    highlights: [
      "Long white-sand beaches",
      "Village life and seaweed farming",
      "Blue Lagoon and Kuza Cave",
      "Sunset from the Michamvi peninsula",
    ],
    coverImage: {
      src: "/images/photos/beach-hut.jpg",
      alt: "Coconut palms leaning over a thatched roof on a Zanzibar beach",
      theme: "sunset",
    },
    featured: false,
    status: "published",
    seo: {
      title: "Paje, Jambiani & Michamvi, Zanzibar",
      description: "Beaches, villages and lagoons on Zanzibar’s south-east coast.",
    },
    isSample: true,
  },
  {
    slug: "nyerere",
    name: "Nyerere National Park (Selous)",
    region: "mainland",
    summary: "One of Africa’s largest protected areas, known for river and lake safaris.",
    description: [
      "Nyerere National Park was created from the northern part of the Selous Game Reserve in southern Tanzania. Its rivers and lakes make boat safaris possible alongside game drives.",
      "Short flights from Zanzibar make it practical for day trips and short safaris, depending on schedules.",
    ],
    highlights: [
      "Game drives",
      "Boat safaris on the river",
      "Short flight from Zanzibar",
    ],
    coverImage: {
      src: "/images/photos/selous-giraffe.jpg",
      alt: "Young giraffe among the trees in Nyerere National Park",
      theme: "savanna",
    },
    featured: false,
    status: "published",
    seo: {
      title: "Nyerere National Park (Selous), Tanzania",
      description: "Day trips and safaris to Nyerere National Park from Zanzibar.",
    },
    isSample: true,
  },
];

/** Zanzibar destinations have no safari details; parks get theirs from parks.ts. */
export const sampleDestinations: Destination[] = [
  ...baseDestinations.map((d) => ({
    ...d,
    ...(existingParkDetails[d.slug] ?? { wildlife: [], bestTime: "" }),
  })),
  ...newParks,
];
