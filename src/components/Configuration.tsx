import NumberFlow from "@number-flow/react";
import Number from "./Number";
import { useEffect, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import ConfigInterface from "@/interfaces/ConfigInterface";
import ConfigService from "@/services/ConfigService";
import { Button } from "./ui/button";
import { toast } from "sonner";
import CircleDiagram from "./CircleDiagram";
import { Switch } from "./ui/switch";

export default function Configuration({
    config
}: {
    config: ConfigInterface
}) {
    const [tjm, setTjm] = useState(config.tjm.value)
    const [tax, setTax] = useState(config.tax)
    const [workedDays, setWorkedDays] = useState(config.workedDays[0].value)
    const [inclTjmTVA, setInclTjmTVA] = useState(config.inclTjmTVA)
    const [inclTotalTVA, setInclTotalTVA] = useState(config.inclTotalTVA)

    const computeNetTotal = () => {
        let tjmWithoutTax: number = inclTjmTVA ? tjm / 1.2 : tjm
        for (const t of tax) {
            tjmWithoutTax -= (t.value / 100) * tjm
        }
        const total = tjmWithoutTax * workedDays
        return total
    }

    const [netTotal, setNetTotal] = useState(computeNetTotal())

    const computeGrossTotal = () => {
        const total = tjm * workedDays
        if (!inclTjmTVA && inclTotalTVA) {
            return total * 1.2
        }
        return total
    }

    const [grossTotal, setGrossTotal] = useState(computeGrossTotal())

    useEffect(() => {
        setNetTotal(computeNetTotal())
        setGrossTotal(computeGrossTotal())
    }, [tjm, inclTjmTVA, tax, inclTotalTVA, workedDays])

    const handleSave = () => {
        ConfigService.setConfig({
            ...config,
            tjm: { ...config.tjm, value: tjm },
            tax: tax,
            inclTjmTVA: inclTjmTVA,
            workedDays: [{ ...config.workedDays[0], value: workedDays }],
            total: { ...config.total, value: computeNetTotal() },
            inclTotalTVA: inclTotalTVA,
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
                <div className="flex items-center">
                    <Number
                        title="TJM"
                        subtitle={inclTjmTVA ? "(TTC)" : "(H.T.)"}
                        className="w-45"
                        value={tjm}
                        setValue={setTjm}
                        defaultValue={tjm}
                        min={0}
                        max={1000}
                        step={5}
                    />
                    <Switch className="mx-4" checked={inclTjmTVA} onCheckedChange={setInclTjmTVA} />
                    <p>Incl. TVA</p>
                </div>
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
                <p>Total net:</p>
                <NumberFlow value={netTotal} className="text-2xl font-bold" />
                {!inclTjmTVA && (
                    <div className="flex">
                        <Switch className="mx-4" checked={inclTotalTVA} onCheckedChange={setInclTotalTVA} />
                        <p>Incl. TVA</p>
                    </div>
                )}
                <p>Total brut:</p>
                <NumberFlow value={grossTotal} className="text-2xl font-bold" />
                <CircleDiagram taxs={tax.map((t) => t.value)} />
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