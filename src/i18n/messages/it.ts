import { contact } from "@/config/site";

import type { Messages } from "./en";

// AI-drafted Italian interface text (from en.ts); have a native speaker review it.
export const it: Messages = {
  meta: {
    siteName: "Bound to Zanzibar",
    tagline: "Il tuo viaggio inizia a Zanzibar.",
    description:
      "Escursioni a Zanzibar, safari in Tanzania e pacchetti di viaggio di più giorni per residenti, viaggiatori dell’Africa orientale e visitatori internazionali.",
  },
  language: {
    label: "Lingua",
    choose: "Scegli la lingua",
    machineNotice:
      "Questa pagina è stata tradotta automaticamente ed è in fase di revisione. Se qualcosa non è chiaro, chiedeteci pure.",
    viewEnglish: "Vedi in inglese",
  },
  nav: {
    home: "Home",
    tours: "Escursioni a Zanzibar",
    safari: "Safari",
    packages: "Pacchetti",
    destinations: "Destinazioni",
    travelGuide: "Guida di viaggio",
    about: "Chi siamo",
    contact: "Contatti",
    bookNow: "Prenota ora",
    main: "Principale",
    mobile: "Mobile",
    menu: "Menu",
    openMenu: "Apri il menu",
    skipToContent: "Vai al contenuto",
    quickContact: "Contatto rapido",
    topBar: "Zanzibar · Safari in Tanzania · Pacchetti",
    whatsapp: "WhatsApp",
    call: "Chiama",
    opensWhatsApp: "(apre WhatsApp)",
    opensNewTab: "(si apre in una nuova scheda)",
    instagramNewTab: "(Instagram, si apre in una nuova scheda)",
    breadcrumb: "Percorso di navigazione",
  },
  footer: {
    statementBefore: "Il tuo viaggio inizia a",
    statementPlace: "Zanzibar.",
    intro:
      "Indicateci le date e cosa vi piacerebbe vedere. Vi rispondiamo con un itinerario e confermiamo la disponibilità prima di qualsiasi prenotazione.",
    planJourney: "Organizza il tuo viaggio",
    whatsappUs: "Scrivici su WhatsApp",
    whatsappMessage: "Buongiorno! Vorrei organizzare un viaggio.",
    about:
      "Escursioni, safari e pacchetti di viaggio per viaggiatori locali e internazionali.",
    explore: "Esplora",
    company: "Azienda",
    legal: "Note legali",
    tanzaniaSafari: "Safari in Tanzania",
    bookATrip: "Prenota un viaggio",
    privacy: "Informativa sulla privacy",
    terms: "Termini e condizioni",
    getInTouch: "Contattaci",
    phone: "Telefono",
    email: "E-mail",
    officeAddress: "Indirizzo dell’ufficio",
    pending: "Da fornire a cura del titolare",
    followUs: "Seguici",
    linkPending: "(link da fornire a cura del titolare)",
    rights: "Tutti i diritti riservati.",
    place: "Zanzibar · Tanzania",
  },
  common: {
    sample: "Esempio",
    sampleContent: "Contenuto di esempio",
    view: "Vedi",
    viewExperience: "Vedi l’esperienza",
    viewItinerary: "Vedi l’itinerario",
    readGuide: "Leggi la guida",
    quickLook: "In breve",
    whatToExpect: "Cosa aspettarsi",
    included: "Incluso",
    notIncluded: "Non incluso",
    viewFullTour: "Vedi l’escursione completa",
    includesSafari: "Safari incluso",
    daysNights: "{days} giorni · {nights} notti",
    daysUnit: "giorni",
    daysThenNights: "giorni · {nights} notti",
    nightsShort: "{nights} notti",
    day: "Giorno",
    dayN: "Giorno {n}",
    moreDays: "+ altri {n} giorni",
    minRead: "{n} min di lettura",
    zanzibar: "Zanzibar",
    mainland: "Tanzania continentale",
    allTours: "Tutte le escursioni",
    allDestinations: "Tutte le destinazioni",
    allPackages: "Tutti i pacchetti",
    allArticles: "Tutti gli articoli",
    exploreTours: "Scopri le escursioni",
    contactUs: "Contattaci",
    backHome: "Torna alla home",
    placeholderImage: "Immagine provvisoria",
    placeholderIllustration: "(illustrazione provvisoria)",
    photo: "Foto",
    pause: "Metti in pausa la presentazione",
    play: "Avvia la presentazione",
    showPhoto: "Mostra la foto {n}: {caption}",
    photoOf: "Foto {n} di {total}: {alt}",
    heroPhotos: "Foto di apertura",
    loading: "Caricamento della pagina",
  },
  price: {
    showFor: "Mostra i prezzi per",
    from: "Da",
    illustrative: "Prezzo indicativo",
    onRequestFor: "Prezzo su richiesta per: {market}",
    adult: "Adulti",
    child: "Bambini",
    onRequest: "Su richiesta",
    illustrativeNote:
      "Prezzo di esempio indicativo — i prezzi definitivi saranno confermati dal nostro team.",
    samplePrices: "Escursioni di esempio e prezzi indicativi",
    sampleSafaris: "Safari di esempio e prezzi indicativi",
    samplePackages: "Pacchetti di esempio e prezzi indicativi",
  },
  markets: {
    international: { short: "Internazionale", long: "Visitatori internazionali" },
    resident: { short: "Residente in Tanzania", long: "Residenti in Tanzania" },
    east_african: { short: "Africa orientale", long: "Residenti in Africa orientale" },
  },
  marketHints: {
    international: "Visitatori provenienti da fuori dell’Africa orientale",
    east_african: "Residenti in un paese della Comunità dell’Africa orientale",
    resident: "Cittadini e residenti della Tanzania",
  },
  units: {
    "per person": "a persona",
    "per person sharing": "a persona in camera condivisa",
    "per group": "a gruppo",
    "per boat": "a barca",
    "per vehicle": "a veicolo",
  },
  difficulty: { easy: "Facile", moderate: "Media", challenging: "Impegnativa" },
  home: {
    eyebrow: "Zanzibar e Tanzania",
    intro:
      "Escursioni, safari e pacchetti di viaggio organizzati con conoscenza del territorio — per i residenti in Tanzania, i viaggiatori dell’Africa orientale e i visitatori di tutto il mondo.",
    exploreTours: "Scopri le escursioni",
    planJourney: "Organizza il tuo viaggio",
    counts: {
      experiences: "esperienze",
      destinations: "destinazioni",
      safaris: "safari",
    },
    insetAlt: "I tetti di Stone Town accanto al mare turchese",
    video: {
      label:
        "Video: viste aeree delle spiagge di Zanzibar, lagune turchesi, resort tra le palme e un tramonto sul mare",
      caption: "Zanzibar dall’alto",
      play: "Riproduci il video",
      pause: "Metti in pausa il video",
    },
    search: {
      label: "Trova un’esperienza",
      want: "Vorrei",
      wantPlaceholder: "Fare snorkeling, visitare Stone Town, vedere gli elefanti…",
      where: "Dove",
      anywhere: "Ovunque",
      type: "Tipo",
      allExperiences: "Tutte le esperienze",
      submit: "Trova esperienze",
    },
    destinations: {
      eyebrow: "Destinazioni",
      title: "Isole, città antiche e grandi pianure",
      description:
        "Dalle porte intagliate di Stone Town alla barriera di Mnemba e ai parchi del continente — inizia da un luogo.",
    },
    experiences: {
      eyebrow: "Esperienze più amate",
      title: "Zanzibar, un giorno alla volta",
    },
    travellers: {
      eyebrow: "Viaggia a modo tuo",
      title: "Un viaggio per ogni viaggiatore",
      description:
        "Dicci chi viene e costruiremo le giornate intorno a te: il ritmo, gli alloggi e i momenti che contano.",
      cta: "Scopri",
      items: {
        family: {
          title: "Famiglie",
          body: "Giornate rilassate tra animali, spiagge e storie dell’isola, per tutte le età.",
          alt: "Una famiglia con un bambino piccolo accanto a un veicolo da safari aperto nelle pianure della Tanzania",
        },
        couples: {
          title: "Coppie",
          body: "Giornate lente in spiaggia, uscite in barca al tramonto e cene a due.",
          alt: "Una coppia che si rilassa su un lettino in spiaggia a Zanzibar",
        },
        groups: {
          title: "Gruppi",
          body: "Amici, associazioni e rimpatriate, con un unico programma adatto a tutti.",
          alt: "Un gruppo di viaggiatori in posa davanti a una cascata in Tanzania",
        },
        honeymoon: {
          title: "Lune di miele",
          body: "Tramonti a piedi nudi, tempo solo per voi due e un safari indimenticabile.",
          alt: "Un picnic al tramonto sulla sabbia con cuscini e vino, davanti a barche tradizionali a Zanzibar",
        },
        solo: {
          title: "Viaggiatori solitari",
          body: "Viaggia al tuo ritmo e scopri l’isola con una guida locale.",
          alt: "Una donna che suona l’ukulele sulla spiaggia di Paje, a Zanzibar",
        },
      },
    },
    safari: {
      eyebrow: "Safari in Tanzania",
      title: "Dalla barriera corallina alle pianure",
      body: "Unite giornate sull’isola a un safari sul continente — da una lunga gita di un giorno a Mikumi a una vera avventura nel circuito nord, tra Serengeti e Ngorongoro.",
      cta: "Scopri i safari",
      elephantAlt: "Un elefante nel parco nazionale di Nyerere",
      caption: "In safari · Tanzania",
      videoLabel:
        "Video: un veicolo da safari al tramonto con giraffe, mongolfiere sopra le pianure, un bufalo, un elefante, una zebra e un leone in Tanzania",
    },
    packages: {
      eyebrow: "Pacchetti di più giorni",
      title: "Viaggi organizzati dall’inizio alla fine",
      description:
        "Alloggio, trasferimenti ed esperienze in un unico itinerario — adattabile al vostro budget.",
    },
    reviews: {
      eyebrow: "Recensioni degli ospiti",
      title: "Cosa dicono i nostri ospiti",
      soon: "Le recensioni degli ospiti arriveranno presto.",
      body: "Pubblichiamo solo recensioni autentiche di ospiti reali. Avete viaggiato con noi? Ci farebbe piacere sentire la vostra opinione.",
    },
    guide: { eyebrow: "Guida di viaggio", title: "Organizza il viaggio con sicurezza" },
  },
  why: {
    eyebrow: "Perché viaggiare con noi",
    title: "Organizzato sul posto, con cura",
    reasons: [
      {
        title: "Conoscenza del territorio",
        body: "Con sede a Zanzibar, organizziamo viaggi sull’isola e nella Tanzania continentale.",
      },
      {
        title: "Per residenti e visitatori",
        body: "Prezzi chiari per i residenti in Tanzania e per i viaggiatori internazionali, con opzioni per budget diversi.",
      },
      {
        title: "Prenotazione chiara e onesta",
        body: "Confermiamo con voi disponibilità e prezzi definitivi prima di qualsiasi prenotazione.",
      },
      {
        title: "Rispetto per le persone e i luoghi",
        body: "Promuoviamo l’osservazione responsabile della fauna e il rispetto per la cultura locale.",
      },
    ],
  },
  travelStyles: {
    luxury: "Lusso",
    adventure: "Avventura",
    romantic: "Romantico",
    family: "Famiglia",
    cultural: "Cultura",
    relaxation: "Relax",
    wildlife: "Fauna e safari",
  },
  tourLengths: {
    hours: "Qualche ora",
    half_day: "Mezza giornata",
    full_day: "Giornata intera",
    multi_day: "Più giorni",
  },
  travellerPage: {
    metaTitle: "{title}: viaggi a Zanzibar e in Tanzania",
    eyebrow: "Viaggia a modo tuo",
    tipsTitle: "Consigli per organizzare",
    suggestedEyebrow: "Esperienze consigliate",
    suggestedTitle: "Esperienze per: {title}",
    suggestedNote:
      "I suggerimenti si basano sullo stile di ogni viaggio. Definiamo i dettagli insieme a te.",
    planTitle: "Pronto a organizzare?",
    planBody:
      "Invia una richiesta con le date e il gruppo. Confermiamo disponibilità e prezzi con te; non si paga nulla online.",
    plan: "Organizza questo viaggio",
    ask: "Fai una domanda",
    others: "Altri modi di viaggiare",
    pages: {
      family: {
        intro: [
          "Zanzibar è adatta alle famiglie: brevi gite in barca, tartarughe giganti, tartarughe marine, foreste con le scimmie colobo rosso e spiagge tranquille, con i safari sul continente alla portata dei bambini più grandi.",
          "Indicaci l’età dei tuoi figli e come ti piace viaggiare, e ti proporremo un ritmo con pause tra un’uscita e l’altra.",
        ],
        tips: [
          "Alterna gite di mezza giornata a pomeriggi liberi in spiaggia.",
          "Le tartarughe giganti di Prison Island e i colobi rossi di Jozani piacciono molto ai bambini.",
          "Per un safari, chiedici quali parchi e quale durata sono adatti all’età dei tuoi figli.",
          "I prezzi per bambini sono indicati quando previsti; confermiamo il totale con te.",
        ],
      },
      couples: {
        intro: [
          "Mattine lente, banchi di sabbia bianca, crociere in dhow al tramonto e cene sul mare: Zanzibar è perfetta da vivere in due.",
          "Dicci cosa vi piace — spiagge tranquille, cultura, mare o fauna — e ti suggeriremo esperienze adatte a entrambi.",
        ],
        tips: [
          "Una crociera in dhow al tramonto è una prima serata semplice e bella.",
          "Abbina un banco di sabbia a giornate lente sulle spiagge della costa est.",
          "Aggiungi un breve safari sul continente per cambiare scenario.",
          "Avete qualcosa da festeggiare? Diccelo e ti proporremo delle idee.",
        ],
      },
      groups: {
        intro: [
          "Amici, famiglie che viaggiano insieme, associazioni e rimpatriate: organizziamo giornate adatte a tutti, dalle gite in barca e lo snorkeling alle passeggiate a Stone Town.",
          "Indicaci numero di persone, date e interessi. I gruppi numerosi si organizzano meglio con anticipo, quindi contattaci appena puoi.",
        ],
        tips: [
          "Le gite in barca di una giornata come Safari Blue sono ideali in gruppo.",
          "Alterna attività dinamiche come snorkeling e moto d’acqua a momenti di relax.",
          "Chiedici i prezzi di gruppo quando previsti.",
          "Segnalaci età o capacità diverse all’interno del gruppo.",
        ],
      },
      honeymoon: {
        intro: [
          "Tramonti a piedi nudi, banchi di sabbia tranquilli e la possibilità di un safari: Zanzibar e la Tanzania continentale rendono la luna di miele indimenticabile.",
          "Indicaci le date e i vostri desideri, e ti proporremo esperienze e un ritmo che lascino tanto tempo solo per voi due.",
        ],
        tips: [
          "Abbina giornate di mare a una crociera in dhow al tramonto.",
          "Un volo in mongolfiera sul Serengeti può essere aggiunto a un safari.",
          "Lascia giorni liberi tra un’esperienza e l’altra.",
          "Indica che è la vostra luna di miele quando ci contatti.",
        ],
      },
      solo: {
        intro: [
          "Viaggi da solo? I vicoli di Stone Town, le fattorie delle spezie, i corsi di cucina e le barriere coralline dell’isola si scoprono facilmente al tuo ritmo con una guida locale.",
          "Indicaci date, interessi e budget, e ti suggeriremo esperienze adatte ai tuoi piani.",
        ],
        tips: [
          "I tour culturali sono un modo rilassato per conoscere l’isola.",
          "Partecipa a una gita in barca per fare snorkeling e vedere la costa.",
          "Indicaci il budget per ricevere proposte adatte.",
          "Inviaci i dettagli di arrivo per organizzare i trasferimenti.",
        ],
      },
    },
  },
  tours: {
    metaTitle: "Escursioni ed esperienze a Zanzibar",
    metaDescription:
      "Escursioni ed esperienze giornaliere a Zanzibar: Stone Town, Prison Island, piantagioni di spezie, foresta di Jozani, snorkeling, banchi di sabbia e crociere in dhow.",
    eyebrow: "Esperienze",
    title: "Escursioni ed esperienze a Zanzibar",
    description:
      "Cultura, mare, foresta e spiaggia — escursioni ed esperienze in tutta Zanzibar. I safari sul continente sono nella pagina Safari.",
    headerAlt:
      "Vista aerea di uno stretto banco di sabbia bianca nell’acqua turchese al largo di Zanzibar",
    allTours: "Tutte le escursioni",
    filter: "Filtra le escursioni",
    searchLabel: "Cerca escursioni",
    searchPlaceholder: "Cerca escursioni, ad es. snorkeling",
    category: "Categoria",
    allCategories: "Tutte le categorie",
    destination: "Destinazione",
    allDestinations: "Tutte le destinazioni",
    search: "Cerca",
    found: "Esperienze trovate: {n}",
    clear: "Cancella i filtri",
    noneTitle: "Nessuna escursione corrisponde alla ricerca",
    noneBody:
      "Provate con un’altra parola chiave o cancellate i filtri. Potete anche contattarci — saremo felici di organizzare qualcosa su misura per voi.",
    lengthLabel: "Durata",
    anyLength: "Qualsiasi durata",
    styleLabel: "Stile di viaggio",
    anyStyle: "Qualsiasi stile",
    levelLabel: "Livello di attività",
    anyLevel: "Qualsiasi livello",
    budgetLabel: "Budget a persona",
    anyBudget: "Qualsiasi budget",
    budgetUpTo: "Fino a {max}",
    budgetBetween: "{min} – {max}",
    budgetOver: "Oltre {min}",
    budgetNote:
      "Il budget usa il prezzo del mercato selezionato. I viaggi con prezzo su richiesta sono nascosti quando imposti un budget.",
    planLabel: "Il tuo viaggio",
    dateLabel: "Data del viaggio",
    adultsLabel: "Adulti",
    childrenLabel: "Bambini",
    planNote:
      "La data e il numero di persone vengono inseriti nella tua richiesta di prenotazione. Il nostro team conferma la disponibilità.",
    moreFilters: "Più filtri",
    fewerFilters: "Meno filtri",
    viewDetails: "Vedi dettagli",
    bookNow: "Prenota",
  },
  tour: {
    notFound: "Escursione non trovata",
    facts: {
      duration: "Durata",
      destination: "Destinazione",
      difficulty: "Difficoltà",
      suitability: "Adatta a",
    },
    onThisPage: "In questa pagina",
    sections: {
      overview: "Panoramica",
      itinerary: "Programma",
      included: "Cosa è incluso",
      goodToKnow: "Da sapere",
      faqs: "FAQ",
    },
    about: "Informazioni sull’esperienza",
    highlights: "Punti salienti",
    whatToExpect: "Cosa aspettarsi",
    whatsIncluded: "Cosa è incluso",
    includedFallback:
      "Cosa è incluso dipende dall’itinerario che definiamo insieme ed è indicato nel vostro preventivo.",
    included: "Incluso",
    notIncluded: "Non incluso",
    whatToBring: "Cosa portare",
    goodToKnow: "Da sapere",
    meetingPoint: "Punto d’incontro e prelievo",
    faqs: "Domande frequenti",
    keepExploring: "Continua a esplorare",
    similar: "Esperienze simili",
  },
  generalFaqs: [
    {
      question: "Come si prenota?",
      answer:
        "Inviateci una richiesta via e-mail o telefono. Il nostro team conferma per iscritto disponibilità e prezzo definitivo prima di qualsiasi prenotazione.",
    },
    {
      question: "I prezzi sono definitivi?",
      answer:
        "I prezzi indicati come “indicativi” sono esempi. Il prezzo definitivo viene confermato dal nostro team quando rispondiamo alla vostra richiesta.",
    },
    {
      question: "Quali sono le condizioni di cancellazione?",
      answer:
        "Le condizioni di cancellazione dipendono dall’escursione e vengono confermate con la prenotazione. Chiedete al nostro team prima di prenotare.",
    },
    {
      question: "Le escursioni possono essere private o personalizzate?",
      answer:
        "Spesso sì. Diteci cosa avete in mente e il nostro team vi proporrà delle opzioni.",
    },
  ],
  enquiry: {
    label: "Prezzi e richieste",
    planTour: "Organizza questa escursione",
    planPackage: "Organizza questo pacchetto",
    prices: "Prezzi",
    requestToBook: "Richiedi la prenotazione",
    whatsapp: "Scrivici su WhatsApp",
    whatsappMessage: "Buongiorno! Sono interessato/a a: {item}.",
    email: "Richiedi via e-mail",
    emailSubject: "Richiesta: {item}",
    call: "Chiama il {phone}",
    note: "Una richiesta non è una prenotazione confermata. Il nostro team conferma disponibilità e prezzo definitivo prima di qualsiasi prenotazione, e non si effettuano pagamenti online.",
  },
  safari: {
    metaTitle: "Safari in Tanzania da Zanzibar",
    metaDescription:
      "Unite Zanzibar a un safari in Tanzania: Serengeti, Ngorongoro, Tarangire, Ruaha, Nyerere, trekking con gli scimpanzé e molto altro.",
    eyebrow: "Safari",
    title: "Safari in Tanzania, da Zanzibar",
    description:
      "Unite le spiagge e la cultura di Zanzibar alla fauna della Tanzania continentale.",
    howItWorks: "Come funzionano i nostri safari",
    points: [
      {
        title: "Isola + safari, un unico piano",
        body: "Voli, trasferimenti e giorni sull’isola organizzati come un unico viaggio.",
      },
      {
        title: "Proposte per ogni durata",
        body: "Da una lunga gita di un giorno a Mikumi a un safari di più giorni a nord, a sud o a ovest.",
      },
      {
        title: "Onesti sulle condizioni",
        body: "Gli avvistamenti di animali e gli orari dei voli non possono essere garantiti — vi diciamo cosa aspettarvi.",
      },
    ],
    experiencesEyebrow: "Esperienze di safari",
    experiencesTitle: "Esperienze di safari",
    experiencesDescription:
      "Gite giornaliere da Zanzibar e safari più lunghi nei parchi del nord, del sud e dell’ovest della Tanzania.",
    experienceCount: "Esperienze: {n}",
    circuits: {
      northern: "Safari del circuito nord",
      southern: "Safari del circuito sud",
      western: "Safari nella Tanzania occidentale",
      special: "Esperienze di safari speciali",
      more: "Altre esperienze di safari",
    },
    packagesEyebrow: "Isola + safari",
    packagesTitle: "Pacchetti safari",
    packagesDescription:
      "Viaggi di più giorni che uniscono un safari sul continente al soggiorno a Zanzibar.",
    parksEyebrow: "Parchi",
    parksTitle: "Dove andiamo in safari",
  },
  packages: {
    metaTitle: "Pacchetti di viaggio",
    metaDescription:
      "Pacchetti vacanza di più giorni a Zanzibar e combinazioni Zanzibar + safari in Tanzania con alloggio, trasferimenti ed escursioni.",
    eyebrow: "Viaggi di più giorni",
    title: "Pacchetti di viaggio",
    description:
      "Itinerari che riuniscono alloggio, trasferimenti ed esperienze. Ogni pacchetto può essere adattato alle vostre date, al gruppo e al budget.",
    headerAlt:
      "Palme che incorniciano una spiaggia soleggiata con lettini e acqua turchese",
    emptyTitle: "Pacchetti in arrivo",
    emptyBody:
      "Stiamo preparando i nostri primi pacchetti. Contattateci per organizzare un viaggio nel frattempo.",
    islandEyebrow: "L’isola",
    islandTitle: "Pacchetti sull’isola di Zanzibar",
    safariEyebrow: "Isola + continente",
    safariTitle: "Pacchetti Zanzibar + safari",
    aboutSafaris: "I nostri safari",
  },
  package: {
    notFound: "Pacchetto non trovato",
    destinations: "Destinazioni",
    facts: {
      length: "Durata",
      lengthValue: "{days} giorni / {nights} notti",
      accommodation: "Alloggio",
      transfers: "Trasferimenti",
      meals: "Pasti",
    },
    overview: "Panoramica",
    itinerary: "Itinerario giorno per giorno",
    overnight: "Pernottamento: {place}",
    noOvernight: "Nessun pernottamento",
    mealsList: "Pasti: {meals}",
    experiences: "Esperienze incluse",
    whatsIncluded: "Cosa è incluso",
    terms: "Condizioni",
  },
  destinations: {
    metaTitle: "Destinazioni",
    metaDescription:
      "Scoprite città, spiagge, barriere coralline e foreste di Zanzibar e i parchi safari della Tanzania continentale.",
    eyebrow: "Dove andare",
    title: "Destinazioni",
    description:
      "Dai vicoli di Stone Town alle barriere di Mnemba fino alle pianure dei parchi del continente.",
    headerAlt:
      "Vista aerea di onde che si infrangono nell’acqua turchese al largo della costa di Zanzibar",
    sample: "Guide alle destinazioni di esempio",
    islandsEyebrow: "Le isole",
    safariEyebrow: "In safari",
  },
  destination: {
    notFound: "Destinazione non trovata",
    about: "Informazioni su {name}",
    highlights: "Punti salienti",
    experiencesEyebrow: "Esperienze",
    experiencesTitle: "Esperienze: {name}",
    noToursTitle: "Ancora nessuna escursione giornaliera qui",
    noToursBody:
      "Questa destinazione fa parte dei nostri pacchetti, oppure contattateci e organizzeremo una visita per voi.",
    packagesEyebrow: "Pacchetti",
    packagesTitle: "Pacchetti che includono {name}",
  },
  guide: {
    metaTitle: "Guida di viaggio",
    metaDescription:
      "Consigli pratici per organizzare un viaggio a Zanzibar e in Tanzania: stagioni, cultura e valigia.",
    eyebrow: "Organizza il viaggio",
    title: "Guida di viaggio",
    description:
      "Consigli pratici e onesti per organizzare la vostra visita a Zanzibar e in Tanzania.",
    sample: "Articoli di esempio — da rivedere a cura del titolare",
    all: "Tutti gli articoli",
    emptyTitle: "Articoli in arrivo",
    emptyBody: "Stiamo scrivendo le nostre prime guide di viaggio.",
    notFound: "Articolo non trovato",
    backToAll: "Tutti gli articoli della guida",
    keepReading: "Continua a leggere",
    more: "Altro dalla guida di viaggio",
  },
  about: {
    metaTitle: "Chi siamo",
    metaDescription:
      "Chi è Bound to Zanzibar: un’agenzia di viaggi con sede a Zanzibar per viaggiatori locali e internazionali.",
    eyebrow: "La nostra storia",
    title: "Chi è Bound to Zanzibar",
    description:
      "Un marchio di turismo e viaggi con sede a Zanzibar per i residenti in Tanzania, i viaggiatori dell’Africa orientale e i visitatori di tutto il mondo.",
    headerAlt: "Palme da cocco piegate su un tetto di paglia su una spiaggia di Zanzibar",
    draft: "Testo provvisorio — da rivedere a cura del titolare",
    lead: "Bound to Zanzibar aiuta i viaggiatori a scoprire Zanzibar e la Tanzania continentale — da una passeggiata di mezza giornata a Stone Town a un safari di più giorni unito a un soggiorno sulla costa.",
    p1: "Organizziamo viaggi per coppie, famiglie, gruppi e viaggiatori singoli, per ospiti locali e internazionali. Questo significa prezzi chiari per residenti e visitatori e proposte adatte a budget diversi.",
    p2: "Ogni viaggio inizia con una conversazione. Diteci cosa vi piacerebbe vedere e quando: vi proporremo un itinerario e confermeremo la disponibilità prima di qualsiasi prenotazione.",
    toBePublished: "Da pubblicare",
    companyDetails: "Dati aziendali",
    companyBody:
      "La nostra storia, il team, i dati di registrazione e le licenze saranno pubblicati qui una volta forniti e verificati.",
    ready: "Pronti a organizzare il viaggio?",
  },
  contact: {
    metaTitle: "Contatti",
    metaDescription:
      "Contattate Bound to Zanzibar per organizzare un’escursione, un safari o un pacchetto di viaggio a Zanzibar.",
    eyebrow: "Contattaci",
    title: "Contatti",
    description:
      "Domande su un’escursione, un pacchetto o un safari? Scriveteci e il nostro team vi risponderà.",
    direct: "Parlate direttamente con noi",
    channels: {
      email: "E-mail",
      emailNote: "Indicateci le date, il numero di persone e cosa vi piacerebbe fare.",
      emailSubject: "Richiesta di viaggio",
      phone: "Telefono",
      phoneNote: "Chiamateci per parlare dei vostri progetti.",
      whatsapp: "WhatsApp",
      whatsappNote: "Inviateci un messaggio su WhatsApp.",
      whatsappMessage: "Buongiorno! Vorrei informazioni su un viaggio.",
      instagram: "Instagram",
      instagramNote: "Seguiteci e inviateci un messaggio.",
    },
    officeTitle: "Indirizzo dell’ufficio",
    officeBody: "Zanzibar, Tanzania. Indirizzo completo da fornire a cura del titolare.",
    formTitle: "Inviateci un messaggio",
    formIntroBefore:
      "Chiedeteci qualsiasi cosa su escursioni, safari o pacchetti. Per prenotare un viaggio specifico, usate il",
    formIntroLink: "modulo di richiesta di prenotazione",
    formUnavailable:
      "Il modulo online sarà presto disponibile. Nel frattempo scriveteci via e-mail, chiamateci o contattateci su WhatsApp.",
  },
  enquiryForm: {
    honeypot: "Lasciare vuoto questo campo",
    name: "Nome",
    email: "E-mail",
    phone: "Telefono o WhatsApp (facoltativo)",
    phoneHint: "Includete il prefisso internazionale.",
    subject: "Oggetto (facoltativo)",
    subjectPlaceholder: "ad es. Safari a marzo",
    message: "Messaggio",
    messagePlaceholder: "Le vostre date, il numero di persone e cosa vi piacerebbe fare.",
    consentBefore:
      "Acconsento all’uso di questi dati da parte di Bound to Zanzibar per rispondermi, come descritto nell’",
    privacyPolicy: "informativa sulla privacy",
    sending: "Invio in corso…",
    send: "Invia il messaggio",
    sendAnother: "Invia un altro messaggio",
  },
  book: {
    tripNotes: {
      family: "Stiamo organizzando un viaggio in famiglia.",
      couples: "Siamo una coppia e stiamo organizzando un viaggio.",
      groups: "Stiamo organizzando un viaggio di gruppo.",
      honeymoon: "Stiamo organizzando la nostra luna di miele.",
      solo: "Sto organizzando un viaggio da solo.",
    },
    metaTitle: "Prenota un viaggio",
    metaDescription:
      "Inviate una richiesta di prenotazione per un’escursione, un safari o un pacchetto a Zanzibar. Il nostro team conferma con voi disponibilità e prezzo definitivo.",
    eyebrow: "Prenotazione",
    title: "Richiedi una prenotazione",
    description:
      "Diteci cosa vorreste fare e quando. Si tratta di una richiesta — nulla viene prenotato o addebitato finché il nostro team non lo conferma con voi.",
    loadingForm: "Caricamento del modulo di prenotazione…",
    howTitle: "Come funziona la prenotazione",
    steps: [
      "Scegliete un’escursione o un pacchetto e inviate la data preferita e il numero di persone.",
      "Ricevete subito un numero di riferimento.",
      "Il nostro team verifica la disponibilità e vi risponde con i dettagli e il prezzo definitivo.",
      "La prenotazione è confermata solo quando il nostro team la conferma per iscritto.",
    ],
    talkTitle: "Preferite parlarne?",
    emailSubject: "Richiesta di prenotazione",
    whatsappMessage: "Buongiorno! Vorrei aiuto per prenotare un viaggio.",
    whatsappLabel: "WhatsApp {phone}",
    unavailable:
      "Le richieste di prenotazione online saranno presto disponibili. Nel frattempo scrivete a {email} o chiamate il {phone}.",
  },
  bookingForm: {
    honeypot: "Lasciare vuoto questo campo",
    yourTrip: "Il vostro viaggio",
    item: "Escursione o pacchetto",
    chooseItem: "Scegliete un’escursione o un pacchetto…",
    groupTours: "Escursioni",
    groupPackages: "Pacchetti",
    daysSuffix: "{days} giorni",
    travellingFrom: "Da dove viaggiate?",
    preferredDate: "Data preferita",
    preferredDateHint: "Confermeremo la disponibilità per questa data.",
    currency: "Valuta",
    currencyHint: "I prezzi sono fissati per valuta e mai convertiti.",
    adults: "Adulti",
    children: "Bambini",
    childrenHint: "Sotto i 12 anni.",
    estimate: "Totale stimato: {total}",
    perAdult: "{price} per adulto",
    perChild: ", {price} per bambino",
    illustrative: " · prezzi di esempio indicativi",
    confirmNote: ". Il nostro team conferma con voi il prezzo definitivo.",
    noPrice:
      "Nessun prezzo online per questa scelta — il nostro team vi invierà un preventivo.",
    yourDetails: "I vostri dati",
    fullName: "Nome e cognome",
    email: "E-mail",
    phone: "Telefono o WhatsApp",
    phoneHint: "Includete il prefisso internazionale.",
    pickup: "Hotel o zona di prelievo (facoltativo)",
    message: "Domande o richieste particolari (facoltativo)",
    consentBefore:
      "Acconsento all’uso di questi dati da parte di Bound to Zanzibar per rispondere alla mia richiesta, come descritto nell’",
    privacyPolicy: "informativa sulla privacy",
    requestNoteBefore: "Così inviate una",
    requestWord: "richiesta",
    requestNoteAfter:
      ", non una prenotazione confermata. Non si effettuano pagamenti online — il nostro team vi contatterà per confermare disponibilità e prezzo definitivo.",
    sending: "Invio della richiesta…",
    send: "Invia la richiesta di prenotazione",
  },
  received: {
    metaTitle: "Richiesta di prenotazione ricevuta",
    title: "Richiesta ricevuta",
    bodyBefore: "Grazie! La vostra richiesta di prenotazione è",
    pending: "in attesa",
    bodyAfter:
      "— non è ancora confermata. Il nostro team vi contatterà per confermare disponibilità e prezzo definitivo.",
    nextTitle: "Cosa succede ora",
    next: [
      "Il nostro team vi risponde via e-mail o telefono usando i dati che ci avete fornito.",
      "Non è stato effettuato alcun pagamento. Vi spiegheremo come pagare dopo la conferma.",
      "Dovete modificare qualcosa? Contattateci indicando il vostro riferimento.",
    ],
    reference: "Il vostro riferimento",
    keep: "Conservatelo per eventuali domande.",
    whatsappMessage:
      "Buongiorno! Il riferimento della mia richiesta di prenotazione è {ref}.",
    whatsapp: "Scriveteci su WhatsApp per questa richiesta",
    browse: "Vedi altre escursioni",
  },
  legal: {
    eyebrow: "Note legali",
    privacyTitle: "Informativa sulla privacy",
    privacyBody:
      "Come raccogliamo, utilizziamo e proteggiamo i dati personali. L’informativa completa sarà pubblicata una volta approvata dal titolare.",
    termsTitle: "Termini e condizioni",
    termsBody:
      "Condizioni di prenotazione, cancellazione e servizio. I termini completi saranno pubblicati una volta approvati dal titolare.",
    building: "Questa pagina è in costruzione e sarà presto disponibile.",
  },
  notFound: {
    title: "Questa pagina ha perso la rotta",
    body: "La pagina che cercate non esiste o è stata spostata.",
    home: "Vai alla home",
    browse: "Vedi le escursioni",
  },
  error: {
    title: "Si è verificato un errore",
    body: "Non siamo riusciti a caricare questa pagina. Riprovate tra un momento.",
    retry: "Riprova",
  },
  errors: {
    "Please check the highlighted fields.": "Controllate i campi evidenziati.",
    "Choose a tour or package.": "Scegliete un’escursione o un pacchetto.",
    "Enter your full name.": "Inserite nome e cognome.",
    "Enter your name.": "Inserite il vostro nome.",
    "Use 120 characters or fewer.": "Massimo 120 caratteri.",
    "Use 200 characters or fewer.": "Massimo 200 caratteri.",
    "Use 300 characters or fewer.": "Massimo 300 caratteri.",
    "Use 2,000 characters or fewer.": "Massimo 2.000 caratteri.",
    "Use 4,000 characters or fewer.": "Massimo 4.000 caratteri.",
    "That email address is too long.": "Questo indirizzo e-mail è troppo lungo.",
    "Enter a valid email address, like name@example.com.":
      "Inserite un indirizzo e-mail valido, ad es. name@example.com.",
    "Enter a phone number with country code, like +255 712 345 678.":
      "Inserite un numero di telefono con prefisso internazionale, ad es. +255 712 345 678.",
    "Enter a phone number with country code, or leave it empty.":
      "Inserite un numero di telefono con prefisso internazionale oppure lasciate il campo vuoto.",
    "That phone number is too short.": "Questo numero di telefono è troppo corto.",
    "That phone number is too long.": "Questo numero di telefono è troppo lungo.",
    "Choose where you're travelling from.": "Indicate da dove viaggiate.",
    "Choose a currency.": "Scegliete una valuta.",
    "Choose your preferred date.": "Scegliete la data preferita.",
    "Choose a valid date.": "Scegliete una data valida.",
    "Choose a date from today onwards.": "Scegliete una data a partire da oggi.",
    "We take requests up to two years ahead.":
      "Accettiamo richieste fino a due anni di anticipo.",
    "Please agree so we can reply to your request.":
      "Date il vostro consenso affinché possiamo rispondere alla richiesta.",
    "Please agree so we can reply to you.":
      "Date il vostro consenso affinché possiamo rispondervi.",
    "Tell us a little more (at least 10 characters).":
      "Diteci qualcosa in più (almeno 10 caratteri).",
    "Please check your name.": "Controllate il nome.",
    "Please check your email address.": "Controllate l’indirizzo e-mail.",
    "Please check your phone number.": "Controllate il numero di telefono.",
    "Please check your message.": "Controllate il messaggio.",
    "Please check the number of travellers.": "Controllate il numero di viaggiatori.",
    "Please choose a date between today and two years ahead.":
      "Scegliete una data compresa tra oggi e i prossimi due anni.",
    "Your pickup location or message is too long.":
      "Il luogo di prelievo o il messaggio è troppo lungo.",
    "Your phone number or subject is too long.":
      "Il numero di telefono o l’oggetto è troppo lungo.",
    "That currency isn't available. Please choose another.":
      "Questa valuta non è disponibile. Sceglietene un’altra.",
    "That tour or package is no longer available. Please choose another or contact us.":
      "Questa escursione o questo pacchetto non è più disponibile. Sceglietene un altro o contattateci.",
    "We've received several requests from you recently. Please wait an hour or contact us directly.":
      "Abbiamo ricevuto di recente diverse richieste da parte vostra. Attendete un’ora o contattateci direttamente.",
    "We've received several messages from you recently. Please wait an hour or contact us directly.":
      "Abbiamo ricevuto di recente diversi messaggi da parte vostra. Attendete un’ora o contattateci direttamente.",
    "Thank you — your message has been sent. Our team will reply by email.":
      "Grazie — il vostro messaggio è stato inviato. Il nostro team risponderà via e-mail.",
    "Enter the number of adults.": "Inserite il numero di adulti.",
    "Enter the number of children.": "Inserite il numero di bambini.",
    "At least 1 adult is required.": "È richiesto almeno 1 adulto.",
    "For groups over 50, please contact us.":
      "Per gruppi di oltre 50 persone, contattateci.",
    [`Online booking requests aren't available right now. Please email ${contact.email} or call ${contact.phoneDisplay} and we'll help you directly.`]: `Le richieste di prenotazione online non sono disponibili al momento. Scrivete a ${contact.email} o chiamate il ${contact.phoneDisplay} e vi aiuteremo direttamente.`,
    [`The contact form isn't available right now. Please email ${contact.email} or message us on WhatsApp at ${contact.phoneDisplay}.`]: `Il modulo di contatto non è disponibile al momento. Scrivete a ${contact.email} o inviateci un messaggio su WhatsApp al ${contact.phoneDisplay}.`,
  },
  assistant: {
    open: "Chiedi all’IA",
    title: "Chiedi al nostro assistente IA",
    description:
      "Le risposte si basano sulle informazioni di questo sito e possono contenere errori. Il nostro team conferma ogni prezzo e prenotazione. Non condividete qui dati di pagamento.",
    welcome:
      "Jambo! Chiedetemi delle nostre escursioni, safari e pacchetti a Zanzibar — cosa aspettarsi, cosa è incluso, prezzi e come funziona la prenotazione.",
    suggested: "Domande suggerite",
    suggestions: [
      "Quali escursioni sono adatte a una famiglia con bambini piccoli?",
      "Cosa devo portare per lo snorkeling a Mnemba?",
      "Si può fare un safari da Zanzibar in un giorno?",
      "Come funziona la prenotazione?",
    ],
    tourSuggestions: [
      "Cosa è incluso in questa escursione?",
      "Cosa devo portare per questa escursione?",
      "Questa escursione è adatta ai bambini?",
      "Come prenoto questa escursione?",
    ],
    packageSuggestions: [
      "Cosa include questo pacchetto?",
      "Questo pacchetto si può personalizzare?",
      "Cosa non è incluso nel prezzo?",
      "Come prenoto questo pacchetto?",
    ],
    you: "Voi:",
    assistant: "Assistente:",
    thinking: "Sto pensando…",
    atLimit: "Questa chat sta diventando lunga — iniziatene una nuova per continuare.",
    yourQuestion: "La vostra domanda",
    placeholder: "Chiedete di escursioni, prezzi, cosa portare…",
    stop: "Interrompi la risposta",
    send: "Invia la domanda",
    newChat: "Nuova chat",
    notConfigured:
      "Il nostro assistente IA non è ancora attivo. Contattate il nostro team a {email} o al {phone}.",
    rateLimited:
      "Avete inviato molte domande in poco tempo. Attendete un minuto e riprovate.",
    tooLong:
      "Questa conversazione è troppo lunga. Iniziate una nuova chat e chiedete di nuovo.",
    failed:
      "Spiacenti, l’assistente non è disponibile al momento. Contattateci a {email}.",
  },
};
