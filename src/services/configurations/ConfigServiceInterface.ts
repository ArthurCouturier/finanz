import AbstractConfigInterface from "@/interfaces/configurations/AbstractConfigInterface";
import { Optional } from "typescript-optional";

export default interface ConfigServiceInterface<T extends AbstractConfigInterface> {

    CONFIG_KEY: string;

    createEmptyConfig(): T;

    getAllConfigs(): T[];

    getAllConfigsIds(): string[];

    addConfigId(uuid: string): void;

    removeConfigId(uuid: string): void;

    getConfig(uuid: string): Optional<T>;

    setConfig(config: T): void;

    removeConfig(uuid: string): void;

    clearAll(): void;
}
