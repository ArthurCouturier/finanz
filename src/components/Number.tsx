import NumberFlow from "@number-flow/react";
import { Slider } from "./ui/slider";
import { Button } from "./ui/button";
import { useEffect, useRef, useState } from "react";

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
