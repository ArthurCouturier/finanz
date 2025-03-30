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
    const [tax, setTax] = useState(config.tax)
    const [workedDays, setWorkedDays] = useState(config.workedDays[0].value)

    const computeTotal = () => {
        let tjmWithTax: number = tjm
        for (const t of tax) {
            tjmWithTax -= (t.value / 100) * tjm
        }
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
            tax: tax,
            workedDays: [{ ...config.workedDays[0], value: workedDays }],
            total: { ...config.total, value: computeTotal() },
            updatedAt: new Date(),
        })
        toast.success("Configuration saved")
    }

    return (
        <Card className="h-fit">
            <CardHeader>
                <CardTitle>
                    <h2>{config.name}</h2>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center h-max">
                <Number
                    title="TJM"
                    subtitle="(T.T.C.)"
                    className="w-45"
                    value={tjm}
                    setValue={setTjm}
                    defaultValue={tjm}
                    min={0}
                    max={1000}
                    step={5}
                />
                <div className="flex max-w-full overflow-x-auto whitespace-nowrap">
                    {tax.map((t, index) => (
                        <Number
                            title="Taxes"
                            subtitle="%"
                            className="min-w-45 w-45 mx-10"
                            value={t.value}
                            setValue={(newValue) => {
                                tax[index].value = newValue
                                setTax([...tax])
                            }}
                            defaultValue={t.value}
                            min={0}
                            max={100}
                            step={0.5}
                        />
                    ))}
                </div>
                <Button
                    onClick={() => {
                        setTax([...tax, { ...tax[0], value: 0 }])
                    }}
                >
                    Ajouter une taxe
                </Button>
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
                <CircleDiagram taxs={tax.map((t) => t.value)} />
                <Button
                    className="mt-4"
                    onClick={handleSave}
                >
                    Sauvegarder
                </Button>
            </CardContent>
        </Card>
    );
}