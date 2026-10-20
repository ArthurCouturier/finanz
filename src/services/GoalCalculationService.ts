import { ContributionFrequency, DEFAULT_PASSIVE_YIELD_RATE } from "@/enums/GoalType";
import { FinancialIndependenceGoal } from "@/interfaces/configurations/GoalConfigInterface";

/**
 * Pure financial engine for the "financial independence" goal simulator.
 *
 * Conventions:
 *  - `rate` is an annual rate expressed as a decimal (0.05 = 5 %).
 *  - Contributions are paid at the END of each period (ordinary annuity) and
 *    compound at the equivalent periodic rate i = (1+r)^(1/n) − 1, so a monthly
 *    plan and an annual plan at the same annual rate grow identically over a year.
 *  - Wealth after y years:  W(y) = S·(1+r)^y + C·((1+r)^y − 1) / i
 *    where S is the starting capital and C the contribution per period.
 *  - The "required rate" is the annual rate r such that W(years) = target,
 *    found by bisection (W is increasing in r as soon as S or C is positive).
 */

export const PERIODS_PER_YEAR: Record<ContributionFrequency, number> = {
  weekly: 52,
  monthly: 12,
  quarterly: 4,
  annual: 1,
};

/** Search bracket for the required annual rate: −99 % … +1000 %. */
export const RATE_MIN = -0.99;
export const RATE_MAX = 10;
/** How far ahead we look for the year a comparison rate reaches the target. */
export const MAX_SEARCH_YEARS = 100;

export interface WealthPoint {
  /** Years from now (0 = today) */
  year: number;
  amount: number;
}

export type FeasibilityKey =
  | "acquired"
  | "easy"
  | "realistic"
  | "ambitious"
  | "very-ambitious"
  | "unrealistic"
  | "impossible";

export interface FeasibilityLevel {
  key: FeasibilityKey;
  label: string;
  emoji: string;
  /** Tailwind text color class for the rate figure */
  className: string;
  description: string;
  /** Upper bound (%) of the required rate for this level; null = open-ended */
  maxRatePct: number | null;
}

/** Ordered from the easiest to the hardest; the first matching bound wins. */
export const FEASIBILITY_LEVELS: FeasibilityLevel[] = [
  {
    key: "acquired",
    label: "Déjà acquis",
    emoji: "✅",
    className: "text-emerald-600",
    description:
      "Le montant de départ et les versements suffisent sans aucun rendement.",
    maxRatePct: 0,
  },
  {
    key: "easy",
    label: "Très réaliste",
    emoji: "🟢",
    className: "text-emerald-600",
    description: "Un livret ou un fonds euros suffit (≈ 2–3 % / an).",
    maxRatePct: 3,
  },
  {
    key: "realistic",
    label: "Réaliste",
    emoji: "🙂",
    className: "text-emerald-600",
    description:
      "Portefeuille diversifié prudent, obligations + actions (≈ 4–6 % / an).",
    maxRatePct: 6,
  },
  {
    key: "ambitious",
    label: "Ambitieux",
    emoji: "💪",
    className: "text-amber-600",
    description:
      "Rendement historique moyen des actions monde (≈ 7–8 % / an brut, hors inflation).",
    maxRatePct: 9,
  },
  {
    key: "very-ambitious",
    label: "Très ambitieux",
    emoji: "⚠️",
    className: "text-orange-600",
    description:
      "Au-delà des rendements boursiers moyens : forte prise de risque.",
    maxRatePct: 15,
  },
  {
    key: "unrealistic",
    label: "Irréaliste",
    emoji: "🚫",
    className: "text-red-600",
    description:
      "Aucun placement raisonnable ne tient ce rythme : augmentez les versements, le montant de départ ou l'horizon.",
    maxRatePct: null,
  },
];

export const IMPOSSIBLE_LEVEL: FeasibilityLevel = {
  key: "impossible",
  label: "Impossible",
  emoji: "🚫",
  className: "text-red-600",
  description:
    "Sans montant de départ ni versement, le capital ne peut pas croître.",
  maxRatePct: null,
};

export function feasibilityForRate(
  ratePct: number | null,
  hasInvestment: boolean
): FeasibilityLevel {
  const hardest = FEASIBILITY_LEVELS[FEASIBILITY_LEVELS.length - 1];
  if (!hasInvestment) return IMPOSSIBLE_LEVEL;
  if (ratePct === null) return hardest;
  return (
    FEASIBILITY_LEVELS.find(
      (l) => l.maxRatePct !== null && ratePct <= l.maxRatePct
    ) ?? hardest
  );
}

/** Σ contributions over one year (€). */
export function annualContribution(goal: FinancialIndependenceGoal): number {
  return (
    Math.max(0, goal.contribution) *
    PERIODS_PER_YEAR[goal.contributionFrequency]
  );
}

/** Monthly passive income a capital would yield at a yearly withdrawal rate (%). */
export function monthlyPassiveIncome(capital: number, yieldRatePct: number): number {
  return (Math.max(0, capital) * Math.max(0, yieldRatePct)) / 100 / 12;
}

/** Starting capital + every contribution over the horizon (€). */
export function totalInvested(goal: FinancialIndependenceGoal): number {
  return (
    Math.max(0, goal.startAmount) +
    annualContribution(goal) * Math.max(0, Math.round(goal.years))
  );
}

/** Capital after `year` years at the annual `rate` (decimal). */
export function wealthAtYear(
  goal: FinancialIndependenceGoal,
  rate: number,
  year: number
): number {
  const n = PERIODS_PER_YEAR[goal.contributionFrequency];
  const start = Math.max(0, goal.startAmount);
  const c = Math.max(0, goal.contribution);
  if (year <= 0) return start;
  if (Math.abs(rate) < 1e-9) return start + c * n * year;
  const growth = Math.pow(1 + rate, year);
  const periodicRate = Math.pow(1 + rate, 1 / n) - 1;
  return start * growth + (c * (growth - 1)) / periodicRate;
}

/** Yearly points from today (year 0) to the horizon, at the given annual rate. */
export function projectWealth(
  goal: FinancialIndependenceGoal,
  rate: number
): WealthPoint[] {
  const years = Math.max(0, Math.round(goal.years));
  const points: WealthPoint[] = [];
  for (let y = 0; y <= years; y++) {
    points.push({ year: y, amount: wealthAtYear(goal, rate, y) });
  }
  return points;
}

/**
 * Annual rate (decimal) needed to hit the target exactly at the horizon.
 * Returns null when nothing is invested, or when even RATE_MAX falls short.
 * May be negative when the target is reachable with no return at all.
 */
export function solveRequiredRate(goal: FinancialIndependenceGoal): number | null {
  const years = Math.round(goal.years);
  if (years <= 0) return null;
  if (goal.startAmount <= 0 && goal.contribution <= 0) return null;

  const gap = (r: number) => wealthAtYear(goal, r, years) - goal.targetAmount;
  let lo = RATE_MIN;
  let hi = RATE_MAX;
  if (gap(hi) < 0) return null;
  if (gap(lo) >= 0) return lo;
  for (let k = 0; k < 100; k++) {
    const mid = (lo + hi) / 2;
    if (gap(mid) >= 0) hi = mid;
    else lo = mid;
  }
  return (lo + hi) / 2;
}

/** First year (from now) where the capital reaches the target at `rate`, or null within MAX_SEARCH_YEARS. */
export function yearsToTarget(
  goal: FinancialIndependenceGoal,
  rate: number
): number | null {
  if (rate <= -1) return null;
  for (let y = 0; y <= MAX_SEARCH_YEARS; y++) {
    if (wealthAtYear(goal, rate, y) >= goal.targetAmount) return y;
  }
  return null;
}

export interface GoalComputation {
  /** Required annual rate as a decimal, null when unreachable */
  requiredRate: number | null;
  /** Same, in percent */
  requiredRatePct: number | null;
  feasibility: FeasibilityLevel;
  /** Starting capital + all contributions */
  totalInvested: number;
  /** target − totalInvested: what the return must generate (can be negative) */
  requiredGains: number;
  /** Calendar year of the horizon */
  targetYear: number;
  /** What the target capital would yield per month at passiveYieldRate */
  monthlyPassiveIncome: number;
  /** Same for the capital reached at the comparison rate */
  compareMonthlyPassiveIncome: number | null;
  /** Projection at the required rate (at 0 % when unreachable) */
  requiredSeries: WealthPoint[];
  /** Projection at the comparison rate, when enabled */
  compareSeries: WealthPoint[] | null;
  compareFinalAmount: number | null;
  /** compareFinalAmount − target */
  compareGap: number | null;
  /** Years needed to reach the target at the comparison rate, null if never (within MAX_SEARCH_YEARS) */
  compareYearsToTarget: number | null;
}

/** Consolidate a goal into every figure shown in the UI. */
export function computeGoal(
  input: FinancialIndependenceGoal,
  now: Date = new Date()
): GoalComputation {
  const goal: FinancialIndependenceGoal = {
    ...input,
    years: Math.max(1, Math.round(input.years)),
    passiveYieldRate: input.passiveYieldRate ?? DEFAULT_PASSIVE_YIELD_RATE,
  };
  const hasInvestment = goal.startAmount > 0 || goal.contribution > 0;

  const requiredRate = solveRequiredRate(goal);
  const requiredRatePct = requiredRate === null ? null : requiredRate * 100;
  const feasibility = feasibilityForRate(requiredRatePct, hasInvestment);
  const invested = totalInvested(goal);

  let compareSeries: WealthPoint[] | null = null;
  let compareFinalAmount: number | null = null;
  let compareGap: number | null = null;
  let compareYearsToTarget: number | null = null;
  if (goal.compareEnabled) {
    const rate = Math.max(-0.99, goal.compareRate / 100);
    compareSeries = projectWealth(goal, rate);
    compareFinalAmount = compareSeries[compareSeries.length - 1].amount;
    compareGap = compareFinalAmount - goal.targetAmount;
    compareYearsToTarget = yearsToTarget(goal, rate);
  }

  return {
    requiredRate,
    requiredRatePct,
    feasibility,
    totalInvested: invested,
    requiredGains: goal.targetAmount - invested,
    targetYear: now.getFullYear() + goal.years,
    monthlyPassiveIncome: monthlyPassiveIncome(goal.targetAmount, goal.passiveYieldRate),
    compareMonthlyPassiveIncome:
      compareFinalAmount === null
        ? null
        : monthlyPassiveIncome(compareFinalAmount, goal.passiveYieldRate),
    requiredSeries: projectWealth(goal, requiredRate ?? 0),
    compareSeries,
    compareFinalAmount,
    compareGap,
    compareYearsToTarget,
  };
}
