import type { TourPackage } from "@/types/content";

import { packageTravelStyles } from "./discovery";
import { illustrativePrices } from "./shared";

const sampleTerms = [
  "Sample terms for layout only. Final booking, payment and cancellation terms will be provided by Bound to Zanzibar.",
  "Itineraries may change due to weather, tides, flight schedules or park conditions.",
  "A booking is only confirmed once our team has confirmed availability in writing.",
];

export const samplePackages: TourPackage[] = [
  {
    slug: "zanzibar-highlights-4-days",
    name: "Zanzibar Highlights",
    summary:
      "Four days covering Stone Town, a spice farm, Prison Island and the northern beaches.",
    description: [
      "A compact introduction to Zanzibar for first-time visitors. Start with the history and culture of Stone Town, then move to the north coast for beach time.",
      "Accommodation can be chosen to suit your budget — from simple guesthouses to comfortable hotels.",
    ],
    days: 4,
    nights: 3,
    destinationSlugs: ["stone-town", "nungwi-kendwa"],
    includedTourSlugs: ["stone-town-city-tour", "spice-farm-tour", "prison-island-tour"],
    itinerary: [
      {
        day: 1,
        title: "Arrival in Stone Town",
        description:
          "Airport pickup and transfer to your Stone Town accommodation. Evening free to visit Forodhani Gardens.",
        overnight: "Stone Town",
        meals: [],
      },
      {
        day: 2,
        title: "Stone Town and spice farm",
        description:
          "Morning guided walk through Stone Town; afternoon spice farm visit with fruit tasting.",
        overnight: "Stone Town",
        meals: ["Breakfast"],
      },
      {
        day: 3,
        title: "Prison Island, then north",
        description:
          "Morning boat trip to Prison Island, then transfer to Nungwi or Kendwa for sunset.",
        overnight: "Nungwi / Kendwa",
        meals: ["Breakfast"],
      },
      {
        day: 4,
        title: "Beach morning and departure",
        description: "Free time on the beach before your transfer to the airport.",
        overnight: null,
        meals: ["Breakfast"],
      },
    ],
    accommodation:
      "Three nights in a guesthouse or hotel; category agreed with you before booking.",
    transfers: "Airport and inter-hotel transfers by private vehicle.",
    meals: "Breakfast daily.",
    included: [
      "Accommodation (3 nights)",
      "Listed tours with guides",
      "Private transfers",
      "Daily breakfast",
    ],
    excluded: [
      "International and domestic flights",
      "Lunches and dinners",
      "Travel insurance",
      "Personal expenses and tips",
    ],
    terms: sampleTerms,
    coverImage: {
      src: "/images/tours/stone-town-aerial.jpg",
      alt: "Aerial view of Stone Town's rooftops beside the turquoise sea",
      theme: "town",
    },
    prices: illustrativePrices(
      { adult: 420, child: 250 },
      { adult: 850000, child: 500000 },
      "per person sharing",
    ),
    featured: true,
    isSafari: false,
    travelStyles: packageTravelStyles["zanzibar-highlights-4-days"],
    status: "published",
    seo: {
      title: "Zanzibar Highlights — 4 Days",
      description:
        "Four-day Zanzibar package: Stone Town, spice farm, Prison Island and beaches.",
    },
    isSample: true,
  },
  {
    slug: "zanzibar-island-explorer-6-days",
    name: "Zanzibar Island Explorer",
    summary:
      "Six days of culture, forest, reef and sandbank — ideal for families and groups.",
    description: [
      "A fuller look at the island, mixing culture and nature with time on the water. Paced for families and groups, with free time built in.",
    ],
    days: 6,
    nights: 5,
    destinationSlugs: [
      "stone-town",
      "jozani-forest",
      "menai-bay-kizimkazi",
      "nungwi-kendwa",
    ],
    includedTourSlugs: [
      "stone-town-city-tour",
      "jozani-forest-tour",
      "safari-blue-menai-bay",
      "sunset-dhow-cruise",
    ],
    itinerary: [
      {
        day: 1,
        title: "Arrival",
        description: "Airport pickup and transfer to Stone Town.",
        overnight: "Stone Town",
        meals: [],
      },
      {
        day: 2,
        title: "Stone Town and sunset dhow",
        description: "Guided walk in the morning; sunset dhow cruise in the evening.",
        overnight: "Stone Town",
        meals: ["Breakfast"],
      },
      {
        day: 3,
        title: "Jozani Forest",
        description: "Visit Jozani Forest, then continue to the south or east coast.",
        overnight: "South / east coast",
        meals: ["Breakfast"],
      },
      {
        day: 4,
        title: "Safari Blue",
        description: "Full-day dhow trip in Menai Bay with snorkelling and lunch.",
        overnight: "South / east coast",
        meals: ["Breakfast", "Lunch"],
      },
      {
        day: 5,
        title: "North coast",
        description: "Transfer to the north coast for a free afternoon on the beach.",
        overnight: "Nungwi / Kendwa",
        meals: ["Breakfast"],
      },
      {
        day: 6,
        title: "Departure",
        description: "Transfer to the airport.",
        overnight: null,
        meals: ["Breakfast"],
      },
    ],
    accommodation:
      "Five nights across Stone Town and the coast; family rooms on request.",
    transfers: "All transfers by private vehicle.",
    meals: "Breakfast daily; lunch on the Safari Blue day.",
    included: [
      "Accommodation (5 nights)",
      "Listed tours",
      "Private transfers",
      "Meals as listed",
    ],
    excluded: [
      "Flights",
      "Meals not listed",
      "Travel insurance",
      "Personal expenses and tips",
    ],
    terms: sampleTerms,
    coverImage: {
      src: "/hero/nungwi-dhow-sunset.jpg",
      alt: "Dhow sailing at sunset off Nungwi",
      theme: "sunset",
    },
    prices: illustrativePrices(
      { adult: 690, child: 390 },
      { adult: 1400000, child: 800000 },
      "per person sharing",
    ),
    featured: true,
    isSafari: false,
    travelStyles: packageTravelStyles["zanzibar-island-explorer-6-days"],
    status: "published",
    seo: {
      title: "Zanzibar Island Explorer — 6 Days",
      description: "Six-day Zanzibar package with Jozani, Safari Blue and beach time.",
    },
    isSample: true,
  },
  {
    slug: "zanzibar-mikumi-safari-5-days",
    name: "Zanzibar & Mikumi Safari",
    summary: "Combine Stone Town and the beach with an overnight safari in Mikumi.",
    description: [
      "A short safari added to an island break. Fly to the mainland for game drives in Mikumi National Park, then return to Zanzibar to relax.",
      "Flights are subject to availability and schedules, confirmed when booking.",
    ],
    days: 5,
    nights: 4,
    destinationSlugs: ["stone-town", "mikumi", "nungwi-kendwa"],
    includedTourSlugs: ["stone-town-city-tour"],
    itinerary: [
      {
        day: 1,
        title: "Arrival in Zanzibar",
        description: "Airport pickup and transfer to Stone Town.",
        overnight: "Stone Town",
        meals: [],
      },
      {
        day: 2,
        title: "Fly to Mikumi",
        description:
          "Morning flight to the mainland, transfer to Mikumi and an afternoon game drive.",
        overnight: "Mikumi area",
        meals: ["Breakfast", "Lunch", "Dinner"],
      },
      {
        day: 3,
        title: "Game drive and return",
        description:
          "Early game drive, then return to Zanzibar and transfer to the coast.",
        overnight: "Zanzibar coast",
        meals: ["Breakfast", "Lunch"],
      },
      {
        day: 4,
        title: "Beach day",
        description: "A free day to rest, or add an optional tour.",
        overnight: "Zanzibar coast",
        meals: ["Breakfast"],
      },
      {
        day: 5,
        title: "Departure",
        description: "Transfer to the airport.",
        overnight: null,
        meals: ["Breakfast"],
      },
    ],
    accommodation: "Stone Town and coast hotels; safari lodge or tented camp in Mikumi.",
    transfers:
      "Return flights to the mainland (subject to availability) and road transfers.",
    meals: "As listed in the itinerary; full board on safari.",
    included: [
      "Accommodation (4 nights)",
      "Return mainland flights",
      "Game drives and park fees",
      "Transfers",
      "Meals as listed",
    ],
    excluded: [
      "International flights",
      "Visas",
      "Travel insurance",
      "Personal expenses and tips",
    ],
    terms: sampleTerms,
    coverImage: {
      src: "/images/photos/mikumi.jpg",
      alt: "Safari vehicles on the grassy plains of Mikumi National Park",
      theme: "savanna",
    },
    prices: illustrativePrices(
      { adult: 1250, child: 900 },
      { adult: 2900000, child: 2100000 },
      "per person sharing",
    ),
    featured: true,
    isSafari: true,
    travelStyles: packageTravelStyles["zanzibar-mikumi-safari-5-days"],
    status: "published",
    seo: {
      title: "Zanzibar & Mikumi Safari — 5 Days",
      description: "Island break with an overnight safari in Mikumi National Park.",
    },
    isSample: true,
  },
  {
    slug: "serengeti-ngorongoro-zanzibar-8-days",
    name: "Serengeti, Ngorongoro & Zanzibar",
    summary: "A northern-circuit safari followed by time on the Zanzibar coast.",
    description: [
      "Start on the mainland with game drives in the Serengeti and a descent into the Ngorongoro Crater, then fly to Zanzibar to unwind.",
      "Routes, lodges and flights are confirmed when booking and depend on availability and season.",
    ],
    days: 8,
    nights: 7,
    destinationSlugs: ["serengeti-ngorongoro", "nungwi-kendwa"],
    includedTourSlugs: [],
    itinerary: [
      {
        day: 1,
        title: "Arrival in Arusha",
        description: "Airport pickup and overnight in Arusha.",
        overnight: "Arusha",
        meals: ["Dinner"],
      },
      {
        day: 2,
        title: "To the Serengeti",
        description: "Drive or fly to the Serengeti with a game drive en route.",
        overnight: "Serengeti",
        meals: ["Breakfast", "Lunch", "Dinner"],
      },
      {
        day: 3,
        title: "Serengeti",
        description: "Full day of game drives.",
        overnight: "Serengeti",
        meals: ["Breakfast", "Lunch", "Dinner"],
      },
      {
        day: 4,
        title: "Ngorongoro",
        description: "Drive to the Ngorongoro highlands.",
        overnight: "Ngorongoro area",
        meals: ["Breakfast", "Lunch", "Dinner"],
      },
      {
        day: 5,
        title: "Crater and fly to Zanzibar",
        description:
          "Morning crater game drive, then transfer for an afternoon flight to Zanzibar.",
        overnight: "Zanzibar",
        meals: ["Breakfast", "Lunch"],
      },
      {
        day: 6,
        title: "Beach",
        description: "Free day on the coast.",
        overnight: "Zanzibar",
        meals: ["Breakfast"],
      },
      {
        day: 7,
        title: "Optional tour",
        description: "Add a tour such as Stone Town or a sandbank trip, or simply relax.",
        overnight: "Zanzibar",
        meals: ["Breakfast"],
      },
      {
        day: 8,
        title: "Departure",
        description: "Transfer to the airport.",
        overnight: null,
        meals: ["Breakfast"],
      },
    ],
    accommodation:
      "Safari lodges or tented camps on the mainland; beach hotel in Zanzibar.",
    transfers:
      "4x4 safari vehicle with driver-guide; flight to Zanzibar; airport transfers.",
    meals: "Full board on safari; breakfast in Zanzibar.",
    included: [
      "Accommodation (7 nights)",
      "Game drives and park fees",
      "Flight to Zanzibar",
      "Transfers",
      "Meals as listed",
    ],
    excluded: [
      "International flights",
      "Visas",
      "Travel insurance",
      "Optional tours",
      "Personal expenses and tips",
    ],
    terms: sampleTerms,
    coverImage: {
      src: "/hero/serengeti-elephant-family.jpg",
      alt: "Elephant family on the plains of the Serengeti",
      theme: "savanna",
    },
    prices: illustrativePrices(
      { adult: 2650, child: 1800 },
      { adult: 6200000, child: 4200000 },
      "per person sharing",
    ),
    featured: false,
    isSafari: true,
    travelStyles: packageTravelStyles["serengeti-ngorongoro-zanzibar-8-days"],
    status: "published",
    seo: {
      title: "Serengeti, Ngorongoro & Zanzibar — 8 Days",
      description: "Northern Tanzania safari combined with a Zanzibar beach stay.",
    },
    isSample: true,
  },
];
