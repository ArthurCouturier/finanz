import AbstractConfigInterface from "./AbstractConfigInterface";
import AbstractNumberInterface from "../AbstractNumberInterface";
import TaxInterface from "../TaxInterface";

export default interface TjmConfigInterface extends AbstractConfigInterface {
    tjm: AbstractNumberInterface;
    inclTjmTVA: boolean;
    tax: TaxInterface[];
    workedDays: AbstractNumberInterface[];
    total: AbstractNumberInterface;
    inclTotalTVA: boolean;
}
