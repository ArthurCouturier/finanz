import NumberFlow from "@number-flow/react";
import { Slider } from "./ui/slider";
import { Button } from "./ui/button";
import { useEffect, useRef, useState } from "react";

const CURVE_RESOLUTION = 1000;

export default function Number({
  title,
  subtitle,
  value,
  setValue,
  min,
  max,
  maxInput,
  step,
  defaultValue,
  className,
  curve,
}: {
  title?: string;
  subtitle?: string;
  value: number;
  setValue: (value: number) => void;
  min?: number;
  max?: number;
  maxInput?: number;
  step?: number;
  defaultValue?: number;
  className?: string;
  /**
   * Exponent for a non-linear slider scale (value = min + (max-min)·t^curve).
   * Defaults to 1 (linear). Use e.g. 2 to give more travel to lower values.
   */
  curve?: number;
}) {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isCurved = curve !== undefined && curve !== 1;

  // Map an actual value to a slider position in [0, CURVE_RESOLUTION].
  const toPosition = (val: number) => {
    if (!isCurved) return val;
    const span = max! - min!;
    if (span <= 0) return 0;
    const clamped = Math.min(max!, Math.max(min!, val));
    const t = Math.pow((clamped - min!) / span, 1 / curve!);
    return t * CURVE_RESOLUTION;
  };

  // Map a slider position back to an actual value, snapped to `step`.
  const fromPosition = (pos: number) => {
    if (!isCurved) return pos;
    const t = pos / CURVE_RESOLUTION;
    const raw = min! + (max! - min!) * Math.pow(t, curve!);
    const s = step && step > 0 ? step : 1;
    return Math.min(max!, Math.max(min!, Math.round(raw / s) * s));
  };

  const handleChange = (newValue: number[]) => {
    setValue(fromPosition(newValue[0]));
  };

  const handleMinus = () => {
    if (value - step! < min!) {
      setValue(min!);
    } else {
      setValue(value - step!);
    }
  };

  const handlePlus = () => {
    if (value + step! > max!) {
      setValue(max!);
    } else {
      setValue(value + step!);
    }
  };

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  return (
    <div className={`my-2 ${className}`}>
      <div className="flex mx-auto justify-center">
        {title && <h2 className="text-lg font-bold mr-0.5">{title}</h2>}
        {subtitle && (
          <h3 className="flex text-sm mt-1 ml-0.5 opacity-80">{subtitle}</h3>
        )}
      </div>
      <div>
        <Button
          variant={"ghost"}
          size={"sm"}
          className="mx-auto"
          onClick={() => {
            setEditing(true);
            window.addEventListener("keydown", (e) => {
              if (e.key === "Enter") {
                setEditing(false);
                window.removeEventListener("keydown", () => {});
              }
            });
          }}
        >
          {editing ? (
            <input
              ref={inputRef}
              type="number"
              className="w-20 text-center focus:outline-none"
              value={value}
              onChange={(e) => {
                let newValue = parseFloat(e.target.value);
                if (!isNaN(newValue)) {
                  newValue = Math.max(
                    min!,
                    Math.min(maxInput ? maxInput! : max!, newValue)
                  );
                  setValue(newValue);
                }
                if (isNaN(newValue)) {
                  setValue(min!);
                }
              }}
              onBlur={() => setEditing(false)}
              min={min}
              max={maxInput ? maxInput : max}
              step={step}
              placeholder={defaultValue?.toString()}
            />
          ) : (
            <NumberFlow value={value} trend={0} />
          )}
        </Button>
      </div>
      <div className="flex">
        <Button size={"sm"} onClick={handleMinus}>
          -
        </Button>
        <Slider
          className="m-2"
          defaultValue={[toPosition(value)]}
          min={isCurved ? 0 : min}
          max={isCurved ? CURVE_RESOLUTION : max}
          step={isCurved ? 1 : step}
          onValueChange={handleChange}
        />
        <Button size={"sm"} onClick={handlePlus}>
          +
        </Button>
      </div>
    </div>
  );
}

export function NumberRestaurant({
  title,
  value,
  setValue,
  min,
  max,
  maxInput,
  step,
  defaultValue,
  className,
}: {
  title?: string;
  value: number;
  setValue: (value: number) => void;
  min?: number;
  max?: number;
  maxInput?: number;
  step?: number;
  defaultValue?: number;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (newValue: number[]) => {
    setValue(newValue[0]);
  };

  const handleMinus = () => {
    if (value - step! < min!) {
      setValue(min!);
    } else {
      setValue(value - step!);
    }
  };

  const handlePlus = () => {
    if (value + step! > max!) {
      setValue(max!);
    } else {
      setValue(value + step!);
    }
  };

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  return (
    <div className={`my-2 ${className}`}>
      <div className="flex mx-auto justify-center">
        {title && <h2 className=" mr-0.5">{title}</h2>}
      </div>
      <div>
        <Button
          variant={"ghost"}
          size={"sm"}
          className="mx-auto"
          onClick={() => {
            setEditing(true);
            window.addEventListener("keydown", (e) => {
              if (e.key === "Enter") {
                setEditing(false);
                window.removeEventListener("keydown", () => {});
              }
            });
          }}
        >
          {editing ? (
            <input
              ref={inputRef}
              type="number"
              className="w-20 text-center focus:outline-none"
              value={value}
              onChange={(e) => {
                let newValue = parseFloat(e.target.value);
                if (!isNaN(newValue)) {
                  newValue = Math.max(
                    min!,
                    Math.min(maxInput ? maxInput! : max!, newValue)
                  );
                  setValue(newValue);
                }
                if (isNaN(newValue)) {
                  setValue(min!);
                }
              }}
              onBlur={() => setEditing(false)}
              min={min}
              max={maxInput ? maxInput : max}
              step={step}
              placeholder={defaultValue?.toString()}
            />
          ) : (
            <NumberFlow value={value} trend={0} />
          )}
        </Button>
      </div>
      <div className="flex">
        <Button size={"sm"} onClick={handleMinus}>
          -
        </Button>
        <Slider
          className="m-2"
          defaultValue={[value]}
          min={min}
          max={max}
          step={step}
          onValueChange={handleChange}
        />
        <Button size={"sm"} onClick={handlePlus}>
          +
        </Button>
      </div>
    </div>
  );
}
