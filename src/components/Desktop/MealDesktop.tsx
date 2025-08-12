import MealInterface from "@/interfaces/MealInterface";
import { getTotalAverage } from "@/modules/StatisticsPerMeal";
import NumberFlow from "@number-flow/react";
import { useState, useEffect, useRef } from "react";
import { Card } from "../ui/card";
import { Slider } from "../ui/slider";
import { Button } from "../ui/button";

export default function MealDesktop({
  name,
  editMode,
  meal,
  saveMeal,
}: {
  name: string;
  editMode: boolean;
  meal: MealInterface;
  saveMeal: (meal: MealInterface) => void;
}) {
  const [covers, setCovers] = useState(meal.covers);
  const [starterPrice, setStarterPrice] = useState(meal.starterPrice);
  const [mainCoursePrice, setMainCoursePrice] = useState(meal.mainCoursePrice);
  const [dessertPrice, setDessertPrice] = useState(meal.dessertPrice);
  const [drinkPrice, setDrinkPrice] = useState(meal.drinkPrice);

  const [average, setAverage] = useState<number>(
    getTotalAverage({
      covers,
      starterPrice,
      mainCoursePrice,
      dessertPrice,
      drinkPrice,
    })
  );

  useEffect(() => {
    setAverage(
      getTotalAverage({
        covers,
        starterPrice,
        mainCoursePrice,
        dessertPrice,
        drinkPrice,
      })
    );
  }, [covers, mainCoursePrice, drinkPrice]);

  useEffect(() => {
    const newMeal = {
      covers: covers,
      starterPrice: starterPrice,
      mainCoursePrice: mainCoursePrice,
      dessertPrice: dessertPrice,
      drinkPrice: drinkPrice,
    };
    saveMeal(newMeal);
    return () => {};
  }, [covers, starterPrice, mainCoursePrice, dessertPrice, drinkPrice]);

  return (
    <Card className="w-full px-4">
      <div className="w-full" onClick={(e) => e.stopPropagation()}>
        <div className="items-center justify-center mb-4 font-bold flex">
          {name}
        </div>
        {editMode ? (
          <div className="flex flex-col w-full items-center gap-2">
            <div className="flex w-full gap-2 ">
              <NumberRestaurant
                className="w-full"
                title={"Covers"}
                max={100}
                maxInput={1000}
                min={0}
                step={1}
                value={covers}
                setValue={setCovers}
              />
              <NumberRestaurant
                className="w-full"
                title={"Starters"}
                max={100}
                maxInput={1000}
                min={0}
                step={1}
                value={starterPrice}
                setValue={setStarterPrice}
              />
              <NumberRestaurant
                className="w-full"
                title={"Mains"}
                max={100}
                maxInput={1000}
                min={0}
                step={1}
                value={mainCoursePrice}
                setValue={setMainCoursePrice}
              />
            </div>
            <div className="flex justify-center items-center w-full gap-2">
              <NumberRestaurant
                className="w-1/3"
                title={"Desserts"}
                max={100}
                maxInput={1000}
                min={0}
                step={1}
                value={dessertPrice}
                setValue={setDessertPrice}
              />
              <NumberRestaurant
                className="w-1/3"
                title={"Drinks"}
                max={100}
                maxInput={1000}
                min={0}
                step={1}
                value={drinkPrice}
                setValue={setDrinkPrice}
              />
            </div>
          </div>
        ) : (
          <div className="flex justify-between gap-2">
            <div className="flex flex-col">
              <p> Covers </p>
              <NumberFlow value={covers} className="text-xl font-bold" />
            </div>
            <div className="flex flex-col">
              <p> Starters </p>
              <NumberFlow value={starterPrice} className="text-xl font-bold" />
            </div>
            <div className="flex flex-col">
              <p> Mains </p>
              <NumberFlow
                value={mainCoursePrice}
                className="text-xl font-bold"
              />
            </div>
            <div className="flex flex-col">
              <p> Desserts </p>
              <NumberFlow value={dessertPrice} className="text-xl font-bold" />
            </div>
            <div className="flex flex-col">
              <p> Drinks </p>
              <NumberFlow value={drinkPrice} className="text-xl font-bold" />
            </div>
          </div>
        )}
        <div className="flex flex-col justify-center">
          <p className="text-sm mt-4"> Avg./pers : </p>
          <NumberFlow value={average} className="text-xl font-bold" />
        </div>
      </div>
    </Card>
  );
}

function NumberRestaurant({
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
        <Button className="h-6 w-6" onClick={handleMinus}>
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
        <Button className="h-6 w-6" onClick={handlePlus}>
          +
        </Button>
      </div>
    </div>
  );
}
