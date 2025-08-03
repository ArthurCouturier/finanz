import MealInterface from "@/interfaces/MealInterface";
import { useState, useEffect } from "react";
import Number from "./Number";

export default function Meal({
    name,
    meal,
    saveMeal
}:{
    name: string;
    meal: MealInterface,
    saveMeal: ((meal: MealInterface) => void)
}) {

    const [covers, setCovers] = useState(meal.covers)
    const [starters, setStarters] = useState(meal.starterPrice)
    const [mains, setMains] = useState(meal.mainCoursePrice)
    const [desserts, setDesserts] = useState(meal.dessertPrice)
    const [drinks, setDrinks] = useState(meal.drinkPrice)

    useEffect(() => {
        const newMeal = {
            covers: covers, 
            starterPrice: starters, 
            mainCoursePrice: mains, 
            dessertPrice: desserts,
            drinkPrice: drinks}
        saveMeal(newMeal);
        return () => {};
      }, [covers, starters, mains, desserts, drinks]);

    return (
        <div className="w-full"
        onClick={(e)=> e.stopPropagation()}>
            <h2> {name} </h2>
            <div className="flex justify-between gap-2">
                <Number
                    className="w-full"
                    title={"Couverts"}
                    max={1500}
                    min={0}
                    step={1}
                    value={covers} 
                    setValue={setCovers} 
                />
                <Number
                className="w-full"
                    title={"Entrées"} 
                    max={1500}
                    min={0}
                    value={starters} 
                    setValue={setStarters} 
                />
                <Number
                className="w-full"
                    title={"Plats"} 
                    max={1500}
                    min={0}
                    value={mains} 
                    setValue={setMains} 
                />
                <Number
                className="w-full"
                    title={"Desserts"} 
                    max={1500}
                    min={0}
                    value={desserts} 
                    setValue={setDesserts} 
                />
                <Number
                className="w-full"
                    title={"Boissons"} 
                    max={1500}
                    min={0}
                    value={drinks} 
                    setValue={setDrinks} 
                />
            </div>
        </div>
    )
}