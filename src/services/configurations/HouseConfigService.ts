import HouseConfigInterface from "@/interfaces/configurations/HouseConfigInterface";
import { v4 as uuidv4 } from 'uuid';
import AbstractConfigService from "./AbstractConfigService";

export default class HouseConfigService extends AbstractConfigService<HouseConfigInterface> {

    private static instance: HouseConfigService;
    CONFIG_KEY: string = "finanz-configs-house";

    createEmptyConfig(): HouseConfigInterface {
        return {
            uuid: uuidv4(),
            name: "New Configuration",
            loanAmount: {
                uuid: uuidv4(),
                title: "Loan Amount",
                currency: "€",
                value: 100000,
            },
            annualInterestRate: {
                uuid: uuidv4(),
                title: "Annual Interest Rate",
                subtitle: "(%)",
                value: 4,
            },
            loanTermMonths: {
                uuid: uuidv4(),
                title: "Loan Term",
                subtitle: "(Months)",
                currency: "€",
                value: 350,
            },
            preferLoanYear: true,
            annualInsuranceRate: {
                uuid: uuidv4(),
                title: "Annual Insurance Rate",
                subtitle: "(%)",
                value: 0.5,
            },
            inclInsurance: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    }

    static getInstance(): HouseConfigService {
        if (!HouseConfigService.instance) {
            HouseConfigService.instance = new HouseConfigService();
        }
        return HouseConfigService.instance;
    }
}
