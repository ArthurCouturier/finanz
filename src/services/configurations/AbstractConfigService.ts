import { Optional } from "typescript-optional";
import ConfigServiceInterface from "./ConfigServiceInterface";
import AbstractConfigInterface from "@/interfaces/configurations/AbstractConfigInterface";

export default class AbstractConfigService<
  ConfigInterface extends AbstractConfigInterface
> implements ConfigServiceInterface<ConfigInterface>
{
  CONFIG_KEY: string = "finanz-configuration";

  createEmptyConfig(): ConfigInterface {
    throw new Error("Method not implemented.");
  }

  getAllConfigs(): ConfigInterface[] {
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

  getAllConfigsIds(): string[] {
    const configsIds: string | null = localStorage.getItem(this.CONFIG_KEY);
    if (configsIds) {
      return JSON.parse(configsIds);
    }
    return [];
  }

  addConfigId(uuid: string): void {
    const allConfigs: string[] = this.getAllConfigsIds();
    if (!allConfigs.find((c: string) => c === uuid)) {
      allConfigs.push(uuid);
      localStorage.setItem(this.CONFIG_KEY, JSON.stringify(allConfigs));
    }
  }

  removeConfigId(uuid: string): void {
    const allConfigs: string[] = this.getAllConfigsIds();
    const index = allConfigs.findIndex((c: string) => c === uuid);
    if (index !== -1) {
      allConfigs.splice(index, 1);
      localStorage.setItem(this.CONFIG_KEY, JSON.stringify(allConfigs));
    }
  }

  getConfig(uuid: string): Optional<ConfigInterface> {
    const config = localStorage.getItem(uuid);
    if (config) {
      return Optional.of(JSON.parse(config) as ConfigInterface);
    }
    return Optional.empty();
  }

  setConfig(config: ConfigInterface): void {
    if (config.uuid) {
      this.addConfigId(config.uuid);
      localStorage.setItem(config.uuid, JSON.stringify(config));
    } else {
      console.log("Erreur lors de l'appel à setConfig");
    }
  }

  removeConfig(uuid: string): void {
    this.removeConfigId(uuid);
    localStorage.removeItem(uuid);
  }

  clearAll(): void {
    localStorage.clear();
    localStorage.setItem(this.CONFIG_KEY, JSON.stringify([]));
    const emptyConfig: ConfigInterface = this.createEmptyConfig();
    localStorage.setItem(emptyConfig.uuid, JSON.stringify(emptyConfig));
    this.addConfigId(emptyConfig.uuid);
  }
}
