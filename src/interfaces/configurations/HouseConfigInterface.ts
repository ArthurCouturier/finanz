import AbstractNumberInterface from "../AbstractNumberInterface";
import AbstractConfigInterface from "./AbstractConfigInterface";
import LoanInterface from "./LoanInterface";
import IncomeInterface from "../IncomeInterface";

export type PropertyKind = "old" | "new";

export default interface HouseConfigInterface extends AbstractConfigInterface {
  /** All loans making up the financing plan (PTZ, bank, family, ...) */
  loans: LoanInterface[];
  /** Personal contribution (apport) in € */
  downPayment: number;
  /** Reference incomes used to estimate the debt-to-income ratio */
  incomes: IncomeInterface[];

  /** Old (ancien) vs new (neuf) property — drives the notary rate */
  propertyKind: PropertyKind;
  /** Notary fees rate for an old property (%) */
  notaryRateOld: number;
  /** Notary fees rate for a new property (%) */
  notaryRateNew: number;
  /** Agency fees rate (%) */
  agencyRate: number;
  /** Agency fees included in the displayed price (FAI) */
  agencyIncluded: boolean;

  /** Display preference: term in years instead of months */
  preferLoanYear: boolean;
  /** Include borrower insurance in the computation */
  inclInsurance: boolean;

  // --- Legacy single-loan fields, kept optional for migration only ---
  loanAmount?: AbstractNumberInterface;
  annualInterestRate?: AbstractNumberInterface;
  loanTermMonths?: AbstractNumberInterface;
  annualInsuranceRate?: AbstractNumberInterface;
}
