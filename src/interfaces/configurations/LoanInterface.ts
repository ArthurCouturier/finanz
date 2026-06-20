import { LoanType } from "@/enums/LoanType";

export default interface LoanInterface {
  id: string;
  type: LoanType;
  /** Whether this loan is included in the total computation */
  enabled: boolean;
  /** Capital borrowed (€) */
  amount: number;
  /** Annual interest rate (%) */
  rate: number;
  /** Term in years */
  years: number;
  /** Annual insurance rate (%) applied on the initial capital */
  insuranceRate: number;
  /** Deferral period in months with no amortization (différé), e.g. PTZ */
  deferralMonths: number;
}
