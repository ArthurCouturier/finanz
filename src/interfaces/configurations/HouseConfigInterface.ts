import AbstractNumberInterface from "../AbstractNumberInterface";
import AbstractConfigInterface from "./AbstractConfigInterface";

export default interface HouseConfigInterface extends AbstractConfigInterface {
    loanAmount: AbstractNumberInterface;
    annualInterestRate: AbstractNumberInterface;
    loanTermMonths: AbstractNumberInterface;
    preferLoanYear: boolean;
    annualInsuranceRate: AbstractNumberInterface;
    inclInsurance: boolean;
}
