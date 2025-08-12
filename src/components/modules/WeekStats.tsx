import RestaurantConfigInterface from "@/interfaces/configurations/RestaurantConfigInterface";
import {
  getAverageBasketPerWeek,
  getAverageDrinkBasketPerWeek,
  getAverageLunchBasketPerWeek,
  getCoversPerWeek,
} from "@/modules/StatisticsPerWeek";
import NumberFlow from "@number-flow/react";
import { ArrowRightIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardTitle } from "../ui/card";

export default function WeekStats({
  config,
}: {
  config: RestaurantConfigInterface;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const averageBasketPerWeek = getAverageBasketPerWeek(config.week);
  const averageDrinkBasketPerWeek = getAverageDrinkBasketPerWeek(config.week);
  const averageLunchBasketPerWeek = getAverageLunchBasketPerWeek(config.week);
  const nbCovers = getCoversPerWeek(config.week);

  return (
    <div className="flex justify-center">
      {showDetails ? (
        <Card
          className="mx-4 mt-2 pt-2 w-full h-full p-4"
          onClick={() => setShowDetails(false)}
        >
          <CardTitle className="justify-center flex items-center gap-2">
            <h2 className="flex gap-2">Week Statistics</h2>
            <ArrowRightIcon className="w-6 h-6 text-text-primary rotate-90" />
          </CardTitle>
          <div
            className="gap-12 flex items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h2 className="font-bold">Average baskets over the week 🧺</h2>
              <div className="flex gap-6 mt-2">
                <div className="flex flex-col">
                  <p> Daily total : </p>
                  <div className="flex items-center justify-center">
                    <NumberFlow
                      value={parseFloat(averageBasketPerWeek)}
                      className=" font-bold mx-1"
                    />
                    <p className=" font-bold"> € /pers.</p>
                  </div>
                </div>
                <div className="flex flex-col">
                  <p> Daily drinks : </p>
                  <div className="items-center justify-center flex">
                    <NumberFlow
                      value={parseFloat(averageDrinkBasketPerWeek)}
                      className=" font-bold mx-1"
                    />
                    <p className=" font-bold"> € /pers.</p>
                  </div>
                </div>
                <div className="flex flex-col">
                  <p> Daily food : </p>
                  <div className="flex justify-center items-center">
                    <NumberFlow
                      value={parseFloat(averageLunchBasketPerWeek)}
                      className=" font-bold mx-1"
                    />
                    <p className=" font-bold"> € /pers.</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h2 className="font-bold">Table settings</h2>
              <div className="flex gap-6 mt-2">
                <div className="max-w-36 flex flex-col">
                  <p> Number of table settings this week : </p>
                  <NumberFlow value={nbCovers} className=" font-bold" />
                </div>
                <div className="max-w-36 flex flex-col">
                  <p> Average table settings per day : </p>
                  <NumberFlow
                    value={parseFloat(
                      (nbCovers / config.week.length).toFixed(2)
                    )}
                    className=" font-bold"
                  />
                </div>
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
              Week statistics
              <ArrowRightIcon className="mt-0.5 w-6 h-6 text-text-primary" />
            </h2>
          </div>
        </Button>
      )}
    </div>
  );
}
