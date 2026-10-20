import AbstractConfigInterface from "./AbstractConfigInterface";
import { ContributionFrequency, GoalType } from "@/enums/GoalType";
import { AssetKey, EnvelopeKey, HistoryPeriod } from "@/data/InvestmentData";

/** One allocation line of the investment planner: an asset held in an envelope. */
export interface PortfolioLine {
  id: string;
  envelope: EnvelopeKey;
  asset: AssetKey;
  /** Share of every euro saved (start + contributions), in % — normalised to 100 */
  weight: number;
}

export interface PortfolioPlan {
  /** Draw the portfolio projection as a third curve */
  enabled: boolean;
  lines: PortfolioLine[];
  /** Which trailing history (10 / 20 / 30 years) feeds the expected returns */
  basisPeriod: HistoryPeriod;
  /** Prudence haircut (points / year) taken off risky assets' historical returns */
  haircut: number;
  /** Express the projection in constant euros (inflation of the basis period) */
  inflationAdjusted: boolean;
  /** Apply the PER "équilibré horizon retraite" securing schedule (20 / 50 / 70 %) */
  glidePath: boolean;
  /** Gross yearly return (%) of the secured pocket used by the glide path */
  safeRate: number;
  /** Marginal income-tax rate (%) at contribution time — drives the PER deduction */
  tmiEntry: number;
  /** Marginal income-tax rate (%) at exit — taxes the PER capital */
  tmiExit: number;
}

/** Parameters of a "financial independence" goal. */
export interface FinancialIndependenceGoal {
  /** Capital already invested today (€) */
  startAmount: number;
  /** Capital to reach (€) */
  targetAmount: number;
  /** Horizon in years from now */
  years: number;
  /** Amount of each regular contribution (€) */
  contribution: number;
  contributionFrequency: ContributionFrequency;
  /** Show a second projection at a custom rate next to the required one */
  compareEnabled: boolean;
  /** Annual rate (%) of the comparison projection */
  compareRate: number;
  /** Yearly withdrawal rate (%) turning a capital into a monthly passive income */
  passiveYieldRate: number;
  /** "Where / what / when" investment planner */
  portfolio: PortfolioPlan;
}

export default interface GoalConfigInterface extends AbstractConfigInterface {
  type: GoalType;
  financialIndependence: FinancialIndependenceGoal;
}
