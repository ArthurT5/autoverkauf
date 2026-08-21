// Request-wizard strings (all four locales, kept in sync) + curated car data.
// Lives in its own module so ui.ts stays lean; the Astro page picks the locale
// dict and passes it into the RequestWizard island.

export interface WizardDict {
  // chrome
  kicker: string;
  ofSteps: string; // "of" in "02 / 06" context is numeric; kept for a11y label
  back: string;
  next: string;
  skip: string;
  submit: string;
  edit: string;
  // reassurance
  free: string;
  anon: string;
  // step 1 — car
  s1q: string;
  s1makeLabel: string;
  s1anyMake: string;
  s1searchMakes: string;
  s1modelLabel: string;
  s1modelPlaceholder: string;
  s1anyModel: string;
  s1orSimilar: string;
  s1orSimilarHint: string;
  s1bodyLabel: string;
  bodies: string[]; // 6 body types
  anyBody: string;
  // step 2 — budget
  s2q: string;
  s2upTo: string;
  s2hint: string;
  // step 3 — year & mileage
  s3q: string;
  s3fromYear: string;
  s3maxKm: string;
  anyYear: string;
  // step 4 — fuel & gearbox
  s4q: string;
  s4fuelLabel: string;
  fuels: string[]; // petrol, diesel, hybrid, phev, electric
  s4gearLabel: string;
  gears: string[]; // automatic, manual
  any: string;
  // step 5 — region
  s5q: string;
  s5cantonLabel: string;
  s5wholeCH: string;
  s5radius: string;
  s5plzLabel: string;
  s5plzPlaceholder: string;
  optional: string;
  // step 6 — contact
  s6q: string;
  s6emailLabel: string;
  s6emailPlaceholder: string;
  s6emailError: string;
  s6note: string;
  s6password: string;
  s6passwordHint: string;
  s6haveAccount: string;
  s6newHere: string;
  s6signedInAs: string;
  s6errWrong: string;
  s6errExists: string;
  s6errWeak: string;
  s6errGeneric: string;
  cDashboard: string;
  // dossier
  dTitle: string;
  dMake: string;
  dModel: string;
  dBody: string;
  dBudget: string;
  dYear: string;
  dKm: string;
  dFuel: string;
  dGear: string;
  dRegion: string;
  dYourRequest: string;
  // confirmation
  cTitle: string;
  cLead: string;
  cNext1: string;
  cNext2: string;
  cNext3: string;
  cHome: string;
  cAgain: string;
  // misc
  stepLabel: string; // "Step"
}

export const wizardDicts: Record<"en" | "de" | "fr" | "it", WizardDict> = {
  en: {
    kicker: "Your request",
    ofSteps: "of",
    back: "Back",
    next: "Next",
    skip: "Skip",
    submit: "Get offers",
    edit: "Edit",
    free: "Free & no obligation",
    anon: "Anonymous until you choose",
    s1q: "What car are you looking for?",
    s1makeLabel: "Make",
    s1anyMake: "Any make",
    s1searchMakes: "Search makes…",
    s1modelLabel: "Model",
    s1modelPlaceholder: "e.g. 3 Series Touring",
    s1anyModel: "Any model",
    s1orSimilar: "or similar",
    s1orSimilarHint: "Dealers can also offer comparable models.",
    s1bodyLabel: "Body type",
    bodies: ["SUV", "Estate", "Sedan", "Hatchback", "Van", "Coupé / Cabrio"],
    anyBody: "Any body type",
    s2q: "What's your budget?",
    s2upTo: "up to",
    s2hint: "Tap the amount to type it",
    s3q: "Year & mileage",
    s3fromYear: "First registration from",
    s3maxKm: "Mileage up to",
    anyYear: "Any",
    s4q: "Fuel & transmission",
    s4fuelLabel: "Fuel",
    fuels: ["Petrol", "Diesel", "Hybrid", "Plug-in hybrid", "Electric"],
    s4gearLabel: "Transmission",
    gears: ["Automatic", "Manual"],
    any: "Any",
    s5q: "Where are you?",
    s5cantonLabel: "Your canton",
    s5wholeCH: "All of Switzerland",
    s5radius: "Search radius",
    s5plzLabel: "Postcode",
    s5plzPlaceholder: "e.g. 8001",
    optional: "optional",
    s6q: "Where should offers go?",
    s6emailLabel: "Email",
    s6emailPlaceholder: "you@example.ch",
    s6emailError: "Please enter a valid email address.",
    s6note: "Verified Swiss dealers answer your request. You stay anonymous — dealers only see your requirements, never your contact details, until you choose an offer.",
    s6password: "Password",
    s6passwordHint: "At least 8 characters — this creates your account, so every offer lands in your dashboard.",
    s6haveAccount: "Already have an account? Sign in",
    s6newHere: "New here? Create an account",
    s6signedInAs: "Signed in as",
    s6errWrong: "Wrong email or password.",
    s6errExists: "An account with this email already exists — the password didn't match. Try signing in.",
    s6errWeak: "Password must be at least 8 characters.",
    s6errGeneric: "Something went wrong. Please try again.",
    cDashboard: "Open your dashboard",
    dTitle: "Your request",
    dMake: "Make",
    dModel: "Model",
    dBody: "Body",
    dBudget: "Budget",
    dYear: "Year",
    dKm: "Mileage",
    dFuel: "Fuel",
    dGear: "Gearbox",
    dRegion: "Region",
    dYourRequest: "Your request",
    cTitle: "Request received.",
    cLead: "Your request is on its way to verified Swiss dealers.",
    cNext1: "Verified dealers that can match your request see it — anonymously.",
    cNext2: "Matching offers with a firm price typically arrive within 24 hours.",
    cNext3: "You compare side by side and choose — or walk away. Always free.",
    cHome: "Back to home",
    cAgain: "Start another request",
    stepLabel: "Step",
  },
  de: {
    kicker: "Deine Anfrage",
    ofSteps: "von",
    back: "Zurück",
    next: "Weiter",
    skip: "Überspringen",
    submit: "Angebote erhalten",
    edit: "Ändern",
    free: "Kostenlos & unverbindlich",
    anon: "Anonym, bis du wählst",
    s1q: "Welches Auto suchst du?",
    s1makeLabel: "Marke",
    s1anyMake: "Beliebige Marke",
    s1searchMakes: "Marke suchen…",
    s1modelLabel: "Modell",
    s1modelPlaceholder: "z. B. 3er Touring",
    s1anyModel: "Beliebiges Modell",
    s1orSimilar: "oder ähnliche",
    s1orSimilarHint: "Händler dürfen auch vergleichbare Modelle anbieten.",
    s1bodyLabel: "Karosserie",
    bodies: ["SUV", "Kombi", "Limousine", "Kleinwagen", "Van", "Coupé / Cabrio"],
    anyBody: "Beliebige Karosserie",
    s2q: "Wie hoch ist dein Budget?",
    s2upTo: "bis",
    s2hint: "Tippe auf den Betrag, um ihn einzugeben",
    s3q: "Baujahr & Kilometer",
    s3fromYear: "Erstzulassung ab",
    s3maxKm: "Kilometerstand bis",
    anyYear: "Egal",
    s4q: "Treibstoff & Getriebe",
    s4fuelLabel: "Treibstoff",
    fuels: ["Benzin", "Diesel", "Hybrid", "Plug-in-Hybrid", "Elektro"],
    s4gearLabel: "Getriebe",
    gears: ["Automat", "Handschaltung"],
    any: "Egal",
    s5q: "Wo bist du?",
    s5cantonLabel: "Dein Kanton",
    s5wholeCH: "Ganze Schweiz",
    s5radius: "Suchradius",
    s5plzLabel: "PLZ",
    s5plzPlaceholder: "z. B. 8001",
    optional: "optional",
    s6q: "Wohin sollen die Angebote?",
    s6emailLabel: "E-Mail",
    s6emailPlaceholder: "du@beispiel.ch",
    s6emailError: "Bitte gib eine gültige E-Mail-Adresse ein.",
    s6note: "Verifizierte Schweizer Händler beantworten deine Anfrage. Du bleibst anonym — Händler sehen nur deine Kriterien, nie deine Kontaktdaten, bis du ein Angebot wählst.",
    s6password: "Passwort",
    s6passwordHint: "Mindestens 8 Zeichen — damit entsteht dein Konto, und jedes Angebot landet in deinem Dashboard.",
    s6haveAccount: "Schon ein Konto? Anmelden",
    s6newHere: "Neu hier? Konto erstellen",
    s6signedInAs: "Angemeldet als",
    s6errWrong: "E-Mail oder Passwort falsch.",
    s6errExists: "Mit dieser E-Mail existiert bereits ein Konto — das Passwort stimmt nicht. Versuche dich anzumelden.",
    s6errWeak: "Das Passwort muss mindestens 8 Zeichen haben.",
    s6errGeneric: "Etwas ist schiefgelaufen. Bitte versuche es erneut.",
    cDashboard: "Zum Dashboard",
    dTitle: "Deine Anfrage",
    dMake: "Marke",
    dModel: "Modell",
    dBody: "Karosserie",
    dBudget: "Budget",
    dYear: "Baujahr",
    dKm: "Kilometer",
    dFuel: "Treibstoff",
    dGear: "Getriebe",
    dRegion: "Region",
    dYourRequest: "Deine Anfrage",
    cTitle: "Anfrage erhalten.",
    cLead: "Deine Anfrage ist auf dem Weg zu verifizierten Schweizer Händlern.",
    cNext1: "Verifizierte Händler, die zu deiner Anfrage passen, sehen sie — anonym.",
    cNext2: "Passende Angebote mit Festpreis treffen in der Regel innert 24 Stunden ein.",
    cNext3: "Du vergleichst nebeneinander und wählst — oder lässt es. Immer kostenlos.",
    cHome: "Zur Startseite",
    cAgain: "Neue Anfrage starten",
    stepLabel: "Schritt",
  },
  fr: {
    kicker: "Votre demande",
    ofSteps: "sur",
    back: "Retour",
    next: "Suivant",
    skip: "Passer",
    submit: "Recevoir des offres",
    edit: "Modifier",
    free: "Gratuit & sans engagement",
    anon: "Anonyme jusqu'à votre choix",
    s1q: "Quelle voiture cherchez-vous ?",
    s1makeLabel: "Marque",
    s1anyMake: "Toute marque",
    s1searchMakes: "Chercher une marque…",
    s1modelLabel: "Modèle",
    s1modelPlaceholder: "p. ex. 3 Series Touring",
    s1anyModel: "Tout modèle",
    s1orSimilar: "ou similaire",
    s1orSimilarHint: "Les concessionnaires peuvent aussi proposer des modèles comparables.",
    s1bodyLabel: "Carrosserie",
    bodies: ["SUV", "Break", "Berline", "Citadine", "Monospace", "Coupé / Cabriolet"],
    anyBody: "Toute carrosserie",
    s2q: "Quel est votre budget ?",
    s2upTo: "jusqu'à",
    s2hint: "Touchez le montant pour le saisir",
    s3q: "Année & kilométrage",
    s3fromYear: "Première immatriculation dès",
    s3maxKm: "Kilométrage jusqu'à",
    anyYear: "Indifférent",
    s4q: "Carburant & boîte",
    s4fuelLabel: "Carburant",
    fuels: ["Essence", "Diesel", "Hybride", "Hybride rechargeable", "Électrique"],
    s4gearLabel: "Boîte",
    gears: ["Automatique", "Manuelle"],
    any: "Indifférent",
    s5q: "Où êtes-vous ?",
    s5cantonLabel: "Votre canton",
    s5wholeCH: "Toute la Suisse",
    s5radius: "Rayon de recherche",
    s5plzLabel: "NPA",
    s5plzPlaceholder: "p. ex. 1201",
    optional: "facultatif",
    s6q: "Où envoyer les offres ?",
    s6emailLabel: "E-mail",
    s6emailPlaceholder: "vous@exemple.ch",
    s6emailError: "Veuillez saisir une adresse e-mail valide.",
    s6note: "Des garages suisses vérifiés répondent à votre demande. Vous restez anonyme — les garages voient uniquement vos critères, jamais vos coordonnées, jusqu'à ce que vous choisissiez une offre.",
    s6password: "Mot de passe",
    s6passwordHint: "Au moins 8 caractères — cela crée votre compte, et chaque offre arrive dans votre tableau de bord.",
    s6haveAccount: "Déjà un compte ? Se connecter",
    s6newHere: "Nouveau ici ? Créer un compte",
    s6signedInAs: "Connecté en tant que",
    s6errWrong: "E-mail ou mot de passe incorrect.",
    s6errExists: "Un compte existe déjà avec cet e-mail — le mot de passe ne correspond pas. Essayez de vous connecter.",
    s6errWeak: "Le mot de passe doit contenir au moins 8 caractères.",
    s6errGeneric: "Une erreur est survenue. Veuillez réessayer.",
    cDashboard: "Ouvrir le tableau de bord",
    dTitle: "Votre demande",
    dMake: "Marque",
    dModel: "Modèle",
    dBody: "Carrosserie",
    dBudget: "Budget",
    dYear: "Année",
    dKm: "Kilométrage",
    dFuel: "Carburant",
    dGear: "Boîte",
    dRegion: "Région",
    dYourRequest: "Votre demande",
    cTitle: "Demande reçue.",
    cLead: "Votre demande est en route vers des garages suisses vérifiés.",
    cNext1: "Les garages vérifiés qui peuvent y répondre la voient — anonymement.",
    cNext2: "Les offres correspondantes à prix ferme arrivent en général sous 24 heures.",
    cNext3: "Vous comparez côte à côte et choisissez — ou pas. Toujours gratuit.",
    cHome: "Retour à l'accueil",
    cAgain: "Nouvelle demande",
    stepLabel: "Étape",
  },
  it: {
    kicker: "La tua richiesta",
    ofSteps: "di",
    back: "Indietro",
    next: "Avanti",
    skip: "Salta",
    submit: "Ricevi offerte",
    edit: "Modifica",
    free: "Gratuito e senza impegno",
    anon: "Anonimo finché non scegli",
    s1q: "Che auto stai cercando?",
    s1makeLabel: "Marca",
    s1anyMake: "Qualsiasi marca",
    s1searchMakes: "Cerca una marca…",
    s1modelLabel: "Modello",
    s1modelPlaceholder: "es. 3 Series Touring",
    s1anyModel: "Qualsiasi modello",
    s1orSimilar: "o simile",
    s1orSimilarHint: "I concessionari possono proporre anche modelli comparabili.",
    s1bodyLabel: "Carrozzeria",
    bodies: ["SUV", "Station wagon", "Berlina", "Utilitaria", "Monovolume", "Coupé / Cabrio"],
    anyBody: "Qualsiasi carrozzeria",
    s2q: "Qual è il tuo budget?",
    s2upTo: "fino a",
    s2hint: "Tocca l'importo per digitarlo",
    s3q: "Anno & chilometraggio",
    s3fromYear: "Prima immatricolazione dal",
    s3maxKm: "Chilometraggio fino a",
    anyYear: "Indifferente",
    s4q: "Carburante & cambio",
    s4fuelLabel: "Carburante",
    fuels: ["Benzina", "Diesel", "Ibrida", "Ibrida plug-in", "Elettrica"],
    s4gearLabel: "Cambio",
    gears: ["Automatico", "Manuale"],
    any: "Indifferente",
    s5q: "Dove ti trovi?",
    s5cantonLabel: "Il tuo cantone",
    s5wholeCH: "Tutta la Svizzera",
    s5radius: "Raggio di ricerca",
    s5plzLabel: "NPA",
    s5plzPlaceholder: "es. 6900",
    optional: "facoltativo",
    s6q: "Dove inviamo le offerte?",
    s6emailLabel: "E-mail",
    s6emailPlaceholder: "tu@esempio.ch",
    s6emailError: "Inserisci un indirizzo e-mail valido.",
    s6note: "Garage svizzeri verificati rispondono alla tua richiesta. Resti anonimo — i garage vedono solo i tuoi criteri, mai i tuoi contatti, finché non scegli un'offerta.",
    s6password: "Password",
    s6passwordHint: "Almeno 8 caratteri — così nasce il tuo account e ogni offerta arriva nella tua dashboard.",
    s6haveAccount: "Hai già un account? Accedi",
    s6newHere: "Nuovo qui? Crea un account",
    s6signedInAs: "Accesso come",
    s6errWrong: "E-mail o password errati.",
    s6errExists: "Esiste già un account con questa e-mail — la password non corrisponde. Prova ad accedere.",
    s6errWeak: "La password deve contenere almeno 8 caratteri.",
    s6errGeneric: "Qualcosa è andato storto. Riprova.",
    cDashboard: "Apri la dashboard",
    dTitle: "La tua richiesta",
    dMake: "Marca",
    dModel: "Modello",
    dBody: "Carrozzeria",
    dBudget: "Budget",
    dYear: "Anno",
    dKm: "Chilometri",
    dFuel: "Carburante",
    dGear: "Cambio",
    dRegion: "Regione",
    dYourRequest: "La tua richiesta",
    cTitle: "Richiesta ricevuta.",
    cLead: "La tua richiesta è in viaggio verso garage svizzeri verificati.",
    cNext1: "I garage verificati adatti alla tua richiesta la vedono — in modo anonimo.",
    cNext2: "Le offerte corrispondenti a prezzo fisso arrivano di norma entro 24 ore.",
    cNext3: "Confronti fianco a fianco e scegli — oppure no. Sempre gratis.",
    cHome: "Torna alla home",
    cAgain: "Nuova richiesta",
    stepLabel: "Passo",
  },
};

// ── Curated car data (text only, CH-common makes; no logos by design) ──
export interface MakeEntry {
  name: string;
  models: string[]; // popular models as suggestions; free text always allowed
}

export const MAKES: MakeEntry[] = [
  { name: "Audi", models: ["A1 Sportback", "A3 Sportback", "A4 Avant", "A5 Sportback", "A6 Avant", "A7 Sportback", "A8", "Q2", "Q3", "Q3 Sportback", "Q4 e-tron", "Q5", "Q7", "Q8", "S3", "S4 Avant", "S5", "RS3", "RS4 Avant", "RS6 Avant", "RS Q3", "TT", "e-tron GT"] },
  { name: "BMW", models: ["1er", "2er Gran Coupé", "2er Active Tourer", "3er", "3er Touring", "4er Coupé", "4er Gran Coupé", "5er", "5er Touring", "7er", "X1", "X2", "X3", "X4", "X5", "X6", "X7", "M2", "M3", "M4", "M5", "M135i", "M340i", "Z4", "i4", "i5", "iX", "iX1", "iX3"] },
  { name: "Mercedes-Benz", models: ["A-Klasse", "B-Klasse", "C-Klasse", "C-Klasse T", "CLA", "CLA Shooting Brake", "E-Klasse", "E-Klasse T", "S-Klasse", "GLA", "GLB", "GLC", "GLC Coupé", "GLE", "G-Klasse", "V-Klasse", "A 35 AMG", "A 45 AMG", "C 43 AMG", "C 63 AMG", "GLC 43 AMG", "E 63 AMG", "EQA", "EQB", "EQE"] },
  { name: "VW", models: ["up!", "Polo", "Polo GTI", "Golf", "Golf Variant", "Golf GTI", "Golf GTD", "Golf R", "T-Cross", "Taigo", "T-Roc", "T-Roc R", "Tiguan", "Tiguan Allspace", "Touran", "Passat Variant", "Arteon", "Touareg", "ID.3", "ID.4", "ID.5", "ID. Buzz", "Multivan", "Caddy"] },
  { name: "Škoda", models: ["Fabia", "Scala", "Octavia", "Octavia Combi", "Octavia RS", "Superb", "Superb Combi", "Kamiq", "Karoq", "Kodiaq", "Kodiaq RS", "Enyaq", "Enyaq Coupé"] },
  { name: "Toyota", models: ["Aygo X", "Yaris", "Yaris Cross", "GR Yaris", "Corolla", "Corolla Touring Sports", "C-HR", "RAV4", "Highlander", "Land Cruiser", "Hilux", "GR Supra", "GR86", "Prius", "bZ4X"] },
  { name: "Volvo", models: ["V40", "S60", "V60", "V60 Cross Country", "S90", "V90", "V90 Cross Country", "XC40", "XC60", "XC60 T8", "XC90", "XC90 T8", "C40", "EX30", "EX40", "EX90"] },
  { name: "SEAT", models: ["Ibiza", "Leon", "Leon ST", "Arona", "Ateca", "Tarraco", "Alhambra"] },
  { name: "Cupra", models: ["Leon", "Leon ST", "Formentor", "Formentor VZ", "Ateca", "Born", "Tavascan", "Terramar"] },
  { name: "Ford", models: ["Fiesta", "Fiesta ST", "Focus", "Focus ST", "Puma", "Puma ST", "Kuga", "Explorer", "Mustang", "Mustang Mach-E", "Ranger", "Tourneo Custom"] },
  { name: "Opel", models: ["Corsa", "Corsa Electric", "Astra", "Astra Sports Tourer", "Mokka", "Crossland", "Grandland", "Combo Life", "Zafira Life"] },
  { name: "Peugeot", models: ["208", "e-208", "2008", "e-2008", "308", "308 SW", "408", "3008", "5008", "Rifter"] },
  { name: "Renault", models: ["Twingo", "Clio", "Captur", "Arkana", "Mégane", "Mégane E-Tech", "Austral", "Espace", "Scénic E-Tech", "R5 E-Tech", "Kangoo"] },
  { name: "Citroën", models: ["C3", "ë-C3", "C3 Aircross", "C4", "ë-C4", "C4 X", "C5 Aircross", "C5 X", "Berlingo"] },
  { name: "Fiat", models: ["500", "500e", "500X", "600e", "Panda", "Tipo"] },
  { name: "Abarth", models: ["595", "695", "500e", "600e"] },
  { name: "Hyundai", models: ["i10", "i20", "i20 N", "i30", "i30 N", "Bayon", "Kona", "Kona Electric", "Tucson", "Santa Fe", "Ioniq 5", "Ioniq 5 N", "Ioniq 6", "Staria"] },
  { name: "Kia", models: ["Picanto", "Rio", "Ceed", "Ceed SW", "ProCeed", "XCeed", "Stonic", "Niro", "Sportage", "Sorento", "EV3", "EV6", "EV6 GT", "EV9"] },
  { name: "Mazda", models: ["Mazda2", "Mazda3", "Mazda6", "CX-3", "CX-30", "CX-5", "CX-60", "CX-80", "MX-5", "MX-30"] },
  { name: "Honda", models: ["Jazz", "Civic", "Civic Type R", "HR-V", "ZR-V", "CR-V", "e:Ny1"] },
  { name: "Nissan", models: ["Micra", "Juke", "Qashqai", "X-Trail", "Ariya", "Leaf"] },
  { name: "Suzuki", models: ["Swift", "Swift Sport", "Ignis", "Vitara", "S-Cross", "Jimny", "Swace", "Across"] },
  { name: "Subaru", models: ["Impreza", "Crosstrek", "Forester", "Outback", "Solterra", "BRZ"] },
  { name: "Mini", models: ["Cooper 3-Türer", "Cooper 5-Türer", "Cooper SE", "John Cooper Works", "Cabrio", "Clubman", "Countryman", "Aceman"] },
  { name: "Porsche", models: ["911 Carrera", "911 Turbo", "911 GT3", "718 Cayman", "718 Boxster", "Macan", "Cayenne", "Cayenne Coupé", "Panamera", "Taycan", "Taycan Cross Turismo"] },
  { name: "Tesla", models: ["Model 3", "Model 3 Performance", "Model Y", "Model Y Performance", "Model S", "Model X"] },
  { name: "Polestar", models: ["Polestar 2", "Polestar 3", "Polestar 4"] },
  { name: "Dacia", models: ["Sandero", "Sandero Stepway", "Duster", "Jogger", "Spring", "Bigster"] },
  { name: "Alfa Romeo", models: ["Giulietta", "Giulia", "Giulia Quadrifoglio", "Stelvio", "Stelvio Quadrifoglio", "Tonale", "Junior"] },
  { name: "Jeep", models: ["Avenger", "Renegade", "Compass", "Wrangler", "Grand Cherokee"] },
  { name: "Land Rover", models: ["Defender", "Discovery", "Discovery Sport", "Range Rover", "Range Rover Sport", "Range Rover Velar", "Range Rover Evoque"] },
  { name: "Jaguar", models: ["XE", "XF", "E-Pace", "F-Pace", "F-Type", "I-Pace"] },
  { name: "Lexus", models: ["LBX", "UX", "NX", "RX", "ES", "RZ"] },
  { name: "Smart", models: ["fortwo", "forfour", "#1", "#3"] },
  { name: "MG", models: ["MG3", "MG4", "MG5", "ZS", "HS"] },
  { name: "BYD", models: ["Dolphin", "Atto 3", "Seal", "Seal U"] },
  { name: "Mitsubishi", models: ["Space Star", "Colt", "ASX", "Eclipse Cross", "Outlander"] },
  { name: "DS", models: ["DS 3", "DS 4", "DS 7", "DS 9"] },
  { name: "Maserati", models: ["Ghibli", "Grecale", "Levante", "GranTurismo", "MC20"] },
  { name: "Bentley", models: ["Continental GT", "Flying Spur", "Bentayga"] },
  { name: "Aston Martin", models: ["Vantage", "DB11", "DB12", "DBX"] },
  { name: "Ferrari", models: ["Roma", "296", "SF90", "812", "F8 Tributo", "Purosangue"] },
  { name: "Lamborghini", models: ["Huracán", "Urus", "Revuelto"] },
];
