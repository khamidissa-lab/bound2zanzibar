import type { Destination } from "@/types/content";

/*
 * Safari park content (2026-11-07). General, widely published facts about
 * each park — no lodge names, no promised sightings, no prices. The seven new
 * parks are DRAFTS for the owner to review and publish in the admin.
 */

type ParkDetails = Pick<Destination, "wildlife" | "bestTime">;

/** Wildlife and timing for the parks that already have pages. */
export const existingParkDetails: Record<string, ParkDetails> = {
  mikumi: {
    wildlife: ["Elephant", "Lion", "Giraffe", "Zebra", "Buffalo", "Wildebeest", "Hippo"],
    bestTime:
      "Game viewing is usually easiest in the dry season, roughly June to October, when animals gather near water. The park is open all year.",
  },
  "serengeti-ngorongoro": {
    wildlife: [
      "Wildebeest and zebra (the migration)",
      "Lion",
      "Leopard",
      "Cheetah",
      "Elephant",
      "Buffalo",
      "Giraffe",
      "Hippo",
    ],
    bestTime:
      "Good all year. The migration moves with the rains: the herds are often in the southern Serengeti for calving early in the year and further north in the middle of the year. Tell us your dates and we'll suggest where to go.",
  },
  nyerere: {
    wildlife: [
      "Elephant",
      "Hippo",
      "Crocodile",
      "Giraffe",
      "Lion",
      "Buffalo",
      "Wild dog",
    ],
    bestTime:
      "The dry season, roughly June to October, is the most popular time for game drives and boat safaris. Some areas can be hard to reach in the heaviest rains.",
  },
};

const draft = {
  region: "mainland",
  featured: false,
  status: "draft",
  isSample: true,
} as const;

/** Parks without a page yet, created as drafts for the owner to review. */
export const newParks: Destination[] = [
  {
    ...draft,
    slug: "ngorongoro-crater",
    name: "Ngorongoro Crater",
    summary: "A vast volcanic caldera with wildlife on its grassy floor.",
    description: [
      "The Ngorongoro Crater is part of the Ngorongoro Conservation Area in northern Tanzania, a UNESCO World Heritage Site. The crater is a huge, unbroken volcanic caldera whose floor holds grassland, swamps and a soda lake.",
      "Game drives descend to the crater floor for the day. Visits are usually combined with the Serengeti, Tarangire or Lake Manyara on a northern-circuit safari.",
    ],
    highlights: [
      "Game drives on the crater floor",
      "Views from the crater rim",
      "Soda lake and swamps",
    ],
    wildlife: [
      "Lion",
      "Elephant",
      "Buffalo",
      "Zebra",
      "Wildebeest",
      "Hippo",
      "Flamingo",
      "Black rhino (rarely seen)",
    ],
    bestTime:
      "Wildlife lives in the crater all year, so you can visit in any season. The dry months, roughly June to October, are the most popular.",
    coverImage: {
      src: "/images/photos/ngorongoro.jpg",
      alt: "Plains on the floor of the Ngorongoro Crater with the crater wall behind",
      theme: "savanna",
    },
    seo: {
      title: "Ngorongoro Crater, Tanzania",
      description:
        "Safaris to the Ngorongoro Crater, combined with the northern parks and Zanzibar.",
    },
  },
  {
    ...draft,
    slug: "tarangire",
    name: "Tarangire National Park",
    summary: "Baobab-studded country known for its elephant herds.",
    description: [
      "Tarangire National Park lies in northern Tanzania, named after the Tarangire River that runs through it. Ancient baobab trees dot the landscape.",
      "In the dry season the river draws wildlife from the surrounding area, and the park is known for its large elephant herds. It is often combined with Lake Manyara, Ngorongoro and the Serengeti.",
    ],
    highlights: [
      "Large elephant herds",
      "Baobab trees",
      "The Tarangire River",
      "Rich birdlife",
    ],
    wildlife: [
      "Elephant",
      "Giraffe",
      "Zebra",
      "Wildebeest",
      "Buffalo",
      "Lion",
      "Many bird species",
    ],
    bestTime:
      "The dry season, roughly June to October, is the best time for game viewing, when animals gather along the river.",
    coverImage: {
      src: "/images/photos/baobab.jpg",
      alt: "A large baobab tree in the Tanzanian bush",
      theme: "savanna",
    },
    seo: {
      title: "Tarangire National Park, Tanzania",
      description: "Safaris to Tarangire National Park, known for elephants and baobabs.",
    },
  },
  {
    ...draft,
    slug: "lake-manyara",
    name: "Lake Manyara National Park",
    summary:
      "A lake at the foot of the Rift Valley escarpment, with forest and birdlife.",
    description: [
      "Lake Manyara National Park sits at the base of the Great Rift Valley escarpment in northern Tanzania. Groundwater forest, open grassland and a shallow alkaline lake make for varied scenery in a compact park.",
      "It fits easily into a northern-circuit safari alongside Tarangire and Ngorongoro.",
    ],
    highlights: [
      "Rift Valley escarpment",
      "Groundwater forest",
      "Alkaline lake and birdlife",
      "Compact, varied park",
    ],
    wildlife: [
      "Elephant",
      "Baboon",
      "Giraffe",
      "Buffalo",
      "Hippo",
      "Flamingo (seasonal)",
      "Lion (known to climb trees here, rarely seen)",
    ],
    bestTime:
      "The dry season, roughly June to October, is best for game viewing. The wetter months bring more water birds.",
    coverImage: {
      src: "/images/safari/manyara.jpg",
      alt: "An elephant among acacia trees in Lake Manyara National Park",
      theme: "savanna",
    },
    seo: {
      title: "Lake Manyara National Park, Tanzania",
      description:
        "Safaris to Lake Manyara National Park on Tanzania's northern circuit.",
    },
  },
  {
    ...draft,
    slug: "arusha-national-park",
    name: "Arusha National Park",
    summary: "Mount Meru, forest and lakes, close to Arusha town.",
    description: [
      "Arusha National Park is close to Arusha town in northern Tanzania. It covers the slopes of Mount Meru, the Ngurdoto Crater and the Momella Lakes.",
      "Its forests and lakes make a contrast to the open plains of other parks, and its location makes it a convenient start or end to a northern-circuit safari.",
    ],
    highlights: ["Mount Meru", "Momella Lakes", "Ngurdoto Crater", "Forest scenery"],
    wildlife: [
      "Giraffe",
      "Buffalo",
      "Zebra",
      "Black-and-white colobus monkey",
      "Flamingo (seasonal)",
      "Many bird species",
    ],
    bestTime:
      "The park can be visited all year. The drier months, roughly June to February, usually make trails and roads easier.",
    coverImage: {
      src: "/images/safari/arusha.jpg",
      alt: "Sunrise over Kilimanjaro, seen from the slopes of Mount Meru",
      theme: "sunset",
    },
    seo: {
      title: "Arusha National Park, Tanzania",
      description: "Visits to Arusha National Park and Mount Meru in northern Tanzania.",
    },
  },
  {
    ...draft,
    slug: "ruaha",
    name: "Ruaha National Park",
    summary: "A large, remote park in central Tanzania along the Great Ruaha River.",
    description: [
      "Ruaha National Park is one of Tanzania's largest national parks, in the centre of the country. The Great Ruaha River runs along its eastern side.",
      "It is remote and receives fewer visitors than the northern parks. It is known for elephants and predators, and is part of the southern circuit with Mikumi and Nyerere.",
    ],
    highlights: ["The Great Ruaha River", "Remote wilderness", "Southern circuit"],
    wildlife: [
      "Elephant",
      "Lion",
      "Leopard",
      "Buffalo",
      "Giraffe",
      "Greater kudu",
      "Wild dog (rarely seen)",
    ],
    bestTime:
      "The dry season, roughly June to October, is best, when animals gather near the river.",
    coverImage: {
      src: "/images/safari/ruaha.jpg",
      alt: "A lion resting in the grass in Ruaha National Park",
      theme: "savanna",
    },
    seo: {
      title: "Ruaha National Park, Tanzania",
      description: "Safaris to Ruaha National Park in central Tanzania.",
    },
  },
  {
    ...draft,
    slug: "gombe-stream",
    name: "Gombe Stream National Park",
    summary: "Forest on the shore of Lake Tanganyika, home to wild chimpanzees.",
    description: [
      "Gombe Stream National Park lies on the shore of Lake Tanganyika in western Tanzania, near Kigoma. It is one of the country's smallest national parks.",
      "Chimpanzee research began here in 1960 with Jane Goodall. Visitors trek through the forest with a park guide, and the park is usually reached by boat from Kigoma.",
    ],
    highlights: ["Chimpanzee trekking", "Lake Tanganyika shore", "Forest trails"],
    wildlife: [
      "Chimpanzee",
      "Olive baboon",
      "Red colobus monkey",
      "Red-tailed monkey",
      "Forest birds",
    ],
    bestTime:
      "Treks run all year. The drier months, roughly July to October, make trails easier, though the chimpanzees' whereabouts change from day to day.",
    coverImage: {
      src: "/images/safari/gombe.jpg",
      alt: "A wild chimpanzee sitting on a fallen tree in the forest",
      theme: "forest",
    },
    seo: {
      title: "Gombe Stream National Park, Tanzania",
      description:
        "Chimpanzee trekking at Gombe Stream National Park on Lake Tanganyika.",
    },
  },
  {
    ...draft,
    slug: "mahale-mountains",
    name: "Mahale Mountains National Park",
    summary: "Remote, forested mountains on Lake Tanganyika, home to wild chimpanzees.",
    description: [
      "Mahale Mountains National Park rises from the shore of Lake Tanganyika in western Tanzania. It is very remote and is usually reached by light aircraft and boat.",
      "Visitors trek through the forest with a park guide to find the chimpanzees, and there are white-sand beaches along the lake.",
    ],
    highlights: ["Chimpanzee trekking", "Forested mountains", "Lake Tanganyika beaches"],
    wildlife: ["Chimpanzee", "Red colobus monkey", "Blue monkey", "Forest birds"],
    bestTime:
      "The drier months, roughly July to October, are the usual time to visit. Some lodges and flights operate only part of the year, so check when you plan.",
    coverImage: {
      src: "/images/safari/mahale.jpg",
      alt: "A chimpanzee mother and baby in the forest of Mahale Mountains National Park (black and white)",
      theme: "forest",
    },
    seo: {
      title: "Mahale Mountains National Park, Tanzania",
      description: "Chimpanzee trekking in the Mahale Mountains on Lake Tanganyika.",
    },
  },
];

/** Park safari tours and the park page each belongs to. */
export const parkTourDestinations: Record<string, string> = {
  "tarangire-national-park-safari": "tarangire",
  "lake-manyara-national-park-safari": "lake-manyara",
  "arusha-national-park-safari": "arusha-national-park",
  "ruaha-national-park-safari": "ruaha",
  "gombe-stream-national-park": "gombe-stream",
  "mahale-mountains-national-park": "mahale-mountains",
};
