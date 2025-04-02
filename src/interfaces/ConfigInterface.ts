import AbstractNumberInterface from "./AbstractNumberInterface";
import TaxInterface from "./TaxInterface";

export default interface ConfigInterface {
    uuid: string;
    name: string;
    tjm: AbstractNumberInterface;
    inclTjmTVA: boolean;
    tax: TaxInterface[];
    workedDays: AbstractNumberInterface[];
    total: AbstractNumberInterface;
    inclTotalTVA: boolean;
    createdAt: Date;
    updatedAt: Date;
}
