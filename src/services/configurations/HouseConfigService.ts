import HouseConfigInterface from "@/interfaces/configurations/HouseConfigInterface";
import LoanInterface from "@/interfaces/configurations/LoanInterface";
import IncomeInterface from "@/interfaces/IncomeInterface";
import { LoanType, createLoan } from "@/enums/LoanType";
import { v4 as uuidv4 } from "uuid";
import { Optional } from "typescript-optional";
import AbstractConfigService from "./AbstractConfigService";

export default class HouseConfigService extends AbstractConfigService<HouseConfigInterface> {
  private static instance: HouseConfigService;
  CONFIG_KEY: string = "finanz-configs-house";

  private defaultIncome(): IncomeInterface {
    return { id: uuidv4(), label: "Revenu", amount: 2500, frequency: "monthly" };
  }

  createEmptyConfig(): HouseConfigInterface {
    return {
      uuid: uuidv4(),
      name: "Nouvelle configuration",
      loans: [createLoan(LoanType.BANK)],
      downPayment: 30000,
      incomes: [this.defaultIncome()],
      propertyKind: "old",
      notaryRateOld: 7.5,
      notaryRateNew: 2.5,
      agencyRate: 4,
      agencyIncluded: true,
      preferLoanYear: true,
      inclInsurance: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Backfill missing fields and migrate configs saved in the legacy
   * single-loan format into the new multi-loan structure.
   */
  private migrate(raw: HouseConfigInterface): HouseConfigInterface {
    const c = raw as HouseConfigInterface & {
      loanAmount?: { value: number };
      annualInterestRate?: { value: number };
      loanTermMonths?: { value: number };
      annualInsuranceRate?: { value: number };
    };

    const loans: LoanInterface[] =
      Array.isArray(c.loans) && c.loans.length > 0
        ? c.loans.map((l) => ({ ...l, deferralMonths: l.deferralMonths ?? 0 }))
        : [
            {
              id: uuidv4(),
              type: LoanType.BANK,
              enabled: true,
              amount: c.loanAmount?.value ?? 150000,
              rate: c.annualInterestRate?.value ?? 3.3,
              years: c.loanTermMonths?.value
                ? Math.round(c.loanTermMonths.value / 12)
                : 20,
              insuranceRate: c.annualInsuranceRate?.value ?? 0.34,
              deferralMonths: 0,
            },
          ];

    return {
      uuid: c.uuid,
      name: c.name,
      createdAt: c.createdAt ?? new Date(),
      updatedAt: c.updatedAt ?? new Date(),
      loans,
      downPayment: c.downPayment ?? 30000,
      incomes:
        Array.isArray(c.incomes) && c.incomes.length > 0
          ? c.incomes
          : [this.defaultIncome()],
      propertyKind: c.propertyKind ?? "old",
      notaryRateOld: c.notaryRateOld ?? 7.5,
      notaryRateNew: c.notaryRateNew ?? 2.5,
      agencyRate: c.agencyRate ?? 4,
      agencyIncluded: c.agencyIncluded ?? true,
      preferLoanYear: c.preferLoanYear ?? true,
      inclInsurance: c.inclInsurance ?? true,
    };
  }

  getConfig(uuid: string): Optional<HouseConfigInterface> {
    return super.getConfig(uuid).map((c) => this.migrate(c));
  }

  getAllConfigs(): HouseConfigInterface[] {
    return super.getAllConfigs().map((c) => this.migrate(c));
  }

  static getInstance(): HouseConfigService {
    if (!HouseConfigService.instance) {
      HouseConfigService.instance = new HouseConfigService();
    }
    return HouseConfigService.instance;
  }
}
