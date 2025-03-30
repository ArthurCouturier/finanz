import AbstractNumberInterface from "./AbstractNumberInterface";
import TaxInterface from "./TaxInterface";

export default interface ConfigInterface {
    uuid: string;
    name: string;
    tjm: AbstractNumberInterface;
    tax: TaxInterface[];
    workedDays: AbstractNumberInterface[];
    total: AbstractNumberInterface;
    createdAt: Date;
    updatedAt: Date;
}
