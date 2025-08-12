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
import Number from "../Number";

export default function AnnualStats({
  config,
  saveConfig,
  workedWeeks,
  setWorkedWeeks,
}: {
  config: RestaurantConfigInterface;
  saveConfig: () => void;
  workedWeeks: number;
  setWorkedWeeks: (workedWeeks: number) => void;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const [editMode, setEditMode] = useState(false);

  return (
    <div>
      {showDetails ? (
        <Card
          className="mx-4 mt-2 pt-2 w-full h-full p-4 flex justify-center items-center"
          onClick={() => setShowDetails(false)}
        >
          <CardTitle className="justify-center flex items-center gap-2">
            <h2 className="flex gap-2">Annual Statistics</h2>
            <ArrowRightIcon className="w-6 h-6 text-text-primary rotate-90" />
          </CardTitle>
          <div
            className="gap-12 flex mt-6"
            onClick={(e) => e.stopPropagation()}
          >
            {editMode ? (
              <Number
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
              <p className=""> Worked Days : </p>
              <div className="flex items-center justify-center">
                <NumberFlow
                  value={workedWeeks * workedDaysPerWeek(config.week)}
                  className=" font-bold"
                />
                <p className="font-bold ">/365</p>
              </div>
            </div>
            <div className="mt-2 flex flex-col">
              <p className=""> Completed services : </p>
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
          {editMode ? (
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
          ) : (
            <Button
              className="w-min"
              onClick={(e) => {
                e.stopPropagation();
                setEditMode(true);
              }}
            >
              Edit
            </Button>
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
