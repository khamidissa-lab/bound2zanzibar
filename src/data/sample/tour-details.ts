import type { Tour } from "@/types/content";

type TourDetails = Pick<Tour, "whatToExpect" | "goodToKnow" | "faqs">;

/**
 * "More details" content for each sample tour, keyed by slug. Sample copy for
 * the owner to review: timings are approximate and nothing here is a
 * guarantee of availability, sightings or conditions.
 */
export const tourDetails: Record<string, TourDetails> = {
  "stone-town-city-tour": {
    whatToExpect: [
      {
        title: "Meet your guide",
        description: "Pickup from your Stone Town hotel or an agreed meeting point.",
      },
      {
        title: "The waterfront",
        description:
          "Start near the Old Fort and Forodhani Gardens, where the town meets the sea.",
      },
      {
        title: "Lanes and carved doors",
        description:
          "Walk the narrow streets, stopping at historic buildings and famous Zanzibari doors.",
      },
      {
        title: "Darajani market",
        description: "See the busy market for spices, fruit, fish and everyday goods.",
      },
      {
        title: "Former slave market",
        description:
          "Visit the memorial site and learn this painful part of the island's history.",
      },
      {
        title: "Finish",
        description:
          "End in the old town, or ask your guide for recommendations to keep exploring.",
      },
    ],
    goodToKnow: [
      "Mornings and late afternoons are cooler for walking.",
      "Clothing that covers shoulders and knees is respectful in town.",
      "Streets are narrow and uneven, which can be difficult for wheelchairs and pushchairs.",
      "Ask before photographing people, especially in the market.",
    ],
    faqs: [
      {
        question: "Is it suitable for children?",
        answer:
          "Yes. The pace is relaxed and the guide can adapt the route for families.",
      },
      {
        question: "Can I combine it with another tour?",
        answer:
          "Many travellers pair it with the Spice Farm Tour or a Prison Island trip on the same day. Ask our team.",
      },
    ],
  },
  "prison-island-tour": {
    whatToExpect: [
      {
        title: "Boat from Stone Town",
        description: "A short boat ride from the Stone Town shore to Changuu Island.",
      },
      {
        title: "Giant tortoises",
        description:
          "Meet the colony of giant Aldabra tortoises at the island's sanctuary.",
      },
      {
        title: "Island history",
        description:
          "See the historic buildings and hear how the island has been used over the years.",
      },
      {
        title: "Swim or snorkel",
        description: "Time permitting, cool off in the clear water around the island.",
      },
      { title: "Return", description: "Boat back to Stone Town." },
    ],
    goodToKnow: [
      "Boat trips depend on sea and weather conditions.",
      "The island charges an entrance fee — check whether it is included in your booking.",
      "Bring a waterproof bag for phones and cameras.",
    ],
    faqs: [
      {
        question: "How long is the boat ride?",
        answer: "Usually around 20–30 minutes each way, depending on conditions.",
      },
      {
        question: "Can I touch the tortoises?",
        answer: "Your guide explains how to interact with them gently and respectfully.",
      },
    ],
  },
  "spice-farm-tour": {
    whatToExpect: [
      {
        title: "Drive out of town",
        description:
          "Transfer from Stone Town to a working spice farm in the countryside.",
      },
      {
        title: "Guided farm walk",
        description:
          "See, smell and taste cloves, nutmeg, cinnamon, vanilla, pepper and more.",
      },
      {
        title: "Fruit tasting",
        description: "Try seasonal tropical fruits grown on the farm.",
      },
      {
        title: "Optional lunch",
        description: "Enjoy a Swahili meal cooked with local spices (optional extra).",
      },
      { title: "Return", description: "Transfer back to your accommodation." },
    ],
    goodToKnow: [
      "Spices and fruits on show vary with the season.",
      "Farm paths can be muddy after rain — wear closed shoes.",
      "Spices and oils are usually available to buy; bring some cash.",
    ],
    faqs: [
      {
        question: "Is it suitable for children?",
        answer:
          "Yes — it's a gentle walk and children usually enjoy guessing the spices.",
      },
      {
        question: "Can it be combined with Stone Town?",
        answer: "Yes, it's a popular half-day pairing with the Stone Town City Tour.",
      },
    ],
  },
  "jozani-forest-tour": {
    whatToExpect: [
      {
        title: "Drive to Jozani",
        description:
          "Transfer to Jozani Chwaka Bay National Park in the centre-south of the island.",
      },
      {
        title: "Forest walk",
        description:
          "Follow trails with a park guide to look for the Zanzibar red colobus monkey.",
      },
      {
        title: "Mangrove boardwalk",
        description:
          "Walk the raised boardwalk and learn why mangroves matter to the coast.",
      },
      {
        title: "Return or continue",
        description: "Head back, or combine with a south-coast activity.",
      },
    ],
    goodToKnow: [
      "Wildlife sightings cannot be guaranteed, though the colobus are often seen.",
      "Keep a respectful distance from the monkeys and never feed them.",
      "Insect repellent is recommended.",
    ],
    faqs: [
      {
        question: "Can I combine Jozani with another tour?",
        answer:
          "Yes. It pairs well with the Kizimkazi Dolphin Experience or Kuza Cave. Ask our team.",
      },
      {
        question: "How much walking is involved?",
        answer: "Easy trails, usually around an hour of gentle walking in total.",
      },
    ],
  },
  "mnemba-island-snorkelling": {
    whatToExpect: [
      {
        title: "Pickup and boat",
        description:
          "Transfer to the north-east coast and board the boat towards Mnemba Atoll.",
      },
      {
        title: "Snorkelling",
        description:
          "Snorkel over the reef with your guide. Marine life varies by day and season.",
      },
      {
        title: "Time on the water",
        description:
          "A break on the boat with drinking water and fruit (where included).",
      },
      {
        title: "Return",
        description: "Boat back to shore and transfer to your accommodation.",
      },
    ],
    goodToKnow: [
      "Mnemba Island itself is private; the trip visits the waters around the atoll.",
      "Trips depend on weather and sea conditions and may be rescheduled.",
      "Use reef-safe sunscreen and avoid touching or standing on coral.",
    ],
    faqs: [
      {
        question: "Do I need to be a strong swimmer?",
        answer:
          "You should be comfortable in open water. Life jackets are available on request.",
      },
      {
        question: "Will we see dolphins?",
        answer: "Sometimes, but sightings can't be guaranteed.",
      },
    ],
  },
  "safari-blue-menai-bay": {
    whatToExpect: [
      {
        title: "Set sail from Fumba",
        description: "Board a traditional dhow in Menai Bay.",
      },
      { title: "Sandbank", description: "Stop at a sandbank to swim and relax." },
      {
        title: "Snorkelling",
        description:
          "Snorkel at a reef spot chosen by the crew for the day's conditions.",
      },
      {
        title: "Seafood lunch",
        description: "Enjoy a seafood lunch on one of the islands.",
      },
      {
        title: "Lagoon and sail back",
        description: "Visit a mangrove lagoon, then sail back in the afternoon.",
      },
    ],
    goodToKnow: [
      "The route depends on tides and weather.",
      "There is little shade on sandbanks — bring a hat and sunscreen.",
      "Menai Bay is a conservation area; a fee may apply.",
    ],
    faqs: [
      {
        question: "Are vegetarian meals available?",
        answer: "Usually yes — tell us when you book.",
      },
      {
        question: "Is it suitable for non-swimmers?",
        answer:
          "Yes. Non-swimmers can relax on the dhow and sandbank; life jackets are available.",
      },
    ],
  },
  "nakupenda-sandbank": {
    whatToExpect: [
      {
        title: "Boat from Stone Town",
        description: "A short boat ride to the Nakupenda sandbank.",
      },
      {
        title: "Swim and snorkel",
        description: "Enjoy the clear water around the sandbank.",
      },
      {
        title: "Beach lunch",
        description: "Fresh fruit and a seafood lunch on the sand (as included).",
      },
      { title: "Return", description: "Boat back before the tide covers the sandbank." },
    ],
    goodToKnow: [
      "The sandbank appears with the tide, so timing changes daily.",
      "There is very little shade — sunscreen and a hat are essential.",
    ],
    faqs: [
      {
        question: "Can I combine it with Prison Island?",
        answer: "Yes, this is a popular combination. Ask our team about timings.",
      },
    ],
  },
  "sunset-dhow-cruise": {
    whatToExpect: [
      {
        title: "Board at the waterfront",
        description: "Meet the crew on the Stone Town waterfront in the late afternoon.",
      },
      {
        title: "Sail the coast",
        description: "Sail gently along the coast as the light turns golden.",
      },
      {
        title: "Sunset",
        description: "Watch the sun set over the Indian Ocean with light refreshments.",
      },
      { title: "Return", description: "Back on shore shortly after sunset." },
    ],
    goodToKnow: [
      "Sailing depends on wind and weather.",
      "A light jacket is useful once the sun goes down.",
    ],
    faqs: [
      {
        question: "Is it good for couples and groups?",
        answer: "Yes — it's a popular choice for couples, families and small groups.",
      },
    ],
  },
  "nungwi-kendwa-beach-experience": {
    whatToExpect: [
      {
        title: "Drive north",
        description: "Transfer to Nungwi at Zanzibar's northern tip.",
      },
      {
        title: "Dhow builders",
        description:
          "See traditional wooden dhows being built and repaired on the beach.",
      },
      {
        title: "Beach time",
        description:
          "Swim and relax at Kendwa, where the beach is good for swimming at most tides.",
      },
      { title: "Sunset", description: "Stay for the sunset before heading back." },
    ],
    goodToKnow: [
      "The north coast is less affected by tides than the east coast.",
      "Meals are not included, so bring cash or a card.",
    ],
    faqs: [
      {
        question: "Can I add the turtle aquarium?",
        answer: "Yes — Mnarani Turtle Aquarium is in Nungwi and easy to add.",
      },
    ],
  },
  "kizimkazi-dolphin-experience": {
    whatToExpect: [
      {
        title: "Early start",
        description:
          "Travel to Kizimkazi on the south coast for an early-morning boat trip.",
      },
      {
        title: "Dolphin watching",
        description: "Look for dolphins from the boat, keeping a respectful distance.",
      },
      {
        title: "Snorkelling",
        description: "Snorkel at a nearby reef if conditions allow.",
      },
      {
        title: "Village and return",
        description: "Optional time in Kizimkazi village before returning.",
      },
    ],
    goodToKnow: [
      "Sightings are never guaranteed.",
      "Responsible viewing means not chasing, crowding or touching the dolphins.",
      "Mornings are usually calmer.",
    ],
    faqs: [
      {
        question: "Can we swim with the dolphins?",
        answer: "We don't encourage it — viewing from the boat is kinder to the animals.",
      },
      {
        question: "Can I combine it with Jozani Forest?",
        answer: "Yes, it's a popular combination on the way back.",
      },
    ],
  },
  "mikumi-day-safari": {
    whatToExpect: [
      {
        title: "Early flight",
        description: "Fly from Zanzibar to the mainland in the early morning.",
      },
      {
        title: "Game drive",
        description: "Explore Mikumi National Park with your driver-guide.",
      },
      { title: "Lunch", description: "Lunch in or near the park." },
      {
        title: "Afternoon drive and return",
        description: "More wildlife viewing, then fly back to Zanzibar.",
      },
    ],
    goodToKnow: [
      "Flights and timings depend on availability and are confirmed when booking.",
      "It's a long day — consider a 2-day option for a more relaxed safari.",
      "Wildlife sightings cannot be guaranteed.",
    ],
    faqs: [
      {
        question: "What should I wear?",
        answer: "Neutral-coloured, comfortable clothing, a hat and sunglasses.",
      },
      {
        question: "Is there a luggage limit on the flight?",
        answer:
          "Small aircraft often have strict luggage limits — we'll confirm when you book.",
      },
    ],
  },
  "stone-town-food-tour": {
    whatToExpect: [
      {
        title: "Meet at sunset",
        description: "Meet your guide near Forodhani Gardens as the stalls set up.",
      },
      {
        title: "Forodhani Gardens",
        description: "Taste Zanzibar pizza, grilled seafood and mishkaki skewers.",
      },
      {
        title: "Into the lanes",
        description: "Visit small eateries and snack spots in the old town.",
      },
      {
        title: "Something sweet",
        description: "Finish with local sweets or fresh sugarcane juice.",
      },
    ],
    goodToKnow: [
      "Tell us about any allergies or dietary needs in advance.",
      "Prices at stalls are best paid in cash with small notes.",
      "During Ramadan, food stalls may open later in the evening.",
    ],
    faqs: [
      {
        question: "Is there vegetarian food?",
        answer:
          "Yes — there are vegetarian options at most stops. Let us know in advance.",
      },
      {
        question: "How much food is included?",
        answer:
          "Tastings at each stop as described; extra items you order are your own cost.",
      },
    ],
  },
  "mangapwani-slave-caves": {
    whatToExpect: [
      {
        title: "Drive north",
        description: "Transfer from Stone Town to Mangapwani, north of the town.",
      },
      {
        title: "Coral cave",
        description: "Walk into the natural coral cave with your guide.",
      },
      {
        title: "Slave chamber",
        description: "Visit the underground chamber and learn its history.",
      },
      { title: "Beach", description: "Relax on Mangapwani beach before returning." },
    ],
    goodToKnow: [
      "The history shared here is difficult — guides present it with care.",
      "The cave is dark and uneven; bring a torch or use your phone light.",
    ],
    faqs: [
      {
        question: "Is it suitable for children?",
        answer:
          "Yes, though younger children may find the history hard. Your guide can adapt.",
      },
    ],
  },
  "kuza-cave-jambiani-village": {
    whatToExpect: [
      { title: "Kuza Cave", description: "Swim in the cave's natural freshwater pool." },
      {
        title: "Village walk",
        description: "Walk through Jambiani with a local guide to see daily life.",
      },
      {
        title: "Seaweed farms",
        description: "See (tide permitting) the seaweed farms along the shore.",
      },
      { title: "Beach", description: "Time on Jambiani beach before returning." },
    ],
    goodToKnow: [
      "Water shoes help on the cave steps and in the shallows.",
      "Cover shoulders and knees for the village walk.",
    ],
    faqs: [
      {
        question: "Is the cave water cold?",
        answer: "It's cooler than the sea, which is refreshing on a hot day.",
      },
    ],
  },
  "blue-lagoon-snorkelling": {
    whatToExpect: [
      {
        title: "Meet at Michamvi Pingwe",
        description: "Meet the crew on the beach at the right time for the tide.",
      },
      {
        title: "Boat to the lagoon",
        description: "A short boat ride to the sheltered Blue Lagoon.",
      },
      {
        title: "Snorkelling",
        description: "Snorkel the calm water and look for reef fish.",
      },
      { title: "Return", description: "Back to the beach." },
    ],
    goodToKnow: [
      "Timing depends on the tide; we'll confirm it for your day.",
      "Never stand on coral — it's alive and easily damaged.",
    ],
    faqs: [
      {
        question: "Is it good for beginners?",
        answer: "Yes — the lagoon is usually calm and shallow.",
      },
    ],
  },
  "mnarani-turtle-aquarium": {
    whatToExpect: [
      {
        title: "Arrive at Mnarani",
        description: "Short transfer to the lagoon at Nungwi's northern tip.",
      },
      {
        title: "Meet the team",
        description: "Learn how the community project cares for sea turtles.",
      },
      {
        title: "See the turtles",
        description: "Watch the turtles in the natural lagoon.",
      },
      {
        title: "Explore Nungwi",
        description: "Time to explore the nearby beach or lighthouse area.",
      },
    ],
    goodToKnow: [
      "Entrance fees support the community conservation project.",
      "Follow the team's guidance when near the turtles.",
    ],
    faqs: [
      {
        question: "Can children feed the turtles?",
        answer: "Sometimes, under the team's supervision. Policies may change.",
      },
    ],
  },
  "zanzibar-cooking-class": {
    whatToExpect: [
      {
        title: "Welcome",
        description: "Meet your host and learn about the dishes you'll cook.",
      },
      {
        title: "Spices",
        description: "Discover how Zanzibar's spices are used in Swahili cooking.",
      },
      {
        title: "Cook together",
        description: "Prepare dishes such as pilau, coconut curry and chapati.",
      },
      { title: "Eat", description: "Sit down together and enjoy the meal you made." },
    ],
    goodToKnow: [
      "Let us know about allergies and dietary needs when booking.",
      "Some classes include a market visit — ask our team.",
    ],
    faqs: [
      {
        question: "Do I need cooking experience?",
        answer: "Not at all — it's hands-on and beginner friendly.",
      },
    ],
  },
  "kwale-island-day-trip": {
    whatToExpect: [
      {
        title: "Set off from Fumba",
        description: "Board a traditional boat into Menai Bay.",
      },
      { title: "Sandbank", description: "Swim and relax at a sandbank." },
      {
        title: "Kwale Island",
        description: "Swim in the mangrove lagoon and see the giant baobabs.",
      },
      {
        title: "Lunch and return",
        description: "Seafood lunch on the island, then the trip back.",
      },
    ],
    goodToKnow: [
      "The route depends on tides and weather.",
      "Menai Bay is a conservation area; a fee may apply.",
    ],
    faqs: [
      {
        question: "How is this different from Safari Blue?",
        answer:
          "Both explore Menai Bay; this trip focuses on Kwale Island and its lagoon.",
      },
    ],
  },
  "the-rock-michamvi-sunset": {
    whatToExpect: [
      {
        title: "Drive to Michamvi Pingwe",
        description: "Head to the south-east coast in the afternoon.",
      },
      {
        title: "The Rock",
        description: "See (or dine at) the restaurant on a rock in the sea.",
      },
      {
        title: "Michamvi peninsula",
        description: "Continue to the peninsula's west-facing shore.",
      },
      {
        title: "Sunset",
        description: "Watch the sun go down over the water, then return.",
      },
    ],
    goodToKnow: [
      "Dining at The Rock needs a reservation, which we can try to arrange but can't guarantee.",
      "At high tide The Rock is reached by a short boat ride.",
    ],
    faqs: [
      {
        question: "Is the meal included?",
        answer: "No — meals are paid at the restaurant.",
      },
    ],
  },
  "ngorongoro-crater-day-safari": {
    whatToExpect: [
      {
        title: "Early flight",
        description: "Fly from Zanzibar towards the northern circuit.",
      },
      { title: "Crater rim", description: "Drive up to the crater rim for the views." },
      {
        title: "Crater floor game drive",
        description: "Descend to the crater floor to look for wildlife.",
      },
      {
        title: "Lunch and return",
        description: "Picnic lunch, more game viewing, then the flight back.",
      },
    ],
    goodToKnow: [
      "It's a long day with an early start and a late return.",
      "The rim can be cool — bring a warm layer.",
      "Flights depend on availability and weather.",
    ],
    faqs: [
      {
        question: "Would a longer safari be better?",
        answer:
          "If you have time, a 2–3 day safari is more relaxed. See our safari packages.",
      },
    ],
  },
  "nyerere-selous-day-safari": {
    whatToExpect: [
      {
        title: "Short flight",
        description: "Fly from Zanzibar to an airstrip in Nyerere National Park.",
      },
      { title: "Game drive", description: "Explore the park with your guide." },
      { title: "Lunch", description: "Lunch in the park." },
      {
        title: "Boat safari (optional)",
        description: "Where available, view wildlife from a boat on the river.",
      },
      { title: "Return", description: "Fly back to Zanzibar in the late afternoon." },
    ],
    goodToKnow: [
      "Boat safaris depend on water levels and season.",
      "Bring insect repellent and neutral-coloured clothing.",
      "Flights depend on availability and are confirmed when booking.",
    ],
    faqs: [
      {
        question: "Is the boat safari included?",
        answer: "It's an optional extra where available — ask us when booking.",
      },
    ],
  },

  "pungume-island-sandbank": {
    whatToExpect: [
      {
        title: "Set off by boat",
        description: "Leave the south-west coast and head into Menai Bay.",
      },
      { title: "Sandbank", description: "Stop at the sandbank to swim and relax." },
      { title: "Snorkelling", description: "Snorkel on the reef around Pungume Island." },
      {
        title: "Island lunch",
        description: "Seafood lunch and free time on the island.",
      },
      { title: "Return", description: "Boat back in the afternoon." },
    ],
    goodToKnow: [
      "Timing and route depend on the tides and weather.",
      "There is little shade on the sandbank — bring a hat and sunscreen.",
      "Menai Bay is a conservation area; a fee may apply.",
    ],
    faqs: [
      {
        question: "Will we see dolphins?",
        answer:
          "Dolphins are sometimes seen in Menai Bay, but sightings can't be guaranteed.",
      },
      {
        question: "Is it suitable for non-swimmers?",
        answer:
          "Yes. Life jackets are available and you can relax on the boat or sandbank.",
      },
    ],
  },
  "jet-ski-experience": {
    whatToExpect: [
      {
        title: "Check-in and briefing",
        description:
          "Meet the team on the beach, get your life jacket and learn the controls and safety rules.",
      },
      {
        title: "Your ride",
        description: "Ride along the coast within the safe area set by your instructor.",
      },
      {
        title: "Back to the beach",
        description: "Return to shore — add more time if you're hooked.",
      },
    ],
    goodToKnow: [
      "Rides depend on sea conditions and safety checks on the day.",
      "Life jackets must be worn at all times.",
      "Age and health requirements apply for drivers; we'll confirm them when you book.",
      "Stay within the riding area your instructor shows you.",
    ],
    faqs: [
      {
        question: "Do I need a licence or experience?",
        answer:
          "A licence isn't usually needed for a supervised ride, and you'll get a safety briefing first. We'll confirm the requirements when you book.",
      },
      {
        question: "Can two people share a jet ski?",
        answer:
          "Often, yes — a passenger can ride behind the driver, depending on the jet ski and conditions.",
      },
      {
        question: "Can I combine it with parasailing?",
        answer:
          "Yes — parasailing is a separate experience at the same beaches. Ask us and we'll arrange both on the same day.",
      },
    ],
  },
  "parasailing-experience": {
    whatToExpect: [
      {
        title: "Check-in and briefing",
        description: "Meet the crew on the beach for a safety briefing.",
      },
      {
        title: "Boat out",
        description:
          "Ride the boat out to the launch area and get clipped into the harness.",
      },
      {
        title: "Take off",
        description:
          "The parasail lifts you gently from the boat — enjoy the view of the coast and reef from above.",
      },
      {
        title: "Landing and return",
        description: "The crew brings you back down and the boat returns to the beach.",
      },
    ],
    goodToKnow: [
      "Flights depend on wind, sea conditions and safety checks on the day.",
      "No previous experience is needed.",
      "Age, weight and health requirements apply; we'll confirm them when you book.",
      "Secure loose items such as hats and sunglasses before take-off.",
    ],
    faqs: [
      {
        question: "Can two people fly together?",
        answer: "Often, yes — tandem flights depend on combined weight and conditions.",
      },
      {
        question: "Will I get wet?",
        answer:
          "You may get splashed, so wear swimwear or clothes that can get wet. The crew explains the launch and landing before you fly.",
      },
      {
        question: "Can I combine it with a jet ski ride?",
        answer:
          "Yes — the jet ski is a separate experience at the same beaches. Ask us and we'll arrange both on the same day.",
      },
    ],
  },
  "salaam-cave-experience": {
    whatToExpect: [
      { title: "Arrive in Kizimkazi", description: "Meet your local guide at the cave." },
      {
        title: "Into the cave",
        description: "Step down into the limestone cave and its clear pool.",
      },
      {
        title: "Meet the turtles",
        description: "Learn about the sea turtles cared for at the site.",
      },
      { title: "Swim", description: "Enjoy a cool swim in the natural pool." },
    ],
    goodToKnow: [
      "Follow your guide's instructions near the turtles and don't touch them unless invited to.",
      "The steps and rocks can be slippery — water shoes help.",
      "Easy to combine with the Kizimkazi Dolphin Watching Tour on the same morning.",
    ],
    faqs: [
      {
        question: "Can children swim in the cave?",
        answer: "Yes, with adult supervision. The guide will advise on the best spots.",
      },
      {
        question: "Can I combine it with dolphin watching?",
        answer: "Yes — both are in the Kizimkazi area and fit into one morning.",
      },
    ],
  },
  "horse-riding-swimming": {
    whatToExpect: [
      {
        title: "Meet the horses",
        description:
          "Arrive at the stables, meet your guide and get matched with a horse.",
      },
      {
        title: "Safety briefing",
        description: "Helmet fitting and a short riding briefing for your level.",
      },
      {
        title: "Beach ride",
        description: "Ride along the beach at a pace that suits you.",
      },
      {
        title: "Swim with the horses",
        description:
          "Tide and conditions permitting, ride into the sea and swim together.",
      },
      {
        title: "Return to the stables",
        description: "Ride back and say goodbye to your horse.",
      },
    ],
    goodToKnow: [
      "Ride times are planned around the tides, so they change from day to day.",
      "Wear long trousers to avoid chafing; swimwear underneath for the sea.",
      "Age and weight limits apply for the horses' welfare.",
    ],
    faqs: [
      {
        question: "I've never ridden before — can I join?",
        answer: "Yes. Beginners are welcome and rides are matched to your experience.",
      },
      {
        question: "Will I definitely swim with the horses?",
        answer:
          "Only when the tide and conditions are safe; your guide decides on the day.",
      },
      {
        question: "Can children ride?",
        answer:
          "Often, yes, from a minimum age. Tell us your children's ages when you book.",
      },
    ],
  },
};
