import MealInterface from "@/interfaces/MealInterface";
import { getTotalAverage } from "@/modules/StatisticsPerMeal";
import NumberFlow from "@number-flow/react";
import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { NumberRestaurant } from "../Number";

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
    <Card className="w-full px-4 h-1/2">
      <div className="h-full w-full" onClick={(e) => e.stopPropagation()}>
        <div className="items-center justify-center font-bold flex">{name}</div>
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
          <div className="flex h-[60%] items-center justify-between gap-2">
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
