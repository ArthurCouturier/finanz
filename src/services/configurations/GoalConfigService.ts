import GoalConfigInterface from "@/interfaces/configurations/GoalConfigInterface";
import { DEFAULT_PASSIVE_YIELD_RATE, GoalType } from "@/enums/GoalType";
import { createDefaultPortfolioPlan } from "@/services/PortfolioCalculationService";
import { v4 as uuidv4 } from "uuid";
import AbstractConfigService from "./AbstractConfigService";

export default class GoalConfigService extends AbstractConfigService<GoalConfigInterface> {
  private static instance: GoalConfigService;
  CONFIG_KEY: string = "finanz-goals";

  createEmptyConfig(): GoalConfigInterface {
    return {
      uuid: uuidv4(),
      name: "Nouvel objectif",
      type: GoalType.FINANCIAL_INDEPENDENCE,
      financialIndependence: {
        startAmount: 20000,
        targetAmount: 400000,
        years: 25,
        contribution: 500,
        contributionFrequency: "monthly",
        compareEnabled: false,
        compareRate: 5,
        passiveYieldRate: DEFAULT_PASSIVE_YIELD_RATE,
        portfolio: createDefaultPortfolioPlan(),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  static getInstance(): GoalConfigService {
    if (!GoalConfigService.instance) {
      GoalConfigService.instance = new GoalConfigService();
    }
    return GoalConfigService.instance;
  }
}
