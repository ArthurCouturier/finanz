import ConfigInterface from "@/interfaces/ConfigInterface";
import { v4 as uuidv4 } from 'uuid';
import { Optional } from "typescript-optional";

export default class ConfigService {

    static CONFIG_KEY: string = "finanz-configs";

    static createEmptyConfig(): ConfigInterface {
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
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    }

    static getAllConfigs(): ConfigInterface[] {
        const configsIds: string | null = localStorage.getItem(this.CONFIG_KEY);
        const result: ConfigInterface[] = [];
        if (configsIds) {
            const configsIdsParsed: string[] = JSON.parse(configsIds);
            for (const uuid of configsIdsParsed) {
                const config = localStorage.getItem(uuid);
                if (config) {
                    result.push(JSON.parse(config));
                }
            }
        }
        if (result.length === 0) {
            const emptyConfig: ConfigInterface = this.createEmptyConfig();
            localStorage.setItem(emptyConfig.uuid, JSON.stringify(emptyConfig));
            this.addConfigId(emptyConfig.uuid);
            result.push(emptyConfig);
        }
        return result;
    }

    private static getAllConfigsIds(): string[] {
        const configsIds: string | null = localStorage.getItem(this.CONFIG_KEY);
        if (configsIds) {
            return JSON.parse(configsIds);
        }
        return [];
    }

    static addConfigId(uuid: string): void {
        const allConfigs: string[] = this.getAllConfigsIds();
        if (!allConfigs.find((c: string) => c === uuid)) {
            allConfigs.push(uuid);
            localStorage.setItem(this.CONFIG_KEY, JSON.stringify(allConfigs));
        }
    }

    static removeConfigId(uuid: string): void {
        const allConfigs: string[] = this.getAllConfigsIds();
        const index = allConfigs.findIndex((c: string) => c === uuid);
        if (index !== -1) {
            allConfigs.splice(index, 1);
            localStorage.setItem(this.CONFIG_KEY, JSON.stringify(allConfigs));
        }
    }

    static getConfig(uuid: string): Optional<ConfigInterface> {
        const config = localStorage.getItem(uuid);
        if (config) {
            return JSON.parse(config);
        }
        return Optional.empty();
    }

    static setConfig(config: ConfigInterface): void {
        this.addConfigId(config.uuid);
        localStorage.setItem(config.uuid, JSON.stringify(config));
    }

    static removeConfig(uuid: string): void {
        this.removeConfigId(uuid);
        localStorage.removeItem(uuid);
    }

    static clearAll(): void {
        localStorage.clear();
        localStorage.setItem(this.CONFIG_KEY, JSON.stringify([]));
        const emptyConfig: ConfigInterface = this.createEmptyConfig();
        localStorage.setItem(emptyConfig.uuid, JSON.stringify(emptyConfig));
        this.addConfigId(emptyConfig.uuid);
    }
}
