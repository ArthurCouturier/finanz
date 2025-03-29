import NumberFlow from "@number-flow/react";
import { Slider } from "./ui/slider";
import { Button } from "./ui/button";

export default function Number({
    title,
    subtitle,
    value,
    setValue,
    min,
    max,
    step,
    defaultValue,
    clasName,
}: {
    title?: string;
    subtitle?: string;
    value: number;
    setValue: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    defaultValue?: number;
    clasName?: string;
}) {

    const handleChange = (newValue: number[]) => {
        setValue(newValue[0])
    }

    const handleMinus = () => {
        if (value - step! < min!) {
            setValue(min!)
        } else {
            setValue(value - step!)
        }
    }

    const handlePlus = () => {
        if (value + step! > max!) {
            setValue(max!)
        } else {
            setValue(value + step!)
        }
    }

    return (
        <div className={clasName}>
            <div className="flex mx-auto justify-center">
                {title && <h2 className="text-lg font-bold mr-0.5">{title}</h2>}
                {subtitle && <h3 className="flex text-sm mt-1 ml-0.5 opacity-80">{subtitle}</h3>}
            </div>
            <NumberFlow value={value} trend={0} />
            <div className="flex">
                <Button
                    size={"sm"}
                    onClick={handleMinus}
                >-</Button>
                <Slider
                    className="m-2"
                    defaultValue={[defaultValue || 0]}
                    min={min}
                    max={max}
                    step={step}
                    onValueChange={handleChange}
                />
                <Button
                    size={"sm"}
                    onClick={handlePlus}
                >+</Button>
            </div>
        </div>
    )
}