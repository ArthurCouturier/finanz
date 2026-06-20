import { v4 as uuidv4 } from "uuid";
import LoanInterface from "@/interfaces/configurations/LoanInterface";

export enum LoanType {
  BANK = "BANK",
  PTZ = "PTZ",
  FAMILY = "FAMILY",
  ACTION_LOGEMENT = "ACTION_LOGEMENT",
}

/** Lower bound shared by every loan amount slider. */
export const LOAN_MIN_AMOUNT = 10000;
/** Non-linear slider exponent for loan/amount sliders. */
export const AMOUNT_CURVE = 2;

export interface LoanTypePreset {
  label: string;
  emoji: string;
  /** Default annual interest rate (%) */
  rate: number;
  /** Whether the rate can be edited (PTZ is locked at 0%) */
  rateEditable: boolean;
  /** Default term in years */
  years: number;
  /** Default annual insurance rate (%) on initial capital */
  insuranceRate: number;
  /** Whether borrower insurance applies to this loan type */
  hasInsurance: boolean;
  /** Whether a deferral period (différé) is relevant (PTZ) */
  hasDeferral: boolean;
  /** Default borrowed amount (€) */
  defaultAmount: number;
  /** Maximum borrowed amount allowed for this type (€) */
  maxAmount: number;
}

/**
 * Default presets reflecting the average Toulouse market around mid-2026.
 * These are starting points the user can freely tune with the sliders.
 */
export const LOAN_TYPE_PRESETS: Record<LoanType, LoanTypePreset> = {
  [LoanType.BANK]: {
    label: "Crédit bancaire",
    emoji: "🏦",
    rate: 3.3,
    rateEditable: true,
    years: 20,
    insuranceRate: 0.34,
    hasInsurance: true,
    hasDeferral: false,
    defaultAmount: 200000,
    maxAmount: 1500000,
  },
  [LoanType.PTZ]: {
    label: "PTZ (0%)",
    emoji: "🟢",
    rate: 0,
    rateEditable: false,
    years: 25,
    insuranceRate: 0,
    hasInsurance: false,
    hasDeferral: true,
    defaultAmount: 50000,
    maxAmount: 150000,
  },
  [LoanType.FAMILY]: {
    label: "Prêt familial",
    emoji: "👨‍👩‍👧",
    rate: 0,
    rateEditable: true,
    years: 10,
    insuranceRate: 0,
    hasInsurance: false,
    hasDeferral: false,
    defaultAmount: 30000,
    maxAmount: 150000,
  },
  [LoanType.ACTION_LOGEMENT]: {
    label: "Action Logement",
    emoji: "🏢",
    rate: 1.5,
    rateEditable: true,
    years: 20,
    insuranceRate: 0.34,
    hasInsurance: true,
    hasDeferral: false,
    defaultAmount: 30000,
    maxAmount: 50000,
  },
};

/** Build a new loan from a type's preset. */
export function createLoan(type: LoanType): LoanInterface {
  const preset = LOAN_TYPE_PRESETS[type];
  return {
    id: uuidv4(),
    type,
    enabled: true,
    amount: preset.defaultAmount,
    rate: preset.rate,
    years: preset.years,
    insuranceRate: preset.insuranceRate,
    deferralMonths: 0,
  };
}
