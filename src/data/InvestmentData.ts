/**
 * Reference data for the "where / what / when to invest" planner.
 *
 * Every figure is sourced below (URL + date). Returns are NOMINAL, in EUR,
 * dividends reinvested, before fees and taxes, annualised over the trailing
 * 10 / 20 / 30 years ending 30 September 2026 unless the note says otherwise.
 * Tax rates are the 2026 French rules (LFSS 2026: CSG raised to 10.6 %, so
 * social contributions are 18.6 % and the PFU 31.4 % on most products).
 * These are starting points for a simulation, not investment advice.
 */

export type HistoryPeriod = 10 | 20 | 30;

export interface Source {
  label: string;
  url: string;
  /** Publication / verification date, as printed by the source */
  date: string;
}

export type AssetCategory = "actions" | "obligations" | "immobilier" | "or" | "securise";

export type AssetKey =
  | "msci_world"
  | "sp500"
  | "nasdaq100"
  | "cac40_gr"
  | "emerging"
  | "euro_gov_bonds"
  | "gold"
  | "scpi"
  | "fonds_euros"
  | "livret_a";

export type EnvelopeKey = "pea" | "cto" | "av" | "per" | "livret";

export interface AssetClass {
  key: AssetKey;
  label: string;
  emoji: string;
  category: AssetCategory;
  /** Annualised nominal return in EUR (%) over the trailing 10 / 20 / 30 years */
  returns: Record<HistoryPeriod, number>;
  /** Annualised volatility (%) over 20 years, null when not meaningful */
  volatility: number | null;
  /** Worst peak-to-trough fall (%) over 30 years, null when not meaningful */
  maxDrawdown: number | null;
  /** Typical annual product fee (ETF TER, %) — SCPI / fonds euros figures are already net */
  defaultFee: number;
  /** Envelopes able to hold this asset */
  envelopes: EnvelopeKey[];
  /** Example products the reader can look up */
  examples: string;
  /** One-line "why / when" guidance */
  role: string;
  sources: Source[];
  note?: string;
}

export interface Envelope {
  key: EnvelopeKey;
  label: string;
  emoji: string;
  /** Tax on gains (%) once `minYearsForLong` is reached */
  taxRateLong: number;
  /** Tax on gains (%) before that */
  taxRateShort: number;
  minYearsForLong: number;
  /** Yearly allowance on gains before tax (€), 0 if none */
  abatement: number;
  /** Deposit ceiling (€) or null; `ceilingPerYear` when the cap is yearly */
  ceiling: number | null;
  ceilingPerYear?: boolean;
  /** Typical annual envelope fee (%) added on top of product fees */
  defaultFee: number;
  liquidity: string;
  bestFor: string;
  taxSummary: string;
  sources: Source[];
}

/** End date of the historical return series used below. */
export const INVESTMENT_DATA_AS_OF = "30 septembre 2026";
/** Day this file was last checked against its sources — see docs/DONNEES_INVESTISSEMENT.md for the update procedure. */
export const INVESTMENT_DATA_LAST_UPDATE = "20 octobre 2026";
export const INVESTMENT_DATA_DOC_PATH = "docs/DONNEES_INVESTISSEMENT.md";

/** French CPI, INSEE yearly rates averaged over the trailing 10 / 20 / 30 years (2025 back to 1996). */
export const INFLATION: Record<HistoryPeriod, number> = { 10: 1.9, 20: 1.6, 30: 1.6 };
export const INFLATION_SOURCES: Source[] = [
  { label: "INSEE via MoneyVox — inflation annuelle 2000-2025", url: "https://www.moneyvox.fr/placement/inflation.php", date: "2026" },
  { label: "Tout sur mes finances — Livret A et inflation par année depuis 1970", url: "https://www.toutsurmesfinances.com/placements/livret-a-et-livret-bleu-historique-du-taux-moyen-annuel-depuis-1970.html", date: "2026" },
];

/** 2026 marginal income-tax brackets (TMI) used for the PER deduction. */
export const TMI_OPTIONS = [0, 11, 30, 41, 45] as const;

/** PER "profil équilibré horizon retraite": minimum share of low-risk assets by years to go. */
export const GLIDE_PATH_SCHEDULE: { yearsLeftAtMost: number; secureShare: number }[] = [
  { yearsLeftAtMost: 2, secureShare: 0.7 },
  { yearsLeftAtMost: 5, secureShare: 0.5 },
  { yearsLeftAtMost: 10, secureShare: 0.2 },
];
export const GLIDE_PATH_SOURCE: Source = {
  label: "Arrêté PER — gestion pilotée « équilibré horizon retraite » (20 % / 50 % / 70 %)",
  url: "https://www.moneyvox.fr/retraite/actualites/75384/plan-epargne-retraite-a-quoi-ressembleront-les-gestions-pilotees",
  date: "août 2019, toujours en vigueur",
};

const LAZY = (slug: string, label: string): Source => ({
  label: `Lazy Portfolio ETF — ${label} (EUR, au 30/09/2026)`,
  url: `https://www.lazyportfolioetf.com/etf/${slug}/`,
  date: "30 septembre 2026",
});

export const ASSETS: Record<AssetKey, AssetClass> = {
  msci_world: {
    key: "msci_world",
    label: "Actions monde (MSCI World)",
    emoji: "🌍",
    category: "actions",
    returns: { 10: 12.8, 20: 9.0, 30: 8.4 },
    volatility: 13.4,
    maxDrawdown: -55.7,
    defaultFee: 0.2,
    envelopes: ["pea", "cto", "av", "per"],
    examples: "ETF iShares MSCI World Swap PEA (WPEA, 0,20 %), Amundi PEA Monde (DCAM, 0,20 %), Amundi MSCI World (CW8, 0,38 %)",
    role: "Le cœur d'un portefeuille long terme : 1 500 grandes entreprises de 23 pays développés, diversification maximale en une ligne.",
    sources: [
      LAZY("ishares-core-msci-world-eur-currency", "iShares Core MSCI World (EUNL)"),
      { label: "Comparatif des ETF MSCI World éligibles au PEA (frais)", url: "https://pea.fr/les-etf/meilleurs-etf-msci-world-pea/", date: "juin 2026" },
    ],
  },
  sp500: {
    key: "sp500",
    label: "Actions USA (S&P 500)",
    emoji: "🇺🇸",
    category: "actions",
    returns: { 10: 14.9, 20: 11.6, 30: 10.5 },
    volatility: 14.0,
    maxDrawdown: -60.6,
    defaultFee: 0.15,
    envelopes: ["pea", "cto", "av", "per"],
    examples: "ETF Amundi PEA S&P 500 (PE500, 0,15 %), iShares Core S&P 500 (CSPX, 0,07 %)",
    role: "Les 500 plus grandes sociétés américaines : moteur de la performance mondiale des 15 dernières années, mais concentration sur un seul pays et sur la tech.",
    sources: [
      LAZY("ishares-core-sp-500-eur-currency", "iShares Core S&P 500 (SXR8)"),
      { label: "EU Personal Finance — S&P 500 en euros : 13,6 % (10 ans), 11,5 % (20 ans), 11,1 % (30 ans) au 31/12/2025", url: "https://www.eupersonalfinance.eu/articles/average-annual-return-sp500", date: "31 décembre 2025" },
    ],
  },
  nasdaq100: {
    key: "nasdaq100",
    label: "Tech USA (Nasdaq-100)",
    emoji: "💻",
    category: "actions",
    returns: { 10: 20.5, 20: 16.8, 30: 14.0 },
    volatility: 18.1,
    maxDrawdown: -81.7,
    defaultFee: 0.3,
    envelopes: ["pea", "cto", "av", "per"],
    examples: "ETF Amundi PEA Nasdaq-100 (PUST, 0,30 %), iShares Nasdaq 100 (SXRV, 0,33 %)",
    role: "Pari sectoriel sur la tech : rendements exceptionnels mais chute de 82 % lors de l'éclatement de la bulle internet (2000-2002). À doser.",
    sources: [LAZY("ishares-nasdaq-100-eur-currency", "iShares Nasdaq 100 (SXRV)")],
  },
  cac40_gr: {
    key: "cac40_gr",
    label: "Actions France (CAC 40 GR)",
    emoji: "🇫🇷",
    category: "actions",
    returns: { 10: 8.5, 20: 7.0, 30: 7.4 },
    volatility: 18.0,
    maxDrawdown: -55.0,
    defaultFee: 0.25,
    envelopes: ["pea", "cto", "av", "per"],
    examples: "ETF Amundi CAC 40 (C40, 0,25 %), Lyxor CAC 40 (CAC, 0,25 %)",
    role: "Les 40 plus grandes capitalisations françaises, dividendes réinvestis (indice « GR »). Biais domestique : à limiter au profit du MSCI World.",
    note: "Chiffres approximatifs : ≈ 9 % / an depuis 1987 (Ramify, juillet 2025) ; « > 8 % » sur 10 ans et « ≈ 7 % » sur 20 ans (bourse-assurance-retraite.fr, mai 2026). Le 30 ans est déduit de 10 000 € → 85 000 € entre 1996 et 2026.",
    sources: [
      { label: "Ramify — CAC 40 : 8,96 % / an avec dividendes réinvestis depuis 1987", url: "https://www.ramify.fr/bourse/cac-40", date: "juillet 2025" },
      { label: "Le CAC 40 Gross Return historique", url: "https://bourse-assurance-retraite.fr/cac-40-gross-return-historique/", date: "7 mai 2026" },
    ],
  },
  emerging: {
    key: "emerging",
    label: "Actions émergentes (MSCI EM)",
    emoji: "🌏",
    category: "actions",
    returns: { 10: 8.6, 20: 6.7, 30: 7.0 },
    volatility: 16.9,
    maxDrawdown: -56.3,
    defaultFee: 0.2,
    envelopes: ["pea", "cto", "av", "per"],
    examples: "ETF Amundi PEA MSCI Emerging Markets (PAEEM, 0,20 %), iShares Core MSCI EM IMI (EIMI, 0,18 %)",
    role: "Chine, Inde, Taïwan, Brésil… : diversification géographique et potentiel de croissance, au prix d'une volatilité plus forte.",
    sources: [LAZY("ishares-msci-emerging-markets-eem-tocurrency-eur", "iShares MSCI Emerging Markets (EEM) converti en EUR")],
  },
  euro_gov_bonds: {
    key: "euro_gov_bonds",
    label: "Obligations d'État zone euro",
    emoji: "🏛️",
    category: "obligations",
    returns: { 10: -1.0, 20: 1.7, 30: 2.7 },
    volatility: 4.7,
    maxDrawdown: -21.6,
    defaultFee: 0.09,
    envelopes: ["cto", "av", "per"],
    examples: "ETF Xtrackers II Eurozone Government Bond (XGLE, 0,09 %), iShares Euro Government Bond 3-7y (SXRP, 0,20 %)",
    role: "Amortisseur classique d'un portefeuille. Attention : la remontée des taux 2022 a produit la pire décennie de l'histoire récente (−1 % / an sur 10 ans).",
    sources: [LAZY("xtrackers-ii-eurozone-government-bond", "Xtrackers II Eurozone Government Bond (XGLE)")],
  },
  gold: {
    key: "gold",
    label: "Or physique",
    emoji: "🥇",
    category: "or",
    returns: { 10: 12.0, 20: 10.5, 30: 8.5 },
    volatility: 16.2,
    maxDrawdown: -36.8,
    defaultFee: 0.12,
    envelopes: ["cto", "av"],
    examples: "ETC Amundi Physical Gold (GOLD, 0,12 %), iShares Physical Gold (PPFB, 0,12 %)",
    role: "Valeur refuge décorrélée des actions : 5 à 10 % du portefeuille protègent des crises, mais l'or ne verse aucun revenu.",
    sources: [LAZY("spdr-gold-trust-gld-tocurrency-eur", "SPDR Gold Trust (GLD) converti en EUR")],
  },
  scpi: {
    key: "scpi",
    label: "Immobilier (SCPI)",
    emoji: "🏢",
    category: "immobilier",
    returns: { 10: 3.2, 20: 6.4, 30: 6.4 },
    volatility: 6.0,
    maxDrawdown: -20.0,
    defaultFee: 0,
    envelopes: ["cto", "av", "per"],
    examples: "SCPI de bureaux, santé, logistique… (taux de distribution moyen 2025 : 4,91 %)",
    role: "Immobilier « pierre-papier » sans gestion locative : loyers réguliers, mais frais d'entrée élevés (8-10 %) et parts peu liquides. TRI 2025 pénalisé par les baisses de prix des bureaux.",
    note: "TRI (taux de rendement interne) ASPIM / IEIF fin 2025 : 3,21 % sur 10 ans et 6,36 % sur 20 ans, nets de frais. Pas de série à 30 ans publiée : la valeur 20 ans est reprise.",
    sources: [
      { label: "Portail SCPI — taux de distribution 2025 (4,91 %) et TRI 10 / 20 ans (ASPIM)", url: "https://portail-scpi.fr/definition-scpi/guide-scpi-complet/taux-rendement/", date: "2026" },
    ],
  },
  fonds_euros: {
    key: "fonds_euros",
    label: "Fonds euros (capital garanti)",
    emoji: "🛡️",
    category: "securise",
    returns: { 10: 1.9, 20: 2.6, 30: 3.4 },
    volatility: 0,
    maxDrawdown: 0,
    defaultFee: 0,
    envelopes: ["av", "per"],
    examples: "Fonds en euros des assurances-vie et PER (2,6 % servis en moyenne en 2025, net de frais de gestion)",
    role: "La poche sécurisée des enveloppes assurantielles : capital garanti, effet cliquet. Idéal pour sécuriser progressivement à l'approche de l'objectif.",
    note: "Moyennes de marché nettes de frais : 2,6 % en 2025 (France Assureurs / ACPR), 1,3 % au plus bas en 2020-2021, ≈ 3,4 % en 2010, ≈ 5,3 % en 2000.",
    sources: [
      { label: "MoneyVox — fonds euros : 2,63 % en 2025 selon l'ACPR", url: "https://www.moneyvox.fr/assurance-vie/actualites/108096/le-taux-moyen-reste-a-2-63-en-2025-comme-en-2024-selon-acpr", date: "mars 2026" },
      { label: "Mon Petit Placement — rendement des fonds euros année par année", url: "https://www.monpetitplacement.fr/assurance-vie/assurance-vie-rendement", date: "2026" },
    ],
  },
  livret_a: {
    key: "livret_a",
    label: "Livret A / LDDS / LEP",
    emoji: "🏦",
    category: "securise",
    returns: { 10: 1.4, 20: 1.7, 30: 2.1 },
    volatility: 0,
    maxDrawdown: 0,
    defaultFee: 0,
    envelopes: ["livret"],
    examples: "Livret A et LDDS à 1,70 %, LEP à 2,50 % (sous conditions de revenus) depuis le 1er août 2026",
    role: "L'épargne de précaution (3 à 6 mois de dépenses) et les projets à moins de 2 ans : disponible à tout moment, 0 impôt, mais rapporte à peine plus que l'inflation.",
    note: "Moyennes calculées à partir du taux moyen annuel du Livret A (1996-2025). Taux actuel : 1,70 % depuis le 1er août 2026.",
    sources: [
      { label: "Meilleurtaux — taux officiels des livrets au 1er août 2026", url: "https://placement.meilleurtaux.com/livret-epargne/actualites/2026-juillet/livrets-les-taux-officiels-au-1er-aout-2026.html", date: "juillet 2026" },
      { label: "Tout sur mes finances — historique du taux moyen annuel du Livret A", url: "https://www.toutsurmesfinances.com/placements/livret-a-et-livret-bleu-historique-du-taux-moyen-annuel-depuis-1970.html", date: "2026" },
    ],
  },
};

export const ASSET_ORDER: AssetKey[] = [
  "msci_world",
  "sp500",
  "nasdaq100",
  "cac40_gr",
  "emerging",
  "euro_gov_bonds",
  "gold",
  "scpi",
  "fonds_euros",
  "livret_a",
];

export const ENVELOPES: Record<EnvelopeKey, Envelope> = {
  pea: {
    key: "pea",
    label: "PEA",
    emoji: "📈",
    taxRateLong: 18.6,
    taxRateShort: 31.4,
    minYearsForLong: 5,
    abatement: 0,
    ceiling: 150000,
    defaultFee: 0,
    liquidity: "Retrait partiel libre après 5 ans ; avant 5 ans tout retrait clôture le plan (sauf exceptions).",
    bestFor: "Actions et ETF européens ou « monde » synthétiques, jusqu'à 150 000 € de versements. L'enveloppe la plus efficace fiscalement pour les actions.",
    taxSummary: "Après 5 ans : 0 % d'impôt sur le revenu, prélèvements sociaux 18,6 % sur les gains. Avant 5 ans : 31,4 % (12,8 % + 18,6 %).",
    sources: [
      { label: "service-public.gouv.fr — PEA : plafond, retraits, titres éligibles", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F2385", date: "vérifié le 22 mai 2026" },
      { label: "service-public.gouv.fr — fiscalité du PEA (12,8 % avant 5 ans, exonération après)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F22449", date: "vérifié le 15 avril 2026" },
      { label: "Les Clés de la Banque — prélèvements sociaux à 18,6 % en 2026 sur les gains du PEA", url: "https://www.lesclesdelabanque.com/particulier/fiscalite-pea/", date: "2026" },
    ],
  },
  cto: {
    key: "cto",
    label: "CTO",
    emoji: "🧾",
    taxRateLong: 31.4,
    taxRateShort: 31.4,
    minYearsForLong: 0,
    abatement: 0,
    ceiling: null,
    defaultFee: 0,
    liquidity: "Disponible à tout moment.",
    bestFor: "Tout ce que le PEA ne peut pas loger (or, obligations, ETF américains, SCPI) et les versements au-delà du plafond PEA. Aucun plafond.",
    taxSummary: "Flat tax (PFU) de 31,4 % sur dividendes et plus-values depuis le 1er janvier 2026 (12,8 % + 18,6 %), ou option pour le barème progressif.",
    sources: [
      { label: "La finance pour tous — le PFU passe de 30 % à 31,4 % au 1er janvier 2026", url: "https://www.lafinancepourtous.com/pratique/impots/fiscalite-de-l-epargne-2/prelevement-forfaitaire-unique-pfu/comprendre-le-pfu/", date: "mis à jour le 19 janvier 2026" },
    ],
  },
  av: {
    key: "av",
    label: "Assurance-vie",
    emoji: "📜",
    taxRateLong: 24.7,
    taxRateShort: 30,
    minYearsForLong: 8,
    abatement: 4600,
    ceiling: null,
    defaultFee: 0.6,
    liquidity: "Rachat partiel possible à tout moment ; l'avantage fiscal est acquis après 8 ans (ouvrez tôt pour « prendre date »).",
    bestFor: "Diversifier (fonds euros + ETF + SCPI + or), sécuriser progressivement, et transmettre (abattement 152 500 € par bénéficiaire).",
    taxSummary: "Après 8 ans : 7,5 % + 17,2 % = 24,7 % sur les gains au-delà de 4 600 € / an (9 200 € en couple), pour moins de 150 000 € de versements. Avant 8 ans : 30 %. L'assurance-vie est exclue de la hausse de CSG 2026.",
    sources: [
      { label: "service-public.gouv.fr — fiscalité des rachats (7,5 % / 12,8 %, abattement 4 600 €, prélèvements sociaux 17,2 %)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F22414", date: "vérifié le 15 avril 2026" },
      { label: "France Assureurs — frais de gestion moyens 2025 : 0,88 % sur les unités de compte", url: "https://www.toutsurmesfinances.com/actualites/a/assurance-vie-ce-que-les-frais-de-gestion-ont-coute-en-2025", date: "6 mai 2026" },
    ],
  },
  per: {
    key: "per",
    label: "PER",
    emoji: "🧓",
    taxRateLong: 31.4,
    taxRateShort: 31.4,
    minYearsForLong: 0,
    abatement: 0,
    ceiling: 37680,
    ceilingPerYear: true,
    defaultFee: 0.9,
    liquidity: "Bloqué jusqu'à la retraite, sauf accidents de la vie et achat de la résidence principale.",
    bestFor: "Préparer la retraite quand votre tranche d'imposition (TMI) est d'au moins 30 % : les versements sont déduits du revenu imposable (jusqu'à 10 % des revenus, max 37 680 € en 2026).",
    taxSummary: "Entrée : versements déductibles (économie = versement × TMI). Sortie en capital : le capital est imposé au barème (TMI du moment), les gains à 31,4 %.",
    sources: [
      { label: "service-public.gouv.fr — PER individuel : plafond de déduction, cas de déblocage, fiscalité de sortie", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F34982", date: "vérifié le 12 octobre 2026" },
      { label: "ACPR via Tout sur mes finances — frais de gestion PER 2025 : 0,91 % sur les unités de compte", url: "https://www.toutsurmesfinances.com/actualites/?p=1075", date: "2026" },
    ],
  },
  livret: {
    key: "livret",
    label: "Livrets réglementés",
    emoji: "🏦",
    taxRateLong: 0,
    taxRateShort: 0,
    minYearsForLong: 0,
    abatement: 0,
    ceiling: 34950,
    defaultFee: 0,
    liquidity: "Disponible immédiatement.",
    bestFor: "L'épargne de précaution et les dépenses prévues à moins de 2 ans. Plafonds : 22 950 € (Livret A) + 12 000 € (LDDS) + 10 000 € (LEP sous conditions).",
    taxSummary: "Intérêts totalement exonérés d'impôt et de prélèvements sociaux.",
    sources: [
      { label: "Meilleurtaux — Livret A 1,70 %, LDDS 1,70 %, LEP 2,50 % au 1er août 2026", url: "https://placement.meilleurtaux.com/livret-epargne/actualites/2026-juillet/livrets-les-taux-officiels-au-1er-aout-2026.html", date: "juillet 2026" },
    ],
  },
};

export const ENVELOPE_ORDER: EnvelopeKey[] = ["livret", "pea", "av", "per", "cto"];

/** Starting allocations, one click away. Weights are in % and sum to 100. */
export interface PortfolioPreset {
  key: string;
  label: string;
  emoji: string;
  description: string;
  lines: { envelope: EnvelopeKey; asset: AssetKey; weight: number }[];
}

export const PORTFOLIO_PRESETS: PortfolioPreset[] = [
  {
    key: "prudent",
    label: "Prudent",
    emoji: "🛡️",
    description: "30 % d'actions, le reste sécurisé : horizon court ou faible tolérance aux baisses.",
    lines: [
      { envelope: "livret", asset: "livret_a", weight: 10 },
      { envelope: "av", asset: "fonds_euros", weight: 40 },
      { envelope: "av", asset: "euro_gov_bonds", weight: 20 },
      { envelope: "pea", asset: "msci_world", weight: 30 },
    ],
  },
  {
    key: "balanced",
    label: "Équilibré",
    emoji: "⚖️",
    description: "70 % d'actions diversifiées en PEA, 30 % sécurisé : le classique pour 10-20 ans.",
    lines: [
      { envelope: "livret", asset: "livret_a", weight: 10 },
      { envelope: "av", asset: "fonds_euros", weight: 20 },
      { envelope: "pea", asset: "msci_world", weight: 50 },
      { envelope: "pea", asset: "sp500", weight: 10 },
      { envelope: "pea", asset: "emerging", weight: 10 },
    ],
  },
  {
    key: "dynamic",
    label: "Dynamique",
    emoji: "🚀",
    description: "85 % d'actions avec une dose de tech, un peu d'or : horizon long et nerfs solides.",
    lines: [
      { envelope: "livret", asset: "livret_a", weight: 5 },
      { envelope: "pea", asset: "msci_world", weight: 60 },
      { envelope: "pea", asset: "nasdaq100", weight: 15 },
      { envelope: "pea", asset: "emerging", weight: 10 },
      { envelope: "cto", asset: "gold", weight: 10 },
    ],
  },
  {
    key: "world",
    label: "100 % monde",
    emoji: "🌍",
    description: "Un seul ETF MSCI World en PEA : la simplicité maximale.",
    lines: [{ envelope: "pea", asset: "msci_world", weight: 100 }],
  },
  {
    key: "retirement",
    label: "Retraite (PER)",
    emoji: "🧓",
    description: "Le PER capte l'avantage fiscal, le PEA reste disponible, le fonds euros sécurise.",
    lines: [
      { envelope: "per", asset: "msci_world", weight: 50 },
      { envelope: "pea", asset: "msci_world", weight: 30 },
      { envelope: "av", asset: "fonds_euros", weight: 20 },
    ],
  },
];

/** Sourced "when" guidance shown in the planner. */
export const TIMING_GUIDANCE: { title: string; text: string; source?: Source }[] = [
  {
    title: "1. D'abord l'épargne de précaution",
    text: "3 à 6 mois de dépenses courantes sur Livret A / LDDS / LEP (3 mois en CDI, 6 mois ou plus en freelance). Tout le reste peut être investi.",
    source: { label: "MoneyVox — combien garder comme épargne de précaution", url: "https://www.moneyvox.fr/livret/actualites/49361/livrets-combien-garder-comme-epargne-de-precaution", date: "2026" },
  },
  {
    title: "2. Investir tôt, puis régulièrement",
    text: "Les versements programmés (DCA) lissent le point d'entrée et évitent de « timer » le marché. Si vous disposez déjà d'une somme, l'investir d'un coup a battu l'étalement dans environ deux tiers des cas historiques (Vanguard).",
    source: { label: "Vanguard — « Dollar-cost averaging just means taking risk later »", url: "https://militarymoneymanual.com/wp-content/uploads/2021/08/Dollar-Cost-Averaging-Just-Means-Taking-Risk-Later-Vanguard.pdf", date: "2012, confirmé 2023 (68 %)" },
  },
  {
    title: "3. Remplir les enveloppes dans le bon ordre",
    text: "PEA pour les actions (jusqu'à 150 000 €) ; assurance-vie ouverte tôt pour le fonds euros et les actifs non éligibles au PEA ; PER seulement si votre TMI est d'au moins 30 % et que l'argent peut rester bloqué jusqu'à la retraite ; CTO pour le reste, sans plafond.",
    source: { label: "service-public.gouv.fr — PEA (plafonds) et PER (déduction, blocage)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F2385", date: "2026" },
  },
  {
    title: "4. Surveiller les frais",
    text: "0,2 % de frais par an (ETF) contre 1 % (fonds actifs en assurance-vie) : sur 25 ans, l'écart ampute le capital final d'environ 18 %. Privilégiez les ETF indiciels à faible TER.",
    source: { label: "pea.fr — comparatif des frais des ETF MSCI World PEA", url: "https://pea.fr/les-etf/meilleurs-etf-msci-world-pea/", date: "juin 2026" },
  },
  {
    title: "5. Sécuriser progressivement à l'approche de l'objectif",
    text: "Comme la gestion pilotée « équilibré horizon retraite » du PER : au moins 20 % d'actifs peu risqués à 10 ans de l'échéance, 50 % à 5 ans, 70 % à 2 ans. Le toggle ci-dessous applique ce calendrier.",
    source: GLIDE_PATH_SOURCE,
  },
];
