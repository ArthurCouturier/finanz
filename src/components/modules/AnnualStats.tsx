import RestaurantConfigInterface from "@/interfaces/configurations/RestaurantConfigInterface";
import {
  workedDaysPerWeek,
  workedMealsPerWeek,
  getCoversPerWeek,
} from "@/modules/StatisticsPerWeek";
import NumberFlow from "@number-flow/react";
import { ArrowRightIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Card, CardTitle } from "../ui/card";
import { NumberRestaurant } from "../Number";

export default function AnnualStats({
  isMobile,
  config,
  saveConfig,
  workedWeeks,
  setWorkedWeeks,
}: {
  isMobile: boolean;
  config: RestaurantConfigInterface;
  saveConfig: () => void;
  workedWeeks: number;
  setWorkedWeeks: (workedWeeks: number) => void;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const [editMode, setEditMode] = useState(false);

  return (
    <div className="flex justify-center w-[90%]">
      {showDetails ? (
        <Card
          className="mx-4 mt-2 pt-2 w-full h-full p-4"
          onClick={() => setShowDetails(false)}
        >
          <CardTitle className="justify-center flex items-center gap-2">
            <h2 className="flex gap-2">Annual Statistics</h2>
            <ArrowRightIcon className="w-6 h-6 text-text-primary rotate-90" />
          </CardTitle>
          <div className="m-6" onClick={(e) => e.stopPropagation()}>
            {isMobile ? (
              <div className="gap-2 flex flex-col">
                <div className="flex px-4 items-baseline justify-center gap-6">
                  {editMode ? (
                    <NumberRestaurant
                      title="Worked weeks"
                      value={workedWeeks}
                      setValue={setWorkedWeeks}
                      min={0}
                      max={52}
                      step={1}
                    />
                  ) : (
                    <div className="flex flex-col">
                      <p> Worked </p>
                      <p>weeks : </p>
                      <NumberFlow value={workedWeeks} className=" font-bold" />
                    </div>
                  )}
                  <div className="flex flex-col">
                    <p> Worked days : </p>
                    <div className="flex items-center justify-center">
                      <NumberFlow
                        value={workedWeeks * workedDaysPerWeek(config.week)}
                        className=" font-bold"
                      />
                      <p className="font-bold ">/365</p>
                    </div>
                  </div>
                </div>
                <div className="flex px-4 items-baseline justify-center gap-6">
                  <div className="mt-2 flex flex-col">
                    <p> Completed</p>
                    <p> services : </p>
                    <NumberFlow
                      value={workedWeeks * workedMealsPerWeek(config.week)}
                      className=" font-bold"
                    />
                  </div>
                  <div className="mt-2 flex flex-col">
                    <p className=""> Covers served : </p>
                    <NumberFlow
                      value={workedWeeks * getCoversPerWeek(config.week)}
                      className=" font-bold"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-baseline justify-between">
                {editMode ? (
                  <NumberRestaurant
                    title="Worked weeks"
                    value={workedWeeks}
                    setValue={setWorkedWeeks}
                    min={0}
                    max={52}
                    step={1}
                  />
                ) : (
                  <div className="flex flex-col">
                    <p className=""> Worked weeks : </p>
                    <NumberFlow value={workedWeeks} className=" font-bold" />
                  </div>
                )}
                <div className="mt-2 flex flex-col">
                  <p className=""> Worked days: </p>
                  <div className="flex items-center justify-center">
                    <NumberFlow
                      value={workedWeeks * workedDaysPerWeek(config.week)}
                      className=" font-bold"
                    />
                    <p className="font-bold ">/365</p>
                  </div>
                </div>
                <div className="mt-2 flex flex-col">
                  <div className="flex flex-col">
                    <p> Completed services :</p>
                  </div>
                  <NumberFlow
                    value={workedWeeks * workedMealsPerWeek(config.week)}
                    className=" font-bold"
                  />
                </div>
                <div className="mt-2 flex flex-col">
                  <p className=""> Covers served : </p>
                  <NumberFlow
                    value={workedWeeks * getCoversPerWeek(config.week)}
                    className=" font-bold"
                  />
                </div>
              </div>
            )}
          </div>
          {editMode ? (
            <div className="flex w-full justify-center">
              <Button
                className="w-min"
                onClick={(e) => {
                  e.stopPropagation();
                  setWorkedWeeks(workedWeeks);
                  saveConfig();
                  toast.success("Configuration saved");
                  setEditMode(false);
                }}
              >
                Save
              </Button>
            </div>
          ) : (
            <div className="flex w-full justify-center">
              <Button
                className="w-min"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditMode(true);
                }}
              >
                Edit
              </Button>
            </div>
          )}
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
