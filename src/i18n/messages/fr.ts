import { contact } from "@/config/site";

import type { Messages } from "./en";

// AI-drafted French interface text (from en.ts); have a native speaker review it.
export const fr: Messages = {
  meta: {
    siteName: "Bound to Zanzibar",
    tagline: "Votre voyage commence à Zanzibar.",
    description:
      "Excursions à Zanzibar, safaris en Tanzanie et séjours de plusieurs jours pour les résidents, les voyageurs d’Afrique de l’Est et les visiteurs internationaux.",
  },
  language: {
    label: "Langue",
    choose: "Choisir la langue",
    machineNotice:
      "Cette page a été traduite automatiquement et est en cours de relecture. Si quelque chose n’est pas clair, n’hésitez pas à nous demander.",
    viewEnglish: "Voir en anglais",
  },
  nav: {
    home: "Accueil",
    tours: "Excursions à Zanzibar",
    safari: "Safari",
    packages: "Séjours",
    destinations: "Destinations",
    travelGuide: "Guide de voyage",
    about: "À propos",
    contact: "Contact",
    bookNow: "Réserver",
    main: "Principal",
    mobile: "Mobile",
    menu: "Menu",
    openMenu: "Ouvrir le menu",
    skipToContent: "Aller au contenu",
    quickContact: "Contact rapide",
    topBar: "Zanzibar · Safari en Tanzanie · Séjours",
    whatsapp: "WhatsApp",
    call: "Appeler",
    opensWhatsApp: "(ouvre WhatsApp)",
    opensNewTab: "(s’ouvre dans un nouvel onglet)",
    instagramNewTab: "(Instagram, s’ouvre dans un nouvel onglet)",
    breadcrumb: "Fil d’Ariane",
  },
  footer: {
    statementBefore: "Votre voyage commence à",
    statementPlace: "Zanzibar.",
    intro:
      "Indiquez-nous vos dates et ce que vous aimeriez voir. Nous vous répondons avec un itinéraire et confirmons les disponibilités avant toute réservation.",
    planJourney: "Préparer votre voyage",
    whatsappUs: "Écrivez-nous sur WhatsApp",
    whatsappMessage: "Bonjour ! J’aimerais organiser un voyage.",
    about: "Excursions, safaris et séjours pour les voyageurs locaux et internationaux.",
    explore: "Explorer",
    company: "Entreprise",
    legal: "Mentions légales",
    tanzaniaSafari: "Safari en Tanzanie",
    bookATrip: "Réserver un voyage",
    privacy: "Politique de confidentialité",
    terms: "Conditions générales",
    getInTouch: "Nous contacter",
    phone: "Téléphone",
    email: "E-mail",
    officeAddress: "Adresse du bureau",
    pending: "À fournir par le propriétaire",
    followUs: "Suivez-nous",
    linkPending: "(lien à fournir par le propriétaire)",
    rights: "Tous droits réservés.",
    place: "Zanzibar · Tanzanie",
  },
  common: {
    sample: "Exemple",
    sampleContent: "Contenu d’exemple",
    view: "Voir",
    viewExperience: "Voir l’expérience",
    viewItinerary: "Voir l’itinéraire",
    readGuide: "Lire le guide",
    quickLook: "Aperçu",
    whatToExpect: "Au programme",
    included: "Inclus",
    notIncluded: "Non inclus",
    viewFullTour: "Voir l’excursion complète",
    includesSafari: "Safari inclus",
    daysNights: "{days} jours · {nights} nuits",
    daysUnit: "jours",
    daysThenNights: "jours · {nights} nuits",
    nightsShort: "{nights} nuits",
    day: "Jour",
    dayN: "Jour {n}",
    moreDays: "+ {n} jours de plus",
    minRead: "{n} min de lecture",
    zanzibar: "Zanzibar",
    mainland: "Tanzanie continentale",
    allTours: "Toutes les excursions",
    allDestinations: "Toutes les destinations",
    allPackages: "Tous les séjours",
    allArticles: "Tous les articles",
    exploreTours: "Découvrir les excursions",
    contactUs: "Nous contacter",
    backHome: "Retour à l’accueil",
    placeholderImage: "Image provisoire",
    placeholderIllustration: "(illustration provisoire)",
    photo: "Photo",
    pause: "Mettre le diaporama en pause",
    play: "Lancer le diaporama",
    showPhoto: "Afficher la photo {n} : {caption}",
    photoOf: "Photo {n} sur {total} : {alt}",
    heroPhotos: "Photos d’accueil",
    loading: "Chargement de la page",
  },
  price: {
    showFor: "Afficher les prix pour",
    from: "À partir de",
    illustrative: "Prix indicatif",
    onRequestFor: "Prix sur demande pour : {market}",
    adult: "Adulte",
    child: "Enfant",
    onRequest: "Sur demande",
    illustrativeNote:
      "Prix d’exemple indicatif — les prix définitifs seront confirmés par notre équipe.",
    samplePrices: "Excursions d’exemple et prix indicatifs",
    sampleSafaris: "Safaris d’exemple et prix indicatifs",
    samplePackages: "Séjours d’exemple et prix indicatifs",
  },
  markets: {
    international: { short: "International", long: "Visiteurs internationaux" },
    resident: { short: "Résident en Tanzanie", long: "Résidents tanzaniens" },
    east_african: { short: "Afrique de l’Est", long: "Résidents d’Afrique de l’Est" },
  },
  marketHints: {
    international: "Visiteurs venant de l’extérieur de l’Afrique de l’Est",
    east_african: "Résidents d’un pays de la Communauté d’Afrique de l’Est",
    resident: "Citoyens et résidents tanzaniens",
  },
  units: {
    "per person": "par personne",
    "per person sharing": "par personne (base chambre partagée)",
    "per group": "par groupe",
    "per boat": "par bateau",
    "per vehicle": "par véhicule",
  },
  difficulty: { easy: "Facile", moderate: "Modérée", challenging: "Exigeante" },
  home: {
    eyebrow: "Zanzibar et Tanzanie",
    intro:
      "Excursions, safaris et séjours organisés avec une connaissance du terrain — pour les résidents tanzaniens, les voyageurs d’Afrique de l’Est et les visiteurs du monde entier.",
    exploreTours: "Découvrir les excursions",
    planJourney: "Préparer votre voyage",
    counts: {
      experiences: "expériences",
      destinations: "destinations",
      safaris: "safaris",
    },
    insetAlt: "Les toits de Stone Town au bord de la mer turquoise",
    video: {
      label:
        "Vidéo : vues aériennes des plages de Zanzibar, de lagons turquoise, de complexes bordés de palmiers et d’un coucher de soleil sur la mer",
      caption: "Zanzibar vue du ciel",
      play: "Lire la vidéo",
      pause: "Mettre la vidéo en pause",
    },
    search: {
      label: "Trouver une expérience",
      want: "J’aimerais",
      wantPlaceholder: "Faire du snorkeling, visiter Stone Town, voir des éléphants…",
      where: "Où",
      anywhere: "Partout",
      type: "Type",
      allExperiences: "Toutes les expériences",
      submit: "Trouver des expériences",
    },
    destinations: {
      eyebrow: "Destinations",
      title: "Îles, vieilles villes et grandes plaines",
      description:
        "Des portes sculptées de Stone Town au récif de Mnemba et aux parcs du continent — commencez par un lieu.",
    },
    experiences: {
      eyebrow: "Expériences populaires",
      title: "Zanzibar, une journée à la fois",
    },
    travellers: {
      eyebrow: "Voyagez à votre façon",
      title: "Un voyage pour chaque voyageur",
      description:
        "Dites-nous qui vient et nous construirons les journées autour de vous : le rythme, les hébergements et les moments qui comptent.",
      cta: "Découvrir",
      items: {
        family: {
          title: "Familles",
          body: "Des journées tranquilles entre faune, plages et histoires de l’île, pour tous les âges.",
          alt: "Une famille avec un jeune enfant près d’un véhicule de safari ouvert dans les plaines de Tanzanie",
        },
        couples: {
          title: "Couples",
          body: "Des journées de plage paisibles, des sorties en voilier au coucher du soleil et des dîners à deux.",
          alt: "Un couple se détendant sur un lit de plage à Zanzibar",
        },
        groups: {
          title: "Groupes",
          body: "Amis, clubs et retrouvailles, avec un seul programme qui convient à tous.",
          alt: "Un groupe de voyageurs posant devant une cascade en Tanzanie",
        },
        honeymoon: {
          title: "Lunes de miel",
          body: "Couchers de soleil pieds nus, des moments rien qu’à deux et un safari inoubliable.",
          alt: "Un pique-nique au coucher du soleil sur le sable avec des coussins et du vin, face à des bateaux traditionnels à Zanzibar",
        },
        solo: {
          title: "Voyageurs solo",
          body: "Avancez à votre rythme et découvrez l’île avec un guide local.",
          alt: "Une femme jouant du ukulélé sur la plage de Paje, à Zanzibar",
        },
      },
    },
    safari: {
      eyebrow: "Safari en Tanzanie",
      title: "Du récif aux plaines",
      body: "Associez des journées sur l’île à un safari sur le continent — d’une longue excursion d’une journée à Mikumi à une grande aventure dans le circuit nord, au Serengeti et au Ngorongoro.",
      cta: "Découvrir les safaris",
      elephantAlt: "Un éléphant dans le parc national de Nyerere",
      caption: "En safari · Tanzanie",
      videoLabel:
        "Vidéo : un véhicule de safari au coucher du soleil avec des girafes, des montgolfières au-dessus des plaines, un buffle, un éléphant, un zèbre et un lion en Tanzanie",
    },
    packages: {
      eyebrow: "Séjours de plusieurs jours",
      title: "Des voyages organisés de A à Z",
      description:
        "Hébergement, transferts et expériences réunis dans un seul itinéraire — adaptable à votre budget.",
    },
    reviews: {
      eyebrow: "Avis des voyageurs",
      title: "Ce que disent nos voyageurs",
      soon: "Les avis des voyageurs arrivent bientôt.",
      body: "Nous ne publions que des avis authentiques de vrais voyageurs. Vous avez voyagé avec nous ? Nous serions ravis d’avoir votre avis.",
    },
    guide: {
      eyebrow: "Guide de voyage",
      title: "Préparez votre voyage en toute confiance",
    },
  },
  why: {
    eyebrow: "Pourquoi voyager avec nous",
    title: "Organisé sur place, avec soin",
    reasons: [
      {
        title: "Connaissance locale",
        body: "Basés à Zanzibar, nous organisons des voyages sur l’île et en Tanzanie continentale.",
      },
      {
        title: "Pour les résidents et les visiteurs",
        body: "Des prix clairs pour les résidents tanzaniens et les voyageurs internationaux, avec des options pour tous les budgets.",
      },
      {
        title: "Une réservation claire et honnête",
        body: "Nous confirmons avec vous les disponibilités et les prix définitifs avant toute réservation.",
      },
      {
        title: "Respect des personnes et des lieux",
        body: "Nous encourageons une observation responsable de la faune et le respect de la culture locale.",
      },
    ],
  },
  travelStyles: {
    luxury: "Luxe",
    adventure: "Aventure",
    romantic: "Romantique",
    family: "Famille",
    cultural: "Culture",
    relaxation: "Détente",
    wildlife: "Faune et safari",
  },
  tourLengths: {
    hours: "Quelques heures",
    half_day: "Demi-journée",
    full_day: "Journée complète",
    multi_day: "Plusieurs jours",
  },
  travellerPage: {
    metaTitle: "{title} : voyages à Zanzibar et en Tanzanie",
    eyebrow: "Voyagez à votre façon",
    tipsTitle: "Conseils pour préparer",
    suggestedEyebrow: "Expériences suggérées",
    suggestedTitle: "Expériences pour : {title}",
    suggestedNote:
      "Suggestions selon le style de chaque voyage. Nous adaptons les détails avec vous.",
    planTitle: "Prêt à organiser ?",
    planBody:
      "Envoyez une demande avec vos dates et votre groupe. Nous confirmons la disponibilité et les prix avec vous ; rien n’est payé en ligne.",
    plan: "Organiser ce voyage",
    ask: "Poser une question",
    others: "Autres façons de voyager",
    pages: {
      family: {
        intro: [
          "Zanzibar convient bien aux familles : courtes sorties en bateau, tortues géantes, tortues marines, forêts habitées par les colobes roux et plages calmes, avec des safaris sur le continent accessibles aux enfants plus grands.",
          "Indiquez-nous l’âge de vos enfants et votre façon de voyager, et nous vous proposerons un rythme avec du repos entre les sorties.",
        ],
        tips: [
          "Alternez excursions d’une demi-journée et après-midis libres à la plage.",
          "Les tortues géantes de Prison Island et les colobes roux de Jozani plaisent beaucoup aux enfants.",
          "Pour un safari, demandez-nous quels parcs et quelles durées conviennent à l’âge de vos enfants.",
          "Les prix enfants sont indiqués lorsqu’ils s’appliquent ; nous confirmons le total avec vous.",
        ],
      },
      couples: {
        intro: [
          "Matinées tranquilles, bancs de sable blanc, croisières en dhow au coucher du soleil et dîners face à la mer : Zanzibar se savoure à deux.",
          "Dites-nous ce que vous aimez — plages calmes, culture, mer ou faune — et nous vous suggérerons des expériences qui vous ressemblent.",
        ],
        tips: [
          "Une croisière en dhow au coucher du soleil est une belle première soirée.",
          "Associez un banc de sable à des journées tranquilles sur les plages de la côte est.",
          "Ajoutez un court safari sur le continent pour changer de décor.",
          "Une occasion à fêter ? Dites-le-nous et nous vous proposerons des idées.",
        ],
      },
      groups: {
        intro: [
          "Amis, familles qui voyagent ensemble, clubs et retrouvailles : nous organisons des journées qui conviennent à tous, des sorties en bateau et du snorkeling aux balades dans Stone Town.",
          "Indiquez la taille du groupe, vos dates et vos envies. Les grands groupes s’organisent plus facilement à l’avance, alors contactez-nous dès que possible.",
        ],
        tips: [
          "Les sorties en bateau à la journée comme Safari Blue sont idéales à plusieurs.",
          "Mélangez activités sportives, comme le snorkeling ou le jet-ski, et moments de détente.",
          "Renseignez-vous sur les prix de groupe lorsqu’ils s’appliquent.",
          "Signalez-nous les différents âges ou niveaux au sein du groupe.",
        ],
      },
      honeymoon: {
        intro: [
          "Couchers de soleil pieds nus, bancs de sable paisibles et la possibilité d’un safari : Zanzibar et la Tanzanie continentale offrent une lune de miel mémorable.",
          "Indiquez-nous vos dates et vos envies, et nous vous proposerons des expériences et un rythme qui laissent beaucoup de temps rien qu’à deux.",
        ],
        tips: [
          "Associez journées de plage et croisière en dhow au coucher du soleil.",
          "Un vol en montgolfière au-dessus du Serengeti peut s’ajouter à un safari.",
          "Prévoyez des journées libres entre les activités.",
          "Précisez qu’il s’agit de votre lune de miel lorsque vous nous contactez.",
        ],
      },
      solo: {
        intro: [
          "Vous voyagez seul ? Les ruelles de Stone Town, les fermes aux épices, les cours de cuisine et les récifs de l’île se découvrent facilement à votre rythme avec un guide local.",
          "Indiquez-nous vos dates, vos centres d’intérêt et votre budget, et nous vous suggérerons des expériences adaptées.",
        ],
        tips: [
          "Les visites culturelles sont une façon détendue de découvrir l’île.",
          "Participez à une sortie en bateau pour faire du snorkeling et voir la côte.",
          "Indiquez votre budget pour que nous proposions des options adaptées.",
          "Envoyez-nous vos informations d’arrivée pour organiser les prises en charge.",
        ],
      },
    },
  },
  tours: {
    metaTitle: "Excursions et expériences à Zanzibar",
    metaDescription:
      "Excursions et expériences à la journée à Zanzibar : Stone Town, Prison Island, fermes d’épices, forêt de Jozani, snorkeling, bancs de sable et croisières en boutre.",
    eyebrow: "Expériences",
    title: "Excursions et expériences à Zanzibar",
    description:
      "Culture, mer, forêt et plage — des excursions et expériences à travers Zanzibar. Les safaris sur le continent se trouvent sur la page Safari.",
    headerAlt:
      "Vue aérienne d’un étroit banc de sable blanc dans l’eau turquoise au large de Zanzibar",
    allTours: "Toutes les excursions",
    filter: "Filtrer les excursions",
    searchLabel: "Rechercher des excursions",
    searchPlaceholder: "Rechercher, p. ex. snorkeling",
    category: "Catégorie",
    allCategories: "Toutes les catégories",
    destination: "Destination",
    allDestinations: "Toutes les destinations",
    search: "Rechercher",
    found: "Expériences trouvées : {n}",
    clear: "Effacer les filtres",
    noneTitle: "Aucune excursion ne correspond à votre recherche",
    noneBody:
      "Essayez un autre mot-clé ou effacez les filtres. Vous pouvez aussi nous contacter — nous serons ravis d’organiser quelque chose selon vos envies.",
    lengthLabel: "Durée",
    anyLength: "Toutes durées",
    styleLabel: "Style de voyage",
    anyStyle: "Tous les styles",
    levelLabel: "Niveau d’activité",
    anyLevel: "Tous niveaux",
    budgetLabel: "Budget par personne",
    anyBudget: "Tous budgets",
    budgetUpTo: "Jusqu’à {max}",
    budgetBetween: "{min} – {max}",
    budgetOver: "Plus de {min}",
    budgetNote:
      "Le budget utilise le prix de votre marché sélectionné. Les voyages sur demande sont masqués lorsqu’un budget est choisi.",
    planLabel: "Votre voyage",
    dateLabel: "Date du voyage",
    adultsLabel: "Adultes",
    childrenLabel: "Enfants",
    planNote:
      "Votre date et la taille du groupe sont ajoutées à votre demande de réservation. Notre équipe confirme la disponibilité.",
    moreFilters: "Plus de filtres",
    fewerFilters: "Moins de filtres",
    viewDetails: "Voir les détails",
    bookNow: "Réserver",
  },
  tour: {
    notFound: "Excursion introuvable",
    facts: {
      duration: "Durée",
      destination: "Destination",
      difficulty: "Difficulté",
      suitability: "Pour qui",
    },
    onThisPage: "Sur cette page",
    sections: {
      overview: "Aperçu",
      itinerary: "Programme",
      included: "Ce qui est inclus",
      goodToKnow: "Bon à savoir",
      faqs: "FAQ",
    },
    about: "À propos de cette expérience",
    highlights: "Points forts",
    whatToExpect: "Au programme",
    whatsIncluded: "Ce qui est inclus",
    includedFallback:
      "Ce qui est inclus dépend de l’itinéraire que nous établissons avec vous et figure dans votre devis.",
    included: "Inclus",
    notIncluded: "Non inclus",
    whatToBring: "À emporter",
    goodToKnow: "Bon à savoir",
    meetingPoint: "Point de rendez-vous et prise en charge",
    faqs: "Questions fréquentes",
    keepExploring: "Continuer à explorer",
    similar: "Expériences similaires",
  },
  generalFaqs: [
    {
      question: "Comment réserver ?",
      answer:
        "Envoyez-nous une demande par e-mail ou par téléphone. Notre équipe confirme par écrit les disponibilités et le prix définitif avant toute réservation.",
    },
    {
      question: "Les prix sont-ils définitifs ?",
      answer:
        "Les prix indiqués comme « indicatifs » sont des exemples. Votre prix définitif est confirmé par notre équipe lorsque nous répondons à votre demande.",
    },
    {
      question: "Quelles sont les conditions d’annulation ?",
      answer:
        "Les conditions d’annulation dépendent de l’excursion et sont confirmées avec votre réservation. Renseignez-vous auprès de notre équipe avant de réserver.",
    },
    {
      question: "Les excursions peuvent-elles être privatisées ou adaptées ?",
      answer:
        "Souvent, oui. Dites-nous ce que vous avez en tête et notre équipe vous proposera des options.",
    },
  ],
  enquiry: {
    label: "Prix et demandes",
    planTour: "Organiser cette excursion",
    planPackage: "Organiser ce séjour",
    prices: "Prix",
    requestToBook: "Demander une réservation",
    whatsapp: "Discuter sur WhatsApp",
    whatsappMessage: "Bonjour ! Je suis intéressé(e) par : {item}.",
    email: "Demander par e-mail",
    emailSubject: "Demande : {item}",
    call: "Appeler le {phone}",
    note: "Une demande n’est pas une réservation confirmée. Notre équipe confirme les disponibilités et le prix définitif avant toute réservation, et aucun paiement n’est pris en ligne.",
  },
  safari: {
    metaTitle: "Safari en Tanzanie depuis Zanzibar",
    metaDescription:
      "Associez Zanzibar à un safari en Tanzanie : Serengeti, Ngorongoro, Tarangire, Ruaha, Nyerere, randonnée à la rencontre des chimpanzés et plus encore.",
    eyebrow: "Safari",
    title: "Safari en Tanzanie, depuis Zanzibar",
    description:
      "Associez les plages et la culture de Zanzibar à la faune de la Tanzanie continentale.",
    howItWorks: "Comment se déroulent nos safaris",
    points: [
      {
        title: "Île + safari, un seul projet",
        body: "Vols, transferts et séjour sur l’île organisés comme un seul voyage cohérent.",
      },
      {
        title: "Des options pour toutes les durées",
        body: "D’une longue excursion d’une journée à Mikumi à un safari de plusieurs jours dans le nord, le sud ou l’ouest.",
      },
      {
        title: "Honnêtes sur les conditions",
        body: "Les observations d’animaux et les horaires de vol ne peuvent pas être garantis — nous vous disons à quoi vous attendre.",
      },
    ],
    experiencesEyebrow: "Expériences de safari",
    experiencesTitle: "Expériences de safari",
    experiencesDescription:
      "Excursions à la journée depuis Zanzibar et safaris plus longs dans les parcs du nord, du sud et de l’ouest de la Tanzanie.",
    experienceCount: "Expériences : {n}",
    circuits: {
      northern: "Safaris du circuit nord",
      southern: "Safaris du circuit sud",
      western: "Safaris dans l’ouest de la Tanzanie",
      special: "Expériences de safari spéciales",
      more: "Autres expériences de safari",
    },
    packagesEyebrow: "Île + safari",
    packagesTitle: "Séjours safari",
    packagesDescription:
      "Des voyages de plusieurs jours associant un safari sur le continent et un séjour à Zanzibar.",
    parksEyebrow: "Parcs",
    parksTitle: "Où nous partons en safari",
  },
  packages: {
    metaTitle: "Séjours",
    metaDescription:
      "Séjours de plusieurs jours à Zanzibar et combinés Zanzibar + safari en Tanzanie avec hébergement, transferts et excursions.",
    eyebrow: "Voyages de plusieurs jours",
    title: "Séjours",
    description:
      "Des itinéraires réunissant hébergement, transferts et expériences. Chaque séjour peut être adapté à vos dates, à votre groupe et à votre budget.",
    headerAlt:
      "Des palmiers encadrant une plage ensoleillée avec des transats et une eau turquoise",
    emptyTitle: "Séjours bientôt disponibles",
    emptyBody:
      "Nous préparons nos premiers séjours. Contactez-nous pour organiser un voyage en attendant.",
    islandEyebrow: "L’île",
    islandTitle: "Séjours sur l’île de Zanzibar",
    safariEyebrow: "Île + continent",
    safariTitle: "Séjours Zanzibar + safari",
    aboutSafaris: "À propos de nos safaris",
  },
  package: {
    notFound: "Séjour introuvable",
    destinations: "Destinations",
    facts: {
      length: "Durée",
      lengthValue: "{days} jours / {nights} nuits",
      accommodation: "Hébergement",
      transfers: "Transferts",
      meals: "Repas",
    },
    overview: "Aperçu",
    itinerary: "Itinéraire jour par jour",
    overnight: "Nuit : {place}",
    noOvernight: "Pas de nuitée",
    mealsList: "Repas : {meals}",
    experiences: "Expériences incluses",
    whatsIncluded: "Ce qui est inclus",
    terms: "Conditions",
  },
  destinations: {
    metaTitle: "Destinations",
    metaDescription:
      "Découvrez les villes, plages, récifs et forêts de Zanzibar, ainsi que les parcs de safari de la Tanzanie continentale.",
    eyebrow: "Où aller",
    title: "Destinations",
    description:
      "Des ruelles de Stone Town aux récifs de Mnemba et aux plaines des parcs du continent.",
    headerAlt:
      "Vue aérienne de vagues se brisant sur l’eau turquoise au large de la côte de Zanzibar",
    sample: "Guides de destinations d’exemple",
    islandsEyebrow: "Les îles",
    safariEyebrow: "En safari",
  },
  destination: {
    notFound: "Destination introuvable",
    about: "À propos de {name}",
    highlights: "Points forts",
    experiencesEyebrow: "Expériences",
    experiencesTitle: "Expériences : {name}",
    noToursTitle: "Aucune excursion à la journée pour le moment",
    noToursBody:
      "Cette destination figure dans nos séjours, ou contactez-nous et nous pourrons organiser une visite pour vous.",
    packagesEyebrow: "Séjours",
    packagesTitle: "Séjours qui passent par {name}",
  },
  guide: {
    metaTitle: "Guide de voyage",
    metaDescription:
      "Conseils pratiques pour préparer un voyage à Zanzibar et en Tanzanie : saisons, culture et bagages.",
    eyebrow: "Préparer votre voyage",
    title: "Guide de voyage",
    description:
      "Des conseils pratiques et honnêtes pour préparer votre visite à Zanzibar et en Tanzanie.",
    sample: "Articles d’exemple — à relire par le propriétaire",
    all: "Tous les articles",
    emptyTitle: "Articles bientôt disponibles",
    emptyBody: "Nous rédigeons nos premiers guides de voyage.",
    notFound: "Article introuvable",
    backToAll: "Tous les articles du guide de voyage",
    keepReading: "Continuer la lecture",
    more: "Plus d’articles du guide de voyage",
  },
  about: {
    metaTitle: "À propos",
    metaDescription:
      "À propos de Bound to Zanzibar : une agence de voyage basée à Zanzibar pour les voyageurs locaux et internationaux.",
    eyebrow: "Notre histoire",
    title: "À propos de Bound to Zanzibar",
    description:
      "Une marque de tourisme et de voyage basée à Zanzibar pour les résidents tanzaniens, les voyageurs d’Afrique de l’Est et les visiteurs du monde entier.",
    headerAlt:
      "Des cocotiers penchés au-dessus d’un toit de chaume sur une plage de Zanzibar",
    draft: "Texte provisoire — à relire par le propriétaire",
    lead: "Bound to Zanzibar aide les voyageurs à découvrir Zanzibar et la Tanzanie continentale — d’une balade d’une demi-journée dans Stone Town à un safari de plusieurs jours combiné à un séjour sur la côte.",
    p1: "Nous organisons des voyages pour les couples, les familles, les groupes et les voyageurs seuls, pour des visiteurs locaux comme internationaux. Cela signifie des prix clairs pour les résidents et les visiteurs, et des options adaptées à différents budgets.",
    p2: "Chaque voyage commence par une conversation. Dites-nous ce que vous aimeriez voir et quand, et nous vous proposerons un itinéraire et confirmerons les disponibilités avant toute réservation.",
    toBePublished: "À publier",
    companyDetails: "Informations sur l’entreprise",
    companyBody:
      "Notre histoire, notre équipe, notre immatriculation et nos licences seront publiées ici une fois fournies et vérifiées.",
    ready: "Prêt à préparer votre voyage ?",
  },
  contact: {
    metaTitle: "Nous contacter",
    metaDescription:
      "Contactez Bound to Zanzibar pour organiser une excursion, un safari ou un séjour à Zanzibar.",
    eyebrow: "Nous contacter",
    title: "Contactez-nous",
    description:
      "Des questions sur une excursion, un séjour ou un safari ? Écrivez-nous et notre équipe vous répondra.",
    direct: "Parlez-nous directement",
    channels: {
      email: "E-mail",
      emailNote:
        "Indiquez-nous vos dates, la taille de votre groupe et ce que vous aimeriez faire.",
      emailSubject: "Demande de voyage",
      phone: "Téléphone",
      phoneNote: "Appelez-nous pour discuter de vos projets.",
      whatsapp: "WhatsApp",
      whatsappNote: "Envoyez-nous un message sur WhatsApp.",
      whatsappMessage: "Bonjour ! J’aimerais me renseigner sur un voyage.",
      instagram: "Instagram",
      instagramNote: "Suivez-nous et envoyez-nous un message.",
    },
    officeTitle: "Adresse du bureau",
    officeBody: "Zanzibar, Tanzanie. Adresse complète à fournir par le propriétaire.",
    formTitle: "Envoyez-nous un message",
    formIntroBefore:
      "Posez-nous toutes vos questions sur les excursions, safaris ou séjours. Pour réserver un voyage précis, utilisez le",
    formIntroLink: "formulaire de demande de réservation",
    formUnavailable:
      "Le formulaire en ligne ouvre bientôt. En attendant, écrivez-nous par e-mail, appelez-nous ou contactez-nous sur WhatsApp.",
  },
  enquiryForm: {
    honeypot: "Laissez ce champ vide",
    name: "Nom",
    email: "E-mail",
    phone: "Téléphone ou WhatsApp (facultatif)",
    phoneHint: "Indiquez votre indicatif pays.",
    subject: "Objet (facultatif)",
    subjectPlaceholder: "p. ex. Safari en mars",
    message: "Message",
    messagePlaceholder:
      "Vos dates, la taille de votre groupe et ce que vous aimeriez faire.",
    consentBefore:
      "J’accepte que Bound to Zanzibar utilise ces informations pour me répondre, comme décrit dans la",
    privacyPolicy: "politique de confidentialité",
    sending: "Envoi…",
    send: "Envoyer le message",
    sendAnother: "Envoyer un autre message",
  },
  book: {
    tripNotes: {
      family: "Nous préparons un voyage en famille.",
      couples: "Nous sommes un couple et préparons un voyage.",
      groups: "Nous préparons un voyage en groupe.",
      honeymoon: "Nous préparons notre lune de miel.",
      solo: "Je prépare un voyage en solo.",
    },
    metaTitle: "Réserver un voyage",
    metaDescription:
      "Envoyez une demande de réservation pour une excursion, un safari ou un séjour à Zanzibar. Notre équipe confirme avec vous les disponibilités et le prix définitif.",
    eyebrow: "Réservation",
    title: "Demander une réservation",
    description:
      "Dites-nous ce que vous aimeriez faire et quand. Il s’agit d’une demande — rien n’est réservé ni facturé tant que notre équipe ne l’a pas confirmé avec vous.",
    loadingForm: "Chargement du formulaire de réservation…",
    howTitle: "Comment fonctionne la réservation",
    steps: [
      "Choisissez une excursion ou un séjour et envoyez la date souhaitée et la taille de votre groupe.",
      "Vous recevez immédiatement un numéro de référence.",
      "Notre équipe vérifie les disponibilités et vous répond avec les détails et le prix définitif.",
      "Votre réservation n’est confirmée qu’une fois que notre équipe l’a confirmée par écrit.",
    ],
    talkTitle: "Vous préférez en parler ?",
    emailSubject: "Demande de réservation",
    whatsappMessage: "Bonjour ! J’aimerais de l’aide pour réserver un voyage.",
    whatsappLabel: "WhatsApp {phone}",
    unavailable:
      "Les demandes de réservation en ligne ouvrent bientôt. En attendant, écrivez à {email} ou appelez le {phone}.",
  },
  bookingForm: {
    honeypot: "Laissez ce champ vide",
    yourTrip: "Votre voyage",
    item: "Excursion ou séjour",
    chooseItem: "Choisissez une excursion ou un séjour…",
    groupTours: "Excursions",
    groupPackages: "Séjours",
    daysSuffix: "{days} jours",
    travellingFrom: "D’où venez-vous ?",
    preferredDate: "Date souhaitée",
    preferredDateHint: "Nous confirmerons les disponibilités pour cette date.",
    currency: "Devise",
    currencyHint: "Les prix sont fixés par devise et jamais convertis.",
    adults: "Adultes",
    children: "Enfants",
    childrenHint: "Moins de 12 ans.",
    estimate: "Total estimé : {total}",
    perAdult: "{price} par adulte",
    perChild: ", {price} par enfant",
    illustrative: " · prix d’exemple indicatifs",
    confirmNote: ". Notre équipe confirme avec vous le prix définitif.",
    noPrice:
      "Pas de prix en ligne pour ce choix — notre équipe vous fera un devis directement.",
    yourDetails: "Vos coordonnées",
    fullName: "Nom complet",
    email: "E-mail",
    phone: "Téléphone ou WhatsApp",
    phoneHint: "Indiquez votre indicatif pays.",
    pickup: "Hôtel ou lieu de prise en charge (facultatif)",
    message: "Questions ou demandes particulières (facultatif)",
    consentBefore:
      "J’accepte que Bound to Zanzibar utilise ces informations pour répondre à ma demande, comme décrit dans la",
    privacyPolicy: "politique de confidentialité",
    requestNoteBefore: "Ceci envoie une",
    requestWord: "demande",
    requestNoteAfter:
      ", pas une réservation confirmée. Aucun paiement n’est pris en ligne — notre équipe vous contactera pour confirmer les disponibilités et le prix définitif.",
    sending: "Envoi de la demande…",
    send: "Envoyer la demande de réservation",
  },
  received: {
    metaTitle: "Demande de réservation reçue",
    title: "Demande reçue",
    bodyBefore: "Merci ! Votre demande de réservation est",
    pending: "en attente",
    bodyAfter:
      "— elle n’est pas encore confirmée. Notre équipe vous contactera pour confirmer les disponibilités et le prix définitif.",
    nextTitle: "Et ensuite ?",
    next: [
      "Notre équipe vous répond par e-mail ou par téléphone à l’aide des coordonnées que vous avez fournies.",
      "Aucun paiement n’a été pris. Nous vous expliquerons comment payer une fois la réservation confirmée.",
      "Besoin de modifier quelque chose ? Contactez-nous en indiquant votre référence.",
    ],
    reference: "Votre référence",
    keep: "Conservez-la pour toute question.",
    whatsappMessage: "Bonjour ! La référence de ma demande de réservation est {ref}.",
    whatsapp: "Écrivez-nous sur WhatsApp au sujet de cette demande",
    browse: "Voir d’autres excursions",
  },
  legal: {
    eyebrow: "Mentions légales",
    privacyTitle: "Politique de confidentialité",
    privacyBody:
      "Comment nous collectons, utilisons et protégeons les données personnelles. La politique complète sera publiée une fois approuvée par le propriétaire de l’entreprise.",
    termsTitle: "Conditions générales",
    termsBody:
      "Conditions de réservation, d’annulation et de service. Les conditions complètes seront publiées une fois approuvées par le propriétaire de l’entreprise.",
    building: "Cette page est en cours de création et sera bientôt disponible.",
  },
  notFound: {
    title: "Cette page a dérivé de sa route",
    body: "La page que vous recherchez n’existe pas ou a été déplacée.",
    home: "Aller à l’accueil",
    browse: "Voir les excursions",
  },
  error: {
    title: "Une erreur s’est produite",
    body: "Nous n’avons pas pu charger cette page. Veuillez réessayer dans un instant.",
    retry: "Réessayer",
  },
  errors: {
    "Please check the highlighted fields.": "Veuillez vérifier les champs signalés.",
    "Choose a tour or package.": "Choisissez une excursion ou un séjour.",
    "Enter your full name.": "Indiquez votre nom complet.",
    "Enter your name.": "Indiquez votre nom.",
    "Use 120 characters or fewer.": "120 caractères maximum.",
    "Use 200 characters or fewer.": "200 caractères maximum.",
    "Use 300 characters or fewer.": "300 caractères maximum.",
    "Use 2,000 characters or fewer.": "2 000 caractères maximum.",
    "Use 4,000 characters or fewer.": "4 000 caractères maximum.",
    "That email address is too long.": "Cette adresse e-mail est trop longue.",
    "Enter a valid email address, like name@example.com.":
      "Indiquez une adresse e-mail valide, par exemple name@example.com.",
    "Enter a phone number with country code, like +255 712 345 678.":
      "Indiquez un numéro de téléphone avec l’indicatif pays, par exemple +255 712 345 678.",
    "Enter a phone number with country code, or leave it empty.":
      "Indiquez un numéro de téléphone avec l’indicatif pays, ou laissez ce champ vide.",
    "That phone number is too short.": "Ce numéro de téléphone est trop court.",
    "That phone number is too long.": "Ce numéro de téléphone est trop long.",
    "Choose where you're travelling from.": "Indiquez d’où vous venez.",
    "Choose a currency.": "Choisissez une devise.",
    "Choose your preferred date.": "Choisissez la date souhaitée.",
    "Choose a valid date.": "Choisissez une date valide.",
    "Choose a date from today onwards.": "Choisissez une date à partir d’aujourd’hui.",
    "We take requests up to two years ahead.":
      "Nous acceptons les demandes jusqu’à deux ans à l’avance.",
    "Please agree so we can reply to your request.":
      "Veuillez donner votre accord pour que nous puissions répondre à votre demande.",
    "Please agree so we can reply to you.":
      "Veuillez donner votre accord pour que nous puissions vous répondre.",
    "Tell us a little more (at least 10 characters).":
      "Dites-nous-en un peu plus (au moins 10 caractères).",
    "Please check your name.": "Veuillez vérifier votre nom.",
    "Please check your email address.": "Veuillez vérifier votre adresse e-mail.",
    "Please check your phone number.": "Veuillez vérifier votre numéro de téléphone.",
    "Please check your message.": "Veuillez vérifier votre message.",
    "Please check the number of travellers.": "Veuillez vérifier le nombre de voyageurs.",
    "Please choose a date between today and two years ahead.":
      "Veuillez choisir une date entre aujourd’hui et dans deux ans.",
    "Your pickup location or message is too long.":
      "Votre lieu de prise en charge ou votre message est trop long.",
    "Your phone number or subject is too long.":
      "Votre numéro de téléphone ou l’objet est trop long.",
    "That currency isn't available. Please choose another.":
      "Cette devise n’est pas disponible. Veuillez en choisir une autre.",
    "That tour or package is no longer available. Please choose another or contact us.":
      "Cette excursion ou ce séjour n’est plus disponible. Veuillez en choisir un autre ou nous contacter.",
    "We've received several requests from you recently. Please wait an hour or contact us directly.":
      "Nous avons reçu plusieurs demandes de votre part récemment. Veuillez patienter une heure ou nous contacter directement.",
    "We've received several messages from you recently. Please wait an hour or contact us directly.":
      "Nous avons reçu plusieurs messages de votre part récemment. Veuillez patienter une heure ou nous contacter directement.",
    "Thank you — your message has been sent. Our team will reply by email.":
      "Merci — votre message a été envoyé. Notre équipe vous répondra par e-mail.",
    "Enter the number of adults.": "Indiquez le nombre d’adultes.",
    "Enter the number of children.": "Indiquez le nombre d’enfants.",
    "At least 1 adult is required.": "Au moins 1 adulte est requis.",
    "For groups over 50, please contact us.":
      "Pour les groupes de plus de 50 personnes, veuillez nous contacter.",
    [`Online booking requests aren't available right now. Please email ${contact.email} or call ${contact.phoneDisplay} and we'll help you directly.`]: `Les demandes de réservation en ligne ne sont pas disponibles pour le moment. Écrivez à ${contact.email} ou appelez le ${contact.phoneDisplay} et nous vous aiderons directement.`,
    [`The contact form isn't available right now. Please email ${contact.email} or message us on WhatsApp at ${contact.phoneDisplay}.`]: `Le formulaire de contact n’est pas disponible pour le moment. Écrivez à ${contact.email} ou envoyez-nous un message sur WhatsApp au ${contact.phoneDisplay}.`,
  },
  assistant: {
    open: "Demander à l’IA",
    title: "Demandez à notre assistant IA",
    description:
      "Les réponses s’appuient sur les informations de ce site et peuvent contenir des erreurs. Notre équipe confirme chaque prix et chaque réservation. Merci de ne pas communiquer de données de paiement ici.",
    welcome:
      "Jambo ! Posez-moi vos questions sur nos excursions, safaris et séjours à Zanzibar — le programme, ce qui est inclus, les prix et le fonctionnement des réservations.",
    suggested: "Questions suggérées",
    suggestions: [
      "Quelles excursions conviennent à une famille avec de jeunes enfants ?",
      "Que faut-il emporter pour le snorkeling à Mnemba ?",
      "Peut-on faire un safari depuis Zanzibar en une journée ?",
      "Comment fonctionne la réservation ?",
    ],
    tourSuggestions: [
      "Qu’est-ce qui est inclus dans cette excursion ?",
      "Que faut-il emporter pour cette excursion ?",
      "Cette excursion convient-elle aux enfants ?",
      "Comment réserver cette excursion ?",
    ],
    packageSuggestions: [
      "Qu’est-ce qui est inclus dans ce séjour ?",
      "Ce séjour peut-il être adapté ?",
      "Qu’est-ce qui n’est pas inclus dans le prix ?",
      "Comment réserver ce séjour ?",
    ],
    you: "Vous :",
    assistant: "Assistant :",
    thinking: "Réflexion…",
    atLimit:
      "Cette conversation devient longue — commencez-en une nouvelle pour continuer.",
    yourQuestion: "Votre question",
    placeholder: "Posez une question sur les excursions, les prix, quoi emporter…",
    stop: "Arrêter la réponse",
    send: "Envoyer la question",
    newChat: "Nouvelle conversation",
    notConfigured:
      "Notre assistant IA n’est pas encore activé. Veuillez contacter notre équipe à {email} ou au {phone}.",
    rateLimited:
      "Vous avez envoyé beaucoup de questions en peu de temps. Veuillez patienter une minute et réessayer.",
    tooLong:
      "Cette conversation est trop longue. Commencez-en une nouvelle et posez à nouveau votre question.",
    failed:
      "Désolé, l’assistant n’est pas disponible pour le moment. Veuillez nous contacter à {email}.",
  },
};
