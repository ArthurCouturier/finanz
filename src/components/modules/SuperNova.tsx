import RestaurantConfigInterface from "@/interfaces/configurations/RestaurantConfigInterface";
import {
  totalWeeklySales,
  mealsCookedPerWeek,
  workedDaysPerWeek,
  workedMealsPerWeek,
  getAverageBasketPerWeek,
} from "@/modules/StatisticsPerWeek";
import NumberFlow from "@number-flow/react";
import { ArrowRightIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardTitle } from "../ui/card";

export default function SuperNova({
  config,
}: {
  config: RestaurantConfigInterface;
}) {
  const [showDetails, setShowDetails] = useState(false);

  const annualSales = totalWeeklySales(config.week) * config.stats.workedWeeks;
  const averageMealsPerDay = (
    mealsCookedPerWeek(config.week) / workedDaysPerWeek(config.week)
  ).toFixed(0);
  const averageMealsPerMeal = (
    mealsCookedPerWeek(config.week) / workedMealsPerWeek(config.week)
  ).toFixed(0);
  const workedDays = workedDaysPerWeek(config.week) * config.stats.workedWeeks;
  const mealsCooked =
    mealsCookedPerWeek(config.week) * config.stats.workedWeeks;
  const averageBasket = getAverageBasketPerWeek(config.week);

  return (
    <div className="flex justify-center">
      {showDetails ? (
        <Card
          className="mx-4 mt-2 pt-2 w-full h-full p-4"
          onClick={() => setShowDetails(false)}
        >
          <CardTitle className="justify-center flex items-center gap-2">
            <h2 className="flex gap-2">SuperNova</h2>
            <ArrowRightIcon className="w-6 h-6 text-text-primary rotate-90" />
          </CardTitle>
          <div
            className="grid grid-cols-3 gap-y-6 gap-x-12 items-center mt-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center">
              <p className="">Annual revenue :</p>
              <div className="w-full flex justify-center items-center">
                <NumberFlow value={annualSales} className=" font-bold mx-1" />
                <p className="font-bold ">€</p>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <p className=" max-w-64">Avg. table settings per working day :</p>
              <NumberFlow
                value={parseFloat(averageMealsPerDay)}
                className=" font-bold"
              />
            </div>
            <div className="flex flex-col items-center max-w-64">
              <p className="">Avg. table settings per meal worked :</p>
              <NumberFlow
                value={parseFloat(averageMealsPerMeal)}
                className=" font-bold"
              />
            </div>
            <div className="flex flex-col items-center">
              <p className="">Number of days per year :</p>
              <NumberFlow value={workedDays} className=" font-bold" />
            </div>
            <div className="flex flex-col items-center">
              <p className="">Table settings per year :</p>
              <NumberFlow value={mealsCooked} className=" font-bold" />
            </div>
            <div className="flex flex-col items-center">
              <p className="">Unit sale price (excl. tax) :</p>
              <div className="flex items-center">
                <NumberFlow
                  value={parseFloat(averageBasket)}
                  className=" font-bold"
                />
                <p className="font-bold ">€</p>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <Button
          className={`h-full flex items-baseline ${showDetails && "w-5/6"}`}
          onClick={() => setShowDetails(true)}
        >
          <div className="flex flex-col w-full items-center">
            <h2 className="flex gap-2">
              Annual statistics
              <ArrowRightIcon className="mt-0.5 w-6 h-6 text-text-primary" />
            </h2>
          </div>
        </Button>
      )}
    </div>
  );
}
