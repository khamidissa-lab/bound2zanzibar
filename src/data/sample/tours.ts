import type { Tour } from "@/types/content";

import { illustrativePrices, standardExclusions, type TourBase } from "./shared";
import { tourDiscovery } from "./discovery";
import { safariDetails, safariTours } from "./safaris";
import { tourDetails } from "./tour-details";
import { moreTours } from "./tours-more";

const coreTours: TourBase[] = [
  {
    slug: "stone-town-city-tour",
    name: "Stone Town City Tour",
    shortDescription:
      "A guided walk through Stone Town's lanes, markets and landmarks with a local guide.",
    description: [
      "Discover the old quarter of Zanzibar City on foot. Your guide leads you through narrow lanes lined with carved doors, past historic buildings, mosques, churches and busy markets.",
      "Along the way you will hear how trade across the Indian Ocean shaped the town — including the painful history of the East African slave trade, remembered at the site of the former slave market.",
    ],
    categorySlug: "culture-history",
    destinationSlug: "stone-town",
    duration: "Half day (approx. 3–4 hours)",
    highlights: [
      "Carved Zanzibari doors and coral-stone architecture",
      "Darajani market",
      "Former slave market site and memorial",
      "Old Fort and Forodhani Gardens waterfront",
    ],
    included: ["Local English-speaking guide", "Entrance fees listed in the itinerary"],
    excluded: [...standardExclusions, "Hotel pickup outside Stone Town (on request)"],
    whatToBring: [
      "Comfortable walking shoes",
      "Clothing that covers shoulders and knees",
      "Water",
      "Sun protection",
    ],
    meetingPoint:
      "Hotel pickup in Stone Town or an agreed meeting point. Exact time confirmed on booking.",
    difficulty: "easy",
    suitability: "Suitable for most ages. Involves walking on uneven streets.",
    // Main image supplied by the owner; gallery photos are Unsplash License
    // (credits in docs/PHOTO_CREDITS.md).
    coverImage: {
      src: "/images/tours/stone-town-cyclist-lane.jpg",
      alt: "A man cycling through a narrow lane between old Stone Town buildings",
      theme: "town",
    },
    gallery: [
      {
        src: "/images/tours/stone-town-aerial.jpg",
        alt: "Aerial view of Stone Town's rooftops beside the turquoise sea",
        theme: "town",
      },
      {
        src: "/images/tours/stone-town-market-street.jpg",
        alt: "A busy market street in Stone Town",
        theme: "spice",
      },
    ],
    prices: illustrativePrices({ adult: 25, child: 15 }, { adult: 50000, child: 30000 }),
    featured: true,
    status: "published",
    seo: {
      title: "Stone Town City Tour",
      description: "Guided walking tour of Stone Town's lanes, markets and history.",
    },
    isSample: true,
  },
  {
    slug: "prison-island-tour",
    name: "Prison Island Tour",
    shortDescription:
      "A short boat trip from Stone Town to Changuu Island and its giant tortoises.",
    description: [
      "Take a boat from the Stone Town shore to Changuu, known as Prison Island. The island is home to a colony of giant Aldabra tortoises and historic buildings from the colonial era.",
      "Time permitting, there is a chance to swim or snorkel near the island before returning.",
    ],
    categorySlug: "sea-islands",
    destinationSlug: "stone-town",
    duration: "Half day (approx. 3 hours)",
    highlights: [
      "Boat ride from Stone Town",
      "Giant Aldabra tortoises",
      "Historic island buildings",
      "Swimming or snorkelling stop",
    ],
    included: [
      "Boat transfer",
      "Guide",
      "Snorkelling equipment (subject to availability)",
    ],
    excluded: [...standardExclusions, "Island entrance fee (if not stated as included)"],
    whatToBring: [
      "Swimwear and towel",
      "Sun protection",
      "Water",
      "Waterproof bag for phones",
    ],
    meetingPoint:
      "Stone Town beach near the waterfront. Exact point and time confirmed on booking.",
    difficulty: "easy",
    suitability: "Suitable for families. Boat trips depend on sea conditions.",
    coverImage: {
      src: "/images/photos/tortoise.jpg",
      alt: "Giant Aldabra tortoise on Prison Island",
      theme: "forest",
    },
    gallery: [
      {
        src: "/images/photos/aerial-shore.jpg",
        alt: "Aerial view of waves breaking over turquoise water off the Zanzibar coast",
        theme: "ocean",
      },
    ],
    prices: illustrativePrices({ adult: 35, child: 20 }, { adult: 60000, child: 35000 }),
    featured: true,
    status: "published",
    seo: {
      title: "Prison Island Tour",
      description: "Boat trip to Prison Island to see giant tortoises.",
    },
    isSample: true,
  },
  {
    slug: "spice-farm-tour",
    name: "Spice Farm Tour",
    shortDescription:
      "See, smell and taste the spices that made Zanzibar the 'Spice Island'.",
    description: [
      "Visit a working spice farm outside Stone Town. A local guide shows you cloves, nutmeg, cinnamon, vanilla and other plants, and explains how they are grown and used.",
      "Many visits include tasting seasonal tropical fruit and an optional local lunch.",
    ],
    categorySlug: "culture-history",
    destinationSlug: "stone-town",
    duration: "Half day (approx. 3–4 hours)",
    highlights: [
      "Guided walk through a spice farm",
      "Seasonal fruit tasting",
      "Optional Swahili lunch",
    ],
    included: ["Return transfer from Stone Town", "Farm guide"],
    excluded: [...standardExclusions, "Lunch (optional extra)"],
    whatToBring: [
      "Comfortable shoes",
      "Insect repellent",
      "Cash for optional spice purchases",
    ],
    meetingPoint: "Hotel pickup in or near Stone Town. Exact time confirmed on booking.",
    difficulty: "easy",
    suitability: "Suitable for all ages.",
    coverImage: {
      src: "/images/tours/spice-farm-guests.jpg",
      alt: "Three smiling women on a wooden bench wearing leaf crowns with red flowers, holding woven leaf baskets, under a jackfruit tree",
      theme: "spice",
    },
    gallery: [
      {
        src: "/images/tours/spice-farm-nutmeg.jpg",
        alt: "Hands holding an opened nutmeg fruit, showing three seeds wrapped in bright red mace",
        theme: "spice",
      },
      {
        src: "/images/tours/spice-farm-vanilla.jpg",
        alt: "A hand holding a bunch of long green vanilla pods growing on the vine",
        theme: "spice",
      },
      {
        src: "/images/tours/spice-farm-jackfruit.jpg",
        alt: "A cluster of large jackfruits hanging from a tree trunk, two of them split open to show yellow flesh",
        theme: "spice",
      },
      {
        src: "/images/tours/spice-farm-papaya.jpg",
        alt: "A papaya tree seen from below, heavy with green and ripening orange fruit",
        theme: "spice",
      },
      {
        src: "/images/tours/spice-farm-bananas.jpg",
        alt: "A bunch of green bananas hanging under large sunlit banana leaves",
        theme: "spice",
      },
    ],
    prices: illustrativePrices({ adult: 30, child: 15 }, { adult: 45000, child: 25000 }),
    featured: false,
    status: "published",
    seo: {
      title: "Spice Farm Tour",
      description: "Guided spice farm visit near Stone Town.",
    },
    isSample: true,
  },
  {
    slug: "jozani-forest-tour",
    name: "Jozani Forest Tour",
    shortDescription:
      "Walk the forest trails of Jozani to look for the endemic red colobus monkey.",
    description: [
      "Jozani Chwaka Bay National Park protects Zanzibar's largest remaining natural forest. A park guide leads you along trails where the Zanzibar red colobus — found only on this island — is often seen.",
      "The visit usually includes the mangrove boardwalk, where you can learn about the role mangroves play along the coast.",
    ],
    categorySlug: "nature-wildlife",
    destinationSlug: "jozani-forest",
    duration: "Half day (approx. 3–4 hours including travel)",
    highlights: [
      "Zanzibar red colobus monkeys",
      "Forest trail with park guide",
      "Mangrove boardwalk",
    ],
    included: ["Return transfer", "Park guide"],
    excluded: [...standardExclusions, "Park entrance fee (if not stated as included)"],
    whatToBring: ["Closed shoes", "Insect repellent", "Water", "Camera"],
    meetingPoint: "Hotel pickup. Exact time confirmed on booking.",
    difficulty: "easy",
    suitability: "Suitable for most ages. Wildlife sightings cannot be guaranteed.",
    coverImage: {
      src: "/images/photos/colobus.jpg",
      alt: "Zanzibar red colobus monkey climbing through the trees",
      theme: "forest",
    },
    gallery: [],
    prices: illustrativePrices({ adult: 40, child: 25 }, { adult: 60000, child: 35000 }),
    featured: true,
    status: "published",
    seo: {
      title: "Jozani Forest Tour",
      description: "See the Zanzibar red colobus monkey in Jozani Forest.",
    },
    isSample: true,
  },
  {
    slug: "mnemba-island-snorkelling",
    name: "Mnemba Island Snorkelling",
    shortDescription:
      "A boat trip to snorkel the reef around the protected Mnemba Atoll.",
    description: [
      "Head out by boat from the north-east coast to the waters around Mnemba Atoll, part of a marine conservation area.",
      "Snorkel over the reef with your guide. Marine life varies by day and season, and boat trips depend on weather and sea conditions.",
    ],
    categorySlug: "sea-islands",
    destinationSlug: "mnemba",
    duration: "Half day to full day (depending on pickup location)",
    highlights: [
      "Snorkelling around Mnemba Atoll",
      "Clear water and coral reef",
      "Boat trip along the coast",
    ],
    included: ["Boat trip", "Snorkelling equipment", "Guide", "Drinking water"],
    excluded: [
      ...standardExclusions,
      "Marine conservation fee (if not stated as included)",
    ],
    whatToBring: [
      "Swimwear and towel",
      "Reef-safe sunscreen",
      "Light cover-up for the boat",
    ],
    meetingPoint:
      "Departure from the north-east coast. Pickup options confirmed on booking.",
    difficulty: "moderate",
    suitability: "Best for confident swimmers. Life jackets available on request.",
    // Main and first two gallery photos supplied by the owner (2026-11-09);
    // see docs/PHOTO_CREDITS.md.
    coverImage: {
      src: "/images/tours/mnemba-atoll-boats.jpg",
      alt: "Aerial view of a small forested island with a white sandbank, and boats anchored in the shallow turquoise water in front",
      theme: "ocean",
    },
    gallery: [
      {
        src: "/images/tours/mnemba-reef-boats.jpg",
        alt: "Boats with striped canopies anchored in clear turquoise water, with swimmers around them and an island beach in the distance",
        theme: "ocean",
      },
      {
        src: "/images/tours/mnemba-island-reef.jpg",
        alt: "Turquoise water with darker reef patches, traditional dhows and boats anchored off a forested island",
        theme: "ocean",
      },
      {
        src: "/images/photos/aerial-shore.jpg",
        alt: "Aerial view of waves breaking over turquoise water off the Zanzibar coast",
        theme: "ocean",
      },
    ],
    prices: illustrativePrices({ adult: 60, child: 35 }, { adult: 100000, child: 60000 }),
    featured: true,
    status: "published",
    seo: {
      title: "Mnemba Island Snorkelling",
      description: "Snorkelling boat trip to Mnemba Atoll.",
    },
    isSample: true,
  },
  {
    slug: "safari-blue-menai-bay",
    name: "Safari Blue — Menai Bay",
    shortDescription:
      "A full day on a traditional dhow: sandbanks, snorkelling and a seafood lunch.",
    description: [
      "Spend a day exploring Menai Bay by traditional dhow. Typical stops include a sandbank, a snorkelling spot and a mangrove lagoon.",
      "The day usually includes a seafood lunch on one of the islands. The exact route depends on tides and conditions.",
    ],
    categorySlug: "sea-islands",
    destinationSlug: "menai-bay-kizimkazi",
    duration: "Full day",
    highlights: [
      "Traditional dhow sailing",
      "Sandbank stop",
      "Snorkelling",
      "Seafood lunch",
    ],
    included: ["Dhow trip", "Snorkelling equipment", "Lunch", "Guide"],
    excluded: [...standardExclusions, "Transfers (available on request)"],
    whatToBring: ["Swimwear and towel", "Sun protection", "Hat", "Waterproof bag"],
    meetingPoint: "Departure from Fumba area. Transfer options confirmed on booking.",
    difficulty: "easy",
    suitability: "Suitable for families. Long day in the sun.",
    coverImage: {
      src: "/hero/nungwi-golden-hour-dhow.jpg",
      alt: "Traditional dhow on the water at golden hour off Nungwi",
      theme: "ocean",
    },
    gallery: [
      {
        src: "/images/photos/sandbank.jpg",
        alt: "Aerial view of a narrow white sandbank in turquoise water off Zanzibar",
        theme: "ocean",
      },
    ],
    prices: illustrativePrices({ adult: 75, child: 40 }, { adult: 120000, child: 70000 }),
    featured: true,
    status: "published",
    seo: {
      title: "Safari Blue — Menai Bay",
      description: "Full-day dhow trip in Menai Bay with lunch.",
    },
    isSample: true,
  },
  {
    slug: "nakupenda-sandbank",
    name: "Nakupenda Sandbank",
    shortDescription:
      "A short boat trip from Stone Town to a white sandbank for swimming and lunch.",
    description: [
      "Nakupenda is a sandbank a short boat ride from Stone Town. It appears and changes shape with the tide.",
      "Enjoy swimming, snorkelling and a beach lunch before returning to town. Timing depends on tides.",
    ],
    categorySlug: "sea-islands",
    destinationSlug: "stone-town",
    duration: "Half day (approx. 4 hours)",
    highlights: ["White sandbank", "Swimming and snorkelling", "Beach lunch"],
    included: ["Boat transfer", "Lunch", "Snorkelling equipment"],
    excluded: standardExclusions,
    whatToBring: ["Swimwear", "Sun protection — there is little shade", "Hat"],
    meetingPoint:
      "Stone Town beach. Exact time depends on tides and is confirmed on booking.",
    difficulty: "easy",
    suitability: "Suitable for families.",
    coverImage: {
      src: "/images/tours/nakupenda-sandbank-empty.jpg",
      alt: "A long white sandbank curving out to sea between calm turquoise water and breaking waves, with a few people walking in the distance",
      theme: "ocean",
    },
    gallery: [
      {
        src: "/images/tours/nakupenda-lunch-shades.jpg",
        alt: "Tables and red and white chairs set up for lunch under blue shade cloths on the white sand, next to the sea",
        theme: "ocean",
      },
      {
        src: "/images/tours/nakupenda-guests-walking.jpg",
        alt: "Guests walking along the white sandbank beside turquoise water, one carrying a child on his shoulders",
        theme: "ocean",
      },
      {
        src: "/images/tours/nakupenda-guests-relaxing.jpg",
        alt: "A group of guests sitting and lying on towels on the sand, with small boats in the turquoise water beyond",
        theme: "ocean",
      },
      {
        src: "/images/tours/nakupenda-shades-couple.jpg",
        alt: "A couple standing on the sand near blue shade cloths where lunch is being set up",
        theme: "ocean",
      },
    ],
    prices: illustrativePrices({ adult: 45, child: 25 }, { adult: 70000, child: 40000 }),
    featured: false,
    status: "published",
    seo: {
      title: "Nakupenda Sandbank",
      description: "Boat trip to the Nakupenda sandbank from Stone Town.",
    },
    isSample: true,
  },
  {
    slug: "sunset-dhow-cruise",
    name: "Sunset Dhow Cruise",
    shortDescription:
      "Sail along the Stone Town coast on a traditional dhow as the sun goes down.",
    description: [
      "Board a traditional wooden dhow for an evening sail along the Stone Town waterfront.",
      "Watch the sunset over the Indian Ocean with light refreshments. Sailing depends on weather.",
    ],
    categorySlug: "cruises-marine",
    destinationSlug: "stone-town",
    duration: "Approx. 2 hours",
    highlights: [
      "Traditional dhow",
      "Sunset over the ocean",
      "Views of the Stone Town skyline",
    ],
    included: ["Dhow cruise", "Soft drinks and snacks"],
    excluded: standardExclusions,
    whatToBring: ["Light jacket", "Camera"],
    meetingPoint: "Stone Town waterfront. Exact point confirmed on booking.",
    difficulty: "easy",
    suitability: "Suitable for all ages, couples and groups.",
    coverImage: {
      src: "/images/tours/sunset-dhows.jpg",
      alt: "Two dhows sailing on the sea at sunset",
      theme: "sunset",
    },
    gallery: [],
    prices: illustrativePrices({ adult: 35, child: 20 }, { adult: 55000, child: 30000 }),
    featured: true,
    status: "published",
    seo: {
      title: "Sunset Dhow Cruise",
      description: "Evening dhow cruise along the Stone Town coast.",
    },
    isSample: true,
  },
  {
    slug: "nungwi-kendwa-beach-experience",
    name: "Nungwi & Kendwa Beach Experience",
    shortDescription:
      "A relaxed day on the north coast: beaches, dhow builders and sunset.",
    description: [
      "Travel to Zanzibar's northern tip for a day by the sea. Visit Nungwi's traditional dhow-building yards and spend time on the beaches of Nungwi and Kendwa.",
      "Stay for the sunset before returning to your accommodation.",
    ],
    categorySlug: "beach-leisure",
    destinationSlug: "nungwi-kendwa",
    duration: "Full day",
    highlights: [
      "Nungwi village and dhow builders",
      "Beach time at Kendwa",
      "Sunset on the north coast",
    ],
    included: ["Return transfer", "Driver-guide"],
    excluded: [...standardExclusions, "Meals"],
    whatToBring: ["Swimwear and towel", "Sun protection", "Cash for meals"],
    meetingPoint: "Hotel pickup. Exact time confirmed on booking.",
    difficulty: "easy",
    suitability: "Suitable for everyone.",
    coverImage: {
      src: "/images/photos/aerial-beach.jpg",
      alt: "Aerial view of a white-sand beach and turquoise water in Zanzibar",
      theme: "ocean",
    },
    gallery: [
      {
        src: "/images/photos/palm-beach.jpg",
        alt: "Palm trees framing a sunny beach with loungers and turquoise water",
        theme: "sunset",
      },
    ],
    prices: illustrativePrices({ adult: 50, child: 25 }, { adult: 80000, child: 40000 }),
    featured: false,
    status: "published",
    seo: {
      title: "Nungwi & Kendwa Beach Experience",
      description: "Day trip to Zanzibar's northern beaches.",
    },
    isSample: true,
  },
  {
    slug: "kizimkazi-dolphin-experience",
    name: "Kizimkazi Dolphin Experience",
    shortDescription:
      "An early boat trip from Kizimkazi to look for dolphins — responsibly.",
    description: [
      "Set out early from the fishing village of Kizimkazi in search of the dolphins that are often seen off the south coast.",
      "Responsible dolphin watching means keeping a respectful distance and never chasing or crowding the animals. Sightings are never guaranteed. The trip can be combined with Jozani Forest.",
    ],
    categorySlug: "cruises-marine",
    destinationSlug: "menai-bay-kizimkazi",
    duration: "Half day (early morning)",
    highlights: [
      "Dolphin watching",
      "Kizimkazi fishing village",
      "Option to combine with Jozani Forest",
    ],
    included: ["Boat trip", "Guide", "Snorkelling equipment"],
    excluded: [...standardExclusions, "Transfers (available on request)"],
    whatToBring: ["Swimwear", "Light jacket for the early start", "Sun protection"],
    meetingPoint: "Kizimkazi beach or hotel pickup. Exact time confirmed on booking.",
    difficulty: "easy",
    suitability: "Suitable for families. Wildlife sightings cannot be guaranteed.",
    coverImage: {
      src: "/images/tours/kizimkazi-dolphins.jpg",
      alt: "Dolphins swimming in clear blue water",
      theme: "ocean",
    },
    gallery: [],
    prices: illustrativePrices({ adult: 45, child: 25 }, { adult: 70000, child: 40000 }),
    featured: false,
    status: "published",
    seo: {
      title: "Kizimkazi Dolphin Experience",
      description: "Responsible dolphin-watching trip from Kizimkazi.",
    },
    isSample: true,
  },
  {
    slug: "mikumi-day-safari",
    name: "Mikumi Day Safari from Zanzibar",
    shortDescription:
      "A long but rewarding day: fly to the mainland for a game drive in Mikumi.",
    description: [
      "For travellers short on time, a day safari to Mikumi National Park is a way to experience the mainland's wildlife from a Zanzibar base.",
      "The day combines flights and road transfers with a game drive. It is subject to flight availability and schedules, which are confirmed when booking.",
    ],
    categorySlug: "safari",
    destinationSlug: "mikumi",
    duration: "Full day (early start, late return)",
    highlights: ["Game drive in Mikumi", "Flight from Zanzibar", "Lunch in the park"],
    included: [
      "Return flights (subject to availability)",
      "Game drive with guide",
      "Lunch",
      "Park fees",
    ],
    excluded: [...standardExclusions, "Airport transfers in Zanzibar (on request)"],
    whatToBring: [
      "Passport or ID for the flight",
      "Neutral-coloured clothing",
      "Hat and sunglasses",
      "Camera",
    ],
    meetingPoint: "Zanzibar airport. Times depend on flight schedules.",
    difficulty: "moderate",
    suitability:
      "Long day with flights and driving. Wildlife sightings cannot be guaranteed.",
    coverImage: {
      src: "/images/photos/mikumi.jpg",
      alt: "Safari vehicles on the grassy plains of Mikumi National Park",
      theme: "savanna",
    },
    gallery: [],
    prices: illustrativePrices(
      { adult: 550, child: 450 },
      { adult: 1300000, child: 1050000 },
    ),
    featured: false,
    status: "published",
    seo: {
      title: "Mikumi Day Safari from Zanzibar",
      description: "Fly-in day safari to Mikumi from Zanzibar.",
    },
    isSample: true,
  },
];

/** All sample tours, each combined with its "More details" content. */
export const sampleTours: Tour[] = [...coreTours, ...moreTours, ...safariTours].map(
  (tour) => {
    const details = tourDetails[tour.slug] ?? safariDetails[tour.slug];
    if (!details) throw new Error(`Missing tour details for "${tour.slug}"`);
    const discovery = tourDiscovery[tour.slug];
    if (!discovery)
      throw new Error(`Missing length and travel styles for "${tour.slug}"`);
    // No sample options: real extras and their prices come from the owner.
    return { ...tour, ...details, ...discovery, options: [] };
  },
);
