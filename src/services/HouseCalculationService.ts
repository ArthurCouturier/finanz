import HouseConfigInterface from "@/interfaces/configurations/HouseConfigInterface";
import LoanInterface from "@/interfaces/configurations/LoanInterface";
import IncomeInterface from "@/interfaces/IncomeInterface";

/**
 * Pure financial engine for the real-estate financing simulator.
 *
 * Conventions used (standard French mortgage practice):
 *  - Monthly payment uses the constant-annuity amortization formula.
 *  - Borrower insurance is computed on the INITIAL capital (the most common
 *    "assurance sur capital initial" convention): constant monthly premium.
 *  - Notary and agency fees are computed on the net seller price (prix net
 *    vendeur), which is the legal base for both. The required cash envelope
 *    (loans + down payment) must cover price + notary + agency, so the
 *    affordable price is derived by inverting that relation (see computeHouse).
 */

export interface LoanComputation {
  loan: LoanInterface;
  /** Total term in months */
  months: number;
  /** Months effectively amortized (term minus deferral) */
  amortizedMonths: number;
  /** Principal + interest part of the monthly payment (amortization phase) */
  monthlyPayment: number;
  /** Monthly insurance premium */
  monthlyInsurance: number;
  /** monthlyPayment + monthlyInsurance */
  monthlyTotal: number;
  /** Total interest paid over the life of the loan */
  totalInterest: number;
  /** Total insurance paid over the life of the loan */
  totalInsurance: number;
  /** Interest + insurance (what is repaid on top of the capital) */
  totalCost: number;
  /** Capital + interest + insurance */
  totalRepayment: number;
}

export interface HouseComputation {
  /** Per-loan breakdown, enabled loans only */
  loanComputations: LoanComputation[];
  /** Σ capital of enabled loans */
  totalBorrowed: number;
  /** Σ interest of enabled loans */
  totalInterest: number;
  /** Σ insurance of enabled loans */
  totalInsurance: number;
  /** Interest + insurance — what must be repaid on top of the borrowed capital */
  extraToRepay: number;
  /** Personal contribution */
  downPayment: number;
  /** totalBorrowed + downPayment — the cash available for the acquisition */
  envelope: number;
  /** Net seller price (prix net vendeur), the base for notary & agency fees */
  netSellerPrice: number;
  notaryFees: number;
  agencyFees: number;
  totalFees: number;
  /** Affordable property price — the displayed price the user can target */
  purchasingPower: number;
  /** Σ monthly (payment + insurance) of enabled loans */
  monthlyTotal: number;
  /** Net monthly income from the reference income lines */
  monthlyIncome: number;
  /** monthlyTotal / monthlyIncome, or null when no income is set */
  debtRatio: number | null;
}

/** HCSF guideline: debt-to-income ratio should not exceed 35%. */
export const MAX_DEBT_RATIO = 0.35;

/** Compute a single loan's payment schedule figures. */
export function computeLoan(
  loan: LoanInterface,
  inclInsurance: boolean
): LoanComputation {
  const months = Math.max(0, Math.round(loan.years * 12));
  // A deferral cannot consume the whole term; keep at least one amortized month.
  const deferral = Math.min(
    Math.max(0, Math.round(loan.deferralMonths || 0)),
    Math.max(0, months - 1)
  );
  const amortizedMonths = months - deferral;
  const principal = Math.max(0, loan.amount);
  const monthlyRate = loan.rate / 100 / 12;

  let monthlyPayment = 0;
  if (amortizedMonths > 0) {
    if (monthlyRate > 0) {
      // Constant-annuity formula.
      monthlyPayment =
        (principal * monthlyRate) /
        (1 - Math.pow(1 + monthlyRate, -amortizedMonths));
    } else {
      // Zero-rate loan (PTZ, family at 0%): straight-line repayment.
      monthlyPayment = principal / amortizedMonths;
    }
  }

  // Interest = everything repaid beyond the principal over the amortized phase.
  const totalInterest = Math.max(
    0,
    monthlyPayment * amortizedMonths - principal
  );

  const insuranceRate =
    inclInsurance && loan.insuranceRate > 0 ? loan.insuranceRate / 100 : 0;
  const monthlyInsurance = (principal * insuranceRate) / 12;
  // Insurance is paid from day one, including during any deferral period.
  const totalInsurance = monthlyInsurance * months;

  const monthlyTotal = monthlyPayment + monthlyInsurance;
  const totalCost = totalInterest + totalInsurance;
  const totalRepayment = principal + totalCost;

  return {
    loan,
    months,
    amortizedMonths,
    monthlyPayment,
    monthlyInsurance,
    monthlyTotal,
    totalInterest,
    totalInsurance,
    totalCost,
    totalRepayment,
  };
}

/** Net monthly income from reference income lines. */
export function monthlyIncomeFromIncomes(incomes: IncomeInterface[]): number {
  if (!incomes) return 0;
  return incomes.reduce(
    (sum, inc) =>
      sum + (inc.frequency === "annual" ? inc.amount / 12 : inc.amount),
    0
  );
}

/** Consolidate the whole financing plan into the figures shown in the UI. */
export function computeHouse(config: HouseConfigInterface): HouseComputation {
  const enabledLoans = (config.loans || []).filter((l) => l.enabled);
  const loanComputations = enabledLoans.map((l) =>
    computeLoan(l, config.inclInsurance)
  );

  const totalBorrowed = loanComputations.reduce(
    (s, c) => s + Math.max(0, c.loan.amount),
    0
  );
  const totalInterest = loanComputations.reduce((s, c) => s + c.totalInterest, 0);
  const totalInsurance = loanComputations.reduce(
    (s, c) => s + c.totalInsurance,
    0
  );
  const extraToRepay = totalInterest + totalInsurance;
  const monthlyTotal = loanComputations.reduce((s, c) => s + c.monthlyTotal, 0);

  const downPayment = Math.max(0, config.downPayment || 0);
  const envelope = totalBorrowed + downPayment;

  const notaryRate =
    (config.propertyKind === "new"
      ? config.notaryRateNew
      : config.notaryRateOld) / 100;
  const agencyRate = (config.agencyRate || 0) / 100;

  // envelope = netSellerPrice * (1 + notaryRate + agencyRate)
  // because the cash must cover the seller's price plus fees computed on it.
  const denominator = 1 + notaryRate + agencyRate;
  const netSellerPrice = denominator > 0 ? envelope / denominator : 0;
  const notaryFees = netSellerPrice * notaryRate;
  const agencyFees = netSellerPrice * agencyRate;
  const totalFees = notaryFees + agencyFees;

  // Purchasing power = the price tag the user can shop for.
  //  - FAI: the advertised price already includes the agency fee.
  //  - non-FAI: the advertised price is the net seller price (agency on top).
  // The total cash disbursed (envelope) is identical either way.
  const purchasingPower = config.agencyIncluded
    ? netSellerPrice + agencyFees
    : netSellerPrice;

  const monthlyIncome = monthlyIncomeFromIncomes(config.incomes);
  const debtRatio = monthlyIncome > 0 ? monthlyTotal / monthlyIncome : null;

  return {
    loanComputations,
    totalBorrowed,
    totalInterest,
    totalInsurance,
    extraToRepay,
    downPayment,
    envelope,
    netSellerPrice,
    notaryFees,
    agencyFees,
    totalFees,
    purchasingPower,
    monthlyTotal,
    monthlyIncome,
    debtRatio,
  };
}
