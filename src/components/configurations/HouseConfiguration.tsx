import NumberFlow from "@number-flow/react";
import Number from "../Number";
import { useEffect, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import HouseConfigInterface from "@/interfaces/configurations/HouseConfigInterface";
import HouseConfigService from "@/services/configurations/HouseConfigService";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { Switch } from "../ui/switch";
import { Link } from "react-router-dom";

export default function HouseConfiguration({
    config
}: {
    config: HouseConfigInterface
}) {
    const [name, setName] = useState(config.name)
    const [loanAmount, setLoanAmount] = useState(config.loanAmount.value)
    const [annualInterestRate, setAnnualInterestRate] = useState(config.annualInterestRate.value)
    const [loanTermMonths, setLoanTermMonths] = useState(config.loanTermMonths.value)
    const [preferLoanYear, setPreferLoanYear] = useState(config.preferLoanYear)
    const [annualInsuranceRate, setAnnualInsuranceRate] = useState(config.annualInsuranceRate.value)
    const [inclInsurance, setInclInsurance] = useState(config.inclInsurance)

    const compute = () => {
        const monthlyInterestRate = annualInterestRate / 100 / 12;
        const monthlyPayment = loanAmount * (monthlyInterestRate / (1 - Math.pow(1 + monthlyInterestRate, -loanTermMonths)));
        const monthlyInsurancePayment = (loanAmount * annualInsuranceRate) / 12;

        const totalRepayment = monthlyPayment * loanTermMonths;
        const totalInterestCost = totalRepayment - loanAmount;


        return {
            monthlyPayment,
            monthlyInsurancePayment,
            totalRepayment,
            totalInterestCost
        };
    }

    const [monthlyPayment, setMonthlyPayment] = useState(compute().monthlyPayment)
    const [monthlyInsurancePayment, setMonthlyInsurancePayment] = useState(compute().monthlyInsurancePayment)
    const [totalRepayment, setTotalRepayment] = useState(compute().totalRepayment)
    const [totalInterestCost, setTotalInterestCost] = useState(compute().totalInterestCost)
    const [decimal, setDecimal] = useState(false)

    useEffect(() => {
        const results = compute()
        setMonthlyPayment(results.monthlyPayment)
        setMonthlyInsurancePayment(results.monthlyInsurancePayment)
        setTotalRepayment(results.totalRepayment)
        setTotalInterestCost(results.totalInterestCost)
    }, [loanAmount, annualInterestRate, loanTermMonths, preferLoanYear, annualInsuranceRate, inclInsurance])

    const handleSave = () => {
        HouseConfigService.getInstance().setConfig({
            ...config,
            name: name,
            loanAmount: { ...config.loanAmount, value: loanAmount },
            annualInterestRate: { ...config.annualInterestRate, value: annualInterestRate },
            loanTermMonths: { ...config.loanTermMonths, value: loanTermMonths },
            preferLoanYear: preferLoanYear,
            annualInsuranceRate: { ...config.annualInsuranceRate, value: annualInsuranceRate },
            inclInsurance: inclInsurance,
            updatedAt: new Date(),
        })
        toast.success("Configuration saved")
    }

    return (
        <Card className="h-fit">
            <CardHeader className="relative">
                <CardTitle>
                    <h2><input className="text-center" value={name} onChange={(e) => setName(e.target.value)} /></h2>
                </CardTitle>
                <Button className="absolute right-4 -top-1.5 blue">
                    <Link to="/chooseConfig/house">
                        Change config
                    </Link>
                </Button>
            </CardHeader>
            <CardContent className="flex justify-center">
                <Switch className="mx-4" checked={preferLoanYear} onCheckedChange={setPreferLoanYear} />
                <p>Pref. Years</p>
                <Switch className="mx-4" checked={inclInsurance} onCheckedChange={setInclInsurance} />
                <p>Incl. Insurance</p>
                <Switch className="mx-4" checked={decimal} onCheckedChange={setDecimal} />
                <p>Decimals</p>
            </CardContent>
            <CardContent className="flex flex-col items-center justify-center h-max">
                <div className="flex items-center">
                    <Number
                        title="Loan Amount"
                        subtitle={config.loanAmount.currency}
                        className="w-45 mx-2"
                        value={loanAmount}
                        setValue={setLoanAmount}
                        defaultValue={loanAmount}
                        min={0}
                        max={1000000}
                        step={5000}
                    />
                    <Number
                        title="Loan Term"
                        subtitle={preferLoanYear ? "years" : "months"}
                        className="w-45 mx-2"
                        value={preferLoanYear ? loanTermMonths / 12 : loanTermMonths}
                        setValue={preferLoanYear ? (a) => setLoanTermMonths(a * 12) : setLoanTermMonths}
                        defaultValue={preferLoanYear ? loanTermMonths / 12 : loanTermMonths}
                        min={0}
                        max={preferLoanYear ? 40 : 480}
                        step={1}
                    />
                    <Number
                        title="Annual Interest"
                        subtitle={"%"}
                        className="w-45 mx-2"
                        value={annualInterestRate}
                        setValue={setAnnualInterestRate}
                        defaultValue={annualInterestRate}
                        min={0}
                        max={10}
                        step={0.1}
                    />
                </div>
            </CardContent>
            <CardContent className="grid grid-cols-2 w-fit mx-auto">
                <CardContent>
                    <p>Total Repayment:</p>
                    <NumberFlow value={parseFloat(totalRepayment.toFixed(decimal ? 2 : 0))} className="text-2xl font-bold" />
                </CardContent>
                <CardContent>
                    <p>Monthly Payment:</p>
                    <NumberFlow value={parseFloat(monthlyPayment.toFixed(decimal ? 2 : 0))} className="text-2xl font-bold" />
                </CardContent>
                <CardContent>
                    <p>Total Interest Cost:</p>
                    <NumberFlow value={parseFloat(totalInterestCost.toFixed(decimal ? 2 : 0))} className="text-2xl font-bold" />
                </CardContent>
                <CardContent>
                    <p>Monthly Insurance Payment:</p>
                    <NumberFlow value={parseFloat(monthlyInsurancePayment.toFixed(decimal ? 2 : 0))} className="text-2xl font-bold" />
                </CardContent>
            </CardContent>
            <CardFooter className="flex items-center justify-center">
                <Button
                    className="mt-4"
                    onClick={handleSave}
                >
                    Sauvegarder
                </Button>
            </CardFooter>
        </Card>
    );
}