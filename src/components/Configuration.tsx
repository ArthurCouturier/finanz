import NumberFlow from "@number-flow/react";
import Number from "./Number";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import ConfigInterface from "@/interfaces/ConfigInterface";
import ConfigService from "@/services/ConfigService";
import { Button } from "./ui/button";
import { toast } from "sonner";
import CircleDiagram from "./CircleDiagram";

export default function Configuration({
    config
}: {
    config: ConfigInterface
}) {
    const [tjm, setTjm] = useState(config.tjm.value)
    const [tax, setTax] = useState(config.tax[0].value)
    const [workedDays, setWorkedDays] = useState(config.workedDays[0].value)

    const computeTotal = () => {
        const tjmWithTax = tjm * (1 - tax / 100)
        const total = tjmWithTax * workedDays
        return total
    }

    const [total, setTotal] = useState(computeTotal())

    useEffect(() => {
        setTotal(computeTotal())
    }, [tjm, tax, workedDays])

    const handleSave = () => {
        ConfigService.setConfig({
            ...config,
            tjm: { ...config.tjm, value: tjm },
            tax: [{ ...config.tax[0], value: tax }],
            workedDays: [{ ...config.workedDays[0], value: workedDays }],
            total: { ...config.total, value: computeTotal() },
            updatedAt: new Date(),
        })
        toast.success("Configuration saved")
    }

    return (
        <Card className="max-w-fit aspect-square">
            <CardHeader>
                <CardTitle>
                    <h2>{config.name}</h2>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center h-max">
                <Number
                    title="TJM"
                    subtitle="(H.T.)"
                    className="w-45"
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
                    className="w-45"
                    value={tax}
                    setValue={setTax}
                    defaultValue={tax}
                    min={0}
                    max={100}
                    step={0.5}
                />
                <Number
                    title="Worked days"
                    className="w-45"
                    value={workedDays}
                    setValue={setWorkedDays}
                    defaultValue={workedDays}
                    min={0}
                    max={365}
                    step={1}
                />
                <NumberFlow value={total} className="text-2xl font-bold" />
                <CircleDiagram taxs={[tax]} />
                <Button
                    className="mt-4"
                    onClick={handleSave}
                >
                    Save
                </Button>
            </CardContent>
        </Card>
    );
}