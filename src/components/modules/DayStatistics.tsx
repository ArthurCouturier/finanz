import DayInterface from "@/interfaces/DayInterface";
import { Card, CardTitle } from "../ui/card";
import NumberFlow from "@number-flow/react";
import {
  getTotalLunchOfTheDay,
  getTotalDrinkOfTheDay,
  getTotalOfTheDay,
  getAverageLunchBasketPerDay,
  getAverageDrinkBasketPerDay,
  getAverageBasketPerDay,
} from "@/modules/StatisticsPerDay";
import { getTotalOfTheMeal } from "@/modules/StatisticsPerMeal";

export default function DayStatistics({
  day,
  editMode,
}: {
  day: DayInterface;
  editMode: boolean;
}) {
  const totalLunchOfTheDay = getTotalLunchOfTheDay(day);
  const totalDrinkOfTheDay = getTotalDrinkOfTheDay(day);
  const totalOfTheDay = getTotalOfTheDay(day);

  const averageLunchBasketPerWeek = getAverageLunchBasketPerDay(day);
  const averageDrinkBasketPerWeek = getAverageDrinkBasketPerDay(day);
  const averageBasketPerWeek = getAverageBasketPerDay(day);

  const totalOfMidday = getTotalOfTheMeal(day.meals[0]);
  const totalOfEvening = getTotalOfTheMeal(day.meals[1]);

  return (
    <div className="flex flex-col gap-4 w-full items-center">
      <Card className="h-full w-full p-4">
        <CardTitle className=" font-bold ">Daily revenue 💰</CardTitle>
        <div
          className={`flex flex-col justify-center gap-4 ${
            editMode ? "flex-row" : "flex-row"
          }`}
        >
          <div className="flex flex-col">
            <p className=" mt-4"> Daily food : </p>
            <div className="flex items-center justify-center gap-2">
              <NumberFlow value={totalLunchOfTheDay} className="font-bold" />
              <p className=" font-bold">€</p>
            </div>
          </div>
          <div className="flex flex-col">
            <p className=" mt-4"> Daily drinks : </p>
            <div className="flex items-center justify-center gap-2">
              <NumberFlow value={totalDrinkOfTheDay} className=" font-bold" />
              <p className=" font-bold">€</p>
            </div>
          </div>
          <div className="flex flex-col">
            <p className=" mt-4"> Daily total : </p>
            <div className="flex items-center justify-center gap-2">
              <NumberFlow value={totalOfTheDay} className=" font-bold" />
              <p className=" font-bold">€</p>
            </div>
            <div className="flex items-center justify-center gap-2">
              <p>(</p>
              <NumberFlow value={totalOfMidday} />
              <p>€ lunch, </p>
            </div>
            <div className="flex items-center justify-center gap-2">
              <NumberFlow value={totalOfEvening} />
              <p>€ evening ) </p>
            </div>
          </div>
        </div>
      </Card>
      <Card className="w-full h-full">
        <CardTitle className=" font-bold ">
          Average baskets for the day 🧺
        </CardTitle>
        <div className="flex flex-col justify-center gap-4">
          <div className="flex flex-col">
            <p className=" mt-4"> Average daily food per person : </p>
            <div className="flex items-center justify-center gap-2">
              <NumberFlow
                value={parseFloat(
                  averageLunchBasketPerWeek != "NaN"
                    ? averageLunchBasketPerWeek
                    : (0).toFixed(2)
                )}
                className=" font-bold"
              />
              <p className=" font-bold">€/pers.</p>
            </div>
          </div>
          <div className="flex flex-col">
            <p className=" mt-4"> Average daily drinks per person : </p>
            <div className="flex items-center justify-center gap-2">
              <NumberFlow
                value={parseFloat(
                  averageDrinkBasketPerWeek != "NaN"
                    ? averageDrinkBasketPerWeek
                    : (0).toFixed(2)
                )}
                className=" font-bold"
              />
              <p className=" font-bold">€/pers.</p>
            </div>
          </div>
          <div className="flex flex-col">
            <p className=" mt-4"> Average daily total per person : </p>
            <div className="flex items-center justify-center gap-2">
              <NumberFlow
                value={parseFloat(
                  averageBasketPerWeek != "NaN"
                    ? averageBasketPerWeek
                    : (0).toFixed(2)
                )}
                className=" font-bold"
              />
              <p className=" font-bold">€/pers.</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
