export type IncomeFrequency = "monthly" | "annual";

/** A reference income line used to estimate the debt-to-income ratio. */
export default interface IncomeInterface {
  id: string;
  label: string;
  /** Amount expressed at the chosen frequency (€) */
  amount: number;
  frequency: IncomeFrequency;
}
