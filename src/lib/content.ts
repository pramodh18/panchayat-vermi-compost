/** Bilingual site content — Hiramandalam Major Panchayat */

export const content = {
  panchayat: {
    te: "హిరమండలం మేజర్ పంచాయతీ",
    en: "Hiramandalam Major Panchayat",
  },
  official: {
    name: { te: "కె. సాయి ప్రసాద్",
      //  en: "K. Sai Prasad"

     },
    designation: {
      // te: "కార్యనిర్వహణాధికారి (EO), హిరమండలం",
      en: "Executive Officer (EO), Hiramandalam",
    },
  },
  product: {
    name: { te: "సేంద్రియ వర్మీ కంపోస్ట్", en: "Organic Vermicompost" },
    slogan: {
      te: "ప్రకృతి ఎరువు - పచ్చని పంటలు",
      en: "Natural Fertilizer - Green Crops",
    },
    price: {
      te: "ధర: రూ. 10/- (ప్రతీ కిలోకు)",
      en: "Price: ₹10/- (Per Kilogram)",
    },
  },
  center: {
    name: {
      te: "వర్మీ కంపోస్ట్ విక్రయ కేంద్రం - (SWPC SHED) హిరమండలం",
      // en: "Vermicompost Sales Center - (SWPC SHED) Hiramandalam",
    },
    availability: {
      te: "లభ్యత: SWPC కేంద్రం, హిరమండలం",
      // en: "Availability: SWPC Centre, Hiramandalam",
    },
  },
  campaign: {
    headline: {
      te: "మన హిరమండలం మేజర్ పంచాయతీ చరిత్రలో సరికొత్త అధ్యాయం",
      en: "A new chapter in the history of Hiramandalam Major Panchayat",
    },
  },
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE ?? "9573288939",
  benefits: [
    {
      title: { te: "మట్టి సారం పెరుగుతుంది", en: "Improves Soil Health" },
      desc: {
        te: "పోషకాలు, సూక్ష్మజీవులు — బలమైన పంటలకు అనుకూలం",
        en: "Rich nutrients and microbes for stronger crops",
      },
    },
    {
      title: { te: "100% సేంద్రియం", en: "100% Organic" },
      desc: {
        te: "స్వయంగా తయారీ చేసిన నాణ్యమైన వర్మీ కంపోస్ట్",
        en: "Quality vermicompost produced by the Panchayat",
      },
    },
    {
      title: { te: "నీరు ఎక్కువ కాలం నిలుస్తుంది", en: "Better Water Retention" },
      desc: {
        te: "ఎండాకాలంలో కూడా మట్టిలో తేమ ఉంచుతుంది",
        en: "Helps soil hold moisture in dry seasons",
      },
    },
    {
      title: { te: "అందుబాటు ధర", en: "Affordable Price" },
      desc: {
        te: "కిలో రూ. 10 మాత్రమే — ఆన్‌లైన్ ఆర్డర్ & చెల్లింపు",
        en: "Only ₹10 per kg — order and pay online",
      },
    },
  ],
} as const;

export type Bilingual = { te: string; en: string };
