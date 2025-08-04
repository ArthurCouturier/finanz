import MealInterface from "@/interfaces/MealInterface";
import { useState, useEffect } from "react";
import Number from "./Number";
import { getTotalAverage } from "@/modules/StatisticsPerMeal";
import NumberFlow from "@number-flow/react";
import { Card } from "./ui/card";

export default function Meal({
    editMode,
    name,
    meal,
    saveMeal
}:{
    editMode: boolean
    name: string;
    meal: MealInterface,
    saveMeal: ((meal: MealInterface) => void)
}) {

    const [covers, setCovers] = useState(meal.covers)
    const [starterPrice, setStarterPrice] = useState(meal.starterPrice)
    const [mainCoursePrice, setMainCoursePrice] = useState(meal.mainCoursePrice)
    const [dessertPrice, setDessertPrice] = useState(meal.dessertPrice)
    const [drinkPrice, setDrinkPrice] = useState(meal.drinkPrice)

    const [average, setAverage] = useState<number>(getTotalAverage({ covers, starterPrice, mainCoursePrice, dessertPrice, drinkPrice }));

    useEffect(() => {
        setAverage(getTotalAverage({ covers, starterPrice, mainCoursePrice, dessertPrice, drinkPrice }))
    }, [covers, mainCoursePrice, drinkPrice]);


    useEffect(() => {
        const newMeal = {
            covers: covers, 
            starterPrice: starterPrice, 
            mainCoursePrice: mainCoursePrice, 
            dessertPrice: dessertPrice,
            drinkPrice: drinkPrice}
        saveMeal(newMeal);
        return () => {};
      }, [covers, starterPrice, mainCoursePrice, dessertPrice, drinkPrice]);

    return (
        <Card className="w-full px-4">
            <div className="w-full"
            onClick={(e)=> e.stopPropagation()}>
                    <div className="text-2xl items-center justify-center gap-2 font-bold flex"> 
                        {name} 
                    </div>
                {editMode ? <div className="flex justify-between gap-2">
                    <Number
                        className="w-full"
                        title={"Covers"}
                        max={1500}
                        min={0}
                        step={1}
                        value={covers} 
                        setValue={setCovers} 
                    />
                    <Number
                    className="w-full"
                        title={"Starters"} 
                        max={1500}
                        min={0}
                        step={1}
                        value={starterPrice} 
                        setValue={setStarterPrice} 
                    />
                    <Number
                    className="w-full"
                        title={"Mains"} 
                        max={1500}
                        min={0}
                        step={1}
                        value={mainCoursePrice} 
                        setValue={setMainCoursePrice} 
                    />
                    <Number
                    className="w-full"
                        title={"Desserts"} 
                        max={1500}
                        min={0}
                        step={1}
                        value={dessertPrice} 
                        setValue={setDessertPrice} 
                    />
                    <Number
                    className="w-full"
                        title={"Drinks"} 
                        max={1500}
                        min={0}
                        step={1}
                        value={drinkPrice} 
                        setValue={setDrinkPrice} 
                    />
                </div>
                : <div className="flex justify-between gap-2">
                    <div className="flex flex-col">
                        <p className="text-xl mt-4"> Covers </p>
                        <NumberFlow value={covers} className="text-xl font-bold" />
                    </div>
                    <div className="flex flex-col">
                        <p className="text-xl mt-4"> Starters </p>
                        <NumberFlow value={starterPrice} className="text-xl font-bold" />
                    </div>
                    <div className="flex flex-col">
                        <p className="text-xl mt-4"> Mains </p>
                        <NumberFlow value={mainCoursePrice} className="text-xl font-bold" />
                    </div>
                    <div className="flex flex-col">
                        <p className="text-xl mt-4"> Desserts </p>
                        <NumberFlow value={dessertPrice} className="text-xl font-bold" />
                    </div>
                    <div className="flex flex-col">
                        <p className="text-xl mt-4"> Drinks </p>
                        <NumberFlow value={drinkPrice} className="text-xl font-bold" />
                    </div>
                </div> }
                <div className="flex flex-col">
                    <p className="text-xl mt-4"> Avg./pers : </p>
                    <NumberFlow value={average} className="text-xl font-bold" />
                </div>
            </div>
        </Card>
    )
}