import { Button } from "../components/ui/button";
import { useEffect, useState } from "react";
import Number from "@/components/Number";
import NumberFlow from "@number-flow/react";

export default function Home() {
    const [tjm, setTjm] = useState(350)
    const [tax, setTax] = useState(12.5)
    const [workedDays, setWorkedDays] = useState(10)

    const computeTotal = () => {
        const tjmWithTax = tjm * (1 - tax / 100)
        const total = tjmWithTax * workedDays
        return total
    }

    const [total, setTotal] = useState(computeTotal())

    useEffect(() => {
        setTotal(computeTotal())
    }, [tjm, tax, workedDays])

    return (
        <div>
            <h1>Home</h1>
            <p>This is the home page</p>
            <Button>Test</Button>
            <Number
                title="TJM"
                subtitle="(H.T.)"
                clasName="w-45"
                value={tjm}
                setValue={setTjm}
                defaultValue={tjm}
                min={0}
                max={1000}
                step={5}
            />
            <Number
                title="Taxes"
                subtitle="%"
                clasName="w-45"
                value={tax}
                setValue={setTax}
                defaultValue={tax}
                min={0}
                max={100}
                step={0.5}
            />
            <Number
                title="Worked days"
                clasName="w-45"
                value={workedDays}
                setValue={setWorkedDays}
                defaultValue={workedDays}
                min={0}
                max={365}
                step={1}
            />
            <NumberFlow value={total} className="text-2xl font-bold" />
        </div>
    )
}
