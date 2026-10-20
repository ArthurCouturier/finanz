export enum GoalType {
  FINANCIAL_INDEPENDENCE = "FINANCIAL_INDEPENDENCE",
}

export interface GoalTypePreset {
  label: string;
  emoji: string;
  description: string;
}

export const GOAL_TYPE_PRESETS: Record<GoalType, GoalTypePreset> = {
  [GoalType.FINANCIAL_INDEPENDENCE]: {
    label: "Indépendance financière",
    emoji: "🏝️",
    description:
      "Atteindre un capital cible à une date donnée, à partir d'un montant de départ, de versements réguliers et du rendement de vos placements.",
  },
};

export type ContributionFrequency = "weekly" | "monthly" | "quarterly" | "annual";

export interface ContributionFrequencyPreset {
  label: string;
  /** Short unit shown next to an amount ("/ mois") */
  unit: string;
  periodsPerYear: number;
  /** Slider bounds for a single contribution at this frequency (€) */
  max: number;
  step: number;
}

export const CONTRIBUTION_FREQUENCIES: Record<
  ContributionFrequency,
  ContributionFrequencyPreset
> = {
  weekly: { label: "Hebdomadaire", unit: "/ semaine", periodsPerYear: 52, max: 2500, step: 10 },
  monthly: { label: "Mensuel", unit: "/ mois", periodsPerYear: 12, max: 10000, step: 50 },
  quarterly: { label: "Trimestriel", unit: "/ trimestre", periodsPerYear: 4, max: 30000, step: 100 },
  annual: { label: "Annuel", unit: "/ an", periodsPerYear: 1, max: 120000, step: 500 },
};

/** Display order of the contribution frequencies. */
export const CONTRIBUTION_FREQUENCY_ORDER: ContributionFrequency[] = [
  "weekly",
  "monthly",
  "quarterly",
  "annual",
];

/** Non-linear slider exponent for € amount sliders (more travel for lower values). */
export const AMOUNT_CURVE = 2;
export const START_AMOUNT_MAX = 1_000_000;
export const TARGET_AMOUNT_MIN = 1_000;
export const TARGET_AMOUNT_MAX = 5_000_000;
export const YEARS_MIN = 1;
export const YEARS_MAX = 50;
/** Bounds (%) of the comparison rate slider */
export const COMPARE_RATE_MIN = -5;
export const COMPARE_RATE_MAX = 30;
/** "4 % rule": yearly withdrawal rate (%) used to turn a capital into a passive income */
export const DEFAULT_PASSIVE_YIELD_RATE = 4;
export const PASSIVE_YIELD_RATE_MAX = 20;
