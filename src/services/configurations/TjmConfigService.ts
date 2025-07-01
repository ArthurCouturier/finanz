import TjmConfigInterface from "@/interfaces/configurations/TjmConfigInterface";
import { v4 as uuidv4 } from 'uuid';
import AbstractConfigService from "./AbstractConfigService";

export default class TjmConfigService extends AbstractConfigService<TjmConfigInterface> {

    private static instance: TjmConfigService;
    CONFIG_KEY: string = "finanz-configs";

    createEmptyConfig(): TjmConfigInterface {
        return {
            uuid: uuidv4(),
            name: "New Configuration",
            tjm: {
                uuid: uuidv4(),
                title: "TJM",
                subtitle: "(H.T.)",
                currency: "€",
                value: 350,
            },
            inclTjmTVA: true,
            tax: [{
                uuid: uuidv4(),
                title: "Tax",
                subtitle: "",
                currency: "€",
                value: 12.5,
            }],
            workedDays: [{
                uuid: uuidv4(),
                title: "Worked days",
                subtitle: "",
                currency: "€",
                value: 20,
            }],
            total: {
                uuid: uuidv4(),
                title: "Total",
                subtitle: "(Tax incl.)",
                currency: "€",
                value: 0,
            },
            inclTotalTVA: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    }

    static getInstance(): TjmConfigService {
        if (!TjmConfigService.instance) {
            TjmConfigService.instance = new TjmConfigService();
        }
        return TjmConfigService.instance;
    }
}
