import { illustrativePrices, standardExclusions, type TourBase } from "./shared";

/**
 * Additional sample tours (added 2026-11-02). Placeholder illustrations until
 * the owner supplies photos; all prices are illustrative.
 */
export const moreTours: TourBase[] = [
  {
    slug: "stone-town-food-tour",
    name: "Stone Town Evening Food Tour",
    shortDescription:
      "Taste Zanzibar's street food at Forodhani Gardens and in the old town's lanes with a local guide.",
    description: [
      "As the sun sets, Stone Town's waterfront comes alive. Join a local guide to discover the food stalls of Forodhani Gardens and small eateries in the surrounding lanes.",
      "Try local favourites such as Zanzibar pizza, grilled seafood, mishkaki skewers and fresh sugarcane juice, and hear how Swahili, Arab and Indian influences shaped the island's cooking.",
    ],
    categorySlug: "culture-history",
    destinationSlug: "stone-town",
    duration: "Evening (approx. 2–3 hours)",
    highlights: [
      "Forodhani Gardens night food market",
      "Zanzibar pizza and grilled seafood",
      "Sugarcane juice and local sweets",
      "Sunset over the Stone Town waterfront",
    ],
    included: ["Local guide", "Tastings listed in the itinerary"],
    excluded: [...standardExclusions, "Extra food and drinks you order"],
    whatToBring: [
      "Cash in small notes",
      "Light clothing covering shoulders and knees",
      "Hand sanitiser",
    ],
    meetingPoint:
      "Meeting point near Forodhani Gardens, Stone Town. Exact time confirmed on booking.",
    difficulty: "easy",
    suitability: "Suitable for most ages. Tell us about any allergies or dietary needs.",
    coverImage: {
      src: "/images/tours/stone-town-market-street.jpg",
      alt: "A busy market street in Stone Town",
      theme: "spice",
    },
    gallery: [],
    prices: illustrativePrices({ adult: 30, child: 18 }, { adult: 45000, child: 25000 }),
    featured: false,
    status: "published",
    seo: {
      title: "Stone Town Evening Food Tour",
      description:
        "Street food tour of Forodhani Gardens and Stone Town with a local guide.",
    },
    isSample: true,
  },
  {
    slug: "mangapwani-slave-caves",
    name: "Mangapwani Caves & Beach",
    shortDescription:
      "Visit the coral cave and slave chamber at Mangapwani, north of Stone Town, then relax on the beach.",
    description: [
      "Travel north from Stone Town to Mangapwani. Here, a natural coral cave and a man-made underground chamber are linked to the history of the East African slave trade.",
      "Your guide explains the history of the site with care. Afterwards there is time to unwind on the nearby beach before returning.",
    ],
    categorySlug: "culture-history",
    destinationSlug: "stone-town",
    duration: "Half day (approx. 3–4 hours)",
    highlights: [
      "Mangapwani coral cave",
      "Historic slave chamber",
      "Guided history of the site",
      "Time on Mangapwani beach",
    ],
    included: ["Return transfer from Stone Town", "Guide"],
    excluded: [...standardExclusions, "Site entrance fees (if not stated as included)"],
    whatToBring: [
      "Comfortable shoes",
      "Torch or phone light",
      "Swimwear for the beach",
      "Water",
    ],
    meetingPoint: "Hotel pickup in or near Stone Town. Exact time confirmed on booking.",
    difficulty: "easy",
    suitability: "Suitable for most ages. The cave has steps and uneven ground.",
    coverImage: {
      src: "/images/tours/mangapwani-cave.jpg",
      alt: "Water pooled among the rocks inside a coral cave",
      theme: "sunset",
    },
    gallery: [],
    prices: illustrativePrices({ adult: 35, child: 20 }, { adult: 55000, child: 30000 }),
    featured: false,
    status: "published",
    seo: {
      title: "Mangapwani Caves & Beach Tour",
      description:
        "Half-day visit to the Mangapwani caves and beach, north of Stone Town.",
    },
    isSample: true,
  },
  {
    slug: "kuza-cave-jambiani-village",
    name: "Kuza Cave & Jambiani Village",
    shortDescription:
      "Swim in a natural limestone cave pool and walk through a coastal village on the south-east coast.",
    description: [
      "Head to Jambiani on Zanzibar's south-east coast. Kuza Cave is a limestone cave with a natural freshwater pool, and a popular spot for a cool swim.",
      "Then walk through Jambiani village with a local guide to see daily life, seaweed farming along the shore and the long white-sand beach.",
    ],
    categorySlug: "nature-wildlife",
    destinationSlug: "south-east-coast",
    duration: "Half day (approx. 4 hours)",
    highlights: [
      "Swim in Kuza Cave's natural pool",
      "Jambiani village walk",
      "Seaweed farming on the shore",
      "South-east coast beaches",
    ],
    included: ["Return transfer", "Local guide"],
    excluded: [...standardExclusions, "Cave entrance fee (if not stated as included)"],
    whatToBring: [
      "Swimwear and towel",
      "Water shoes",
      "Clothing that covers shoulders and knees for the village",
    ],
    meetingPoint:
      "Hotel pickup on the south or east coast; Stone Town pickup on request.",
    difficulty: "easy",
    suitability:
      "Suitable for confident swimmers in the cave pool; non-swimmers can watch.",
    coverImage: {
      src: "/images/tours/kuza-cave.jpg",
      alt: "A swimmer floating in the clear turquoise water of a limestone cave",
      theme: "sunset",
    },
    gallery: [],
    prices: illustrativePrices({ adult: 40, child: 25 }, { adult: 60000, child: 35000 }),
    featured: false,
    status: "published",
    seo: {
      title: "Kuza Cave & Jambiani Village Tour",
      description:
        "Swim in Kuza Cave and walk through Jambiani village on Zanzibar's south-east coast.",
    },
    isSample: true,
  },
  {
    slug: "blue-lagoon-snorkelling",
    name: "Blue Lagoon Snorkelling",
    shortDescription:
      "Snorkel the calm, clear water of the Blue Lagoon on the Michamvi peninsula.",
    description: [
      "The Blue Lagoon near Michamvi Pingwe is a sheltered spot with clear water, often good for relaxed snorkelling and spotting reef fish.",
      "Snorkelling is best around high tide, so the time of the trip depends on the tides on your chosen day.",
    ],
    categorySlug: "sea-islands",
    destinationSlug: "south-east-coast",
    duration: "Half day (approx. 2–3 hours)",
    highlights: [
      "Calm, clear lagoon water",
      "Reef fish and corals",
      "Short boat ride",
      "Good for beginners",
    ],
    included: ["Boat trip", "Snorkelling equipment", "Guide"],
    excluded: [...standardExclusions, "Transfers (available on request)"],
    whatToBring: ["Swimwear and towel", "Reef-safe sunscreen", "Water shoes"],
    meetingPoint:
      "Michamvi Pingwe beach. Time depends on the tide and is confirmed on booking.",
    difficulty: "easy",
    suitability: "Good for beginner snorkellers. Life jackets available on request.",
    coverImage: {
      src: "/images/tours/blue-lagoon-snorkel.jpg",
      alt: "A woman and a child snorkelling among batfish in clear blue water",
      theme: "ocean",
    },
    gallery: [],
    prices: illustrativePrices({ adult: 35, child: 20 }, { adult: 55000, child: 30000 }),
    featured: false,
    status: "published",
    seo: {
      title: "Blue Lagoon Snorkelling, Michamvi",
      description:
        "Relaxed snorkelling trip to the Blue Lagoon on Zanzibar's Michamvi peninsula.",
    },
    isSample: true,
  },
  {
    slug: "mnarani-turtle-aquarium",
    name: "Mnarani Turtle Aquarium, Nungwi",
    shortDescription:
      "Meet sea turtles at a community-run natural lagoon in Nungwi and learn about local conservation.",
    description: [
      "Mnarani is a natural tidal lagoon in Nungwi, at the northern tip of Zanzibar. A local community project there looks after sea turtles.",
      "Learn about turtle conservation from the team and see the turtles up close, then combine the visit with time on Nungwi beach or the nearby lighthouse area.",
    ],
    categorySlug: "nature-wildlife",
    destinationSlug: "nungwi-kendwa",
    duration: "Approx. 1–2 hours (plus travel)",
    highlights: [
      "Sea turtles in a natural lagoon",
      "Community conservation project",
      "Nungwi's northern tip",
    ],
    included: ["Guide", "Transfers within Nungwi/Kendwa"],
    excluded: [
      ...standardExclusions,
      "Aquarium entrance fee (if not stated as included)",
    ],
    whatToBring: ["Sun protection", "Camera", "Cash for donations or the entrance fee"],
    meetingPoint: "Hotel pickup in Nungwi or Kendwa. Exact time confirmed on booking.",
    difficulty: "easy",
    suitability: "Great for families with children.",
    coverImage: {
      src: "/images/tours/mnarani-turtles.jpg",
      alt: "A swimmer surrounded by sea turtles in a turquoise natural pool",
      theme: "ocean",
    },
    gallery: [],
    prices: illustrativePrices({ adult: 20, child: 10 }, { adult: 30000, child: 15000 }),
    featured: false,
    status: "published",
    seo: {
      title: "Mnarani Turtle Aquarium, Nungwi",
      description: "Visit the community-run Mnarani turtle lagoon in Nungwi, Zanzibar.",
    },
    isSample: true,
  },
  {
    slug: "zanzibar-cooking-class",
    name: "Swahili Cooking Class",
    shortDescription:
      "Cook a Swahili meal with a local host, using the spices Zanzibar is famous for.",
    description: [
      "Spend a few hours in a local kitchen learning to cook traditional Swahili dishes, such as pilau rice, coconut curry and chapati.",
      "Your host shows you how cloves, cinnamon, cardamom and other island spices are used, and then you sit down together to enjoy the meal you prepared.",
    ],
    categorySlug: "culture-history",
    destinationSlug: "stone-town",
    duration: "Approx. 3–4 hours",
    highlights: [
      "Hands-on cooking with a local host",
      "Zanzibar spices explained",
      "Eat the meal you cooked",
      "Recipes to take home",
    ],
    included: ["Cooking class and ingredients", "Meal", "Soft drinks or tea"],
    excluded: [...standardExclusions, "Transfers (available on request)"],
    whatToBring: ["Appetite", "Notes about any allergies or dietary needs"],
    meetingPoint: "In or near Stone Town. Exact location and time confirmed on booking.",
    difficulty: "easy",
    suitability:
      "Suitable for all ages. Vegetarian options can usually be arranged — ask us.",
    coverImage: {
      src: "/images/tours/cooking-class.jpg",
      alt: "Visitors preparing food by hand with local women, seated on a woven mat",
      theme: "spice",
    },
    gallery: [],
    prices: illustrativePrices({ adult: 45, child: 25 }, { adult: 70000, child: 40000 }),
    featured: false,
    status: "published",
    seo: {
      title: "Swahili Cooking Class, Zanzibar",
      description:
        "Learn to cook Swahili dishes with Zanzibar spices alongside a local host.",
    },
    isSample: true,
  },
  {
    slug: "kwale-island-day-trip",
    name: "Kwale Island & Menai Bay",
    shortDescription:
      "Sail to Kwale Island in Menai Bay for a mangrove lagoon swim, a sandbank and a seafood lunch.",
    description: [
      "Explore Menai Bay on a traditional boat, with stops at a sandbank and at Kwale Island, known for its natural lagoon among the mangroves and its giant baobab trees.",
      "The day usually includes snorkelling and a seafood lunch on the island. The exact route depends on tides and conditions.",
    ],
    categorySlug: "sea-islands",
    destinationSlug: "menai-bay-kizimkazi",
    duration: "Full day",
    highlights: [
      "Kwale Island mangrove lagoon",
      "Giant baobab trees",
      "Sandbank stop",
      "Seafood lunch",
    ],
    included: ["Boat trip", "Lunch", "Snorkelling equipment", "Guide"],
    excluded: [
      ...standardExclusions,
      "Transfers (available on request)",
      "Conservation area fee (if not stated as included)",
    ],
    whatToBring: ["Swimwear and towel", "Sun protection and hat", "Water shoes"],
    meetingPoint: "Departure from the Fumba area. Transfer options confirmed on booking.",
    difficulty: "easy",
    suitability: "Suitable for families. Long day in the sun.",
    coverImage: {
      src: "/images/photos/baobab.jpg",
      alt: "Large baobab tree spreading its branches against the sky",
      theme: "forest",
    },
    gallery: [],
    prices: illustrativePrices({ adult: 65, child: 35 }, { adult: 110000, child: 60000 }),
    featured: false,
    status: "published",
    seo: {
      title: "Kwale Island & Menai Bay Day Trip",
      description:
        "Full-day boat trip to Kwale Island, a sandbank and Menai Bay with lunch.",
    },
    isSample: true,
  },
  {
    slug: "the-rock-michamvi-sunset",
    name: "The Rock & Michamvi Sunset",
    shortDescription:
      "Visit the famous restaurant on a rock in the sea, then watch the sunset from the Michamvi peninsula.",
    description: [
      "Spend an afternoon on the south-east coast. See The Rock, a restaurant perched on a rock in the sea at Michamvi Pingwe that is reached on foot at low tide or by boat at high tide.",
      "Continue to the west side of the Michamvi peninsula, one of the few places on the east coast where you can watch the sun set over the water.",
    ],
    categorySlug: "beach-leisure",
    destinationSlug: "south-east-coast",
    duration: "Half day (afternoon and sunset)",
    highlights: [
      "The Rock restaurant in the sea",
      "Michamvi peninsula",
      "Sunset over the water",
      "South-east coast beaches",
    ],
    included: ["Return transfer", "Driver-guide"],
    excluded: [
      ...standardExclusions,
      "Meals at The Rock (reservations are recommended and not guaranteed)",
    ],
    whatToBring: ["Camera", "Light jacket for the evening", "Cash or card for meals"],
    meetingPoint:
      "Hotel pickup on the south or east coast. Exact time confirmed on booking.",
    difficulty: "easy",
    suitability: "Suitable for everyone, especially couples.",
    coverImage: {
      src: "/images/photos/therock.jpg",
      alt: "The Rock restaurant on its coral outcrop off Michamvi beach",
      theme: "sunset",
    },
    gallery: [],
    prices: illustrativePrices({ adult: 40, child: 20 }, { adult: 60000, child: 30000 }),
    featured: false,
    status: "published",
    seo: {
      title: "The Rock & Michamvi Sunset Tour",
      description:
        "Visit The Rock restaurant and watch the sunset from Michamvi, Zanzibar.",
    },
    isSample: true,
  },
  {
    slug: "ngorongoro-crater-day-safari",
    name: "Ngorongoro Crater Day Safari from Zanzibar",
    shortDescription:
      "Fly from Zanzibar to the mainland for a game drive on the floor of the Ngorongoro Crater.",
    description: [
      "The Ngorongoro Crater is a vast volcanic caldera and one of Tanzania's best-known wildlife areas. A day trip from Zanzibar combines flights and road transfers with a game drive on the crater floor.",
      "It is a long day with an early start. Flights and timings depend on availability and are confirmed when booking.",
    ],
    categorySlug: "safari",
    destinationSlug: "serengeti-ngorongoro",
    duration: "Full day (early start, late return)",
    highlights: [
      "Game drive on the crater floor",
      "Views from the crater rim",
      "Flight from Zanzibar",
      "Picnic lunch",
    ],
    included: [
      "Return flights (subject to availability)",
      "Game drive with guide",
      "Lunch",
      "Conservation fees",
    ],
    excluded: [...standardExclusions, "Airport transfers in Zanzibar (on request)"],
    whatToBring: [
      "Passport or ID for the flight",
      "Warm layer (the rim can be cool)",
      "Hat and sunglasses",
      "Camera",
    ],
    meetingPoint: "Zanzibar airport. Times depend on flight schedules.",
    difficulty: "moderate",
    suitability:
      "Long day with flights and driving. Wildlife sightings cannot be guaranteed.",
    coverImage: {
      src: "/images/photos/zebras.jpg",
      alt: "Zebras grazing in the Ngorongoro Crater under shafts of light",
      theme: "savanna",
    },
    gallery: [
      {
        src: "/images/photos/ngorongoro.jpg",
        alt: "Red dirt road and acacia tree in the Ngorongoro highlands",
        theme: "savanna",
      },
      {
        src: "/images/photos/hippos.jpg",
        alt: "Hippos resting in a pool in the Ngorongoro Crater",
        theme: "savanna",
      },
    ],
    prices: illustrativePrices(
      { adult: 750, child: 600 },
      { adult: 1800000, child: 1450000 },
    ),
    featured: false,
    status: "published",
    seo: {
      title: "Ngorongoro Crater Day Safari from Zanzibar",
      description: "Fly-in day safari to the Ngorongoro Crater from Zanzibar.",
    },
    isSample: true,
  },
  {
    slug: "nyerere-selous-day-safari",
    name: "Nyerere (Selous) Day Safari from Zanzibar",
    shortDescription:
      "A fly-in day safari to Nyerere National Park, with a game drive and an optional boat safari.",
    description: [
      "Nyerere National Park, formerly part of the Selous Game Reserve, is one of Africa's largest protected areas. Its rivers and lakes make it known for boat safaris as well as game drives.",
      "Fly from Zanzibar for a day of wildlife viewing, then return in the late afternoon. Flights and activities depend on availability and season.",
    ],
    categorySlug: "safari",
    destinationSlug: "nyerere",
    duration: "Full day (early start, late return)",
    highlights: [
      "Game drive in Nyerere National Park",
      "Optional boat safari on the river",
      "Short flight from Zanzibar",
      "Lunch in the park",
    ],
    included: [
      "Return flights (subject to availability)",
      "Game drive with guide",
      "Lunch",
      "Park fees",
    ],
    excluded: [
      ...standardExclusions,
      "Boat safari (optional extra, where available)",
      "Airport transfers in Zanzibar (on request)",
    ],
    whatToBring: [
      "Passport or ID for the flight",
      "Neutral-coloured clothing",
      "Hat and sunglasses",
      "Insect repellent",
    ],
    meetingPoint: "Zanzibar airport. Times depend on flight schedules.",
    difficulty: "moderate",
    suitability:
      "Long day with flights and driving. Wildlife sightings cannot be guaranteed.",
    coverImage: {
      src: "/images/photos/selous-elephant.jpg",
      alt: "African elephant in Nyerere National Park",
      theme: "savanna",
    },
    gallery: [
      {
        src: "/images/photos/selous-giraffe.jpg",
        alt: "Young giraffe among the trees in Nyerere National Park",
        theme: "savanna",
      },
    ],
    prices: illustrativePrices(
      { adult: 600, child: 480 },
      { adult: 1450000, child: 1150000 },
    ),
    featured: false,
    status: "published",
    seo: {
      title: "Nyerere (Selous) Day Safari from Zanzibar",
      description: "Fly-in day safari to Nyerere National Park (Selous) from Zanzibar.",
    },
    isSample: true,
  },

  {
    slug: "pungume-island-sandbank",
    name: "Pungume Island & Sandbank Tour",
    shortDescription:
      "A boat day in Menai Bay to Pungume Island and its sandbank, with snorkelling and a seafood lunch.",
    description: [
      "Pungume is a small island in the Menai Bay Conservation Area, off Zanzibar's south-west coast. It is surrounded by clear water, reefs and a sandbank that appears with the tide.",
      "Spend the day swimming, snorkelling and relaxing on the sand, with a seafood lunch. Dolphins are sometimes seen on the way, but sightings can't be guaranteed.",
    ],
    categorySlug: "sea-islands",
    destinationSlug: "menai-bay-kizimkazi",
    duration: "Full day",
    highlights: [
      "Pungume Island",
      "Sandbank swim",
      "Snorkelling on the reef",
      "Seafood lunch",
    ],
    included: ["Boat trip", "Snorkelling equipment", "Lunch", "Guide"],
    excluded: [
      ...standardExclusions,
      "Transfers (available on request)",
      "Conservation area fee (if not stated as included)",
    ],
    whatToBring: [
      "Swimwear and towel",
      "Reef-safe sunscreen and hat",
      "Water shoes",
      "Waterproof bag",
    ],
    meetingPoint:
      "Departure from the south-west coast (Fumba or Kizimkazi area). Transfer options confirmed on booking.",
    difficulty: "easy",
    suitability: "Suitable for families. Long day on the water and in the sun.",
    coverImage: {
      src: "/images/tours/pungume-sandbank.jpg",
      alt: "A curved white sandbank in turquoise water, with boats moored nearby",
      theme: "ocean",
    },
    gallery: [],
    prices: illustrativePrices({ adult: 70, child: 40 }, { adult: 120000, child: 70000 }),
    featured: false,
    status: "published",
    seo: {
      title: "Pungume Island & Sandbank Tour",
      description:
        "Full-day boat trip to Pungume Island and its sandbank in Menai Bay, Zanzibar.",
    },
    isSample: true,
  },
  {
    slug: "jet-ski-experience",
    name: "Jet Ski Experience",
    shortDescription:
      "Ride a jet ski along Zanzibar's north coast, with a safety briefing and an instructor nearby.",
    description: [
      "Feel the speed on the turquoise water off Nungwi and Kendwa. After a safety briefing, take a jet ski out along the coast within a safe riding area, with an instructor nearby the whole time.",
      "Choose the length of your ride when you book. Rides depend on sea conditions and safety checks on the day.",
    ],
    categorySlug: "adventure",
    destinationSlug: "nungwi-kendwa",
    duration: "Approx. 30–60 minutes (as booked)",
    highlights: [
      "Jet ski ride on turquoise water",
      "Views of the Nungwi and Kendwa beaches",
      "Safety briefing before you ride",
      "Instructor nearby throughout",
    ],
    included: [
      "Jet ski session (time as booked)",
      "Life jacket and safety equipment",
      "Safety briefing",
      "Instructor supervision",
    ],
    excluded: [
      ...standardExclusions,
      "Transfers (available on request)",
      "Photos and videos",
    ],
    whatToBring: [
      "Swimwear",
      "Sun protection",
      "A change of clothes",
      "Strap for sunglasses",
    ],
    meetingPoint:
      "Water sports centre on Nungwi or Kendwa beach. Exact place and time confirmed on booking.",
    difficulty: "moderate",
    suitability:
      "Age and health requirements apply for drivers — we'll confirm them when you book.",
    coverImage: {
      src: "/images/tours/jet-ski.jpg",
      alt: "Two riders on a yellow jet ski near a beach lined with traditional boats",
      theme: "ocean",
    },
    gallery: [],
    prices: illustrativePrices(
      { adult: 60, child: null },
      { adult: 110000, child: null },
    ),
    featured: false,
    status: "published",
    seo: {
      title: "Jet Ski Experience in Zanzibar",
      description:
        "Jet ski rides on Zanzibar's northern coast at Nungwi and Kendwa, with a safety briefing and instructor.",
    },
    isSample: true,
  },
  {
    slug: "parasailing-experience",
    name: "Parasailing Experience",
    shortDescription:
      "Fly high above the turquoise water on a parasail towed by a boat — no experience needed.",
    description: [
      "See Zanzibar's north coast from the sky. A boat takes you out from the beach, you're clipped into the harness, and the parasail lifts you gently into the air for a bird's-eye view of the beaches and the reef below.",
      "Fly on your own or as a tandem with a friend or partner. Flights depend on wind, sea conditions and safety checks on the day.",
    ],
    categorySlug: "adventure",
    destinationSlug: "nungwi-kendwa",
    duration: "Approx. 1 hour including the boat trip",
    highlights: [
      "Parasailing flight over the ocean",
      "Bird's-eye view of the beaches and reef",
      "Solo or tandem flights",
      "No experience needed",
    ],
    included: [
      "Boat trip to the launch area",
      "Parasailing flight (solo or tandem)",
      "Harness, life jacket and safety equipment",
      "Crew and safety briefing",
    ],
    excluded: [
      ...standardExclusions,
      "Transfers (available on request)",
      "Photos and videos",
    ],
    whatToBring: [
      "Swimwear or light clothes that can get wet",
      "Sun protection",
      "Strap for sunglasses",
      "A change of clothes",
    ],
    meetingPoint:
      "Water sports centre on Nungwi or Kendwa beach. Exact place and time confirmed on booking.",
    difficulty: "easy",
    suitability:
      "No experience needed. Age, weight and health requirements apply — we'll confirm them when you book.",
    coverImage: {
      src: "/images/photos/parasailing.jpg",
      alt: "Two people parasailing above turquoise water with the tow boat below",
      theme: "ocean",
    },
    gallery: [
      {
        src: "/images/photos/parasailing-aerial.jpg",
        alt: "Aerial view of a boat towing a parasail across deep blue sea",
        theme: "ocean",
      },
    ],
    prices: illustrativePrices(
      { adult: 70, child: null },
      { adult: 130000, child: null },
    ),
    featured: false,
    status: "published",
    seo: {
      title: "Parasailing in Zanzibar",
      description:
        "Parasailing flights over the turquoise water off Nungwi and Kendwa — solo or tandem, no experience needed.",
    },
    isSample: true,
  },
  {
    slug: "salaam-cave-experience",
    name: "Salaam Cave Experience",
    shortDescription:
      "Swim in a natural cave pool in Kizimkazi, home to sea turtles, with a local guide.",
    description: [
      "Salaam Cave, in the Kizimkazi area on Zanzibar's south coast, is a natural limestone cave with a pool of clear water where sea turtles are cared for.",
      "With a local guide, step down into the cave, learn about the turtles and the site, and swim in the cool pool. It combines well with dolphin watching or Jozani Forest.",
    ],
    categorySlug: "nature-wildlife",
    destinationSlug: "menai-bay-kizimkazi",
    duration: "Approx. 1–2 hours (plus travel)",
    highlights: [
      "Natural cave pool",
      "Sea turtles",
      "Swim in cool, clear water",
      "Easy to combine with Kizimkazi",
    ],
    included: ["Local guide", "Transfers within the Kizimkazi area"],
    excluded: [...standardExclusions, "Cave entrance fee (if not stated as included)"],
    whatToBring: ["Swimwear and towel", "Water shoes", "Camera"],
    meetingPoint:
      "Kizimkazi, or hotel pickup on request. Exact time confirmed on booking.",
    difficulty: "easy",
    suitability: "Suitable for families. The cave has steps and can be slippery.",
    coverImage: {
      src: "/images/tours/salaam-cave.jpg",
      alt: "Visitors with sea turtles in the clear water of Salaam Cave",
      theme: "ocean",
    },
    gallery: [],
    prices: illustrativePrices({ adult: 35, child: 20 }, { adult: 55000, child: 30000 }),
    featured: false,
    status: "published",
    seo: {
      title: "Salaam Cave Experience, Kizimkazi",
      description:
        "Swim in the Salaam Cave pool with sea turtles in Kizimkazi, Zanzibar.",
    },
    isSample: true,
  },
  {
    slug: "horse-riding-swimming",
    name: "Horse Riding & Swimming Experience",
    shortDescription:
      "Ride along a white-sand beach and, tide permitting, swim with the horses in the warm sea.",
    description: [
      "Ride along Zanzibar's beaches with an experienced local guide. Rides are matched to your level, from first-timers to confident riders.",
      "When the tide and conditions allow, you can ride into the shallow water and swim with the horses — an unforgettable experience. Sunrise and late-afternoon rides are especially beautiful.",
    ],
    categorySlug: "adventure",
    destinationSlug: "nungwi-kendwa",
    duration: "Approx. 1–2 hours",
    highlights: [
      "Beach ride along white sand",
      "Swim with the horses (tide permitting)",
      "Rides for beginners and experienced riders",
      "Sunrise or sunset options",
    ],
    included: ["Horse and guide", "Helmet and safety briefing"],
    excluded: [
      ...standardExclusions,
      "Transfers (available on request)",
      "Photos and videos",
    ],
    whatToBring: [
      "Long, comfortable trousers or leggings",
      "Closed shoes or sandals with a strap",
      "Swimwear underneath",
      "Sun protection",
    ],
    meetingPoint:
      "Stables on the north coast. Exact place and time (based on the tide) confirmed on booking.",
    difficulty: "moderate",
    suitability:
      "Beginners welcome. Age and weight limits apply — we'll confirm them when you book.",
    // Main and first gallery images supplied by the owner (2026-11-02); see
    // docs/PHOTO_CREDITS.md.
    coverImage: {
      src: "/images/tours/horse-riding-sea.jpg",
      alt: "A rider on a bay horse wading through clear turquoise water under a blue sky",
      theme: "ocean",
    },
    gallery: [
      {
        src: "/images/tours/horse-riding-beach.jpg",
        alt: "A group of riders on horseback crossing a white-sand beach beside turquoise water",
        theme: "sunset",
      },
      {
        src: "/images/photos/horse.jpg",
        alt: "Rider walking a white horse along a beach at dusk",
        theme: "sunset",
      },
    ],
    prices: illustrativePrices({ adult: 75, child: 55 }, { adult: 130000, child: 95000 }),
    featured: false,
    status: "published",
    seo: {
      title: "Horse Riding & Swimming in Zanzibar",
      description:
        "Beach horse riding and swimming with horses in Zanzibar, for beginners and experienced riders.",
    },
    isSample: true,
  },
];
