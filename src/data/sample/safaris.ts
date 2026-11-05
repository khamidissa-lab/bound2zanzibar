import type { Tour } from "@/types/content";

import { standardExclusions, type TourBase } from "./shared";

/*
 * Mainland safaris from the owner's list (2026-11-04). Names and one-line
 * descriptions are the owner's; length, inclusions and prices are not known
 * yet, so there are no prices ("Price on request") and nothing is promised
 * beyond what the owner wrote. Replace with real details in the admin.
 */

type Details = Pick<Tour, "whatToExpect" | "goodToKnow" | "faqs">;

const safariKit = [
  "Neutral-coloured, comfortable clothing",
  "Hat, sunglasses and sunscreen",
  "Binoculars and camera",
  "Passport for domestic flights",
];

const planStep = {
  title: "Plan your safari",
  description:
    "Tell us your dates, group size and budget. We suggest an itinerary and send you a quote.",
};

const tailored =
  "Length, itinerary and price are tailored to you and confirmed in your quote.";
const noGuarantee = "Wildlife sightings cannot be guaranteed.";

const howLongFaq = {
  question: "How many days do I need?",
  answer:
    "It depends on your plans and the other parks you visit. We'll recommend a length when you enquire.",
};

/** Shared fields for a multi-day park safari with price on request. */
function safari(
  fields: Pick<
    TourBase,
    "slug" | "name" | "shortDescription" | "description" | "highlights" | "coverImage"
  > &
    Partial<TourBase>,
): TourBase {
  return {
    categorySlug: "safari",
    destinationSlug: "",
    duration: "Multi-day — tailored to your plans",
    included: [],
    excluded: standardExclusions,
    whatToBring: safariKit,
    meetingPoint:
      "Arranged when you book, depending on where your trip starts (Zanzibar or the mainland).",
    difficulty: "moderate",
    suitability: `Involves long drives on rough roads. ${noGuarantee}`,
    gallery: [],
    prices: [],
    featured: false,
    status: "published",
    seo: {
      title: fields.name,
      description: fields.shortDescription,
    },
    isSample: true,
    ...fields,
  };
}

export const safariTours: TourBase[] = [
  safari({
    slug: "serengeti-national-park-safari",
    name: "Serengeti National Park Safari",
    shortDescription:
      "Experience the Big Five, vast savannah plains and the Great Wildebeest Migration.",
    description: [
      "Experience the Big Five, vast savannah plains and the Great Wildebeest Migration in Tanzania's best-known national park.",
      "Combine the Serengeti with Ngorongoro and other northern parks, or with time on Zanzibar's beaches.",
    ],
    destinationSlug: "serengeti-ngorongoro",
    highlights: [
      "The Big Five",
      "Vast savannah plains",
      "The Great Wildebeest Migration (seasonal)",
    ],
    coverImage: {
      src: "/hero/serengeti-elephant-family.jpg",
      alt: "A family of elephants walking across the Serengeti grassland",
      theme: "savanna",
    },
  }),
  safari({
    slug: "tarangire-national-park-safari",
    name: "Tarangire National Park Safari",
    shortDescription:
      "Discover large elephant herds, ancient baobab trees and diverse wildlife.",
    description: [
      "Discover large elephant herds, ancient baobab trees and diverse wildlife in Tarangire National Park.",
      "Tarangire is part of Tanzania's northern circuit and is often combined with Lake Manyara, Ngorongoro and the Serengeti.",
    ],
    highlights: ["Large elephant herds", "Ancient baobab trees", "Diverse wildlife"],
    coverImage: {
      src: "/images/photos/baobab.jpg",
      alt: "A large baobab tree in the Tanzanian bush",
      theme: "savanna",
    },
  }),
  safari({
    slug: "lake-manyara-national-park-safari",
    name: "Lake Manyara National Park Safari",
    shortDescription:
      "Experience beautiful landscapes, flamingos, elephants and tree-climbing lions.",
    description: [
      "Experience beautiful landscapes, flamingos, elephants and tree-climbing lions at Lake Manyara National Park.",
      "Lake Manyara is part of Tanzania's northern circuit and fits easily alongside Tarangire and Ngorongoro.",
    ],
    highlights: ["Beautiful landscapes", "Flamingos", "Elephants", "Tree-climbing lions"],
    coverImage: {
      src: "/images/safari/manyara.jpg",
      alt: "An elephant among acacia trees in Lake Manyara National Park",
      theme: "savanna",
    },
  }),
  safari({
    slug: "arusha-national-park-safari",
    name: "Arusha National Park Safari",
    shortDescription:
      "Explore Mount Meru, beautiful forests, lakes and diverse wildlife.",
    description: [
      "Explore Mount Meru, beautiful forests, lakes and diverse wildlife in Arusha National Park.",
      "The park is close to Arusha town, making it a convenient start or end to a northern-circuit safari.",
    ],
    highlights: ["Mount Meru", "Beautiful forests", "Lakes", "Diverse wildlife"],
    coverImage: {
      src: "/images/safari/arusha.jpg",
      alt: "Sunrise over Kilimanjaro, seen from the slopes of Mount Meru",
      theme: "sunset",
    },
  }),
  safari({
    slug: "ruaha-national-park-safari",
    name: "Ruaha National Park Safari",
    shortDescription:
      "Discover Tanzania's wilderness, famous for elephants, lions and spectacular landscapes.",
    description: [
      "Discover Tanzania's wilderness in Ruaha National Park, famous for elephants, lions and spectacular landscapes.",
      "Ruaha is part of the southern circuit, with Mikumi and Nyerere.",
    ],
    highlights: ["Elephants", "Lions", "Spectacular landscapes"],
    coverImage: {
      src: "/images/safari/ruaha.jpg",
      alt: "A lion resting in the grass in Ruaha National Park",
      theme: "savanna",
    },
  }),
  safari({
    slug: "gombe-stream-national-park",
    name: "Gombe Stream National Park",
    shortDescription:
      "Experience chimpanzee trekking in the forests along Lake Tanganyika.",
    description: [
      "Experience chimpanzee trekking in the forests along Lake Tanganyika at Gombe Stream National Park.",
      "Gombe is in western Tanzania. It is remote, so travel time is part of the plan.",
    ],
    highlights: ["Chimpanzee trekking", "Forests along Lake Tanganyika"],
    difficulty: "challenging",
    suitability: "Trekking on steep, forested trails. Sightings cannot be guaranteed.",
    coverImage: {
      src: "/images/safari/gombe.jpg",
      alt: "A wild chimpanzee sitting on a fallen tree in the forest",
      theme: "forest",
    },
  }),
  safari({
    slug: "mahale-mountains-national-park",
    name: "Mahale Mountains National Park",
    shortDescription:
      "Discover wild chimpanzees, tropical forests and beautiful Lake Tanganyika.",
    description: [
      "Discover wild chimpanzees, tropical forests and beautiful Lake Tanganyika at Mahale Mountains National Park.",
      "Mahale is in western Tanzania. It is remote, so travel time is part of the plan.",
    ],
    highlights: ["Wild chimpanzees", "Tropical forests", "Lake Tanganyika"],
    difficulty: "challenging",
    suitability: "Trekking on steep, forested trails. Sightings cannot be guaranteed.",
    coverImage: {
      src: "/images/safari/mahale.jpg",
      alt: "A chimpanzee mother and baby in the forest of Mahale Mountains National Park (black and white)",
      theme: "forest",
    },
  }),
  safari({
    slug: "great-wildebeest-migration-safari",
    name: "Great Wildebeest Migration Safari",
    shortDescription:
      "Witness the spectacular annual migration of wildebeest and zebras across the Serengeti ecosystem.",
    description: [
      "Witness the spectacular annual migration of wildebeest and zebras across the Serengeti ecosystem.",
      "The herds move through the year, so where you stay depends on when you travel. We'll suggest dates and areas when you enquire.",
    ],
    destinationSlug: "serengeti-ngorongoro",
    duration: "Multi-day — timed to the season",
    highlights: ["The annual wildebeest and zebra migration", "The Serengeti ecosystem"],
    coverImage: {
      src: "/images/safari/migration.jpg",
      alt: "Wildebeest herds crossing the Mara River in Serengeti National Park",
      theme: "savanna",
    },
  }),
  safari({
    slug: "hot-air-balloon-safari-serengeti",
    name: "Hot Air Balloon Safari – Serengeti",
    shortDescription:
      "Enjoy breathtaking aerial views of wildlife and the African savannah.",
    description: [
      "Enjoy breathtaking aerial views of wildlife and the African savannah from a hot air balloon over the Serengeti.",
      "Balloon flights are an add-on to a Serengeti safari and depend on the weather on the day.",
    ],
    destinationSlug: "serengeti-ngorongoro",
    duration: "Early-morning flight, added to a Serengeti safari",
    highlights: ["Aerial views of wildlife", "The African savannah from above"],
    difficulty: "easy",
    suitability: "Age and health requirements apply — we'll confirm them when you book.",
    coverImage: {
      src: "/images/safari/balloon.jpg",
      alt: "A hot air balloon above the Serengeti plains",
      theme: "savanna",
    },
  }),
];

const gameDrives: Details = {
  whatToExpect: [
    planStep,
    {
      title: "Travel to the park",
      description: "By road or a short flight, depending on your itinerary.",
    },
    {
      title: "Game drives",
      description: "Explore the park with a driver-guide in a safari vehicle.",
    },
  ],
  goodToKnow: [tailored, noGuarantee],
  faqs: [howLongFaq],
};

const chimpTrek: Details = {
  whatToExpect: [
    planStep,
    {
      title: "Travel to western Tanzania",
      description: "The parks are remote; travel is arranged as part of your plan.",
    },
    {
      title: "Chimpanzee trekking",
      description: "Walk through the forest with a park guide to find the chimpanzees.",
    },
  ],
  goodToKnow: [tailored, "Chimpanzee sightings cannot be guaranteed."],
  faqs: [howLongFaq],
};

export const safariDetails: Record<string, Details> = {
  "serengeti-national-park-safari": gameDrives,
  "tarangire-national-park-safari": gameDrives,
  "lake-manyara-national-park-safari": gameDrives,
  "arusha-national-park-safari": gameDrives,
  "ruaha-national-park-safari": gameDrives,
  "gombe-stream-national-park": chimpTrek,
  "mahale-mountains-national-park": chimpTrek,
  "great-wildebeest-migration-safari": {
    ...gameDrives,
    goodToKnow: [
      tailored,
      "The herds' location changes through the year, so dates matter.",
      noGuarantee,
    ],
    faqs: [
      {
        question: "When is the best time to see the migration?",
        answer:
          "It depends on what you want to see. Tell us when you can travel and we'll suggest where the herds are likely to be.",
      },
    ],
  },
  "hot-air-balloon-safari-serengeti": {
    whatToExpect: [
      {
        title: "Early start",
        description: "Pick-up from your Serengeti camp before sunrise.",
      },
      {
        title: "Balloon flight",
        description: "Float over the savannah as the sun comes up.",
      },
    ],
    goodToKnow: [
      "Flights depend on the weather and may be cancelled on the day.",
      tailored,
    ],
    faqs: [
      {
        question: "Can I book the balloon on its own?",
        answer:
          "It's added to a Serengeti safari. Tell us your plans and we'll include it in your quote.",
      },
    ],
  },
};
