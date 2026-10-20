import { v4 as uuidv4 } from "uuid";
import {
  ASSETS,
  ENVELOPES,
  EnvelopeKey,
  GLIDE_PATH_SCHEDULE,
  INFLATION,
  PORTFOLIO_PRESETS,
  PortfolioPreset,
} from "@/data/InvestmentData";
import {
  FinancialIndependenceGoal,
  PortfolioLine,
  PortfolioPlan,
} from "@/interfaces/configurations/GoalConfigInterface";
import {
  PERIODS_PER_YEAR,
  solveRequiredRate,
  WealthPoint,
} from "./GoalCalculationService";

/**
 * Pure engine of the "where / what / when" planner.
 *
 * Each line (asset × envelope × weight) receives its share of the starting
 * capital and of every contribution, grows at the asset's historical return
 * minus fees, and is taxed at exit according to its envelope. The sum of the
 * lines' net liquidation values gives the portfolio curve; the net annualised
 * rate is the constant rate that would turn the user's own savings effort
 * into that final amount (so the PER tax refund shows up as extra return).
 *
 * PER modelling: with a marginal tax rate t at contribution time, reinvesting
 * the tax refund lets 1 € of effort place 1 / (1 − t) € on the plan; at exit
 * the capital is taxed at the exit TMI and the gains at the PFU.
 */

/** Every euro placed in a PER beyond this multiplier is capped (TMI 90 %). */
const MAX_PER_BOOST = 10;
const LIVRET_CEILING = ENVELOPES.livret.ceiling ?? 34950;
const PEA_CEILING = ENVELOPES.pea.ceiling ?? 150000;
const PER_YEARLY_CEILING = ENVELOPES.per.ceiling ?? 37680;

export function buildPresetLines(preset: PortfolioPreset): PortfolioLine[] {
  return preset.lines.map((l) => ({ id: uuidv4(), ...l }));
}

export function createDefaultPortfolioPlan(): PortfolioPlan {
  return {
    enabled: true,
    lines: buildPresetLines(PORTFOLIO_PRESETS[1]),
    basisPeriod: 20,
    haircut: 0,
    inflationAdjusted: false,
    glidePath: false,
    safeRate: 2.6,
    tmiEntry: 30,
    tmiExit: 30,
  };
}

/** Make a saved (possibly older or partial) plan safe to use. */
export function normalizePortfolioPlan(
  plan?: Partial<PortfolioPlan> | null
): PortfolioPlan {
  const def = createDefaultPortfolioPlan();
  if (!plan) return def;
  const lines = Array.isArray(plan.lines)
    ? plan.lines
        .filter((l) => l && ASSETS[l.asset] && ENVELOPES[l.envelope])
        .map((l) => ({
          id: l.id ?? uuidv4(),
          envelope: l.envelope,
          asset: l.asset,
          weight: Math.max(0, globalThis.Number(l.weight) || 0),
        }))
    : def.lines;
  return { ...def, ...plan, lines };
}

/** Minimum low-risk share required by the "équilibré horizon retraite" schedule. */
export function secureShareForYearsLeft(yearsLeft: number): number {
  const steps = [...GLIDE_PATH_SCHEDULE].sort(
    (a, b) => a.yearsLeftAtMost - b.yearsLeftAtMost
  );
  for (const step of steps) {
    if (yearsLeft <= step.yearsLeftAtMost) return step.secureShare;
  }
  return 0;
}

export interface LineComputation {
  line: PortfolioLine;
  /** Normalised share of each euro saved (0..1) */
  share: number;
  /** Expected gross return (%) after the prudence haircut */
  grossRate: number;
  /** Product + envelope fees (%/year) */
  feeRate: number;
  /** PER multiplier (tax refund reinvested), 1 elsewhere */
  boost: number;
  /** € placed on the line over the horizon (after boost) */
  invested: number;
  /** € of the user's own savings effort routed to the line */
  effort: number;
  /** Value before exit tax at the horizon */
  grossValue: number;
  tax: number;
  netValue: number;
  /** Exit tax rate (%) applied to the gains at the horizon */
  taxRateApplied: number;
}

export interface PlannerWarning {
  envelope: EnvelopeKey | null;
  message: string;
}

export interface PortfolioComputation {
  lines: LineComputation[];
  weightSum: number;
  weightedGrossRate: number;
  weightedFeeRate: number;
  weightedVolatility: number;
  worstDrawdown: number;
  grossFinal: number;
  totalFees: number;
  totalTax: number;
  netFinal: number;
  /** Nominal %/year, measured on the user's own effort (null when nothing is invested) */
  netAnnualizedRate: number | null;
  /** Same, after the inflation of the basis period */
  realAnnualizedRate: number | null;
  inflationRate: number;
  /** Net liquidation value per year (constant € when inflationAdjusted) */
  series: WealthPoint[];
  /** Secured share applied by the glide path at the start of each year (index = year) */
  secureShareByYear: number[];
  /** Contribution per period that would exactly reach the target with this portfolio */
  contributionNeeded: number | null;
  reachesTarget: boolean;
  warnings: PlannerWarning[];
}

interface LineProjection {
  values: number[];
  invested: number[];
  effort: number[];
}

function projectLine(
  goal: FinancialIndependenceGoal,
  plan: PortfolioPlan,
  line: PortfolioLine,
  share: number,
  years: number,
  withFees: boolean
): LineProjection {
  const asset = ASSETS[line.asset];
  const env = ENVELOPES[line.envelope];
  const n = PERIODS_PER_YEAR[goal.contributionFrequency];
  const risky = asset.category !== "securise";
  const grossRate = asset.returns[plan.basisPeriod] - (risky ? plan.haircut : 0);
  const feeRate = withFees ? asset.defaultFee + env.defaultFee : 0;
  const boost =
    env.key === "per"
      ? Math.min(MAX_PER_BOOST, 1 / (1 - Math.min(0.9, plan.tmiEntry / 100)))
      : 1;
  const startEffort = Math.max(0, goal.startAmount) * share;
  const cEffort = Math.max(0, goal.contribution) * share;
  const start = startEffort * boost;
  const c = cEffort * boost;
  const safeNet = plan.safeRate - (withFees ? env.defaultFee : 0);

  const values = [start];
  const invested = [start];
  const effort = [startEffort];
  let w = start;
  for (let y = 1; y <= years; y++) {
    const yearsLeft = years - (y - 1);
    const s = plan.glidePath && risky ? secureShareForYearsLeft(yearsLeft) : 0;
    const ratePct = (grossRate - feeRate) * (1 - s) + safeNet * s;
    const g = ratePct / 100;
    const annuity =
      Math.abs(g) < 1e-9 ? c * n : c * (g / (Math.pow(1 + g, 1 / n) - 1));
    w = w * (1 + g) + annuity;
    values.push(w);
    invested.push(start + c * n * y);
    effort.push(startEffort + cEffort * n * y);
  }
  return { values, invested, effort };
}

function exitTax(
  line: PortfolioLine,
  plan: PortfolioPlan,
  grossValue: number,
  invested: number,
  year: number
): { tax: number; rate: number } {
  const env = ENVELOPES[line.envelope];
  const gains = Math.max(0, grossValue - invested);
  if (env.key === "per") {
    // Deducted capital comes back as taxable income; gains follow the PFU.
    const tax = invested * (plan.tmiExit / 100) + gains * (env.taxRateLong / 100);
    return { tax, rate: env.taxRateLong };
  }
  const rate = year >= env.minYearsForLong ? env.taxRateLong : env.taxRateShort;
  const taxable = Math.max(0, gains - env.abatement);
  return { tax: (taxable * rate) / 100, rate };
}

function normalisedShares(plan: PortfolioPlan): { shares: number[]; weightSum: number } {
  const weights = plan.lines.map((l) => Math.max(0, l.weight));
  const weightSum = weights.reduce((s, w) => s + w, 0);
  return {
    shares: weights.map((w) => (weightSum > 0 ? w / weightSum : 0)),
    weightSum,
  };
}

interface CoreResult {
  lines: LineComputation[];
  weightSum: number;
  series: number[];
  grossFinal: number;
  totalFees: number;
  totalTax: number;
  netFinal: number;
  investedByEnvelope: Record<EnvelopeKey, number[]>;
  yearlyPerContribution: number;
}

function computeCore(goal: FinancialIndependenceGoal, plan: PortfolioPlan): CoreResult {
  const years = Math.max(1, Math.round(goal.years));
  const n = PERIODS_PER_YEAR[goal.contributionFrequency];
  const { shares, weightSum } = normalisedShares(plan);
  const series = new Array<number>(years + 1).fill(0);
  const investedByEnvelope = {
    pea: new Array<number>(years + 1).fill(0),
    cto: new Array<number>(years + 1).fill(0),
    av: new Array<number>(years + 1).fill(0),
    per: new Array<number>(years + 1).fill(0),
    livret: new Array<number>(years + 1).fill(0),
  };
  let grossFinal = 0;
  let totalFees = 0;
  let totalTax = 0;
  let yearlyPerContribution = 0;

  const lines = plan.lines.map((line, idx) => {
    const share = shares[idx];
    const asset = ASSETS[line.asset];
    const env = ENVELOPES[line.envelope];
    const withFees = projectLine(goal, plan, line, share, years, true);
    const noFees = projectLine(goal, plan, line, share, years, false);
    for (let y = 0; y <= years; y++) {
      const { tax } = exitTax(line, plan, withFees.values[y], withFees.invested[y], y);
      series[y] += withFees.values[y] - tax;
      investedByEnvelope[env.key][y] += withFees.invested[y];
    }
    const grossValue = withFees.values[years];
    const { tax, rate } = exitTax(line, plan, grossValue, withFees.invested[years], years);
    grossFinal += grossValue;
    totalFees += noFees.values[years] - grossValue;
    totalTax += tax;
    const boost =
      env.key === "per"
        ? Math.min(MAX_PER_BOOST, 1 / (1 - Math.min(0.9, plan.tmiEntry / 100)))
        : 1;
    if (env.key === "per") {
      yearlyPerContribution += Math.max(0, goal.contribution) * share * boost * n;
    }
    const risky = asset.category !== "securise";
    return {
      line,
      share,
      grossRate: asset.returns[plan.basisPeriod] - (risky ? plan.haircut : 0),
      feeRate: asset.defaultFee + env.defaultFee,
      boost,
      invested: withFees.invested[years],
      effort: withFees.effort[years],
      grossValue,
      tax,
      netValue: grossValue - tax,
      taxRateApplied: rate,
    };
  });

  return {
    lines,
    weightSum,
    series,
    grossFinal,
    totalFees,
    totalTax,
    netFinal: series[years],
    investedByEnvelope,
    yearlyPerContribution,
  };
}

/** Contribution per period needed to end exactly on the target with this portfolio. */
function solveContributionNeeded(
  goal: FinancialIndependenceGoal,
  plan: PortfolioPlan
): number | null {
  const target = goal.targetAmount;
  const finalFor = (c: number) =>
    computeCore({ ...goal, contribution: c }, plan).netFinal;
  if (finalFor(0) >= target) return 0;
  let lo = 0;
  let hi = 10_000_000;
  if (finalFor(hi) < target) return null;
  for (let k = 0; k < 60; k++) {
    const mid = (lo + hi) / 2;
    if (finalFor(mid) >= target) hi = mid;
    else lo = mid;
  }
  return (lo + hi) / 2;
}

function firstYearAbove(values: number[], ceiling: number): number | null {
  const idx = values.findIndex((v) => v > ceiling);
  return idx === -1 ? null : idx;
}

export function computePortfolio(
  input: FinancialIndependenceGoal,
  now: Date = new Date()
): PortfolioComputation {
  const goal: FinancialIndependenceGoal = {
    ...input,
    years: Math.max(1, Math.round(input.years)),
  };
  const plan = goal.portfolio;
  const years = goal.years;
  const startYear = now.getFullYear();
  const core = computeCore(goal, plan);

  const inflationRate = INFLATION[plan.basisPeriod];
  const deflate = (v: number, y: number) =>
    plan.inflationAdjusted ? v / Math.pow(1 + inflationRate / 100, y) : v;
  const series: WealthPoint[] = core.series.map((v, y) => ({
    year: y,
    amount: deflate(v, y),
  }));

  const hasInvestment =
    core.weightSum > 0 && (goal.startAmount > 0 || goal.contribution > 0);
  const netAnnualized =
    hasInvestment && core.netFinal > 0
      ? solveRequiredRate({ ...goal, targetAmount: core.netFinal })
      : null;
  const netAnnualizedRate = netAnnualized === null ? null : netAnnualized * 100;
  const realAnnualizedRate =
    netAnnualized === null
      ? null
      : ((1 + netAnnualized) / (1 + inflationRate / 100) - 1) * 100;

  const weightedGrossRate = core.lines.reduce((s, l) => s + l.share * l.grossRate, 0);
  const weightedFeeRate = core.lines.reduce((s, l) => s + l.share * l.feeRate, 0);
  const weightedVolatility = core.lines.reduce(
    (s, l) => s + l.share * (ASSETS[l.line.asset].volatility ?? 0),
    0
  );
  const worstDrawdown = core.lines.reduce(
    (worst, l) =>
      l.share > 0 ? Math.min(worst, ASSETS[l.line.asset].maxDrawdown ?? 0) : worst,
    0
  );

  const secureShareByYear: number[] = [];
  for (let y = 0; y <= years; y++) {
    secureShareByYear.push(
      plan.glidePath ? secureShareForYearsLeft(years - Math.max(0, y - 1)) : 0
    );
  }

  const warnings: PlannerWarning[] = [];
  if (core.weightSum <= 0 || plan.lines.length === 0) {
    warnings.push({ envelope: null, message: "Ajoutez au moins une ligne avec un poids supérieur à 0." });
  }
  const peaYear = firstYearAbove(core.investedByEnvelope.pea, PEA_CEILING);
  if (peaYear !== null) {
    warnings.push({
      envelope: "pea",
      message: `Plafond du PEA (${PEA_CEILING.toLocaleString("fr-FR")} € de versements) atteint vers ${startYear + peaYear} : au-delà, basculez les versements actions vers le CTO ou l'assurance-vie.`,
    });
  }
  const livretYear = firstYearAbove(core.investedByEnvelope.livret, LIVRET_CEILING);
  if (livretYear !== null) {
    warnings.push({
      envelope: "livret",
      message: `Plafond Livret A + LDDS (${LIVRET_CEILING.toLocaleString("fr-FR")} €) atteint vers ${startYear + livretYear} : l'excédent ne sera plus rémunéré, réorientez-le vers une autre enveloppe.`,
    });
  }
  if (core.yearlyPerContribution > PER_YEARLY_CEILING) {
    warnings.push({
      envelope: "per",
      message: `Vos versements PER (${Math.round(core.yearlyPerContribution).toLocaleString("fr-FR")} € / an, économie d'impôt réinvestie comprise) dépassent le plafond de déduction 2026 (${PER_YEARLY_CEILING.toLocaleString("fr-FR")} €, ou 10 % de vos revenus) : l'excédent n'est pas déductible.`,
    });
  }
  if (core.lines.some((l) => l.line.envelope === "per" && l.share > 0) && plan.tmiEntry < 30) {
    warnings.push({
      envelope: "per",
      message: `Avec une TMI de ${plan.tmiEntry} %, le PER est rarement intéressant : l'économie d'impôt est faible alors que le capital reste bloqué jusqu'à la retraite.`,
    });
  }
  if (core.lines.some((l) => l.line.envelope === "pea" && l.share > 0) && years < ENVELOPES.pea.minYearsForLong) {
    warnings.push({
      envelope: "pea",
      message: `Horizon de ${years} ans : un retrait du PEA avant 5 ans est taxé à 31,4 % et ferme le plan. Visez au moins 5 ans ou préférez l'assurance-vie / le CTO.`,
    });
  }
  if (core.lines.some((l) => l.line.envelope === "av" && l.share > 0) && years < ENVELOPES.av.minYearsForLong) {
    warnings.push({
      envelope: "av",
      message: `Horizon de ${years} ans : l'avantage fiscal de l'assurance-vie n'est acquis qu'après 8 ans (24,7 % au lieu de 30 % sur les gains).`,
    });
  }

  return {
    lines: core.lines,
    weightSum: core.weightSum,
    weightedGrossRate,
    weightedFeeRate,
    weightedVolatility,
    worstDrawdown,
    grossFinal: core.grossFinal,
    totalFees: core.totalFees,
    totalTax: core.totalTax,
    netFinal: core.netFinal,
    netAnnualizedRate,
    realAnnualizedRate,
    inflationRate,
    series,
    secureShareByYear,
    contributionNeeded: hasInvestment || goal.startAmount > 0 ? solveContributionNeeded(goal, plan) : null,
    reachesTarget: deflate(core.netFinal, years) >= goal.targetAmount,
    warnings,
  };
}
