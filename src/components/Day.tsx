import DayInterface from "@/interfaces/DayInterface";
import MealInterface from "@/interfaces/MealInterface";
import { ArrowRightIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Card, CardTitle, CardContent, CardFooter } from "./ui/card";
import Meal from "./Meal";

export default function Day({
    day,
    saveConfig
}: {
    day: DayInterface
    saveConfig: ((day: DayInterface) => void)
}) {

    const [showDetails, setShowDetails] = useState(false);

    return (
        showDetails ?
        <Card 
        className="mx-4 mt-2 pt-2 w-full h-full flex flex-col items-center" 
        onClick={() => setShowDetails(false)}> 
            <CardTitle className="justify-center flex items-center gap-2">
                <h2 className="flex gap-2">
                    {day.name}
                </h2>
                <ArrowRightIcon className="w-6 h-6 text-text-primary rotate-90"/>
            </CardTitle>
            <CardContent 
            className="w-full gap-6 flex flex-col items-center " 
            onClick={(e) => e.stopPropagation()}>
                <Meal 
                    name={"Lunch Service"} 
                    meal={day.meals[0]} 
                    saveMeal={(meal: MealInterface) => 
                        day.meals[0] = meal}
                />
                <Meal 
                    name={"Evening Service"} 
                    meal={day.meals[1]}
                    saveMeal={(meal: MealInterface) => 
                        day.meals[1] = meal}
                />
            </CardContent>
            <CardFooter className="flex items-center justify-center">
                <Button
                    className="mt-4"
                    onClick={(e) => {
                        e.stopPropagation(); 
                        saveConfig(day);
                        toast.success("Configuration of " + day.name + " Saved")}}
                >
                    Save
                </Button>
            </CardFooter>
        </Card>
        : <Button
        className="h-full flex flex-col items-center w-32"
        onClick={() => setShowDetails(true)}>
            <h2 className="flex gap-2"> 
                {day.name}
                <ArrowRightIcon className="mt-0.5 w-6 h-6 text-text-primary"/>
            </h2>
        </Button>
    )
}