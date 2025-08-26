import DayInterface from "@/interfaces/DayInterface";
import MealInterface from "@/interfaces/MealInterface";
import { ArrowRightIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardTitle, CardContent, CardFooter } from "./ui/card";
import Meal from "./Meal";
import DayStatistics from "./modules/DayStatistics";

export default function Day({
  day,
  saveConfig,
}: {
  day: DayInterface;
  saveConfig: (day: DayInterface) => void;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const [editMode, setEditMode] = useState(false);

  return showDetails ? (
    <Card
      className="mx-4 mt-2 pt-2 w-full h-full flex flex-col items-center"
      onClick={() => setShowDetails(false)}
    >
      <CardTitle className="justify-center flex items-center gap-2">
        <h2 className="flex gap-2 font-normal">{day.name}</h2>
        <ArrowRightIcon className="w-6 h-6 text-text-primary rotate-90" />
      </CardTitle>
      <CardContent
        className="w-full gap-6 flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex w-full gap-4 flex-col items-center">
          <Meal
            editMode={editMode}
            name={"Lunch Service ☀️"}
            meal={day.meals[0]}
            saveMeal={(meal: MealInterface) => {
              day.meals[0] = meal;
              saveConfig(day);
            }}
          />
          <Meal
            editMode={editMode}
            name={"Evening Service 🌙"}
            meal={day.meals[1]}
            saveMeal={(meal: MealInterface) => {
              day.meals[1] = meal;
              saveConfig(day);
            }}
          />
        </div>
        <DayStatistics day={day} />
      </CardContent>
      <CardFooter>
        {editMode ? (
          <Button
            className="mt-4 w-max"
            onClick={(e) => {
              e.stopPropagation();
              setEditMode(false);
            }}
          >
            Leave edit mode
          </Button>
        ) : (
          <Button
            className="mt-4 w-max"
            onClick={(e) => {
              e.stopPropagation();
              setEditMode(true);
            }}
          >
            Edit
          </Button>
        )}
      </CardFooter>
    </Card>
  ) : (
    <Button
      className="h-full flex flex-col items-center w-32"
      onClick={() => setShowDetails(true)}
    >
      <h2 className="flex gap-2">
        {day.name}
        <ArrowRightIcon className="mt-0.5 text-text-primary" />
      </h2>
    </Button>
  );
}
