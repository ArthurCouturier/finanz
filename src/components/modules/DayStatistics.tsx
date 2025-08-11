import DayInterface from "@/interfaces/DayInterface";
import { Card, CardTitle } from "../ui/card";
import NumberFlow from "@number-flow/react";
import { getTotalLunchOfTheDay, getTotalDrinkOfTheDay, getTotalOfTheDay, getAverageLunchBasketPerDay, getAverageDrinkBasketPerDay, getAverageBasketPerDay } from "@/modules/StatisticsPerDay";
import { getTotalOfTheMeal } from "@/modules/StatisticsPerMeal";

export default function DayStatistics({
    day
}: {
    day: DayInterface
}){

    const totalLunchOfTheDay = getTotalLunchOfTheDay(day);
    const totalDrinkOfTheDay = getTotalDrinkOfTheDay(day);
    const totalOfTheDay = getTotalOfTheDay(day);

    const averageLunchBasketPerWeek = getAverageLunchBasketPerDay(day);
    const averageDrinkBasketPerWeek = getAverageDrinkBasketPerDay(day);
    const averageBasketPerWeek = getAverageBasketPerDay(day);

    const totalOfMidday = getTotalOfTheMeal(day.meals[0]);
    const totalOfEvening = getTotalOfTheMeal(day.meals[1]);
    
    return (
        <div className="flex md:flex-row flex-col gap-6 w-full h-full">
            <Card className="md:w-[70%] h-full p-4">
                <CardTitle className="text-xl font-bold ">
                    Daily revenue 💰
                </CardTitle>
                <div className="flex md:flex-row flex-col justify-center gap-4">
                    <div className="flex flex-col">
                        <p className="text-xl mt-4"> Daily food : </p>
                        <div className="flex items-center justify-center gap-2">
                            <NumberFlow value={totalLunchOfTheDay} className="text-xl font-bold" />
                            <p className="text-xl font-bold">€</p>
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <p className="text-xl mt-4"> Daily drinks : </p>
                        <div className="flex items-center justify-center gap-2">
                            <NumberFlow value={totalDrinkOfTheDay} className="text-xl font-bold" />
                            <p className="text-xl font-bold">€</p>
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <p className="text-xl mt-4"> Daily total : </p>
                        <div className="flex items-center justify-center gap-2">
                            <NumberFlow value={totalOfTheDay} className="text-xl font-bold" />
                            <p className="text-xl font-bold">€</p>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                            <p>(</p>
                            <NumberFlow value={totalOfMidday}  />
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
                <CardTitle className="text-xl font-bold ">
                    Average baskets for the day 🧺
                </CardTitle>
                <div className="flex md:flex-row flex-col justify-center gap-4">
                    <div className="flex flex-col">
                        <p className="text-xl mt-4"> Average daily food per person : </p>
                        <div className="flex items-center justify-center gap-2">
                            <NumberFlow value={parseFloat(averageLunchBasketPerWeek != "NaN" ? averageLunchBasketPerWeek : (0).toFixed(2))} className="text-xl font-bold" />
                            <p className="text-xl font-bold">€/pers.</p>
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <p className="text-xl mt-4"> Average daily drinks per person : </p>
                        <div className="flex items-center justify-center gap-2">
                            <NumberFlow value={parseFloat(averageDrinkBasketPerWeek != "NaN" ? averageDrinkBasketPerWeek : (0).toFixed(2))} className="text-xl font-bold" />
                            <p className="text-xl font-bold">€/pers.</p>
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <p className="text-xl mt-4"> Average daily total per person : </p>
                        <div className="flex items-center justify-center gap-2">
                            <NumberFlow value={parseFloat(averageBasketPerWeek != "NaN" ? averageBasketPerWeek : (0).toFixed(2))} className="text-xl font-bold" />
                            <p className="text-xl font-bold">€/pers.</p>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    )
}