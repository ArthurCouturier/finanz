import MealInterface from "@/interfaces/MealInterface";
import { getTotalAverage } from "@/modules/StatisticsPerMeal";
import NumberFlow from "@number-flow/react";
import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { NumberRestaurant } from "../Number";

export default function MealMobile({
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
        <div className=" items-center justify-center gap-2 font-bold flex">
          {name}
        </div>
        {editMode ? (
          <div className="flex flex-col w-full items-center gap-2">
            <div className="w-full flex justify-center gap-2">
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
            </div>
            <div className="w-full flex justify-center gap-2">
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
              <NumberRestaurant
                className="w-full"
                title={"Desserts"}
                max={100}
                maxInput={1000}
                min={0}
                step={1}
                value={dessertPrice}
                setValue={setDessertPrice}
              />
            </div>
            <NumberRestaurant
              className="w-1/2"
              title={"Drinks"}
              max={100}
              maxInput={1000}
              min={0}
              step={1}
              value={drinkPrice}
              setValue={setDrinkPrice}
            />
          </div>
        ) : (
          <div className="flex md:flex-row flex-col justify-between gap-2">
            <div className="grid grid-cols-3 gap-4 text-center mt-4">
              <div className="flex flex-col">
                <p className=""> Covers </p>
                <NumberFlow value={covers} className=" font-bold" />
              </div>
              <div className="flex flex-col">
                <p className=""> Starters </p>
                <NumberFlow value={starterPrice} className=" font-bold" />
              </div>
              <div className="flex flex-col">
                <p className=""> Mains </p>
                <NumberFlow value={mainCoursePrice} className=" font-bold" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="flex flex-col">
                <p className=""> Desserts </p>
                <NumberFlow value={dessertPrice} className=" font-bold" />
              </div>
              <div className="flex flex-col">
                <p className=""> Drinks </p>
                <NumberFlow value={drinkPrice} className=" font-bold" />
              </div>
            </div>
          </div>
        )}
        <div className="flex flex-col justify-center">
          <p className=" mt-4"> Avg./pers : </p>
          <NumberFlow value={average} className=" font-bold" />
        </div>
      </div>
    </Card>
  );
}
